/**
 * Live validation for the AI research path.
 *
 * Run this once against a real ANTHROPIC_API_KEY before trusting the
 * feature: it exercises the generate → search → parse → normalize
 * pipeline end to end on several topics, reports the true cost per
 * market, and prints a sample report so a human can judge whether the
 * research is worth what the app charges for it.
 *
 *   npx tsx scripts/validate-ai.ts
 *   npx tsx scripts/validate-ai.ts "vintage synthesizers" "mushroom farming"
 */
import "dotenv/config";
import { MODEL } from "../src/lib/ai/generate-market";
import { estimateCostUsd, MODEL_RATES } from "../src/lib/ai/cost";

const DEFAULT_TOPICS = [
  "home coffee equipment",
  "urban beekeeping",
  "tabletop miniature painting",
];

const PRICE_PER_REPORT = { cheapest: 2.5, single: 5 };

async function main() {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error("ANTHROPIC_API_KEY is not set — add it to .env first.");
    process.exit(1);
  }

  const topics = process.argv.slice(2).length ? process.argv.slice(2) : DEFAULT_TOPICS;
  console.log(`Model: ${MODEL}`);
  if (!MODEL_RATES[MODEL]) {
    console.log("(no published rate on file for this model — cost will be omitted)");
  }
  console.log(`Topics: ${topics.join(", ")}\n`);

  const { researchMarket } = await import("../src/lib/ai/generate-market");

  let totalCost = 0;
  let ok = 0;

  for (const topic of topics) {
    const started = Date.now();
    process.stdout.write(`── ${topic}\n`);
    try {
      const { niches, usage } = await researchMarket(topic);
      const seconds = ((Date.now() - started) / 1000).toFixed(0);
      const cost = estimateCostUsd(usage, MODEL);
      if (cost !== null) totalCost += cost;
      ok++;

      console.log(`   ${niches.length} niches in ${seconds}s`);
      console.log(
        `   ${usage.apiCalls} calls · ${usage.inputTokens.toLocaleString()} in · ` +
          `${usage.outputTokens.toLocaleString()} out · ${usage.webSearches} searches` +
          (cost !== null ? ` · $${cost.toFixed(4)}` : "")
      );
      for (const n of niches) {
        console.log(`   • ${n.name} — demand ${n.demand}, ${n.revenue}`);
      }
      // Print one full report so the research quality is actually visible.
      if (topic === topics[0]) {
        console.log("\n   ── sample report (first niche) ──");
        const r = niches[0];
        console.log(`   thesis: ${r.thesis}`);
        console.log(`   audience: ${r.audience}`);
        console.log(`   keywords: ${r.keywords.map((k) => `${k.term} (${k.vol})`).join(", ")}`);
        console.log(`   competitors: ${r.competitors.map((c) => c.name).join(", ")}`);
        console.log(`   sources: ${r.sources.map((s) => s.title).join("; ")}`);
        console.log("");
      }
    } catch (err) {
      console.error(`   FAILED: ${err instanceof Error ? err.message : err}`);
    }
  }

  if (ok === 0) {
    console.error("\nAll topics failed.");
    process.exit(1);
  }

  const avg = totalCost / ok;
  console.log(`\n${"=".repeat(60)}`);
  console.log(`${ok}/${topics.length} topics succeeded`);
  if (totalCost > 0) {
    console.log(`Average cost per market: $${avg.toFixed(4)} (produces ~4 sellable reports)`);
    console.log(`Average cost per report: $${(avg / 4).toFixed(4)}`);
    console.log(
      `Margin at $${PRICE_PER_REPORT.cheapest.toFixed(2)}/report (12-pack): ` +
        `${(((PRICE_PER_REPORT.cheapest - avg / 4) / PRICE_PER_REPORT.cheapest) * 100).toFixed(1)}%`
    );
    console.log(
      `Worst case — a market generated but no report ever bought: -$${avg.toFixed(4)}`
    );
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
