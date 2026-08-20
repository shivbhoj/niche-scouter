/**
 * Funnel metrics for the launch decision rules.
 *
 *   npx tsx scripts/metrics.ts
 *
 * The headline number is reports-per-buyer. The plan says: do not scale
 * ad spend until it clears 2.5. Everything else here is diagnostic for
 * *why* it isn't clearing.
 */
import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

const THRESHOLDS = {
  reportsPerBuyer: { healthy: 3, floor: 2.5 },
  freeToPaidPct: { healthy: 8 },
  adjacencyClickPct: { healthy: 20 },
};

function verdict(value: number | null, healthy: number, floor?: number) {
  if (value === null) return "no data yet";
  if (value >= healthy) return "healthy";
  if (floor !== undefined && value >= floor) return "below target";
  return "ACTION NEEDED";
}

function pct(n: number, d: number) {
  return d === 0 ? null : (n / d) * 100;
}

async function main() {
  const [users, buyers, unlocks, adjacencyClicks, reportsOpened] = await Promise.all([
    db.user.count(),
    // A buyer is anyone with at least one positive credit purchase —
    // the signup bonus is not a purchase.
    db.creditTxn.findMany({
      where: { reason: { startsWith: "purchase:" } },
      select: { userId: true },
      distinct: ["userId"],
    }),
    db.unlock.count(),
    db.event.count({ where: { name: "adjacency_click" } }),
    db.event.count({ where: { name: "report_opened" } }),
  ]);

  const buyerIds = buyers.map((b) => b.userId);
  const unlocksByBuyers = buyerIds.length
    ? await db.unlock.count({ where: { userId: { in: buyerIds } } })
    : 0;

  const reportsPerBuyer = buyerIds.length ? unlocksByBuyers / buyerIds.length : null;
  const freeToPaid = pct(buyerIds.length, users);
  // Denominator is reports opened, since that is when the block is seen.
  const adjacencyRate = pct(adjacencyClicks, reportsOpened);

  const rows: [string, string, string][] = [
    [
      "Reports per buyer",
      reportsPerBuyer === null ? "—" : reportsPerBuyer.toFixed(2),
      verdict(reportsPerBuyer, THRESHOLDS.reportsPerBuyer.healthy, THRESHOLDS.reportsPerBuyer.floor),
    ],
    [
      "Free → paid conversion",
      freeToPaid === null ? "—" : `${freeToPaid.toFixed(1)}%`,
      verdict(freeToPaid, THRESHOLDS.freeToPaidPct.healthy),
    ],
    [
      "Adjacency click rate",
      adjacencyRate === null ? "—" : `${adjacencyRate.toFixed(1)}%`,
      verdict(adjacencyRate, THRESHOLDS.adjacencyClickPct.healthy),
    ],
  ];

  console.log("\nNiche Scouter — funnel\n" + "=".repeat(52));
  for (const [label, value, state] of rows) {
    console.log(`${label.padEnd(26)} ${value.padStart(8)}   ${state}`);
  }

  console.log("\nRaw counts");
  console.log(`  accounts ${users} · buyers ${buyerIds.length} · reports unlocked ${unlocks}`);
  console.log(`  reports opened ${reportsOpened} · adjacency clicks ${adjacencyClicks}`);

  console.log("\nDecision");
  if (reportsPerBuyer === null) {
    console.log("  No purchases yet — nothing to decide on. Do not scale spend on zero data.");
  } else if (reportsPerBuyer < THRESHOLDS.reportsPerBuyer.floor) {
    console.log(
      `  Reports per buyer is ${reportsPerBuyer.toFixed(2)}, under the 2.5 floor.\n` +
        "  HOLD ad spend and fix the loop — more traffic into a leaky loop just costs more."
    );
  } else {
    console.log(`  Reports per buyer is ${reportsPerBuyer.toFixed(2)} — clear to scale carefully.`);
  }
  console.log("");
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
