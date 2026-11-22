import { Prisma } from "@prisma/client";
import { SEED_DATA } from "./ai/seed-data";
import { fromSeed } from "./ai/from-seed";

interface UserRecord {
  id: string;
  email: string;
  passwordHash: string;
  credits: number;
  createdAt: Date;
}

interface MarketRecord {
  id: string;
  query: string;
  status: string;
  errorMsg: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface NicheRecord {
  id: string;
  marketId: string;
  rank: number;
  name: string;
  teaser: string;
  demand: number;
  revenue: string;
  revenueNote: string;
  reportJson: string;
}

interface UnlockRecord {
  id: string;
  userId: string;
  nicheId: string;
  createdAt: Date;
}

interface CreditTxnRecord {
  id: string;
  userId: string;
  delta: number;
  reason: string;
  stripeSessionId: string | null;
  createdAt: Date;
}

function makeId(prefix: string) {
  return `${prefix}_${Math.random().toString(36).substring(2, 9)}_${Date.now().toString(36)}`;
}

class InMemoryDatabase {
  users: Map<string, UserRecord> = new Map();
  markets: Map<string, MarketRecord> = new Map();
  niches: Map<string, NicheRecord> = new Map();
  unlocks: Map<string, UnlockRecord> = new Map();
  creditTxns: Map<string, CreditTxnRecord> = new Map();

  constructor() {
    this.seed();
  }

  private seed() {
    // Pre-seed example markets from seed-data
    for (const [query, rawNiches] of Object.entries(SEED_DATA)) {
      const marketId = `market_${query.replace(/[^a-z0-9]/gi, "_").toLowerCase()}`;
      const now = new Date();
      this.markets.set(marketId, {
        id: marketId,
        query,
        status: "ready",
        errorMsg: null,
        createdAt: now,
        updatedAt: now,
      });

      rawNiches.forEach((rn, idx) => {
        const rank = idx + 1;
        const nicheId = `niche_${marketId}_${rank}`;
        const content = fromSeed(rn);
        this.niches.set(nicheId, {
          id: nicheId,
          marketId,
          rank,
          name: rn.name,
          teaser: rn.teaser,
          demand: rn.demand,
          revenue: rn.revenue,
          revenueNote: rn.revenueNote,
          reportJson: JSON.stringify(content),
        });
      });
    }
  }

  user = {
    findUnique: async (args: { where: { id?: string; email?: string } }) => {
      if (args.where.id) {
        return this.users.get(args.where.id) ?? null;
      }
      if (args.where.email) {
        for (const u of this.users.values()) {
          if (u.email.toLowerCase() === args.where.email.toLowerCase()) {
            return { ...u };
          }
        }
      }
      return null;
    },
    create: async (args: {
      data: {
        email: string;
        passwordHash: string;
        credits?: number;
        creditTxns?: { create: { delta: number; reason: string } };
      };
    }) => {
      for (const u of this.users.values()) {
        if (u.email.toLowerCase() === args.data.email.toLowerCase()) {
          throw new Prisma.PrismaClientKnownRequestError("Unique constraint failed on the fields: (`email`)", {
            code: "P2002",
            clientVersion: "6.19.3",
          });
        }
      }
      const id = makeId("user");
      const user: UserRecord = {
        id,
        email: args.data.email,
        passwordHash: args.data.passwordHash,
        credits: args.data.credits ?? 2,
        createdAt: new Date(),
      };
      this.users.set(id, user);

      if (args.data.creditTxns?.create) {
        const txnId = makeId("txn");
        this.creditTxns.set(txnId, {
          id: txnId,
          userId: id,
          delta: args.data.creditTxns.create.delta,
          reason: args.data.creditTxns.create.reason,
          stripeSessionId: null,
          createdAt: new Date(),
        });
      }
      return { ...user };
    },
    update: async (args: {
      where: { id: string };
      data: { credits?: number | { increment?: number; decrement?: number } };
    }) => {
      const u = this.users.get(args.where.id);
      if (!u) throw new Error(`User not found: ${args.where.id}`);
      if (args.data.credits !== undefined) {
        if (typeof args.data.credits === "number") {
          u.credits = args.data.credits;
        } else if (args.data.credits.increment !== undefined) {
          u.credits += args.data.credits.increment;
        } else if (args.data.credits.decrement !== undefined) {
          u.credits -= args.data.credits.decrement;
        }
      }
      return { ...u };
    },
    updateMany: async (args: {
      where: { id: string; credits?: { gt?: number } };
      data: { credits: { decrement?: number } };
    }) => {
      const u = this.users.get(args.where.id);
      if (!u) return { count: 0 };
      if (args.where.credits?.gt !== undefined) {
        if (u.credits <= args.where.credits.gt) {
          return { count: 0 };
        }
      }
      const dec = args.data.credits.decrement ?? 1;
      u.credits -= dec;
      return { count: 1 };
    },
  };

