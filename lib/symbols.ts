export interface SymbolDef {
  symbol: string;
  label: string;
  market: 'US' | 'INDIA';
}

export const INDEX_SYMBOLS: SymbolDef[] = [
  { symbol: '^GSPC', label: 'S&P 500', market: 'US' },
  { symbol: '^IXIC', label: 'Nasdaq Composite', market: 'US' },
  { symbol: '^DJI', label: 'Dow Jones', market: 'US' },
  { symbol: '^VIX', label: 'VIX', market: 'US' },
  { symbol: '^NSEI', label: 'Nifty 50', market: 'INDIA' },
  { symbol: '^BSESN', label: 'Sensex', market: 'INDIA' },
  { symbol: '^NSEBANK', label: 'Bank Nifty', market: 'INDIA' },
];

export const DEFAULT_WATCHLIST: SymbolDef[] = [
  { symbol: 'AAPL', label: 'Apple', market: 'US' },
  { symbol: 'MSFT', label: 'Microsoft', market: 'US' },
  { symbol: 'NVDA', label: 'Nvidia', market: 'US' },
  { symbol: 'INDA', label: 'iShares MSCI India ETF', market: 'US' },
  { symbol: 'RELIANCE.NS', label: 'Reliance Industries', market: 'INDIA' },
  { symbol: 'TCS.NS', label: 'TCS', market: 'INDIA' },
];
