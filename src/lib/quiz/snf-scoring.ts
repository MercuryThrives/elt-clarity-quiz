/**
 * SNF pathway scoring engine.
 *
 * Rules execute in priority order; the first match wins.
 * Q9 and Q10 are modifier-only and do not affect pathway selection
 * (except Q9 which is read as a filter criterion in Rule 5).
 */

export type SnfPathway =
  | 'complex-medical'
  | 'memory-care'
  | 'home-family'
  | 'home-hca'
  | 'independent-living-hca'
  | 'residential-care'
  | 'assisted-living';

/**
 * Select the SNF care pathway from a completed answers map.
 * All values default to 0 if a question was not answered.
 */
export function selectSnfPathway(answers: Record<string, number>): SnfPathway {
  const q1  = answers['SNF_Q01']  ?? 0;
  const q1b = answers['SNF_Q01B'] ?? 0;
  const q2  = answers['SNF_Q02']  ?? 0;
  const q3  = answers['SNF_Q03']  ?? 0;
  const q4  = answers['SNF_Q04']  ?? 0;
  const q5  = answers['SNF_Q05']  ?? 0;
  const q6  = answers['SNF_Q06']  ?? 0;
  const q7  = answers['SNF_Q07']  ?? 0;
  const q8  = answers['SNF_Q08']  ?? 0;
  // Q9 value 3 = "Medicaid eligible or expecting to apply" — restricts Rule 5.
  const q9  = answers['SNF_Q09']  ?? 0;

  // ── Rule 1: Complex Medical Consult ──────────────────────────────────────
  // Highest priority. 24-hour medical oversight is required; no other routing
  // is appropriate until that need is assessed.
  if (q3 === 4) return 'complex-medical';

  // ── Rule 2: Memory Care ──────────────────────────────────────────────────
  // Trigger A: severe cognitive impairment alone.
  if (q2 === 4) return 'memory-care';

  // Trigger B: moderate cognitive impairment + high physical need OR low
  // caregiver availability. Exception clause lets Q2=3 / low-function-risk
  // cases (Q1<=2 AND Q4<=2) continue to Rule 3.
  if (q2 === 3 && (q1 >= 3 || q4 >= 3)) return 'memory-care';

  // ── Rule 3: Home with Family Support (+ bias bumps) ─────────────────────
  // The outer conditions represent a genuinely good situation across all
  // key domains. Q4 and Q5 are then inspected for optimism-bias bumps.
  if (q1 <= 2 && q1b <= 2 && q2 <= 2 && q3 <= 2 && q5 <= 2 && q6 <= 2) {
    if (q4 === 1) {
      // Bias Bump 1: caregiver is already tiring — bump to professional care.
      if (q5 === 2) return 'home-hca';
      return 'home-family';
    }

    // Bias Bump 2: borderline case — Q1 and Q1b both at max allowed for
    // home-family AND caregiver is limited (Q4=2) → professional care is safer.
    if (q4 === 2 && q1 === 2 && q1b === 2) return 'home-hca';
  }

  // ── Rule 5 bias bump (IL intercept before Rule 4) ───────────────────────
  // When the home environment is significantly problematic (Q6 >= 3), a
  // qualifying IL candidate should be routed to IL before Rule 4 (home-hca)
  // has a chance to fire.
  const ilBaseConditions =
    q2 <= 2 && q1 <= 2 && q1b <= 2 && q3 <= 2 && q8 >= 3 && q9 !== 3;

  if (ilBaseConditions && q6 >= 3) return 'independent-living-hca';

  // ── Rule 4: Home with Professional Home Care ─────────────────────────────
  // Moderate physical function, some IADL needs (Q1b>=2), limited caregiver
  // (Q4>=2), and a workable home environment.
  if (q1 <= 3 && q1b >= 2 && q2 <= 2 && q3 <= 3 && q4 >= 2 && q6 <= 3) {
    return 'home-hca';
  }

  // ── Rule 5: Independent Living with HCA Support ──────────────────────────
  // Good cognition and function, but home environment or patient preference
  // points toward a community setting. Social isolation (Q8>=3) is a key
  // clinical signal. Medicaid cases are excluded (IL is typically private-pay).
  if (ilBaseConditions && (q6 >= 2 || q7 >= 2)) {
    return 'independent-living-hca';
  }

  // ── Rule 6: Residential Care Home ────────────────────────────────────────
  // High physical need, low caregiver availability, problematic home — but
  // preserved enough cognition (Q2<=3) and home-leaning preference (Q7<=2)
  // to warrant a smaller, more personal residential setting over ALF.
  if (q1 >= 3 && q4 >= 3 && q6 >= 3 && q2 <= 3 && q7 <= 2) {
    // Bias Bump: when both physical function and caregiver availability are
    // exactly at the minimum residential threshold, prefer ALF.
    if (q1 === 3 && q4 === 3) return 'assisted-living';
    return 'residential-care';
  }

  // ── Rule 7: Assisted Living (default) ────────────────────────────────────
  return 'assisted-living';
}

// ── Modifiers ────────────────────────────────────────────────────────────────

/**
 * Returns an appended copy string based on Q9 (financial situation), or null
 * for private-pay cases which need no additional context.
 */
export function getSnfFinancialModifier(answers: Record<string, number>): string | null {
  const q9 = answers['SNF_Q09'] ?? 0;

  switch (q9) {
    case 1: // Private pay
      return null;
    case 2: // Family support
      return 'Family-supported arrangements vary widely — a consultation can help clarify what is realistic long-term.';
    case 3: // Medicaid
      return 'Medicaid-certified options exist — ELT can help identify which communities accept Medicaid in your area.';
    case 4: // Not sure
      return 'Understanding the financial picture early makes a significant difference — we can walk through this together.';
    default:
      return null;
  }
}

/**
 * Returns a CTA urgency string based on Q10 (discharge timeline).
 */
export function getSnfTimelineModifier(answers: Record<string, number>): string {
  const q10 = answers['SNF_Q10'] ?? 0;

  if (q10 === 1 || q10 === 2) {
    return 'Discharge timelines move quickly. Getting clarity now protects your options.';
  }
  return 'You have time to get this right. A conversation now means fewer surprises later.';
}
