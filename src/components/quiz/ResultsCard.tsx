"use client";

import { TierResult } from "@/lib/quiz/scoring";
import { QUESTIONS, ANSWER_OPTIONS } from "@/lib/quiz/questions";
import InlineEmailForm from "./InlineEmailForm";
import { markSubmissionClicked } from "@/app/actions/submissions";

interface ResultsCardProps {
  result: TierResult;
  answers: Record<string, number>;
  submissionId: string | null;
}

// Tie-breaking priority: Safety > Caregiver > Night > alphabetical
const PATTERN_PRIORITY: Record<string, number> = { Safety: 1, Caregiver: 2, Night: 3 };

function patternSort(a: { category: string; score: number }, b: { category: string; score: number }) {
  if (b.score !== a.score) return b.score - a.score;
  const pa = PATTERN_PRIORITY[a.category] ?? 99;
  const pb = PATTERN_PRIORITY[b.category] ?? 99;
  if (pa !== pb) return pa - pb;
  return a.category.localeCompare(b.category);
}

// Show categories where score >= 50% of max (2+). Always show 3–4 cards.
// Returns null if all scores are 0 (triggers replacement line).
function getFilteredInsights(answers: Record<string, number>): { category: string; insight: string }[] | null {
  const scored = QUESTIONS.map(q => ({ category: q.category, insight: q.insight, score: answers[q.id] ?? 0 }));

  if (scored.every(c => c.score === 0)) return null;

  // Overview is a scoring signal only — never shown as a Patterns card
  const EXCLUDED_FROM_PATTERNS = ['Overview'];
  const scoredFiltered = scored.filter(c => !EXCLUDED_FROM_PATTERNS.includes(c.category));

  const qualifying = scoredFiltered.filter(c => c.score >= 2);

  let toShow = qualifying;
  if (qualifying.length < 3) {
    const qualifyingCategories = new Set(qualifying.map(c => c.category));
    const remainder = scoredFiltered
      .filter(c => !qualifyingCategories.has(c.category))
      .sort(patternSort);
    toShow = [...qualifying, ...remainder].slice(0, 3);
  }

  return toShow.sort(patternSort).slice(0, 4);
}

const TIER_BADGE: Record<number, { label: string; cls: string }> = {
  1: { label: "Tier 1 — Stable", cls: "bg-emerald-100 text-emerald-700" },
  2: { label: "Tier 2 — Emerging Needs", cls: "bg-amber-100 text-amber-700" },
  3: { label: "Tier 3 — Transition Point", cls: "bg-rose-100 text-rose-700" },
};

export default function ResultsCard({ result, answers, submissionId }: ResultsCardProps) {
  const maxScore = QUESTIONS.length * Math.max(...ANSWER_OPTIONS.map((o) => o.value));
  const filteredInsights = getFilteredInsights(answers);
  const badge = TIER_BADGE[result.tier];

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Required heading */}
      <h1 className="text-[28px] font-serif text-stone-800 text-center mb-6">
        Your Care Clarity Report
      </h1>

      {/* Score header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 mb-4">
          <span
            className={`text-[18px] font-mono tracking-widest uppercase px-3 py-1 rounded-full ${badge.cls}`}
          >
            {badge.label}
          </span>
        </div>

        <div className="flex items-baseline justify-center gap-2 mb-2">
          <span className="text-6xl font-serif font-bold text-stone-800">{result.score}</span>
          <span className="text-[18px] text-stone-500 font-mono">/{maxScore}</span>
        </div>

        <h2 className="text-[22px] md:text-[24px] font-serif text-stone-700 mt-3 leading-snug max-w-lg mx-auto">
          {result.headline}
        </h2>

        <p className="text-[18px] text-stone-600 mt-4 max-w-md mx-auto leading-relaxed">
          {result.body}
        </p>
      </div>

      {/* CTA */}
      {result.cta.type === "partner" && (() => {
        const cta = result.cta as { type: "partner"; name: string; phone: string };
        return (
          <div className="mb-8 text-center">
            <button
              className="inline-flex items-center justify-center rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-[18px] font-medium px-6 py-3 transition-colors"
              onClick={() => {
                if (submissionId) markSubmissionClicked(submissionId).catch(() => {});
                window.location.href = `tel:${cta.phone}`;
              }}
            >
              Call {cta.name}
            </button>
          </div>
        );
      })()}

      {result.cta.type === "elt" && (
        <div className="mb-8">
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-5 py-4 text-center mb-2">
            <p className="text-[18px] text-rose-900 font-medium leading-relaxed">
              You can schedule a Care Clarity Review with{" "}
              <strong>Elder Life Transitions</strong> to walk through the full situation
              with a past Executive Director of Independent Living and Assisted Living/Memory Care communities.
              Together we’ll review what is changing, clarify priorities, and identify
              the most appropriate support options for the next stage.
            </p>
          </div>
          {result.cta.showEmailForm && <InlineEmailForm submissionId={submissionId} />}
        </div>
      )}

      {/* Insights grouped by category */}
<div className="mt-8">
  {filteredInsights === null ? (
    <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-center">
      <p className="text-[18px] text-emerald-900 leading-relaxed">
        Your responses reflect a situation that appears well-supported at this time.
      </p>
    </div>
  ) : (
    <>
      <h3 className="text-[18px] font-mono tracking-widest uppercase text-stone-600 mb-4">
        Patterns Worth Exploring
      </h3>

      <div className="space-y-4">
        {filteredInsights.map(({ category, insight }) => (
          <div
            key={category}
            className="rounded-xl border border-stone-100 bg-white px-5 py-4"
          >
            <span className="inline-block bg-amber-100 text-amber-800 text-[18px] font-mono tracking-widest px-3 py-1 rounded uppercase mb-3">
              {category}
            </span>
            <p className="text-[18px] text-stone-600 leading-relaxed mt-2">
              {insight}
            </p>
          </div>
        ))}
      </div>
    </>
  )}
</div>
    </div>
  );
}