  market = {
    findUnique: async (args: {
      where: { id?: string; query?: string };
      include?: { niches?: { orderBy?: { rank: "asc" } } };
    }) => {
      let found: MarketRecord | null = null;
      if (args.where.id) {
        found = this.markets.get(args.where.id) ?? null;
      } else if (args.where.query) {
        for (const m of this.markets.values()) {
          if (m.query.toLowerCase() === args.where.query.toLowerCase()) {
            found = m;
            break;
          }
        }
      }
      if (!found) return null;

      if (args.include?.niches) {
        const nichesList = Array.from(this.niches.values())
          .filter((n) => n.marketId === found!.id)
          .sort((a, b) => a.rank - b.rank);
        return { ...found, niches: nichesList };
      }
      return { ...found };
    },
    findUniqueOrThrow: async (args: {
      where: { id?: string; query?: string };
      include?: { niches?: { orderBy?: { rank: "asc" } } };
    }) => {
      const res = await this.market.findUnique(args);
      if (!res) throw new Error("Market not found");
      return res;
    },
    create: async (args: { data: { query: string; status?: string } }) => {
      for (const m of this.markets.values()) {
        if (m.query.toLowerCase() === args.data.query.toLowerCase()) {
          throw new Prisma.PrismaClientKnownRequestError("Unique constraint failed on the fields: (`query`)", {
            code: "P2002",
            clientVersion: "6.19.3",
          });
        }
      }
      const id = makeId("market");
      const now = new Date();
      const market: MarketRecord = {
        id,
        query: args.data.query,
        status: args.data.status ?? "pending",
        errorMsg: null,
        createdAt: now,
        updatedAt: now,
      };
      this.markets.set(id, market);
      return { ...market };
    },
    update: async (args: {
      where: { id: string };
      data: { status?: string; errorMsg?: string | null };
    }) => {
      const m = this.markets.get(args.where.id);
      if (!m) throw new Error(`Market not found: ${args.where.id}`);
      if (args.data.status !== undefined) m.status = args.data.status;
      if (args.data.errorMsg !== undefined) m.errorMsg = args.data.errorMsg;
      m.updatedAt = new Date();
      return { ...m };
    },
  };

  niche = {
    findUnique: async (args: {
      where: { id?: string; marketId_rank?: { marketId: string; rank: number } };
    }) => {
      if (args.where.id) {
        return this.niches.get(args.where.id) ?? null;
      }
      if (args.where.marketId_rank) {
        const { marketId, rank } = args.where.marketId_rank;
        for (const n of this.niches.values()) {
          if (n.marketId === marketId && n.rank === rank) {
            return { ...n };
          }
        }
      }
      return null;
    },
    findMany: async (args: { where: { marketId: string } }) => {
      return Array.from(this.niches.values())
        .filter((n) => n.marketId === args.where.marketId)
        .sort((a, b) => a.rank - b.rank);
    },
    create: async (args: {
      data: {
        marketId: string;
        rank: number;
        name: string;
        teaser: string;
        demand: number;
        revenue: string;
        revenueNote: string;
        reportJson: string;
      };
    }) => {
      const id = makeId("niche");
      const niche: NicheRecord = {
        id,
        ...args.data,
      };
      this.niches.set(id, niche);
      return { ...niche };
    },
  };

