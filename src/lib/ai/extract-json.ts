/**
 * Pull the result object out of a model response.
 *
 * This has to survive more than a clean JSON body: with web search
 * enabled the reply often carries citation prose, and models like to wrap
 * output in ``` fences or add a sentence before it. A naive
 * "first brace to last brace" slice breaks the moment any of that
 * surrounding text contains a brace of its own.
 */
export function extractJson(text: string): unknown {
  for (const candidate of candidates(text)) {
    try {
      const parsed = JSON.parse(candidate);
      if (parsed && typeof parsed === "object") return parsed;
    } catch {
      // Try the next candidate.
    }
  }
  throw new Error("No parseable JSON object found in model output");
}

function* candidates(text: string): Generator<string> {
  // Fenced blocks first — the most explicit signal of intent.
  const fences = text.matchAll(/```(?:json)?\s*([\s\S]*?)```/gi);
  for (const m of fences) yield m[1].trim();

  // Then every balanced brace-delimited span, longest first, so an
  // object that merely appears inside the prose loses to the real body.
  const spans = balancedSpans(text).sort((a, b) => b.length - a.length);
  for (const span of spans) yield span;

  yield text.trim();
}

/** Every top-level {...} span, respecting strings and escapes. */
function balancedSpans(text: string): string[] {
  const out: string[] = [];
  let depth = 0;
  let start = -1;
  let inString = false;
  let escaped = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];

    if (inString) {
      if (escaped) escaped = false;
      else if (ch === "\\") escaped = true;
      else if (ch === '"') inString = false;
      continue;
    }

    if (ch === '"') inString = true;
    else if (ch === "{") {
      if (depth === 0) start = i;
      depth++;
    } else if (ch === "}") {
      depth--;
      if (depth === 0 && start !== -1) {
        out.push(text.slice(start, i + 1));
        start = -1;
      }
      if (depth < 0) depth = 0;
    }
  }
  return out;
}
