import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

/**
 * Build a throwaway SQLite database from the real migrations, so the
 * credit/unlock tests run against the same engine and constraints
 * production uses. Mocking Prisma here would defeat the point: the bug
 * these tests guard against was a database-level race.
 */
export default function setup() {
  const dbPath = path.resolve(__dirname, "../prisma/test.db");
  for (const suffix of ["", "-journal", "-wal", "-shm"]) {
    fs.rmSync(`${dbPath}${suffix}`, { force: true });
  }

  const url = `file:${dbPath}`;
  process.env.DATABASE_URL = url;

  execSync("npx prisma migrate deploy", {
    cwd: path.resolve(__dirname, ".."),
    env: { ...process.env, DATABASE_URL: url },
    stdio: "pipe",
  });

  return () => {
    for (const suffix of ["", "-journal", "-wal", "-shm"]) {
      fs.rmSync(`${dbPath}${suffix}`, { force: true });
    }
  };
}
