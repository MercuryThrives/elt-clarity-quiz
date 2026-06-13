'use client';

import React, { Suspense, useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { submitRunwayLead } from '@/app/actions/runway-submissions';

// ── Constants ────────────────────────────────────────────────────────────────
const ASSET_MID: Record<string, number> = {
  u200: 150000, b500: 350000, b1m: 750000, o1m: 1200000,
};
const INCOME_MID: Record<string, number> = {
  u2k: 1500, b4k: 3000, b6k: 5000, o6k: 7000,
};
const BASE_RENT: Record<string, number> = {
  denver: 7150, fortcollins: 6550, coloradosprings: 6450, other: 6525,
};
const CARE_FEE: Record<string, number> = {
  light: 600, moderate: 1500, heavy: 2725,
};
const MEDS = 550;

const MARKET_LABEL: Record<string, string> = {
  denver: 'Denver Metro',
  fortcollins: 'Fort Collins',
  coloradosprings: 'Colorado Springs',
  other: 'Colorado',
};
const MARKET_PREFIX: Record<string, string> = {
  denver: 'Denver Metro communities',
  fortcollins: 'Fort Collins-area communities',
  coloradosprings: 'Colorado Springs-area communities',
  other: 'Colorado communities',
};

const GAP_CARDS = [
  {
    title: 'Care progression',
    body: "This estimate holds care needs fixed at today’s level. Over time, most residents need more help, and communities charge more as they do. Moving from light to heavy care at the same community can add $2,000 or more per month to the bill. The Care Cost Runway Review models where your loved one’s trajectory is likely to lead.",
  },
  {
    title: 'Level-of-care step-ups',
    body: 'Most communities reassess residents within 60 to 90 days of move-in. The care fee quoted on the tour is an estimate. The first invoice often looks different. I have signed those reassessments.',
  },
  {
    title: 'The home equity swap',
    body: "If the family home eventually sells to fund care, this analysis changes. The direction and magnitude of that change depends on your loved one’s specific situation. Most families assume the comparison is straightforward. In our experience, running the actual numbers surprises them.",
  },
  {
    title: 'The CCRC / Life Plan path',
    body: 'A Life Plan community requires a large upfront entrance fee and feels expensive. For a loved one with a likely long care trajectory, the full-picture comparison sometimes shows it outlasting the stay-home path with heavy care. That result is counterintuitive enough that most families never discover it without someone running the numbers.',
  },
  {
    title: 'VA benefits and unclaimed LTC coverage',
    body: "Some families are eligible for benefits that would meaningfully extend their loved one’s runway and have never applied. Identifying which apply, calculating their impact on the runway, and knowing what to do next is part of what the Care Cost Runway Review does.",
  },
];

// ── Types ────────────────────────────────────────────────────────────────────
type Screen = 'intake' | 'loading' | 'teaser' | 'gate' | 'results';
interface Sels {
  assets: string | null;
  income: string | null;
  market: string | null;
  careLevel: string | null;
}
interface Results {
  quotedMonthly: number;
  actualMonthly: number;
  monthlyGap: number;
  annualGap: number;
  primaryYrs: number;
  lightYrs: number;
}

// ── Helpers ──────────────────────────────────────────────────────────────────
function calcMonths(assets: number, income: number, cost: number): number {
  let bal = assets, months = 0, c = cost;
  const esc = 0.045 / 12;
  while (bal > 0 && months < 720) {
    const burn = c - income;
    if (burn <= 0) return 600;
    bal -= burn;
    c *= 1 + esc;
    months++;
  }
  return months;
}

function fmt(n: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency', currency: 'USD', maximumFractionDigits: 0,
  }).format(n);
}

function yrDisplay(y: number) {
  return y >= 50 ? '50+' : String(y);
}

function optBtnStyle(selected: boolean): React.CSSProperties {
  return {
    padding: '9px 12px',
    borderRadius: 6,
    cursor: 'pointer',
    textAlign: 'left',
    border: `2px solid ${selected ? '#5D0E0E' : '#C4A882'}`,
    background: selected ? '#5D0E0E' : '#fff',
    color: selected ? '#fff' : '#3D3025',
    fontFamily: "'Open Sans', sans-serif",
    fontSize: 13,
    lineHeight: '1.35',
    width: '100%',
    transition: 'all 0.1s',
  };
}

