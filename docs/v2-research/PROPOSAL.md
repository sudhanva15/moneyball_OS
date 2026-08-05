# v2 Proposal — prioritized

Synthesized from `RESEARCH.md` plus the gaps documented across the v1.0 docs
(especially `01-USER-FLOW.md`'s "conspicuously absent" section,
`02-UI-GUIDE.md`'s eligibility-ticker gap, and `06-CONTINUITY-...md`'s
description of what's missing). Ordered by what unlocks the most value per
unit of effort, with infrastructure deliberately front-loaded because
several later items depend on it.

## Phase 1 — Foundations (infrastructure, no new user-facing modules)

1. **Git repo behind the Vercel project.** Right now deploys are a raw file
   tree push with no history. Connect a GitHub repo so every deploy has a
   diff, a commit message, and the option of CI checks before merge. This is
   the single highest-leverage change with the lowest risk.
2. **Neon Postgres.** Add a database. First tables: `profile` (versioned
   snapshots, not a mutable singleton — every edit creates a new row with a
   timestamp, so you can see what you believed and when) and `watchlist`
   (so editing your tracked symbols doesn't require a code change).
3. **In-app profile editor.** Once `profile` is a database table, add a
   simple settings page so updating visa/tax/account status doesn't require
   touching `lib/profile.ts` and redeploying. This directly fixes the
   "no continuity" gap in `06-CONTINUITY-SUITABILITY-RECOMMENDATIONS.md`.
4. **Fix the eligibility-ticker gap.** Documented in `02-UI-GUIDE.md`: the
   ticker field is currently cosmetic. At minimum, wire it through so a
   result can reference the specific symbol in its reasoning text (even
   without new rules, "you asked about RELIANCE.NS" beats a generic answer).

## Phase 2 — Company Intelligence (Module 7)

5. **SEC EDGAR integration** for US equities: `companyfacts` and
   `xbrl/frames` endpoints, free and official, respecting the 10 req/sec
   rate limit (add Upstash-based rate limiting here — this is the point
   where a shared limiter earns its keep). Surface revenue, margins, cash
   flow trends per ticker.
6. **India equity fundamentals** via Twelve Data's free tier, accepting the
   ~4-hour delay — the honest trade-off documented in `RESEARCH.md` section 2.
7. **Price history charts** using TradingView's Lightweight Charts —
   replaces the current single-number price display with real candlestick/
   line history on the Markets tab and any new per-company page.

## Phase 3 — Suitability (Module 1, the part Eligibility doesn't cover)

8. **Intake questionnaire**: risk tolerance (a real instrument, not a
   slider), risk capacity (derived from income/expenses/emergency fund),
   time horizon per goal, liquidity needs. Stored in Neon, versioned like
   the profile.
9. **News sentiment tagging** via FinBERT (adopted, not built) — tag each
   headline positive/negative/neutral, letting the News tab filter/sort by
   sentiment. Requires a small Python service alongside the Next.js app
   (see `RESEARCH.md` section 7 on why this can't run in-process).

## Phase 4 — Portfolio Construction (Module 11) — the highest-stakes phase

10. **Rules-based allocation engine** built on PyPortfolioOpt (adopted, not
    built from scratch) — mean-variance or Hierarchical Risk Parity given a
    suitability profile. Every output gated through the existing Eligibility
    Engine so nothing recommended is something you can't act on (Phase 1's
    work makes this gating cheap — Phase 4 is downstream of it, not
    parallel).
11. **Explainability layer**: every suggestion carries what evidence
    supported it, what assumptions were used, what would invalidate it, and
    what alternatives were considered — the differentiator from the
    original spec, and the thing that separates this from "AI stock picker"
    territory. This is a documentation/output-format requirement on top of
    #10, not a separate model.

## Explicitly deferred past v2

Qlib (Module 10, full quant/factor modeling) and FinGPT (broader financial
LLM reasoning) are both real, adoptable, open-source options per
`RESEARCH.md`, but neither has a clear job to do until Phases 2-4 exist —
factor models need Company Intelligence data to run on, and a financial LLM
needs a suitability + portfolio context to reason about. Revisit after
Phase 4 ships.

## What doesn't change

The compliance posture stays the same at every phase: single user, no
"advising others," Eligibility Engine gates every recommendation surface
before it ships (not after). If a future phase ever considers opening
access to a second person, stop and revisit the compliance research from
v1.0's kickoff before writing code — that's the one decision this proposal
deliberately doesn't make on your behalf.
