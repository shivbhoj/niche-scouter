import { describe, it, expect } from "vitest";
import { extractJson } from "@/lib/ai/extract-json";
import { aiMarketSchema, normalizeNiche, type AiNiche } from "@/lib/ai/schema";

/** A minimal well-formed niche, used as the base for variations. */
function validNiche(over: Partial<Record<string, unknown>> = {}) {
  return {
    name: "Test niche",
    teaser: "A one-liner.",
    demand: 72,
    revenue: "$12k/mo",
    revenueNote: "yr-1 realistic",
    thesis: "The thesis.",
    metrics: [["Demand", "72"], ["Competition", "30"], ["Rev. potential", "$12k/mo"], ["Confidence", "High"]],
    trend: [30, 34, 38, 41, 45, 49, 52, 58, 61, 66, 70, 75],
    trendStart: "Sep 2025",
    trendEnd: "Aug 2026",
    trendNote: "+80% search interest, 12 mo",
    audience: "The buyers.",
    audienceFacts: [["Median spend", "$40"], ["Repeat rate", "2/yr"], ["Where", "Reddit"]],
    keywords: [["term one", "9k/mo", "KD 11", "+64%"], ["term two", "5k/mo", "KD 8", "+41%"]],
    competitors: [["Someone", "small", "The gap they leave."]],
    playbook: [["01", "Move one", "Do this.", "60% margin"]],
    ideas: ["Idea one", "Idea two"],
    sourcing: ["Sourcing note."],
    risks: [["Medium", "A risk."]],
    sources: [["Something checked", "today"]],
    ...over,
  };
}

describe("extractJson", () => {
  it("reads a bare JSON object", () => {
    expect(extractJson('{"a":1}')).toEqual({ a: 1 });
  });

  it("reads a fenced block", () => {
    expect(extractJson('```json\n{"a":1}\n```')).toEqual({ a: 1 });
  });

  it("ignores commentary before and after", () => {
    const text = 'Here is what I found after searching.\n{"a":1}\nHope that helps!';
    expect(extractJson(text)).toEqual({ a: 1 });
  });

  /**
   * The failure mode the old first-brace/last-brace slice had: citation
   * prose from web search that contains its own braces.
   */
  it("survives braces inside surrounding prose", () => {
    const text = 'I checked {sources} and {more sources}.\n\n{"niches":[{"name":"x"}]}\n\nDone {ok}.';
    expect(extractJson(text)).toEqual({ niches: [{ name: "x" }] });
  });

  it("prefers the real body over a small object mentioned in prose", () => {
    const text = 'Format is {"example":true}.\n```json\n{"niches":[1,2,3]}\n```';
    expect(extractJson(text)).toEqual({ niches: [1, 2, 3] });
  });

  it("is not fooled by braces inside strings", () => {
    expect(extractJson('{"a":"a } brace"}')).toEqual({ a: "a } brace" });
  });

  it("throws when there is genuinely no object", () => {
    expect(() => extractJson("I could not complete this request.")).toThrow();
  });
});

