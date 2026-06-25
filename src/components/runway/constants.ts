export const ASSET_MID: Record<string, number> = {
  u200: 150000, b500: 350000, b1m: 750000, o1m: 1200000,
};
export const INCOME_MID: Record<string, number> = {
  u2k: 1500, b4k: 3000, b6k: 5000, o6k: 7000,
};
export const BASE_RENT: Record<string, number> = {
  denver: 7150, fortcollins: 6550, coloradosprings: 6450, other: 6525,
};
export const CARE_FEE: Record<string, number> = {
  light: 600, moderate: 1500, heavy: 2725,
};
export const MEDS = 550;

export const MARKET_LABEL: Record<string, string> = {
  denver: 'Denver Metro',
  fortcollins: 'Fort Collins',
  coloradosprings: 'Colorado Springs',
  other: 'Colorado',
};
export const MARKET_PREFIX: Record<string, string> = {
  denver: 'Denver Metro communities',
  fortcollins: 'Fort Collins-area communities',
  coloradosprings: 'Colorado Springs-area communities',
  other: 'Colorado communities',
};

export const GAP_CARDS = [
  {
    title: 'Care progression',
    body: "This estimate holds care needs fixed at today's level. Over time, most residents need more help, and communities charge more as they do. Moving from light to heavy care at the same community can add $2,000 or more per month to the bill. The Care Cost Runway Review models where your loved one's trajectory is likely to lead.",
  },
  {
    title: 'Level-of-care step-ups',
    body: 'Most communities reassess residents within 60 to 90 days of move-in. The care fee quoted on the tour is an estimate. The first invoice often looks different. I have signed those reassessments.',
  },
  {
    title: 'The home equity swap',
    body: "If the family home eventually sells to fund care, this analysis changes. The direction and magnitude of that change depends on your loved one's specific situation. Most families assume the comparison is straightforward. In our experience, running the actual numbers surprises them.",
  },
  {
    title: 'The CCRC / Life Plan path',
    body: 'A Life Plan community requires a large upfront entrance fee and feels expensive. For a loved one with a likely long care trajectory, the full-picture comparison sometimes shows it outlasting the stay-home path with heavy care. That result is counterintuitive enough that most families never discover it without someone running the numbers.',
  },
  {
    title: 'VA benefits and unclaimed LTC coverage',
    body: "Some families are eligible for benefits that would meaningfully extend their loved one's runway and have never applied. Identifying which apply, calculating their impact on the runway, and knowing what to do next is part of what the Care Cost Runway Review does.",
  },
];

export function calcMonths(assets: number, income: number, cost: number): number {
  let bal = assets, months = 0, c = cost;
  const esc = 0.045 / 12;
  while (bal > 0 && months < 720) {
    const burn = c - income;
    if (burn <= 0) return 600;
    bal -= burn;
    c *= 1 + esc;
    months++;
  }
  return months;
}

export function fmt(n: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency', currency: 'USD', maximumFractionDigits: 0,
  }).format(n);
}

export function yrDisplay(y: number): string {
  return y >= 50 ? '50+' : String(y);
}
