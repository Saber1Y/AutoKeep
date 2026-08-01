import type { Metadata } from "next";
import { Sora } from "next/font/google";
import "./globals.css";
import { Sidebar } from "../components/Sidebar";
import { Topbar } from "../components/Topbar";

const sora = Sora({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-sora",
});

export const metadata: Metadata = {
  title: "AutoKeep - Autonomous Treasury Agent",
  description:
    "AutoKeep is a 24/7 treasury agent for DAOs. Payroll on schedule, rebalance when markets move, and a full audit trail of onchain executions via KeeperHub.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={sora.variable}>
      <body>
        <div className="app-shell">
          <Sidebar />
          <div className="app-content">
            <Topbar />
            <main className="main">{children}</main>
            <footer className="footer">
              AutoKeep runs on KeeperHub. Every execution is simulated before it lands, then
              verified against the strategy intent.
            </footer>
          </div>
        </div>
      </body>
    </html>
  );
}
