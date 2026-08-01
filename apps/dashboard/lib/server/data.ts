import type {
  ExecutionStatus,
  ExecutionTxHash,
  KeeperHubClient,
  WorkflowDefinition,
} from "@autokeep/keeperhub-client";
import { NETWORK_IDS, USDC_SEPOLIA } from "@autokeep/shared";
import { getKeeperHubClient } from "./keeperhub";

const NETWORK_LABELS: Record<string, string> = {
  [NETWORK_IDS.ETHEREUM]: "Ethereum",
  [NETWORK_IDS.SEPOLIA]: "Ethereum Sepolia",
  [NETWORK_IDS.BASE]: "Base",
  [NETWORK_IDS.BASE_SEPOLIA]: "Base Sepolia",
  [NETWORK_IDS.POLYGON]: "Polygon",
  [NETWORK_IDS.ARBITRUM]: "Arbitrum",
};

const BLOCKSCOUT_BASE: Record<string, string> = {
  [NETWORK_IDS.ETHEREUM]: "https://eth.blockscout.com",
  [NETWORK_IDS.SEPOLIA]: "https://eth-sepolia.blockscout.com",
};

export const AUTOKEEP_PREFIX = "autokeep-";

export interface BalanceEntry {
  symbol: string;
  balance: string;
  raw: string;
}

export interface ScheduleInfo {
  cron: string;
  timezone: string;
}

export interface RosterEntry {
  nodeId: string;
  label: string;
  recipientAddress: string;
  amount: string;
}

export interface DashboardWorkflow {
  id: string;
  name: string;
  description: string | null;
  enabled: boolean;
  chain: string | null;
  updatedAt: string | null;
  schedule: ScheduleInfo | null;
  actionCount: number;
  transferCount: number;
  roster: RosterEntry[];
}

export interface DashboardExecution {
  executionId: string;
  workflowId: string;
  workflowName: string;
  status: string;
  completed: boolean;
  startedAt: string | null;
  completedAt: string | null;
  transactionHashes: ExecutionTxHash[];
  gasUsedWei: string | null;
  error: string | null;
}

export interface DashboardSnapshot {
  walletAddress: string;
  networkId: string;
  networkLabel: string;
  nativeBalance: BalanceEntry | null;
  usdcBalance: BalanceEntry | null;
  workflows: DashboardWorkflow[];
  executions: DashboardExecution[];
}

export function getNetworkId(): string {
  return process.env.AUTOKEEP_NETWORK ?? NETWORK_IDS.SEPOLIA;
}

export function getNetworkLabel(): string {
  return NETWORK_LABELS[getNetworkId()] ?? `Chain ${getNetworkId()}`;
}

async function fetchNativeBalance(walletAddress: string): Promise<BalanceEntry | null> {
  const base = BLOCKSCOUT_BASE[getNetworkId()];
  if (!base) {
    return null;
  }
  try {
    const response = await fetch(`${base}/api/v2/addresses/${walletAddress}`);
    if (!response.ok) {
      return null;
    }
    const data = (await response.json()) as { coin_balance?: string };
    const raw = data.coin_balance ?? "0";
    return { symbol: "ETH", balance: (Number(raw) / 1e18).toFixed(6), raw };
  } catch {
    return null;
  }
}

async function fetchUsdcBalance(client: KeeperHubClient, walletAddress: string): Promise<BalanceEntry | null> {
  try {
    const result = await client.executeContractCall({
      chainId: Number(getNetworkId()),
      contractAddress: USDC_SEPOLIA,
      functionName: "balanceOf",
      functionArgs: JSON.stringify([walletAddress]),
    });
    if (typeof result === "object" && result !== null && "result" in result) {
      const raw = String(result.result);
      return { symbol: "USDC", balance: (Number(raw) / 1e6).toFixed(2), raw };
    }
    return null;
  } catch {
    return null;
  }
}

