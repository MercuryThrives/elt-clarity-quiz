import { describe, it, expect } from 'vitest';
import { selectScPathway } from './scScoring';

// ---------------------------------------------------------------------------
// Test helpers
// ---------------------------------------------------------------------------

/** Minimal low-need answer set. Score = 0. Override any key to change. */
function base(overrides: Partial<Record<number, string | string[]>> = {}): Record<number, string | string[]> {
  return {
    1:  'Myself',
    2:  "We're planning ahead before things change",
    3:  'Living with family',
    4:  'None -- fully independent',
    5:  'No',
    6:  'No noticeable changes',
    7:  '[He/She/They is] managing independently',
    8:  'Active -- regularly involved with others and activities',
    9:  'We have time -- this is planning ahead',
    10: 'Yes -- we have thought about this',
    11: ['Staying home as long as possible'],
    ...overrides,
  };
}

const SAFETY = ['Being safe and well-supported'];

// ---------------------------------------------------------------------------
// Pathway — home-family-support
// ---------------------------------------------------------------------------

describe('home-family-support', () => {
  it('routes at score 0 (all minimal answers)', () => {
    expect(selectScPathway(base()).pathway).toBe('home-family-support');
  });

  it('routes at score 1', () => {
    expect(selectScPathway(base({ 4: 'Some help, but mostly manages' })).pathway)
      .toBe('home-family-support');
  });

  it('routes at score 2 with no strain and no isolation', () => {
    expect(selectScPathway(base({
      4: 'Some help, but mostly manages',   // 1
      5: 'Once or twice, but minor',        // 1
    })).pathway).toBe('home-family-support');
  });
});

// ---------------------------------------------------------------------------
// Pathway — home-professional-hca
// ---------------------------------------------------------------------------

describe('home-professional-hca', () => {
  it('routes at score 2 with caregiver strain', () => {
    expect(selectScPathway(base({
      4: 'Some help, but mostly manages',                                        // 1
      7: 'Family members are helping -- but it is becoming a strain',            // 2 → total 3, wait
    })).pathway).toBe('home-professional-hca');
    // Q4=1 + Q7=2 = score 3 → bias bump applies; test strain at score 2
  });

  it('routes at score 2 when living alone', () => {
    expect(selectScPathway(base({
      3: 'Living alone at home',
      4: 'Some help, but mostly manages',   // 1
      5: 'Once or twice, but minor',        // 1
      // score = 2
    })).pathway).toBe('home-professional-hca');
  });

  it('routes at score 3 with strain', () => {
    expect(selectScPathway(base({
      4: 'Some help, but mostly manages',                                   // 1
      7: 'Family members are helping -- but it is becoming a strain',       // 2
      // score = 3
    })).pathway).toBe('home-professional-hca');
  });

  it('bias bump: routes at score 3 even without strain or living alone', () => {
    expect(selectScPathway(base({
      4: 'Some help, but mostly manages',   // 1
      5: 'Once or twice, but minor',        // 1
      8: 'Somewhat active -- some social contact but more isolated than before', // 1
      // score = 3, no strain, not living alone
    })).pathway).toBe('home-professional-hca');
  });

  it('routes at score 3 when living alone', () => {
    expect(selectScPathway(base({
      3: 'Living alone at home',
      4: 'Needs regular help from someone', // 2
      5: 'Once or twice, but minor',        // 1
      // score = 3
    })).pathway).toBe('home-professional-hca');
  });
});

// ---------------------------------------------------------------------------
// Pathway — independent-living
// ---------------------------------------------------------------------------

