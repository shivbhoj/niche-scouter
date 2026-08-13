import Anthropic from "@anthropic-ai/sdk";
import { db } from "@/lib/db";
import { SEED_DATA } from "./seed-data";
import { fromSeed } from "./from-seed";
import { aiMarketSchema, normalizeNiche, MAX_NICHES } from "./schema";
import { extractJson } from "./extract-json";
import type { NicheReportContent } from "@/lib/types";

/**
 * How many times to hand a validation failure back to the model and ask
 * it to correct its own output before giving up. Research runs are slow
 * and billable, so re-prompting with the specific error is far cheaper
 * than discarding the work and starting over.
 */
const MAX_REPAIR_ATTEMPTS = 2;

const MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-5";

/**
 * Live research with web search is slow, but not unbounded — without a
 * ceiling a hung request leaves the market "pending" forever and the
 * client polls it indefinitely.
 */
const GENERATION_TIMEOUT_MS = 3 * 60 * 1000;

/**
 * A market still "pending" after this long has almost certainly lost its
 * generation task (process restart, deploy, crash between the DB write
 * and the AI call finishing). Treat it as retryable rather than letting
 * it hang forever.
 */
export const STALE_PENDING_MS = 5 * 60 * 1000;

const SYSTEM_PROMPT = `You are Niche Scouter's research engine. Given a broad industry or hobby topic, you use live web search to find real, underserved sub-niches within it — small, specific opportunities where demand outpaces the quality or attention of existing sellers/creators/businesses.

For each niche you report on, ground your scoring and evidence in what you actually find through search: real competitor names or types, real keyword-shaped search phrases, plausible pricing and sourcing informed by what's genuinely available. Do not fabricate specific company names you have no basis for — prefer descriptive competitor categories ("Two Etsy makers", "One regional roaster") unless you found a real, named company via search.

Return ONLY a single JSON object (no markdown fences, no commentary before or after) matching exactly this shape:

{
  "niches": [
    {
      "name": string,                          // short niche name
      "teaser": string,                         // one sentence, no jargon
      "demand": number,                         // 1-100
      "revenue": string,                        // e.g. "$14k/mo"
      "revenueNote": string,                    // e.g. "top-quartile store"
      "thesis": string,                         // 1-2 sentences, the core insight
      "metrics": [["Demand","78"],["Competition","31"],["Rev. potential","$14k/mo"],["Confidence","High"]],
      "trend": [12 numbers 0-100, oldest to newest, relative search interest],
      "trendStart": string,                     // e.g. "Sep 2025"
      "trendEnd": string,                       // e.g. "Aug 2026"
      "trendNote": string,                      // e.g. "+118% search interest, 12 mo"
      "audience": string,                       // 2-3 sentences describing the buyer
      "audienceFacts": [["Median spend","$68 / order"],["Repeat rate","2.4 orders / yr"],["Where they are","Reddit, YouTube"]],
      "keywords": [["term","9.4k/mo","KD 11","+64%"], ... 4 rows],
      "competitors": [["Who","Scale","One-sentence gap in what they offer"], ... 3 rows],
      "playbook": [["01","Move title","1-2 sentence tactic","62% margin"], ... exactly 3 rows, numbered 01/02/03],
      "ideas": [6 short product/content idea strings],
      "sourcing": [3 sentences on realistic sourcing/supply/production],
      "risks": [["Low"|"Medium"|"High","1 sentence risk"], ... 3 rows],
      "sources": [["What was checked","today"|"yesterday"|"N days ago"], ... 5 rows]
    }
  ]
}

Return exactly 4 niches, ranked best-first by how underserved and viable they are. All numbers must be realistic and internally consistent (a niche with demand 80+ and competition under 20 is a strong pick; be honest, not uniformly optimistic).`;

function textOf(response: Anthropic.Message): string {
  return response.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("\n");
}

/** Parse + validate + coerce to the layout's shape. */
export function parseMarketResponse(text: string): NicheReportContent[] {
  const parsed = aiMarketSchema.parse(extractJson(text));
  return parsed.niches
    .slice(0, MAX_NICHES)
    .map((n) => fromSeed(normalizeNiche(n)));
}

async function generateViaAi(query: string): Promise<NicheReportContent[]> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY not configured");
  const client = new Anthropic({ apiKey });

  const messages: Anthropic.MessageParam[] = [
    {
      role: "user",
      content: `Broad topic: "${query}"\n\nResearch this live and return the JSON object described in your instructions.`,
    },
  ];

  let lastError: unknown;

  for (let attempt = 0; attempt <= MAX_REPAIR_ATTEMPTS; attempt++) {
    const response = await client.messages.create(
      {
        model: MODEL,
        max_tokens: 8000,
        system: SYSTEM_PROMPT,
        // Only the first pass needs to search; repair turns are purely
        // about reshaping text the model has already produced.
        tools:
          attempt === 0
            ? [{ type: "web_search_20250305", name: "web_search", max_uses: 10 }]
            : [],
        messages,
      },
      { timeout: GENERATION_TIMEOUT_MS }
    );

    const text = textOf(response);
    try {
      return parseMarketResponse(text);
    } catch (err) {
      lastError = err;
      if (attempt === MAX_REPAIR_ATTEMPTS) break;

      // Show the model exactly what was wrong with its own output and
      // ask for a corrected body. Cheaper and far more reliable than
      // throwing away a completed research run.
      console.warn(
        `[generateMarket] attempt ${attempt + 1} failed validation for ${JSON.stringify(query)}; asking model to repair`,
        err instanceof Error ? err.message : err
      );
      messages.push({ role: "assistant", content: text.slice(0, 20000) });
      messages.push({
        role: "user",
        content:
          `That response did not validate: ${err instanceof Error ? err.message : String(err)}\n\n` +
          `Return the corrected JSON object only — no commentary, no markdown fences. ` +
          `Keep the research findings identical; fix only the structure.`,
      });
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error("Model output failed validation");
}

function generateViaSeed(query: string): NicheReportContent[] | null {
  const seed = SEED_DATA[query];
  if (!seed) return null;
  return seed.map((n) => fromSeed(n));
}

/** Raised for problems whose text is safe to show an end user. */
class UserFacingError extends Error {}

export async function generateMarket(marketId: string, query: string) {
  try {
    let niches: NicheReportContent[] | null = null;

    if (process.env.ANTHROPIC_API_KEY) {
      niches = await generateViaAi(query);
    } else {
      niches = generateViaSeed(query);
      if (!niches) {
        throw new UserFacingError(
          "Live search isn't configured on this deployment, so only the example topics are available."
        );
      }
    }

    await db.$transaction([
      ...niches.map((n, i) =>
        db.niche.create({
          data: {
            marketId,
            rank: i + 1,
            name: n.name,
            teaser: n.teaser,
            demand: n.demand,
            revenue: n.revenue,
            revenueNote: n.revenueNote,
            reportJson: JSON.stringify(n),
          },
        })
      ),
      db.market.update({ where: { id: marketId }, data: { status: "ready" } }),
    ]);
  } catch (err) {
    // `errorMsg` is served to anonymous clients by /api/search/status, so
    // only deliberately-written copy goes in it. Raw provider errors and
    // Zod parse dumps can carry request details and internal shape, so
    // they stay in the server log.
    console.error(`[generateMarket] failed for query=${JSON.stringify(query)}`, err);
    await db.market.update({
      where: { id: marketId },
      data: {
        status: "error",
        errorMsg:
          err instanceof UserFacingError
            ? err.message
            : "We couldn't finish scouting this market. Try again in a moment.",
      },
    });
  }
}