function ctaBtnStyle(disabled: boolean): React.CSSProperties {
  return {
    width: '100%',
    padding: 13,
    borderRadius: 6,
    border: 'none',
    cursor: disabled ? 'not-allowed' : 'pointer',
    background: disabled ? '#ccc' : '#C49A2A',
    color: disabled ? '#999' : '#3D3025',
    fontFamily: "'Open Sans', sans-serif",
    fontWeight: 600,
    fontSize: 14,
  };
}

// ── Main component ───────────────────────────────────────────────────────────
function RunwayCalculatorInner() {
  const searchParams = useSearchParams();

  const [screen, setScreen] = useState<Screen>('intake');
  const [sels, setSels] = useState<Sels>({ assets: null, income: null, market: null, careLevel: null });
  const [results, setResults] = useState<Results | null>(null);
  const [loadPct, setLoadPct] = useState(0);
  const [firstName, setFirstName] = useState('');
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [openGaps, setOpenGaps] = useState<Set<number>>(new Set());

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
    if (screen !== 'loading') return;
    setLoadPct(0);
    let pct = 0;
    const iv = setInterval(() => {
      pct += 2;
      setLoadPct(Math.min(pct, 100));
      if (pct >= 100) {
        clearInterval(iv);
        setTimeout(() => goToScreen('teaser'), 300);
      }
    }, 40);
    return () => clearInterval(iv);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screen]);

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

  function allSelected() {
    return !!(sels.assets && sels.income && sels.market && sels.careLevel);
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

  function toggleGap(i: number) {
    setOpenGaps(prev => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i); else next.add(i);
      return next;
    });
  }

  const gateValid =
    firstName.trim().length > 0 &&
    email.trim().includes('@') &&
    email.trim().length > 3;

  const bookingUrl =
    process.env.NEXT_PUBLIC_RUNWAY_BOOKING_URL ??
    'https://calendar.app.google/wtJzCe3nKDBeiXqv9';

  return (
    <div style={{ background: '#EDE8DC', minHeight: '100vh', fontFamily: "'Open Sans', sans-serif" }}>
      {/* Header */}
      <header style={{ background: '#6B6B4A', padding: '14px 24px', borderBottom: '3px solid #C49A2A' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <img
            src="/elt-logo.png"
            alt="Elder Life Transitions"
            style={{ width: 48, height: 48, borderRadius: '50%', flexShrink: 0 }}
          />
          <div>
            <div style={{ fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.6)', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: 3 }}>
              Elder Life Transitions
            </div>
            <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 20, fontWeight: 700, color: '#fff' }}>
              Care Cost Runway Calculator
            </div>
          </div>
        </div>
      </header>

      <div style={{ maxWidth: 520, margin: '0 auto', padding: '22px 24px 40px' }}>

        {/* ── Screen 1: Intake ── */}
        {screen === 'intake' && (
          <div>
            <p style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 18, color: '#3D3025', lineHeight: 1.55, marginBottom: 24 }}>
              Most families make this care decision not knowing whether the money will last. In two minutes, you&rsquo;ll have an estimate, based on what care in your area costs after the first assessment, not just the quoted rate.
            </p>

            <div style={{ borderLeft: '2px solid #C49A2A', paddingLeft: 12, marginBottom: 20 }}>
              <p style={{ fontStyle: 'italic', fontSize: 12, color: '#7a6e64', lineHeight: 1.55, margin: 0 }}>
                Built by a former Executive Director who ran assisted living, memory care, and independent living communities, and who approved the care assessments that showed up on the second invoice.
              </p>
            </div>

            <p style={{ fontSize: 13, fontWeight: 600, color: '#3D3025', marginBottom: 22 }}>
              Four quick questions. Rough numbers are fine.
            </p>

            {/* Q1 — Assets */}
            <div style={{ marginBottom: 18 }}>
              <div style={{ fontWeight: 600, fontSize: 13, color: '#3D3025', marginBottom: 7 }}>
                About how much does your loved one have available for care?
              </div>
              <div style={{ fontSize: 12, color: '#7a6e64', marginBottom: 8 }}>
                Savings, investments, retirement accounts. Rough numbers are fine.
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 7 }}>
                {[
                  { val: 'u200', label: 'Under $200,000' },
                  { val: 'b500', label: '$200,000 to $500,000' },
                  { val: 'b1m', label: '$500,000 to $1,000,000' },
                  { val: 'o1m', label: 'Over $1,000,000' },
                ].map(o => (
                  <button key={o.val} style={optBtnStyle(sels.assets === o.val)} onClick={() => pick('assets', o.val)}>
                    <div style={{ fontWeight: 600 }}>{o.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Q2 — Income */}
            <div style={{ marginBottom: 18 }}>
              <div style={{ fontWeight: 600, fontSize: 13, color: '#3D3025', marginBottom: 7 }}>
                What is your loved one&rsquo;s approximate monthly income?
              </div>
              <div style={{ fontSize: 12, color: '#7a6e64', marginBottom: 8 }}>
                For example, Social Security and pension combined.
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 7 }}>
                {[
                  { val: 'u2k', label: 'Under $2,000' },
                  { val: 'b4k', label: '$2,000 to $4,000' },
                  { val: 'b6k', label: '$4,000 to $6,000' },
                  { val: 'o6k', label: 'Over $6,000' },
                ].map(o => (
                  <button key={o.val} style={optBtnStyle(sels.income === o.val)} onClick={() => pick('income', o.val)}>
                    <div style={{ fontWeight: 600 }}>{o.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Q3 — Market */}
            <div style={{ marginBottom: 18 }}>
              <div style={{ fontWeight: 600, fontSize: 13, color: '#3D3025', marginBottom: 7 }}>
                Where will care most likely happen?
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 7 }}>
                {[
                  { val: 'denver', label: 'Denver Metro' },
                  { val: 'fortcollins', label: 'Fort Collins area' },
                  { val: 'coloradosprings', label: 'Colorado Springs area' },
                  { val: 'other', label: 'Rest of Colorado' },
                ].map(o => (
                  <button key={o.val} style={optBtnStyle(sels.market === o.val)} onClick={() => pick('market', o.val)}>
                    <div style={{ fontWeight: 600 }}>{o.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Q4 — Care level */}
            <div style={{ marginBottom: 22 }}>
              <div style={{ fontWeight: 600, fontSize: 13, color: '#3D3025', marginBottom: 7 }}>
                How would you describe your loved one&rsquo;s current care needs?
              </div>
              <div style={{ fontSize: 12, color: '#7a6e64', marginBottom: 8 }}>
                This affects the estimate more than any other input.
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 7 }}>
                {[
                  { val: 'light', label: 'Light', desc: 'Reminders and occasional help' },
                  { val: 'moderate', label: 'Moderate', desc: 'Regular help with bathing, dressing, mobility' },
                  { val: 'heavy', label: 'Heavy', desc: 'Significant daily assistance with most activities' },
                ].map(o => (
                  <button key={o.val} style={optBtnStyle(sels.careLevel === o.val)} onClick={() => pick('careLevel', o.val)}>
                    <div style={{ fontWeight: 600 }}>{o.label}</div>
                    <div style={{ fontSize: 11, opacity: 0.85, marginTop: 2 }}>{o.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <p style={{ fontSize: 12, color: '#7a6e64', textAlign: 'center', marginBottom: 14 }}>
              Rough numbers are enough. This takes about 90 seconds.
            </p>

            <button style={ctaBtnStyle(!allSelected())} disabled={!allSelected()} onClick={startLoad}>
              Show me how long the money lasts &rarr;
            </button>
            <p style={{ textAlign: 'center', fontSize: 11, color: '#7a6e64', marginTop: 11 }}>
              Benchmarks from CareScout 2025 and December 2025 primary community data.
            </p>
          </div>
        )}

        {/* ── Loading ── */}
        {screen === 'loading' && (
          <div style={{ paddingTop: 40, textAlign: 'center' }}>
            <p style={{ fontSize: 13, color: '#7a6e64', marginBottom: 6 }}>
              Calculating your runway estimate for{' '}
              <strong style={{ color: '#3D3025' }}>{MARKET_LABEL[sels.market!] ?? 'Colorado'}</strong>
              {' '}...
            </p>
            <div style={{ width: '100%', height: 6, background: 'rgba(196,154,42,0.25)', borderRadius: 3, margin: '24px 0 20px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${loadPct}%`, background: '#C49A2A', borderRadius: 3, transition: 'width 0.1s linear' }} />
            </div>
            <p style={{ fontSize: 12, color: '#7a6e64', lineHeight: 1.6, maxWidth: 340, margin: '0 auto' }}>
              Comparing advertised rates against what families in your situation pay, and projecting how long the money is likely to last.
            </p>
          </div>
        )}

        {/* ── Screen 2: Teaser ── */}
        {screen === 'teaser' && (
          <div>
            <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 22, color: '#5D0E0E', marginBottom: 6 }}>
              Here&rsquo;s what I saw from the inside.
            </h2>
            <p style={{ fontSize: 14, color: '#3D3025', fontWeight: 600, marginBottom: 20, lineHeight: 1.5 }}>
              They quote the brochure rate. I show you what gets billed after the first assessment, and how long the money lasts.
            </p>

            <div style={{ background: '#fff', border: '1px solid #C4A882', borderRadius: 8, padding: '18px 20px', marginBottom: 18 }}>
              <p style={{ fontSize: 14, color: '#3D3025', lineHeight: 1.65, margin: '0 0 12px' }}>
                {MARKET_PREFIX[sels.market!] ?? 'Colorado communities'} quote a monthly rate that covers housing and meals. It does not cover the care assessment that happens within the first 60 to 90 days.
              </p>
              <p style={{ fontSize: 14, color: '#3D3025', lineHeight: 1.65, margin: 0 }}>
                The sales team quotes the apartment rate. The care charges come later, after the clinical team assesses what your loved one needs. As Executive Director, I approved those assessments. The quoted number and the billed number are not the same thing.
              </p>
            </div>

            <div style={{ background: '#fdf8f0', border: '1px solid #C49A2A', borderRadius: 8, padding: '16px 20px', marginBottom: 22 }}>
              <p style={{ fontSize: 13, color: '#3D3025', lineHeight: 1.65, margin: '0 0 10px' }}>
                Your runway estimate is ready. It uses your inputs and Colorado cost benchmarks to project how long the money is likely to last. It accounts for more than the quoted rate.
              </p>
              <p style={{ fontSize: 13, color: '#3D3025', lineHeight: 1.65, margin: 0 }}>
                A Care Cost Runway Review answers the harder question: across five realistic care options, which one makes the money last longest for your loved one. That answer is different for every family.
              </p>
            </div>

            <button style={ctaBtnStyle(false)} onClick={() => goToScreen('gate')}>
              Show my runway estimate &rarr;
            </button>
            <p style={{ textAlign: 'center', fontSize: 11, color: '#7a6e64', marginTop: 10 }}>
              Enter your email on the next screen to see it.
            </p>
          </div>
        )}

        {/* ── Screen 3: Gate ── */}
        {screen === 'gate' && (
          <div>
            <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 20, color: '#5D0E0E', marginBottom: 8 }}>
              Your estimate is ready.
            </h2>
            <p style={{ fontSize: 14, color: '#3D3025', marginBottom: 26, lineHeight: 1.55, fontWeight: 600 }}>
              Enter your name and email to see it.
            </p>

            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontWeight: 600, fontSize: 13, color: '#3D3025', marginBottom: 7 }}>
                First name
              </label>
              <input
                type="text"
                value={firstName}
                onChange={e => setFirstName(e.target.value)}
                placeholder="Your first name"
                style={{ width: '100%', padding: '10px 13px', border: '1px solid #C4A882', borderRadius: 6, fontSize: 14, fontFamily: "'Open Sans', sans-serif", color: '#3D3025', background: '#fff', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontWeight: 600, fontSize: 13, color: '#3D3025', marginBottom: 7 }}>
                Email address
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com"
                style={{ width: '100%', padding: '10px 13px', border: '1px solid #C4A882', borderRadius: 6, fontSize: 14, fontFamily: "'Open Sans', sans-serif", color: '#3D3025', background: '#fff', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>

            <p style={{ fontSize: 12, color: '#7a6e64', textAlign: 'center', marginBottom: 14 }}>
              I work with a small number of families each month. If the estimate raises questions, the 20-minute call is the right next step.
            </p>

            <button
              style={ctaBtnStyle(!gateValid || submitting)}
              disabled={!gateValid || submitting}
              onClick={handleGateSubmit}
            >
              {submitting ? 'Sending...' : 'Show my runway estimate →'}
            </button>

            {submitError && (
              <p style={{ color: '#5D0E0E', fontSize: 13, marginTop: 8, textAlign: 'center' }}>
                {submitError}
              </p>
            )}

            <p style={{ textAlign: 'center', fontSize: 11, color: '#7a6e64', marginTop: 11, lineHeight: 1.5 }}>
              No spam. The Care Cost Runway Review is a flat-fee service paid directly by families. No referral fee from any community.
            </p>
          </div>
        )}

        {/* ── Screen 4: Results ── */}
        {screen === 'results' && results && (
          <div>
            {/* Runway hero */}
            <div style={{ background: '#5D0E0E', borderRadius: 10, padding: 22, marginBottom: 16, textAlign: 'center' }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.75)', letterSpacing: '1.2px', textTransform: 'uppercase', marginBottom: 8 }}>
                Estimated runway at current care costs
              </div>
              <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 52, fontWeight: 700, color: '#C49A2A', lineHeight: 1, marginBottom: 6 }}>
                {yrDisplay(results.primaryYrs)}{' '}
                <span style={{ fontSize: 24 }}>yrs</span>
              </div>
              {results.primaryYrs < results.lightYrs && results.lightYrs < 50 && (
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.85)', marginBottom: 6 }}>
                  Up to {yrDisplay(results.lightYrs)} years if care needs remain light
                </div>
              )}
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', marginTop: 10, lineHeight: 1.4 }}>
                Assumes 4.5% annual cost escalation. Based on the inputs you provided.
              </div>
            </div>

            {/* Reality check */}
            <div style={{ background: '#fff', borderRadius: 8, border: '1px solid #C4A882', overflow: 'hidden', marginBottom: 8 }}>
              <div style={{ background: '#3D3025', padding: '10px 16px' }}>
                <span style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 14, color: '#fff' }}>The reality check</span>
              </div>
              <div style={{ padding: '0 16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #C4A882' }}>
                  <span style={{ fontSize: 13, color: '#7a6e64' }}>Advertised rate for your area</span>
                  <span style={{ fontSize: 15, fontWeight: 700, color: '#3D3025' }}>{fmt(results.quotedMonthly)}/mo</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #C4A882' }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#3D3025' }}>Estimated all-in monthly cost</span>
                  <span style={{ fontSize: 15, fontWeight: 700, color: '#5D0E0E' }}>{fmt(results.actualMonthly)}/mo</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0' }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#3D3025' }}>Annual difference</span>
                  <span style={{ fontSize: 15, fontWeight: 700, color: '#5D0E0E' }}>{fmt(results.annualGap)}/yr</span>
                </div>
              </div>
            </div>
            <p style={{ fontSize: 11, color: '#7a6e64', lineHeight: 1.4, marginBottom: 20, fontStyle: 'italic' }}>
              Figures based on current senior care cost research for Colorado. These are planning estimates, not quotes from any specific community.
            </p>

            {/* Gap accordion */}
            <h3 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 17, color: '#5D0E0E', marginBottom: 5 }}>
              What this estimate doesn&rsquo;t show and a Care Cost Runway Review does.
            </h3>
            <p style={{ fontSize: 13, color: '#7a6e64', marginBottom: 6, lineHeight: 1.5 }}>
              Each of these applies to most families and would materially change this number.
            </p>
            <p style={{ fontSize: 12, color: '#C49A2A', fontWeight: 600, marginBottom: 12 }}>
              + Tap any card to read more
            </p>

            {GAP_CARDS.map((card, i) => {
              const isOpen = openGaps.has(i);
              return (
                <div
                  key={i}
                  onClick={() => toggleGap(i)}
                  style={{ background: '#fff', border: `1.5px solid ${isOpen ? '#5D0E0E' : '#C4A882'}`, borderRadius: 8, marginBottom: 8, cursor: 'pointer', transition: 'border-color 0.15s' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '13px 14px' }}>
                    <div style={{ width: 26, height: 26, borderRadius: '50%', background: isOpen ? '#5D0E0E' : '#EDE8DC', border: `1.5px solid ${isOpen ? '#5D0E0E' : '#C4A882'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 11, fontWeight: 700, color: isOpen ? '#fff' : '#5D0E0E', transition: 'all 0.15s' }}>
                      {i + 1}
                    </div>
                    <div style={{ fontWeight: 600, fontSize: 13, color: '#3D3025', flex: 1, lineHeight: 1.3 }}>
                      {card.title}
                    </div>
                    <div style={{ fontSize: 20, fontWeight: 700, color: isOpen ? '#5D0E0E' : '#C49A2A', width: 22, textAlign: 'center', flexShrink: 0, lineHeight: 1, transform: isOpen ? 'rotate(45deg)' : 'none', transition: 'transform 0.2s', userSelect: 'none' }}>
                      +
                    </div>
                  </div>
                  <div style={{ maxHeight: isOpen ? 300 : 0, overflow: 'hidden', transition: 'max-height 0.28s ease' }}>
                    <div style={{ padding: '0 14px 13px 51px', fontSize: 12, color: '#7a6e64', lineHeight: 1.6, borderTop: '1px solid #f0ebe3' }}>
                      {card.body}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* CTA card */}
            <div style={{ background: '#fff', border: '2px solid #C49A2A', borderRadius: 10, padding: '18px 20px', marginTop: 20, textAlign: 'center' }}>
              <p style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 15, color: '#3D3025', marginBottom: 12, lineHeight: 1.5 }}>
                {results.primaryYrs < 3
                  ? "Based on these inputs, your loved one’s resources may run out sooner than your family expects. A Care Cost Runway Review looks at five realistic care options and shows you which ones make the money last longer."
                  : results.primaryYrs < 7
                  ? "You have a planning window. A Care Cost Runway Review shows you which of the five care options makes the most of it, and where the money runs short before you reach it."
                  : "You have time to plan well. A Care Cost Runway Review maps five realistic care options, shows you which ones extend the runway furthest, and gives you a written analysis to share with your family."}
              </p>
              <p style={{ fontSize: 12, color: '#7a6e64', marginBottom: 10, lineHeight: 1.5 }}>
                The Care Cost Runway Review covers all five care paths, models how costs change as care needs progress, and delivers a written analysis within about a week. It is built by hand, for one family at a time, by a former Executive Director who ran these communities from the inside. Because each Care Cost Runway Review requires that kind of attention, I only take on a small number of clients each month.
              </p>
              <p style={{ fontSize: 14, color: '#3D3025', fontWeight: 600, marginBottom: 8 }}>
                The founding rate for a Care Cost Runway Review is $1,500.
              </p>
              <p style={{ fontSize: 12, color: '#7a6e64', marginBottom: 14, lineHeight: 1.5, fontStyle: 'italic' }}>
                This is built for families actively working through a care decision, not for general research.
              </p>
              <p style={{ fontSize: 13, color: '#3D3025', lineHeight: 1.55, marginBottom: 16 }}>
                This is a 20-minute conversation with someone who has run these communities from the inside, before you commit to anything. Bring your questions. If a Review makes sense for your family, you&rsquo;ll know by the end of the call.
              </p>
              <p style={{ fontSize: 11, color: '#7a6e64', lineHeight: 1.5, marginBottom: 14 }}>
                Former Executive Director of assisted living, memory care, and independent living communities -- the person who built the schedules, set the care fees, and signed the level-of-care notices.
              </p>
              <a
                href={bookingUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{ display: 'block', padding: 13, background: '#C49A2A', color: '#3D3025', borderRadius: 6, fontFamily: "'Open Sans', sans-serif", fontWeight: 700, fontSize: 15, textDecoration: 'none' }}
              >
                Book a Free 20-Minute Call
              </a>
            </div>

            <p style={{ textAlign: 'center', fontSize: 10, color: '#7a6e64', marginTop: 18, lineHeight: 1.5 }}>
              This is care cost planning information and does not constitute financial, tax, legal, or medical advice.<br />
              Benchmarks based on current Colorado senior care cost research.
            </p>
          </div>
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
