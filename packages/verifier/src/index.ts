import type { ExecutionLog, ExecutionLogsResponse } from "@autokeep/keeperhub-client";
import type { SalaryEntry } from "@autokeep/shared";

export type VerificationStatus = "verified" | "flagged";

export interface CheckResult {
  id: string;
  label: string;
  passed: boolean;
  detail?: string;
}

export interface VerificationIssue {
  code: string;
  severity: "error" | "warning";
  message: string;
}

export interface VerificationResult {
  executionId: string;
  strategyId: string;
  kind: "payroll" | "rebalance";
  status: VerificationStatus;
  checks: CheckResult[];
  issues: VerificationIssue[];
  verifiedAt: string;
}

export interface PayrollIntent {
  strategyId: string;
  kind: "payroll";
  salaries: SalaryEntry[];
  maxGasUnitsPerTransfer?: number;
}

export interface RebalanceIntent {
  strategyId: string;
  kind: "rebalance";
  expectedSourceToken: string;
  expectedTargetToken: string;
  minSourceAmount: string;
  maxSlippageFraction?: number;
}

export type VerificationIntent = PayrollIntent | RebalanceIntent;

interface TransferLog {
  log: ExecutionLog;
  recipient?: string;
  amount?: string;
  txHash?: string;
  gasUsedUnits?: number;
}

function collectTransfers(logs: ExecutionLog[]): TransferLog[] {
  const transfers: TransferLog[] = [];
  for (const log of logs) {
    if (log.status !== "success") {
      continue;
    }
    if (log.nodeType !== "web3/transfer-token" && log.nodeType !== "web3/transfer-funds") {
      continue;
    }
    const input = log.input as Record<string, unknown>;
    const output = log.output as Record<string, unknown>;
    if (output.success !== true) {
      continue;
    }
    transfers.push({
      log,
      recipient: typeof input.recipientAddress === "string" ? input.recipientAddress.toLowerCase() : undefined,
      amount: typeof input.amount === "string" ? input.amount : undefined,
      txHash: typeof output.transactionHash === "string" ? output.transactionHash : undefined,
      gasUsedUnits: output.gasUsedUnits !== undefined ? Number(output.gasUsedUnits) : undefined,
    });
  }
  return transfers;
}

function normalizeAmount(amount: string): number {
  return parseFloat(amount);
}

export function verifyPayrollExecution(
  executionId: string,
  logs: ExecutionLog[],
  intent: PayrollIntent
): VerificationResult {
  const checks: CheckResult[] = [];
  const issues: VerificationIssue[] = [];
  const expected = intent.salaries;
  const transfers = collectTransfers(logs);

  const expectedMap = new Map<string, SalaryEntry>();
  for (const salary of expected) {
    expectedMap.set(salary.recipientAddress.toLowerCase(), salary);
  }

  const matchedRecipients = new Set<string>();
  const transferCount = transfers.length;

  checks.push({
    id: "transfer-count",
    label: "Transfer count matches payroll roster",
    passed: transferCount === expected.length,
    detail: `${transferCount} transfers executed, ${expected.length} expected`,
  });
  if (transferCount !== expected.length) {
    issues.push({
      code: "COUNT_MISMATCH",
      severity: "error",
      message: `Executed ${transferCount} transfers but payroll roster has ${expected.length}`,
    });
  }

  for (const transfer of transfers) {
    const expectedSalary = transfer.recipient ? expectedMap.get(transfer.recipient) : undefined;

    const recipientCheck: CheckResult = {
      id: `recipient-${transfer.log.nodeId}`,
      label: `Recipient matches roster (${transfer.log.nodeName})`,
      passed: transfer.recipient !== undefined && expectedSalary !== undefined,
      detail: transfer.recipient ?? "missing recipient",
    };
    checks.push(recipientCheck);
    if (!recipientCheck.passed) {
      issues.push({
        code: "UNEXPECTED_RECIPIENT",
        severity: "error",
        message: `Transfer to ${transfer.recipient ?? "unknown"} has no matching payroll entry`,
      });
    }

    if (transfer.recipient) {
      matchedRecipients.add(transfer.recipient);
    }

    const amountMatches =
      transfer.amount !== undefined &&
      expectedSalary !== undefined &&
      Math.abs(normalizeAmount(transfer.amount) - normalizeAmount(expectedSalary.amount)) < 1e-9;

    checks.push({
      id: `amount-${transfer.log.nodeId}`,
      label: `Amount matches roster (${transfer.log.nodeName})`,
      passed: amountMatches,
      detail: `${transfer.amount ?? "missing"} vs expected ${expectedSalary?.amount ?? "unknown"}`,
    });
    if (!amountMatches) {
      issues.push({
        code: "AMOUNT_MISMATCH",
        severity: "error",
        message: `Paid ${transfer.amount ?? "unknown"} to ${transfer.recipient ?? "unknown"}, expected ${expectedSalary?.amount ?? "unknown"}`,
      });
    }

    const hasHash = transfer.txHash !== undefined && /^0x[a-fA-F0-9]{64}$/.test(transfer.txHash);
    checks.push({
      id: `tx-hash-${transfer.log.nodeId}`,
      label: `Transaction confirmed onchain (${transfer.log.nodeName})`,
      passed: hasHash,
      detail: transfer.txHash ?? "no transaction hash",
    });
    if (!hasHash) {
      issues.push({
        code: "MISSING_TX_HASH",
        severity: "error",
        message: `Transfer ${transfer.log.nodeName} has no onchain transaction hash`,
      });
    }

    const maxGas = intent.maxGasUnitsPerTransfer ?? 300_000;
    const gasOk = transfer.gasUsedUnits === undefined || transfer.gasUsedUnits <= maxGas;
    checks.push({
      id: `gas-${transfer.log.nodeId}`,
      label: `Gas within bounds (${transfer.log.nodeName})`,
      passed: gasOk,
      detail: `${transfer.gasUsedUnits ?? "unknown"} units, max ${maxGas}`,
    });
    if (!gasOk) {
      issues.push({
        code: "GAS_OVER_BOUND",
        severity: "warning",
        message: `Transfer ${transfer.log.nodeName} used ${transfer.gasUsedUnits} gas units, over bound of ${maxGas}`,
      });
    }
  }

  const allRosterPaid = expected.every((salary) => matchedRecipients.has(salary.recipientAddress.toLowerCase()));
  checks.push({
    id: "all-roster-paid",
    label: "Every roster member paid",
    passed: allRosterPaid,
  });
  if (!allRosterPaid) {
    issues.push({
      code: "ROSTER_MEMBER_MISSED",
      severity: "error",
      message: "One or more roster members were not paid",
    });
  }

  const errored = logs.filter((log) => log.status === "error");
  checks.push({
    id: "no-step-errors",
    label: "No failed steps in execution",
    passed: errored.length === 0,
    detail: errored.length > 0 ? `${errored.length} step(s) failed: ${errored.map((e) => e.nodeName).join(", ")}` : undefined,
  });
  if (errored.length > 0) {
    issues.push({
      code: "STEP_ERROR",
      severity: "error",
      message: errored[0]?.error ?? "Workflow step failed",
    });
  }

  const status: VerificationStatus = issues.some((issue) => issue.severity === "error") ? "flagged" : "verified";
  return {
    executionId,
    strategyId: intent.strategyId,
    kind: "payroll",
    status,
    checks,
    issues,
    verifiedAt: new Date().toISOString(),
  };
}

