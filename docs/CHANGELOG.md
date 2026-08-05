# Changelog

Append-only. Each entry is a version; each version has a matching `docs/vX.Y/`
folder with the full documentation as of that release.

## Unreleased — agent-dispatch: fixed token type + self-reporting (2026-08-05)

- `.github/workflows/agent-dispatch.yml` now also fires on an `/agent` (or `/agent <model-slug>`) comment on an issue, not just an `agent:*` label — covers issues #1-#3, which predate this workflow and have no label-trigger path. Merged with PR #6's ticker-wiring changes via `git merge origin/main` (commit `ad0980f`); `next-env.d.ts` and `tsconfig.tsbuildinfo` moved to `.gitignore` (generated files, shouldn't have been committed).
- **Root-caused a run of failed dispatches:** the workflow always posts its result (HTTP status + response body) as a comment on the triggering issue now, since Actions log viewing on this repo requires a signed-in GitHub session that isn't always available. That surfaced the real error: `403 {"message":"forbidden"}`.
- Per [GitHub's Agent Tasks API docs](https://docs.github.com/en/rest/agent-tasks/agent-tasks), the "Start a task" endpoint does **not** accept classic PATs at all — only a fine-grained PAT (repo-scoped, "Agent tasks" permission set to Read and write) or a GitHub App user access token. The original setup instructions in this workflow's header comment (classic PAT, `repo` scope) were wrong; corrected. `AGENT_TASK_PAT` needs to be regenerated as a fine-grained token before dispatch will work.
- Also corrected the example model slugs in the workflow comment (`claude-sonnet-4.6` etc., per the current docs) — the earlier `claude-sonnet-5` example didn't match any value the API actually accepts.

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

- Added `.github/workflows/agent-dispatch.yml`: labeling an issue `agent:*` calls GitHub's Agent Tasks API (`POST /agents/repos/{owner}/{repo}/tasks`) directly, replacing the manual "Assign to Agent" UI click. Confirmed via GitHub's own docs that this API rejects server-to-server tokens (rules out the default `GITHUB_TOKEN` and the GitKraken connector) — requires a classic PAT stored as repo secret `AGENT_TASK_PAT`. Not yet set up — see `TASKS.md`.

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
