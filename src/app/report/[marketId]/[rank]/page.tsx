import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/current-user";
import { unlockNiche } from "@/lib/credits";
import type { NicheReport, NicheReportContent } from "@/lib/types";
import { ReportView } from "@/components/report-view";

export default async function ReportPage({
  params,
}: {
  params: Promise<{ marketId: string; rank: string }>;
}) {
  const { marketId, rank: rankStr } = await params;
  const rank = Number(rankStr);
  if (!Number.isInteger(rank)) redirect("/");

  const market = await db.market.findUnique({ where: { id: marketId } });
  if (!market) redirect("/");

  const niche = await db.niche.findUnique({ where: { marketId_rank: { marketId, rank } } });
  if (!niche) redirect(`/results?market=${marketId}`);

  const user = await getCurrentUser();
  if (!user) redirect(`/results?market=${marketId}&reveal=${rank}`);

  const result = await unlockNiche(user.id, niche.id);
  if (!result.ok) redirect(`/results?market=${marketId}&reveal=${rank}&paywall=1`);

  let content: NicheReportContent;
  try {
    content = JSON.parse(niche.reportJson) as NicheReportContent;
  } catch (err) {
    // Corrupt stored payload shouldn't 500 a user who just paid for it.
    // The unlock above already succeeded, so the credit isn't lost —
    // re-opening from the dashboard works once the row is repaired.
    console.error(`[report] unparseable reportJson for niche=${niche.id}`, err);
    redirect(`/results?market=${marketId}`);
  }
  const report: NicheReport = { id: niche.id, rank: niche.rank, ...content };

  // Denominator for the adjacency click rate: the block is seen exactly
  // when a report is served. Never block rendering a paid report on a
  // telemetry write.
  void db.event
    .create({
      data: {
        name: "report_opened",
        userId: user.id,
        meta: JSON.stringify({ market: market.query, niche: niche.name }),
      },
    })
    .catch((err) => console.error("[metrics] report_opened failed", err));

  return (
    <ReportView
      report={report}
      query={market.query}
      marketId={marketId}
      // When the research actually ran. Showing the render date here
      // would silently claim a cached report is fresh.
      dataPulledAt={market.createdAt}
    />
  );
}
