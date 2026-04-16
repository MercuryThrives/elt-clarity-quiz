import { describe, it, expect } from 'vitest';
import {
  selectSnfPathway,
  getSnfFinancialModifier,
  getSnfTimelineModifier,
} from './snf-scoring';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Build a minimal answer map. All questions default to score 1 (lowest need)
 *  unless overridden via the `overrides` argument. */
function answers(overrides: Record<string, number> = {}): Record<string, number> {
  return {
    SNF_Q01:  1,
    SNF_Q01B: 1,
    SNF_Q02:  1,
    SNF_Q03:  1,
    SNF_Q04:  1,
    SNF_Q05:  1,
    SNF_Q06:  1,
    SNF_Q07:  1,
    SNF_Q08:  1,
    SNF_Q09:  1,
    SNF_Q10:  1,
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Rule 1 — Complex Medical Consult
// ---------------------------------------------------------------------------

describe('Rule 1 — complex-medical', () => {
  it('fires when Q3 = 4, regardless of other scores', () => {
    expect(selectSnfPathway(answers({ SNF_Q03: 4 }))).toBe('complex-medical');
  });

  it('fires even when Q2 = 4 (Rule 1 has higher priority than Rule 2)', () => {
    expect(selectSnfPathway(answers({ SNF_Q03: 4, SNF_Q02: 4 }))).toBe('complex-medical');
  });

  it('does NOT fire when Q3 < 4', () => {
    expect(selectSnfPathway(answers({ SNF_Q03: 3 }))).not.toBe('complex-medical');
  });
});

// ---------------------------------------------------------------------------
// Rule 2 — Memory Care
// ---------------------------------------------------------------------------

describe('Rule 2 — memory-care', () => {
  it('Trigger A: fires when Q2 = 4', () => {
    expect(selectSnfPathway(answers({ SNF_Q02: 4 }))).toBe('memory-care');
  });

  it('Trigger B: fires when Q2 = 3 AND Q1 >= 3', () => {
    expect(selectSnfPathway(answers({ SNF_Q02: 3, SNF_Q01: 3 }))).toBe('memory-care');
  });

  it('Trigger B: fires when Q2 = 3 AND Q4 >= 3', () => {
    expect(selectSnfPathway(answers({ SNF_Q02: 3, SNF_Q04: 3 }))).toBe('memory-care');
  });

  it('Exception: Q2 = 3 AND Q1 <= 2 AND Q4 <= 2 does NOT trigger memory-care', () => {
    const result = selectSnfPathway(answers({ SNF_Q02: 3, SNF_Q01: 2, SNF_Q04: 2 }));
    expect(result).not.toBe('memory-care');
  });
});

// ---------------------------------------------------------------------------
// Rule 3 — Home with Family Support
// ---------------------------------------------------------------------------

describe('Rule 3 — home-family', () => {
  it('fires when all domains are low-need and caregiver is fully available', () => {
    // All at 1 — greenest possible scenario
    expect(selectSnfPathway(answers())).toBe('home-family');
  });

  it('fires when Q1 = 2 and Q4 = 1, Q5 = 1 (allowed upper bounds)', () => {
    expect(selectSnfPathway(answers({
      SNF_Q01: 2, SNF_Q01B: 2, SNF_Q05: 1, SNF_Q06: 2,
    }))).toBe('home-family');
  });

  it('Bias Bump 1: Q4 = 1 but Q5 = 2 → home-hca (caregiver getting tired)', () => {
    expect(selectSnfPathway(answers({ SNF_Q05: 2 }))).toBe('home-hca');
  });

  it('Bias Bump 2: Q1 = 2, Q1b = 2, Q4 = 2 → home-hca (borderline caregiver)', () => {
    expect(selectSnfPathway(answers({
      SNF_Q01: 2, SNF_Q01B: 2, SNF_Q04: 2,
    }))).toBe('home-hca');
  });
});

// ---------------------------------------------------------------------------
// Rule 4 — Home with Professional Home Care
// ---------------------------------------------------------------------------

describe('Rule 4 — home-hca', () => {
  it('fires for moderate physical needs with limited caregiver and manageable home', () => {
    expect(selectSnfPathway(answers({
      SNF_Q01:  3,   // moderate physical decline
      SNF_Q01B: 3,   // some IADL needs (satisfies Q1b >= 2)
      SNF_Q02:  2,
      SNF_Q03:  3,
      SNF_Q04:  3,   // caregiver limited
      SNF_Q05:  3,
      SNF_Q06:  2,
      SNF_Q08:  2,   // enough social contact — keeps IL from firing
    }))).toBe('home-hca');
  });

  it('does NOT fire when Q1b = 1 (no IADL needs — Rule 4 requires Q1b >= 2)', () => {
    const result = selectSnfPathway(answers({
      SNF_Q01:  2,
      SNF_Q01B: 1,  // fully independent in IADLs
      SNF_Q04:  2,
      SNF_Q06:  2,
    }));
    expect(result).not.toBe('home-hca');
  });
});

// ---------------------------------------------------------------------------
// Rule 5 — Independent Living with HCA Support
// ---------------------------------------------------------------------------

describe('Rule 5 — independent-living-hca', () => {
  it('fires when good function + social isolation + bad home + non-Medicaid', () => {
    // Q1b=1 means Rule 4 cannot fire (needs Q1b>=2). Q6=3 triggers the IL
    // bias-bump intercept, routing here before Rule 4 even runs.
    expect(selectSnfPathway(answers({
      SNF_Q01:  1,
      SNF_Q01B: 1,   // fully independent in IADLs — blocks Rule 4
      SNF_Q02:  1,
      SNF_Q03:  1,
      SNF_Q04:  2,
      SNF_Q06:  3,   // home problematic → IL bias bump before Rule 4
      SNF_Q07:  2,
      SNF_Q08:  3,
      SNF_Q09:  1,   // private pay
    }))).toBe('independent-living-hca');
  });

  it('fires via standard path (Q7 >= 2, Q8 >= 3) when Rule 4 cannot match', () => {
    expect(selectSnfPathway(answers({
      SNF_Q01:  1,
      SNF_Q01B: 1,   // Q1b=1 → Rule 4 fails (needs Q1b>=2)
      SNF_Q02:  1,
      SNF_Q03:  1,
      SNF_Q04:  2,
      SNF_Q06:  2,   // home: some mods needed (satisfies Q6>=2)
      SNF_Q07:  2,   // open to community
      SNF_Q08:  4,   // almost never social
      SNF_Q09:  1,   // private pay
    }))).toBe('independent-living-hca');
  });

  it('Bias Bump: Q6 = 3 routes to IL before Rule 4 even for Q1b >= 2 cases', () => {
    // Q1b=2 would normally qualify for Rule 4, but Q6=3 intercepts for IL.
    expect(selectSnfPathway(answers({
      SNF_Q01:  1,
      SNF_Q01B: 2,   // qualifies for Rule 4 in isolation
      SNF_Q02:  1,
      SNF_Q03:  1,
      SNF_Q04:  2,
      SNF_Q06:  3,   // IL bias bump fires before Rule 4
      SNF_Q07:  2,
      SNF_Q08:  3,
      SNF_Q09:  1,
    }))).toBe('independent-living-hca');
  });

  it('does NOT fire when Q9 = 3 (Medicaid)', () => {
    const result = selectSnfPathway(answers({
      SNF_Q01:  1,
      SNF_Q01B: 1,
      SNF_Q02:  1,
      SNF_Q03:  1,
      SNF_Q04:  2,
      SNF_Q06:  3,
      SNF_Q07:  2,
      SNF_Q08:  3,
      SNF_Q09:  3,  // Medicaid — IL excluded
    }));
    expect(result).not.toBe('independent-living-hca');
  });
});

// ---------------------------------------------------------------------------
// Rule 6 — Residential Care Home
// ---------------------------------------------------------------------------

describe('Rule 6 — residential-care', () => {
  it('fires when high physical need, no caregiver, bad home, preserved cognition', () => {
    expect(selectSnfPathway(answers({
      SNF_Q01:  4,  // cannot manage at home
      SNF_Q04:  4,  // no caregiver (Q5 was auto-assigned 4)
      SNF_Q05:  4,
      SNF_Q06:  4,  // home not viable
      SNF_Q02:  2,  // mild cognitive change — within residential threshold
      SNF_Q07:  1,  // strongly prefers home (Q7 <= 2 required)
      SNF_Q08:  2,
    }))).toBe('residential-care');
  });

  it('Bias Bump: Q1 = 3 AND Q4 = 3 (minimum thresholds) → assisted-living instead', () => {
    expect(selectSnfPathway(answers({
      SNF_Q01:  3,  // exactly at min threshold
      SNF_Q04:  3,  // exactly at min threshold
      SNF_Q05:  3,
      SNF_Q06:  3,
      SNF_Q02:  2,
      SNF_Q07:  1,
      SNF_Q08:  2,
    }))).toBe('assisted-living');
  });
});

// ---------------------------------------------------------------------------
// Rule 7 — Assisted Living (default)
// ---------------------------------------------------------------------------

describe('Rule 7 — assisted-living', () => {
  it('fires as the default for high-need cases not matched by earlier rules', () => {
    // Q2=2 keeps Rule 2 from firing. Q4=4, Q6=4 block Rule 4. Q7=3 blocks
    // Rule 6 (which requires Q7 <= 2). Falls through to ALF.
    expect(selectSnfPathway(answers({
      SNF_Q01:  4,
      SNF_Q01B: 4,
      SNF_Q02:  2,  // mild — keeps memory-care from firing
      SNF_Q03:  3,
      SNF_Q04:  4,
      SNF_Q05:  4,
      SNF_Q06:  4,
      SNF_Q07:  3,  // interested in community — Q7 > 2 blocks Rule 6
      SNF_Q08:  4,
    }))).toBe('assisted-living');
  });

  it('fires when Q2 = 3 + exception clause (Q1 <= 2, Q4 <= 2) clears memory-care', () => {
    // Exception: Q2=3 but Q1<=2 AND Q4<=2 → Rule 2 skipped.
    // No other rule matches → falls through to ALF.
    expect(selectSnfPathway(answers({
      SNF_Q01:  2,
      SNF_Q01B: 3,
      SNF_Q02:  3,  // moderate — exception clause prevents memory-care
      SNF_Q03:  3,
      SNF_Q04:  2,
      SNF_Q05:  3,
      SNF_Q06:  3,
      SNF_Q07:  3,
      SNF_Q08:  2,
    }))).toBe('assisted-living');
  });
});

// ---------------------------------------------------------------------------
// Q5 skip-logic integration
// ---------------------------------------------------------------------------

describe('Q5 skip logic', () => {
  it('Q4 = 4 → Q5 auto-assigned 4 (no caregiver); still routes correctly', () => {
    // When Q4=4, the quiz auto-assigns Q5=4.
    // This combination should trigger memory-care via Rule 2B if Q2>=3,
    // or another rule depending on other scores.
    const result = selectSnfPathway(answers({
      SNF_Q04: 4,
      SNF_Q05: 4,  // auto-assigned by skip logic
      SNF_Q02: 3,  // Q2=3 AND Q4>=3 → memory-care (Rule 2 Trigger B)
    }));
    expect(result).toBe('memory-care');
  });

  it('Q4 = 4, Q5 auto = 4, low Q2 → routes past memory-care to residential or ALF', () => {
    const result = selectSnfPathway(answers({
      SNF_Q01:  4,
      SNF_Q04:  4,
      SNF_Q05:  4,  // auto-assigned
      SNF_Q06:  4,
      SNF_Q02:  1,  // low cognition concern
      SNF_Q07:  1,
    }));
    // Q1>=3, Q4>=3, Q6>=3, Q2<=3, Q7<=2 — but Q1=4 and Q4=4 → not the bias bump case
    expect(result).toBe('residential-care');
  });
});

// ---------------------------------------------------------------------------
// Q9 Financial Modifier
// ---------------------------------------------------------------------------

describe('getSnfFinancialModifier', () => {
  it('returns null for private pay (Q9 = 1)', () => {
    expect(getSnfFinancialModifier({ SNF_Q09: 1 })).toBeNull();
  });

  it('returns family-support copy for Q9 = 2', () => {
    const result = getSnfFinancialModifier({ SNF_Q09: 2 });
    expect(result).toContain('Family-supported arrangements');
  });

  it('returns Medicaid copy for Q9 = 3', () => {
    const result = getSnfFinancialModifier({ SNF_Q09: 3 });
    expect(result).toContain('Medicaid-certified');
  });

  it('returns not-sure copy for Q9 = 4', () => {
    const result = getSnfFinancialModifier({ SNF_Q09: 4 });
    expect(result).toContain('financial picture early');
  });

  it('returns null when Q9 is not answered', () => {
    expect(getSnfFinancialModifier({})).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Q10 Timeline Modifier
// ---------------------------------------------------------------------------

describe('getSnfTimelineModifier', () => {
  it('returns urgent copy when Q10 = 1 (immediately)', () => {
    const result = getSnfTimelineModifier({ SNF_Q10: 1 });
    expect(result).toContain('Discharge timelines move quickly');
  });

  it('returns urgent copy when Q10 = 2 (soon)', () => {
    const result = getSnfTimelineModifier({ SNF_Q10: 2 });
    expect(result).toContain('Discharge timelines move quickly');
  });

  it('returns measured copy when Q10 = 3 (some time)', () => {
    const result = getSnfTimelineModifier({ SNF_Q10: 3 });
    expect(result).toContain('You have time');
  });

  it('returns measured copy when Q10 = 4 (no pressure)', () => {
    const result = getSnfTimelineModifier({ SNF_Q10: 4 });
    expect(result).toContain('You have time');
  });

  it('returns measured copy when Q10 is not answered (safe default)', () => {
    expect(getSnfTimelineModifier({})).toContain('You have time');
  });
});
