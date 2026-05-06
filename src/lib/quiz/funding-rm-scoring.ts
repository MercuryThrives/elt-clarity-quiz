import type { FundingRmPathway } from '@/lib/funding-rm-content';

export type { FundingRmPathway };

export type FundingRmResult = {
  pathway: FundingRmPathway;
  score: number;
  maxScore: number;
  ageBand: 0 | 1 | 2 | 3;
};

export function scoreFundingRm(answers: Record<string, number>): FundingRmResult {
  const age      = answers['rm_age']      ?? 0;
  const residence = answers['rm_residence'] ?? 0;
  const equity   = answers['rm_equity']   ?? 0;
  const property = answers['rm_property'] ?? 0;
  const medicaid = answers['rm_medicaid'] ?? 0;

  const ageBand = (age <= 3 ? age : 0) as 0 | 1 | 2 | 3;
  const maxScore = 11;

  // Step 1 — Hard disqualifiers
  if (age === 0 || equity === 0 || residence === 0) {
    return { pathway: 'not-a-fit', score: 0, maxScore, ageBand };
  }

  // Step 2 — Medicaid flag
  if (medicaid === 0 || medicaid === 1) {
    const score = age + residence + equity + property;
    return { pathway: 'medicaid-flag', score, maxScore, ageBand };
  }

  // Step 3 — Score
  const score = age + residence + equity + property;

  // Step 4 — Pathway assignment
  let pathway: FundingRmPathway;
  if (score >= 9) {
    pathway = 'likely-fit';
  } else if (score >= 5) {
    pathway = 'explore-with-caveats';
  } else {
    pathway = 'not-a-fit';
  }

  return { pathway, score, maxScore, ageBand };
}
