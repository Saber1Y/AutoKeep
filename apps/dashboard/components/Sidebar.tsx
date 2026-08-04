import { NavLink } from "./NavLink";

function OverviewIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="2" width="5" height="5" rx="1" />
      <rect x="9" y="2" width="5" height="5" rx="1" />
      <rect x="2" y="9" width="5" height="5" rx="1" />
      <rect x="9" y="9" width="5" height="5" rx="1" />
    </svg>
  );
}

function AuditIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M2 4h12" />
      <path d="M2 8h12" />
      <path d="M2 12h8" />
      <path d="M12 12l1.5 1.5L16 11" />
    </svg>
  );
}

function StrategyIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M2 4h4" />
      <circle cx="9" cy="4" r="1.5" />
      <path d="M11 4h3" />
      <path d="M2 12h3" />
      <circle cx="8" cy="12" r="1.5" />
      <path d="M10 12h4" />
    </svg>
  );
}

export function Sidebar() {
  return (
    <aside className="sidebar">
      <a href="/dashboard" className="sidebar-brand">
        <span className="brand-mark" aria-hidden="true" />
        <span className="brand-name">AutoKeep</span>
      </a>

      <nav className="sidebar-nav">
        <span className="sidebar-nav-label">Treasury</span>
        <NavLink href="/dashboard" icon={<OverviewIcon />}>
          Overview
        </NavLink>
        <NavLink href="/dashboard/strategy" icon={<StrategyIcon />}>
          Strategy
        </NavLink>
        <NavLink href="/dashboard/audit" icon={<AuditIcon />}>
          Audit trail
        </NavLink>
      </nav>

      <div className="sidebar-footer">
        <span className="sidebar-footer-line">
          <span className="live-dot" aria-hidden="true" />
          Powered by KeeperHub
        </span>
      </div>
    </aside>
  );
}
