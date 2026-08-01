import { KeeperHubClient } from "@autokeep/keeperhub-client";
import { NETWORK_IDS } from "@autokeep/shared";
import type { NetworkId } from "@autokeep/shared";
import { loadEnvFile, requireEnv, envOr } from "./env.js";
import { getTreasuryBalances, formatBalances } from "./balances.js";
import { syncCommand } from "./sync.js";
import { runCommand } from "./run.js";
import { verifyCommand } from "./verify.js";
import { auditCommand } from "./audit.js";

const COMMANDS = {
  "check-balances": "Show treasury balances on the configured network",
  sync: "Create or update the payroll workflow from strategy config",
  run: "Manually trigger the payroll workflow (usage: run [workflowName])",
  verify: "Verify an execution against strategy intent (usage: verify <executionId>)",
  audit: "List recent executions across AutoKeep workflows",
  help: "Show this help",
} as const;

function printHelp(): void {
  console.log("AutoKeep agent - autonomous treasury operations on KeeperHub\n");
  console.log("Usage: agent <command> [args]\n");
  console.log("Commands:");
  for (const [command, description] of Object.entries(COMMANDS)) {
    console.log(`  ${command.padEnd(16)} ${description}`);
  }
  console.log("\nEnvironment:");
  console.log("  KEEPERHUB_API_KEY  Organization API key (required)");
  console.log("  AUTOKEEP_NETWORK   Chain ID (default 11155111 = Sepolia)");
}

function getNetwork(): NetworkId {
  const raw = envOr("AUTOKEEP_NETWORK", NETWORK_IDS.SEPOLIA);
  const valid = Object.values(NETWORK_IDS) as string[];
  if (!valid.includes(raw)) {
    throw new Error(`AUTOKEEP_NETWORK must be one of ${valid.join(", ")}`);
  }
  return raw as NetworkId;
}

async function main(): Promise<void> {
  loadEnvFile();
  const [command, arg] = process.argv.slice(2);

  if (!command || command === "help" || command === "--help" || command === "-h") {
    printHelp();
    return;
  }

  const client = new KeeperHubClient(requireEnv("KEEPERHUB_API_KEY"));
  const network = getNetwork();

  switch (command) {
    case "check-balances": {
      const balances = await getTreasuryBalances(client, network);
      console.log(formatBalances(balances));
      break;
    }
    case "sync":
      await syncCommand(client, arg);
      break;
    case "run":
      await runCommand(client, arg);
      break;
    case "verify": {
      if (!arg) {
        throw new Error("verify requires an executionId");
      }
      await verifyCommand(client, arg);
      break;
    }
    case "audit":
      await auditCommand(client);
      break;
    default:
      printHelp();
      process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(`[agent] ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
});
