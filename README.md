# AutoKeep

Autonomous treasury agent for DAOs.

Most DAO treasuries are static multisigs that die when signers go offline.
AutoKeep is a 24/7 treasury agent that runs payroll on schedule, rebalances when markets move, and responds to onchain events.
Every execution goes through KeeperHub so transactions actually land, with a full audit trail and post-execution verification.

AutoKeep is proactive execution, not defensive blocking.
The agent does not ask "should we allow this?".
It says "the conditions are met, let's execute now."

## How it works

```
Strategy config (human)  ->  Agent renders workflow  ->  KeeperHub executes  ->  Agent verifies
```

1. A human sets strategy parameters: payroll roster, salary amounts, cron schedule, allocation targets.
2. The agent renders a KeeperHub workflow from those parameters (deterministic, no LLM on the execution path).
3. KeeperHub runs the workflow on schedule: check balances, evaluate conditions, execute transfers and swaps.
4. The agent pulls the execution logs and verifies the outcome matched the intent: correct recipients, correct amounts, gas within bounds, transaction confirmed onchain.

## Repo layout

| Path | Purpose |
| --- | --- |
| `apps/agent` | AutoKeep agent: config -> workflow sync, execution monitoring, verification CLI |
| `packages/keeperhub-client` | Typed REST client for the KeeperHub API |
| `packages/shared` | Shared types, constants, and validation for strategies |
| `packages/verifier` | FlightRules-style execution verification against strategy intent |
| `apps/dashboard` | Next.js dashboard (treasury, schedules, audit trail) |

## Quick start

```bash
cp .env.example .env        # add your KEEPERHUB_API_KEY
npm install
npm run dev --workspace apps/agent -- check-balances
```

The agent uses the KeeperHub MCP server and REST API as its execution layer.
Create an organization API key at `app.keeperhub.com` under Settings > API Keys.

## Agent commands

| Command | Description |
| --- | --- |
| `agent check-balances` | Show treasury balances on the configured network |
| `agent sync` | Create or update the payroll workflow from `config/strategy.json` |
| `agent run` | Manually trigger the payroll workflow |
| `agent verify <executionId>` | Verify an execution against the strategy intent |
| `agent audit` | List recent executions across AutoKeep workflows |

## Verification

The verifier compares each KeeperHub execution log against the strategy intent:

- transfer count matches the payroll roster
- every recipient is on the roster
- every amount matches the roster
- every transfer has an onchain transaction hash
- gas usage stays within bounds
- no step failed

Results are `VERIFIED` or `FLAGGED` with per-check detail, ready for export.

## Demo scenario

1. Scheduled payroll: cron fires, KeeperHub executes three USDC transfers, agent verifies each landed onchain.
2. Event-driven rebalance: a price condition is met, KeeperHub executes a swap, agent verifies the outcome.
3. Failure and retry: a congested network triggers KeeperHub smart gas estimation, the run retries, and the audit trail shows the full sequence.
