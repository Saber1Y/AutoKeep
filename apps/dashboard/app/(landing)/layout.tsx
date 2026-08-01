import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AutoKeep - The treasury that runs itself",
  description:
    "AutoKeep is a 24/7 treasury agent for DAOs. Payroll on schedule, rebalance when markets move, and a full audit trail of onchain executions via KeeperHub.",
};

function LandingHeader() {
  return (
    <header className="l-header">
      <div className="l-header-inner">
        <a href="/" className="l-brand">
          <span className="brand-mark" aria-hidden="true" />
          AutoKeep
        </a>
        <nav className="l-nav" aria-label="Landing">
          <a href="#features">Features</a>
          <a href="#how-it-works">How it works</a>
          <a href="#live">Live</a>
        </nav>
        <a href="/dashboard" className="btn btn-primary">
          Open dashboard
        </a>
      </div>
    </header>
  );
}

export default function LandingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <LandingHeader />
      {children}
      <footer className="l-footer">
        <div className="l-footer-inner">
          <span className="l-brand">
            <span className="brand-mark" aria-hidden="true" />
            AutoKeep
          </span>
          <span>Autonomous treasury, executed onchain via KeeperHub.</span>
          <a href="/dashboard">Dashboard →</a>
        </div>
      </footer>
    </>
  );
}
