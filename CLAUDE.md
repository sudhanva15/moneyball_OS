# Project context for Claude Code

Read this first. This repo is "AI Wealth OS" (working name Moneyball) — a
private, single-user investment research dashboard + eligibility engine,
being built toward a fuller wealth-intelligence platform. Full history and
reasoning live in `docs/` — read `docs/README.md` first, then whichever
`docs/vX.Y/` doc is relevant to what you're working on. `docs/v2-research/PROPOSAL.md`
and `TASKS.md` are the current roadmap.

## Non-negotiable constraints (do not relitigate these without flagging it)

- **Single user, not a client-facing product.** The whole compliance posture
  (no RIA/SEBI registration needed) rests on this being personal-use only.
  Never build multi-tenant auth, never add a second user, without stopping
  to flag it first — see `docs/v1.0/03-ARCHITECTURE.md` and
  `docs/v1.0/06-CONTINUITY-SUITABILITY-RECOMMENDATIONS.md`.
- **Eligibility Engine gates everything.** Any future recommendation surface
  (Phase 4+) must run through `lib/eligibility.ts` before it's shown. Never
  bypass it.
- **No autonomous self-modifying logic.** Phase 5's diagnosis loop logs
  structured "why" data for human review — it must never auto-rewrite
  `lib/eligibility.ts`, `lib/profile.ts`, or the allocation engine's rules on
  its own. See `TASKS.md` Phase 5 notes.
- **Compliance-sensitive text (eligibility reasons, disclaimers) is
  hand-authored, not generated at runtime.** Keep it that way — auditability
  over freshness, per `docs/v1.0/04-ELIGIBILITY-LOGIC.md`.

## Workflow this repo uses

- Work items live as GitHub issues (converted from `TASKS.md`), picked up by
  GitHub Copilot's coding agent, Google Jules, Claude Code (you), or worked
  directly by Claude via Cowork — whichever fits the task.
- PRs that are additive/tested/non-financial-logic can auto-merge once CI
  passes. Anything touching `lib/eligibility.ts`, `lib/profile.ts`, or
  financial decision logic needs explicit human (or cross-agent) review
  before merge — don't self-merge those.
- Update `docs/CHANGELOG.md` and check off `TASKS.md` items as you complete
  them, so the next session (whichever tool runs it) has an accurate picture.
- This project is also being worked from Claude in Cowork mode (separate
  session, same repo) — assume parallel work may be happening; `git pull`
  before starting, and keep commits scoped/small to avoid conflicts.

## Stack quick reference

Next.js 14 App Router + TypeScript + Tailwind, deployed on Vercel
(`ai-wealth-os-lemon.vercel.app`, project `ai-wealth-os` — note: Vercel
project name predates this repo's rename to `moneyball_OS`, don't let that
confuse you). No database yet (Phase 1 adds Neon Postgres). Password-gated
via `middleware.ts` — see `docs/v1.0/03-ARCHITECTURE.md` for why that's the
right call at this stage.
