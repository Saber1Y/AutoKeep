import { USDC_SEPOLIA } from "@autokeep/shared";
import { StrategyEditor } from "../../../../components/StrategyEditor";
import { Notice } from "../../../../components/ui";
import { getDashboardSnapshot } from "../../../../lib/server/data";

export const dynamic = "force-dynamic";

export default async function StrategyPage() {
  const snapshot = await getDashboardSnapshot();
  const workflow = snapshot.workflows[0] ?? null;
  const workflowState = workflow
    ? {
        name: workflow.name,
        enabled: workflow.enabled,
        cron: workflow.schedule?.cron ?? "",
        timezone: workflow.schedule?.timezone ?? "UTC",
        roster: workflow.roster.map(({ label, recipientAddress, amount }) => ({
          label,
          recipientAddress,
          amount,
        })),
      }
    : null;

  return (
    <>
      {snapshot.notices.length > 0 && (
        <section className="notices entrance">
          {snapshot.notices.map((notice) => (
            <Notice key={notice.title} tone={notice.tone} title={notice.title}>
              {notice.message}
            </Notice>
          ))}
        </section>
      )}
      <StrategyEditor
        networkLabel={snapshot.networkLabel}
        tokenAddress={USDC_SEPOLIA}
        workflow={workflowState}
      />
    </>
  );
}
