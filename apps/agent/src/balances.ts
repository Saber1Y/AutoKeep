import { KeeperHubClient } from "@autokeep/keeperhub-client";
import { NETWORK_IDS, USDC_SEPOLIA } from "@autokeep/shared";
import type { NetworkId } from "@autokeep/shared";

const BLOCKSCOUT_BASE: Record<string, string> = {
  [NETWORK_IDS.SEPOLIA]: "https://eth-sepolia.blockscout.com",
  [NETWORK_IDS.ETHEREUM]: "https://eth.blockscout.com",
};

interface BlockscoutAddress {
  coin_balance: string;
  token: { symbol?: string; name?: string; decimals?: string } | null;
  token_balances?: { token: { symbol?: string; decimals?: string }; value?: string }[];
}

export async function getTreasuryBalances(
  client: KeeperHubClient,
  network: NetworkId
): Promise<{
  walletAddress: string;
  network: NetworkId;
  native: { symbol: string; balance: string };
  tokens: { symbol: string; balance: string; raw: string }[];
}> {
  const { walletAddress } = await client.getOrganizationWalletAddress();
  const blockscout = BLOCKSCOUT_BASE[network];
  if (!blockscout) {
    throw new Error(`No balance lookup configured for network ${network}`);
  }

  const response = await fetch(`${blockscout}/api/v2/addresses/${walletAddress}`);
  if (!response.ok) {
    throw new Error(`Blockscout lookup failed: ${response.status}`);
  }
  const data = (await response.json()) as BlockscoutAddress;

  const native = {
    symbol: network === NETWORK_IDS.SEPOLIA ? "ETH" : "ETH",
    balance: (Number(data.coin_balance) / 1e18).toFixed(6),
  };

  const tokens: { symbol: string; balance: string; raw: string }[] = [];
  for (const entry of data.token_balances ?? []) {
    const symbol = entry.token?.symbol ?? "UNKNOWN";
    const decimals = Number(entry.token?.decimals ?? 18);
    const raw = entry.value ?? "0";
    tokens.push({
      symbol,
      balance: (Number(raw) / 10 ** decimals).toFixed(Math.min(decimals, 6)),
      raw,
    });
  }

  const usdcRaw = await getUsdcBalance(client, network, walletAddress);
  if (usdcRaw !== null && !tokens.some((t) => t.symbol === "USDC")) {
    tokens.push({ symbol: "USDC", balance: (Number(usdcRaw) / 1e6).toFixed(2), raw: usdcRaw });
  }

  return { walletAddress, network, native, tokens };
}

async function getUsdcBalance(
  client: KeeperHubClient,
  network: NetworkId,
  walletAddress: string
): Promise<string | null> {
  try {
    const result = await client.executeContractCall({
      chainId: Number(network),
      contractAddress: USDC_SEPOLIA,
      functionName: "balanceOf",
      functionArgs: JSON.stringify([walletAddress]),
    });
    if (typeof result === "object" && result !== null && "result" in result) {
      return String(result.result);
    }
    return null;
  } catch {
    return null;
  }
}

export function formatBalances(balances: Awaited<ReturnType<typeof getTreasuryBalances>>): string {
  const lines = [
    `Treasury: ${balances.walletAddress}`,
    `Network:  ${balances.network}`,
    `Native:   ${balances.native.balance} ${balances.native.symbol}`,
  ];
  for (const token of balances.tokens) {
    lines.push(`Token:    ${token.balance} ${token.symbol}`);
  }
  return lines.join("\n");
}