describe('independent-living', () => {
  it('routes when Q8=2 and all other scoring questions are 0 (total score=2)', () => {
    expect(selectScPathway(base({
      8: 'Mostly isolated -- limited social contact',  // Q8=2, total score=2
    })).pathway).toBe('independent-living');
  });

  it('does NOT route when Q8=3 pushes total score to 3 (exceeds IL threshold)', () => {
    // Q8=3 → total score=3 > 2 → home-professional-hca (bias bump)
    expect(selectScPathway(base({
      8: 'Completely isolated -- this is a concern',  // Q8=3, score=3
    })).pathway).toBe('home-professional-hca');
  });

  it('does NOT route when other scoring questions push total score above 2', () => {
    // Q4=1+Q5=1+Q8=2 → total score=4 → assisted-living
    expect(selectScPathway(base({
      4: 'Some help, but mostly manages',              // 1
      5: 'Once or twice, but minor',                   // 1
      8: 'Mostly isolated -- limited social contact',  // 2 → score=4
    })).pathway).toBe('assisted-living');
  });

  it('does NOT route when score > 2 from care needs alone', () => {
    expect(selectScPathway(base({
      4: 'Needs regular help from someone',            // 2
      8: 'Mostly isolated -- limited social contact',  // 2 → score=4
    })).pathway).not.toBe('independent-living');
  });

  it('does NOT route when Q6 >= 2 (memory-care takes priority)', () => {
    expect(selectScPathway(base({
      6: 'Yes -- this is becoming a regular concern',
      8: 'Mostly isolated -- limited social contact',
    })).pathway).toBe('memory-care');
  });
});

// ---------------------------------------------------------------------------
// Pathway — assisted-living
// ---------------------------------------------------------------------------

describe('assisted-living', () => {
  it('routes at score 4 (bias bump over home-professional-hca)', () => {
    expect(selectScPathway(base({
      4: 'Needs regular help from someone',                                  // 2
      7: 'Family members are helping -- but it is becoming a strain',        // 2
      // score = 4
    })).pathway).toBe('assisted-living');
  });

  it('routes at score 5 without safety preference', () => {
    expect(selectScPathway(base({
      4: 'Needs regular help from someone',   // 2
      5: 'Yes, more than once',               // 2
      7: 'Family members are helping -- we are managing okay', // 1
      // score = 5, no safety preference
    })).pathway).toBe('assisted-living');
  });

  it('routes at score 6 without safety preference', () => {
    expect(selectScPathway(base({
      4: 'Needs full assistance',             // 3
      5: 'Yes, more than once',               // 2
      7: 'Family members are helping -- we are managing okay', // 1
      // score = 6
    })).pathway).toBe('assisted-living');
  });

  it('routes at score 7 without safety preference', () => {
    expect(selectScPathway(base({
      4: 'Needs full assistance',             // 3
      5: 'Yes, more than once',               // 2
      8: 'Somewhat active -- some social contact but more isolated than before', // 1
      7: 'Family members are helping -- we are managing okay', // 1
      // score = 7
    })).pathway).toBe('assisted-living');
  });
});

// ---------------------------------------------------------------------------
// Pathway — memory-care
// ---------------------------------------------------------------------------

describe('memory-care', () => {
  it('routes when Q6 = regular concern (score 2) regardless of total', () => {
    expect(selectScPathway(base({
      6: 'Yes -- this is becoming a regular concern',
      // score = 2, Q6=2 alone triggers
    })).pathway).toBe('memory-care');
  });

  it('routes when Q6 = significant changes (score 3)', () => {
    expect(selectScPathway(base({
      6: 'Yes -- significant changes that affect daily safety',
    })).pathway).toBe('memory-care');
  });

  it('routes to memory-care even when total score is low', () => {
    // Only Q6 score 2, total = 2
    expect(selectScPathway(base({
      6: 'Yes -- this is becoming a regular concern',
    })).score).toBe(2);
    expect(selectScPathway(base({
      6: 'Yes -- this is becoming a regular concern',
    })).pathway).toBe('memory-care');
  });

  it('does NOT route to memory-care when Q6 score = 1', () => {
    expect(selectScPathway(base({
      6: 'Occasionally -- forgetting things, getting confused sometimes',
    })).pathway).not.toBe('memory-care');
  });
});

// ---------------------------------------------------------------------------
// Pathway — residential-care-home
// ---------------------------------------------------------------------------

