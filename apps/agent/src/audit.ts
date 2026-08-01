import { KeeperHubClient } from "@autokeep/keeperhub-client";
import { findAutoKeepWorkflows } from "./sync.js";

export async function auditCommand(client: KeeperHubClient): Promise<void> {
  const workflows = await findAutoKeepWorkflows(client);
  if (workflows.length === 0) {
    console.log("[audit] No AutoKeep workflows found.");
    return;
  }

  for (const workflow of workflows) {
    console.log(`\n${workflow.name} (${workflow.id})`);
    const executions = await client.getWorkflowExecutions(workflow.id);
    if (executions.length === 0) {
      console.log("  no executions yet");
      continue;
    }
    for (const execution of executions.slice(0, 10)) {
      const hashes = execution.transactionHashes ?? [];
      const hashSummary = hashes.length > 0 ? hashes.map((h) => h.hash.slice(0, 10)).join(", ") : "-";
      console.log(
        `  ${execution.executionId}  ${execution.status}  ${hashes.length} tx  [${hashSummary}]  ${execution.completedAt ?? ""}`
      );
    }
  }
}
