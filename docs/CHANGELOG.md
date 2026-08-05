# Changelog

Append-only. Each entry is a version; each version has a matching `docs/vX.Y/`
folder with the full documentation as of that release.

## v1.0 — 2026-08-05

**Type:** Initial release (research dashboard + eligibility engine)

**Shipped:**
- Password-gated Next.js 14 app deployed to Vercel (`ai-wealth-os-lemon.vercel.app`)
- Markets tab: live US + India indices and a starter watchlist (Yahoo Finance unofficial endpoint, 60s refresh)
- Macro tab: US series via FRED (CPI, unemployment, Fed funds, 10Y yield, GDP) — degrades gracefully without an API key; India macro is a link-out (no free API found)
- News tab: searchable headlines via Google News RSS
- Eligibility tab: rules engine evaluating market/instrument combinations against a hardcoded personal profile (F-1/OPT visa, US resident-alien tax status, unconverted India resident brokerage account), flagging PDT rule, F-1 "business" boundary, NRO/PIS conversion requirement, NRI intraday/short-sell ban, and PFIC exposure on Indian mutual funds

**Explicitly not built yet (see `v2-research/PROPOSAL.md`):**
- No persistence — profile, watchlist, and eligibility rules are hardcoded in source, not stored in a database. Nothing survives except by editing code and redeploying.
- No portfolio construction, no recommendations, no suitability questionnaire. This version is read-only research + a compliance filter, on purpose (see `06-CONTINUITY-SUITABILITY-RECOMMENDATIONS.md`).
- No Company Intelligence module (fundamentals, filings, earnings).
- No sentiment/NLP, no quant/factor models.
- Auth is a single shared password, not per-user accounts — fine for a one-user tool, a real gap the moment a second person uses it.

**Known issues:**
- Yahoo Finance chart endpoint is unofficial and undocumented — no SLA, can silently change shape or rate-limit. Flagged in `05-DATA-SOURCES.md`.
- `lib/profile.ts` requires a manual edit + redeploy to update your status. No in-app way to change it yet.
