# v1.0 UI Guide — what indicates what

This is the legend. If a screenshot were embedded here (see
`screenshots/README.md` for why it isn't yet), this is the page it would
annotate.

## Global

| Element | Meaning |
|---|---|
| Top-right pill nav (Markets / Macro / News / Eligibility) | Current tab is filled blue (`bg-accent`); others are gray and lighten on hover. |
| Header subtitle "Personal research dashboard — not investment advice." | Permanent disclaimer, always visible, not dismissible. Intentional — see `06-CONTINUITY-SUITABILITY-RECOMMENDATIONS.md`. |

## Markets tab

| Element | Meaning |
|---|---|
| Row label + small gray ticker underneath | Human name (e.g. "S&P 500") over the raw symbol Yahoo Finance uses (e.g. `^GSPC`). |
| Price column | Last traded price in the instrument's native currency (not shown per-row in v1.0 — a gap; see roadmap). |
| ▲ green / ▼ red percentage | Change vs. previous close. Green = up, red = down. `—` means the quote failed to load (see "n/a" below). |
| `n/a` in the price column | The upstream Yahoo endpoint errored or returned no data for that symbol — not a zero price, an unknown one. Don't read this as "worthless." |
| "refreshing…" text next to a section header | That section's 60-second poll is in flight. |
| US / INDIA tag, far right | Which market the row belongs to — purely informational, doesn't affect eligibility (the Eligibility tab does that, separately, on demand). |

## Macro tab

| Element | Meaning |
|---|---|
| Yellow message box at the top | Present only when `FRED_API_KEY` isn't configured. It's a setup instruction, not an error about your data. |
| Series row | Label + FRED series ID + observation date (when available) on the left, latest value on the right. `—` means no key configured, not "zero." |
| India macro note at the bottom | Permanent — there is no live India section yet, just a link to RBI's press releases. |

## News tab

| Element | Meaning |
|---|---|
| Search box | Free-text query passed straight to Google News RSS search syntax (supports `OR`, quoted phrases, etc.). |
| Headline link | Opens the original source in a new tab. The dashboard never hosts or reproduces full article text. |
| Small gray line under each headline | Source name (when Google News provides one) and published time, localized to your device. |

## Eligibility tab

| Element | Meaning |
|---|---|
| "Your Profile" card | A static read-out of `lib/profile.ts` — your visa status, US tax residency, and India account status, in your own words (the `notes` field). This is not editable in the UI in v1.0. |
| Market / Instrument type / Ticker controls | Ticker is currently cosmetic — the rules engine doesn't branch on the specific symbol, only on market + instrument type. Typing a ticker doesn't change the result in v1.0. |
| Status badge colors | Green = ELIGIBLE. Amber = CAUTION or ACTION_NEEDED (same color, different headline text — see below). Red = BLOCKED. |
| Badge headline text | `Eligible` / `Eligible, with caveats` / `Action needed before trading` / `Not recommended for your situation` — read the headline, not just the color, since CAUTION and ACTION_NEEDED share a color. |
| Bulleted reasons below the badge | Every rule that fired, each with a plain-English explanation and (where relevant) what regulation or broker rule it's based on. Multiple reasons can appear even for an ELIGIBLE result — read them, they're not just failure messages. |
| Fine print at the bottom of the card | Permanent disclaimer that this is not legal/tax/immigration advice. |

## Color legend (applies across tabs)

| Color | Used for |
|---|---|
| Green (`good`) | Positive price change; ELIGIBLE status. |
| Red (`bad`) | Negative price change; BLOCKED status; login error text. |
| Amber (`warn`) | CAUTION / ACTION_NEEDED status; the FRED setup notice. |
| Blue (`accent`) | Active tab, primary buttons, links. |
