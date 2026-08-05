# v1.0 Data Sources

| Source | Used by | Auth | Reliability posture |
|---|---|---|---|
| Yahoo Finance unofficial chart endpoint (`query1.finance.yahoo.com/v8/finance/chart/{symbol}`) | `/api/quote` | None | Undocumented, unofficial, no SLA. Can rate-limit or change response shape without notice. Every call is wrapped in try/catch and degrades to a per-symbol `error` field rather than failing the whole request. |
| FRED (Federal Reserve Economic Data) | `/api/macro` | Free API key (`FRED_API_KEY`) | Official, stable, documented. Degrades gracefully (returns a setup message) when no key is configured — this is the one source in v1.0 built to the standard the others should eventually meet. |
| Google News RSS (`news.google.com/rss/search`) | `/api/news` | None | Unofficial use of a public RSS feed. Parsed with regex, not a real XML parser — brittle if Google changes the feed's tag structure. |
| RBI press releases (linked, not fetched) | Macro tab, India section | N/A | Not integrated — just a link-out. No free official India macro API was found during v1.0 research (see `v2-research/RESEARCH.md`). |

## Symbols currently tracked

Defined in `lib/symbols.ts`, not database-backed — editing this list means
editing code and redeploying.

**Indices:** `^GSPC` (S&P 500), `^IXIC` (Nasdaq), `^DJI` (Dow), `^VIX`,
`^NSEI` (Nifty 50), `^BSESN` (Sensex), `^NSEBANK` (Bank Nifty).

**Watchlist:** `AAPL`, `MSFT`, `NVDA`, `INDA` (US), `RELIANCE.NS`, `TCS.NS`
(India, `.NS` suffix = NSE).

## Caching behavior

Each API route sets a `next: { revalidate: N }` hint on its upstream
`fetch()` call, which lets Vercel's data cache serve repeated requests
within the window without re-hitting the upstream source:

- Quotes: 30 seconds
- News: 300 seconds (5 minutes)
- Macro (FRED): 3600 seconds (1 hour) — appropriate since these series
  update daily/monthly/quarterly at most

Combined with `export const dynamic = 'force-dynamic'` on each route (which
disables Next.js's own static/ISR caching layer), this means: the *route* is
always re-invoked, but the *upstream fetch inside it* may be served from
Vercel's cache. This is the right split for personal-use traffic volume —
not necessarily right at higher scale (see `v2-research/PROPOSAL.md`).

## Data you should not trust for real decisions yet

Anything from the Yahoo endpoint should be treated as directionally useful,
not authoritative — it's explicitly unofficial. For anything where getting
the number wrong matters (e.g. confirming an actual fill price, computing
real cost basis, tax reporting), go to your broker's own statements, not
this dashboard.
