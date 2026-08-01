import { KeeperHubClient } from "@autokeep/keeperhub-client";
import { loadStrategy } from "./config.js";
import { verifyExecution, summarize } from "@autokeep/verifier";
import type { VerificationIntent } from "@autokeep/verifier";

export async function verifyCommand(
  client: KeeperHubClient,
  executionId: string,
  strategyPath?: string
): Promise<void> {
  const { config } = loadStrategy(strategyPath);
  const logs = await client.getExecutionLogs(executionId);

  if (!config.payroll) {
    throw new Error("verify currently requires a payroll strategy");
  }

  const intent: VerificationIntent = {
    strategyId: config.name,
    kind: "payroll",
    salaries: config.payroll.salaries,
  };

  const result = verifyExecution(logs, intent);
  console.log(`[verify] ${executionId}: ${summarize(result)}`);
  for (const check of result.checks) {
    console.log(`  ${check.passed ? "PASS" : "FAIL"}  ${check.label}${check.detail ? ` (${check.detail})` : ""}`);
  }
  for (const issue of result.issues) {
    console.log(`  ${issue.severity.toUpperCase()}  ${issue.code}: ${issue.message}`);
  }
}