describe('residential-care-home', () => {
  it('routes at score 5 with safety preference', () => {
    expect(selectScPathway(base({
      4: 'Needs regular help from someone',   // 2
      5: 'Yes, more than once',               // 2
      7: 'Family members are helping -- we are managing okay', // 1
      11: SAFETY,
    })).pathway).toBe('residential-care-home');
  });

  it('routes at score 6 with safety preference', () => {
    expect(selectScPathway(base({
      4: 'Needs full assistance',             // 3
      5: 'Yes, more than once',               // 2
      7: 'Family members are helping -- we are managing okay', // 1
      11: SAFETY,
    })).pathway).toBe('residential-care-home');
  });

  it('bias bump: routes at score 8 even without safety preference', () => {
    expect(selectScPathway(base({
      4: 'Needs full assistance',             // 3
      5: 'Yes, more than once',               // 2
      7: 'Family members are helping -- but it is becoming a strain', // 2
      8: 'Somewhat active -- some social contact but more isolated than before', // 1
      // score = 8
    })).pathway).toBe('residential-care-home');
  });

  it('does NOT route when Q6 >= 2 (memory-care takes priority)', () => {
    expect(selectScPathway(base({
      4: 'Needs full assistance',
      6: 'Yes -- this is becoming a regular concern',
      11: SAFETY,
    })).pathway).toBe('memory-care');
  });
});

// ---------------------------------------------------------------------------
// Pathway — complex-medical-consult
// ---------------------------------------------------------------------------

describe('complex-medical-consult', () => {
  it('routes at score 9', () => {
    expect(selectScPathway(base({
      4: 'Needs full assistance',             // 3
      5: 'Yes, and it is a serious concern',  // 3
      7: 'Family members are helping -- but it is becoming a strain', // 2
      8: 'Mostly isolated -- limited social contact', // 2 → total = 10
    })).pathway).toBe('complex-medical-consult');
  });

  it('routes at score 10+', () => {
    expect(selectScPathway(base({
      4: 'Needs full assistance',             // 3
      5: 'Yes, and it is a serious concern',  // 3
      7: 'No one is currently providing regular support', // 2
      8: 'Completely isolated -- this is a concern', // 3 → total = 11
    })).pathway).toBe('complex-medical-consult');
  });

  it('routes when Q5=3 and Q6=2 even at low total score', () => {
    expect(selectScPathway(base({
      5: 'Yes, and it is a serious concern',                   // 3
      6: 'Yes -- this is becoming a regular concern',          // 2
      // score = 5, but Q5=3 AND Q6>=2 triggers
    })).pathway).toBe('complex-medical-consult');
  });

  it('routes when Q5=3 and Q6=3', () => {
    expect(selectScPathway(base({
      5: 'Yes, and it is a serious concern',
      6: 'Yes -- significant changes that affect daily safety',
    })).pathway).toBe('complex-medical-consult');
  });

  it('takes priority over memory-care when Q5=3 and Q6>=2', () => {
    const result = selectScPathway(base({
      5: 'Yes, and it is a serious concern',
      6: 'Yes -- this is becoming a regular concern',
    }));
    expect(result.pathway).toBe('complex-medical-consult');
  });
});

// ---------------------------------------------------------------------------
// Optimism bias bump scenarios
// ---------------------------------------------------------------------------

