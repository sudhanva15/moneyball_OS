export default function LoginPage({
  searchParams,
}: {
  searchParams: { next?: string; error?: string };
}) {
  const next = searchParams?.next || '/';
  const error = searchParams?.error;

  return (
    <div className="min-h-screen flex items-center justify-center bg-base px-4">
      <div className="w-full max-w-sm bg-panel border border-border rounded-xl p-8">
        <h1 className="text-lg font-semibold text-white mb-1">AI Wealth OS</h1>
        <p className="text-sm text-neutral-400 mb-6">Private research dashboard. Enter password to continue.</p>
        <form method="POST" action="/api/login" className="space-y-3">
          <input type="hidden" name="next" value={next} />
          <input
            type="password"
            name="password"
            placeholder="Password"
            autoFocus
            className="w-full rounded-lg bg-base border border-border px-3 py-2 text-sm text-white outline-none focus:border-accent"
          />
          {error && (
            <p className="text-xs text-bad">Wrong password. Try again.</p>
          )}
          <button
            type="submit"
            className="w-full rounded-lg bg-accent text-white text-sm font-medium py-2 hover:opacity-90 transition"
          >
            Enter
          </button>
        </form>
      </div>
    </div>
  );
}
