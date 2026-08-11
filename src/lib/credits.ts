import { db } from "@/lib/db";

export async function grantCredits(
  userId: string,
  delta: number,
  reason: string,
  stripeSessionId?: string
) {
  if (stripeSessionId) {
    const existing = await db.creditTxn.findUnique({ where: { stripeSessionId } });
    if (existing) return; // already granted for this checkout session
  }
  await db.$transaction([
    db.user.update({ where: { id: userId }, data: { credits: { increment: delta } } }),
    db.creditTxn.create({ data: { userId, delta, reason, stripeSessionId } }),
  ]);
}

export type UnlockResult =
  | { ok: true; alreadyOwned: boolean }
  | { ok: false; reason: "no_credits" };

export async function unlockNiche(userId: string, nicheId: string): Promise<UnlockResult> {
  return db.$transaction(async (tx) => {
    const existing = await tx.unlock.findUnique({
      where: { userId_nicheId: { userId, nicheId } },
    });
    if (existing) return { ok: true, alreadyOwned: true };

    // Guard the decrement with credits > 0 in the same conditional update so
    // concurrent unlocks of *different* niches can't both pass a stale read
    // and drive the balance negative — SQLite serializes writers, so the
    // second transaction's updateMany sees the first's committed decrement
    // and correctly reports zero rows affected.
    const spent = await tx.user.updateMany({
      where: { id: userId, credits: { gt: 0 } },
      data: { credits: { decrement: 1 } },
    });
    if (spent.count === 0) return { ok: false, reason: "no_credits" };

    await tx.creditTxn.create({ data: { userId, delta: -1, reason: "spend:unlock" } });
    await tx.unlock.create({ data: { userId, nicheId } });
    return { ok: true, alreadyOwned: false };
  });
}
