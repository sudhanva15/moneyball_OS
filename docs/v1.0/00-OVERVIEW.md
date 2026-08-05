# v1.0 Overview

## What this is

A private, single-user research dashboard for personal investing decisions
across US and India markets, plus an eligibility engine that checks any
instrument you're considering against your actual legal/tax/visa situation
before you act on it. It is explicitly **not** a recommendation engine, a
trading platform, or a client-facing advisory product — see
`06-CONTINUITY-SUITABILITY-RECOMMENDATIONS.md` for why that boundary is
deliberate and what it would take to cross it responsibly.

## Who it's for

One user: you. The whole compliance posture (see the project's top-level
`README.md`) rests on this being a tool you use to advise yourself, not a
service you provide to anyone else. The password gate exists to keep it
private, not to support multiple accounts.

## The four modules, one sentence each

| Module | What it does |
|---|---|
| Markets | Live prices for US + India indices and a watchlist you edit in code. |
| Macro | Headline US economic indicators from FRED; India macro is a stub pointing at RBI's site. |
| News | Searchable financial headlines from Google News. |
| Eligibility | Given a market + instrument type, tells you ELIGIBLE / CAUTION / ACTION_NEEDED / BLOCKED and why, based on your hardcoded profile. |

## What "done" means for v1.0

v1.0 is done when it correctly answers two questions for you, live, on any
device: "what's the market doing right now" and "can I actually act on this
idea given my visa/tax/account situation." It does not attempt to answer
"what should I buy" — that's a later version's job, and a much harder
compliance and quality bar to clear (see `06-...md`).
