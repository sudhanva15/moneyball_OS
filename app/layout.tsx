import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AI Wealth OS',
  description: 'Private research dashboard — macro, markets, and eligibility.',
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-base text-neutral-200 antialiased">{children}</body>
    </html>
  );
}
