# AutoKeep Test Flow

This guide explains what AutoKeep currently does and how to demonstrate each working part end to end.
It also separates demonstrated behavior from the broader product architecture shown on the landing page.

## System Flow

The working flow is:

```text
strategy.json
  -> AutoKeep agent
  -> KeeperHub payroll workflow
  -> scheduled or manual execution
  -> three sponsored USDC transfers on Sepolia
  -> execution-log verification
  -> dashboard and audit trail
```

The main components are:

| Component | Responsibility |
| --- | --- |
| `apps/agent/config/strategy.json` | Defines the network, token, payroll schedule, recipients, and amounts. |
| `apps/agent` | Converts the strategy into a KeeperHub workflow, triggers it, checks balances, verifies runs, and prints audit history. |
| `packages/keeperhub-client` | Handles typed KeeperHub API calls and normalizes execution data. |
| `packages/verifier` | Reconciles execution logs against the intended payroll roster. |
| `apps/dashboard` | Displays treasury state, workflows, executions, transaction links, and verification evidence. |

## Current Strategy

- Network: Ethereum Sepolia, chain ID `11155111`.
- Token: Sepolia USDC at `0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238`.
- Schedule: Friday at 09:00 UTC using cron `0 9 * * 5`.
- Core Dev: 8 USDC.
- Community Lead: 6 USDC.
- Designer: 4 USDC.
- Total required per payroll cycle: 18 USDC.

## Prerequisites

1. Use Node.js 20 or newer.
2. Install dependencies with `npm install` if they are not already installed.
3. Set `KEEPERHUB_API_KEY` in the repository root `.env` file.
4. Keep `AUTOKEEP_NETWORK=11155111` or allow the agent to use its Sepolia default.
5. Fund the KeeperHub treasury wallet with at least 18 Sepolia USDC before testing a successful payroll run.
6. Do not use mainnet for this demo.

## Flow 1: Validate the Repository

Run the local quality checks before testing external services:

```bash
npm run typecheck
npm test
npm run build
```

Expected result:

- TypeScript completes without errors.
- All configured tests pass.
- The dashboard production build completes successfully.

## Flow 2: Check Treasury Readiness

Run:

```bash
npm run agent -- check-balances
```

Expected result:

- The agent connects to KeeperHub.
- It prints the configured Sepolia treasury balances.
- The USDC balance is at least 18 USDC for a complete payroll run.

This proves the agent can read the real treasury state before creating transactions.

## Flow 3: Sync the Strategy

Run:

```bash
npm run agent -- sync
```

Expected result:

- AutoKeep reads `apps/agent/config/strategy.json`.
- It creates or updates `autokeep-payroll-Acme DAO Treasury` in KeeperHub.
- The output reports three transfers totaling 18 USDC.
- A newly created workflow remains disabled until it is enabled in the KeeperHub canvas.

The generated workflow currently contains one schedule trigger followed by the three transfer actions.
Running `sync` again updates the existing workflow instead of creating a duplicate with the same name.

## Flow 4: Run Payroll Manually

Run:

```bash
npm run agent -- run
```

Expected result:

- The agent finds the AutoKeep payroll workflow.
- KeeperHub returns an execution ID.
- The agent waits for the execution to reach a terminal state.
- A successful run submits three USDC transfers.
- KeeperHub sponsors the transaction gas on Sepolia.
- The command prints the final status and the transaction hashes returned by the execution endpoint.

Record the execution ID because the verification flow requires it.
Confirm every transaction directly on Sepolia Etherscan before describing the run as successful.

## Flow 5: Verify Payroll Intent

Run the verifier with the execution ID from the previous flow:

```bash
npm run agent -- verify <execution-id>
```

Expected result for a correct run:

```text
[verify] <execution-id>: VERIFIED 15/15 checks passed
```

