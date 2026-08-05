import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

interface FredSeriesDef {
  id: string;
  label: string;
}

const US_SERIES: FredSeriesDef[] = [
  { id: 'CPIAUCSL', label: 'CPI (US, YoY basis via index)' },
  { id: 'UNRATE', label: 'Unemployment Rate' },
  { id: 'FEDFUNDS', label: 'Fed Funds Rate' },
  { id: 'DGS10', label: '10Y Treasury Yield' },
  { id: 'GDP', label: 'GDP (nominal, quarterly)' },
];

async function fetchSeries(id: string, apiKey: string) {
  const url = `https://api.stlouisfed.org/fred/series/observations?series_id=${id}&api_key=${apiKey}&file_type=json&sort_order=desc&limit=2`;
  const res = await fetch(url, { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error(`FRED ${id} -> ${res.status}`);
  const data = await res.json();
  const obs = data?.observations || [];
  return obs;
}

export async function GET() {
  const apiKey = process.env.FRED_API_KEY;

  if (!apiKey) {
    return NextResponse.json({
      enabled: false,
      message:
        'Live macro data needs a free FRED API key. Get one at https://fred.stlouisfed.org/docs/api/api_key.html and set FRED_API_KEY in your Vercel project env vars, then redeploy.',
      series: US_SERIES.map((s) => ({ ...s, latest: null, previous: null, date: null })),
    });
  }

  try {
    const results = await Promise.all(
      US_SERIES.map(async (s) => {
        const obs = await fetchSeries(s.id, apiKey);
        const latest = obs[0];
        const previous = obs[1];
        return {
          ...s,
          latest: latest ? Number(latest.value) : null,
          previous: previous ? Number(previous.value) : null,
          date: latest?.date ?? null,
        };
      })
    );
    return NextResponse.json({ enabled: true, series: results });
  } catch (e: any) {
    return NextResponse.json(
      { enabled: false, message: e?.message || 'FRED fetch failed', series: [] },
      { status: 200 }
    );
  }
}
