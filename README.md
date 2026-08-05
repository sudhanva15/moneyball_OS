> **Full documentation:** see [`docs/README.md`](docs/README.md) for the versioned
> doc set — user flow, UI legend, architecture, eligibility logic, data
> sources, and the continuity/suitability/recommendations boundaries — plus
> `docs/v2-research/` for the researched proposal for what's next.

# AI Wealth OS — v1 (Research Dashboard)

A private, personal research dashboard: US + India market indices and watchlist,
a US macro snapshot, headline news, and an eligibility checker that flags
trading/investing constraints specific to your visa/tax/account situation.

This is **not** a client-facing investment advisory product. It's a personal
decision-support tool for one user. See the compliance notes below before
ever sharing access with anyone else.

## Stack

- Next.js 14 (App Router) + TypeScript + Tailwind, deployed on Vercel
- No database — all data is fetched live from free sources on each page load
- Password-gated via middleware (see "Access" below)

## Data sources (all free tier)

| Module | Source | Notes |
|---|---|---|
| Market indices/watchlist | Yahoo Finance unofficial chart endpoint | No key needed. Unofficial — can break/rate-limit; fine for personal use. |
| US macro | [FRED](https://fred.stlouisfed.org/docs/api/api_key.html) | Free API key required for live data (`FRED_API_KEY`); degrades gracefully without one. |
| India macro | — | No good free API found yet (RBI DBIE has no public REST API). Manual link-out for now. |
| News | Google News RSS | No key needed. |

## Access

The whole app is behind a shared password (`middleware.ts` + `/login`).
Default password: **`wealthos-8842-kite`** — change it by setting a
`SITE_PASSWORD` environment variable in the Vercel project settings and
redeploying. This is intentionally lightweight (a single shared secret, not
per-user accounts) because this is a single-user personal tool, not a
multi-tenant product.

## Editing your profile / eligibility rules

- `lib/profile.ts` — your visa status, US tax residency, India account status.
  Update this whenever your situation changes (e.g. OPT → H-1B, or once you
  set up an NRO/PIS account).
- `lib/eligibility.ts` — the rules engine that reads your profile and flags
  constraints per market/instrument type. Rules are written as plain
  TypeScript with inline citations to *what* rule they encode (FEMA/RBI PIS,
  IRS PFIC, FINRA PDT, etc.) — extend this file as you learn more edge cases.

None of this is legal, tax, or immigration advice — it's a structured way to
not forget real constraints. Verify anything consequential with a
cross-border CPA / immigration attorney.

## Roadmap (not yet built)

Ordered roughly by what unlocks the most value next:

1. **Company Intelligence** — fundamentals lookup (10-K/10-Q pulls, earnings
   calendar) per ticker.
2. **India macro** — find/replace the missing free RBI data source, or
   maintain a small manually-updated series.
3. **Client Discovery Engine** — a persistent "financial DNA" profile (income,
   goals, risk tolerance, horizon) that other modules read from, per your
   original spec.
4. **Portfolio Construction Engine** — rules-based allocation + rebalancing
   suggestions, gated through the Eligibility Engine so it never recommends
   something you can't legally act on.
5. **Open-source model evaluation** — before building custom NLP/sentiment or
   forecasting models from scratch, assess existing open-source options
   (e.g. FinBERT-style sentiment models, forecasting libraries like
   `statsmodels`/`prophet`, portfolio optimization via `PyPortfolioOpt`,
   quant research stacks like Microsoft's `Qlib`) for quality and license fit.
   Adopt/fine-tune what's good, replace what isn't, before investing in a
   fully custom model.
6. **Quantitative + Technical modules** — once the above land, layer in
   factor models, regime detection, and technical indicators as additional
   inputs (not the primary decision driver).

## Local development

```bash
npm install
npm run dev
```

## Deploying updates

This was deployed directly (no git repo) via the Vercel MCP tool. To make
changes: edit files, then redeploy the same way, or connect this folder to a
GitHub repo and link it to the existing Vercel project for normal git-based
deploys.
