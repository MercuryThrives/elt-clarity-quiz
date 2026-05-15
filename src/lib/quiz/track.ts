/**
 * Track detection and per-track config resolution.
 *
 * Default track is "hca" (Home Care Agency).
 * Pass ?track=snf in the URL to load the SNF track.
 */

import { QUESTIONS, ANSWER_OPTIONS } from "./questions";
import { buildTierResult, calculateTier } from "./scoring";
import { GUIDE_CONTENT } from "../guideContent";

import {
  SNF_QUESTIONS,
  SNF_GUIDE_CONTENT,
  buildSnfTierResult,
  calculateSnfTier,
  calculateSnfScore,
} from "./snf-config";

import { FUNDING_RM_QUESTIONS } from "../funding-rm-questions";

import type { Question } from "./questions";
import type { TierResult, Tier } from "./scoring";

export type TrackId = "hca" | "snf" | "funding-rm" | "senior_care";

export interface TrackConfig {
  id: TrackId;
  label?: string;
  notificationEmailEnv?: string;
  partnerType?: string;
  questions: Question[];
  /** Default answer options used for grid-format questions that have no explicit options array. */
  answerOptions: { value: number; label: string }[];
  guideContent: Record<string, { title: string; paragraphs: string[] }>;
  buildTierResult: (
    score: number,
    partner?: { name: string; phone: string } | null
  ) => TierResult;
  /** Returns the tier (1 | 2 | 3) for a given pre-computed score. */
  calculateTier: (score: number) => 1 | 2 | 3;
  /**
   * Returns the score total to use for tier determination and display.
   * Modifier questions are excluded where applicable.
   */
  calculateScore: (answers: Record<string, number>) => number;
}

const HCA_TRACK: TrackConfig = {
  id: "hca",
  questions: QUESTIONS,
  answerOptions: ANSWER_OPTIONS,
  guideContent: GUIDE_CONTENT,
  buildTierResult,
  calculateTier,
  calculateScore: (answers) => Object.values(answers).reduce((sum, v) => sum + v, 0),
};

const SNF_TRACK: TrackConfig = {
  id: "snf",
  questions: SNF_QUESTIONS,
  answerOptions: [], // all SNF questions have explicit options; this is unused
  guideContent: SNF_GUIDE_CONTENT,
  buildTierResult: buildSnfTierResult,
  calculateTier: calculateSnfTier,
  calculateScore: calculateSnfScore,
};

const FUNDING_RM_TRACK: TrackConfig = {
  id: "funding-rm",
  questions: FUNDING_RM_QUESTIONS,
  answerOptions: [],
  guideContent: {},
  // Stubs — funding-rm uses its own results page and never calls these.
  buildTierResult: () => ({ tier: 1 as Tier, score: 0, headline: '', body: '', cta: { type: 'none' as const } }),
  calculateTier: () => 1 as Tier,
  calculateScore: () => 0,
};

const SENIOR_CARE_TRACK: TrackConfig = {
  id: "senior_care",
  label: "Senior Care Clarity",
  notificationEmailEnv: "SC_NOTIFICATION_EMAIL",
  partnerType: "senior_care",
  questions: [],
  answerOptions: [],
  guideContent: {},
  // Stubs — senior_care questions, scoring, and UI are not yet wired.
  buildTierResult: () => ({ tier: 1 as Tier, score: 0, headline: '', body: '', cta: { type: 'none' as const } }),
  calculateTier: () => 1 as Tier,
  calculateScore: () => 0,
};

/**
 * Resolve the track config from a raw search-param value.
 * Any unrecognised value falls back to HCA.
 */
export function resolveTrack(trackParam: string | null | undefined): TrackConfig {
  if (trackParam === "snf") return SNF_TRACK;
  if (trackParam === "funding-rm") return FUNDING_RM_TRACK;
  if (trackParam === "senior_care") return SENIOR_CARE_TRACK;
  return HCA_TRACK;
}
