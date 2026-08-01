import type { Metadata } from "next";
import { Sidebar } from "../../components/Sidebar";
import { Topbar } from "../../components/Topbar";

export const metadata: Metadata = {
  title: "AutoKeep - Autonomous Treasury Agent",
  description:
    "AutoKeep is a 24/7 treasury agent for DAOs. Payroll on schedule, rebalance when markets move, and a full audit trail of onchain executions via KeeperHub.",
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-shell">
      <Sidebar />
      <div className="app-content">
        <Topbar />
        <main className="main">{children}</main>
        <footer className="footer">
          AutoKeep runs on KeeperHub. Every execution is simulated before it lands, then verified
          against the strategy intent.
        </footer>
      </div>
    </div>
  );
}
