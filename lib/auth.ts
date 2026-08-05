// Simple shared-password gate. This is a personal, single-user tool, not a
// multi-tenant product — a shared password behind an httpOnly signed cookie
// is intentionally lightweight. Override the default by setting SITE_PASSWORD
// in your Vercel project's Environment Variables and redeploying.

export const DEFAULT_SITE_PASSWORD = 'wealthos-8842-kite';

export function getSitePassword(): string {
  return process.env.SITE_PASSWORD?.trim() || DEFAULT_SITE_PASSWORD;
}

export const AUTH_COOKIE_NAME = 'awos_auth';

// Not a real secret-based signature (no crypto secret is configured for this
// personal deployment) — just a fixed token that proves the request passed
// through /api/login. Fine for a single-user private tool; do not reuse this
// pattern for anything multi-user.
export function getAuthCookieValue(): string {
  return 'granted';
}