describe("aiMarketSchema", () => {
  it("accepts a well-formed market", () => {
    const parsed = aiMarketSchema.parse({ niches: [validNiche()] });
    expect(parsed.niches).toHaveLength(1);
  });

  it("coerces stringified numbers", () => {
    const parsed = aiMarketSchema.parse({
      niches: [validNiche({ demand: "72", trend: ["30", "40", "50", "60"] })],
    });
    expect(parsed.niches[0].demand).toBe(72);
    expect(parsed.niches[0].trend[0]).toBe(30);
  });

  /**
   * REGRESSION: the original schema demanded exact counts and discarded a
   * whole billable research run over a single extra row.
   */
  it("accepts counts that differ from the layout's preferred shape", () => {
    expect(() =>
      aiMarketSchema.parse({
        niches: [
          validNiche({
            keywords: Array(7).fill(["t", "1k/mo", "KD 5", "+10%"]),
            metrics: [["Demand", "72"], ["Competition", "30"]],
            trend: [10, 20, 30, 40, 50],
            playbook: Array(5).fill(["01", "t", "b", "m"]),
          }),
        ],
      })
    ).not.toThrow();
  });

  /**
   * REGRESSION: observed on the first live run — one niche returned
   * `sourcing` as a bare string instead of an array, failing validation
   * and costing an entire extra research round-trip to repair.
   */
  it("accepts a bare string where a list of strings is expected", () => {
    const parsed = aiMarketSchema.parse({
      niches: [validNiche({ sourcing: "One sourcing note.", ideas: "One idea." })],
    });
    expect(parsed.niches[0].sourcing).toEqual(["One sourcing note."]);
    expect(parsed.niches[0].ideas).toEqual(["One idea."]);
  });

  it("wraps a singular string without splitting or reinterpreting it", () => {
    const text = "Two suppliers quote $4/unit; MOQ 250. Lead time 3 weeks.";
    const parsed = aiMarketSchema.parse({ niches: [validNiche({ sourcing: text })] });
    expect(parsed.niches[0].sourcing).toEqual([text]);
  });

  it("accepts numbers in tuple positions that render as text", () => {
    const parsed = aiMarketSchema.parse({
      niches: [
        validNiche({
          keywords: [["puck screen", 9400, 11, "+64%"]],
          metrics: [["Demand", 72], ["Competition", 30]],
        }),
      ],
    });
    expect(parsed.niches[0].keywords[0]).toEqual(["puck screen", "9400", "11", "+64%"]);
    expect(parsed.niches[0].metrics[0]).toEqual(["Demand", "72"]);
  });

  it("does not stringify null or objects in tuple positions", () => {
    expect(() =>
      aiMarketSchema.parse({ niches: [validNiche({ metrics: [["Demand", null]] })] })
    ).toThrow();
    expect(() =>
      aiMarketSchema.parse({ niches: [validNiche({ metrics: [["Demand", {}]] })] })
    ).toThrow();
  });

  it("still rejects genuinely unusable output", () => {
    expect(() => aiMarketSchema.parse({ niches: [] })).toThrow();
    expect(() => aiMarketSchema.parse({ niches: [validNiche({ name: "" })] })).toThrow();
    expect(() => aiMarketSchema.parse({ nope: true })).toThrow();
  });
});

describe("normalizeNiche", () => {
  const norm = (over = {}) => normalizeNiche(aiMarketSchema.parse({ niches: [validNiche(over)] }).niches[0] as AiNiche);

  it("always produces exactly 12 trend points", () => {
    expect(norm({ trend: [10, 20, 30, 40, 50] }).trend).toHaveLength(12);
    expect(norm({ trend: Array(30).fill(50) }).trend).toHaveLength(12);
    expect(norm().trend).toHaveLength(12);
  });

  it("preserves the shape of the series when resampling", () => {
    const out = norm({ trend: [0, 33, 66, 100] }).trend;
    // Endpoints are anchored, so the chart still starts and ends where
    // the research said it did.
    expect(out[0]).toBe(0);
    expect(out[out.length - 1]).toBe(100);
    // Monotonically rising input stays monotonically rising.
    expect([...out].sort((a, b) => a - b)).toEqual(out);
  });

  it("trims oversized lists to the layout's counts", () => {
    const out = norm({
      keywords: Array(9).fill(["t", "1k/mo", "KD 5", "+10%"]),
      ideas: Array(12).fill("idea"),
      sources: Array(11).fill(["s", "today"]),
    });
    expect(out.keywords).toHaveLength(4);
    expect(out.ideas).toHaveLength(6);
    expect(out.sources).toHaveLength(5);
  });

  it("backfills the metric strip from known fields rather than leaving it sparse", () => {
    const out = norm({ metrics: [["Competition", "30"]] });
    expect(out.metrics.some(([l]) => /demand/i.test(l))).toBe(true);
    expect(out.metrics.some(([l]) => /rev/i.test(l))).toBe(true);
    expect(out.metrics.length).toBeLessThanOrEqual(4);
  });

  it("never invents rows it wasn't given", () => {
    const out = norm({ competitors: [["Only one", "small", "gap"]] });
    expect(out.competitors).toHaveLength(1);
    expect(out.sourcing).toHaveLength(1);
  });

  it("renumbers the playbook sequentially", () => {
    const out = norm({
      playbook: [
        ["99", "First", "body", "10%"],
        ["", "Second", "body", "20%"],
      ],
    });
    expect(out.playbook.map((p) => p[0])).toEqual(["01", "02"]);
  });

  it("rounds demand for display", () => {
    expect(norm({ demand: 72.6 }).demand).toBe(73);
  });
});
