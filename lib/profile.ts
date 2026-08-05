// Your personal eligibility profile. This drives the Eligibility Engine in
// lib/eligibility.ts. Edit this file (and redeploy) whenever your status
// changes — e.g. OPT -> H-1B, or once you open an NRO/PIS account in India.
//
// NONE OF THIS IS LEGAL, TAX, OR IMMIGRATION ADVICE. It's a set of flags
// encoding facts you told the tool about your own situation, plus generally
// understood rules of thumb, so that recommendations get annotated with real
// constraints instead of pretending they don't exist. Verify anything
// consequential with a cross-border CPA / immigration attorney before acting.

export type UsVisaStatus = 'F1_OPT_CPT' | 'H1B_L1_OTHER_WORK' | 'GREEN_CARD' | 'US_CITIZEN' | 'OTHER';
export type UsTaxResidency = 'RESIDENT_ALIEN' | 'NONRESIDENT_ALIEN' | 'US_CITIZEN' | 'UNKNOWN';
export type IndiaAccountStatus =
  | 'NONE'
  | 'RESIDENT_ACCOUNT_UNCONVERTED' // opened while resident in India, not yet moved to NRO/PIS
  | 'NRE_NRO_PIS_ACTIVE'
  | 'NOT_APPLICABLE';

export interface WealthProfile {
  usVisaStatus: UsVisaStatus;
  usTaxResidency: UsTaxResidency;
  indiaAccountStatus: IndiaAccountStatus;
  hasUsBrokerage: boolean;
  notes: string;
}

export const profile: WealthProfile = {
  usVisaStatus: 'F1_OPT_CPT',
  usTaxResidency: 'RESIDENT_ALIEN',
  indiaAccountStatus: 'RESIDENT_ACCOUNT_UNCONVERTED',
  hasUsBrokerage: false,
  notes:
    'F-1 (OPT/CPT) in the US, resident alien for US tax purposes (passed substantial presence test), holds a pre-existing India resident brokerage/demat account that has not been converted to NRO + PIS since becoming a non-resident.',
};
