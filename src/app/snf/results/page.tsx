"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuiz } from "@/components/quiz/QuizStore";
import { selectSnfPathway, getSnfFinancialModifier, getSnfTimelineModifier } from "@/lib/quiz/snf-scoring";
import { normalizePartnerId } from "@/lib/partner";
import { saveSnfSubmission } from "@/app/actions/snf-submissions";
import PartnerHeader from "@/components/quiz/PartnerHeader";

// ---------------------------------------------------------------------------
// Pathway display data
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

const PATHWAY_DESCRIPTIONS: Record<string, string> = {
  "assisted-living":
    "Assisted living communities provide personal care support in a residential setting with 24-hour staff available.",
  "memory-care":
    "Memory care communities are specifically designed for individuals living with cognitive impairment, offering secured environments and specialized staff.",
  "independent-living-hca":
    "Independent living paired with a professional home care agency can provide meaningful daily support while preserving independence.",
  "home-hca":
    "Professional home care allows your loved one to remain at home while receiving scheduled visits from a trained caregiver.",
  "home-family":
    "Returning home with family support may be a realistic option when needs are manageable and a capable caregiver is available.",
  "residential-care":
    "Residential care homes are small, licensed settings that provide assisted living-level care in a quieter, more intimate environment.",
  "complex-medical":
    "Based on what you shared, your loved one's current needs may require a level of medical oversight beyond most residential care settings.",
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
  const pathwayDescription = PATHWAY_DESCRIPTIONS[pathway] ?? "";
  const financialModifier = getSnfFinancialModifier(answers);
  const timelineModifier = getSnfTimelineModifier(answers);

  const formValid = firstName.trim() && email.trim() && consentChecked;

  async function handleGateSubmit() {
    if (!formValid || submitting.current) return;
    submitting.current = true;
    setGateLoading(true);

    try {
      await saveSnfSubmission({
        partnerId,
        answers,
        firstName: firstName.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
      });
      setGateSubmitted(true);
    } catch (err) {
      console.error("[SNF] Gate submission error:", err);
      // Don't block the user — reveal content anyway
      setGateSubmitted(true);
    } finally {
      setGateLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#faf9f7] flex flex-col">
      <PartnerHeader partnerId={partnerId} />

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
              Primary Care Setting
            </p>
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-stone-800 mb-3 leading-tight">
              {pathwayLabel}
            </h2>
            <p className="text-[17px] text-stone-600 leading-relaxed mb-4">
              {pathwayDescription}
            </p>
            <p className="text-[15px] text-stone-500 italic">
              Based on what you shared, this appears to be worth exploring.
            </p>
          </div>

          <p className="text-[16px] text-stone-500 leading-relaxed mb-8">
            Your report includes the care settings that align with what you described — and the
            guidance that most families only get after a conversation with someone who knows this
            landscape well.
          </p>

          <SectionDivider />

          {/* ── Section 3: Email Capture Gate ────────────────────────────── */}
          {!gateSubmitted ? (
            <div className="rounded-2xl border border-stone-200 bg-white px-6 py-6">
              <h3 className="text-xl font-serif text-stone-800 mb-2">
                Get Your Personalized Care Options Report
              </h3>
              <p className="text-[17px] text-stone-600 leading-relaxed mb-3">
                Your report includes the care settings that align with what you described — and the
                guidance that most families only get after a conversation with someone who knows this
                landscape well.
              </p>
              <p className="text-[16px] text-stone-600 leading-relaxed mb-4">
                Elder Life Transitions will prepare your report and reach out to answer any
                questions. If you decide to explore specific communities, ELT can help you compare
                options, schedule tours, and navigate the process — at no cost to your family.
              </p>
              <p className="text-[14px] text-stone-400 italic mb-6">
                ELT is compensated by care communities for private-pay placements. There is no cost
                to families.
              </p>

              <div className="space-y-3 mb-4">
                <div>
                  <label htmlFor="snf-first-name" className="sr-only">First name</label>
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
                  <label htmlFor="snf-email" className="sr-only">Email address</label>
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
                  <label htmlFor="snf-phone" className="sr-only">Phone number (optional)</label>
                  <input
                    id="snf-phone"
                    type="tel"
                    placeholder="To receive a personal call from ELT (optional)"
                    inputMode="tel"
                    autoComplete="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-[17px] text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
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
                className="w-full rounded-xl bg-[#C4621D] hover:bg-[#A8521A] disabled:opacity-50 text-white text-[18px] font-medium py-4 px-6 transition-colors cursor-pointer disabled:cursor-not-allowed"
              >
                {gateLoading ? "Saving…" : "Get My Report"}
              </button>
              <p className="text-center text-[13px] text-stone-400 mt-3">
                Your information is never shared without your permission.
              </p>
            </div>
          ) : (
            // Confirmation banner shown in place of the form after submission
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-4 mb-2">
              <p className="text-[17px] text-emerald-800 font-medium">
                Your report is on its way — check your inbox.
              </p>
            </div>
          )}

          {/* ── Sections 4–6: Revealed after gate ────────────────────────── */}
          {gateSubmitted && (
            <>
              <SectionDivider />

              {/* ── Section 4: Post-Gate Content ──────────────────────────── */}
              <div className="space-y-6">
                {/* Full pathway description — placeholder */}
                <div className="rounded-xl border border-stone-100 bg-white px-5 py-5">
                  <p className="text-[13px] font-mono tracking-widest uppercase text-stone-400 mb-2">
                    About This Care Setting
                  </p>
                  <p className="text-[17px] text-stone-400 italic">
                    [Placeholder — full pathway description will be added in the next prompt.]
                  </p>
                </div>

                {/* Why this fits — placeholder */}
                <div className="rounded-xl border border-stone-100 bg-white px-5 py-5">
                  <p className="text-[13px] font-mono tracking-widest uppercase text-stone-400 mb-2">
                    Why This Appears to Fit Your Situation
                  </p>
                  <p className="text-[17px] text-stone-400 italic">
                    [Placeholder — personalized fit explanation will be added in the next prompt.]
                  </p>
                </div>

                {/* Anticipation bullets — placeholder */}
                <div className="rounded-xl border border-stone-100 bg-white px-5 py-5">
                  <p className="text-[13px] font-mono tracking-widest uppercase text-stone-400 mb-3">
                    What to Anticipate
                  </p>
                  <ul className="space-y-2">
                    {[1, 2, 3].map((n) => (
                      <li key={n} className="flex gap-3">
                        <span className="mt-2 shrink-0 w-1.5 h-1.5 rounded-full bg-stone-200" />
                        <p className="text-[17px] text-stone-400 italic">
                          [Placeholder — anticipation point {n}]
                        </p>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* What most families don't know — placeholder */}
                <div className="rounded-xl border border-amber-100 bg-amber-50/50 px-5 py-5">
                  <p className="text-[13px] font-mono tracking-widest uppercase text-amber-600 mb-2">
                    What Most Families Don&rsquo;t Know
                  </p>
                  <p className="text-[17px] text-stone-400 italic">
                    [Placeholder — insight will be added in the next prompt.]
                  </p>
                </div>

                {/* Secondary pathway — placeholder */}
                <div className="rounded-xl border border-stone-100 bg-white px-5 py-5">
                  <p className="text-[13px] font-mono tracking-widest uppercase text-stone-400 mb-2">
                    Also Worth Considering
                  </p>
                  <p className="text-[17px] text-stone-400 italic">
                    [Placeholder — secondary pathway will be added in the next prompt.]
                  </p>
                </div>

                {/* Financial modifier — live from scoring engine */}
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
              <div className="text-center space-y-4">
                <button
                  className="w-full rounded-xl bg-[#C4621D] hover:bg-[#A8521A] text-white text-[18px] font-medium py-4 px-6 transition-colors cursor-pointer"
                  onClick={() => {
                    // Placeholder — will link to ELT scheduling in a future prompt
                  }}
                >
                  Schedule a Free Consultation with ELT
                </button>

                <p className="text-[15px] text-stone-500 leading-relaxed">
                  {timelineModifier}
                </p>

                <button
                  className="w-full rounded-xl border border-stone-300 bg-white hover:bg-stone-50 text-stone-700 text-[17px] font-medium py-3 px-6 transition-colors cursor-pointer"
                  onClick={() => {
                    // Placeholder — will trigger email delivery in a future prompt
                  }}
                >
                  Get Your Full Report by Email
                </button>
              </div>

              <SectionDivider />

              {/* ── Section 6: Compensation Disclosure Footer ─────────────── */}
              <p className="text-[13px] text-stone-400 text-center leading-relaxed">
                Elder Life Transitions is compensated by care communities for private-pay
                placements. Our consultation is free to families. This tool is not a clinical
                assessment and does not replace advice from a licensed healthcare professional.
              </p>

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
