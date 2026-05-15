"use client";

import { useState } from "react";
import SCHeader from "@/components/sc/SCHeader";

interface SCDisclosureProps {
  partnerId: string | null;
  onBegin: () => void;
}

export default function SCDisclosure({ partnerId, onBegin }: SCDisclosureProps) {
  const [accepted, setAccepted] = useState(false);

  return (
    <main className="min-h-screen bg-[#faf9f7] flex flex-col">

      <SCHeader partnerId={partnerId} />

      {/* ── Body ─────────────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col items-center px-4 pt-8 pb-16">
        <div className="w-full max-w-[640px]">

          <h1 className="font-serif text-[24px] md:text-[28px] leading-snug text-stone-800 mb-6">
            A Few Things Before You Begin
          </h1>

          <p className="text-[17px] leading-relaxed text-stone-600 mb-4">
            This assessment helps identify the type of support that fits your loved
            one&rsquo;s situation right now. It takes about five minutes and asks questions
            about daily living, safety, and what matters most to your family.
          </p>

          <p className="text-[17px] leading-relaxed text-stone-600 mb-4">
            Your answers stay private. No login required. Results are prepared by Elder Life
            Transitions at no cost to you.
          </p>

          <p
            className="text-[15px] text-stone-500 leading-relaxed mb-8"
            style={{ borderLeft: "3px solid #f59e0b", paddingLeft: "12px" }}
          >
            This is a starting point -- not a diagnosis or a formal care recommendation.
            Individual needs, provider availability, and costs vary. Use these results as a
            foundation for your next conversation.
          </p>

          <label className="flex items-start gap-3 cursor-pointer group mb-6">
            <input
              type="checkbox"
              checked={accepted}
              onChange={(e) => setAccepted(e.target.checked)}
              className="mt-1 w-5 h-5 shrink-0 accent-amber-500 cursor-pointer"
            />
            <span className="text-[16px] text-stone-600 leading-relaxed group-hover:text-stone-800">
              I understand this assessment provides general guidance only.
            </span>
          </label>

          <button
            onClick={onBegin}
            disabled={!accepted}
            className="w-full rounded-xl border-2 text-[18px] font-medium py-4 px-6 cursor-pointer disabled:cursor-not-allowed"
            style={accepted ? {
              backgroundColor: "#4a6741",
              borderColor: "#4a6741",
              color: "white",
            } : {
              backgroundColor: "transparent",
              borderColor: "rgba(74, 103, 65, 0.6)",
              color: "rgba(74, 103, 65, 0.6)",
            }}
            onMouseEnter={(e) => {
              if (accepted) (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#3a5433";
            }}
            onMouseLeave={(e) => {
              if (accepted) (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#4a6741";
            }}
          >
            Begin the Assessment
          </button>

        </div>
      </div>
    </main>
  );
}
