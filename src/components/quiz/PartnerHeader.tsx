"use client";

import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/browser";

interface PartnerHeaderProps {
  partnerId: string | null;
  centered?: boolean;
}

export default function PartnerHeader({ partnerId, centered }: PartnerHeaderProps) {
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [agencyName, setAgencyName] = useState<string | null>(null);
  const [logoError, setLogoError] = useState(false);

  useEffect(() => {
    setLogoUrl(null);
    setAgencyName(null);
    setLogoError(false);

    if (!partnerId) return;

    supabaseBrowser
      .from("public_partners")
      .select("agency_name, logo_url")
      .eq("id", partnerId)
      .limit(1)
      .then(({ data }) => {
        if (data && data.length > 0) {
          setAgencyName(data[0].agency_name ?? null);
          setLogoUrl(data[0].logo_url ?? null);
        }
      });
  }, [partnerId]);

  const showPartner = !!agencyName;
  const showLogo = showPartner && !!logoUrl && logoUrl.startsWith("http") && !logoError;

  return (
    <header className="w-full border-b border-stone-200 bg-[#faf9f7]">
      <div className={`mx-auto flex w-full max-w-5xl items-center gap-6 px-6 py-5 ${showPartner || centered ? "justify-center" : "justify-start"}`}>
        {showPartner ? (
          <>
            {/* Partner — left: logo when available, agency name as fallback */}
            {showLogo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={logoUrl!}
                alt={agencyName}
                className="h-20 w-auto max-w-[200px] object-contain"
                onError={() => setLogoError(true)}
              />
            ) : (
              <span className="font-serif text-stone-700 text-[15px] tracking-tight">
                {agencyName}
              </span>
            )}
            <span className="font-serif italic text-stone-400 text-sm">
              In partnership with
            </span>
            {/* ELT logo — right */}
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
          </>
        ) : (
          <>
            {/* ELT logo only */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/elt-logo.png"
              alt="Elder Life Transitions"
              className={`${centered ? "h-28" : "h-24"} w-auto object-contain`}
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = "none";
                (e.currentTarget.nextElementSibling as HTMLElement | null)?.removeAttribute("hidden");
              }}
            />
            <span hidden className="font-serif text-stone-800 text-[15px] tracking-tight">
              Elder Life Transitions
            </span>
          </>
        )}
      </div>
    </header>
  );
}
