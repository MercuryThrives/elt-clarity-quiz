// src/app/page.tsx
'use client';

import Link from 'next/link';
import { Suspense, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { normalizePartnerId } from '@/lib/partner';
import { supabaseBrowser } from '@/lib/supabase/browser';

function getPartnerFromCookie(): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.split('; ').find(row => row.startsWith('elt_partner='));
  return match ? decodeURIComponent(match.split('=')[1]) : null;
}

function writePartnerCookie(partnerId: string) {
  document.cookie = [
    'elt_partner=' + encodeURIComponent(partnerId),
    'max-age=' + (120 * 24 * 60 * 60),
    'path=/',
    'SameSite=Lax',
  ].join('; ');
}

type PublicPartner = {
  id: string;
  agency_name: string;
  logo_url: string | null;
};

function IntroPageInner() {
  const sp = useSearchParams();
  const router = useRouter();

  // SNF track has its own entry point. Redirect immediately so the HCA landing
  // page is never shown to SNF visitors.
  const trackParam = sp.get('track');
  useEffect(() => {
    if (trackParam === 'snf') {
      const partner = sp.get('partner');
      router.replace(partner ? `/snf?partner=${encodeURIComponent(partner)}` : '/snf');
    }
  }, [trackParam, sp, router]);

  const partnerId = useMemo(() => normalizePartnerId(sp.get('partner')) ?? getPartnerFromCookie(), [sp]);

  const [partner, setPartner] = useState<PublicPartner | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [partnerLogoError, setPartnerLogoError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      if (!partnerId) {
        setPartner(null);
        return;
      }

      setIsLoading(true);

      const { data, error } = await supabaseBrowser
        .from('public_partners')
        .select('id, agency_name, logo_url')
        .eq('id', partnerId)
        .limit(1);

      if (cancelled) return;

      if (error || !data || data.length === 0) {
        setPartner(null);
        setIsLoading(false);
        return;
      }

      setPartner(data[0] as PublicPartner);
      setIsLoading(false);

      // Write cookie only when partner came from URL param (not cookie fallback)
      if (sp.get('partner')) {
        writePartnerCookie(partnerId!);
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [partnerId, sp]);

  // Reset logo error state when partner changes
  useEffect(() => {
    setPartnerLogoError(false);
  }, [partnerId]);

  const beginHref = partnerId ? `/quiz?partner=${encodeURIComponent(partnerId)}` : '/quiz';

  const partnerLogoSrc = partner?.logo_url ?? null;
  const showPartnerSection = !!partnerLogoSrc && !partnerLogoError;

  return (
    <main className="min-h-screen bg-[#faf9f7] text-stone-800">

      {/* Full-width header bar */}
      <header className="w-full border-b border-stone-200 bg-[#faf9f7]">
        <div className={`mx-auto flex w-full max-w-5xl items-center gap-6 px-6 py-5 ${showPartnerSection ? 'justify-center' : 'justify-start'}`}>
          {/* ELT logo */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/elt-logo.png"
            alt="Elder Life Transitions"
            className="h-20 w-auto object-contain"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = 'none';
              (e.currentTarget.nextElementSibling as HTMLElement | null)?.removeAttribute('hidden');
            }}
          />
          <span hidden className="font-serif text-stone-800 text-[18px] tracking-tight">
            Elder Life Transitions
          </span>

          {/* Partner branding — centered between logos when present */}
          {showPartnerSection && (
            <>
              <span className="font-serif italic text-stone-400 text-sm">
                in partnership with
              </span>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={partnerLogoSrc!}
                alt={partner?.agency_name ?? '[Partner Agency]'}
                className="h-20 w-auto max-w-[200px] object-contain"
                onError={() => setPartnerLogoError(true)}
              />
            </>
          )}
        </div>
      </header>

      {/* Page body */}
      <div className="mx-auto w-full max-w-2xl px-5 py-10">

        {/* Main card */}
        <div className="rounded-2xl border border-stone-200 bg-white/70 px-7 pt-8 pb-7 shadow-sm">
          <h1 className="font-serif text-[30px] md:text-[34px] leading-snug text-stone-800 mb-4 text-center">
            Find Out If Your Current Care Plan Still Fits.
          </h1>

          <p className="text-[18px] leading-relaxed text-stone-600 max-w-prose">
            When you're in the middle of caregiving, it can be hard to see the full picture.
            Answer 8 questions about what you're observing at home and get a personalized report
            showing where things stand — and what, if anything, should change.
          </p>

          <ul className="mt-6 space-y-2 text-[16px] text-stone-500">
            <li className="flex items-center gap-2">
              <span className="text-amber-500">&#10003;</span> 8 questions — takes about 2 minutes
            </li>
            <li className="flex items-center gap-2">
              <span className="text-amber-500">&#10003;</span> No login required
            </li>
            <li className="flex items-center gap-2">
              <span className="text-amber-500">&#10003;</span> Personalized results at the end
            </li>
          </ul>

          <p className="text-xs text-gray-400 mt-4 text-center max-w-md mx-auto">
            Your responses are confidential. If you arrived through a home care agency
            partner, your completion and general results may be shared with that agency
            to support your care.
          </p>

          <div className="mt-7 flex items-center gap-4">
            <Link
              href={beginHref}
              className="inline-flex h-12 items-center justify-center rounded-xl bg-amber-600 hover:bg-amber-700 px-7 text-[18px] font-medium text-white transition-colors"
            >
              Begin
            </Link>

            {isLoading && (
              <span className="text-[14px] text-stone-400 font-mono">Loading…</span>
            )}
          </div>
        </div>

        {/* Footer note */}
        <p className="mt-8 text-center text-[13px] text-stone-400 leading-relaxed">
          This tool is intended for reflection purposes only and does not constitute medical advice.
        </p>
      </div>
    </main>
  );
}

export default function IntroPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#faf9f7]" />}>
      <IntroPageInner />
    </Suspense>
  );
}
