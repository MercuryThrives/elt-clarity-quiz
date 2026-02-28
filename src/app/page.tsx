// src/app/page.tsx
'use client';

import Link from 'next/link';
import { Suspense, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { normalizePartnerId } from './_lib/partner';

// Root-level lib is outside /src
import { supabaseBrowser } from '../../lib/supabase/browser';

type PublicPartner = {
  id: string;
  agency_name: string;
  logo_url: string | null;
};

function IntroPageInner() {
  const sp = useSearchParams();

  const partnerId = useMemo(() => normalizePartnerId(sp.get('partner')), [sp]);

  const [partner, setPartner] = useState<PublicPartner | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      // Missing/invalid partner => silent fallback
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

      // Any error or no rows => silent fallback
      if (error || !data || data.length === 0) {
        setPartner(null);
        setIsLoading(false);
        return;
      }

      setPartner(data[0] as PublicPartner);
      setIsLoading(false);
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [partnerId]);

  const beginHref = partnerId ? `/quiz?partner=${encodeURIComponent(partnerId)}` : '/quiz';

  return (
    <main className="min-h-screen bg-white text-zinc-950">
      <div className="mx-auto w-full max-w-3xl px-5 py-8">
        <header className="flex flex-col gap-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-3">
              {partner?.logo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={partner.logo_url}
                  alt={`${partner.agency_name} logo`}
                  className="h-10 w-10 rounded-md object-contain"
                />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-zinc-100 text-sm font-semibold">
                  {partner?.agency_name ? partner.agency_name.slice(0, 1).toUpperCase() : 'E'}
                </div>
              )}

              <div className="min-w-0">
                <div className="text-[18px] font-semibold leading-tight">
                  {partner?.agency_name ?? 'Elder Life Transitions'}
                </div>
                <div className="text-[16px] text-zinc-600">In partnership with</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="rounded-md bg-zinc-950 px-3 py-2 text-[16px] font-semibold text-white">
                ELT
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
            <h1 className="text-[28px] font-semibold leading-tight">
              Home Care Reflection &amp; Clarity Tool
            </h1>
            <p className="mt-3 text-[18px] leading-7 text-zinc-700">
              This short reflection may help you notice patterns worth exploring and consider
              whether support at home feels aligned with current needs.
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link
                href={beginHref}
                className="inline-flex h-12 items-center justify-center rounded-xl bg-zinc-950 px-5 text-[18px] font-semibold text-white hover:bg-zinc-800"
              >
                Begin
              </Link>

              <div className="flex h-12 items-center text-[16px] text-zinc-600">
                {isLoading ? 'Loading partner branding…' : '\u00a0'}
              </div>
            </div>
          </div>
        </header>
      </div>
    </main>
  );
}

export default function IntroPage() {
  // Fallback can be minimal; keep it calm and non-alarming
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <IntroPageInner />
    </Suspense>
  );
}