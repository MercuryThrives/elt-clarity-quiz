/**
 * SNF (Skilled Nursing Facility) track configuration.
 * Completely separate from the HCA track — none of these questions or thresholds
 * affect the existing HCA quiz flow.
 */

import type { Question } from "./questions";
import type { TierResult } from "./scoring";
import { selectSnfPathway } from "./snf-scoring";

// ---------------------------------------------------------------------------
// Questions
// ---------------------------------------------------------------------------

export const SNF_QUESTIONS: Question[] = [
  {
    id: "SNF_Q01",
    category: "Physical Function",
    format: "list",
    text: "Before this stay, how was your loved one managing activities of daily living such as bathing, dressing, transferring, and feeding?",
    insight:
      "Pre-admission ADL performance is the strongest single predictor of what's required at home post-discharge. When personal care was already difficult, the demands of recovery add a layer families often underestimate.",
    options: [
      { value: 1, label: "Managing independently" },
      { value: 2, label: "Managing with some help from family" },
      { value: 2.5, label: "Managing with some help from family — and there have been recent falls or balance concerns" },
      { value: 3, label: "Struggling — needed significant daily help" },
      { value: 4, label: "Was not able to manage safely at home" },
    ],
  },
  {
    id: "SNF_Q01B",
    category: "Instrumental Function",
    format: "list",
    text: "Before this stay, how was your loved one managing tasks like preparing meals, managing medications, handling finances, and getting to appointments?",
    insight:
      "Medication management, meal preparation, and appointment coordination are the functional tasks most often managed informally by family — and the ones most likely to fall through the cracks at home without a structured support plan.",
    options: [
      { value: 1, label: "Managing all of these independently" },
      { value: 2, label: "Managing most tasks with occasional help — including keeping track of medications" },
      { value: 3, label: "Struggling with several of these — needed regular assistance" },
      { value: 4, label: "Unable to manage these independently" },
    ],
  },
  {
    id: "SNF_Q02",
    category: "Cognitive Status",
    format: "slider",
    text: "Have you noticed memory problems, confusion, or difficulty with judgment and decision-making?",
    insight:
      "Cognitive changes fundamentally affect what's safe at home. Even moderate memory gaps or confusion create risks around medications, emergency response, and judgment that require oversight beyond what scheduled visits can reliably provide.",
    options: [
      { value: 1, label: "No — thinking and memory seem clear" },
      { value: 2, label: "Mild changes — occasional forgetfulness but mostly fine" },
      { value: 3, label: "Moderate — frequent confusion or memory gaps that affect daily life" },
      { value: 4, label: "Significant — ongoing confusion, safety concerns, needs supervision" },
    ],
  },
  {
    id: "SNF_Q03",
    category: "Medical & Therapy Needs",
    format: "list",
    text: "After discharge, will your loved one require ongoing medical or therapy services?",
    insight:
      "Post-discharge medical and therapy requirements are the primary clinical driver of placement decisions. Underestimating these needs is the most common reason for readmission within 30 days.",
    options: [
      { value: 1, label: "No ongoing medical or therapy needs expected" },
      { value: 2, label: "Physical, occupational, or speech therapy — but no nursing needs" },
      { value: 3, label: "Yes — regular skilled nursing or therapy visits needed" },
      { value: 4, label: "Yes — complex needs that likely require 24-hour medical oversight" },
    ],
  },
  {
    id: "SNF_Q04",
    category: "Caregiver Availability",
    format: "list",
    text: "Is there a family member or close friend who is realistically able to provide regular hands-on help after discharge?",
    insight:
      "The presence — or absence — of a reliable family caregiver is often the decisive variable in whether a home discharge is viable. Availability and capacity are different things, and planning should account for both.",
    options: [
      { value: 1, label: "Yes — available daily and able to handle physical care" },
      { value: 2, label: "Yes — available but limited in what they can physically do" },
      { value: 3, label: "Somewhat — available occasionally but not consistently" },
      { value: 4, label: "No — no family caregiver available" },
    ],
  },
  {
    id: "SNF_Q05",
    category: "Caregiver Capacity",
    format: "list",
    // Skip when Q4 = 4 ("No caregiver available") and auto-assign score 4
    skipIf: { questionId: "SNF_Q04", triggerValue: 4, autoScore: 4 },
    text: "How is the primary family caregiver holding up?",
    insight:
      "A caregiver who is already stretched is not a stable foundation for a home discharge plan. Caregiver strain tends to intensify post-discharge as recovery demands add to existing responsibilities.",
    options: [
      { value: 1, label: "Doing well — manageable so far" },
      { value: 2, label: "Getting tired but committed to continuing" },
      { value: 3, label: "Overwhelmed — struggling to keep up" },
      { value: 4, label: "There is no primary caregiver" },
    ],
  },
  {
    id: "SNF_Q06",
    category: "Home Environment",
    format: "slider",
    text: "Is the current home set up — or able to be modified — to support your loved one's care needs?",
    insight:
      "Physical accessibility is frequently underestimated in discharge planning. Stairs, bathroom configuration, and spatial layout can make an otherwise manageable situation unsafe or unsustainable within the first weeks of return.",
    options: [
      { value: 1, label: "Yes — home is accessible and appropriate" },
      { value: 2, label: "Possibly — some modifications would be needed" },
      { value: 3, label: "Unlikely — significant barriers such as stairs, layout, or isolation" },
      { value: 4, label: "No — home is not a viable option" },
    ],
  },
  {
    id: "SNF_Q07",
    category: "Patient Preference",
    format: "list",
    text: "What does your loved one prefer when it comes to where they live?",
    insight:
      "Patient preference is ethically important and practically significant. When preference conflicts with functional reality, the planning conversation becomes harder — but the earlier it's had, the more options remain available.",
    options: [
      { value: 1, label: "Strongly prefers to return home" },
      { value: 2, label: "Open to either home or a care community" },
      { value: 3, label: "Interested in a care community with peers and activities" },
      { value: 4, label: "Unable to express a preference due to cognitive or health status" },
    ],
  },
  {
    id: "SNF_Q08",
    category: "Social Connection",
    format: "slider",
    text: "Outside of immediate family, how often does your loved one have meaningful social contact?",
    insight:
      "Social isolation is associated with faster functional decline and higher readmission rates. A care setting that provides peer engagement and structured activity may offer better long-term outcomes than a home environment where meaningful contact is rare.",
    options: [
      { value: 1, label: "Regularly — active social life and community engagement" },
      { value: 2, label: "Occasionally — some social contact but not consistent" },
      { value: 3, label: "Rarely — limited contact outside immediate family" },
      { value: 4, label: "Almost never — little to no social engagement" },
    ],
  },
  {
    id: "SNF_Q09",
    category: "Financial Planning",
    format: "list",
    modifier: true, // tracked for context only — does not affect the score or pathway
    text: "How is your family planning to cover ongoing care costs?",
    insight:
      "Financial planning shapes which care options are actually available. Understanding the payer mix early — private pay, family support, Medicaid — helps narrow realistic options before a crisis forces a decision.",
    options: [
      { value: 1, label: "Private pay — personal savings, investments, or long-term care insurance" },
      { value: 2, label: "Primarily relying on family support" },
      { value: 3, label: "Medicaid eligible or expecting to apply" },
      { value: 4, label: "Not sure yet — still figuring this out" },
    ],
  },
  {
    id: "SNF_Q10",
    category: "Timeline",
    format: "list",
    modifier: true, // tracked for context only — does not affect the score or pathway
    text: "How quickly does a care decision need to be made?",
    insight:
      "Timeline urgency shapes the quality of planning. Families facing imminent discharge often make reactive decisions that don't hold up. Understanding the timeline allows for a more deliberate process when possible.",
    options: [
      { value: 1, label: "Immediately — discharge is imminent within days" },
      { value: 2, label: "Soon — within the next one to two weeks" },
      { value: 3, label: "We have some time — a few weeks to plan" },
      { value: 4, label: "No immediate pressure — exploring options proactively" },
    ],
  },
];

