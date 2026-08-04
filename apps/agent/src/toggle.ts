import { KeeperHubClient } from "@autokeep/keeperhub-client";
import { findAutoKeepWorkflows } from "./sync.js";

export async function toggleCommand(
  client: KeeperHubClient,
  enable: boolean,
  workflowName?: string
): Promise<void> {
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

  await client.updateWorkflow(target.id, { enabled: enable });
  console.log(`[toggle] ${enable ? "Enabled" : "Disabled"} ${target.name} (${target.id})`);
  console.log(
    enable
      ? "[toggle] The schedule is live and will fire on cron."
      : "[toggle] The schedule is paused and will not fire."
  );
}
