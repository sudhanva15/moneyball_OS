# v2 Research — Findings

Research conducted August 2026. Each section is a decision input for
`PROPOSAL.md`, not a final answer — sourced so it can be re-checked as the
market for these tools moves.

## 1. Market/company data (replacing or supplementing the unofficial Yahoo endpoint)

The Yahoo Finance chart endpoint v1.0 uses is unofficial, undocumented, and
has no SLA — fine for a personal dashboard, risky as a foundation for
anything more.

| Option | Free tier | Notes |
|---|---|---|
| **SEC EDGAR** (`data.sec.gov`) | Unlimited, no key, 10 req/sec rate limit | Official, US-only, but this is the real find: `companyfacts` and `xbrl/frames` endpoints give structured fundamentals (revenue, margins, etc.) straight from filings — exactly what Module 7 (Company Intelligence) needs, and it's free and authoritative. No India equivalent. |
| **Alpha Vantage** | 25 requests/day (free) | Very low ceiling — good for fundamentals lookups you don't do often, not for live quotes. Has an official MCP server, notable for AI integration. |
| **Finnhub** | 60 calls/min | Best free real-time-ish option; free WebSocket streaming for trades; includes some alternative data (congressional trading, ESG). US-centric. |
| **Twelve Data** | 800 requests/day | Best free coverage breadth — 50+ exchanges including NSE/BSE — but data is delayed ~4 hours on free tier. |
| **Polygon.io** | Paid only for real use | Best-in-class for US real-time data; worth it only past a real usage threshold, not a v2 concern. |

**Read:** keep Yahoo's endpoint for live index/watchlist quotes (it's the
only genuinely free near-real-time option covering both US and India in one
call shape), but add SEC EDGAR as the fundamentals backbone for a Company
Intelligence module — it's official, free, unlimited, and exactly fit for
purpose for US equities. Twelve Data is the fallback if Yahoo's endpoint
ever breaks badly enough to need replacing, accepting the 4-hour delay.

## 2. India macro & company data

No clean free REST API was found for RBI macro series (repo rate, CPI,
forex reserves) — `data.rbi.org.in` / DBIE exists but doesn't expose a
simple public REST endpoint the way FRED does; it's built around a
browsable statistics portal, not a developer API. `data.gov.in` (India's
open government data platform) hosts some RBI-adjacent datasets but
coverage and update cadence are inconsistent. For company fundamentals, NSE
and BSE don't offer official free APIs either — most third-party India
equity data (including Twelve Data's NSE/BSE coverage) is a paid or delayed
product.

**Read:** India-side data remains the weakest link in the whole platform.
Realistic options for v2: (a) accept delayed/paid data via Twelve Data for
India equities, (b) manually maintain a small, periodically-updated set of
India macro figures rather than pretending there's a live feed, or (c)
scrape RBI's published press-release pages on a schedule — fragile, but
possibly the only free path to something resembling live India macro data.
None of these are great; this is a place where spending a little money
(Twelve Data's paid tier, or a data vendor) may be the honest answer sooner
than the US side needs it.

## 3. Persistence (for continuity, suitability profiles, watchlists, history)

| Option | Free tier | Fit |
|---|---|---|
| **Neon Postgres** (= Vercel Postgres) | 0.5GB/project, 100 compute-hrs/mo, scales to zero, HTTP driver works natively in edge runtime | Best fit — deepest Vercel integration, no TCP connection-pooling headaches from serverless functions. |
| **Supabase** | ~500MB, pauses after a week idle on free tier | Comparable storage, but bundles auth/storage/realtime you likely don't need yet — more platform than this project needs right now. |

**Read:** Neon is the right default given the existing Vercel deployment —
adopt it for a `profile` table (versioned snapshots, not a single mutable
row — see `06-CONTINUITY-SUITABILITY-RECOMMENDATIONS.md` on why history
matters), a `watchlist` table, and eventually a `suitability_responses`
table.

## 4. Caching / rate limiting

**Upstash Redis** (same product Vercel KV resells) has a real free tier
(500k commands/month, 256MB, HTTP-based so it works from edge functions
without connection pooling) and a purpose-built rate-limiting library. Worth
adding once Company Intelligence adds SEC EDGAR calls that need to respect
that API's 10 req/sec limit — a shared rate limiter matters more once
multiple API routes call multiple upstreams.

## 5. Authentication

Auth.js v5 (formerly NextAuth) is the standard for Next.js App Router:
handles magic-link email sign-in (needs a database adapter — Neon fits) and
has experimental passkey support via a third-party Hanko provider.

**Read:** not urgent while this stays single-user — the current shared
password is a reasonable trade-off (see `03-ARCHITECTURE.md`). Worth
revisiting only if a second person (e.g. a family member) gets real access,
at which point Auth.js + Neon adapter + magic link is the natural upgrade
path, since it doesn't require picking a heavier platform.

## 6. Charting

**TradingView's Lightweight Charts** (open source, MIT-ish license, ~45KB)
is purpose-built for candlestick/volume/time-series financial charts and
renders large datasets smoothly via canvas — the right choice the moment the
Markets tab needs actual price history charts instead of just a live number.
**Recharts** remains a better fit for generic bar/line charts (e.g. a future
portfolio allocation pie chart or performance-over-time line) since it's
more declarative and React-native. Read: use both, each where it fits,
rather than forcing one library to do both jobs.

## 7. Open-source models for News/NLP and Quant modules

Per your instruction to evaluate existing open-source work before building
custom models:

- **FinBERT** (ProsusAI, on HuggingFace) — the standard open-source
  financial sentiment classifier. Strong for headline-level positive/
  negative/neutral classification, the natural next step for the News tab
  (tag each headline instead of just listing it). Limitation: sentiment
  only, not general financial reasoning.
- **FinGPT** — a newer, actively-developed open-source financial LLM
  effort using parameter-efficient fine-tuning (LoRA/QLoRA) on financial
  news corpora; broader than FinBERT but heavier to run. Worth evaluating
  once sentiment tagging alone isn't enough.
- **PyPortfolioOpt** — mature, well-documented Python library for
  mean-variance optimization, Black-Litterman, and Hierarchical Risk Parity.
  Directly matches Module 11 (Portfolio Construction) from the original
  spec. This is the strongest "don't build it yourself" case in the whole
  research pass — it's exactly the right shape for a rules-based allocation
  engine, MIT-licensed, and has published backtests showing HRP beating
  equal-weight on drawdown and Sharpe.
- **Qlib** (Microsoft, MIT license, actively maintained — commits as
  recently as March 2026) — a full quant research platform (data
  processing, model training, backtesting, alpha research). Bigger than
  what v2 needs, but the right thing to adopt later for Module 10
  (Quantitative Engine) rather than building factor models from scratch.

**Read:** adopt, don't build, for both sentiment (FinBERT) and portfolio
construction (PyPortfolioOpt) — both are mature, permissively licensed, and
directly fit the modules they'd replace custom code for. These run as
Python, which means either a small Python microservice (e.g. a Vercel
Python serverless function, or a separate lightweight host) alongside the
Next.js app, not in-process — a real architecture decision for whoever
builds Module 7/10/11.
