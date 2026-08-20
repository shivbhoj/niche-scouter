import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { eventLimiter, clientKey } from "@/lib/rate-limit";

/**
 * Funnel telemetry sink.
 *
 * Deliberately minimal and deliberately untrusted: this endpoint is
 * reachable by anyone, so it only ever records a name from a fixed
 * allowlist plus a small bounded blob. Nothing here is used for
 * authorization or billing — it exists so the launch decision rules
 * (reports-per-buyer, adjacency click rate) can be answered with data
 * instead of a guess.
 */
const ALLOWED = new Set(["adjacency_click", "report_opened", "search_started"]);

const MAX_META_CHARS = 500;

export async function POST(req: NextRequest) {
  // Cheap write, but still an open endpoint — cap it so it can't be used
  // to flood the table.
  const limit = eventLimiter.check(`event:${clientKey(req)}`);
  if (!limit.ok) {
    return NextResponse.json({ ok: false }, { status: 429 });
  }

  const body = await req.json().catch(() => ({}));
  const name = String(body?.name ?? "");
  if (!ALLOWED.has(name)) {
    return NextResponse.json({ error: "unknown event" }, { status: 400 });
  }

  let meta: string | null = null;
  if (body?.meta !== undefined) {
    try {
      meta = JSON.stringify(body.meta).slice(0, MAX_META_CHARS);
    } catch {
      meta = null;
    }
  }

  const session = await auth();
  await db.event.create({
    data: { name, meta, userId: session?.user?.id ?? null },
  });

  return NextResponse.json({ ok: true });
}
