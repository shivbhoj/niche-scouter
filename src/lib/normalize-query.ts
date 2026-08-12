import { EXAMPLE_MARKETS } from "@/lib/ai/seed-data";

export const MAX_QUERY_LENGTH = 200;

/**
 * Canonical form of a search topic. Also the cache key for a Market, so
 * spacing and casing variants must collapse to the same string —
 * otherwise "Home Coffee Equipment" pays for a second AI generation of a
 * market we already have.
 */
export function normalizeQuery(q: string) {
  const trimmed = q.trim().toLowerCase().replace(/\s+/g, " ").slice(0, MAX_QUERY_LENGTH);
  return trimmed || EXAMPLE_MARKETS[0];
}
