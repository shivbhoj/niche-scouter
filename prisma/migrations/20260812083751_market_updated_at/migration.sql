-- Adds Market.updatedAt. Existing rows are backfilled from createdAt so
-- the column can be NOT NULL without a table-wide default.
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Market" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "query" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "errorMsg" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Market" ("createdAt", "errorMsg", "id", "query", "status", "updatedAt") SELECT "createdAt", "errorMsg", "id", "query", "status", "createdAt" FROM "Market";
DROP TABLE "Market";
ALTER TABLE "new_Market" RENAME TO "Market";
CREATE UNIQUE INDEX "Market_query_key" ON "Market"("query");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
