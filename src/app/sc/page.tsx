"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { normalizePartnerId } from "@/lib/partner";
import { supabaseBrowser } from "@/lib/supabase/browser";

// ---------------------------------------------------------------------------
// Header
// ---------------------------------------------------------------------------

function SCHeader({ partnerId }: { partnerId: string | null }) {
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

  const showPartnerLogo =
    !!partnerLogoUrl && partnerLogoUrl.startsWith("http") && !logoError;
  const showPartnerName = !!partnerName && !showPartnerLogo;
  const showPartner = showPartnerLogo || showPartnerName;

  return (
    <>
      <div className="w-full" style={{ height: "5px", backgroundColor: "#4a6741" }} />
      <header className="w-full border-b border-stone-200 bg-[#faf9f7]">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-5">

          {/* ELT logo -- left */}
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

          {/* Partner -- right */}
          {showPartner && (
            <div className="flex flex-col items-end gap-1">
              <span className="text-[12px] text-stone-400 font-serif italic">
                In partnership with {partnerName}
              </span>
              {showPartnerLogo && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={partnerLogoUrl!}
                  alt={partnerName ?? "Partner"}
                  className="h-16 w-auto max-w-[180px] object-contain"
                  onError={() => setLogoError(true)}
                />
              )}
            </div>
          )}
        </div>
      </header>
    </>
  );
}

// ---------------------------------------------------------------------------
// Page inner
// ---------------------------------------------------------------------------

function SCHomeInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const partnerId = normalizePartnerId(searchParams.get("partner"));

  function handleStart() {
    const params = new URLSearchParams();
    if (partnerId) params.set("partner", partnerId);
    const qs = params.toString();
    router.push(`/sc/quiz${qs ? `?${qs}` : ""}`);
  }

  return (
    <main className="min-h-screen bg-[#faf9f7] flex flex-col">
      <SCHeader partnerId={partnerId} />

      <div className="flex-1 flex flex-col items-center px-4 pt-8 pb-16">
        <div className="w-full max-w-[640px]">

          <h1 className="font-serif text-[26px] md:text-[30px] leading-snug text-stone-800 mb-5">
            In about five minutes, you&rsquo;ll have a clearer picture of what kind of support
            your loved one actually needs -- and what to do next.
          </h1>

          <p className="text-[17px] leading-relaxed text-stone-600 mb-6"
            style={{ borderLeft: "3px solid #f59e0b", paddingLeft: "12px" }}>
            This assessment was built by a former Executive Director who ran an Assisted
            Living/Memory Care community and an Independent Living community. It cuts through the
            confusion most families face when they don&rsquo;t know where to start.
          </p>

          <ul className="space-y-2 mb-8">
            {[
              "About 5 minutes to complete",
              "No login or account required",
              "Your results are private and personalized to your situation",
            ].map((bullet) => (
              <li key={bullet} className="flex items-center gap-2 text-[16px] text-stone-600">
                <span className="text-amber-500 shrink-0">&#10003;</span>
                {bullet}
              </li>
            ))}
          </ul>

          <button
            onClick={handleStart}
            className="w-full rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-[18px] font-medium py-4 px-6 transition-colors cursor-pointer"
          >
            Start the Assessment
          </button>

          <p className="text-[14px] text-stone-400 text-center mt-3 leading-relaxed">
            The earlier families have this picture, the more options they usually have.
          </p>

          <p className="text-[13px] text-stone-400 text-center mt-6 leading-relaxed">
            This tool helps identify general care directions based on what you share. It is a
            starting point -- not a diagnosis or a recommendation. Results are prepared by Elder
            Life Transitions at no cost to you.
          </p>

        </div>
      </div>
    </main>
  );
}

// ---------------------------------------------------------------------------
// Export
// ---------------------------------------------------------------------------

export default function SCHomePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#faf9f7]" />}>
      <SCHomeInner />
    </Suspense>
  );
}
