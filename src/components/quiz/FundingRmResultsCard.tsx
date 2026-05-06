"use client";

import { useState } from "react";
import {
  FUNDING_RM_CONTENT,
  FUNDING_RM_DISCLAIMER,
  type FundingRmPathway,
} from "@/lib/funding-rm-content";
import type { FundingRmResult } from "@/lib/quiz/funding-rm-scoring";
import { saveFundingRmSubmission } from "@/app/actions/funding-rm-submissions";

interface FundingRmResultsCardProps {
  result: FundingRmResult;
  submissionId: string | null;
  partnerId?: string | null;
}

const BADGE_STYLE: Record<FundingRmPathway, string> = {
  "likely-fit":           "bg-emerald-100 text-emerald-700",
  "explore-with-caveats": "bg-amber-100 text-amber-700",
  "medicaid-flag":        "bg-rose-100 text-rose-700",
  "not-a-fit":            "bg-stone-100 text-stone-600",
};

const BADGE_LABEL: Record<FundingRmPathway, string> = {
  "likely-fit":           "Likely a Good Fit",
  "explore-with-caveats": "Worth Exploring",
  "medicaid-flag":        "Medicaid Review Needed",
  "not-a-fit":            "Not the Right Tool Here",
};

const CTA_HEADING: Record<string, string> = {
  "specialist":  "Want Dave to make the introduction?",
  "elder-law":   "Want Dave to connect you with an elder law attorney?",
  "elt-direct":  "Want to talk through what options are actually available?",
  "dead-end":    "Have questions about other funding options?",
};

const CTA_BUTTON_TEXT: Record<string, string> = {
  "specialist":  "Yes — connect me with the specialist",
  "elder-law":   "Yes — connect me with an attorney",
  "elt-direct":  "Talk to Dave directly",
  "dead-end":    "Explore other options",
};

const CONFIRM_BODY: Record<string, string> = {
  "specialist":  "Your personalized funding summary is on its way. Dave will reach out personally to discuss next steps and make the introduction when the time is right.",
  "elder-law":   "Dave will reach out personally to discuss your situation and connect you with an elder law attorney who works regularly with these cases.",
  "elt-direct":  "Dave will reach out personally — no agenda, just a useful conversation about what options may be available.",
  "dead-end":    "Dave will follow up with information on other funding options that may apply to your family's situation.",
};

// ageBand → equity band card index to highlight
function highlightIndex(ageBand: 0 | 1 | 2 | 3): number | null {
  if (ageBand === 1) return 0;
  if (ageBand === 2) return 1;
  if (ageBand === 3) return 2;
  return null;
}

