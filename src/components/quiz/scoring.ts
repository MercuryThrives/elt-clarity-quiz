export type Tier = 1 | 2 | 3;

export interface TierResult {
  tier: Tier;
  score: number;
  headline: string;
  body: string;
  cta: { type: "none" } | { type: "partner"; name: string } | { type: "elt"; showEmailForm: boolean };
}

export function calculateTier(score: number): Tier {
  if (score <= 18) return 1;
  if (score <= 29) return 2;
  return 3;
}

export function buildTierResult(score: number): TierResult {
  const tier = calculateTier(score);

  if (tier === 1) {
    return {
      tier,
      score,
      headline: "Your situation appears stable for now.",
      body: "Based on your responses, your loved one's current care arrangement seems to be meeting their needs. It's still a good idea to revisit this assessment periodically, as care needs can change over time.",
      cta: { type: "none" },
    };
  }

  if (tier === 2) {
    return {
      tier,
      score,
      headline: "Some areas may benefit from additional support.",
      body: "Your responses indicate emerging care challenges that are worth addressing proactively. Speaking with a care advisor can help you understand your options before needs become more urgent.",
      cta: { type: "partner", name: "{{PARTNER_AGENCY_NAME}}" },
    };
  }

  return {
    tier,
    score,
    headline: "A more comprehensive care plan may be needed.",
    body: "Your responses suggest that the current care situation may be reaching a critical juncture. A dedicated transition specialist can help your family evaluate options, align on next steps, and move forward with clarity and confidence.",
    cta: { type: "elt", showEmailForm: true },
  };
}