import type { DashboardExecution } from "../lib/server/data";
import { explorerTxUrl, formatTime, formatUsd, shortAddress, shortHash } from "../lib/format";
import { EmptyState, StatusBadge } from "./ui";

export function ExecutionTable({
  executions,
  emptyMessage,
}: {
  executions: DashboardExecution[];
  emptyMessage: string;
}) {
  if (executions.length === 0) {
    return <EmptyState message={emptyMessage} />;
  }

  return (
    <div className="table-wrap">
      <table className="table">
        <thead>
          <tr>
            <th>Execution</th>
            <th>Workflow</th>
            <th>Status</th>
            <th>Txs</th>
            <th>Gas</th>
            <th>Completed</th>
          </tr>
        </thead>
        <tbody>
          {executions.map((execution) => (
            <tr key={execution.executionId}>
              <td>
                <code className="mono">{shortAddress(execution.executionId)}</code>
              </td>
              <td>{execution.workflowName}</td>
              <td>
                <StatusBadge status={execution.status} />
              </td>
              <td>
                <div className="tx-list">
                  {execution.transactionHashes.length === 0 ? (
                    <span className="muted">—</span>
                  ) : (
                    execution.transactionHashes.map((tx) => {
                      const url = explorerTxUrl(tx.network, tx.hash);
                      return url ? (
                        <a
                          key={tx.hash}
                          href={url}
                          target="_blank"
                          rel="noreferrer"
                          className="tx-link"
                          title={tx.hash}
                        >
                          {shortHash(tx.hash)}
                        </a>
                      ) : (
                        <code key={tx.hash} className="mono muted">
                          {shortHash(tx.hash)}
                        </code>
                      );
                    })
                  )}
                </div>
              </td>
              <td>
                <code className="mono">
                  {execution.gasUsedWei ? `${(Number(execution.gasUsedWei) / 1e18).toFixed(6)} ETH` : "—"}
                </code>
              </td>
              <td className="muted">{formatTime(execution.completedAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function RosterTable({
  entries,
}: {
  entries: { label: string; recipientAddress: string; amount: string }[];
}) {
  if (entries.length === 0) {
    return <EmptyState message="No transfer steps in this workflow." />;
  }
  return (
    <div className="table-wrap">
      <table className="table table-compact">
        <thead>
          <tr>
            <th>Recipient</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => (
            <tr key={entry.recipientAddress}>
              <td>
                <span className="roster-label">{entry.label}</span>{" "}
                <code className="mono muted">{shortAddress(entry.recipientAddress)}</code>
              </td>
              <td>
                <code className="mono">{formatUsd(entry.amount)} USDC</code>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
