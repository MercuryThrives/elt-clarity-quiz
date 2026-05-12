"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { normalizePartnerId } from "@/lib/partner";
import PartnerHeader from "@/components/quiz/PartnerHeader";

function ReverseMortgageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const partnerId = normalizePartnerId(searchParams.get("partner"));

  const [accepted, setAccepted] = useState(false);

  function handleBegin() {
    const params = new URLSearchParams();
    params.set("track", "funding-rm");
    if (partnerId) params.set("partner", partnerId);
    router.push(`/quiz?${params}`);
  }

  return (
    <main className="min-h-screen bg-[#faf9f7] flex flex-col">

      <PartnerHeader partnerId={partnerId} centered />

      <div className="flex-1 flex flex-col items-center px-4 pt-4 pb-16">
        <div className="w-full max-w-[640px]">

          {/* ── Zone 1: Hook — headline, subhead, authority line ─────────── */}
          <h1 className="font-serif text-[24px] md:text-[28px] leading-snug text-stone-800 mb-4">
            There may be more money in this home than your family realizes.
          </h1>
          <p className="text-[18px] leading-relaxed text-stone-600 mb-3">
            Most families navigating senior care costs never think to look at the home.
            A reverse mortgage can convert existing equity into funds for home care,
            assisted living, or memory care &mdash; without selling the property or making
            monthly payments. This five-minute tool helps you understand whether it is
            worth a conversation.
          </p>
          <p className="text-[16px] text-stone-500 leading-relaxed" style={{ marginBottom: "32px", borderLeft: "3px solid #f59e0b", paddingLeft: "12px" }}>
            Built by a former Assisted Living and Memory Care Executive Director who has
            helped hundreds of Colorado families understand their real options &mdash; not just
            the ones that are easiest to sell.
          </p>

          {/* ── Zone 2: Bullets ──────────────────────────────────────────── */}
          <ul className="space-y-2" style={{ marginBottom: "32px" }}>
            <li className="flex items-start gap-2 text-[16px] text-stone-500">
              <span className="text-amber-500 shrink-0 mt-0.5">&#10003;</span>
              Five questions &mdash; takes about three minutes
            </li>
            <li className="flex items-start gap-2 text-[16px] text-stone-500">
              <span className="text-amber-500 shrink-0 mt-0.5">&#10003;</span>
              No loan application, no lender contact, no obligation
            </li>
            <li className="flex items-start gap-2 text-[16px] text-stone-500">
              <span className="text-amber-500 shrink-0 mt-0.5">&#10003;</span>
              Personalized result based on your family&rsquo;s specific situation
            </li>
            <li className="flex items-start gap-2 text-[16px] text-stone-500">
              <span className="text-amber-500 shrink-0 mt-0.5">&#10003;</span>
              If it looks promising, Dave personally makes the introduction to a
              Colorado specialist he trusts
            </li>
          </ul>

          {/* ── Zone 3: How it works + Action ───────────────────────────── */}
          <div style={{ marginBottom: "24px" }}>
            <h2 className="font-serif text-[20px] md:text-[22px] leading-snug text-stone-800 mb-3">
              Here&rsquo;s how it works:
            </h2>
            <p className="text-[16px] leading-relaxed text-stone-600 mb-3">
              Answer five questions about your loved one&rsquo;s situation. You will receive a
              personalized summary &mdash; including illustrative examples of what equity access
              could look like based on age and home value &mdash; delivered to your inbox. If a
              specialist conversation makes sense, Dave will make that introduction personally.
              If it does not, he will tell you that too.
            </p>
            <p className="text-[14px] text-stone-500 leading-relaxed mb-3">
              This tool cannot tell you exactly what your loved one would qualify for &mdash;
              that requires a licensed specialist who can review the actual numbers.
              What it can do is tell you whether a conversation is worth having.
            </p>
            <p className="text-[13px] text-stone-400 leading-relaxed">
              This tool is for educational purposes only and does not constitute financial,
              legal, or mortgage advice. Elder Life Transitions is not a mortgage lender or
              broker. If Medicaid is involved in your loved one&rsquo;s situation, consult an elder
              law attorney before pursuing a reverse mortgage.
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
              I understand this tool provides general educational guidance only, and I agree
              to receive my personalized results and occasional follow-up from Elder Life
              Transitions. I can opt out at any time.
            </span>
          </label>

          <button
            onClick={handleBegin}
            disabled={!accepted}
            className="w-full rounded-xl border-2 text-[18px] font-medium py-4 px-6 cursor-pointer disabled:cursor-not-allowed"
            style={accepted ? {
              backgroundColor: "#d97706",
              borderColor: "#d97706",
              color: "white",
            } : {
              backgroundColor: "transparent",
              borderColor: "rgba(217, 119, 6, 0.6)",
              color: "#d97706",
            }}
            onMouseEnter={(e) => {
              if (accepted) (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#b45309";
            }}
            onMouseLeave={(e) => {
              if (accepted) (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#d97706";
            }}
          >
            Show Me What&rsquo;s Possible
          </button>

          <p className="text-[13px] text-stone-400 leading-relaxed" style={{ marginTop: "16px" }}>
            Your result reflects your loved one&rsquo;s specific situation &mdash; not a generic
            overview. Dave reads every submission personally.
          </p>

        </div>
      </div>
    </main>
  );
}

export default function ReverseMortgagePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#faf9f7]" />}>
      <ReverseMortgageInner />
    </Suspense>
  );
}
