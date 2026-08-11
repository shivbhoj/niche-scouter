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

  const content = JSON.parse(niche.reportJson) as NicheReportContent;
  const report: NicheReport = { id: niche.id, rank: niche.rank, ...content };

  return <ReportView report={report} query={market.query} marketId={marketId} />;
}
