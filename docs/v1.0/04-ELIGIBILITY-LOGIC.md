# v1.0 Eligibility Engine — Logic Reference

## Purpose

Given a proposed `{ market, instrument type, ticker? }`, return a status
(`ELIGIBLE` / `CAUTION` / `ACTION_NEEDED` / `BLOCKED`) and a list of specific,
sourced reasons — so that before you act on any research from the Markets or
News tabs, you can sanity-check whether your actual visa/tax/account
situation lets you act on it cleanly. See `lib/eligibility.ts` and
`lib/profile.ts` for the source.

## Inputs it does NOT use (yet)

- **Ticker.** Collected in the UI, passed into `checkEligibility()`, but
  unused by every current rule. All rules branch on market + instrument type
  only. A future version could use the ticker to, e.g., look up a specific
  company's sector for concentration limits, or check a specific mutual
  fund's AMC against the FATCA-acceptance list — neither exists yet.
- **Position size, account balance, existing holdings.** No portfolio
  context at all. A CAUTION about the FINRA Pattern Day Trader rule fires
  regardless of whether you have $500 or $500,000 in the account.
- **Time.** Rules are static. If FEMA/RBI/IRS rules change, or your profile
  changes, nothing updates until you edit `lib/profile.ts` and redeploy.

## The profile it reads (`lib/profile.ts`)

```
usVisaStatus:        'F1_OPT_CPT'
usTaxResidency:       'RESIDENT_ALIEN'
indiaAccountStatus:   'RESIDENT_ACCOUNT_UNCONVERTED'
hasUsBrokerage:        false
```

Every rule in `checkEligibility()` reads these four fields (never anything
else), so updating your situation is a matter of changing this one file.

## Status semantics

| Status | Meaning | How it's produced |
|---|---|---|
| `ELIGIBLE` | No rule flagged a concern for this market/instrument combination. | Default; stays this way unless a rule downgrades it. |
| `CAUTION` | Legal to do, but there's a broker rule, tax wrinkle, or ambiguity worth knowing before you do it. | e.g. FINRA PDT rule on US options; NRI intraday/short-sell ban on India equities. |
| `ACTION_NEEDED` | You need to complete a step (open an account, convert an account type) before this is actually available to you. | e.g. India equities while `indiaAccountStatus` is `NONE` or `RESIDENT_ACCOUNT_UNCONVERTED`. |
| `BLOCKED` | Strongly discouraged given your specific tax/immigration facts — not illegal outright, but the downside (punitive tax treatment, compliance burden) is severe enough to warn hard. | Indian mutual funds while `usTaxResidency` is `RESIDENT_ALIEN`/`US_CITIZEN` (PFIC exposure). |

Statuses combine via a strict "worst wins" rule (`worst()` in the source) —
if multiple rules fire, the overall status is the most severe one, but
**every** reason from every rule that fired is still shown, not just the
reason for the worst status.

## Rule inventory (as of v1.0)

| # | Trigger | Status contribution | Source of the rule |
|---|---|---|---|
| 1 | US market + options/derivatives | CAUTION | FINRA Pattern Day Trader rule (broker-enforced, not immigration law) |
| 2 | US market + equity/ETF/options, visa = F1_OPT_CPT | (informational, no downgrade) | Consensus immigration-attorney reading of "employment" under INA — personal investing isn't labor-for-hire |
| 3 | India market + `indiaAccountStatus = RESIDENT_ACCOUNT_UNCONVERTED` | ACTION_NEEDED | FEMA / RBI requirement to convert to NRO + PIS on becoming NRI |
| 4 | India market + `indiaAccountStatus = NONE` | ACTION_NEEDED | Same — no account exists yet |
| 5 | India market + equity | CAUTION | RBI/FEMA ban on intraday trading and short-selling in the cash segment for NRIs; F&O needs separate approval; per-company NRI shareholding caps |
| 6 | India market + mutual fund, US tax resident | BLOCKED | IRS PFIC classification of foreign mutual funds (Form 8621, punitive tax) + most Indian AMCs declining US-based NRIs under FATCA |
| 7 | India market + mutual fund, not US tax resident | CAUTION | Generic reminder to confirm AMC accepts NRIs from your country |
| 8 | Any market + crypto | CAUTION | India: 30% flat tax + 1% TDS, no loss offset, unsettled FEMA treatment. US: taxable property, straightforward but track cost basis |

## What "reasons" actually are

Each reason is a hand-written string embedded directly in `lib/eligibility.ts`,
not generated or fetched at runtime. That means: (a) they never go stale
silently — if a regulation changes, the string still says the old thing until
someone edits it; (b) they're fully auditable by reading one file; (c) there's
no hallucination risk from an LLM generating compliance text on the fly. This
trade-off (accuracy and auditability over freshness) is intentional for a
compliance-adjacent feature — see `v2-research/PROPOSAL.md` for how a future
version might add a "last verified" date per rule without giving up the
hand-authored-text guarantee.

## Explicit non-goal

This engine does not, and per the project's compliance posture (top-level
`README.md`) should not, ever output something that could be read as "you
should buy X." Its only job is gating: telling you whether a category of
instrument is clean to act on, never which specific instrument to act on.
