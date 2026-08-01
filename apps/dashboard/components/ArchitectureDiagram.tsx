import type { CSSProperties, ReactNode } from "react";

function WebhookIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M18 16.98h-5.99c-1.1 0-1.95.94-2.48 1.9A4 4 0 0 1 2 17c.01-.7.2-1.4.57-2" />
      <path d="m6 17 3.13-5.78c.53-.97.1-2.18-.5-3.1a4 4 0 1 1 6.89-4.06" />
      <path d="m12 6 3.13 5.73C15.66 12.7 16.9 13 18 13a4 4 0 0 1 0 8" />
    </svg>
  );
}

function DatabaseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <ellipse cx="12" cy="5" rx="9" ry="3" />
      <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
      <path d="M3 12c0 1.66 4 3 9 3s9-1.34 9-3" />
    </svg>
  );
}

function SparkIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z" />
      <path d="M19 15l.9 2.1L22 18l-2.1.9L19 21l-.9-2.1L16 18l2.1-.9z" />
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

function CheckIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </svg>
  );
}

function BridgeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M8 3L4 7l4 4" />
      <path d="M4 7h16" />
      <path d="M16 21l4-4-4-4" />
      <path d="M20 17H4" />
    </svg>
  );
}

function ScreenIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="3" width="20" height="14" rx="2" />
      <path d="M8 21h8" />
      <path d="M12 17v4" />
    </svg>
  );
}

function RobotIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="4" y="8" width="16" height="12" rx="2" />
      <circle cx="9" cy="13" r="1.5" />
      <circle cx="15" cy="13" r="1.5" />
      <path d="M12 8V4" />
      <circle cx="12" cy="3" r="1" />
      <path d="M9 17h6" />
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
      <div className="canvas" role="img" aria-label="CupSignal request flow: match request, fetch match data, AI signal engine, premium decision, x402 payment gate, CCTP funding, fan dashboard, and MCP agent response">
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

        <Node cx={18} cy={14.06} tint="green" label="Match request" icon={<WebhookIcon />} index={0} />
        <Node cx={50} cy={14.06} tint="blue" label="Fetch match data" icon={<DatabaseIcon />} index={1} />
        <Node cx={82} cy={14.06} tint="amber" label="AI signal engine" icon={<SparkIcon />} index={2} />
        <Node cx={50} cy={36.72} tint="amber" label="Premium requested?" icon={<BranchIcon />} index={3} />
        <Node cx={23} cy={59.4} tint="gray" label="Free signal shown" icon={<CheckIcon />} index={4} size="sm" />
        <Node cx={78} cy={59.4} tint="gray" label="x402 payment gate" icon={<LockIcon />} index={5} size="lg" />
        <Node cx={50} cy={78.1} tint="indigo" label="CCTP: fund USDC" icon={<BridgeIcon />} index={6} />
        <Node cx={65} cy={83.6} tint="blue" label="Fan dashboard" icon={<ScreenIcon />} index={7} />
        <Node cx={91} cy={83.6} tint="purple" label="MCP agent response" icon={<RobotIcon />} index={8} />

        <span className="cn-chip" aria-hidden="true">
          402 · Payment Required
        </span>
      </div>
      <p className="cn-caption">
        The conditional branch gates the free verdict from premium. Funding can arrive just-in-time
        via CCTP when the destination chain has no USDC yet, then the gate fans out to dashboard and
        agent delivery.
      </p>
    </div>
  );
}
