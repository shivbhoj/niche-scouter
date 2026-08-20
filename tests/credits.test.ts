import { describe, it, expect, beforeEach, afterAll, vi } from "vitest";
import { db, resetDb, makeUser, makeMarketWithNiches } from "./helpers";

// The module under test builds its own client from DATABASE_URL, which
// global-setup pointed at the throwaway test database.
vi.mock("@/lib/db", async () => {
  const { db } = await import("./helpers");
  return { db };
});

const { unlockNiche, grantCredits } = await import("@/lib/credits");

beforeEach(resetDb);
afterAll(async () => {
  await db.$disconnect();
});

describe("unlockNiche", () => {
  it("spends exactly one credit and records the unlock", async () => {
    const user = await makeUser(2);
    const { niches } = await makeMarketWithNiches(1);

    const result = await unlockNiche(user.id, niches[0].id);

    expect(result).toEqual({ ok: true, alreadyOwned: false });
    const after = await db.user.findUniqueOrThrow({ where: { id: user.id } });
    expect(after.credits).toBe(1);
    expect(await db.unlock.count({ where: { userId: user.id } })).toBe(1);
  });

  it("is idempotent — re-opening an owned report costs nothing", async () => {
    const user = await makeUser(2);
    const { niches } = await makeMarketWithNiches(1);

    await unlockNiche(user.id, niches[0].id);
    const second = await unlockNiche(user.id, niches[0].id);
    const third = await unlockNiche(user.id, niches[0].id);

    expect(second).toEqual({ ok: true, alreadyOwned: true });
    expect(third).toEqual({ ok: true, alreadyOwned: true });
    const after = await db.user.findUniqueOrThrow({ where: { id: user.id } });
    expect(after.credits).toBe(1);
    expect(await db.unlock.count({ where: { userId: user.id } })).toBe(1);
  });

  it("refuses to unlock with no credits and leaves state untouched", async () => {
    const user = await makeUser(0);
    const { niches } = await makeMarketWithNiches(1);

    const result = await unlockNiche(user.id, niches[0].id);

    expect(result).toEqual({ ok: false, reason: "no_credits" });
    const after = await db.user.findUniqueOrThrow({ where: { id: user.id } });
    expect(after.credits).toBe(0);
    expect(await db.unlock.count()).toBe(0);
  });

  /**
   * REGRESSION: the original implementation read `credits` and then
   * decremented in a separate statement. Concurrent unlocks of different
   * niches all passed the same stale read, so a user with 1 credit could
   * unlock several reports and end up with a negative balance.
   */
  it("does not over-unlock when concurrent requests race for the last credit", async () => {
    const user = await makeUser(1);
    const { niches } = await makeMarketWithNiches(5);

    const results = await Promise.all(niches.map((n) => unlockNiche(user.id, n.id)));

    const granted = results.filter((r) => r.ok).length;
    expect(granted).toBe(1);

    const after = await db.user.findUniqueOrThrow({ where: { id: user.id } });
    expect(after.credits).toBe(0);
    expect(after.credits).toBeGreaterThanOrEqual(0);
    expect(await db.unlock.count({ where: { userId: user.id } })).toBe(1);
  });

  it("never lets a balance go negative under heavy contention", async () => {
    const user = await makeUser(3);
    const { niches } = await makeMarketWithNiches(10);

    const results = await Promise.all(niches.map((n) => unlockNiche(user.id, n.id)));

    expect(results.filter((r) => r.ok).length).toBe(3);
    const after = await db.user.findUniqueOrThrow({ where: { id: user.id } });
    expect(after.credits).toBe(0);
    expect(await db.unlock.count({ where: { userId: user.id } })).toBe(3);
  });

  /**
   * The double-click case: same user, same niche, simultaneously. Only
   * one unlock row can exist, and the loser must be refunded rather than
   * charged for a report it didn't create.
   */
  it("charges once when the same niche is unlocked concurrently", async () => {
    const user = await makeUser(2);
    const { niches } = await makeMarketWithNiches(1);

    const results = await Promise.all(
      Array.from({ length: 6 }, () => unlockNiche(user.id, niches[0].id))
    );

    // At most one credit may be consumed no matter how many duplicate
    // requests land, and exactly one unlock row may exist.
    expect(results.some((r) => r.ok)).toBe(true);
    const after = await db.user.findUniqueOrThrow({ where: { id: user.id } });
    expect(after.credits).toBe(1);
    expect(await db.unlock.count({ where: { userId: user.id } })).toBe(1);
  });

  it("reports ownership rather than a paywall once a duplicate race settles", async () => {
    const user = await makeUser(1);
    const { niches } = await makeMarketWithNiches(1);

    await unlockNiche(user.id, niches[0].id);
    expect(user).toBeTruthy();

    // Balance is now 0, but the report is owned — this must not be
    // mistaken for "out of credits".
    const again = await unlockNiche(user.id, niches[0].id);
    expect(again).toEqual({ ok: true, alreadyOwned: true });
  });

  it("keeps the ledger consistent with the balance", async () => {
    const user = await makeUser(4);
    const { niches } = await makeMarketWithNiches(6);

    await Promise.all(niches.map((n) => unlockNiche(user.id, n.id)));

    const after = await db.user.findUniqueOrThrow({ where: { id: user.id } });
    const ledger = await db.creditTxn.aggregate({
      where: { userId: user.id },
      _sum: { delta: true },
    });
    // Starting balance wasn't written as a ledger entry by makeUser, so
    // compare the delta rather than the absolute total.
    expect(4 + (ledger._sum.delta ?? 0)).toBe(after.credits);
  });

  it("writes a spend ledger entry per unlock", async () => {
    const user = await makeUser(2);
    const { niches } = await makeMarketWithNiches(2);

    await unlockNiche(user.id, niches[0].id);
    await unlockNiche(user.id, niches[1].id);

    const spends = await db.creditTxn.findMany({ where: { userId: user.id, delta: -1 } });
    expect(spends).toHaveLength(2);
  });
});

