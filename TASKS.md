# Backlog

Working backlog for local development (VSCode + Copilot/Gemini or Claude).
Checkbox items are meant to be pickable one at a time — each should be small
enough to be one PR/commit. Phases match `docs/v2-research/PROPOSAL.md`;
Phase 5 is new (added per the paper-trading/self-improvement request) and
isn't in that doc yet — fold it in there once scoped further.

## Phase 1 — Foundations
- [ ] Connect this repo to GitHub (`gh repo create` or manually), push `main`
- [ ] Add Neon Postgres, wire `DATABASE_URL`
- [ ] `profile` table (versioned snapshots, not a mutable row) + migrate `lib/profile.ts` data in as row 1
- [ ] `watchlist` table + migrate `lib/symbols.ts` watchlist in
- [ ] In-app settings page to edit profile (writes a new versioned row, doesn't mutate)
- [ ] Wire the eligibility ticker field into `checkEligibility()` output (currently cosmetic — see `docs/v1.0/02-UI-GUIDE.md`)

## Phase 2 — Company Intelligence
- [ ] SEC EDGAR client (`companyfacts`, `xbrl/frames`) — US fundamentals
- [ ] Rate limiter for EDGAR's 10 req/sec cap (Upstash)
- [ ] Twelve Data client for India equity fundamentals (accept ~4hr delay)
- [ ] Price history chart component (TradingView Lightweight Charts)

## Phase 3 — Suitability
- [ ] Risk tolerance questionnaire (real instrument, not a slider) + scoring
- [ ] Risk capacity calc (income/expenses/emergency fund/dependents)
- [ ] `suitability_responses` table, versioned like profile
- [ ] FinBERT sentiment tagging service for News tab (small Python service — see architecture note below)

## Phase 4 — Portfolio Construction
- [ ] PyPortfolioOpt-based allocation engine (mean-variance / HRP) — Python service
- [ ] Gate every suggestion through the Eligibility Engine before it's shown
- [ ] Explainability output format: evidence / assumptions / invalidation conditions / alternatives considered per suggestion

## Phase 5 — Paper Trading + Self-Diagnosis Loop (proposed, not yet scoped in PROPOSAL.md)
- [ ] `paper_portfolio` table: starting balance, currency, created_at
- [ ] `paper_positions` table: instrument, qty, entry price, entry date, linked to the recommendation that suggested it
- [ ] `paper_transactions` table: every simulated buy/sell, timestamped, with the reasoning trace from Phase 4's explainability output attached
- [ ] `goal_tracking` table: target (e.g. benchmark index, target return, target allocation), actual, deviation, computed on a schedule
- [ ] Deviation diagnosis job: when actual drifts from target beyond a threshold, log a structured "why" (which holdings, which assumption broke, market regime change, etc.) — human-authored diagnostic rules first, not an autonomous rewrite
- [ ] Analytics views: win rate, attribution by module (which signal type drove which outcome), backtested vs live drift
- [ ] Review cadence: a scheduled job that summarizes the last period's deviations and diagnoses for a human (you) to review before any rule change ships — explicitly NOT auto-mutating `lib/eligibility.ts` or the allocation engine's logic on its own. See chat discussion for why full autonomy here is a bad default.

## Python service architecture (needed starting Phase 3)

FinBERT, PyPortfolioOpt, and Qlib are all Python. The Next.js app should
call a small separate Python service (FastAPI, deployed as its own Vercel
Python function or a small dedicated host) rather than trying to run Python
in a Node serverless function. Scope this as its own repo or a `/service`
subfolder — undecided, flag for a decision when Phase 3 starts.
