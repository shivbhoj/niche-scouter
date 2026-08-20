export interface NicheTeaser {
  id: string;
  rank: number;
  name: string;
  teaser: string;
  demand: number;
  gapScore: number;
  revenue: string;
  revenueNote: string;
}

/**
 * A neighbouring market the findings in *this* report also point at.
 * `linkedFinding` is what keeps the suggestion honest — it has to quote
 * the specific thing in this report that makes the adjacency plausible,
 * otherwise it is a generic guess wearing a citation.
 */
export interface Adjacency {
  industry: string;
  reason: string;
  linkedFinding: string;
}

export interface NicheReport extends NicheTeaser {
  adjacency: Adjacency[];
  thesis: string;
  metrics: { label: string; value: string }[];
  trend: number[];
  trendStart: string;
  trendEnd: string;
  trendNote: string;
  audience: string;
  audienceFacts: { k: string; v: string }[];
  keywords: { term: string; vol: string; kd: string; growth: string }[];
  competitors: { name: string; scale: string; gap: string }[];
  playbook: { num: string; title: string; body: string; margin: string }[];
  ideas: string[];
  sourcing: string[];
  risks: { level: string; body: string }[];
  sources: { title: string; when: string }[];
}

// The part of a NicheReport the AI (or seed data) is responsible for
// producing, before we attach db id/rank.
export type NicheReportContent = Omit<NicheReport, "id" | "rank">;

// Shape shared by both the bundled seed data and AI-generated output:
// most fields are [string, string, ...] tuples rather than objects,
// since that's far cheaper for a model to emit correctly than nested
// objects with repeated keys.
export interface TupleNiche {
  name: string;
  teaser: string;
  demand: number;
  gapScore: number;
  adjacency: [string, string, string][];
  revenue: string;
  revenueNote: string;
  thesis: string;
  metrics: [string, string][];
  trend: number[];
  trendStart: string;
  trendEnd: string;
  trendNote: string;
  audience: string;
  audienceFacts: [string, string][];
  keywords: [string, string, string, string][];
  competitors: [string, string, string][];
  playbook: [string, string, string, string][];
  ideas: string[];
  sourcing: string[];
  risks: [string, string][];
  sources: [string, string][];
}