export default function FundingRmResultsCard({
  result,
  submissionId,
  partnerId,
}: FundingRmResultsCardProps) {
  const content = FUNDING_RM_CONTENT[result.pathway];

  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const formValid = firstName.trim() && email.trim();
  const highlighted = highlightIndex(result.ageBand);

  async function handleSubmit() {
    if (!formValid || loading) return;
    setLoading(true);
    try {
      await saveFundingRmSubmission({
        firstName: firstName.trim(),
        email: email.trim(),
        phone: phone.trim() || null,
        pathway: result.pathway,
        score: result.score,
        ageBand: result.ageBand,
        submissionId,
        partnerId: partnerId ?? null,
      });
      setSubmitted(true);
    } catch (err) {
      console.error("[funding-rm] submission error:", err);
      setSubmitted(true); // don't block the user on error
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-8">

      {/* ── Zone 1: Badge + Headline + Body ────────────────────────────── */}
      <div className="text-center">
        <span className={`inline-block font-mono tracking-widest uppercase rounded-full px-3 py-1 text-[15px] mb-4 ${BADGE_STYLE[result.pathway]}`}>
          {BADGE_LABEL[result.pathway]}
        </span>
        <h1 className="font-serif text-[24px] text-stone-800 leading-snug mb-4">
          {content.headline}
        </h1>
        <p className="text-[18px] text-stone-600 leading-relaxed max-w-prose mx-auto">
          {content.body}
        </p>
      </div>

      {/* ── Zone 2: Equity Illustration ─────────────────────────────────── */}
      {content.equityIllustration.length > 0 && (
        <div>
          <h2 className="font-mono tracking-widest uppercase text-stone-600 text-[18px] mb-4">
            What this could look like
          </h2>
          <div className="space-y-3">
            {content.equityIllustration.map((band, i) => {
              const isHighlighted = i === highlighted;
              return (
                <div
                  key={i}
                  className={`rounded-xl border px-5 py-4 ${isHighlighted ? "border-amber-400 bg-amber-50" : "border-stone-100 bg-white"}`}
                >
                  <p className="font-mono uppercase text-[14px] text-amber-700 mb-1">
                    {band.ageLabel}
                  </p>
                  <p className="text-[16px] text-stone-500 mb-1">{band.homeValue}</p>
                  <p className="font-serif font-bold text-[28px] text-stone-800 mb-1">
                    {band.rangeLabel}
                  </p>
                  <p className="text-[15px] text-stone-500 italic">{band.note}</p>
                </div>
              );
            })}
          </div>
          <p className="text-[12px] text-stone-400 leading-relaxed mt-3">
            {content.illustrationDisclaimer}
          </p>
        </div>
      )}

      {/* ── Zone 3: Anticipation Bullets ────────────────────────────────── */}
      <div>
        <h2 className="font-mono tracking-widest uppercase text-stone-600 text-[18px] mb-4">
          What to know before any conversation
        </h2>
        <div className="space-y-4">
          {content.anticipationBullets.map((bullet, i) => (
            <div key={i} className="rounded-xl border border-stone-100 bg-white px-5 py-4">
              <p className="text-[18px] text-stone-600 leading-relaxed">{bullet}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Zone 4: What Families Don't Know ────────────────────────────── */}
      <div>
        <h2 className="font-mono tracking-widest uppercase text-stone-600 text-[18px] mb-4">
          What most families don&rsquo;t know
        </h2>
        <div
          className="rounded-xl bg-amber-50/40 px-5 py-4"
          style={{ borderLeft: "3px solid #fbbf24" }}
        >
          <p className="text-[18px] text-stone-700 leading-relaxed">
            {content.whatFamiliesDontKnow}
          </p>
        </div>
      </div>

      {/* ── Zone 5: Contact Capture ──────────────────────────────────────── */}
      <div className="rounded-xl border border-stone-200 bg-white px-6 py-6">
        {!submitted ? (
          <>
            <h2 className="font-serif text-[22px] text-stone-800 mb-2">
              {CTA_HEADING[content.ctaType]}
            </h2>
            <p className="text-[17px] text-stone-600 mb-4 leading-relaxed">
              {content.ctaSubtext}
            </p>
            <div className="space-y-3 mb-4">
              <label htmlFor="rm-first-name" className="sr-only">First name</label>
              <input
                id="rm-first-name"
                type="text"
                placeholder="First name"
                autoComplete="given-name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full rounded-xl border border-stone-300 px-4 py-3 text-[18px] text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
              <label htmlFor="rm-email" className="sr-only">Email address</label>
              <input
                id="rm-email"
                type="email"
                placeholder="Email address"
                inputMode="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-stone-300 px-4 py-3 text-[18px] text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
              <label htmlFor="rm-phone" className="sr-only">Phone</label>
              <input
                id="rm-phone"
                type="tel"
                placeholder="Phone (optional)"
                inputMode="tel"
                autoComplete="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-xl border border-stone-300 px-4 py-3 text-[18px] text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>
            <button
              onClick={handleSubmit}
              disabled={!formValid || loading}
              className="w-full rounded-xl bg-[#C4621D] hover:bg-[#A8521A] disabled:opacity-50 text-white text-[18px] font-medium py-4 px-6 transition-colors cursor-pointer disabled:cursor-not-allowed"
            >
              {loading ? "Sending…" : CTA_BUTTON_TEXT[content.ctaType]}
            </button>
            <p className="text-[13px] text-stone-400 mt-3 text-center">
              Dave reads every submission personally and follows up within one business day.
            </p>
          </>
        ) : (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-4">
            <p className="text-[18px] text-emerald-800 font-medium mb-2">
              You&rsquo;re all set — check your inbox.
            </p>
            <p className="text-[16px] text-emerald-700 leading-relaxed">
              {CONFIRM_BODY[content.ctaType]}
            </p>
          </div>
        )}
      </div>

      {/* ── Zone 6: Compliance Disclaimer ───────────────────────────────── */}
      <p className="text-[12px] text-stone-400 leading-relaxed">
        {FUNDING_RM_DISCLAIMER}
      </p>

    </div>
  );
}
