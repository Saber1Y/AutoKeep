import type { StrategyConfig } from "@autokeep/shared";
import type { WorkflowNode, WorkflowEdge } from "@autokeep/keeperhub-client";
import { tokenConfig } from "@autokeep/shared";

export const PAYROLL_WORKFLOW_PREFIX = "autokeep-payroll";

export interface BuildWorkflowResult {
  name: string;
  description: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
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
    nodes,
    edges,
  };
}
