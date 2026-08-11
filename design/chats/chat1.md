# AI-powered niche discovery tool

_Started 2026-08-11 17:13 UTC_

---

## User

Build a modern, minimalistic and unique Ai powered niche discovery website/webapp that uses ai and real time search to find niches using a broad topic or industry.  For the results, reveal only limited details for each niche, and a reveal or some kind of 'see more' button to see full niche result and details after signing up.  Signing up for an account gives 2 full niche results, then to see more is for a fee.

## Assistant



## Assistant

_[tool: ask_user]_

Waiting on your answers to the form — audience, scope, what stays locked vs. unlocked, and pricing. Skip anything and I'll make the call.

## User

Answered — audience: Solo founders / indie hackers, Ecommerce & dropshipping sellers, Content creators / newsletter writers, Affiliate marketers, Agencies doing market research; scope: Landing page (hero, how it works, pricing), Search + results with locked niche cards, Sign-up / paywall flow, Unlocked full niche detail view, Account dashboard (saved niches, credits); card_teaser: Niche name, One-line description, Demand score, Est. revenue potential; full_detail: Audience profile, Keyword clusters, Competitor breakdown, Trend data over time, Monetization playbook, Content/product ideas, Sour…

## Assistant



## Assistant

_[tool: ask_user]_

Waiting on the look-and-feel round: overall feel, accent, type pairing, copy tone.

## User

Answered — vibe: Editorial & quiet — lots of white space, serif headlines, feels like a research journal; accent: #111111

## Assistant

_[tool: dc_write]_

_[tool: ready_for_verification]_

Built **Niche Scouter** as one flowing app: editorial landing → live search with a subtle status line → locked preview cards (name, one-liner, demand, revenue potential; everything else visibly locked) → signup modal that grants 2 free reports → full evidence-linked report (trend, audience, keywords, competitors, playbook, ideas, sourcing, risks, sources) → paywall on the 3rd unlock → dashboard with credits and unlock history.

Pricing I picked: free 2 reports, $4 single unlock, **Scout $12/mo (20 reports)**, Studio $39/mo (100 + 3 seats). Cheap enough to feel impulsive, priced above realistic per-search API cost.

One market ("home coffee equipment") has real data; other example chips return the same set. Say the word and I'll add more markets, or wire actual live search.

## User

Found issues — fixing…

## Assistant

_[tool: dc_js_str_replace]_

_[tool: dc_html_str_replace]_

_[tool: dc_js_str_replace]_

_[tool: dc_js_str_replace]_

_[tool: dc_js_str_replace]_

_[tool: run_script]_

_[tool: ready_for_verification]_

Swapped the warm beige for a cool porcelain palette — background #f6f7f9, hairlines #dfe3ea, near-black ink shifted slightly blue (#13171f). Also fixed the two flagged issues: all four example markets now return their own niche sets, and the credits modal shows top-up copy instead of the "free reports used" paywall wording when you still have credits.

## User

Found issues — fixing…

## Assistant

_[tool: run_script]_

_[tool: ready_for_verification]_

Unlocks are now keyed per market, so ownership, the report you open, and the dashboard rows all follow the market a report was bought in. The final status line derives from the actual niche count.

## User

I dont know if anyone will be paying for or needing a monthly niche discovery subscriptions.  Do you think having a pay per niche or niche bundle plans will be better?

## Assistant

You're right — subscription is the wrong default here. Niche hunting is bursty: someone picks a market, buys a few reports, and disappears for four months. A monthly plan means they churn after month one and feel bad about it, which kills word of mouth. Credit packs match the intent, remove the cancel-anxiety objection at the exact moment of purchase, and get paid up front. Switching to packs that never expire, with one optional monthly tier for agencies that genuinely research weekly.

_[tool: run_script]_

_[tool: grep]_

_[tool: run_script]_

_[tool: ready_for_verification]_

Pricing is now packs, no subscription: 2 free on signup, **$5** single report, **$19 / 5 reports** ($3.80 ea), **$45 / 15 reports** ($3 ea) — credits never expire. The paywall, dashboard ("Pay per report") and card labels ("uses 1 credit") all follow.

If agencies later show weekly usage, a single seat-based plan is easy to add on top — but launch on packs and let the data ask for it.

## User

Lets do $5/single, $15/5 $30/12

## Assistant

_[tool: run_script]_

_[tool: grep]_

_[tool: read_file]_

_[tool: read_file]_

_[tool: run_script]_

_[tool: grep]_

Prices are set. Pricing now reads: Free (2 reports) · $5 single · $15 for 5 ($3.00 each) · $30 for 12 ($2.50 each), with the same three paid options in the unlock modal and credits that never expire.

