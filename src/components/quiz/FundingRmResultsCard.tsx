"use client";

import { useState } from "react";
import {
  FUNDING_RM_CONTENT,
  FUNDING_RM_DISCLAIMER,
  type FundingRmPathway,
} from "@/lib/funding-rm-content";
import type { FundingRmResult } from "@/lib/quiz/funding-rm-scoring";
import {
  saveFundingRmSubmission,
  updateFundingRmPhone,
} from "@/app/actions/funding-rm-submissions";

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

const TENSION_PARAGRAPH: Record<FundingRmPathway, string> = {
  "likely-fit":
    "Based on what you shared, there are a few things worth knowing before any conversations happen -- starting with what the numbers could actually look like for your family's situation.",
  "explore-with-caveats":
    "Based on what you shared, there are factors in this situation worth understanding before any conversations happen -- and at least one of them may matter less than you think.",
  "medicaid-flag":
    "Based on what you shared, there is something important to get right before any reverse mortgage conversation happens. Getting the sequence wrong here can create problems that didn't exist before.",
  "not-a-fit":
    "Based on what you shared, a standard reverse mortgage may not be the right tool here -- but the funding question isn't closed. There are other options most families never think to look at.",
};

function highlightIndex(ageBand: 0 | 1 | 2 | 3): number | null {
  if (ageBand === 1) return 0;
  if (ageBand === 2) return 1;
  if (ageBand === 3) return 2;
  return null;
}

