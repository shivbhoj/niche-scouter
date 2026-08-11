import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { generateMarket } from "@/lib/ai/generate-market";
import { EXAMPLE_MARKETS } from "@/lib/ai/seed-data";

const MAX_QUERY_LENGTH = 200;

function normalize(q: string) {
  const trimmed = q.trim().toLowerCase().slice(0, MAX_QUERY_LENGTH);
  return trimmed || EXAMPLE_MARKETS[0];
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const query = normalize(String(body?.query ?? ""));

  let market = await db.market.findUnique({ where: { query } });

  if (!market) {
    try {
      market = await db.market.create({ data: { query, status: "pending" } });
      void generateMarket(market.id, query);
    } catch (err) {
      // Two requests for the same brand-new topic can race here; `query` is
      // unique, so the loser just reads back the winner's row instead of
      // crashing.
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
        market = await db.market.findUniqueOrThrow({ where: { query } });
      } else {
        throw err;
      }
    }
  } else if (market.status === "error") {
    market = await db.market.update({
      where: { id: market.id },
      data: { status: "pending", errorMsg: null },
    });
    void generateMarket(market.id, query);
  }

  return NextResponse.json({ marketId: market.id, query: market.query, status: market.status });
}
