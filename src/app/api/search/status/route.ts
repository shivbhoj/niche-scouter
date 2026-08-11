import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const marketId = req.nextUrl.searchParams.get("marketId");
  if (!marketId) return NextResponse.json({ error: "marketId required" }, { status: 400 });

  const market = await db.market.findUnique({
    where: { id: marketId },
    include: { niches: { orderBy: { rank: "asc" } } },
  });
  if (!market) return NextResponse.json({ error: "not found" }, { status: 404 });

  const session = await auth();
  const userId = session?.user?.id;
  const owned = userId
    ? new Set(
        (
          await db.unlock.findMany({
            where: { userId, niche: { marketId } },
            select: { nicheId: true },
          })
        ).map((u) => u.nicheId)
      )
    : new Set<string>();

  return NextResponse.json({
    status: market.status,
    query: market.query,
    errorMsg: market.errorMsg,
    niches: market.niches.map((n) => ({
      id: n.id,
      rank: n.rank,
      name: n.name,
      teaser: n.teaser,
      demand: n.demand,
      revenue: n.revenue,
      revenueNote: n.revenueNote,
      owned: owned.has(n.id),
    })),
  });
}