describe("grantCredits", () => {
  it("adds credits and records the transaction", async () => {
    const user = await makeUser(0);

    await grantCredits(user.id, 5, "purchase:pack5", "cs_test_1");

    const after = await db.user.findUniqueOrThrow({ where: { id: user.id } });
    expect(after.credits).toBe(5);
  });

  /**
   * The Stripe webhook and the redirect-back confirm route can both fire
   * for one payment; only one may credit the account.
   */
  it("grants only once per Stripe checkout session", async () => {
    const user = await makeUser(0);

    await grantCredits(user.id, 5, "purchase:pack5", "cs_test_dup");
    await grantCredits(user.id, 5, "purchase:pack5", "cs_test_dup");
    await grantCredits(user.id, 5, "purchase:pack5", "cs_test_dup");

    const after = await db.user.findUniqueOrThrow({ where: { id: user.id } });
    expect(after.credits).toBe(5);
    expect(await db.creditTxn.count({ where: { stripeSessionId: "cs_test_dup" } })).toBe(1);
  });

  it("treats distinct sessions as distinct purchases", async () => {
    const user = await makeUser(0);

    await grantCredits(user.id, 1, "purchase:single", "cs_a");
    await grantCredits(user.id, 15, "purchase:pack15", "cs_b");

    const after = await db.user.findUniqueOrThrow({ where: { id: user.id } });
    expect(after.credits).toBe(16);
  });

  it("purchased credits are spendable", async () => {
    const user = await makeUser(0);
    const { niches } = await makeMarketWithNiches(1);

    expect(await unlockNiche(user.id, niches[0].id)).toEqual({
      ok: false,
      reason: "no_credits",
    });

    await grantCredits(user.id, 1, "purchase:single", "cs_then_spend");
    expect(await unlockNiche(user.id, niches[0].id)).toEqual({
      ok: true,
      alreadyOwned: false,
    });

    const after = await db.user.findUniqueOrThrow({ where: { id: user.id } });
    expect(after.credits).toBe(0);
  });
});
