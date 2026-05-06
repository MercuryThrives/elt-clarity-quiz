export type FundingRmPathway =
  | 'likely-fit'
  | 'explore-with-caveats'
  | 'medicaid-flag'
  | 'not-a-fit';

export interface EquityBand {
  ageLabel: string;
  homeValue: string;
  rangeLabel: string;
  note: string;
}

export interface FundingRmPathwayContent {
  headline: string;
  body: string;
  anticipationBullets: [string, string, string];
  whatFamiliesDontKnow: string;
  ctaType: 'specialist' | 'elder-law' | 'elt-direct' | 'dead-end';
  ctaSubtext: string;
  equityIllustration: EquityBand[];
  illustrationDisclaimer: string;
}

const EQUITY_BANDS: EquityBand[] = [
  {
    ageLabel: "Age 62–69",
    homeValue: "$500,000 home, no existing mortgage",
    rangeLabel: "$185,000 – $240,000",
    note: "Younger borrowers access a smaller percentage of equity — proceeds grow significantly with age.",
  },
  {
    ageLabel: "Age 70–79",
    homeValue: "$500,000 home, no existing mortgage",
    rangeLabel: "$255,000 – $320,000",
    note: "The mid-range sweet spot — meaningful proceeds with significant remaining life expectancy.",
  },
  {
    ageLabel: "Age 80 or older",
    homeValue: "$500,000 home, no existing mortgage",
    rangeLabel: "$330,000 – $390,000",
    note: "Older borrowers access the highest percentage of equity — often the most financially compelling scenario.",
  },
];

const ILLUSTRATION_DISCLAIMER =
  "These are general illustrative ranges based on published HUD Principal Limit Factors as of 2026, using a $500,000 home value and no existing mortgage for comparison purposes. Actual proceeds depend on age, current home value, existing mortgage balance, interest rates, and lender fees. This is not a quote, pre-qualification, or loan estimate.";

