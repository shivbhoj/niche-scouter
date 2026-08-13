/**
 * Cost accounting for a market generation.
 *
 * Every report sold has an API cost underneath it, and the cheapest pack
 * prices a report at $2.50 — so this is margin-critical, not telemetry.
 * Rates are per million tokens, from Anthropic's published pricing.
 */

export interface ModelRate {
  inputPerMTok: number;
  outputPerMTok: number;
}

export const MODEL_RATES: Record<string, ModelRate> = {
  "claude-opus-5": { inputPerMTok: 5, outputPerMTok: 25 },
  "claude-sonnet-5": { inputPerMTok: 3, outputPerMTok: 15 },
  "claude-haiku-4-5": { inputPerMTok: 1, outputPerMTok: 5 },
};

/** Web search is billed per request, not per token: $10 per 1,000. */
export const WEB_SEARCH_COST = 10 / 1000;

/** Cache reads bill at ~0.1x input; cache writes at ~1.25x (5-minute TTL). */
const CACHE_READ_MULTIPLIER = 0.1;
const CACHE_WRITE_MULTIPLIER = 1.25;

export interface GenerationUsage {
  inputTokens: number;
  outputTokens: number;
  cacheReadTokens: number;
  cacheWriteTokens: number;
  webSearches: number;
  apiCalls: number;
}

export function emptyUsage(): GenerationUsage {
  return {
    inputTokens: 0,
    outputTokens: 0,
    cacheReadTokens: 0,
    cacheWriteTokens: 0,
    webSearches: 0,
    apiCalls: 0,
  };
}

export function addUsage(total: GenerationUsage, usage: unknown): GenerationUsage {
  const u = usage as {
    input_tokens?: number;
    output_tokens?: number;
    cache_read_input_tokens?: number | null;
    cache_creation_input_tokens?: number | null;
    server_tool_use?: { web_search_requests?: number } | null;
  } | null;
  if (!u) return total;

  total.inputTokens += u.input_tokens ?? 0;
  total.outputTokens += u.output_tokens ?? 0;
  total.cacheReadTokens += u.cache_read_input_tokens ?? 0;
  total.cacheWriteTokens += u.cache_creation_input_tokens ?? 0;
  total.webSearches += u.server_tool_use?.web_search_requests ?? 0;
  total.apiCalls += 1;
  return total;
}

/**
 * Best-effort cost estimate. Returns null for a model with no known rate
 * rather than guessing — a wrong number here is worse than no number.
 */
export function estimateCostUsd(usage: GenerationUsage, model: string): number | null {
  const rate = MODEL_RATES[model];
  if (!rate) return null;

  const perToken = (n: number, perMTok: number) => (n / 1_000_000) * perMTok;

  return (
    perToken(usage.inputTokens, rate.inputPerMTok) +
    perToken(usage.cacheReadTokens, rate.inputPerMTok * CACHE_READ_MULTIPLIER) +
    perToken(usage.cacheWriteTokens, rate.inputPerMTok * CACHE_WRITE_MULTIPLIER) +
    perToken(usage.outputTokens, rate.outputPerMTok) +
    usage.webSearches * WEB_SEARCH_COST
  );
}

export function formatUsage(usage: GenerationUsage, model: string): string {
  const cost = estimateCostUsd(usage, model);
  const parts = [
    `${usage.apiCalls} API call${usage.apiCalls === 1 ? "" : "s"}`,
    `${usage.inputTokens.toLocaleString()} in`,
    `${usage.outputTokens.toLocaleString()} out`,
    `${usage.webSearches} web search${usage.webSearches === 1 ? "" : "es"}`,
  ];
  if (usage.cacheReadTokens) parts.push(`${usage.cacheReadTokens.toLocaleString()} cached`);
  if (cost !== null) parts.push(`~$${cost.toFixed(4)}`);
  return parts.join(" · ");
}