The verifier checks the execution logs against the configured strategy.
Its checks cover transfer count, recipients, amounts, transaction hashes, roster completeness, gas bounds, and step errors.

The verifier reads per-node logs because KeeperHub's top-level `transactionHashes` array can omit a final transaction hash.
This behavior was observed in the demonstrated payroll execution and is handled by the implementation.

## Flow 6: Inspect the Audit Trail

Run:

```bash
npm run agent -- audit
```

Expected result:

- The command lists AutoKeep workflows.
- It displays up to ten recent executions for each workflow.
- Each row includes the execution ID, status, transaction count, shortened hashes, and completion time when available.

Then start the dashboard:

```bash
npm run dashboard
```

Open these pages:

| Route | What to verify |
| --- | --- |
| `/` | Product story, live statistics, architecture canvas, and links into the app. |
| `/dashboard` | Treasury balance, workflow state, recent execution status, and transaction evidence. |
| `/dashboard/audit` | Execution history and Etherscan links for individual transactions. |

Check all three routes on desktop and mobile widths.
Confirm loading, empty, live-data, and API-error states where practical.

## Flow 7: Test the Scheduled Trigger

Enable the payroll workflow in the KeeperHub canvas only after confirming its recipients and amounts.
Verify that its schedule is Friday at 09:00 UTC.

Expected result at the next scheduled time:

- KeeperHub starts the workflow without a manual `run` command.
- The execution appears in `agent audit` and on the dashboard.
- The resulting execution can be checked with `agent verify <execution-id>`.

Disable the workflow after the demonstration if repeated test payrolls are not desired.

## Flow 8: Test Failure Detection

Use a separate test strategy or test treasury rather than changing the demonstrated payroll evidence.
Configure a transfer amount greater than the available Sepolia USDC balance, sync it, and run it manually.

Expected result:

- At least one transfer step fails or reverts instead of being reported as successful.
- The execution records the failure.
- `agent verify <execution-id>` reports failed checks or issues instead of `VERIFIED`.
- The dashboard and audit output show the terminal execution state without claiming that failed transfers settled.

This test demonstrates failure detection in the current implementation.
The visual `Sufficient reserves?` and `Run flagged` branch on the landing-page architecture canvas is not yet implemented as a KeeperHub condition node.

## Demonstrated Evidence

The canonical evidence is recorded in `docs/executions.md`.

- Direct sponsored transfer execution: `zr22r4jds7czc2r8xqlou`.
- Payroll execution: `zl8vft89qeo0dy1sfgcbn`.
- Payroll verification: 15 of 15 checks passed.
- Payroll result: three confirmed Sepolia USDC transfers totaling 18 USDC.

Use the Etherscan links in `docs/executions.md` during the demo so judges can independently verify the transactions.

## Current Boundaries

The following items are represented in the product architecture but are not separate nodes in the current KeeperHub payroll workflow:

- A pre-transfer treasury reserve condition.
- A dedicated `Run flagged` branch.
- A gas-sponsorship workflow node.
- An in-workflow verification fan-out.
- Automated treasury rebalancing or swaps.

KeeperHub currently provides gas sponsorship at transaction execution time.
Verification currently runs through the AutoKeep verifier after execution.
The current onchain workflow is the schedule trigger plus the three configured USDC transfers.

## Demo Sequence

Use this order for the clearest hackathon demonstration:

1. Show `strategy.json` and explain the schedule, recipients, and total payroll amount.
2. Run `check-balances` to show the live treasury state.
3. Run `sync` to show strategy-to-workflow generation.
4. Show the generated workflow in KeeperHub.
5. Run the workflow manually and capture the execution ID.
6. Open all three transaction hashes on Sepolia Etherscan.
7. Run `verify` and show the 15 of 15 result.
8. Open `/dashboard/audit` and connect the UI evidence to the same execution and transactions.
9. Explain that KeeperHub sponsored the gas and that the schedule can execute the same workflow without signer babysitting.
