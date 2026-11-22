import { PrismaClient } from "@prisma/client";
import { getInMemoryDb } from "./mock-db";

const globalForDb = globalThis as unknown as { db?: PrismaClient };

function isLocalOrMissingDbUrl(): boolean {
  const url = process.env.DATABASE_URL;
  if (!url) return true;
  return (
    url.includes("127.0.0.1") ||
    url.includes("localhost") ||
    url.includes("devpass") ||
    url.startsWith("mock:")
  );
}

function initDb(): PrismaClient {
  const inMemory = getInMemoryDb();
  if (isLocalOrMissingDbUrl()) {
    return inMemory as unknown as PrismaClient;
  }

  try {
    return new PrismaClient();
  } catch {
    console.warn("[AI Studio] Database unreachable, switching to in-memory store");
    return inMemory as unknown as PrismaClient;
  }
}

export const db: PrismaClient = globalForDb.db ?? initDb();

if (process.env.NODE_ENV !== "production") globalForDb.db = db;
