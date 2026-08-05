# Changelog

Append-only. Each entry is a version; each version has a matching `docs/vX.Y/`
folder with the full documentation as of that release.

## Unreleased — eligibility ticker wiring (2026-08-05)

- `lib/eligibility.ts`: `checkEligibility()` now references the entered ticker (when present) in a hand-authored reminder reason, closing the "ticker is cosmetic" gap noted in `docs/v1.0/02-UI-GUIDE.md` and issue #4. Status/rule branching still depends only on market + instrument type — the ticker is echoed back as a reminder to check the specific symbol's own listing details, not used to alter the rules engine's logic.
- Updated `docs/v1.0/02-UI-GUIDE.md` to reflect the above.

## Unreleased — multi-agent workflow setup (2026-08-05)

- Repo published to GitHub: https://github.com/sudhanva15/moneyball_OS
- Added `CLAUDE.md` (cross-tool/cross-session project context for Claude Code and any fresh agent session)
- Added `.github/workflows/ci.yml` (install, typecheck, build) and `.github/workflows/auto-merge.yml` (auto-enables merge on PRs that don't touch `lib/eligibility.ts`/`lib/profile.ts`; comments explaining the hold on ones that do)
- Opened issues #1-#4 for the remaining Phase 1 backlog (Neon Postgres + tables, data migration, settings page, eligibility ticker wiring)
- **Known gap:** attempted to auto-assign issue to GitHub Copilot's coding agent via `assignees: ["copilot-swe-agent"]` — failed (issue creation without an assignee succeeds; adding that assignee fails). Likely cause: Copilot coding agent not yet enabled on this repo (Settings → Copilot → Coding agent), or the bot's actual login differs. Unresolved — needs a manual check in the GitHub UI to confirm whether "Copilot" appears as an assignable user on an issue.
- Auto-merge workflow also depends on two repo settings not yet confirmed: "Allow auto-merge" (Settings → General) and, ideally, a branch protection rule requiring the CI check on `main`.

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
