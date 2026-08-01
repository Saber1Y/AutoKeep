import type { Metadata } from "next";
import "./globals.css";
import { Header } from "../components/Header";

export const metadata: Metadata = {
  title: "AutoKeep - Autonomous Treasury Agent",
  description:
    "AutoKeep is a 24/7 treasury agent for DAOs. Payroll on schedule, rebalance when markets move, and a full audit trail of onchain executions via KeeperHub.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Header />
        <main className="main">{children}</main>
        <footer className="footer">
          <div className="main" style={{ paddingTop: 0, paddingBottom: 0 }}>
            AutoKeep runs on KeeperHub. Every execution is simulated before it lands, then
            verified against the strategy intent.
          </div>
        </footer>
      </body>
    </html>
  );
}
