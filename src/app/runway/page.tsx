'use client';

import React, { Suspense, useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { submitRunwayLead } from '@/app/actions/runway-submissions';
import { ASSET_MID, INCOME_MID, BASE_RENT, CARE_FEE, MEDS, calcMonths } from '@/components/runway/constants';
import type { Screen, Sels, Results } from '@/components/runway/types';
import IntakeScreen from '@/components/runway/IntakeScreen';
import LoadingScreen from '@/components/runway/LoadingScreen';
import TeaserScreen from '@/components/runway/TeaserScreen';
import GateScreen from '@/components/runway/GateScreen';
import ResultsScreen from '@/components/runway/ResultsScreen';

function RunwayCalculatorInner() {
  const searchParams = useSearchParams();

  const [screen, setScreen] = useState<Screen>('intake');
  const [sels, setSels] = useState<Sels>({ assets: null, income: null, market: null, careLevel: null });
  const [results, setResults] = useState<Results | null>(null);
  const [firstName, setFirstName] = useState('');
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const gclid = useRef(searchParams.get('gclid') ?? undefined);
  const utmSource = useRef(searchParams.get('utm_source') ?? undefined);
  const utmMedium = useRef(searchParams.get('utm_medium') ?? undefined);
  const utmCampaign = useRef(searchParams.get('utm_campaign') ?? undefined);
  const referrer = useRef<string | undefined>(undefined);

  useEffect(() => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Open+Sans:wght@400;600&display=swap';
    document.head.appendChild(link);
    referrer.current = document.referrer || undefined;
  }, []);

  useEffect(() => {
    if (screen !== 'results') return;
    type DL = { dataLayer?: unknown[] };
    const w = window as unknown as DL;
    if (!w.dataLayer) w.dataLayer = [];
    w.dataLayer.push({ event: 'runway_lead_captured' });
    w.dataLayer.push({ event: 'runway_gate_submitted' });
  }, [screen]);

  function goToScreen(s: Screen) {
    setScreen(s);
    window.scrollTo(0, 0);
  }

  function pick(group: keyof Sels, val: string) {
    setSels(prev => ({ ...prev, [group]: val }));
  }

  function startLoad() {
    const av = ASSET_MID[sels.assets!];
    const iv = INCOME_MID[sels.income!];
    const base = BASE_RENT[sels.market!];
    const care = CARE_FEE[sels.careLevel!];
    const actual = base + care + MEDS;
    const primaryMonths = calcMonths(av, iv, actual);
    const lightMonths = calcMonths(av, iv, base + CARE_FEE.light + MEDS);
    setResults({
      quotedMonthly: base,
      actualMonthly: actual,
      monthlyGap: actual - base,
      annualGap: (actual - base) * 12,
      primaryYrs: Math.round((primaryMonths / 12) * 10) / 10,
      lightYrs: Math.round((lightMonths / 12) * 10) / 10,
    });
    goToScreen('loading');
  }

  async function handleGateSubmit() {
    if (!results || !sels.assets || !sels.income || !sels.market || !sels.careLevel) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      await submitRunwayLead({
        firstName,
        email,
        assetsBucket: sels.assets,
        incomeBucket: sels.income,
        market: sels.market,
        careLevel: sels.careLevel,
        quotedMonthly: results.quotedMonthly,
        actualMonthly: results.actualMonthly,
        monthlyGap: results.monthlyGap,
        annualGap: results.annualGap,
        runwayYears: results.primaryYrs,
        gclid: gclid.current,
        utmSource: utmSource.current,
        utmMedium: utmMedium.current,
        utmCampaign: utmCampaign.current,
        referrer: referrer.current,
      });
      goToScreen('results');
    } catch {
      setSubmitError('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  const bookingUrl =
    process.env.NEXT_PUBLIC_RUNWAY_BOOKING_URL ??
    'https://calendar.app.google/wtJzCe3nKDBeiXqv9';

  return (
    <div style={{ background: '#EDE8DC', minHeight: '100vh', fontFamily: "'Open Sans', sans-serif" }}>
      {/* Header */}
      <div style={{ height: 5, background: '#4a6741' }} />
      <header style={{ background: '#6B6B4A', padding: '18px 24px 18px', borderBottom: '3px solid #C49A2A' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 18 }}>
          <img
            src="/elt-logo.png"
            alt="Elder Life Transitions"
            style={{ height: 96, width: 'auto', flexShrink: 0 }}
          />
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.65)', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: 5 }}>
              Elder Life Transitions
            </div>
            <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 26, fontWeight: 700, color: '#fff', lineHeight: 1.2 }}>
              Care Cost Runway Calculator
            </div>
          </div>
        </div>
      </header>

      <div style={{ maxWidth: 520, margin: '0 auto', padding: '22px 24px 40px' }}>
        {screen === 'intake' && (
          <IntakeScreen sels={sels} onPick={pick} onSubmit={startLoad} />
        )}
        {screen === 'loading' && (
          <LoadingScreen market={sels.market ?? 'other'} onComplete={() => goToScreen('teaser')} />
        )}
        {screen === 'teaser' && (
          <TeaserScreen market={sels.market ?? 'other'} onContinue={() => goToScreen('gate')} />
        )}
        {screen === 'gate' && (
          <GateScreen
            firstName={firstName}
            email={email}
            onFirstNameChange={setFirstName}
            onEmailChange={setEmail}
            submitting={submitting}
            error={submitError}
            onSubmit={handleGateSubmit}
          />
        )}
        {screen === 'results' && results && (
          <ResultsScreen results={results} bookingUrl={bookingUrl} />
        )}
      </div>
    </div>
  );
}

export default function RunwayPage() {
  return (
    <Suspense>
      <RunwayCalculatorInner />
    </Suspense>
  );
}
