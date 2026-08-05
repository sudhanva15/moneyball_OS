'use client';

import { useEffect, useMemo, useState } from 'react';
import { INDEX_SYMBOLS, DEFAULT_WATCHLIST, SymbolDef } from '@/lib/symbols';
import {
  checkEligibility,
  badgeClasses,
  EligibilityResult,
  Market,
  InstrumentType,
} from '@/lib/eligibility';
import { profile } from '@/lib/profile';

type Tab = 'markets' | 'macro' | 'news' | 'eligibility';

interface Quote {
  symbol: string;
  price: number | null;
  previousClose: number | null;
  changePercent: number | null;
  currency: string | null;
  marketState: string | null;
  error?: string;
}

function fmt(n: number | null, digits = 2) {
  if (n == null || Number.isNaN(n)) return '—';
  return n.toLocaleString(undefined, { maximumFractionDigits: digits, minimumFractionDigits: digits });
}

function ChangeBadge({ pct }: { pct: number | null }) {
  if (pct == null) return <span className="text-neutral-500 text-sm">—</span>;
  const positive = pct >= 0;
  return (
    <span className={`text-sm font-medium ${positive ? 'text-good' : 'text-bad'}`}>
      {positive ? '▲' : '▼'} {fmt(Math.abs(pct))}%
    </span>
  );
}

function QuoteRow({ def, quote }: { def: SymbolDef; quote?: Quote }) {
  return (
    <tr className="border-b border-border/60 last:border-0">
      <td className="py-2 pr-4">
        <div className="text-sm text-white">{def.label}</div>
        <div className="text-xs text-neutral-500">{def.symbol}</div>
      </td>
      <td className="py-2 pr-4 text-sm text-neutral-200">
        {quote?.error ? <span className="text-neutral-600">n/a</span> : fmt(quote?.price ?? null)}
      </td>
      <td className="py-2 pr-4">
        <ChangeBadge pct={quote?.changePercent ?? null} />
      </td>
      <td className="py-2 text-xs text-neutral-500">{def.market}</td>
    </tr>
  );
}

function useQuotes(symbols: SymbolDef[]) {
  const [quotes, setQuotes] = useState<Record<string, Quote>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const res = await fetch(`/api/quote?symbols=${symbols.map((s) => s.symbol).join(',')}`);
        const data = await res.json();
        if (cancelled) return;
        const map: Record<string, Quote> = {};
        (data.quotes || []).forEach((q: Quote) => (map[q.symbol] = q));
        setQuotes(map);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    const interval = setInterval(load, 60000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [symbols]);

  return { quotes, loading };
}

