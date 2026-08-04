"use server";

import { revalidatePath } from "next/cache";
import {
  buildPayrollWorkflow,
  PAYROLL_WORKFLOW_PREFIX,
  validateStrategy,
} from "@autokeep/strategy";
import { USDC_SEPOLIA } from "@autokeep/shared";
import type { SalaryEntry } from "@autokeep/shared";
import { summarize, verifyExecution } from "@autokeep/verifier";
import type { VerificationIntent } from "@autokeep/verifier";
import type { KeeperHubClient, WorkflowDefinition } from "@autokeep/keeperhub-client";
import { getKeeperHubClient } from "./keeperhub";
import { getNetworkId } from "./data";

export type ActionResult = { ok: true; message: string } | { ok: false; message: string };

export interface SalaryDraft {
  label: string;
  recipientAddress: string;
  amount: string;
}

export interface StrategyDraft {
  name: string;
  cron: string;
  timezone: string;
  salaries: SalaryDraft[];
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

async function findAutoKeepWorkflow(
  client: KeeperHubClient
): Promise<WorkflowDefinition | null> {
  const workflows = await client.listWorkflows();
  return workflows.find((workflow) => workflow.name?.startsWith(PAYROLL_WORKFLOW_PREFIX)) ?? null;
}

function rosterFromWorkflow(workflow: WorkflowDefinition): SalaryEntry[] {
  const nodes = workflow.nodes ?? [];
  const transfers = nodes.filter(
    (node) =>
      node.type === "action" &&
      String(node.data?.config?.actionType ?? "").includes("transfer")
  );
  return transfers.map((node) => ({
    recipientAddress: String(node.data?.config?.recipientAddress ?? ""),
    label: node.data?.label ?? node.id,
    amount: String(node.data?.config?.amount ?? "0"),
  }));
}

export async function deployStrategy(input: StrategyDraft): Promise<ActionResult> {
  try {
    const strategy = validateStrategy({
      name: input.name.trim(),
      description: "Payroll configured in the AutoKeep ops console",
      network: getNetworkId(),
      enabled: false,
      payroll: {
        cron: input.cron.trim(),
        timezone: input.timezone.trim(),
        tokenAddress: USDC_SEPOLIA,
        salaries: input.salaries.map((salary) => ({
          label: salary.label.trim(),
          recipientAddress: salary.recipientAddress.trim(),
          amount: String(salary.amount).trim(),
        })),
      },
    });

    const definition = buildPayrollWorkflow(strategy);
    const client = getKeeperHubClient();
    const existing = await client.listWorkflows();
    const match = existing.find((workflow) => workflow.name === definition.name);

    if (match) {
      await client.updateWorkflow(match.id, {
        name: definition.name,
        description: definition.description,
        nodes: definition.nodes,
        edges: definition.edges,
        enabled: definition.enabled,
      });
    } else {
      await client.createWorkflow({
        name: definition.name,
        description: definition.description,
        nodes: definition.nodes,
        edges: definition.edges,
        enabled: definition.enabled,
      });
    }

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/strategy");
    revalidatePath("/dashboard/audit");
    return {
      ok: true,
      message: `Deployed ${definition.name}. The schedule starts paused - enable it to go live.`,
    };
  } catch (error) {
    return { ok: false, message: errorMessage(error) };
  }
}

export async function setWorkflowEnabled(enabled: boolean): Promise<ActionResult> {
  try {
    const client = getKeeperHubClient();
    const workflow = await findAutoKeepWorkflow(client);
    if (!workflow) {
      return { ok: false, message: "No AutoKeep workflow deployed yet. Deploy a strategy first." };
    }
    await client.updateWorkflow(workflow.id, { enabled });
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/strategy");
    return {
      ok: true,
      message: enabled
        ? `${workflow.name} is live - the schedule will fire on cron.`
        : `${workflow.name} is paused.`,
    };
  } catch (error) {
    return { ok: false, message: errorMessage(error) };
  }
}

export async function runWorkflow(): Promise<ActionResult> {
  try {
    const client = getKeeperHubClient();
    const workflow = await findAutoKeepWorkflow(client);
    if (!workflow) {
      return { ok: false, message: "No AutoKeep workflow deployed yet. Deploy a strategy first." };
    }
    const { executionId } = await client.executeWorkflow(workflow.id, {});
    const result = await client.waitForExecution(executionId, 45000);
    const hashes = result.transactionHashes ?? [];
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/audit");
    const hashSummary = hashes.length > 0 ? ` ${hashes.length} tx [${hashes.map((h) => h.hash.slice(0, 10)).join(", ")}]` : "";
    return {
      ok: true,
      message: `Run ${executionId} finished with status "${result.status}".${hashSummary}${result.error ? ` Error: ${result.error}` : ""}`,
    };
  } catch (error) {
    return { ok: false, message: errorMessage(error) };
  }
}

export async function verifyLastExecution(): Promise<ActionResult> {
  try {
    const client = getKeeperHubClient();
    const workflow = await findAutoKeepWorkflow(client);
    if (!workflow) {
      return { ok: false, message: "No AutoKeep workflow deployed yet." };
    }
    const executions = await client.getWorkflowExecutions(workflow.id);
    if (executions.length === 0) {
      return { ok: false, message: "No executions recorded yet. Run the workflow first." };
    }
    const latest = [...executions].sort((a, b) =>
      (b.completedAt ?? b.startedAt ?? "").localeCompare(a.completedAt ?? a.startedAt ?? "")
    )[0];
    if (!latest) {
      return { ok: false, message: "No executions recorded yet. Run the workflow first." };
    }
    const { logs } = await client.getExecutionLogs(latest.executionId);
    const intent: VerificationIntent = {
      strategyId: workflow.name ?? "strategy",
      kind: "payroll",
      salaries: rosterFromWorkflow(workflow),
    };
    const result = verifyExecution(
      {
        execution: { id: latest.executionId, workflowId: workflow.id, status: latest.status },
        logs,
      },
      intent
    );
    return { ok: true, message: `${latest.executionId}: ${summarize(result)}` };
  } catch (error) {
    return { ok: false, message: errorMessage(error) };
  }
}
