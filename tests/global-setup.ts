import { execSync } from "node:child_process";
import { PrismaClient } from "@prisma/client";
import path from "node:path";

/**
 * Point the suite at a throwaway Postgres database and rebuild it from
 * the real migrations.
 *
 * This must be Postgres, not SQLite: the credit tests assert on
 * behaviour under concurrent writes, and engines differ there. Testing
 * the race against a different database than production runs is how you
 * get a green suite and a broken product.
 */
const DEFAULT_TEST_URL =
  "postgresql://postgres:devpass@127.0.0.1:5432/nichescouter_test?schema=public";

/**
 * This setup drops every table it can see, so refuse to run against
 * anything that isn't obviously a scratch database. A mistyped
 * TEST_DATABASE_URL should fail loudly, not quietly wipe real data.
 */
function assertLooksLikeTestDatabase(url: string) {
  let name: string;
  try {
    name = new URL(url).pathname.replace(/^\//, "");
  } catch {
    throw new Error(`TEST_DATABASE_URL is not a valid URL: ${url}`);
  }
  if (!/test/i.test(name)) {
    throw new Error(
      `Refusing to reset "${name}": the test database name must contain "test".\n` +
        `This setup drops all tables — point TEST_DATABASE_URL at a throwaway database.`
    );
  }
}

export default async function setup() {
  const url = process.env.TEST_DATABASE_URL ?? DEFAULT_TEST_URL;
  assertLooksLikeTestDatabase(url);

  process.env.DATABASE_URL = url;
  process.env.DIRECT_URL = url;

  const db = new PrismaClient({ datasources: { db: { url } } });
  try {
    // Reset in SQL rather than via `prisma migrate reset`, which is
    // gated behind an interactive confirmation. Scoped to the schema of
    // the database validated above.
    await db.$executeRawUnsafe("DROP SCHEMA IF EXISTS public CASCADE");
    await db.$executeRawUnsafe("CREATE SCHEMA public");
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err);
    throw new Error(
      `Could not reach the test database at ${url}.\n` +
        `Start Postgres and create it first:  createdb nichescouter_test\n` +
        `or set TEST_DATABASE_URL to an existing throwaway database.\n\n${detail}`
    );
  } finally {
    await db.$disconnect();
  }

  // Replay the real migration history so the schema under test matches
  // what `migrate deploy` produces in production.
  execSync("npx prisma migrate deploy", {
    cwd: path.resolve(__dirname, ".."),
    env: { ...process.env, DATABASE_URL: url, DIRECT_URL: url },
    stdio: "pipe",
  });
}