function MarketsTab() {
  const { quotes: indexQuotes, loading: loadingIndexes } = useQuotes(INDEX_SYMBOLS);
  const { quotes: watchQuotes, loading: loadingWatch } = useQuotes(DEFAULT_WATCHLIST);

  return (
    <div className="space-y-6">
      <div className="bg-panel border border-border rounded-xl p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-white">Indices</h2>
          {loadingIndexes && <span className="text-xs text-neutral-500">refreshing…</span>}
        </div>
        <table className="w-full">
          <tbody>
            {INDEX_SYMBOLS.map((def) => (
              <QuoteRow key={def.symbol} def={def} quote={indexQuotes[def.symbol]} />
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-panel border border-border rounded-xl p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-white">Watchlist</h2>
          {loadingWatch && <span className="text-xs text-neutral-500">refreshing…</span>}
        </div>
        <table className="w-full">
          <tbody>
            {DEFAULT_WATCHLIST.map((def) => (
              <QuoteRow key={def.symbol} def={def} quote={watchQuotes[def.symbol]} />
            ))}
          </tbody>
        </table>
        <p className="text-xs text-neutral-500 mt-3">
          Edit <code className="text-neutral-400">lib/symbols.ts</code> to change what shows up here.
        </p>
      </div>
    </div>
  );
}

interface MacroSeries {
  id: string;
  label: string;
  latest: number | null;
  previous: number | null;
  date: string | null;
}

function MacroTab() {
  const [data, setData] = useState<{ enabled: boolean; message?: string; series: MacroSeries[] } | null>(
    null
  );

  useEffect(() => {
    fetch('/api/macro')
      .then((r) => r.json())
      .then(setData)
      .catch(() => setData({ enabled: false, series: [] }));
  }, []);

  return (
    <div className="bg-panel border border-border rounded-xl p-5">
      <h2 className="text-sm font-semibold text-white mb-1">US Macro Snapshot</h2>
      <p className="text-xs text-neutral-500 mb-4">Source: FRED (Federal Reserve Economic Data)</p>

      {data && !data.enabled && (
        <div className="text-sm text-warn bg-warn/10 border border-warn/30 rounded-lg p-3 mb-4">
          {data.message}
        </div>
      )}

      {data && (
        <table className="w-full">
          <tbody>
            {data.series.map((s) => (
              <tr key={s.id} className="border-b border-border/60 last:border-0">
                <td className="py-2 pr-4">
                  <div className="text-sm text-white">{s.label}</div>
                  <div className="text-xs text-neutral-500">{s.id}{s.date ? ` · ${s.date}` : ''}</div>
                </td>
                <td className="py-2 text-sm text-neutral-200">{s.latest == null ? '—' : fmt(s.latest, 2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div className="mt-4 text-xs text-neutral-500 border-t border-border pt-3">
        India macro (RBI repo rate, CPI, forex reserves) doesn't have a clean free API yet — for now, check{' '}
        <a className="text-accent underline" href="https://www.rbi.org.in/Scripts/BS_PressReleaseDisplay.aspx" target="_blank" rel="noreferrer">
          RBI press releases
        </a>{' '}
        directly. Flagged on the roadmap.
      </div>
    </div>
  );
}

interface NewsItem {
  title: string;
  link: string;
  source: string | null;
  pubDate: string | null;
}

function NewsTab() {
  const [query, setQuery] = useState('stock market OR macroeconomy');
  const [items, setItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/news?q=${encodeURIComponent(query)}`)
      .then((r) => r.json())
      .then((d) => setItems(d.items || []))
      .finally(() => setLoading(false));
  }, [query]);

  return (
    <div className="bg-panel border border-border rounded-xl p-5">
      <div className="flex items-center justify-between mb-3 gap-3">
        <h2 className="text-sm font-semibold text-white">News</h2>
        <input
          className="bg-base border border-border rounded-lg px-3 py-1.5 text-sm text-white outline-none focus:border-accent w-64"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search headlines…"
        />
      </div>
      {loading && <p className="text-xs text-neutral-500">Loading…</p>}
      <ul className="space-y-3">
        {items.map((item, i) => (
          <li key={i} className="border-b border-border/60 pb-3 last:border-0">
            <a
              href={item.link}
              target="_blank"
              rel="noreferrer"
              className="text-sm text-neutral-200 hover:text-accent transition"
            >
              {item.title}
            </a>
            <div className="text-xs text-neutral-500 mt-1">
              {item.source || 'Google News'} {item.pubDate ? `· ${new Date(item.pubDate).toLocaleString()}` : ''}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function EligibilityTab() {
  const [market, setMarket] = useState<Market>('US');
  const [type, setType] = useState<InstrumentType>('EQUITY');
  const [ticker, setTicker] = useState('');
  const [result, setResult] = useState<EligibilityResult | null>(null);

  function run() {
    setResult(checkEligibility({ market, type, ticker: ticker || undefined }));
  }

  useEffect(() => {
    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-6">
      <div className="bg-panel border border-border rounded-xl p-5">
        <h2 className="text-sm font-semibold text-white mb-1">Your Profile</h2>
        <p className="text-xs text-neutral-500 mb-3">Edit lib/profile.ts to update this as your status changes.</p>
        <p className="text-sm text-neutral-300">{profile.notes}</p>
      </div>

      <div className="bg-panel border border-border rounded-xl p-5">
        <h2 className="text-sm font-semibold text-white mb-4">Eligibility Check</h2>
        <div className="flex flex-wrap gap-3 mb-4">
          <select
            value={market}
            onChange={(e) => setMarket(e.target.value as Market)}
            className="bg-base border border-border rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-accent"
          >
            <option value="US">US market</option>
            <option value="INDIA">India market</option>
          </select>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as InstrumentType)}
            className="bg-base border border-border rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-accent"
          >
            <option value="EQUITY">Equity / stock</option>
            <option value="ETF">ETF</option>
            <option value="MUTUAL_FUND">Mutual fund</option>
            <option value="OPTION_DERIVATIVE">Options / derivatives</option>
            <option value="CRYPTO">Crypto</option>
            <option value="BOND_FIXED_INCOME">Bonds / fixed income</option>
          </select>
          <input
            value={ticker}
            onChange={(e) => setTicker(e.target.value)}
            placeholder="Ticker (optional)"
            className="bg-base border border-border rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-accent w-40"
          />
          <button
            onClick={run}
            className="bg-accent text-white text-sm font-medium rounded-lg px-4 py-2 hover:opacity-90 transition"
          >
            Check
          </button>
        </div>

        {result && (
          <div className="space-y-3">
            <span className={`inline-block text-xs font-medium rounded-full px-3 py-1 ${badgeClasses(result.status)}`}>
              {result.headline}
            </span>
            <ul className="space-y-2">
              {result.reasons.map((r, i) => (
                <li key={i} className="text-sm text-neutral-300 leading-relaxed">
                  · {r}
                </li>
              ))}
            </ul>
          </div>
        )}

        <p className="text-xs text-neutral-500 mt-4 border-t border-border pt-3">
          Not legal, tax, or immigration advice. This encodes rules of thumb from your stated situation — verify
          anything consequential (PFIC exposure, NRO/PIS conversion, visa implications) with a cross-border CPA or
          immigration attorney before acting.
        </p>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [tab, setTab] = useState<Tab>('markets');

  const tabs: { id: Tab; label: string }[] = useMemo(
    () => [
      { id: 'markets', label: 'Markets' },
      { id: 'macro', label: 'Macro' },
      { id: 'news', label: 'News' },
      { id: 'eligibility', label: 'Eligibility' },
    ],
    []
  );

  return (
    <div className="min-h-screen">
      <header className="border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-5 flex items-center justify-between">
          <div>
            <h1 className="text-white font-semibold text-lg">AI Wealth OS</h1>
            <p className="text-xs text-neutral-500">Personal research dashboard — not investment advice.</p>
          </div>
          <nav className="flex gap-1 bg-panel border border-border rounded-lg p-1">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`text-sm px-3 py-1.5 rounded-md transition ${
                  tab === t.id ? 'bg-accent text-white' : 'text-neutral-400 hover:text-white'
                }`}
              >
                {t.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        {tab === 'markets' && <MarketsTab />}
        {tab === 'macro' && <MacroTab />}
        {tab === 'news' && <NewsTab />}
        {tab === 'eligibility' && <EligibilityTab />}
      </main>
    </div>
  );
}
