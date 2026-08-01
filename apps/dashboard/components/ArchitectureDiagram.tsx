import type { CSSProperties, ReactNode } from "react";

function FileIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6" />
      <path d="M8 13h8" />
      <path d="M8 17h5" />
    </svg>
  );
}

function WorkflowIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
      <path d="M6.5 10v2a3 3 0 0 0 3 3h4.5" />
      <path d="M17.5 14v-2a3 3 0 0 0-3-3H10" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

function BranchIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="6" y1="3" x2="6" y2="15" />
      <circle cx="18" cy="6" r="3" />
      <circle cx="6" cy="18" r="3" />
      <path d="M18 9a9 9 0 0 1-9 9" />
    </svg>
  );
}

function FlagIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 21V4" />
      <path d="M4 5c4-2 8 2 12 0v9c-4 2-8-2-12 0" />
    </svg>
  );
}

function SendIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M22 2L11 13" />
      <path d="M22 2l-7 20-4-9-9-4z" />
    </svg>
  );
}

function ZapIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
    </svg>
  );
}

function ShieldCheckIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 22s8-3 8-10V5l-8-3-8 3v7c0 7 8 10 8 10z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  );
}

function ClipboardCheckIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="8" y="2" width="8" height="4" rx="1" />
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <path d="M9 14l2 2 4-4" />
    </svg>
  );
}

function Node({
  cx,
  cy,
  tint,
  label,
  icon,
  index,
  size,
}: {
  cx: number;
  cy: number;
  tint: string;
  label: string;
  icon: ReactNode;
  index: number;
  size?: "sm" | "lg";
}) {
  return (
    <div
      className={`cn-node${size ? ` cn-node-${size}` : ""}`}
      style={{ left: `${cx}%`, top: `${cy}%`, "--i": index } as CSSProperties}
    >
      <span className={`cn-icon tint-${tint}`}>{icon}</span>
      <span className="cn-dot t" aria-hidden="true" />
      <span className="cn-dot r" aria-hidden="true" />
      <span className="cn-dot b" aria-hidden="true" />
      <span className="cn-dot l" aria-hidden="true" />
      <span className="cn-badge" aria-hidden="true">
        <svg width="9" height="9" viewBox="0 0 9 9" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M1.5 4.5l2 2 4-4" />
        </svg>
      </span>
      <span className="cn-label">{label}</span>
    </div>
  );
}

export function ArchitectureDiagram() {
  return (
    <div className="canvas-scroll">
      <div className="canvas" role="img" aria-label="AutoKeep payroll flow: strategy config, KeeperHub workflow, schedule trigger, reserves decision, simulate and submit with gas sponsorship, onchain verification, and audit trail">
        <svg className="cn-svg" viewBox="0 0 1000 640" preserveAspectRatio="none" aria-hidden="true">
          <g strokeLinecap="round" fill="none">
            <path className="cn-line" d="M 212 90 L 468 90" />
            <path className="cn-line" d="M 532 90 L 788 90" />
            <path className="cn-line" d="M 820 122 C 820 165 500 165 500 200" />
            <path className="cn-line cn-line-no" d="M 470 235 C 380 300 300 315 246 352" />
            <path className="cn-line cn-line-yes" d="M 530 235 C 620 300 700 315 754 352" />
            <path className="cn-line cn-line-fund" d="M 500 472 C 600 520 700 500 762 422" />
            <path className="cn-line cn-line-yes" d="M 762 424 C 726 484 676 500 654 503" />
            <path className="cn-line cn-line-yes" d="M 798 424 C 848 484 892 500 910 503" />
          </g>
          <text className="cn-text cn-text-no" x="362" y="272">
            No
          </text>
          <text className="cn-text cn-text-yes" x="648" y="272">
            Yes
          </text>
        </svg>

        <Node cx={18} cy={14.06} tint="green" label="Strategy config" icon={<FileIcon />} index={0} />
        <Node cx={50} cy={14.06} tint="blue" label="KeeperHub workflow" icon={<WorkflowIcon />} index={1} />
        <Node cx={82} cy={14.06} tint="amber" label="Schedule fires" icon={<ClockIcon />} index={2} />
        <Node cx={50} cy={36.72} tint="amber" label="Sufficient reserves?" icon={<BranchIcon />} index={3} />
        <Node cx={23} cy={59.4} tint="gray" label="Run flagged" icon={<FlagIcon />} index={4} size="sm" />
        <Node cx={78} cy={59.4} tint="gray" label="Simulate + submit" icon={<SendIcon />} index={5} size="lg" />
        <Node cx={50} cy={78.1} tint="indigo" label="Gas sponsorship" icon={<ZapIcon />} index={6} />
        <Node cx={65} cy={83.6} tint="blue" label="Onchain verification" icon={<ShieldCheckIcon />} index={7} />
        <Node cx={91} cy={83.6} tint="purple" label="Audit trail" icon={<ClipboardCheckIcon />} index={8} />

        <span className="cn-chip" aria-hidden="true">
          Gas sponsored · just-in-time
        </span>
      </div>
      <p className="cn-caption">
        The decision branch gates payroll behind treasury reserves. If funds are short, the run is
        flagged and the treasury is never touched. Otherwise KeeperHub simulates, submits, and
        retries with gas sponsored, then the run fans out to verification and the audit trail.
      </p>
    </div>
  );
}
