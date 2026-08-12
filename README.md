# Niche Scouter

An AI-powered niche discovery app: give it a broad industry, and it uses
live web search (via Claude) to find underserved sub-niches — with
evidence attached. Locked preview cards convert into full evidence-linked
reports after signup (2 free) or a credit purchase.

Implemented from the `design/` handoff bundle (a Claude Design export) —
see `design/HANDOFF.md` and `design/chats/chat1.md` for the original brief
and design decisions.

## Stack

- **Next.js 16** (App Router, TypeScript)
- **Prisma + SQLite** for real persistence (users, credits, unlocks, cached
  market/niche data) — swap the datasource in `prisma/schema.prisma` to
  Postgres for production
- **Auth.js (NextAuth v5)** with a Credentials provider — real bcrypt-hashed
  passwords, JWT sessions. The single signup/sign-in form auto-provisions
  unknown emails (2 free credits) and verifies known ones.
- **Stripe Checkout** for credit-pack purchases, with a webhook as the
  source of truth and a synchronous confirm route for the redirect-back UX
- **Anthropic API** (Claude + the hosted `web_search` tool) generates the
  niches for any topic live, grounded in real search results

## Getting started

```bash
npm install                # also runs `prisma generate`
cp .env.example .env       # fill in what you have; see below
npm run db:migrate         # creates prisma/dev.db (SQLite) and applies the schema
npm run dev
```

Open http://localhost:3000.

## Tests

```bash
npm test          # vitest
npm run check     # tsc + eslint + vitest
```

The credit and unlock tests run against a real throwaway SQLite database
built from the actual migrations (`prisma/test.db`, created and dropped
per run) rather than a mocked Prisma client — the bugs they guard against
are database-level races, which a mock cannot reproduce. They include a
regression test for a shipped bug where concurrent unlock requests could
each pass the same stale `credits > 0` read and drive a balance negative.

## Environment variables

All of these have safe fallbacks except `AUTH_SECRET` — the app works and
is fully explorable with **zero** keys configured, using bundled example
data. See `.env.example` for the full list.

| Variable | Required? | What happens without it |
|---|---|---|
| `DATABASE_URL` | Yes | Defaults to a local SQLite file (`prisma/dev.db`) |
| `AUTH_SECRET` | Yes | Set any random 32+ char string (`openssl rand -base64 32`) |
| `ANTHROPIC_API_KEY` | No | Live search only works for the 4 example topics on the homepage (bundled data); any other topic returns a clear "set ANTHROPIC_API_KEY" error instead of fabricating data |
| `ANTHROPIC_MODEL` | No | Defaults to `claude-sonnet-5`; override if that id ages out |
| `STRIPE_SECRET_KEY` | No | The paywall modal shows "Payments aren't configured yet" instead of starting checkout |
| `STRIPE_WEBHOOK_SECRET` | No | Needed for the webhook to grant credits reliably; the synchronous confirm route (`/api/checkout/confirm`) still grants credits on the user's redirect back from Stripe, so checkout works without it in dev — just less resilient to a dropped connection |
| `NEXT_PUBLIC_APP_URL` | No | Defaults to the request's own host; set explicitly in production |

### Wiring up Stripe locally

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
# copy the printed whsec_... into STRIPE_WEBHOOK_SECRET
```

Use Stripe's test card `4242 4242 4242 4242`, any future expiry/CVC.

### Wiring up live AI search

Get a key at https://console.anthropic.com/settings/keys, set
`ANTHROPIC_API_KEY`. Any topic typed into the search box will then be
researched live via web search and cached in the database (subsequent
searches for the same topic are instant, reading from the cache).

## How the paywall actually works

Every gate is enforced server-side, not just hidden in the UI:

- `/api/search/status` only ever returns teaser fields (name, one-liner,
  demand, revenue) for locked niches — the full report JSON never reaches
  the client until ownership is verified.
- `/report/[marketId]/[rank]` is the single point of truth for unlocking:
  on load it checks for an existing `Unlock` row, then atomically spends a
  credit and creates one if the user has credits, or redirects back to the
  results page with the paywall open if they don't. Direct/bookmarked
  links can't bypass this.
- Credit grants from Stripe are idempotent, keyed on the checkout session
  id, so the webhook and the redirect-back confirmation route can't
  double-grant if both fire.
- Spending a credit is a single conditional `UPDATE ... WHERE credits > 0`,
  so the database decides who gets the last credit. It deliberately isn't
  wrapped in one long interactive transaction: SQLite takes a global write
  lock, and concurrent long transactions deadlock and surface as 500s.

## Abuse and rate limiting

Generating a new market is a billable AI call with live web search, so
that path is metered while everything else stays free:

- **New scouts** are limited per account (or per IP when signed out).
  Re-opening a topic that has already been scouted is a plain database
  read — unmetered, matching the "searching is always free" pricing.
- **Sign-in attempts** are throttled per IP to slow credential stuffing.
- Query strings are normalized (case, whitespace, length) before being
  used as the market cache key, so trivial variants can't be used to force
  duplicate paid generations of a market that already exists.

`src/lib/rate-limit.ts` keeps counters **in process memory**. That
correctly protects a single instance. If you scale horizontally or deploy
to a platform that spins up many isolates, each keeps its own counter and
the effective limit multiplies — move that module to Redis/Upstash at that
point; the call sites don't change.

### Known limitation

Sign-up and sign-in share one form, so submitting a wrong password for an
existing address reveals that the address is registered (a new address
would instead create an account). That's inherent to the frictionless
one-step flow in the original design; closing it means adding a separate
sign-up step or an email-verification round trip.

## Project structure

```
src/app/                landing, results, report, dashboard pages + API routes
src/components/         header, modals, report view
src/lib/                db client, auth config, credits, Stripe, AI generation
prisma/schema.prisma    User / Market / Niche / Unlock / CreditTxn
design/                 the original Claude Design handoff bundle (reference only)
```
