"use client";

import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/browser";

interface SCHeaderProps {
  partnerId: string | null;
}

export default function SCHeader({ partnerId }: SCHeaderProps) {
  const [partnerName, setPartnerName] = useState<string | null>(null);

  useEffect(() => {
    setPartnerName(null);
    if (!partnerId) return;
    supabaseBrowser
      .from("public_partners")
      .select("agency_name")
      .eq("id", partnerId)
      .eq("partner_type", "senior_care")
      .limit(1)
      .then(({ data }) => {
        if (data && data.length > 0) {
          setPartnerName(data[0].agency_name ?? null);
        }
      });
  }, [partnerId]);

  return (
    <>
      <div className="w-full" style={{ height: "5px", backgroundColor: "#4a6741" }} />
      <header className="w-full border-b border-stone-200 bg-[#faf9f7]">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-center gap-4 px-6 py-5">

          {/* ELT logo -- always centered */}
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

          {/* Partner name -- inline, text only */}
          {partnerName && (
            <>
              <span className="text-[14px] text-stone-400 font-serif italic">
                In partnership with
              </span>
              <span className="text-[15px] text-stone-700 font-serif tracking-tight">
                {partnerName}
              </span>
            </>
          )}
        </div>
      </header>
    </>
  );
}
