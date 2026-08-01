import { KeeperHubClient } from "@autokeep/keeperhub-client";
import { findAutoKeepWorkflows } from "./sync.js";

export async function runCommand(client: KeeperHubClient, workflowName?: string): Promise<void> {
  const workflows = await findAutoKeepWorkflows(client);
  if (workflows.length === 0) {
    throw new Error("No AutoKeep workflows found. Run `agent sync` first.");
  }
  const target = workflowName
    ? workflows.find((w) => w.name === workflowName)
    : workflows[0];
  if (!target) {
    throw new Error(`No AutoKeep workflow named ${workflowName}`);
  }

  const { executionId, status } = await client.executeWorkflow(target.id, {});
  console.log(`[run] Triggered ${target.name} (${target.id})`);
  console.log(`[run] executionId=${executionId} status=${status}`);

  const result = await client.waitForExecution(executionId, 45000);
  console.log(`[run] Final status: ${result.status}`);
  for (const hash of result.transactionHashes ?? []) {
    console.log(`[run] tx ${hash.hash} (${hash.nodeName ?? "step"})`);
  }
  if (result.error) {
    console.error(`[run] execution error: ${result.error}`);
  }
}
