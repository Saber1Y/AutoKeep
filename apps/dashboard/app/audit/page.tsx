import { Card, Stat } from "../../components/ui";
import { ExecutionTable } from "../../components/tables";
import { getDashboardSnapshot } from "../../lib/server/data";
import { formatTime } from "../../lib/format";

export const dynamic = "force-dynamic";

export default async function AuditPage() {
  const snapshot = await getDashboardSnapshot();

  const totalExecutions = snapshot.executions.length;
  const successful = snapshot.executions.filter((execution) =>
    ["success", "completed"].includes(execution.status.toLowerCase())
  ).length;
  const failed = totalExecutions - successful;
  const transfersLanded = snapshot.executions.reduce(
    (sum, execution) => sum + execution.transactionHashes.length,
    0
  );

  return (
    <>
      <section className="hero">
        <h1>Execution audit</h1>
        <p>
          Every AutoKeep run, with the onchain transactions KeeperHub landed and the status
          recorded. Each transaction links to the explorer.
        </p>
      </section>

      <section className="stats">
        <Stat label="Executions" value={String(totalExecutions)} tone="accent" />
        <Stat label="Succeeded" value={String(successful)} tone="ok" />
        <Stat label="Failed" value={String(failed)} tone={failed > 0 ? "bad" : "muted"} />
        <Stat label="Transactions" value={String(transfersLanded)} tone="ok" />
      </section>

      {snapshot.workflows.map((workflow) => {
        const executions = snapshot.executions.filter(
          (execution) => execution.workflowId === workflow.id
        );
        const lastRun = executions[0]?.completedAt ?? null;
        return (
          <section key={workflow.id} style={{ marginBottom: 28 }}>
            <h2 className="section-title">
              {workflow.name.replace(/^autokeep-payroll-/, "")}
              <span className="muted" style={{ fontSize: 14, marginLeft: 10 }}>
                {workflow.id}
              </span>
            </h2>
            <Card
              action={
                <span className="muted" style={{ fontSize: 13 }}>
                  last run {lastRun ? formatTime(lastRun) : "never"}
                </span>
              }
            >
              <ExecutionTable
                executions={executions}
                emptyMessage="No executions recorded for this workflow yet."
              />
            </Card>
          </section>
        );
      })}
    </>
  );
}
