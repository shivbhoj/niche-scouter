import type { NicheReportContent, TupleNiche } from "@/lib/types";

export function fromSeed(n: TupleNiche): NicheReportContent {
  return {
    name: n.name,
    teaser: n.teaser,
    demand: n.demand,
    gapScore: n.gapScore,
    adjacency: n.adjacency.map(([industry, reason, linkedFinding]) => ({
      industry,
      reason,
      linkedFinding,
    })),
    revenue: n.revenue,
    revenueNote: n.revenueNote,
    thesis: n.thesis,
    metrics: n.metrics.map(([label, value]) => ({ label, value })),
    trend: n.trend,
    trendStart: n.trendStart,
    trendEnd: n.trendEnd,
    trendNote: n.trendNote,
    audience: n.audience,
    audienceFacts: n.audienceFacts.map(([k, v]) => ({ k, v })),
    keywords: n.keywords.map(([term, vol, kd, growth]) => ({ term, vol, kd, growth })),
    competitors: n.competitors.map(([name, scale, gap]) => ({ name, scale, gap })),
    playbook: n.playbook.map(([num, title, body, margin]) => ({ num, title, body, margin })),
    ideas: n.ideas,
    sourcing: n.sourcing,
    risks: n.risks.map(([level, body]) => ({ level, body })),
    sources: n.sources.map(([title, when]) => ({ title, when })),
  };
}
