"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  deployStrategy,
  runWorkflow,
  setWorkflowEnabled,
  verifyLastExecution,
  type ActionResult,
} from "../lib/server/actions";
import { Badge, Card } from "./ui";

interface RosterDraft {
  key: number;
  label: string;
  recipientAddress: string;
  amount: string;
}

export interface WorkflowState {
  name: string;
  enabled: boolean;
  cron: string;
  timezone: string;
  roster: { label: string; recipientAddress: string; amount: string }[];
}

const DEMO_ROSTER: RosterDraft[] = [
  {
    key: 0,
    label: "Core Dev",
    recipientAddress: "0x3Aa77077a0c8eddc7cCbb28Eff31605b7e6A79EA",
    amount: "8",
  },
  {
    key: 1,
    label: "Community Lead",
    recipientAddress: "0x06c2D94CD4b3AAF10C077C341f2f1FB0D203348c",
    amount: "6",
  },
  {
    key: 2,
    label: "Designer",
    recipientAddress: "0x4Aebb76C8D0BB9e46f44B97333e516335CeC49B7",
    amount: "4",
  },
];

export function StrategyEditor({
  networkLabel,
  tokenAddress,
  workflow,
}: {
  networkLabel: string;
  tokenAddress: string;
  workflow: WorkflowState | null;
}) {
  const router = useRouter();
  const [name, setName] = useState(
    workflow ? workflow.name.replace(/^autokeep-payroll-/, "") : "Acme DAO Treasury"
  );
  const [cron, setCron] = useState(workflow?.cron ?? "0 9 * * 5");
  const [timezone, setTimezone] = useState(workflow?.timezone ?? "UTC");
  const [rows, setRows] = useState<RosterDraft[]>(
    workflow?.roster.length
      ? workflow.roster.map((entry, index) => ({ key: index, ...entry }))
      : DEMO_ROSTER.map((entry) => ({ ...entry }))
  );
  const [result, setResult] = useState<ActionResult | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const nextKey = useRef(rows.length);

  const total = useMemo(
    () => rows.reduce((sum, row) => sum + (parseFloat(row.amount) || 0), 0),
    [rows]
  );

  function updateRow(key: number, field: "label" | "recipientAddress" | "amount", value: string) {
    setRows((prev) => prev.map((row) => (row.key === key ? { ...row, [field]: value } : row)));
  }

  function addRow() {
    setRows((prev) => [
      ...prev,
      { key: nextKey.current++, label: "", recipientAddress: "", amount: "" },
    ]);
  }

  function removeRow(key: number) {
    setRows((prev) => prev.filter((row) => row.key !== key));
  }

  async function handleDeploy() {
    if (!name.trim()) {
      setResult({ ok: false, message: "Give the treasury a name before deploying." });
      return;
    }
    setBusy("deploy");
    const res = await deployStrategy({
      name,
      cron,
      timezone,
      salaries: rows.map(({ label, recipientAddress, amount }) => ({
        label,
        recipientAddress,
        amount,
      })),
    });
    setResult(res);
    setBusy(null);
    router.refresh();
  }

  async function handleToggle(enabled: boolean) {
    setBusy(enabled ? "enable" : "disable");
    const res = await setWorkflowEnabled(enabled);
    setResult(res);
    setBusy(null);
    router.refresh();
  }

  async function handleRun() {
    setBusy("run");
    const res = await runWorkflow();
    setResult(res);
    setBusy(null);
    router.refresh();
  }

  async function handleVerify() {
    setBusy("verify");
    const res = await verifyLastExecution();
    setResult(res);
    setBusy(null);
  }

  return (
    <>
      <section className="hero">
        <div className="hero-eyebrow">
          <span className="live-dot" aria-hidden="true" />
          Ops console
        </div>
        <h1>Strategy</h1>
        <p>
          Set the payroll policy for the treasury. Deploy renders it as a KeeperHub workflow;
          enable starts the schedule. Every run is verified against this policy.
        </p>
      </section>

      {result && (
        <div className={`ops-result ${result.ok ? "ops-ok" : "ops-error"}`} role="status">
          {result.message}
        </div>
      )}

      <div className="grid">
        <Card title="Payroll policy" action={<Badge tone="neutral">{networkLabel}</Badge>}>
          <label className="field">
            <span>DAO / org name</span>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Acme DAO Treasury"
            />
          </label>
          <div className="field-grid">
            <label className="field">
              <span>Cron schedule</span>
              <input
                value={cron}
                onChange={(event) => setCron(event.target.value)}
                spellCheck={false}
              />
            </label>
            <label className="field">
              <span>Timezone</span>
              <input
                value={timezone}
                onChange={(event) => setTimezone(event.target.value)}
                spellCheck={false}
              />
            </label>
          </div>
          <p className="field-note">
            Fires on <code>{cron}</code> ({timezone}). Pays in USDC <code>{tokenAddress}</code>.
          </p>
        </Card>

        <Card
          title="Recipients"
          action={<Badge tone="neutral">{rows.length} paid</Badge>}
        >
          {rows.map((row) => (
            <div className="salary-row" key={row.key}>
              <input
                className="salary-label"
                value={row.label}
                onChange={(event) => updateRow(row.key, "label", event.target.value)}
                placeholder="Label"
                aria-label="Recipient label"
              />
              <input
                className="salary-address"
                value={row.recipientAddress}
                onChange={(event) => updateRow(row.key, "recipientAddress", event.target.value)}
                placeholder="0x…"
                spellCheck={false}
                aria-label="Recipient address"
              />
              <input
                className="salary-amount"
                value={row.amount}
                onChange={(event) => updateRow(row.key, "amount", event.target.value)}
                placeholder="USDC"
                inputMode="decimal"
                aria-label="Amount in USDC"
              />
              <button
                type="button"
                className="icon-btn"
                onClick={() => removeRow(row.key)}
                aria-label={`Remove ${row.label || "recipient"}`}
                disabled={rows.length <= 1}
              >
                ×
              </button>
            </div>
          ))}
          <div className="salary-foot">
            <button type="button" className="btn btn-ghost btn-sm" onClick={addRow}>
              + Add recipient
            </button>
            <span className="salary-total">
              Cycle total <strong>{total.toFixed(2)} USDC</strong>
            </span>
          </div>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleDeploy}
            disabled={busy !== null}
          >
            {busy === "deploy" ? "Deploying…" : workflow ? "Update & redeploy" : "Deploy workflow"}
          </button>
        </Card>
      </div>

      <section className="entrance entrance-3">
        <h2 className="section-title">Schedule control</h2>
        <Card>
          <div className="ops-actions">
            <div className="ops-state">
              {workflow ? (
                <>
                  <Badge tone={workflow.enabled ? "ok" : "neutral"} dot={!workflow.enabled}>
                    {workflow.enabled ? "live" : "paused"}
                  </Badge>
                  <span className="muted">{workflow.name}</span>
                </>
              ) : (
                <span className="muted">No workflow deployed yet.</span>
              )}
            </div>
            <div className="ops-buttons">
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => handleToggle(true)}
                disabled={busy !== null || !workflow || workflow.enabled}
              >
                Enable schedule
              </button>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => handleToggle(false)}
                disabled={busy !== null || !workflow || !workflow.enabled}
              >
                Pause
              </button>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={handleRun}
                disabled={busy !== null || !workflow}
              >
                {busy === "run" ? "Running…" : "Run payroll now"}
              </button>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={handleVerify}
                disabled={busy !== null || !workflow}
              >
                {busy === "verify" ? "Verifying…" : "Verify last run"}
              </button>
            </div>
          </div>
        </Card>
      </section>
    </>
  );
}
