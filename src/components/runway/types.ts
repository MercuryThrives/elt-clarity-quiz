export type Screen = 'intake' | 'loading' | 'teaser' | 'gate' | 'results';

export interface Sels {
  assets: string | null;
  income: string | null;
  market: string | null;
  careLevel: string | null;
}

export interface Results {
  quotedMonthly: number;
  actualMonthly: number;
  monthlyGap: number;
  annualGap: number;
  primaryYrs: number;
  lightYrs: number;
}
