"use client";

import { TierResult } from "@/lib/quiz/scoring";
import { QUESTIONS } from "@/lib/quiz/questions";
import InlineEmailForm from "./InlineEmailForm";

interface ResultsCardProps {
  result: TierResult;
  answers: Record<string, number>;
}

// Group questions with score ≥ 3 by category
function getInsightsByCategory(answers: Record<string, number>) {
  const grouped: Record<string, { text: string; insight: string }[]> = {};
  for (const q of QUESTIONS) {
    const score = answers[q.id];
    if (score >= 3) {
      if (!grouped[q.category]) grouped[q.category] = [];
      grouped[q.category].push({ text: q.text, insight: q.insight });
    }
  }
  return grouped;
}

const TIER_BADGE: Record<number, { label: string; cls: string }> = {
  1: { label: "Tier 1 — Stable", cls: "bg-emerald-100 text-emerald-700" },
  2: { label: "Tier 2 — Emerging Needs", cls: "bg-amber-100 text-amber-700" },
  3: { label: "Tier 3 — Transition Point", cls: "bg-rose-100 text-rose-700" },
};

export default function ResultsCard({ result, answers }: ResultsCardProps) {
  const insightGroups = getInsightsByCategory(answers);
  const hasInsights = Object.keys(insightGroups).length > 0;
  const badge = TIER_BADGE[result.tier];

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Score header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 mb-4">
          <span className={`text-xs font-mono tracking-widest uppercase px-3 py-1 rounded-full ${badge.cls}`}>
            {badge.label}
          </span>
        </div>
        <div className="flex items-baseline justify-center gap-2 mb-1">
          <span className="text-6xl font-serif font-bold text-stone-800">{result.score}</span>
          <span className="text-stone-400 text-lg font-mono">/48</span>
        </div>
        <h2 className="text-xl md:text-2xl font-serif text-stone-700 mt-3 leading-snug max-w-lg mx-auto">
          {result.headline}
        </h2>
        <p className="text-sm text-stone-500 mt-3 max-w-md mx-auto leading-relaxed">
          {result.body}
        </p>
      </div>

      {/* CTA */}
      {result.cta.type === "partner" && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-5 py-4 mb-8 text-center">
          <p className="text-sm text-amber-800 font-medium">
            We recommend speaking with a care advisor at{" "}
            <strong>{result.cta.name}</strong> to explore your options.
          </p>
        </div>
      )}

      {result.cta.type === "elt" && (
        <div className="mb-8">
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-5 py-4 text-center mb-2">
            <p className="text-sm text-rose-800 font-medium">
              We recommend connecting with{" "}
              <strong>Elder Life Transitions</strong> for a personalized consultation.
            </p>
          </div>
          {result.cta.showEmailForm && <InlineEmailForm />}
        </div>
      )}

      {/* Insights grouped by category */}
      {hasInsights && (
        <div className="mt-6">
          <h3 className="text-xs font-mono tracking-widest uppercase text-stone-400 mb-4">
            Areas to Watch
          </h3>
          <div className="space-y-4">
            {Object.entries(insightGroups).map(([category, items]) => (
              <div key={category} className="rounded-xl border border-stone-100 bg-white px-5 py-4">
                <span className="inline-block bg-amber-100 text-amber-700 text-xs font-mono tracking-widest px-2 py-0.5 rounded uppercase mb-3">
                  {category}
                </span>
                {items.map((item, i) => (
                  <p key={i} className="text-xs text-stone-500 leading-relaxed mt-1">
                    {item.insight}
                  </p>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}