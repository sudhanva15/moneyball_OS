import { NextRequest, NextResponse } from 'next/server';
import { AUTH_COOKIE_NAME, getAuthCookieValue, getSitePassword } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const password = String(form.get('password') || '');
  const next = String(form.get('next') || '/');

  if (password !== getSitePassword()) {
    const url = new URL('/login', req.url);
    url.searchParams.set('next', next);
    url.searchParams.set('error', '1');
    return NextResponse.redirect(url, { status: 303 });
  }

  const res = NextResponse.redirect(new URL(next || '/', req.url), { status: 303 });
  res.cookies.set(AUTH_COOKIE_NAME, getAuthCookieValue(), {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
  });
  return res;
}
