import Anthropic from "@anthropic-ai/sdk";
import { db } from "@/lib/db";
import { SEED_DATA } from "./seed-data";
import { fromSeed } from "./from-seed";
import { aiMarketSchema } from "./schema";
import type { NicheReportContent } from "@/lib/types";

const MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-5";

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

function extractJson(text: string): unknown {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenced ? fenced[1] : text;
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("No JSON object found in model output");
  return JSON.parse(candidate.slice(start, end + 1));
}

async function generateViaAi(query: string): Promise<NicheReportContent[]> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY not configured");
  const client = new Anthropic({ apiKey });

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 8000,
    system: SYSTEM_PROMPT,
    tools: [{ type: "web_search_20250305", name: "web_search", max_uses: 10 }],
    messages: [
      {
        role: "user",
        content: `Broad topic: "${query}"\n\nResearch this live and return the JSON object described in your instructions.`,
      },
    ],
  });

  const text = response.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("\n");

  const parsed = aiMarketSchema.parse(extractJson(text));
  return parsed.niches.map((n) => fromSeed(n));
}

function generateViaSeed(query: string): NicheReportContent[] | null {
  const seed = SEED_DATA[query];
  if (!seed) return null;
  return seed.map((n) => fromSeed(n));
}

export async function generateMarket(marketId: string, query: string) {
  try {
    let niches: NicheReportContent[] | null = null;

    if (process.env.ANTHROPIC_API_KEY) {
      niches = await generateViaAi(query);
    } else {
      niches = generateViaSeed(query);
      if (!niches) {
        throw new Error(
          "Live search needs ANTHROPIC_API_KEY. Set it in .env, or try one of the example topics on the homepage."
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
    await db.market.update({
      where: { id: marketId },
      data: { status: "error", errorMsg: err instanceof Error ? err.message : String(err) },
    });
  }
}
