import { test } from "node:test";
import assert from "node:assert/strict";
import { verifyPayrollExecution, verifyRebalanceExecution } from "./index.js";
import type { ExecutionLog } from "@autokeep/keeperhub-client";

function makeLog(partial: Partial<ExecutionLog>): ExecutionLog {
  return {
    id: partial.id ?? "log_1",
    executionId: partial.executionId ?? "exec_1",
    nodeId: partial.nodeId ?? "transfer-1",
    nodeName: partial.nodeName ?? "Transfer",
    nodeType: partial.nodeType ?? "web3/transfer-token",
    status: partial.status ?? "success",
    input: partial.input ?? {},
    output: partial.output ?? { success: true },
    error: partial.error ?? null,
    duration: partial.duration ?? "1000",
    startedAt: partial.startedAt ?? "2026-08-01T00:00:00Z",
    completedAt: partial.completedAt ?? "2026-08-01T00:00:01Z",
    iterationIndex: partial.iterationIndex ?? null,
    forEachNodeId: partial.forEachNodeId ?? null,
  };
}

const ROSTER = [
  { recipientAddress: "0x1111111111111111111111111111111111111111", label: "Alice", amount: "1000" },
  { recipientAddress: "0x2222222222222222222222222222222222222222", label: "Bob", amount: "750" },
  { recipientAddress: "0x3333333333333333333333333333333333333333", label: "Carol", amount: "500" },
];

const HASH = "0x" + "ab".repeat(32);

test("payroll verifier passes when execution matches intent", () => {
  const logs = ROSTER.map((salary, i) =>
    makeLog({
      nodeId: `transfer-${i}`,
      nodeName: `Pay ${salary.label}`,
      input: { recipientAddress: salary.recipientAddress, amount: salary.amount },
      output: { success: true, transactionHash: HASH, gasUsedUnits: "52000" },
    })
  );

  const result = verifyPayrollExecution("exec_1", logs, {
    strategyId: "strategy_1",
    kind: "payroll",
    salaries: ROSTER,
  });

  assert.equal(result.status, "verified");
  assert.equal(result.checks.filter((c) => !c.passed).length, 0);
  assert.equal(result.issues.length, 0);
});

test("payroll verifier flags wrong amount", () => {
  const logs = ROSTER.map((salary, i) =>
    makeLog({
      nodeId: `transfer-${i}`,
      input: { recipientAddress: salary.recipientAddress, amount: i === 0 ? "9999" : salary.amount },
      output: { success: true, transactionHash: HASH, gasUsedUnits: "52000" },
    })
  );

  const result = verifyPayrollExecution("exec_1", logs, {
    strategyId: "strategy_1",
    kind: "payroll",
    salaries: ROSTER,
  });

  assert.equal(result.status, "flagged");
  assert.ok(result.issues.some((i) => i.code === "AMOUNT_MISMATCH"));
});

test("payroll verifier flags missing tx hash", () => {
  const logs = ROSTER.map((salary, i) =>
    makeLog({
      nodeId: `transfer-${i}`,
      input: { recipientAddress: salary.recipientAddress, amount: salary.amount },
      output: { success: true },
    })
  );

  const result = verifyPayrollExecution("exec_1", logs, {
    strategyId: "strategy_1",
    kind: "payroll",
    salaries: ROSTER,
  });

  assert.equal(result.status, "flagged");
  assert.ok(result.issues.some((i) => i.code === "MISSING_TX_HASH"));
});

test("payroll verifier flags unexpected recipient", () => {
  const logs = ROSTER.map((salary, i) =>
    makeLog({
      nodeId: `transfer-${i}`,
      input: {
        recipientAddress: i === 1 ? "0x9999999999999999999999999999999999999999" : salary.recipientAddress,
        amount: salary.amount,
      },
      output: { success: true, transactionHash: HASH, gasUsedUnits: "52000" },
    })
  );

  const result = verifyPayrollExecution("exec_1", logs, {
    strategyId: "strategy_1",
    kind: "payroll",
    salaries: ROSTER,
  });

  assert.equal(result.status, "flagged");
  assert.ok(result.issues.some((i) => i.code === "UNEXPECTED_RECIPIENT"));
});

test("payroll verifier flags missed roster member", () => {
  const logs = ROSTER.slice(0, 2).map((salary, i) =>
    makeLog({
      nodeId: `transfer-${i}`,
      input: { recipientAddress: salary.recipientAddress, amount: salary.amount },
      output: { success: true, transactionHash: HASH, gasUsedUnits: "52000" },
    })
  );

  const result = verifyPayrollExecution("exec_1", logs, {
    strategyId: "strategy_1",
    kind: "payroll",
    salaries: ROSTER,
  });

  assert.equal(result.status, "flagged");
  assert.ok(result.issues.some((i) => i.code === "COUNT_MISMATCH"));
  assert.ok(result.issues.some((i) => i.code === "ROSTER_MEMBER_MISSED"));
});

test("payroll verifier warns on gas over bound", () => {
  const logs = ROSTER.map((salary, i) =>
    makeLog({
      nodeId: `transfer-${i}`,
      input: { recipientAddress: salary.recipientAddress, amount: salary.amount },
      output: { success: true, transactionHash: HASH, gasUsedUnits: "400000" },
    })
  );

  const result = verifyPayrollExecution("exec_1", logs, {
    strategyId: "strategy_1",
    kind: "payroll",
    salaries: ROSTER,
    maxGasUnitsPerTransfer: 300_000,
  });

  assert.equal(result.status, "verified");
  assert.ok(result.issues.some((i) => i.code === "GAS_OVER_BOUND" && i.severity === "warning"));
});

test("rebalance verifier passes with confirmed write", () => {
  const logs = [
    makeLog({
      nodeId: "price",
      nodeName: "Read price",
      nodeType: "chainlink/eth-usd-latest-round-data",
      input: {},
      output: { success: true, data: { answer: "300000000000" } },
    }),
    makeLog({
      nodeId: "swap",
      nodeName: "Swap ETH to USDC",
      nodeType: "uniswap/swap-exact-input",
      input: {},
      output: { success: true, transactionHash: HASH },
    }),
  ];

  const result = verifyRebalanceExecution("exec_1", logs, {
    strategyId: "strategy_1",
    kind: "rebalance",
    expectedSourceToken: "0xEeee",
    expectedTargetToken: "0xUSDC",
    minSourceAmount: "1",
  });

  assert.equal(result.status, "verified");
});

test("rebalance verifier flags missing write", () => {
  const result = verifyRebalanceExecution(
    "exec_1",
    [makeLog({ nodeId: "price", nodeName: "Read price", nodeType: "chainlink/eth-usd-latest-round-data", output: { success: true } })],
    { strategyId: "strategy_1", kind: "rebalance", expectedSourceToken: "0x", expectedTargetToken: "0x", minSourceAmount: "1" }
  );

  assert.equal(result.status, "flagged");
  assert.ok(result.issues.some((i) => i.code === "NO_REBALANCE_WRITE"));
});
