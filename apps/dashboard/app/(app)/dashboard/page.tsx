import { Badge, Card, Stat } from "../../../components/ui";
import { ExecutionTable, RosterTable } from "../../../components/tables";
import { getDashboardSnapshot, type DashboardWorkflow } from "../../../lib/server/data";
import { formatTime, formatUsd } from "../../../lib/format";

export const dynamic = "force-dynamic";

function totalCycleUsdc(workflow: DashboardWorkflow): number {
  return workflow.roster.reduce((sum, entry) => sum + Number(entry.amount || 0), 0);
}

export default async function DashboardPage() {
  const snapshot = await getDashboardSnapshot();

  const activeSchedules = snapshot.workflows.filter((workflow) => workflow.enabled).length;
  const transfersLanded = snapshot.executions.reduce(
    (sum, execution) => sum + execution.transactionHashes.length,
    0
  );
  const successful = snapshot.executions.filter((execution) =>
    ["success", "completed"].includes(execution.status.toLowerCase())
  ).length;
  const recent = snapshot.executions.slice(0, 6);

  const nativeBalance = snapshot.nativeBalance;
  const usdcBalance = snapshot.usdcBalance;

  return (
    <>
      <section className="hero">
        <div className="hero-eyebrow">
          <span className="live-dot" />
          Autonomous treasury · live
        </div>
        <h1>Treasury that runs itself</h1>
        <p>
          AutoKeep renders a KeeperHub workflow from your strategy, executes on schedule, and
          verifies each run against intent. No signer babysitting, full audit trail.
        </p>
      </section>

      <section className="stats">
        <Stat
          className="entrance entrance-1"
          label="Treasury native"
          value={nativeBalance ? `${nativeBalance.balance} ${nativeBalance.symbol}` : "unavailable"}
          sub={`wallet ${snapshot.walletAddress.slice(0, 6)}\u2026${snapshot.walletAddress.slice(-4)}`}
          tone={nativeBalance ? (Number(nativeBalance.balance) > 0 ? "ok" : "muted") : "muted"}
        />
        <Stat
          className="entrance entrance-2"
          label="USDC reserves"
          value={usdcBalance ? `${usdcBalance.balance} USDC` : "unavailable"}
          tone={usdcBalance ? (Number(usdcBalance.balance) > 0 ? "ok" : "muted") : "muted"}
        />
        <Stat
          className="entrance entrance-3"
          label="Active schedules"
          value={String(activeSchedules)}
          sub={`${snapshot.workflows.length} AutoKeep workflows`}
          tone={activeSchedules > 0 ? "accent" : "muted"}
        />
        <Stat
          className="entrance entrance-4"
          label="Onchain transfers"
          value={String(transfersLanded)}
          sub={`${successful} executions succeeded`}
          tone={transfersLanded > 0 ? "ok" : "muted"}
        />
      </section>

      <div className="grid">
        <Card title="Treasury balances" action={<Badge tone="neutral">{snapshot.networkLabel}</Badge>}>
          <div className="balance-rows">
            <div className="balance-row">
              <span className="balance-name">
                <span className="balance-dot native">Ξ</span>
                Native {nativeBalance?.symbol ?? "ETH"}
              </span>
              <span className="balance-amount">
                {nativeBalance ? `${nativeBalance.balance} ${nativeBalance.symbol}` : "\u2014"}
              </span>
            </div>
            <div className="balance-row">
              <span className="balance-name">
                <span className="balance-dot usdc">$</span>
                USDC
              </span>
              <span className="balance-amount">
                {usdcBalance ? `${usdcBalance.balance} USDC` : "\u2014"}
              </span>
            </div>
          </div>
        </Card>

        <Card
          title="Schedules"
          action={
            <Badge tone={activeSchedules > 0 ? "ok" : "warn"} dot>
              {activeSchedules > 0 ? "live" : "paused"}
            </Badge>
          }
        >
          <div className="schedule-list">
            {snapshot.workflows.length === 0 ? (
              <div className="empty">
                No AutoKeep workflows yet. Run <code>agent sync</code> to deploy a payroll schedule
                from strategy config.
              </div>
            ) : (
              snapshot.workflows.map((workflow) => (
                <div key={workflow.id} className="schedule">
                  <div className="schedule-head">
                    <span className="schedule-name">
                      {workflow.name.replace(/^autokeep-payroll-/, "")}
                    </span>
                    <Badge tone={workflow.enabled ? "ok" : "neutral"} dot={!workflow.enabled}>
                      {workflow.enabled ? "enabled" : "disabled"}
                    </Badge>
                  </div>
                  <div className="schedule-meta">
                    <span>
                      cron <strong>{workflow.schedule?.cron ?? "\u2014"}</strong>
                    </span>
                    <span>
                      tz <strong>{workflow.schedule?.timezone ?? "\u2014"}</strong>
                    </span>
                    <span>
                      steps <strong>{workflow.actionCount}</strong>
                    </span>
                    {totalCycleUsdc(workflow) > 0 && (
                      <span>
                        cycle <strong>{formatUsd(totalCycleUsdc(workflow))} USDC</strong>
                      </span>
                    )}
                    <span>
                      updated <strong>{formatTime(workflow.updatedAt)}</strong>
                    </span>
                  </div>
                  {workflow.roster.length > 0 && (
                    <div style={{ marginTop: 12 }}>
                      <RosterTable entries={workflow.roster} />
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      <section className="entrance entrance-3">
        <h2 className="section-title">Recent executions</h2>
        <Card>
          <ExecutionTable
            executions={recent}
            emptyMessage="No workflow executions yet. Trigger one with `agent run`, or wait for the cron schedule. Direct transfers are recorded in docs/executions.md."
          />
        </Card>
      </section>
    </>
  );
}
