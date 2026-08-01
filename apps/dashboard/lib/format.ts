import { NETWORK_IDS } from "@autokeep/shared";

export function shortHash(value: string, head = 6, tail = 4): string {
  if (value.length <= head + tail + 1) {
    return value;
  }
  return `${value.slice(0, head)}\u2026${value.slice(-tail)}`;
}

export function shortAddress(value: string): string {
  if (!value) {
    return "";
  }
  return shortHash(value, 6, 4);
}

export function explorerTxUrl(network: string | number | undefined, hash: string): string | null {
  const map: Record<string, string> = {
    [NETWORK_IDS.ETHEREUM]: "https://etherscan.io/tx",
    [NETWORK_IDS.SEPOLIA]: "https://sepolia.etherscan.io/tx",
    [NETWORK_IDS.BASE]: "https://basescan.org/tx",
    [NETWORK_IDS.BASE_SEPOLIA]: "https://sepolia.basescan.org/tx",
    [NETWORK_IDS.POLYGON]: "https://polygonscan.com/tx",
    [NETWORK_IDS.ARBITRUM]: "https://arbiscan.io/tx",
  };
  const base = map[String(network ?? "")];
  if (!base) {
    return null;
  }
  return `${base}/${hash}`;
}

export function formatTime(iso: string | null | undefined): string {
  if (!iso) {
    return "\u2014";
  }
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return "\u2014";
  }
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatUsd(value: string | number): string {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) {
    return "\u2014";
  }
  return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
