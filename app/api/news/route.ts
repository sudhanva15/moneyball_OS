import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

interface NewsItem {
  title: string;
  link: string;
  source: string | null;
  pubDate: string | null;
}

function extractTag(xml: string, tag: string): string | null {
  const match = xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i'));
  if (!match) return null;
  return match[1]
    .replace(/<!\[CDATA\[/g, '')
    .replace(/\]\]>/g, '')
    .trim();
}

function parseRss(xml: string): NewsItem[] {
  const items = xml.match(/<item>[\s\S]*?<\/item>/g) || [];
  return items.slice(0, 12).map((item) => {
    const title = extractTag(item, 'title') || 'Untitled';
    const link = extractTag(item, 'link') || '#';
    const pubDate = extractTag(item, 'pubDate');
    const source = extractTag(item, 'source');
    return { title, link, source, pubDate };
  });
}

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q') || 'stock market';
  const url = `https://news.google.com/rss/search?q=${encodeURIComponent(
    q
  )}&hl=en-US&gl=US&ceid=US:en`;

  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; AIWealthOS/0.1)' },
      next: { revalidate: 300 },
    });
    if (!res.ok) throw new Error(`upstream ${res.status}`);
    const xml = await res.text();
    const items = parseRss(xml);
    return NextResponse.json({ items });
  } catch (e: any) {
    return NextResponse.json({ items: [], error: e?.message || 'news fetch failed' });
  }
}
