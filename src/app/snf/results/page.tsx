"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuiz } from "@/components/quiz/QuizStore";
import { selectSnfPathway, getSnfFinancialModifier, getSnfTimelineModifier } from "@/lib/quiz/snf-scoring";
import { normalizePartnerId } from "@/lib/partner";
import { saveSnfSubmission, markSnfSubmissionClicked } from "@/app/actions/snf-submissions";
import SnfHeader from "@/components/quiz/SnfHeader";
import {
  SNF_PATHWAY_CONTENT,
  COMMUNITY_PATHWAYS,
  CALENDAR_URL,
} from "@/lib/snf-pathway-content";

// ---------------------------------------------------------------------------
// Pathway display labels
// ---------------------------------------------------------------------------

const PATHWAY_LABELS: Record<string, string> = {
  "complex-medical":        "Complex Medical Assessment",
  "memory-care":            "Memory Care",
  "independent-living-hca": "Independent Living with Home Care",
  "home-hca":               "Home with Professional Home Care",
  "home-family":            "Home with Family Support",
  "residential-care":       "Residential Care Home",
  "assisted-living":        "Assisted Living",
};

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function SectionDivider() {
  return <div className="border-t border-stone-200 my-8" />;
}

// ---------------------------------------------------------------------------
// Main inner component
// ---------------------------------------------------------------------------

function SnfResultsInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { answers, reset } = useQuiz();

  const partnerId = normalizePartnerId(searchParams.get("partner"));

  // Gate state
  const [gateSubmitted, setGateSubmitted] = useState(false);
  const [gateLoading, setGateLoading] = useState(false);
  const [submissionId, setSubmissionId] = useState<string | null>(null);
  const submitting = useRef(false);

  // Form fields
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [consentChecked, setConsentChecked] = useState(false);

  // Redirect if no answers (e.g., direct URL access)
  useEffect(() => {
    if (!answers || Object.keys(answers).length === 0) {
      router.replace("/snf");
    }
  }, [answers, router]);

  if (!answers || Object.keys(answers).length === 0) return null;

  const pathway = selectSnfPathway(answers);
  const pathwayLabel = PATHWAY_LABELS[pathway] ?? pathway;
  const content = SNF_PATHWAY_CONTENT[pathway];
  const financialModifier = getSnfFinancialModifier(answers, pathway);
  const timelineModifier = getSnfTimelineModifier(answers);
  const isCommunityPathway = COMMUNITY_PATHWAYS.has(pathway);

  const formValid = firstName.trim() && email.trim() && consentChecked;

  async function handleGateSubmit() {
    if (!formValid || submitting.current) return;
    submitting.current = true;
    setGateLoading(true);

    try {
      const result = await saveSnfSubmission({
        partnerId,
        answers,
        firstName: firstName.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
      });
      setSubmissionId(result.submissionId);
      setGateSubmitted(true);
    } catch (err) {
      console.error("[SNF] Gate submission error:", err);
      // Don't block the user — reveal content anyway
      setGateSubmitted(true);
    } finally {
      setGateLoading(false);
    }
  }

  function handleConsultationClick() {
    // Track click to suppress the Email 2 follow-up
    if (submissionId) {
      markSnfSubmissionClicked(submissionId).catch(err =>
        console.error("[SNF] markClicked error:", err)
      );
    }
    window.open(CALENDAR_URL, "_blank", "noopener,noreferrer");
  }

  return (
    <main className="min-h-screen bg-[#faf9f7] flex flex-col">
      <SnfHeader />

      <div className="flex-1 flex flex-col items-center px-4 pt-12 pb-16">
        <div className="w-full max-w-2xl">

          {/* ── Section 1: Acknowledgment ─────────────────────────────────── */}
          <p className="text-[17px] text-stone-500 leading-relaxed mb-8">
            Navigating care options after a skilled nursing stay is one of the most stressful
            decisions a family faces. Based on what you shared, here is what appears to be worth
            exploring.
          </p>

          {/* ── Section 2: Primary Pathway Preview ───────────────────────── */}
          <div className="rounded-2xl border-2 border-amber-200 bg-amber-50 px-6 py-6 mb-8">
            <p className="text-[13px] font-mono tracking-widest uppercase text-amber-600 mb-2">
              Your Care Assessment
            </p>
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-stone-800 mb-3 leading-tight">
              Your answers point in a clear direction.
            </h2>
            <p className="text-[17px] text-stone-600 leading-relaxed mb-4">
              Your report covers three things most families don&rsquo;t know going in:
            </p>
            <ul className="space-y-3 mb-4">
              {content.anticipationBullets.map((bullet, i) => (
                <li key={i} className="flex gap-3">
                  <span className="mt-2 shrink-0 w-1.5 h-1.5 rounded-full bg-amber-400" />
                  <p className="text-[17px] text-stone-600 leading-relaxed">{bullet}</p>
                </li>
              ))}
            </ul>
            <p className="text-[15px] text-stone-500 italic">
              Discharge timelines move fast. The sooner you have this, the more options you have.
            </p>
          </div>

          <SectionDivider />

          <p className="text-[16px] text-stone-500 leading-relaxed italic mb-8">
            A daughter called me after we talked. She said it was the first time in weeks she felt like she actually knew what she was walking into.
          </p>

          {/* ── Section 3: Email Capture Gate ────────────────────────────── */}
          {!gateSubmitted ? (
            <div className="rounded-2xl border border-stone-200 bg-white px-6 py-6">
              <h3 className="text-xl font-serif text-stone-800 mb-2">
                Your answers point to a clear path. Here is what comes next.
              </h3>
              <p className="text-[17px] text-stone-600 leading-relaxed mb-3">
                I ran senior living communities for years, including Assisted Living/Memory Care and
                Independent Living, before I started helping families find the right fit. I&rsquo;ve
                seen this from both sides, and I built this report around what I wish every family
                knew going in.
              </p>
              <p className="text-[16px] text-stone-600 leading-relaxed mb-4">
                Elder Life Transitions will prepare your report and reach out to answer any
                questions. If you decide to explore your options further, ELT can help you ask the
                right questions and make a confident decision -- at no cost to your family.
              </p>
              {isCommunityPathway && (
                <p className="text-[14px] text-stone-400 italic mb-6">
                  ELT is compensated by care communities for private-pay placements. There is no cost
                  to families.
                </p>
              )}

              <div className="space-y-3 mb-4">
                <div>
                  <label htmlFor="snf-first-name" className="block text-[14px] text-stone-500 mb-1">
                    First Name
                  </label>
                  <input
                    id="snf-first-name"
                    type="text"
                    placeholder="First name"
                    autoComplete="given-name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-[17px] text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>
                <div>
                  <label htmlFor="snf-email" className="block text-[14px] text-stone-500 mb-1">
                    Email Address
                  </label>
                  <input
                    id="snf-email"
                    type="email"
                    placeholder="Email address"
                    inputMode="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-[17px] text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>
                <div>
                  <label htmlFor="snf-phone" className="block text-[14px] text-stone-500 mb-1">
                    Phone Number <span className="text-stone-400 font-normal">(optional)</span>
                  </label>
                  <input
                    id="snf-phone"
                    type="tel"
                    placeholder="Optional — for a personal call from Dave at ELT"
                    inputMode="tel"
                    autoComplete="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-[17px] text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                  <p className="mt-1.5 text-[13px] text-stone-400">We will only call if you&rsquo;d like us to.</p>
                </div>
              </div>

              <label className="flex items-start gap-3 cursor-pointer mb-4 group">
                <input
                  type="checkbox"
                  checked={consentChecked}
                  onChange={(e) => setConsentChecked(e.target.checked)}
                  className="mt-1 w-5 h-5 shrink-0 accent-amber-500 cursor-pointer"
                />
                <span className="text-[15px] text-stone-500 leading-relaxed group-hover:text-stone-700 transition-colors">
                  I understand that ELT may reach out to offer guidance and answer questions.
                </span>
              </label>

              <button
                onClick={handleGateSubmit}
                disabled={!formValid || gateLoading}
                className="w-full rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white text-[18px] font-medium py-4 px-6 transition-colors cursor-pointer disabled:cursor-not-allowed"
              >
                {gateLoading ? "Saving…" : "Get My Report"}
              </button>
              <p className="text-center text-[13px] text-stone-400 mt-3">
                Your report will be in your inbox shortly.
              </p>
            </div>
          ) : (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-4 mb-2">
              <p className="text-[17px] text-emerald-800 font-medium">
                Your report is on its way -- check your inbox.
              </p>
            </div>
          )}

          {/* ── Sections 4–6: Revealed after gate ────────────────────────── */}
          {gateSubmitted && (
            <>
              <SectionDivider />

              {/* ── Section 4: Pathway Content ───────────────────────────── */}
              <div className="space-y-6">

                {/* Why this fits */}
                <div className="rounded-xl border border-stone-100 bg-white px-5 py-5">
                  <p className="text-[13px] font-mono tracking-widest uppercase text-stone-400 mb-3">
                    Why This Appears to Fit Your Situation
                  </p>
                  <p className="text-[17px] text-stone-700 leading-relaxed">
                    {content.whyThisFits}
                  </p>
                </div>

                {/* What to anticipate */}
                <div className="rounded-xl border border-stone-100 bg-white px-5 py-5">
                  <p className="text-[13px] font-mono tracking-widest uppercase text-stone-400 mb-4">
                    What to Anticipate
                  </p>
                  <ul className="space-y-4">
                    {content.anticipationBullets.map((bullet, i) => (
                      <li key={i} className="flex gap-3">
                        <span className="mt-2 shrink-0 w-1.5 h-1.5 rounded-full bg-amber-400" />
                        <p className="text-[17px] text-stone-600 leading-relaxed">{bullet}</p>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* What most families don't know */}
                <div className="rounded-xl border border-amber-100 bg-amber-50/50 px-5 py-5">
                  <p className="text-[13px] font-mono tracking-widest uppercase text-amber-600 mb-3">
                    What Most Families Don&rsquo;t Know
                  </p>
                  <p className="text-[17px] text-stone-700 leading-relaxed">
                    {content.whatFamiliesDontKnow}
                  </p>
                </div>

                {/* Secondary pathway */}
                <div className="rounded-xl border border-stone-100 bg-white px-5 py-5">
                  <p className="text-[13px] font-mono tracking-widest uppercase text-stone-400 mb-3">
                    Also Worth Considering
                  </p>
                  <p className="text-[17px] text-stone-600 leading-relaxed">
                    {content.secondaryPathway}
                  </p>
                </div>

                {/* Financial modifier */}
                {financialModifier && (
                  <div className="rounded-xl border border-stone-200 bg-white px-5 py-4">
                    <p className="text-[13px] font-mono tracking-widest uppercase text-stone-400 mb-2">
                      Financial Consideration
                    </p>
                    <p className="text-[17px] text-stone-600 leading-relaxed">
                      {financialModifier}
                    </p>
                  </div>
                )}
              </div>

              <SectionDivider />

              {/* ── Section 5: CTA Block ──────────────────────────────────── */}
              <div className="space-y-4">
                <button
                  className="w-full rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-[18px] font-medium py-4 px-6 transition-colors cursor-pointer"
                  onClick={handleConsultationClick}
                >
                  Schedule a Free Consultation with ELT
                </button>

                <p className="text-[15px] text-stone-500 leading-relaxed">
                  {content.ctaSubtext ?? timelineModifier}
                </p>
              </div>

              <SectionDivider />

              {/* ── Section 6: Disclosure Footer ──────────────────────────── */}
              {isCommunityPathway && (
                <p className="text-[13px] text-stone-400 text-center leading-relaxed">
                  Elder Life Transitions is compensated by care communities for private-pay
                  placements. Our consultation is free to families. This tool is not a clinical
                  assessment and does not replace advice from a licensed healthcare professional.
                </p>
              )}

              <div className="mt-10 flex flex-col items-center gap-3">
                <button
                  onClick={() => {
                    reset();
                    router.push(partnerId ? `/snf?partner=${encodeURIComponent(partnerId)}` : "/snf");
                  }}
                  className="text-[15px] text-stone-400 hover:text-stone-600 font-mono tracking-widest uppercase transition-colors cursor-pointer"
                >
                  ← Retake Assessment
                </button>
              </div>

              <p className="mt-10 text-[12px] text-stone-300 leading-relaxed text-center">
                This tool draws on domains from validated frameworks used in post-acute discharge
                planning, including the Katz Index of Independence in ADLs (Katz et al., 1963),
                the Lawton Instrumental ADL Scale (Lawton and Brody, 1969), and AHRQ&rsquo;s
                IDEAL Discharge Planning framework.
              </p>
            </>
          )}
        </div>
      </div>
    </main>
  );
}

export default function SnfResultsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#faf9f7]" />}>
      <SnfResultsInner />
    </Suspense>
  );
}
