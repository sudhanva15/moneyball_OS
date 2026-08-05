import { profile } from './profile';

export type Market = 'US' | 'INDIA' | 'OTHER';
export type InstrumentType =
  | 'EQUITY'
  | 'ETF'
  | 'MUTUAL_FUND'
  | 'OPTION_DERIVATIVE'
  | 'CRYPTO'
  | 'BOND_FIXED_INCOME';

export type EligibilityStatus = 'ELIGIBLE' | 'CAUTION' | 'ACTION_NEEDED' | 'BLOCKED';

export interface EligibilityInput {
  market: Market;
  type: InstrumentType;
  ticker?: string;
}

export interface EligibilityResult {
  status: EligibilityStatus;
  headline: string;
  reasons: string[];
}

const STATUS_RANK: Record<EligibilityStatus, number> = {
  ELIGIBLE: 0,
  CAUTION: 1,
  ACTION_NEEDED: 2,
  BLOCKED: 3,
};

function worst(a: EligibilityStatus, b: EligibilityStatus): EligibilityStatus {
  return STATUS_RANK[b] > STATUS_RANK[a] ? b : a;
}

/**
 * Evaluates a proposed instrument against the hardcoded profile in
 * lib/profile.ts. Returns a status + human-readable reasons. This is a
 * rules-of-thumb engine, not a compliance system — treat ACTION_NEEDED and
 * BLOCKED results as "stop and check with a professional," not as a legal
 * ruling either way.
 */
export function checkEligibility(input: EligibilityInput): EligibilityResult {
  let status: EligibilityStatus = 'ELIGIBLE';
  const reasons: string[] = [];

  // --- US market ---
  if (input.market === 'US') {
    if (input.type === 'OPTION_DERIVATIVE') {
      status = worst(status, 'CAUTION');
      reasons.push(
        'Options/derivatives are legal for you to trade in a US account, but brokers apply the FINRA Pattern Day Trader rule (4+ day trades in 5 business days requires $25k+ equity in a margin account). This is a broker/FINRA rule, not an immigration restriction.'
      );
    }
    if (
      (profile.usVisaStatus === 'F1_OPT_CPT') &&
      (input.type === 'EQUITY' || input.type === 'ETF' || input.type === 'OPTION_DERIVATIVE')
    ) {
      reasons.push(
        'On F-1/OPT: buying and selling securities in your own personal brokerage account is treated as managing personal investments, not "employment," regardless of frequency — this is the consensus immigration-attorney view since there is no employer and no labor-for-hire. The risk line is if the activity becomes a registered business (forming an LLC/prop-trading entity, trading for others, holding yourself out as a professional trader) — avoid that while on F-1.'
      );
    }
    // Eligible by default for equities/ETFs/mutual funds/bonds.
  }

  // --- India market ---
  if (input.market === 'INDIA') {
    if (profile.indiaAccountStatus === 'RESIDENT_ACCOUNT_UNCONVERTED') {
      status = worst(status, 'ACTION_NEEDED');
      reasons.push(
        'Your India brokerage/demat account was opened while you were a resident. Once you qualify as a Non-Resident Indian (NRI) under FEMA, RBI requires you to convert it to an NRO account and trade via the Portfolio Investment Scheme (PIS) through a designated bank. Trading on an unconverted resident account after becoming NRI is a compliance gap — talk to your broker about NRO/PIS conversion before placing new India trades.'
      );
    } else if (profile.indiaAccountStatus === 'NONE') {
      status = worst(status, 'ACTION_NEEDED');
      reasons.push(
        'You don’t currently have an India trading account. As an NRI you’ll need an NRE or NRO bank account plus RBI Portfolio Investment Scheme (PIS) permission linked to a demat/trading account before you can legally buy Indian listed equities.'
      );
    }

    if (input.type === 'EQUITY') {
      status = worst(status, 'CAUTION');
      reasons.push(
        'NRIs are barred from intraday trading and short-selling in the cash equity segment — RBI/FEMA require taking delivery. F&O trading needs separate broker approval, and aggregate NRI shareholding in a single company is capped (typically ~5% per NRI, ~10% aggregate, varies by company) and enforced by the exchange.'
      );
    }

    if (input.type === 'MUTUAL_FUND') {
      if (profile.usTaxResidency === 'RESIDENT_ALIEN' || profile.usTaxResidency === 'US_CITIZEN') {
        status = worst(status, 'BLOCKED');
        reasons.push(
          'You’re a US tax resident. The IRS classifies Indian mutual funds as PFICs (Passive Foreign Investment Companies), which triggers Form 8621 filing per fund per year and punitive default tax treatment (gains taxed at top ordinary rates plus an interest charge). Most Indian AMCs also decline US-based NRI investors outright due to FATCA compliance costs — only a handful (e.g. UTI, SBI, ICICI Prudential, Sundaram) accept US NRIs with extra paperwork.'
        );
        reasons.push(
          'A cleaner way to get India exposure while a US tax resident: US-domiciled India-focused ETFs (e.g. INDA, EPI, INDY, FLIN) trade on US exchanges, settle like any US ETF, and avoid PFIC treatment entirely.'
        );
      } else {
        status = worst(status, 'CAUTION');
        reasons.push('Confirm the specific AMD/fund house accepts NRI investors from your country of residence before investing.');
      }
    }
  }

  // --- Crypto (either market) ---
  if (input.type === 'CRYPTO') {
    status = worst(status, 'CAUTION');
    if (input.market === 'INDIA') {
      reasons.push(
        'India taxes crypto gains at a flat 30% plus 1% TDS on transactions, with no loss offsetting — and FEMA/RBI treatment of crypto for NRIs remains unsettled. As a US tax resident you’d also owe US tax on the same gains; check the India-US tax treaty for double-taxation relief and keep meticulous records.'
      );
    } else {
      reasons.push(
        'Crypto held through a US exchange is taxable US property (capital gains rules apply) and reportable — straightforward compared to the India side, but still track cost basis carefully.'
      );
    }
  }

  if (reasons.length === 0) {
    reasons.push('No specific constraints flagged for your current profile — standard investment risk still applies.');
  }

  const headline: Record<EligibilityStatus, string> = {
    ELIGIBLE: 'Eligible',
    CAUTION: 'Eligible, with caveats',
    ACTION_NEEDED: 'Action needed before trading',
    BLOCKED: 'Not recommended for your situation',
  };

  return { status, headline: headline[status], reasons };
}

export function badgeClasses(status: EligibilityStatus): string {
  switch (status) {
    case 'ELIGIBLE':
      return 'bg-good/15 text-good border border-good/30';
    case 'CAUTION':
      return 'bg-warn/15 text-warn border border-warn/30';
    case 'ACTION_NEEDED':
      return 'bg-warn/20 text-warn border border-warn/40';
    case 'BLOCKED':
      return 'bg-bad/15 text-bad border border-bad/30';
  }
}
