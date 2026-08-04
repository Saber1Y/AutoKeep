export const NETWORK_IDS = {
  ETHEREUM: "1",
  SEPOLIA: "11155111",
  BASE: "8453",
  BASE_SEPOLIA: "84532",
  POLYGON: "137",
  ARBITRUM: "42161",
} as const;

export type NetworkId = (typeof NETWORK_IDS)[keyof typeof NETWORK_IDS];

export const USDC_SEPOLIA = "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238";

export const ETHEREUM = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";

export interface SalaryEntry {
  recipientAddress: string;
  label: string;
  amount: string;
}

export interface PayrollConfig {
  cron: string;
  timezone: string;
  tokenAddress: string;
  salaries: SalaryEntry[];
}

export interface AllocationConfig {
  targets: Record<string, number>;
  rebalanceThreshold: number;
}

export interface StrategyConfig {
  name: string;
  description: string;
  network: NetworkId;
  enabled?: boolean;
  payroll?: PayrollConfig;
  allocation?: AllocationConfig;
}

export function salaryTotal(salaries: SalaryEntry[]): string {
  const total = salaries.reduce((sum, s) => sum + parseFloat(s.amount), 0);
  return total.toFixed(2);
}

export function tokenConfig(address: string, symbol: string): string {
  return JSON.stringify({
    mode: "custom",
    customToken: { address, symbol },
  });
}

export function isAddress(value: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(value);
}

export function formatUsd(value: string | number, decimals = 2): string {
  const n = typeof value === "number" ? value : parseFloat(value);
  return n.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}
