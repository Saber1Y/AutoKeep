import { KeeperHubClient } from "@autokeep/keeperhub-client";
import { loadStrategy } from "./config.js";
import { buildPayrollWorkflow, PAYROLL_WORKFLOW_PREFIX } from "./workflows/index.js";

export async function syncCommand(client: KeeperHubClient, strategyPath?: string): Promise<void> {
  const { config } = loadStrategy(strategyPath);

  if (!config.payroll) {
    throw new Error("sync currently requires a payroll strategy");
  }

  const definition = buildPayrollWorkflow(config);
  const existing = await client.listWorkflows();
  const match = existing.find((workflow) => workflow.name === definition.name);

  if (match) {
    await client.updateWorkflow(match.id, {
      name: definition.name,
      description: definition.description,
      nodes: definition.nodes,
      edges: definition.edges,
    });
    console.log(`[sync] Updated payroll workflow ${match.id} (${definition.name})`);
  } else {
    const created = await client.createWorkflow({
      name: definition.name,
      description: definition.description,
      nodes: definition.nodes,
      edges: definition.edges,
    });
    console.log(`[sync] Created payroll workflow ${created.id} (${definition.name})`);
  }

  console.log(
    `[sync] ${config.payroll.salaries.length} transfers, total ${config.payroll.salaries
      .reduce((sum, s) => sum + parseFloat(s.amount), 0)
      .toFixed(2)} USDC, cron "${config.payroll.cron}" (${config.payroll.timezone})`
  );
  console.log("[sync] Workflow is created disabled. Enable it in the KeeperHub canvas when ready.");
}

export async function findAutoKeepWorkflows(
  client: KeeperHubClient
): Promise<{ id: string; name: string }[]> {
  const workflows = await client.listWorkflows();
  return workflows
    .filter((workflow) => workflow.name?.startsWith(PAYROLL_WORKFLOW_PREFIX))
    .map((workflow) => ({ id: workflow.id, name: workflow.name ?? "unnamed" }));
}
