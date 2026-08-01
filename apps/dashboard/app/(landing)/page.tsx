import { getDashboardSnapshot } from "../../lib/server/data";
import { ArchitectureDiagram } from "../../components/ArchitectureDiagram";
import { Reveal } from "../../components/Reveal";

export const dynamic = "force-dynamic";

async function liveStats(): Promise<
  { executions: number; transactions: number; schedules: number; usdc: string } | null
> {
  try {
    const snapshot = await getDashboardSnapshot();
    return {
      executions: snapshot.executions.length,
      transactions: snapshot.executions.reduce(
        (sum, execution) => sum + execution.transactionHashes.length,
        0
      ),
      schedules: snapshot.workflows.filter((workflow) => workflow.enabled).length,
      usdc: snapshot.usdcBalance ? `${snapshot.usdcBalance.balance} USDC` : "—",
    };
  } catch {
    return null;
  }
}

function Feature({
  title,
  body,
  icon,
}: {
  title: string;
  body: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="l-feature">
      <div className="l-feature-icon">{icon}</div>
      <h3>{title}</h3>
      <p>{body}</p>
    </div>
  );
}

export default async function LandingPage() {
  const stats = await liveStats();
  const pills = stats
    ? [
        { k: "Executions", v: String(stats.executions) },
        { k: "Transactions landed", v: String(stats.transactions) },
        { k: "Active schedules", v: String(stats.schedules) },
        { k: "USDC reserves", v: stats.usdc },
      ]
    : null;

  return (
    <>
      <section className="l-hero">
        <div className="l-container">
          <div className="l-hero-eyebrow">
            <span className="live-dot" aria-hidden="true" />
            Autonomous treasury · live onchain
          </div>
          <h1>The treasury that runs itself</h1>
          <p>
            AutoKeep turns a DAO treasury strategy into a KeeperHub workflow, pays payroll on
            schedule, and verifies every run onchain. No signer babysitting, full audit trail.
          </p>
          <div className="l-cta-row">
            <a href="/dashboard" className="btn btn-primary">
              Open dashboard
            </a>
            <a href="/dashboard/audit" className="btn btn-ghost">
              View audit trail
            </a>
          </div>
          {pills && (
            <div className="l-stats-strip" id="live">
              {pills.map((pill) => (
                <div key={pill.k} className="l-stat-pill">
                  <div className="k">{pill.k}</div>
                  <div className="v">{pill.v}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="l-section l-section-alt" id="architecture">
        <div className="l-container">
          <Reveal>
            <div className="l-section-head">
              <div className="l-eyebrow">Architecture</div>
              <h2>How a request actually moves through the system.</h2>
              <p>
                One strategy file, one workflow, one verified payroll run - no signer in the loop.
              </p>
            </div>
          </Reveal>
          <Reveal delay={140}>
            <ArchitectureDiagram />
          </Reveal>
        </div>
      </section>

      <section className="l-section" id="features">
        <div className="l-container">
          <Reveal>
            <div className="l-section-head">
              <h2>Built for real treasury work</h2>
              <p>Strategy in, onchain execution out. KeeperHub handles the last mile.</p>
            </div>
          </Reveal>
          <div className="l-features">
            <Reveal delay={0}>
              <Feature
                title="Payroll on schedule"
                body="Cron-driven USDC payroll straight from treasury strategy. Salaries land on Friday, every week, without a human signing."
                icon={
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <circle cx="12" cy="12" r="9" />
                    <path d="M12 7v5l3 2" />
                  </svg>
                }
              />
            </Reveal>
            <Reveal delay={100}>
              <Feature
                title="Verified onchain"
                body="Every execution is checked against the strategy intent: recipients, amounts, and transaction hashes all confirmed onchain before a run is called done."
                icon={
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                }
              />
            </Reveal>
            <Reveal delay={200}>
              <Feature
                title="Full audit trail"
                body="Each run links straight to the explorer. Simulated before it lands, retried on failure, and replayable from one place."
                icon={
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M3 12h18" />
                    <path d="M3 6h18" />
                    <path d="M3 18h12" />
                  </svg>
                }
              />
            </Reveal>
          </div>
        </div>
      </section>

      <section className="l-section l-section-alt" id="how-it-works">
        <div className="l-container">
          <Reveal>
            <div className="l-section-head">
              <h2>How it works</h2>
              <p>Three steps between a strategy and a settled transaction.</p>
            </div>
          </Reveal>
          <div className="l-steps">
            <Reveal delay={0}>
              <div className="l-step">
                <span className="l-step-num">01</span>
                <h3>Define the strategy</h3>
                <p>A JSON strategy describes who gets paid, how much, and on what schedule.</p>
              </div>
            </Reveal>
            <Reveal delay={100}>
              <div className="l-step">
                <span className="l-step-num">02</span>
                <h3>KeeperHub renders the workflow</h3>
                <p>AutoKeep compiles it into a KeeperHub workflow with a cron trigger and transfer actions.</p>
              </div>
            </Reveal>
            <Reveal delay={200}>
              <div className="l-step">
                <span className="l-step-num">03</span>
                <h3>Transactions land and get verified</h3>
                <p>KeeperHub simulates, submits, and retries. AutoKeep verifies the result against intent.</p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="l-section">
        <div className="l-container l-cta">
          <Reveal>
            <h2>See the agent in action</h2>
            <p>Live balances, schedules, and every onchain execution with explorer links.</p>
            <a href="/dashboard" className="btn btn-primary">
              Open dashboard
            </a>
          </Reveal>
        </div>
      </section>
    </>
  );
}
