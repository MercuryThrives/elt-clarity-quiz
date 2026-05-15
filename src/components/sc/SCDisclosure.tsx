"use client";

import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/browser";

interface SCDisclosureProps {
  partnerId: string | null;
  onBegin: () => void;
}

export default function SCDisclosure({ partnerId, onBegin }: SCDisclosureProps) {
  const [accepted, setAccepted] = useState(false);
  const [partnerLogoUrl, setPartnerLogoUrl] = useState<string | null>(null);
  const [partnerName, setPartnerName] = useState<string | null>(null);
  const [logoError, setLogoError] = useState(false);

  useEffect(() => {
    setPartnerLogoUrl(null);
    setPartnerName(null);
    setLogoError(false);
    if (!partnerId) return;
    supabaseBrowser
      .from("public_partners")
      .select("agency_name, logo_url")
      .eq("id", partnerId)
      .eq("partner_type", "senior_care")
      .limit(1)
      .then(({ data }) => {
        if (data && data.length > 0) {
          setPartnerName(data[0].agency_name ?? null);
          setPartnerLogoUrl(data[0].logo_url ?? null);
        }
      });
  }, [partnerId]);

  const showPartnerLogo = !!partnerLogoUrl && partnerLogoUrl.startsWith("http") && !logoError;
  const showPartnerName = !!partnerName && !showPartnerLogo;

  return (
    <main className="min-h-screen bg-[#faf9f7] flex flex-col">

      {/* ── Header: ELT left, partner right ──────────────────────────────── */}
      <div className="w-full" style={{ height: "5px", backgroundColor: "#4a6741" }} />
      <header className="w-full border-b border-stone-200 bg-[#faf9f7]">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-5">

          {/* ELT logo — left */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/elt-logo.png"
            alt="Elder Life Transitions"
            className="h-24 w-auto object-contain"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = "none";
              (e.currentTarget.nextElementSibling as HTMLElement | null)?.removeAttribute("hidden");
            }}
          />
          <span hidden className="font-serif text-stone-800 text-[15px] tracking-tight">
            Elder Life Transitions
          </span>

          {/* Partner — right (graceful fallback if absent) */}
          {showPartnerLogo && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={partnerLogoUrl!}
              alt={partnerName ?? "Partner"}
              className="h-20 w-auto max-w-[200px] object-contain"
              onError={() => setLogoError(true)}
            />
          )}
          {showPartnerName && (
            <span className="font-serif text-stone-700 text-[15px] tracking-tight">
              {partnerName}
            </span>
          )}
        </div>
      </header>

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
