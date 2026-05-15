/**
 * SC (Senior Care Clarity) track scoring engine.
 *
 * Score = Q4 + Q5 + Q6 + Q7 + Q8.
 * Rules execute in priority order; the first match wins.
 * Q2, Q9, Q10 are modifier-only; they do not change pathway selection.
 * Optimism bias: borderline cases route to the more-supported option.
 */

export type SCPathway =
  | 'home-family-support'
  | 'home-professional-hca'
  | 'independent-living'
  | 'assisted-living'
  | 'memory-care'
  | 'residential-care-home'
  | 'complex-medical-consult';

export type SCUrgency = 'low' | 'moderate' | 'high';

export interface SCResult {
  pathway: SCPathway;
  score: number;
  urgency: SCUrgency;
  financialNavNeeded: boolean;
}

// ---------------------------------------------------------------------------
// Per-question scoring helpers
// ---------------------------------------------------------------------------

function scoreQ4(a: string): number {
  if (a === 'None -- fully independent')       return 0;
  if (a === 'Some help, but mostly manages')   return 1;
  if (a === 'Needs regular help from someone') return 2;
  if (a === 'Needs full assistance')           return 3;
  return 0;
}

function scoreQ5(a: string): number {
  if (a === 'No')                               return 0;
  if (a === 'Once or twice, but minor')         return 1;
  if (a === 'Yes, more than once')              return 2;
  if (a === 'Yes, and it is a serious concern') return 3;
  return 0;
}

function scoreQ6(a: string): number {
  if (a === 'No noticeable changes')                                        return 0;
  if (a === 'Occasionally -- forgetting things, getting confused sometimes') return 1;
  if (a === 'Yes -- this is becoming a regular concern')                    return 2;
  if (a === 'Yes -- significant changes that affect daily safety')          return 3;
  return 0;
}

function scoreQ7(a: string): number {
  if (a === '[He/She/They is] managing independently')              return 0;
  if (a === 'Family members are helping -- we are managing okay')   return 1;
  if (a === 'A paid caregiver is already involved')                 return 1;
  if (a === 'Family members are helping -- but it is becoming a strain') return 2;
  if (a === 'No one is currently providing regular support')        return 2;
  return 0;
}

function scoreQ8(a: string): number {
  if (a === 'Active -- regularly involved with others and activities')              return 0;
  if (a === 'Somewhat active -- some social contact but more isolated than before') return 1;
  if (a === 'Mostly isolated -- limited social contact')                            return 2;
  if (a === 'Completely isolated -- this is a concern')                             return 3;
  return 0;
}

// ---------------------------------------------------------------------------
// Main scoring function
// ---------------------------------------------------------------------------

export function selectScPathway(answers: Record<number, string | string[]>): SCResult {
  const q2  = (answers[2]  as string)   ?? '';
  const q3  = (answers[3]  as string)   ?? '';
  const q4  = scoreQ4((answers[4]  as string) ?? '');
  const q5  = scoreQ5((answers[5]  as string) ?? '');
  const q6  = scoreQ6((answers[6]  as string) ?? '');
  const q7  = scoreQ7((answers[7]  as string) ?? '');
  const q8  = scoreQ8((answers[8]  as string) ?? '');
  const q9  = (answers[9]  as string)   ?? '';
  const q10 = (answers[10] as string)   ?? '';
  const q11 = (answers[11] as string[]) ?? [];

  const score = q4 + q5 + q6 + q7 + q8;

  const livingAlone     = q3 === 'Living alone at home';
  const caregiverStrain = (answers[7] as string) === 'Family members are helping -- but it is becoming a strain';
  const wantsSafety     = q11.includes('Being safe and well-supported');

  // ── Urgency ──────────────────────────────────────────────────────────────────
  let urgency: SCUrgency = 'low';
  if (q9 === 'We need to act now' || q9 === 'Fairly soon -- things are progressing') {
    urgency = 'high';
  } else if (q9 === 'In the next few months') {
    urgency = 'moderate';
  }
  // Q2 urgency boost: health event bumps urgency one level
  if (q2 === "We've had a health event or close call and we're reassessing") {
    urgency = urgency === 'low' ? 'moderate' : 'high';
  }

  // ── Financial nav flag ────────────────────────────────────────────────────────
  const financialNavNeeded =
    q10 === 'No -- this is one of the things we need to figure out' ||
    q10 === 'Partially -- we are not sure what is available';

  // ── Pathway routing ───────────────────────────────────────────────────────────

  function result(pathway: SCPathway): SCResult {
    return { pathway, score, urgency, financialNavNeeded };
  }

  // Rule 1: Complex Medical Consult — highest need / acute risk
  if (score >= 9 || (q5 === 3 && q6 >= 2)) {
    return result('complex-medical-consult');
  }

  // Rule 2: Memory Care — cognitive is the primary driver
  if (q6 >= 2) {
    return result('memory-care');
  }

  // Rule 3: Residential Care Home — high need, preserved cognition, safety preference
  // Bias bump: score=8 routes here even without explicit safety preference (no lower
  // threshold catches score=8 given assisted-living is defined as 4-7).
  if (score >= 5 && score <= 8 && q6 <= 1 && (wantsSafety || score >= 8)) {
    return result('residential-care-home');
  }

  // Rule 4: Assisted Living — moderate-high need, preserved cognition
  // Bias bump: score=4 (boundary with home-professional-hca) routes here.
  if (score >= 4 && q6 <= 1) {
    return result('assisted-living');
  }

  // Rule 5: Independent Living — isolation is the primary driver
  if (score <= 2 && q8 >= 2 && q6 <= 1) {
    return result('independent-living');
  }

  // Rule 6: Home with Professional HCA
  // Score 2-3 with caregiver strain or living-alone signal.
  // Bias bump: score=3 with no qualifying conditions still routes here rather
  // than home-family-support, since score=3 exceeds the home-family threshold.
  if (score >= 2 && score <= 3 && q6 <= 1 && (caregiverStrain || livingAlone || score >= 3)) {
    return result('home-professional-hca');
  }

  // Rule 7: Home with Family Support — default for genuinely low need
  return result('home-family-support');
}
