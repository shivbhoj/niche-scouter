import { PrismaClient } from "@prisma/client";

// global-setup resolves and exports the throwaway database URL.
const url =
  process.env.TEST_DATABASE_URL ??
  process.env.DATABASE_URL ??
  "postgresql://postgres:devpass@127.0.0.1:5432/nichescouter_test?schema=public";

export const db = new PrismaClient({ datasources: { db: { url } } });

export async function resetDb() {
  // Order matters: children before parents.
  await db.unlock.deleteMany();
  await db.creditTxn.deleteMany();
  await db.niche.deleteMany();
  await db.market.deleteMany();
  await db.user.deleteMany();
}

let seq = 0;

export async function makeUser(credits: number) {
  return db.user.create({
    data: {
      email: `user${seq++}-${Date.now()}@example.com`,
      passwordHash: "not-a-real-hash",
      credits,
    },
  });
}

export async function makeMarketWithNiches(nicheCount: number, query?: string) {
  const market = await db.market.create({
    data: { query: query ?? `topic-${seq++}-${Date.now()}`, status: "ready" },
  });
  const niches = [];
  for (let i = 1; i <= nicheCount; i++) {
    niches.push(
      await db.niche.create({
        data: {
          marketId: market.id,
          rank: i,
          name: `Niche ${i}`,
          teaser: "teaser",
          demand: 50,
          revenue: "$1k/mo",
          revenueNote: "note",
          reportJson: JSON.stringify({ name: `Niche ${i}` }),
        },
      })
    );
  }
  return { market, niches };
}
