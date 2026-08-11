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
  const existing = await db.unlock.findUnique({
    where: { userId_nicheId: { userId, nicheId } },
  });
  if (existing) return { ok: true, alreadyOwned: true };

  const user = await db.user.findUniqueOrThrow({ where: { id: userId } });
  if (user.credits <= 0) return { ok: false, reason: "no_credits" };

  await db.$transaction([
    db.user.update({ where: { id: userId }, data: { credits: { decrement: 1 } } }),
    db.creditTxn.create({ data: { userId, delta: -1, reason: "spend:unlock" } }),
    db.unlock.create({ data: { userId, nicheId } }),
  ]);
  return { ok: true, alreadyOwned: false };
}
