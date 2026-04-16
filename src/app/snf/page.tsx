"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import PartnerHeader from "@/components/quiz/PartnerHeader";

function DisclosureInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const partner = searchParams.get("partner");

  const [accepted, setAccepted] = useState(false);

  function handleBegin() {
    const params = new URLSearchParams();
    params.set("track", "snf");
    if (partner) params.set("partner", partner);
    router.push(`/quiz?${params}`);
  }

  return (
    <main className="min-h-screen bg-[#faf9f7] flex flex-col">
      <PartnerHeader partnerId={partner} />

      <div className="flex-1 flex flex-col items-center px-4 pt-12 pb-16">
        <div className="w-full max-w-2xl">

          {/* Headline */}
          <h1 className="text-3xl md:text-4xl font-serif text-stone-800 mb-2 leading-tight">
            Before We Begin
          </h1>
          <p className="text-[18px] text-stone-500 mb-8 leading-snug">
            A few things worth knowing about this tool and how it works.
          </p>

          {/* Body */}
          <div className="bg-white rounded-2xl border border-stone-200 px-6 py-6 mb-6 space-y-5">
            <p className="text-[17px] text-stone-700 leading-relaxed">
              This tool was designed to help families navigating care decisions after a skilled
              nursing stay. It takes about five minutes to complete and produces a personalized
              summary of care options that may fit your loved one&rsquo;s situation.
            </p>

            <p className="text-[15px] font-mono tracking-widest uppercase text-stone-400">
              A few important notes:
            </p>

            <ul className="space-y-4">
              <li className="flex gap-3">
                <span className="mt-1 shrink-0 w-1.5 h-1.5 rounded-full bg-amber-400" />
                <p className="text-[17px] text-stone-600 leading-relaxed">
                  This is not a clinical assessment and does not replace the advice of a licensed
                  healthcare professional or your loved one&rsquo;s care team.
                </p>
              </li>
              <li className="flex gap-3">
                <span className="mt-1 shrink-0 w-1.5 h-1.5 rounded-full bg-amber-400" />
                <p className="text-[17px] text-stone-600 leading-relaxed">
                  This tool draws on domains from validated frameworks used in post-acute discharge
                  planning, including the Katz Index of Independence in ADLs (Katz et al., 1963),
                  the Lawton Instrumental ADL Scale (Lawton and Brody, 1969), and AHRQ&rsquo;s
                  IDEAL Discharge Planning framework.
                </p>
              </li>
              <li className="flex gap-3">
                <span className="mt-1 shrink-0 w-1.5 h-1.5 rounded-full bg-amber-400" />
                <p className="text-[17px] text-stone-600 leading-relaxed">
                  Contact information requested after the assessment is used only to deliver your
                  report and follow up with resources. No personally identifying information is
                  collected during the assessment questions themselves.
                </p>
              </li>
              <li className="flex gap-3">
                <span className="mt-1 shrink-0 w-1.5 h-1.5 rounded-full bg-amber-400" />
                <p className="text-[17px] text-stone-600 leading-relaxed">
                  Elder Life Transitions (ELT) is a senior living advisory service. ELT is
                  compensated by care communities for private-pay placements. There is no cost to
                  families for this tool or for ELT&rsquo;s advisory services.
                </p>
              </li>
              <li className="flex gap-3">
                <span className="mt-1 shrink-0 w-1.5 h-1.5 rounded-full bg-amber-400" />
                <p className="text-[17px] text-stone-600 leading-relaxed">
                  ELT does not recommend specific communities within this tool. Results reflect care
                  categories that appear to be worth exploring based on your answers — not a clinical
                  recommendation or a referral to any specific provider.
                </p>
              </li>
            </ul>
          </div>

          {/* Consent checkbox */}
          <label className="flex items-start gap-3 cursor-pointer mb-8 group">
            <input
              type="checkbox"
              checked={accepted}
              onChange={(e) => setAccepted(e.target.checked)}
              className="mt-1 w-5 h-5 shrink-0 accent-amber-500 cursor-pointer"
            />
            <span className="text-[16px] text-stone-600 leading-relaxed group-hover:text-stone-800 transition-colors">
              I understand that this tool provides general guidance only and does not constitute
              clinical advice. I also understand that Elder Life Transitions may follow up to offer
              resources and answer questions based on my results.
            </span>
          </label>

          {/* CTA */}
          <button
            onClick={handleBegin}
            disabled={!accepted}
            className="w-full rounded-xl bg-amber-500 hover:bg-amber-600 disabled:bg-stone-200 disabled:text-stone-400 text-white text-[18px] font-medium py-4 px-6 transition-colors cursor-pointer disabled:cursor-not-allowed"
          >
            Begin the Assessment
          </button>

          <p className="text-center text-[13px] text-stone-400 mt-3">
            Your information is never shared without your permission.
          </p>
        </div>
      </div>
    </main>
  );
}

export default function SnfDisclosurePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#faf9f7]" />}>
      <DisclosureInner />
    </Suspense>
  );
}
