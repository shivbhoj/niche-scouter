import { z } from "zod";

/**
 * Parsing contract for model output.
 *
 * Deliberately more permissive than the layout needs. An earlier version
 * demanded exact counts (precisely 4 metrics, 12 trend points, 3 playbook
 * rows) and threw away an entire otherwise-good research run because the
 * model returned five keywords instead of four. Accept a reasonable range
 * here, then coerce to the layout's shape in `normalizeNiche`.
 */

/**
 * A display string, tolerating a bare number.
 *
 * Every tuple position here is rendered as text (a keyword volume, a
 * difficulty score, a margin), and models intermittently emit `11` where
 * the shape asks for `"KD 11"`. Accepting the number and stringifying it
 * is free; re-prompting to fix it costs a whole research round-trip.
 * Deliberately a narrow union rather than `z.coerce.string()`, which
 * would happily turn `null` into `"null"`.
 */
const text = z.union([z.string(), z.number().transform(String)]);

const pair = z.tuple([text, text]);
const triple = z.tuple([text, text, text]);
const quad = z.tuple([text, text, text, text]);

// Models sometimes emit "78" rather than 78 for a score.
const score = z.coerce.number().min(0).max(100);

/**
 * A list-of-strings field, tolerating a bare string.
 *
 * Observed on the first live run: one niche returned `sourcing` as a
 * single string rather than an array, which failed validation and cost a
 * whole extra research round-trip to repair. Accepting the singular form
 * is strictly cheaper than re-prompting for it, and loses nothing — the
 * value is wrapped, never split or reinterpreted.
 */
const stringList = (min: number, max: number) =>
  z.preprocess(
    (v) => (typeof v === "string" ? [v] : v),
    z.array(z.string()).min(min).max(max)
  );

export const aiNicheSchema = z.object({
  name: z.string().min(1),
  teaser: z.string().min(1),
  demand: score,
  gapScore: z.coerce.number().min(1).max(10),
  // [industry, reason, linkedFinding]
  adjacency: z.array(triple).min(1).max(5),
  revenue: z.string().min(1),
  revenueNote: z.string().default(""),
  thesis: z.string().min(1),
  metrics: z.array(pair).min(1).max(8),
  trend: z.array(z.coerce.number()).min(4).max(36),
  trendStart: z.string().default(""),
  trendEnd: z.string().default(""),
  trendNote: z.string().default(""),
  audience: z.string().min(1),
  audienceFacts: z.array(pair).min(1).max(6),
  keywords: z.array(quad).min(1).max(10),
  competitors: z.array(triple).min(1).max(8),
  playbook: z.array(quad).min(1).max(6),
  ideas: stringList(1, 12),
  sourcing: stringList(1, 8),
  risks: z.array(pair).min(1).max(8),
  sources: z.array(pair).min(1).max(12),
});

export const aiMarketSchema = z.object({
  niches: z.array(aiNicheSchema).min(1).max(8),
});

export type AiNiche = z.infer<typeof aiNicheSchema>;

/** Counts the report layout is built around. */
const TREND_POINTS = 12;
const MAX_METRICS = 4;
const MAX_AUDIENCE_FACTS = 3;
const MAX_KEYWORDS = 4;
const MAX_COMPETITORS = 3;
const MAX_PLAYBOOK = 3;
const MAX_IDEAS = 6;
const MAX_SOURCING = 3;
const MAX_RISKS = 3;
const MAX_SOURCES = 5;
/** The spec calls for exactly three adjacency cards. */
const MAX_ADJACENCY = 3;
export const MAX_NICHES = 4;

/**
 * Resample an arbitrary-length series onto exactly TREND_POINTS, so the
 * bar chart always renders a full row regardless of how many months the
 * model reported.
 */
function resampleTrend(values: number[]): number[] {
  if (values.length === TREND_POINTS) return values;
  const out: number[] = [];
  for (let i = 0; i < TREND_POINTS; i++) {
    const pos = (i * (values.length - 1)) / (TREND_POINTS - 1);
    const lo = Math.floor(pos);
    const hi = Math.min(values.length - 1, lo + 1);
    const t = pos - lo;
    out.push(Math.round(values[lo] * (1 - t) + values[hi] * t));
  }
  return out;
}

/**
 * Coerce validated model output into the exact shape the report layout
 * expects. Only ever trims or derives from data the model actually
 * returned — it never invents filler, because a fabricated row in a paid
 * research report is worse than a short one.
 */
export function normalizeNiche(n: AiNiche) {
  const metrics = n.metrics.slice(0, MAX_METRICS);
  // The header strip reads best with a Demand and a revenue figure; both
  // are already known from the niche itself, so backfill from those
  // rather than leaving the strip sparse.
  if (!metrics.some(([label]) => /demand/i.test(label))) {
    metrics.unshift(["Demand", String(Math.round(n.demand))]);
  }
  if (!metrics.some(([label]) => /rev/i.test(label))) {
    metrics.push(["Rev. potential", n.revenue]);
  }

  return {
    ...n,
    demand: Math.round(n.demand),
    gapScore: Math.min(10, Math.max(1, Math.round(n.gapScore))),
    adjacency: n.adjacency.slice(0, MAX_ADJACENCY),
    metrics: metrics.slice(0, MAX_METRICS),
    trend: resampleTrend(n.trend),
    audienceFacts: n.audienceFacts.slice(0, MAX_AUDIENCE_FACTS),
    keywords: n.keywords.slice(0, MAX_KEYWORDS),
    competitors: n.competitors.slice(0, MAX_COMPETITORS),
    // Renumber so the "01 / 02 / 03" column is always sequential even if
    // the model numbered them oddly or not at all.
    playbook: n.playbook
      .slice(0, MAX_PLAYBOOK)
      .map(([, title, body, margin], i) => [
        String(i + 1).padStart(2, "0"),
        title,
        body,
        margin,
      ]) as [string, string, string, string][],
    ideas: n.ideas.slice(0, MAX_IDEAS),
    sourcing: n.sourcing.slice(0, MAX_SOURCING),
    risks: n.risks.slice(0, MAX_RISKS),
    sources: n.sources.slice(0, MAX_SOURCES),
  };
}
