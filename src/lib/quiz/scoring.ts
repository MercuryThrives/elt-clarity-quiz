export type Tier = 1 | 2 | 3;

export interface TierResult {
  tier: Tier;
  score: number;
  headline: string;
  body: string;
  cta: { type: "none" } | { type: "partner"; name: string; phone: string } | { type: "elt"; showEmailForm: boolean };
}

export function calculateTier(score: number): Tier {
  if (score <= 18) return 1;
  if (score <= 29) return 2;
  return 3;
}

export function buildTierResult(
  score: number,
  partner?: { name: string; phone: string } | null
): TierResult {
  const tier = calculateTier(score);

  if (tier === 1) {
    return {
      tier,
      score,
      headline: "Your current care plan appears stable at this stage.",
      body:
        "Based on your responses, the current care arrangement appears to be functioning in key areas. That said, levels of support often evolve gradually. Periodic check-ins—especially around safety, nighttime patterns, and caregiver strain—can help ensure the plan continues to provide consistent and sustainable support. Keeping open communication with your care team can make these small adjustments feel smooth rather than reactive.",
      cta: { type: "none" },
    };
  }

  if (tier === 2) {
    return {
      tier,
      score,
      headline: "Your current support plan may benefit from adjustment.",
      body:
        "Your responses suggest that a few areas may be becoming harder to manage within the current routine. This often shows up as increased coordination, more frequent check-ins, or growing caregiver strain. Reviewing the care schedule and support coverage with your home care team can help ensure the plan stays aligned as situations evolve.",
      cta: partner ? { type: "partner", name: partner.name, phone: partner.phone } : { type: "none" },
    };
  }

  return {
    tier,
    score,
    headline: "Several signals suggest the current care arrangement may be reaching a transition point.",
    body:
      "Your responses suggest that several demands are building at once. When safety concerns, caregiver strain, and coordination challenges begin overlapping, the current setup can start to feel reactive rather than steady. This is often the point where families step back to clarify priorities, align on responsibilities, and determine whether the overall structure of support still fits circumstances.",
    cta: { type: "elt", showEmailForm: true },
  };
}