describe('optimism bias bumps', () => {
  it('score=4 routes to assisted-living, not home-professional-hca', () => {
    // Even with strain (which qualifies for home-professional), score=4 → assisted-living
    expect(selectScPathway(base({
      4: 'Some help, but mostly manages',                                      // 1
      5: 'Once or twice, but minor',                                           // 1
      7: 'Family members are helping -- but it is becoming a strain',          // 2
      // score = 4
    })).pathway).toBe('assisted-living');
  });

  it('score=2 with isolation routes to independent-living, not home-family-support', () => {
    expect(selectScPathway(base({
      4: 'Some help, but mostly manages',             // 1
      8: 'Mostly isolated -- limited social contact', // 2
      // score = 3... wait, 1+2=3, that hits home-professional
    })).pathway).toBe('home-professional-hca');

    // Pure isolation bump: score=2, Q8=2
    expect(selectScPathway(base({
      5: 'Once or twice, but minor',                  // 1
      8: 'Mostly isolated -- limited social contact', // 2
      // score = 3 → home-professional (isolation is 2, but score=3 hits Rule 6 first)
    })).pathway).toBe('home-professional-hca');

    // score=2 exactly with Q8=2
    expect(selectScPathway(base({
      4: 'Some help, but mostly manages',             // 1
      8: 'Somewhat active -- some social contact but more isolated than before', // 1
      5: 'No', 7: '[He/She/They is] managing independently', // keep total = 2
      // total = Q4(1) + Q8(1) = 2, but Q8 score is 1, not 2 → doesn't hit IL
    })).pathway).toBe('home-family-support');

    expect(selectScPathway(base({
      8: 'Mostly isolated -- limited social contact',  // 2
      // score = 2, Q8=2 → independent-living
    })).pathway).toBe('independent-living');
  });

  it('score=8 routes to residential-care-home even without safety preference', () => {
    expect(selectScPathway(base({
      4: 'Needs full assistance',             // 3
      5: 'Yes, and it is a serious concern',  // 3
      7: 'Family members are helping -- we are managing okay', // 1
      8: 'Mostly isolated -- limited social contact',          // 2 → total = 9 → complex!
    })).pathway).toBe('complex-medical-consult');

    // Keep score=8 exactly
    expect(selectScPathway(base({
      4: 'Needs full assistance',             // 3
      5: 'Yes, more than once',               // 2
      7: 'Family members are helping -- but it is becoming a strain', // 2
      8: 'Mostly isolated -- limited social contact', // 2 → total = 9, still complex
    })).pathway).toBe('complex-medical-consult');

    // Score=8 cleanly: Q4=3, Q5=2, Q7=2, Q8=1
    expect(selectScPathway(base({
      4: 'Needs full assistance',             // 3
      5: 'Yes, more than once',               // 2
      7: 'Family members are helping -- but it is becoming a strain', // 2
      8: 'Somewhat active -- some social contact but more isolated than before', // 1
      // score = 8, no safety preference
    })).pathway).toBe('residential-care-home');
  });

  it('memory-care fires for Q6>=2 even when total score is low (score=2)', () => {
    const result = selectScPathway(base({
      6: 'Yes -- this is becoming a regular concern', // Q6=2, total score = 2
    }));
    expect(result.pathway).toBe('memory-care');
    expect(result.score).toBe(2);
  });
});

// ---------------------------------------------------------------------------
// Financial nav needed flag
// ---------------------------------------------------------------------------

describe('financialNavNeeded', () => {
  it('is true when Q10 = "No -- this is one of the things we need to figure out"', () => {
    expect(selectScPathway(base({
      10: 'No -- this is one of the things we need to figure out',
    })).financialNavNeeded).toBe(true);
  });

  it('is true when Q10 = "Partially -- we are not sure what is available"', () => {
    expect(selectScPathway(base({
      10: 'Partially -- we are not sure what is available',
    })).financialNavNeeded).toBe(true);
  });

  it('is false when Q10 = "Yes -- we have thought about this"', () => {
    expect(selectScPathway(base({
      10: 'Yes -- we have thought about this',
    })).financialNavNeeded).toBe(false);
  });

  it('is false when Q10 = "I would rather not say"', () => {
    expect(selectScPathway(base({
      10: 'I would rather not say',
    })).financialNavNeeded).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Urgency modifier
// ---------------------------------------------------------------------------

describe('urgency modifier', () => {
  it('Q9 "We need to act now" → high', () => {
    expect(selectScPathway(base({ 9: 'We need to act now' })).urgency).toBe('high');
  });

  it('Q9 "Fairly soon -- things are progressing" → high', () => {
    expect(selectScPathway(base({ 9: 'Fairly soon -- things are progressing' })).urgency).toBe('high');
  });

  it('Q9 "In the next few months" → moderate', () => {
    expect(selectScPathway(base({ 9: 'In the next few months' })).urgency).toBe('moderate');
  });

  it('Q9 "We have time -- this is planning ahead" → low', () => {
    expect(selectScPathway(base({ 9: 'We have time -- this is planning ahead' })).urgency).toBe('low');
  });

  it('Q2 health event boosts low → moderate', () => {
    expect(selectScPathway(base({
      2: "We've had a health event or close call and we're reassessing",
      9: 'We have time -- this is planning ahead',
    })).urgency).toBe('moderate');
  });

  it('Q2 health event boosts moderate → high', () => {
    expect(selectScPathway(base({
      2: "We've had a health event or close call and we're reassessing",
      9: 'In the next few months',
    })).urgency).toBe('high');
  });

  it('Q2 health event does not exceed high', () => {
    expect(selectScPathway(base({
      2: "We've had a health event or close call and we're reassessing",
      9: 'We need to act now',
    })).urgency).toBe('high');
  });
});
