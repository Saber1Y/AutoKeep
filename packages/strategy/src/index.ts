import type { StrategyConfig, NetworkId } from "@autokeep/shared";
import { isAddress, NETWORK_IDS, tokenConfig } from "@autokeep/shared";
import type { WorkflowEdge, WorkflowNode } from "@autokeep/keeperhub-client";

export const PAYROLL_WORKFLOW_PREFIX = "autokeep-payroll";

export interface BuildWorkflowResult {
  name: string;
  description: string;
  enabled: boolean;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
}

export function validateStrategy(input: unknown): StrategyConfig {
  if (typeof input !== "object" || input === null) {
    throw new Error("Strategy config must be an object");
  }
  const raw = input as Record<string, unknown>;

  if (typeof raw.name !== "string" || raw.name.length === 0) {
    throw new Error("Strategy config requires a non-empty name");
  }
  if (typeof raw.network !== "string" || !(Object.values(NETWORK_IDS) as string[]).includes(raw.network)) {
    throw new Error(`Strategy network must be one of ${Object.values(NETWORK_IDS).join(", ")}`);
  }
  if (raw.enabled !== undefined && typeof raw.enabled !== "boolean") {
    throw new Error("Strategy enabled must be a boolean");
  }

  const config: StrategyConfig = {
    name: raw.name,
    description: typeof raw.description === "string" ? raw.description : "",
    network: raw.network as NetworkId,
    enabled: raw.enabled === true,
  };

  if (raw.payroll !== undefined) {
    config.payroll = validatePayroll(raw.payroll);
  }
  if (raw.allocation !== undefined) {
    config.allocation = validateAllocation(raw.allocation);
  }

  if (config.payroll === undefined && config.allocation === undefined) {
    throw new Error("Strategy config must define at least one of payroll or allocation");
  }

  return config;
}

function validatePayroll(raw: unknown): NonNullable<StrategyConfig["payroll"]> {
  if (typeof raw !== "object" || raw === null) {
    throw new Error("payroll must be an object");
  }
  const p = raw as Record<string, unknown>;

  if (typeof p.cron !== "string" || p.cron.length === 0) {
    throw new Error("payroll.cron must be a cron expression");
  }
  if (typeof p.timezone !== "string" || p.timezone.length === 0) {
    throw new Error("payroll.timezone is required");
  }
  if (typeof p.tokenAddress !== "string" || !isAddress(p.tokenAddress)) {
    throw new Error(`payroll.tokenAddress must be a valid address, got ${String(p.tokenAddress)}`);
  }
  if (!Array.isArray(p.salaries) || p.salaries.length === 0) {
    throw new Error("payroll.salaries must be a non-empty array");
  }

  const salaries = p.salaries.map((entry, index) => {
    if (typeof entry !== "object" || entry === null) {
      throw new Error(`payroll.salaries[${index}] must be an object`);
    }
    const s = entry as Record<string, unknown>;
    if (typeof s.recipientAddress !== "string" || !isAddress(s.recipientAddress)) {
      throw new Error(`payroll.salaries[${index}].recipientAddress must be a valid address`);
    }
    const amount = typeof s.amount === "number" ? String(s.amount) : s.amount;
    if (typeof amount !== "string" || !/^\d+(\.\d+)?$/.test(amount) || parseFloat(amount) <= 0) {
      throw new Error(`payroll.salaries[${index}].amount must be a positive decimal number`);
    }
    return {
      recipientAddress: s.recipientAddress,
      label: typeof s.label === "string" && s.label.length > 0 ? s.label : `Recipient ${index + 1}`,
      amount,
    };
  });

  return {
    cron: p.cron,
    timezone: p.timezone,
    tokenAddress: p.tokenAddress,
    salaries,
  };
}

function validateAllocation(raw: unknown): NonNullable<StrategyConfig["allocation"]> {
  if (typeof raw !== "object" || raw === null) {
    throw new Error("allocation must be an object");
  }
  const a = raw as Record<string, unknown>;
  if (typeof a.targets !== "object" || a.targets === null) {
    throw new Error("allocation.targets must be an object");
  }
  const rawTargets = a.targets as Record<string, unknown>;
  const targets: Record<string, number> = {};
  for (const [asset, fraction] of Object.entries(rawTargets)) {
    if (typeof fraction !== "number" || fraction < 0 || fraction > 1) {
      throw new Error(`allocation.targets.${asset} must be a fraction between 0 and 1`);
    }
    targets[asset] = fraction;
  }
  const threshold = typeof a.rebalanceThreshold === "number" ? a.rebalanceThreshold : 0.05;
  if (threshold <= 0 || threshold >= 1) {
    throw new Error("allocation.rebalanceThreshold must be between 0 and 1");
  }
  return { targets, rebalanceThreshold: threshold };
}

export function buildPayrollWorkflow(strategy: StrategyConfig): BuildWorkflowResult {
  const payroll = strategy.payroll;
  if (!payroll) {
    throw new Error("Strategy has no payroll configuration");
  }
  const network = strategy.network;

  const triggerNode: WorkflowNode = {
    id: "schedule-trigger",
    type: "trigger",
    data: {
      label: "Payroll Schedule",
      description: `Fires ${payroll.cron} (${payroll.timezone})`,
      config: {
        triggerType: "Schedule",
        scheduleCron: payroll.cron,
        scheduleTimezone: payroll.timezone,
      },
    },
  };

  const nodes: WorkflowNode[] = [triggerNode];
  const edges: WorkflowEdge[] = [];

  let previous = triggerNode.id;
  payroll.salaries.forEach((salary, index) => {
    const nodeId = `transfer-${index}`;
    nodes.push({
      id: nodeId,
      type: "action",
      data: {
        label: `Pay ${salary.label}`,
        description: `Transfer ${salary.amount} USDC to ${salary.recipientAddress}`,
        config: {
          actionType: "web3/transfer-token",
          network,
          recipientAddress: salary.recipientAddress,
          amount: salary.amount,
          tokenConfig: tokenConfig(payroll.tokenAddress, "USDC"),
        },
      },
    });
    edges.push({
      id: `${previous}->${nodeId}`,
      source: previous,
      target: nodeId,
    });
    previous = nodeId;
  });

  const total = payroll.salaries.reduce((sum, s) => sum + parseFloat(s.amount), 0);

  return {
    name: `${PAYROLL_WORKFLOW_PREFIX}-${strategy.name}`,
    description: `AutoKeep payroll for "${strategy.name}": ${payroll.salaries.length} salaries totalling ${total.toFixed(2)} USDC on network ${network} (token ${payroll.tokenAddress})`,
    enabled: strategy.enabled === true,
    nodes,
    edges,
  };
}
