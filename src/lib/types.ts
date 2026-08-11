export interface NicheTeaser {
  id: string;
  rank: number;
  name: string;
  teaser: string;
  demand: number;
  revenue: string;
  revenueNote: string;
}

export interface NicheReport extends NicheTeaser {
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