  unlock = {
    findUnique: async (args: { where: { userId_nicheId: { userId: string; nicheId: string } } }) => {
      const { userId, nicheId } = args.where.userId_nicheId;
      for (const u of this.unlocks.values()) {
        if (u.userId === userId && u.nicheId === nicheId) {
          return { ...u };
        }
      }
      return null;
    },
    findMany: async (args: {
      where: { userId: string; niche?: { marketId?: string } };
      select?: { nicheId?: boolean };
      orderBy?: { createdAt: "desc" | "asc" };
      include?: { niche?: { include?: { market?: boolean } } };
    }) => {
      let list = Array.from(this.unlocks.values()).filter((u) => u.userId === args.where.userId);
      if (args.where.niche?.marketId) {
        const targetMarketId = args.where.niche.marketId;
        list = list.filter((u) => {
          const n = this.niches.get(u.nicheId);
          return n && n.marketId === targetMarketId;
        });
      }

      list.sort((a, b) => {
        const dir = args.orderBy?.createdAt === "asc" ? 1 : -1;
        return dir * (a.createdAt.getTime() - b.createdAt.getTime());
      });

      if (args.select?.nicheId) {
        return list.map((u) => ({ nicheId: u.nicheId }));
      }

      if (args.include?.niche) {
        return list.map((u) => {
          const niche = this.niches.get(u.nicheId);
          let market: MarketRecord | undefined;
          if (niche && args.include?.niche && typeof args.include.niche === "object" && args.include.niche.include?.market) {
            market = this.markets.get(niche.marketId);
          }
          return {
            ...u,
            niche: niche ? { ...niche, market: market ? { ...market } : undefined } : null,
          };
        });
      }

      return list.map((u) => ({ ...u }));
    },
    create: async (args: { data: { userId: string; nicheId: string } }) => {
      for (const u of this.unlocks.values()) {
        if (u.userId === args.data.userId && u.nicheId === args.data.nicheId) {
          throw new Prisma.PrismaClientKnownRequestError(
            "Unique constraint failed on the fields: (`userId`,`nicheId`)",
            {
              code: "P2002",
              clientVersion: "6.19.3",
            }
          );
        }
      }
      const id = makeId("unlock");
      const record: UnlockRecord = {
        id,
        userId: args.data.userId,
        nicheId: args.data.nicheId,
        createdAt: new Date(),
      };
      this.unlocks.set(id, record);
      return { ...record };
    },
  };

  creditTxn = {
    create: async (args: {
      data: {
        userId: string;
        delta: number;
        reason: string;
        stripeSessionId?: string;
      };
    }) => {
      if (args.data.stripeSessionId) {
        for (const t of this.creditTxns.values()) {
          if (t.stripeSessionId === args.data.stripeSessionId) {
            throw new Prisma.PrismaClientKnownRequestError(
              "Unique constraint failed on the fields: (`stripeSessionId`)",
              {
                code: "P2002",
                clientVersion: "6.19.3",
              }
            );
          }
        }
      }
      const id = makeId("txn");
      const record: CreditTxnRecord = {
        id,
        userId: args.data.userId,
        delta: args.data.delta,
        reason: args.data.reason,
        stripeSessionId: args.data.stripeSessionId ?? null,
        createdAt: new Date(),
      };
      this.creditTxns.set(id, record);
      return { ...record };
    },
  };

  async $transaction<T>(arg: Promise<T>[] | ((tx: InMemoryDatabase) => Promise<T>)): Promise<T | T[]> {
    if (Array.isArray(arg)) {
      return Promise.all(arg);
    }
    if (typeof arg === "function") {
      return arg(this);
    }
    return Promise.resolve([]) as unknown as T[];
  }
}

const globalForMock = globalThis as unknown as { inMemoryDb?: InMemoryDatabase };

export function getInMemoryDb(): InMemoryDatabase {
  if (!globalForMock.inMemoryDb) {
    globalForMock.inMemoryDb = new InMemoryDatabase();
  }
  return globalForMock.inMemoryDb;
}