// ---------------------------------------------------------------------------
// Guide content (per-category, same shape as HCA's GUIDE_CONTENT)
// ---------------------------------------------------------------------------

export const SNF_GUIDE_CONTENT: Record<string, { title: string; paragraphs: string[] }> = {
  // Placeholder — add per-category guide copy here as the track develops.
};

// ---------------------------------------------------------------------------
// Scoring
// ---------------------------------------------------------------------------

/** Question IDs that are modifier-only and must be excluded from the score total. */
export const SNF_MODIFIER_IDS = new Set(["SNF_Q09", "SNF_Q10"]);

/** Score only the 9 non-modifier questions. */
export function calculateSnfScore(answers: Record<string, number>): number {
  return Object.entries(answers)
    .filter(([id]) => !SNF_MODIFIER_IDS.has(id))
    .reduce((sum, [, v]) => sum + v, 0);
}

/** Placeholder thresholds — adjust once SNF copy and pathway design is finalised. */
export function calculateSnfTier(score: number): 1 | 2 | 3 {
  if (score <= 14) return 1;
  if (score <= 25) return 2;
  return 3;
}

export function buildSnfTierResult(
  score: number,
  _partner?: { name: string; phone: string } | null,
  answers?: Record<string, number>
): TierResult {
  const tier = calculateSnfTier(score);
  const pathway = answers ? selectSnfPathway(answers) : null;

  // Placeholder result text — replace with SNF-specific copy per pathway.
  // `pathway` is available here for future per-pathway messaging.
  void pathway;

  if (tier === 1) {
    return {
      tier,
      score,
      headline: "[SNF Tier 1] Placeholder — home return appears feasible with moderate support.",
      body: "[SNF] Placeholder body copy — replace with SNF-specific Tier 1 messaging.",
      cta: { type: "none" },
    };
  }

  if (tier === 2) {
    return {
      tier,
      score,
      headline: "[SNF Tier 2] Placeholder — several factors suggest additional planning is needed.",
      body: "[SNF] Placeholder body copy — replace with SNF-specific Tier 2 messaging.",
      cta: { type: "none" },
    };
  }

  return {
    tier,
    score,
    headline: "[SNF Tier 3] Placeholder — indicators suggest a care community may be the right next step.",
    body: "[SNF] Placeholder body copy — replace with SNF-specific Tier 3 messaging.",
    cta: { type: "elt", showEmailForm: true },
  };
}
