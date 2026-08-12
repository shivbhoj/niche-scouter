import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { generateMarket, STALE_PENDING_MS } from "@/lib/ai/generate-market";
import { searchLimiter, clientKey } from "@/lib/rate-limit";
import { normalizeQuery } from "@/lib/normalize-query";

function tooManyRequests(retryAfter: number) {
  return NextResponse.json(
    {
      error:
        "You've hit the limit for new market scouts. Previously scouted topics still work — try again shortly.",
    },
    { status: 429, headers: { "Retry-After": String(retryAfter) } }
  );
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const query = normalizeQuery(String(body?.query ?? ""));

  const existing = await db.market.findUnique({ where: { query } });

  // A market still "pending" long past any plausible generation time has
  // lost its worker (restart/deploy/crash); re-run it rather than handing
  // the client a row that will never resolve.
  const stalePending =
    existing?.status === "pending" &&
    Date.now() - existing.updatedAt.getTime() > STALE_PENDING_MS;

  // Serving an already-scouted market is a plain DB read, so it stays
  // free and unmetered — "searching is always free" in the pricing copy.
  // Only the paths below that kick off a *new* generation spend money on
  // the AI provider, so only those are rate limited.
  if (existing && existing.status !== "error" && !stalePending) {
    return NextResponse.json({
      marketId: existing.id,
      query: existing.query,
      status: existing.status,
    });
  }

  const session = await auth();
  const key = session?.user?.id ? `user:${session.user.id}` : `ip:${clientKey(req)}`;
  const limit = searchLimiter.check(key);
  if (!limit.ok) return tooManyRequests(limit.retryAfter);

  if (existing) {
    const retried = await db.market.update({
      where: { id: existing.id },
      data: { status: "pending", errorMsg: null },
    });
    void generateMarket(retried.id, query);
    return NextResponse.json({
      marketId: retried.id,
      query: retried.query,
      status: retried.status,
    });
  }

  try {
    const created = await db.market.create({ data: { query, status: "pending" } });
    void generateMarket(created.id, query);
    return NextResponse.json({
      marketId: created.id,
      query: created.query,
      status: created.status,
    });
  } catch (err) {
    // Two requests for the same brand-new topic can race here; `query` is
    // unique, so the loser just reads back the winner's row.
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      const winner = await db.market.findUniqueOrThrow({ where: { query } });
      return NextResponse.json({
        marketId: winner.id,
        query: winner.query,
        status: winner.status,
      });
    }
    throw err;
  }
}