export const FUNDING_RM_CONTENT: Record<FundingRmPathway, FundingRmPathwayContent> = {
  'likely-fit': {
    headline: "A reverse mortgage may be worth a real conversation.",
    body: "Based on what you shared, your loved one appears to meet the core eligibility criteria for a Home Equity Conversion Mortgage — the federally insured reverse mortgage program. That does not mean it is the right choice. It means the conversation is worth having with someone who can run the actual numbers for your specific situation.",
    anticipationBullets: [
      "Proceeds can be structured as a lump sum, monthly payments, or a line of credit. For families funding home care or assisted living, the line of credit option is often the most flexible — draw only what you need, when you need it.",
      "A HUD-approved counseling session is required before any HECM can be finalized. This is a consumer protection, not a sales step — most families find it genuinely useful. Dave will help you understand what to expect before you get there.",
      "If there is an existing mortgage, the reverse mortgage proceeds pay it off first. Net available funds depend on remaining equity after that payoff — a specialist can calculate this in one conversation.",
    ],
    whatFamiliesDontKnow:
      "Most families assume a reverse mortgage means giving up the home. It does not. The homeowner keeps the title and continues to own the property. The loan is repaid when the home is eventually sold — typically after the owner passes away or moves permanently into a care community. Any equity remaining after repayment belongs to the estate. There is no scenario where a lender simply takes the home because the balance has grown.",
    ctaType: 'specialist',
    ctaSubtext:
      "Dave will personally connect you with a Colorado-based reverse mortgage specialist he trusts — someone who works exclusively with older homeowners and will tell you honestly if it does not make sense for your situation.",
    equityIllustration: EQUITY_BANDS,
    illustrationDisclaimer: ILLUSTRATION_DISCLAIMER,
  },

  'explore-with-caveats': {
    headline: "There are factors worth exploring before ruling this out.",
    body: "Based on what you shared, a reverse mortgage may still be possible — but one or more factors could affect how much is available or how the process works. The only way to know for certain is a brief conversation with a specialist who can look at the actual numbers.",
    anticipationBullets: [
      "If there is a significant existing mortgage balance, the reverse mortgage proceeds must pay it off first. What remains depends on current home value and the outstanding balance — something a specialist calculates in a single conversation.",
      "Condominiums and manufactured homes can qualify, but carry additional requirements. The property type does not automatically disqualify — it requires a closer look at the specific structure or community.",
      "A temporary absence for rehab or a hospital stay does not immediately affect eligibility. HECM rules allow up to 12 months away for medical reasons — a specialist can clarify how this applies to your situation.",
    ],
    whatFamiliesDontKnow:
      "Families often assume one complicating factor means a reverse mortgage is off the table. In practice, specialists work through these situations regularly. The conversation is free, takes 20 to 30 minutes, and produces a clear answer — either it works and here is what is available, or it does not and here is why. Either outcome is more useful than not knowing.",
    ctaType: 'specialist',
    ctaSubtext:
      "Dave will personally connect you with a Colorado-based reverse mortgage specialist he trusts — no obligation, no pressure, and no lender trying to push you toward a product that does not fit.",
    equityIllustration: EQUITY_BANDS,
    illustrationDisclaimer: ILLUSTRATION_DISCLAIMER,
  },

  'medicaid-flag': {
    headline: "A reverse mortgage may affect Medicaid eligibility — talk to an elder law attorney first.",
    body: "Based on what you shared, Medicaid is already part of this picture. A reverse mortgage can interact with Medicaid in ways that are not always obvious and that vary by state. Getting the sequencing right requires an elder law attorney before any reverse mortgage conversation happens — and ELT can help you find the right one.",
    anticipationBullets: [
      "Reverse mortgage proceeds are not counted as income for Medicaid purposes. However, any funds not spent in the month they are received can count toward the Medicaid asset limit — $2,000 in most states. How and when funds are drawn matters significantly.",
      "A line-of-credit structure is generally the most Medicaid-compatible option — drawing only what is needed and spending it within the same month. An elder law attorney and a reverse mortgage specialist need to coordinate this approach together.",
      "Colorado Medicaid estate recovery rules may affect what happens to the home after the borrower passes away. An elder law attorney familiar with Colorado rules is essential before any decisions are made.",
    ],
    whatFamiliesDontKnow:
      "It is possible for a reverse mortgage and Medicaid eligibility to coexist — but only if the approach is structured correctly from the start. Families who move forward without legal guidance first sometimes create a Medicaid eligibility problem they did not have before. ELT can connect you with an elder law attorney in the Boulder and Broomfield area who works regularly with exactly these situations.",
    ctaType: 'elder-law',
    ctaSubtext:
      "ELT can connect you with an elder law attorney in the Boulder and Broomfield area who works regularly with Medicaid and reverse mortgage situations. Dave will make that introduction personally.",
    equityIllustration: [],
    illustrationDisclaimer: "",
  },

  'not-a-fit': {
    headline: "A reverse mortgage is likely not the right tool here — but other options may be.",
    body: "Based on what you shared, the core eligibility requirements for a federally insured reverse mortgage do not appear to be in place. That is not a dead end — it means this particular tool is not the right one, and there may be others worth exploring.",
    anticipationBullets: [
      "The HECM program requires the borrower to be at least 62 years old and to own and live in the home as their primary residence. If either condition is not met, a standard reverse mortgage is not available.",
      "Veterans and surviving spouses may qualify for VA Aid and Attendance benefits — a meaningful monthly benefit that applies regardless of home ownership. ELT can help determine whether this applies and connect families with the right specialist.",
      "ELT works with families across a range of financial situations and can help identify which funding options are actually available based on the full picture — not just the ones that are most commonly discussed.",
    ],
    whatFamiliesDontKnow:
      "Most families in this situation have not yet explored VA Aid and Attendance benefits, which can provide $1,200 to $2,200 per month for eligible veterans and surviving spouses — with no requirement to own a home. ELT can help determine whether this applies and make the right introduction.",
    ctaType: 'elt-direct',
    ctaSubtext:
      "Dave is happy to have a direct conversation about what funding options may actually be available for your family's situation — no agenda, just clarity.",
    equityIllustration: [],
    illustrationDisclaimer: "",
  },
};

export const FUNDING_RM_DISCLAIMER =
  "This tool is for educational purposes only and does not constitute financial, legal, or mortgage advice. Elder Life Transitions is not a mortgage lender or broker. Results are not a pre-qualification or loan estimate. ELT does not receive compensation for reverse mortgage referrals. If Medicaid is involved, consult an elder law attorney before pursuing a reverse mortgage. A HUD-approved counseling session is required before any HECM reverse mortgage can be finalized.";

export const FUNDING_RM_LABELS: Record<FundingRmPathway, string> = {
  'likely-fit': 'Likely a Good Fit',
  'explore-with-caveats': 'Worth Exploring',
  'medicaid-flag': 'Medicaid Review Needed',
  'not-a-fit': 'Not the Right Tool Here',
};
