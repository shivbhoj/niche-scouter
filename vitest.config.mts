import { defineConfig } from "vitest/config";
import path from "node:path";

const rootDir = import.meta.dirname;

export default defineConfig({
  test: {
    globalSetup: ["./tests/global-setup.ts"],
    // The DB-backed tests share one SQLite file and assert on absolute
    // row state, so they must not interleave across worker processes.
    fileParallelism: false,
    include: ["tests/**/*.test.ts"],
  },
  resolve: {
    alias: { "@": path.resolve(rootDir, "./src") },
  },
});
