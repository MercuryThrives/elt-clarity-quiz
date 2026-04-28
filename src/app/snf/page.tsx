"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { normalizePartnerId } from "@/lib/partner";
import SnfHeader from "@/components/quiz/SnfHeader";

function DisclosureInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const partnerId = normalizePartnerId(searchParams.get("partner"));

  const [accepted, setAccepted] = useState(false);

  function handleBegin() {
    const params = new URLSearchParams();
    params.set("track", "snf");
    if (partnerId) params.set("partner", partnerId);
    router.push(`/quiz?${params}`);
  }

  return (
    <main className="min-h-screen bg-[#faf9f7] flex flex-col">

      <SnfHeader />

      <div className="flex-1 flex flex-col items-center px-4 pt-4 pb-16">
        <div className="w-full max-w-[640px]">

          {/* ── Zone 1: Hook — headline, subhead, authority line ─────────── */}
          <h1 className="font-serif text-[24px] md:text-[28px] leading-snug text-stone-800 mb-4">
            In five minutes, you&rsquo;ll know more about what your loved one actually needs
            after rehab than most families figure out in two weeks.
          </h1>
          <p className="text-[18px] leading-relaxed text-stone-600 mb-3">
            The discharge planner gave you a folder. The social worker gave you a list. Most
            families still walk out unsure what is actually going to hold. This tool was built
            for exactly that moment.
          </p>
          {/* Authority line — 12px above (from subhead mb-3), 32px below before bullets */}
          <p className="text-[16px] text-stone-500 leading-relaxed" style={{ marginBottom: "32px", borderLeft: "3px solid #f59e0b", paddingLeft: "12px" }}>
            Built by a former Executive Director who ran Assisted Living, Memory Care, and
            Independent Living communities, and has seen what families face when discharge day
            arrives without a real plan.
          </p>

          {/* ── Zone 2: Value + Disclosure — bullets, divider, disclosure ── */}
          <ul className="space-y-2">
            <li className="flex items-start gap-2 text-[16px] text-stone-500">
              <span className="text-amber-500 shrink-0 mt-0.5">&#10003;</span>
              A clear picture of what your loved one&rsquo;s care needs actually are, based on
              their specific situation rather than a generic checklist
            </li>
            <li className="flex items-start gap-2 text-[16px] text-stone-500">
              <span className="text-amber-500 shrink-0 mt-0.5">&#10003;</span>
              The guidance most families wish they had before making their first call
            </li>
            <li className="flex items-start gap-2 text-[16px] text-stone-500">
              <span className="text-amber-500 shrink-0 mt-0.5">&#10003;</span>
              Five minutes. Free. No sales pitch, just a clearer picture of what comes next.
            </li>
          </ul>

          {/* ── Zone 3: How it works + Action ───────────────────────────── */}
          <div style={{ marginTop: "32px", marginBottom: "24px" }}>
            <h2 className="font-serif text-[20px] md:text-[22px] leading-snug text-stone-800 mb-3">
              Here&rsquo;s how it works:
            </h2>
            <p className="text-[16px] leading-relaxed text-stone-600 mb-3">
              Answer eleven questions about your loved one&rsquo;s current situation. You&rsquo;ll
              get a personalized summary of care options that fit their specific needs &mdash; not a
              generic list. If what comes back suggests a conversation would help, we&rsquo;ll reach
              out once to offer it. That&rsquo;s it.
            </p>
            <p className="text-[13px] text-stone-400 leading-relaxed">
              This tool is not a clinical assessment and does not replace your loved one&rsquo;s
              care team. Elder Life Transitions is compensated by care communities for private-pay
              placements. There is no cost to families for this tool or for ELT&rsquo;s services.
              Contact information is collected only to deliver your results.
            </p>
          </div>

          <label className="flex items-start gap-3 cursor-pointer group" style={{ marginBottom: "24px" }}>
            <input
              type="checkbox"
              checked={accepted}
              onChange={(e) => setAccepted(e.target.checked)}
              className="mt-1 w-5 h-5 shrink-0 accent-amber-500 cursor-pointer"
            />
            <span className="text-[16px] text-stone-600 leading-relaxed group-hover:text-stone-800">
              I understand this tool provides general guidance only, and I consent to Elder Life
              Transitions contacting me once if my results suggest a conversation would help.
            </span>
          </label>

          <button
            onClick={handleBegin}
            disabled={!accepted}
            className="w-full rounded-xl border-2 text-[18px] font-medium py-4 px-6 cursor-pointer disabled:cursor-not-allowed"
            style={accepted ? {
              backgroundColor: "#4a6741",
              borderColor: "#4a6741",
              color: "white",
            } : {
              backgroundColor: "transparent",
              borderColor: "rgba(74, 103, 65, 0.6)",
              color: "#4a6741",
            }}
            onMouseEnter={(e) => {
              if (accepted) (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#3a5433";
            }}
            onMouseLeave={(e) => {
              if (accepted) (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#4a6741";
            }}
          >
            Show Me What Fits
          </button>

          <p className="text-[13px] text-stone-400 leading-relaxed" style={{ marginTop: "16px" }}>
            Your summary is personalized to your loved one&rsquo;s situation &mdash; not a generic
            list. If it raises questions, we&rsquo;re here.
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
