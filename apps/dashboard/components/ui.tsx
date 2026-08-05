import type { ReactNode } from "react";

export type BadgeTone = "neutral" | "ok" | "warn" | "bad" | "accent";

const STATUS_TONES: Record<string, BadgeTone> = {
  completed: "ok",
  success: "ok",
  running: "accent",
  pending: "warn",
  queued: "warn",
  failed: "bad",
  error: "bad",
  cancelled: "neutral",
};

export function Badge({
  tone = "neutral",
  dot,
  children,
}: {
  tone?: BadgeTone;
  dot?: boolean;
  children: ReactNode;
}) {
  return (
    <span className={`badge badge-${tone}`}>
      {dot ? <span className={`badge-dot${dot ? " live" : ""}`} /> : null}
      {children}
    </span>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const tone = STATUS_TONES[status.toLowerCase()] ?? "neutral";
  return <Badge tone={tone}>{status}</Badge>;
}

export function Card({
  title,
  action,
  children,
  className = "",
}: {
  title?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`card ${className}`}>
      {(title || action) && (
        <div className="card-head">
          {title ? <h2>{title}</h2> : <span />}
          {action}
        </div>
      )}
      <div className="card-body">{children}</div>
    </section>
  );
}

export function Stat({
  label,
  value,
  sub,
  tone,
  icon,
  className = "",
}: {
  label: string;
  value: ReactNode;
  sub?: string;
  tone?: "ok" | "bad" | "accent" | "muted";
  icon?: ReactNode;
  className?: string;
}) {
  return (
    <div className={`stat ${className}`}>
      <div className="stat-label">
        {icon ? <span className="stat-icon">{icon}</span> : null}
        {label}
      </div>
      <div className={`stat-value${tone ? ` stat-${tone}` : ""}`}>{value}</div>
      {sub ? <div className="stat-sub">{sub}</div> : null}
    </div>
  );
}

export function EmptyState({ message }: { message: string }) {
  return <div className="empty">{message}</div>;
}

export function Notice({
  tone = "warn",
  title,
  children,
}: {
  tone?: "warn" | "bad" | "ok";
  title: string;
  children?: ReactNode;
}) {
  return (
    <div className={`notice notice-${tone}`} role={tone === "bad" ? "alert" : "status"}>
      <span className="notice-dot" aria-hidden="true" />
      <div className="notice-body">
        <strong>{title}</strong>
        {children ? <p>{children}</p> : null}
      </div>
    </div>
  );
}
