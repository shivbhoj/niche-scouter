import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";

export async function grantCredits(
  userId: string,
  delta: number,
  reason: string,
  stripeSessionId?: string
) {
  if (stripeSessionId) {
    try {
      await db.$transaction([
        db.user.update({ where: { id: userId }, data: { credits: { increment: delta } } }),
        db.creditTxn.create({ data: { userId, delta, reason, stripeSessionId } }),
      ]);
    } catch (err) {
      // The ledger row's unique stripeSessionId is what makes this safe to
      // call from both the webhook and the redirect-back confirm route:
      // whichever loses the race rolls back without crediting twice.
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") return;
      throw err;
    }
    return;
  }

  await db.$transaction([
    db.user.update({ where: { id: userId }, data: { credits: { increment: delta } } }),
    db.creditTxn.create({ data: { userId, delta, reason } }),
  ]);
}

export type UnlockResult =
  | { ok: true; alreadyOwned: boolean }
  | { ok: false; reason: "no_credits" };

/**
 * Spend one credit to unlock a niche, or report that the user can't.
 *
 * Deliberately avoids wrapping the whole thing in one interactive
 * transaction. SQLite takes a single global write lock, so concurrent
 * long-lived transactions (a user double-clicking "reveal", or opening
 * several reports at once) queue behind each other and blow the
 * transaction timeout — correct, but it surfaces as a 500.
 *
 * Instead the critical section is one atomic conditional UPDATE. The
 * `credits > 0` predicate lives in the WHERE clause, so the database —
 * not application code — decides who gets the last credit, and a loser
 * simply matches zero rows. The follow-up writes are compensated if they
 * fail, so a spent credit is never silently lost.
 */
export async function unlockNiche(userId: string, nicheId: string): Promise<UnlockResult> {
  const owned = await db.unlock.findUnique({
    where: { userId_nicheId: { userId, nicheId } },
  });
  if (owned) return { ok: true, alreadyOwned: true };

  const spent = await db.user.updateMany({
    where: { id: userId, credits: { gt: 0 } },
    data: { credits: { decrement: 1 } },
  });
  if (spent.count === 0) {
    // Out of credits — but a concurrent request for this same niche may
    // have just completed the unlock (a double-click on "reveal"). Owning
    // the report beats reporting a spurious paywall.
    const raced = await db.unlock.findUnique({
      where: { userId_nicheId: { userId, nicheId } },
    });
    if (raced) return { ok: true, alreadyOwned: true };
    return { ok: false, reason: "no_credits" };
  }

  try {
    await db.$transaction([
      db.unlock.create({ data: { userId, nicheId } }),
      db.creditTxn.create({ data: { userId, delta: -1, reason: "spend:unlock" } }),
    ]);
    return { ok: true, alreadyOwned: false };
  } catch (err) {
    // Hand the credit back — the spend above already committed.
    await db.user.update({
      where: { id: userId },
      data: { credits: { increment: 1 } },
    });
    // Two requests for the *same* niche can both get past the ownership
    // check; the unique index means only one creates the row. The loser
    // has been refunded, and the report is genuinely owned either way.
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      return { ok: true, alreadyOwned: true };
    }
    throw err;
  }
}
