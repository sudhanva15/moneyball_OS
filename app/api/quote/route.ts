import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

interface QuoteResult {
  symbol: string;
  price: number | null;
  previousClose: number | null;
  changePercent: number | null;
  currency: string | null;
  marketState: string | null;
  error?: string;
}

async function fetchOne(symbol: string): Promise<QuoteResult> {
  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(
      symbol
    )}?interval=1d&range=5d`;
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; AIWealthOS/0.1)' },
      next: { revalidate: 30 },
    });
    if (!res.ok) throw new Error(`upstream ${res.status}`);
    const data = await res.json();
    const result = data?.chart?.result?.[0];
    const meta = result?.meta;
    if (!meta) throw new Error('no meta in response');
    const price = meta.regularMarketPrice ?? null;
    const prevClose = meta.chartPreviousClose ?? meta.previousClose ?? null;
    const changePercent =
      price != null && prevClose ? ((price - prevClose) / prevClose) * 100 : null;
    return {
      symbol,
      price,
      previousClose: prevClose,
      changePercent,
      currency: meta.currency ?? null,
      marketState: meta.marketState ?? null,
    };
  } catch (e: any) {
    return {
      symbol,
      price: null,
      previousClose: null,
      changePercent: null,
      currency: null,
      marketState: null,
      error: e?.message || 'fetch failed',
    };
  }
}

export async function GET(req: NextRequest) {
  const symbolsParam = req.nextUrl.searchParams.get('symbols') || '';
  const symbols = symbolsParam
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  if (symbols.length === 0) {
    return NextResponse.json({ quotes: [] });
  }

  const quotes = await Promise.all(symbols.map(fetchOne));
  return NextResponse.json({ quotes });
}
