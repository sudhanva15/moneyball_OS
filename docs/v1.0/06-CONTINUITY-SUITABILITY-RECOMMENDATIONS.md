# Continuity, Suitability, and Recommendations — where v1.0 stands

These three concepts come straight from the original project brief (the "AI
Wealth Intelligence Platform" spec — Module 1: Client Discovery Engine,
Module 11: Portfolio Construction, and the "continuously update, don't just
ask once" principle). v1.0 deliberately does not build most of this yet.
This doc explains exactly where the line is today and what crossing it
would require, so the gap is a documented decision, not an oversight.

## Continuity

**What it means in the original spec:** a "dynamic financial DNA" — income,
goals, risk tolerance, life events, tax situation — that's continuously
updated rather than captured once and left stale.

**Where v1.0 actually is:** there is no continuity. `lib/profile.ts` is a
static snapshot, hand-edited, with no timestamp, no history, and no prompts
to revisit it. If your visa status changes tomorrow, the app has no idea
until someone edits the file and redeploys. There's no database, so nothing
persists across deployments except what's committed to source.

**What real continuity would require:** a persistent store (see
`v2-research/PROPOSAL.md` for options), a data model with versioned profile
snapshots (not just a mutable current state — you want to be able to see
"what did I believe about my status on this date," which matters if you ever
need to reconstruct your reasoning for a tax filing), and some mechanism —
even just a periodic prompt — to actually revisit the profile instead of
letting it silently go stale.

## Suitability

**What it means in the original spec:** matching recommendations to risk
tolerance, risk capacity, risk need, investment horizon, and liquidity needs
— the core of what makes advice "suitable" for a given person rather than
generically reasonable.

**Where v1.0 actually is:** there is no suitability assessment. The
Eligibility Engine (`04-ELIGIBILITY-LOGIC.md`) is adjacent but answers a
narrower, binary-ish question — "can you legally/practically act on this
category of instrument" — not "should you, given your goals and risk
tolerance." Those are genuinely different questions. Eligibility is closer
to a legal/regulatory filter; suitability is a judgment call about fit.

**What real suitability would require:** the actual intake questionnaire
from Module 1 of the original spec — risk tolerance (with a real
instrument, not a vibes-based slider), risk capacity (computed from income,
expenses, emergency fund, dependents), time horizon per goal, and liquidity
needs. This is a substantial build on its own and should probably come
*after* Company Intelligence and before Portfolio Construction in the
roadmap, since suitability data is what Portfolio Construction would need as
an input.

## Recommendations

**What it means in the original spec:** actual buy/sell/hold guidance,
portfolio construction, rebalancing suggestions — the "what should I do"
layer sitting on top of everything else.

**Where v1.0 actually is:** zero recommendation surface. Nothing in the app
tells you to buy, sell, hold, or rebalance anything. This is the most
consequential boundary in the whole product, and it's deliberate for two
reasons:

1. **Compliance.** The whole reason personal-use investment tooling can skip
   Investment Adviser registration (US) / SEBI IA registration (India) is
   that it's not "advising others" — see the compliance research from the
   v1.0 kickoff conversation. That reasoning holds for a *research and
   eligibility* tool. A recommendation engine doesn't change who's allowed
   to use it (still just you), but it raises the bar on what "good enough
   to act on" means, because now the tool's output is a genuine input to a
   financial decision, not just a filter or a data feed.
2. **Quality bar.** A recommendation is only as good as the reasoning behind
   it — market data + macro context + your suitability profile + your
   eligibility constraints + explainability (why this, what evidence, what
   could invalidate it). Shipping recommendations before most of those
   inputs exist would mean shipping recommendations that are really just
   guesses wearing a UI.

**What it would take to responsibly add recommendations:** at minimum,
Company Intelligence (fundamentals, not just price) and Suitability (above)
need to exist first, so a recommendation has something real to be based on.
Even then, the original spec's instinct is right: the differentiator should
be an explainable, auditable *reasoning pipeline* per recommendation (what
evidence, what assumptions, what would invalidate it, what alternatives were
considered) — not a black-box "buy this" output. `v2-research/PROPOSAL.md`
sequences this as a later phase, deliberately after the boring infrastructure
(persistence, Company Intelligence) that makes it possible to do well.

## The honest summary

v1.0 is the eligibility/compliance layer plus a data feed. It's the
foundation the original spec's Modules 1 (partially, via Eligibility), 2
(partially), 3, and 6 sit on. Modules 1 (fully), 7, 11, and the
explainability engine are the next real frontier, and they're sequenced in
`v2-research/PROPOSAL.md`.