function parseWorkflow(workflow: WorkflowDefinition): DashboardWorkflow {
  const nodes = workflow.nodes ?? [];
  const trigger = nodes.find((node) => node.type === "trigger");
  const triggerConfig = trigger?.data?.config as Record<string, unknown> | undefined;
  const schedule =
    triggerConfig && triggerConfig.triggerType === "Schedule"
      ? {
          cron: String(triggerConfig.scheduleCron ?? ""),
          timezone: String(triggerConfig.scheduleTimezone ?? "UTC"),
        }
      : null;

  const actions = nodes.filter((node) => node.type === "action");
  const transferNodes = actions.filter((node) =>
    String(node.data?.config?.actionType ?? "").includes("transfer")
  );

  return {
    id: workflow.id,
    name: workflow.name ?? "unnamed",
    description: workflow.description ?? null,
    enabled: workflow.enabled ?? false,
    chain: workflow.chain ?? null,
    updatedAt: workflow.updatedAt ?? null,
    schedule,
    actionCount: actions.length,
    transferCount: transferNodes.length,
    roster: transferNodes.map((node) => ({
      nodeId: node.id,
      label: node.data?.label ?? node.id,
      recipientAddress: String(node.data?.config?.recipientAddress ?? ""),
      amount: String(node.data?.config?.amount ?? ""),
    })),
  };
}

async function fetchWorkflows(client: KeeperHubClient): Promise<DashboardWorkflow[]> {
  const workflows = await client.listWorkflows();
  return workflows
    .filter((workflow) => workflow.name?.startsWith(AUTOKEEP_PREFIX))
    .map(parseWorkflow);
}

function toDashboardExecution(
  workflow: DashboardWorkflow,
  execution: ExecutionStatus
): DashboardExecution {
  return {
    executionId: execution.executionId,
    workflowId: workflow.id,
    workflowName: workflow.name,
    status: execution.status,
    completed: execution.completed,
    startedAt: execution.startedAt ?? null,
    completedAt: execution.completedAt ?? null,
    transactionHashes: execution.transactionHashes ?? [],
    gasUsedWei: execution.gasUsedWei ?? null,
    error: execution.error ?? null,
  };
}

async function fetchExecutions(
  client: KeeperHubClient,
  workflow: DashboardWorkflow
): Promise<DashboardExecution[]> {
  try {
    const executions = await client.getWorkflowExecutions(workflow.id);
    const recent = executions.slice(0, 6);
    const enriched = await Promise.all(
      recent.map(async (execution) => {
        const logHashes = await extractTxHashesFromLogs(client, execution.executionId);
        return { ...execution, transactionHashes: mergeTxHashes(execution.transactionHashes ?? [], logHashes) };
      })
    );
    return enriched.map((execution) => toDashboardExecution(workflow, execution));
  } catch {
    return [];
  }
}

async function extractTxHashesFromLogs(
  client: KeeperHubClient,
  executionId: string
): Promise<ExecutionTxHash[]> {
  try {
    const { logs } = await client.getExecutionLogs(executionId);
    const hashes: ExecutionTxHash[] = [];
    for (const log of logs) {
      const output = log.output as Record<string, unknown>;
      if (
        typeof output.transactionHash === "string" &&
        /^0x[a-fA-F0-9]{64}$/.test(output.transactionHash)
      ) {
        hashes.push({
          hash: output.transactionHash,
          nodeId: log.nodeId,
          nodeName: log.nodeName,
          chainId: Number(getNetworkId()),
        });
      }
    }
    return hashes;
  } catch {
    return [];
  }
}

function mergeTxHashes(existing: ExecutionTxHash[], fromLogs: ExecutionTxHash[]): ExecutionTxHash[] {
  const merged = [...existing];
  const seen = new Set(existing.map((hash) => hash.hash));
  for (const hash of fromLogs) {
    if (!seen.has(hash.hash)) {
      merged.push(hash);
      seen.add(hash.hash);
    }
  }
  return merged;
}

export async function getDashboardSnapshot(): Promise<DashboardSnapshot> {
  const client = getKeeperHubClient();
  const { walletAddress } = await client.getOrganizationWalletAddress();

  const [nativeBalance, usdcBalance, workflows] = await Promise.all([
    fetchNativeBalance(walletAddress),
    fetchUsdcBalance(client, walletAddress),
    fetchWorkflows(client),
  ]);

  const executions = (
    await Promise.all(workflows.map((workflow) => fetchExecutions(client, workflow)))
  ).flat();

  executions.sort((a, b) =>
    (b.completedAt ?? b.startedAt ?? "").localeCompare(a.completedAt ?? a.startedAt ?? "")
  );

  return {
    walletAddress,
    networkId: getNetworkId(),
    networkLabel: getNetworkLabel(),
    nativeBalance,
    usdcBalance,
    workflows,
    executions,
  };
}