export function verifyRebalanceExecution(
  executionId: string,
  logs: ExecutionLog[],
  intent: RebalanceIntent
): VerificationResult {
  const checks: CheckResult[] = [];
  const issues: VerificationIssue[] = [];
  const writeSteps = logs.filter(
    (log) =>
      log.status === "success" &&
      (log.nodeType === "web3/write-contract" ||
        log.nodeType === "web3/transfer-token" ||
        log.nodeType === "web3/transfer-funds" ||
        log.nodeType.startsWith("uniswap/") ||
        log.nodeType.startsWith("cowswap/") ||
        log.nodeType.startsWith("aerodrome/"))
  );

  checks.push({
    id: "rebalance-write",
    label: "Rebalance write step succeeded",
    passed: writeSteps.length > 0,
    detail: writeSteps.length > 0 ? writeSteps.map((s) => s.nodeName).join(", ") : "no write steps found",
  });
  if (writeSteps.length === 0) {
    issues.push({
      code: "NO_REBALANCE_WRITE",
      severity: "error",
      message: "No rebalance write step executed",
    });
  }

  const anyTxHash = writeSteps.some((step) => {
    const output = step.output as Record<string, unknown>;
    return typeof output.transactionHash === "string" && /^0x[a-fA-F0-9]{64}$/.test(output.transactionHash);
  });
  checks.push({
    id: "rebalance-confirmed",
    label: "Rebalance transaction confirmed onchain",
    passed: anyTxHash,
    detail: anyTxHash ? "transaction hash present" : "no onchain transaction hash",
  });
  if (!anyTxHash) {
    issues.push({
      code: "REBALANCE_UNCONFIRMED",
      severity: "error",
      message: "Rebalance write has no onchain transaction hash",
    });
  }

  const errored = logs.filter((log) => log.status === "error");
  checks.push({
    id: "no-step-errors",
    label: "No failed steps in execution",
    passed: errored.length === 0,
  });
  if (errored.length > 0) {
    issues.push({
      code: "STEP_ERROR",
      severity: "error",
      message: errored[0]?.error ?? "Workflow step failed",
    });
  }

  const status: VerificationStatus = issues.some((issue) => issue.severity === "error") ? "flagged" : "verified";
  return {
    executionId,
    strategyId: intent.strategyId,
    kind: "rebalance",
    status,
    checks,
    issues,
    verifiedAt: new Date().toISOString(),
  };
}

export function verifyExecution(
  execution: ExecutionLogsResponse,
  intent: VerificationIntent
): VerificationResult {
  if (intent.kind === "payroll") {
    return verifyPayrollExecution(execution.execution.id, execution.logs, intent);
  }
  return verifyRebalanceExecution(execution.execution.id, execution.logs, intent);
}

export function summarize(result: VerificationResult): string {
  const passed = result.checks.filter((c) => c.passed).length;
  const errors = result.issues.filter((i) => i.severity === "error").length;
  const warnings = result.issues.filter((i) => i.severity === "warning").length;
  const parts = [`${result.status.toUpperCase()}`, `${passed}/${result.checks.length} checks passed`];
  if (errors > 0) parts.push(`${errors} errors`);
  if (warnings > 0) parts.push(`${warnings} warnings`);
  return parts.join(" - ");
}