export default function FundingRmResultsCard({
  result,
  submissionId: _submissionId,
  partnerId,
}: FundingRmResultsCardProps) {
  const content = FUNDING_RM_CONTENT[result.pathway];
  const highlighted = highlightIndex(result.ageBand);

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isPhoneSubmitted, setIsPhoneSubmitted] = useState(false);
  const [submittedRowId, setSubmittedRowId] = useState<string | null>(null);
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneInput, setPhoneInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const formValid = firstName.trim() !== "" && email.trim() !== "";

  async function handleSubmit() {
    if (!formValid || isSubmitting) return;
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const { submissionId: rowId } = await saveFundingRmSubmission({
        firstName: firstName.trim(),
        email: email.trim(),
        pathway: result.pathway,
        score: result.score,
        ageBand: result.ageBand,
        submissionId: null,
        partnerId: partnerId ?? null,
      });
      setSubmittedRowId(rowId);
      setIsSubmitted(true);
    } catch (err) {
      console.error("[funding-rm] submission error:", err);
      setSubmitError("Something went wrong -- please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handlePhoneSubmit() {
    if (!phoneInput.trim() || !submittedRowId) return;
    try {
      await updateFundingRmPhone(submittedRowId, phoneInput.trim());
      setIsPhoneSubmitted(true);
    } catch (err) {
      console.error("[funding-rm] phone update error:", err);
      setIsPhoneSubmitted(true);
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto">

      {/* Zone A1 — Badge + Headline + Tension Paragraph (always visible) */}
      <div className="text-center">
        <span
          className={`inline-flex items-center px-3 py-1 rounded-full font-mono tracking-widest uppercase text-[12px] font-medium mb-6 ${BADGE_STYLE[result.pathway]}`}
        >
          {BADGE_LABEL[result.pathway]}
        </span>
        <h1 className="font-serif text-[26px] sm:text-[30px] text-stone-800 text-center leading-snug mb-4 max-w-2xl mx-auto">
          {content.headline}
        </h1>
        <p className="text-[17px] text-stone-600 text-center max-w-xl mx-auto leading-relaxed mb-8">
          {TENSION_PARAGRAPH[result.pathway]}
        </p>
      </div>

      {!isSubmitted ? (
        <>
          {/* Zone A2 — Blurred equity teaser */}
          {content.equityIllustration.length > 0 && (
            <div className="mb-8">
              <p className="font-mono tracking-widest uppercase text-stone-400 text-[12px] mb-5 mt-2">
                WHAT THIS COULD LOOK LIKE
              </p>
              <div className="flex flex-col gap-3">
                {content.equityIllustration.map((band, i) => (
                  <div key={i} className="rounded-xl border border-stone-100 bg-white px-5 py-4">
                    <p className="font-mono uppercase text-[12px] text-amber-600 mb-1 font-medium">
                      {band.ageLabel}
                    </p>
                    <p className="text-[14px] text-stone-400 mb-3">{band.homeValue}</p>
                    <div className="mb-2">
                      <span className="text-[30px] font-serif font-bold text-stone-800 blur-sm select-none pointer-events-none">
                        {band.rangeLabel}
                      </span>
                    </div>
                    <p className="text-[13px] text-stone-400 italic leading-relaxed">{band.note}</p>
                  </div>
                ))}
              </div>
              <p className="text-[14px] text-stone-500 text-center mt-5 italic leading-relaxed">
                Enter your email below to see the full breakdown for your situation -- we&rsquo;ll send it to your inbox so you have it on hand.
              </p>
            </div>
          )}

          {/* Gate form */}
          <div className="bg-white rounded-2xl border border-stone-200 shadow-sm px-6 py-8 mt-8 max-w-lg mx-auto">
            <h2 className="font-serif text-[22px] text-stone-800 mb-2 leading-snug">
              Where should we send your funding summary?
            </h2>
            <p className="text-[15px] text-stone-500 mb-6 leading-relaxed">
              Takes 10 seconds. We&rsquo;ll send your personalized result to your inbox -- and Dave will follow up personally if a specialist conversation makes sense.
            </p>
            <div className="flex flex-col gap-3">
              <label htmlFor="rm-first-name" className="sr-only">First name</label>
              <input
                id="rm-first-name"
                type="text"
                placeholder="First name"
                autoComplete="given-name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full rounded-xl border border-stone-200 px-4 py-3 text-[16px] text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent bg-stone-50"
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
                className="w-full rounded-xl border border-stone-200 px-4 py-3 text-[16px] text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent bg-stone-50"
              />
            </div>
            <button
              onClick={handleSubmit}
              disabled={!formValid || isSubmitting}
              className="w-full bg-[#C4621D] hover:bg-[#A8521A] active:bg-[#8C4416] text-white font-semibold rounded-xl px-6 py-4 text-[17px] mt-2 transition-colors duration-150 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Sending..." : "Send Me My Summary"}
            </button>
            <p className="text-[13px] text-stone-400 text-center mt-3 leading-relaxed">
              No loan application. No lender contact. Dave reads every submission personally -- and if a different path makes more sense for your situation, he&rsquo;ll tell you that too.
            </p>
            {submitError && (
              <p className="text-[13px] text-rose-500 text-center mt-2">{submitError}</p>
            )}
          </div>
        </>
      ) : (
        <>
          {/* Confirmation card */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-5 py-5 mb-10 max-w-lg mx-auto">
            <p className="font-serif text-[20px] text-emerald-800 mb-1">
              Your summary is on its way -- check your inbox.
            </p>
            <p className="text-[15px] text-stone-600 leading-relaxed">
              Dave will follow up personally within one business day.
            </p>
          </div>

          {/* Zone B1 — Full equity illustration (unblurred, age band highlighted) */}
          {content.equityIllustration.length > 0 && (
            <div className="mb-8">
              <p className="font-mono tracking-widest uppercase text-stone-400 text-[12px] mb-5 mt-2">
                WHAT THIS COULD LOOK LIKE
              </p>
              <div className="flex flex-col gap-3">
                {content.equityIllustration.map((band, i) => {
                  const isHighlighted = i === highlighted;
                  return (
                    <div
                      key={i}
                      className={`rounded-xl border px-5 py-4 ${
                        isHighlighted
                          ? "border-amber-400 bg-amber-50/60"
                          : "border-stone-100 bg-white"
                      }`}
                    >
                      <p className="font-mono uppercase text-[12px] text-amber-600 mb-1 font-medium">
                        {band.ageLabel}
                      </p>
                      <p className="text-[14px] text-stone-400 mb-3">{band.homeValue}</p>
                      <div className="mb-2">
                        <span className="text-[30px] font-serif font-bold text-stone-800">
                          {band.rangeLabel}
                        </span>
                      </div>
                      <p className="text-[13px] text-stone-400 italic leading-relaxed">{band.note}</p>
                    </div>
                  );
                })}
              </div>
              <p className="text-[12px] text-stone-400 leading-relaxed mt-4 max-w-prose mx-auto">
                {content.illustrationDisclaimer}
              </p>
            </div>
          )}

          {/* Zone B2 — Full body content */}
          <p className="text-[17px] text-stone-600 max-w-prose mx-auto leading-relaxed mt-10 mb-2">
            {content.body}
          </p>

          {/* Zone B3 — Anticipation bullets */}
          <div>
            <p className="font-mono tracking-widest uppercase text-stone-400 text-[12px] mb-5 mt-10">
              WHAT TO KNOW BEFORE ANY CONVERSATION
            </p>
            <div className="flex flex-col gap-3 max-w-prose mx-auto">
              {content.anticipationBullets.map((bullet, i) => (
                <div
                  key={i}
                  className="rounded-xl bg-stone-50 border border-stone-100 px-5 py-4 text-[16px] text-stone-700 leading-relaxed"
                >
                  {bullet}
                </div>
              ))}
            </div>
          </div>

          {/* Zone B4 — What families don't know */}
          <div>
            <p className="font-mono tracking-widest uppercase text-stone-400 text-[12px] mb-4 mt-10">
              WHAT MOST FAMILIES DON&rsquo;T KNOW
            </p>
            <div className="border-l-4 border-amber-400 bg-amber-50/30 rounded-r-xl px-6 py-5 max-w-prose mx-auto mt-2">
              <p className="text-[17px] text-stone-700 leading-relaxed italic">
                {content.whatFamiliesDontKnow}
              </p>
            </div>
          </div>

          {/* Zone B5 — Salty pretzel (placement seed, likely-fit and explore-with-caveats only) */}
          {(result.pathway === "likely-fit" ||
            result.pathway === "explore-with-caveats") && (
            <p className="text-[15px] text-stone-500 text-center max-w-prose mx-auto mt-10 leading-relaxed border-t border-stone-100 pt-8">
              Most families who look at the home equity question are also in the early stages of figuring out what kind of care actually fits their loved one&rsquo;s situation. That&rsquo;s a separate conversation -- and one Dave is glad to have whenever you&rsquo;re ready.
            </p>
          )}

          {/* Zone B6 — Secondary phone ask */}
          <div className="bg-white rounded-2xl border border-stone-200 shadow-sm px-6 py-8 mt-10 max-w-lg mx-auto">
            <p className="text-[18px] font-semibold text-stone-700 mb-2">
              Want Dave to reach out directly?
            </p>
            <p className="text-[15px] text-stone-500 mb-5 leading-relaxed">
              {content.ctaSubtext}
            </p>
            {!isPhoneSubmitted ? (
              <>
                <label htmlFor="rm-phone" className="sr-only">Your phone number</label>
                <input
                  id="rm-phone"
                  type="tel"
                  placeholder="Your phone number (optional)"
                  value={phoneInput}
                  onChange={(e) => setPhoneInput(e.target.value)}
                  className="w-full rounded-xl border border-stone-200 px-4 py-3 text-[16px] text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-400 bg-stone-50"
                />
                <button
                  onClick={handlePhoneSubmit}
                  className="w-full bg-stone-800 hover:bg-stone-700 active:bg-stone-900 text-white font-semibold rounded-xl px-6 py-4 text-[17px] mt-3 transition-colors duration-150"
                >
                  Yes -- have Dave call me
                </button>
                <p className="text-[13px] text-stone-400 text-center mt-2">
                  This goes directly to Dave -- not a call center.
                </p>
              </>
            ) : (
              <p className="text-[15px] text-emerald-700 font-medium text-center py-6">
                Got it -- Dave will be in touch.
              </p>
            )}
          </div>

          {/* Zone B7 — Compliance disclaimer */}
          <p className="text-[12px] text-stone-400 leading-relaxed max-w-prose mx-auto mt-10 mb-8 text-center">
            {FUNDING_RM_DISCLAIMER}
          </p>
        </>
      )}

    </div>
  );
}
