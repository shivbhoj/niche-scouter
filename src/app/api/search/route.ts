import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { generateMarket } from "@/lib/ai/generate-market";
import { EXAMPLE_MARKETS } from "@/lib/ai/seed-data";

function normalize(q: string) {
  const trimmed = q.trim().toLowerCase();
  return trimmed || EXAMPLE_MARKETS[0];
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const query = normalize(String(body?.query ?? ""));

  let market = await db.market.findUnique({ where: { query } });

  if (!market) {
    market = await db.market.create({ data: { query, status: "pending" } });
    void generateMarket(market.id, query);
  } else if (market.status === "error") {
    market = await db.market.update({
      where: { id: market.id },
      data: { status: "pending", errorMsg: null },
    });
    void generateMarket(market.id, query);
  }

  return NextResponse.json({ marketId: market.id, query: market.query, status: market.status });
}
