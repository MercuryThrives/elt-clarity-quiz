'use client';

import React, { Suspense, useState, useEffect, useRef } from 'react';
import type { CSSProperties } from 'react';
import { useSearchParams } from 'next/navigation';
import { submitRunwayLead } from '@/app/actions/runway-submissions';
import { ASSET_MID, INCOME_MID, BASE_RENT, CARE_FEE, MEDS, calcMonths } from '@/components/runway/constants';
import type { Screen, Sels, Results } from '@/components/runway/types';
import IntakeScreen from '@/components/runway/IntakeScreen';
import LoadingScreen from '@/components/runway/LoadingScreen';
import TeaserScreen from '@/components/runway/TeaserScreen';
import GateScreen from '@/components/runway/GateScreen';
import ResultsScreen from '@/components/runway/ResultsScreen';

const BOOKING_URL =
  process.env.NEXT_PUBLIC_RUNWAY_BOOKING_URL ??
  'https://calendar.app.google/wtJzCe3nKDBeiXqv9';

const PAGE_CONFIG = {
  hero: {
    eyebrow:
      'Former Executive Director of assisted living, memory care, and independent living communities — the person who built the schedules, set the care fees, and signed the level-of-care notices · No Referral Fees on This Engagement · Colorado',
    h1a: "Will Your Loved One's Care Money Last?",
    h1b: "Find Out — and What It Would Take to Add Years to That Number.",
    qualifiers: [
      "Even if you don't have official facility quotes yet.",
      "Even if you aren't completely sure which care path makes sense.",
      "Even if what you really want is just to stop guessing and know where you actually stand.",
    ],
    subhead:
      "The monthly price on a community tour isn't what you end up paying. This free calculator models the real, all-in cost of assisted living in your area — what communities quote, what they bill after the first care assessment, and how many years your loved one's resources are likely to hold at that number.",
    ctaLabel: 'Run the Free Calculator ↓',
    trustLine:
      'Takes about 2 minutes · Built for Colorado families · No financial statements needed',
  },
};

// Layout helpers
const W: CSSProperties = { maxWidth: 680, margin: '0 auto', padding: '0 24px' };

function sect(bg: string, padding = '48px 0'): CSSProperties {
  return { background: bg, padding };
}

const h2Style: CSSProperties = {
  fontFamily: "'Playfair Display', Georgia, serif",
  fontSize: 26,
  fontWeight: 700,
  color: '#5D0E0E',
  marginBottom: 16,
  lineHeight: 1.3,
};

const h3Style: CSSProperties = {
  fontFamily: "'Playfair Display', Georgia, serif",
  fontSize: 20,
  fontWeight: 700,
  color: '#3D3025',
  marginBottom: 12,
  lineHeight: 1.4,
};

const bodyStyle: CSSProperties = {
  fontSize: 15,
  color: '#3D3025',
  lineHeight: 1.7,
  marginBottom: 16,
};

const mutedStyle: CSSProperties = {
  fontSize: 13,
  color: '#7a6e64',
  lineHeight: 1.6,
};

function goldBtn(transparent = false): CSSProperties {
  return {
    display: 'inline-block',
    padding: '14px 24px',
    background: transparent ? 'transparent' : '#C49A2A',
    color: transparent ? '#C49A2A' : '#3D3025',
    border: transparent ? '2px solid #C49A2A' : 'none',
    borderRadius: 6,
    fontFamily: "'Open Sans', sans-serif",
    fontWeight: 700,
    fontSize: 16,
    textDecoration: 'none',
    cursor: 'pointer',
    textAlign: 'center',
    boxSizing: 'border-box',
  };
}

function LandingPageInner() {
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
    link.href =
      'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Open+Sans:wght@400;600&display=swap';
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

  function scrollToCalc() {
    setTimeout(() => {
      document.getElementById('calculator')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  }

  function goToScreen(s: Screen) {
    setScreen(s);
    scrollToCalc();
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

  function openCalendly() {
    type Cal = { Calendly: { initPopupWidget: (o: { url: string }) => void } };
    (window as unknown as Cal).Calendly.initPopupWidget({
      url: 'https://calendly.com/elder-life-transitions-dave-johnstone/free-runway-clarity-call',
    });
  }

  const isPostGate = screen === 'results';

  return (
    <div style={{ background: '#EDE8DC', minHeight: '100vh', fontFamily: "'Open Sans', sans-serif" }}>

      {/* ── Header ── */}
      <div style={{ height: 5, background: '#4a6741' }} />
      <header style={{ background: '#6B6B4A', padding: '18px 24px', borderBottom: '3px solid #C49A2A' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 18 }}>
          <img src="/elt-logo.png" alt="Elder Life Transitions" style={{ height: 96, width: 'auto', flexShrink: 0 }} />
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

      {/* ── S1 — Hero ── */}
      <div style={sect('#3D3025', '52px 0 48px')}>
        <div style={W}>
          <p style={{ fontSize: 11, fontWeight: 600, color: 'rgba(196,154,42,0.8)', letterSpacing: '0.7px', textTransform: 'uppercase', marginBottom: 18, lineHeight: 1.6 }}>
            {PAGE_CONFIG.hero.eyebrow}
          </p>
          <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 'clamp(24px, 5vw, 38px)', fontWeight: 700, color: '#fff', lineHeight: 1.25, marginBottom: 18 }}>
            {PAGE_CONFIG.hero.h1a}
            <br />
            <span style={{ color: '#C49A2A' }}>{PAGE_CONFIG.hero.h1b}</span>
          </h1>
          <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px' }}>
            {PAGE_CONFIG.hero.qualifiers.map((q, i) => (
              <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 10, fontSize: 14, color: 'rgba(255,255,255,0.85)', lineHeight: 1.55 }}>
                <span style={{ color: '#C49A2A', flexShrink: 0, marginTop: 1 }}>✓</span>
                {q}
              </li>
            ))}
          </ul>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.8)', lineHeight: 1.7, marginBottom: 32 }}>
            {PAGE_CONFIG.hero.subhead}
          </p>
          <button
            onClick={scrollToCalc}
            style={{ ...goldBtn(), display: 'block', width: '100%', maxWidth: 360, marginBottom: 14 }}
          >
            {PAGE_CONFIG.hero.ctaLabel}
          </button>
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', textAlign: 'center', lineHeight: 1.6 }}>
            {PAGE_CONFIG.hero.trustLine}
          </p>
        </div>
      </div>

      {/* ── S2 — The Problem ── */}
      <div style={sect('#fff')}>
        <div style={W}>
          <h2 style={h2Style}>The Number on the Brochure Is Only a Starting Point</h2>
          <blockquote style={{ borderLeft: '3px solid #C49A2A', paddingLeft: 20, margin: '0 0 24px' }}>
            <p style={{ ...bodyStyle, color: '#5D0E0E', fontStyle: 'italic' }}>
              A family I worked with kept their move-in paperwork organized in a manila folder. About four months after their mother settled into her new suite, a two-page care notice arrived. Her daily assistance needs had been reassessed by the nursing staff. It listed an updated monthly care tier fee.
            </p>
            <p style={{ ...bodyStyle, color: '#5D0E0E', fontStyle: 'italic', marginBottom: 0 }}>
              They pulled out the folder and compared. The base rent matched. But the updated care total was $980 more per month — and that was before the standard annual community increase that arrived six months later.
            </p>
          </blockquote>
          <p style={bodyStyle}>
            That notice — the one that lands after the boxes are unpacked and your family thinks the plan is settled — is what most families never see coming.
          </p>
          <p style={bodyStyle}>
            It doesn't happen because anyone is hiding the numbers. It happens because no one walks a family through what the full cost curve looks like over time before they commit to a lease.
          </p>
          <p style={{ ...bodyStyle, marginBottom: 0 }}>
            Most families don't figure this out until they're two or three years in. By then, the options aren't just financial — they involve moving a loved one who has already found her footing somewhere. A chair she's claimed by a window. A nurse whose name she knows. Most families are trying to make sure they never have to have that conversation.
          </p>
        </div>
      </div>

      {/* ── S3 — What the Calculator Models ── */}
      <div style={sect('#EDE8DC')}>
        <div style={W}>
          <h2 style={h2Style}>What You Are About to See</h2>
          <p style={bodyStyle}>
            This calculator models one care path: assisted living in Colorado. It runs your loved one's approximate assets and income against what assisted living in your area actually costs — not just the rate communities quote on the tour, but the all-in number after the first care assessment, which is almost always higher. Annual escalation is built in at 4.5%, based on West Region senior care cost trend data. Real-world increases in Colorado have often run significantly higher — the 4.5% figure is a planning baseline, not a ceiling.
          </p>
          <p style={bodyStyle}>
            What comes back is a single number: how many years the money is likely to hold at that real cost.
          </p>
          <p style={{ ...bodyStyle, marginBottom: 16 }}>
            Once you see it, you'll also see what that single number doesn't account for, and why that matters more than the number itself.
          </p>
          <p style={{ ...mutedStyle, fontStyle: 'italic', margin: 0 }}>
            Rough numbers are fine. The model is built to work on ranges. You do not need formal quotes to get a credible picture.
          </p>
        </div>
      </div>

      {/* ── S4 — Who This Is For ── */}
      <div style={sect('#fff')}>
        <div style={W}>
          <h2 style={h2Style}>Is This Right for Your Family?</h2>
          <p style={bodyStyle}>
            <strong>This is for families navigating a genuine, upcoming care transition</strong> — whether you are a few years out and trying to get oriented, actively touring local options, or facing a hospital discharge timeline this week. It is especially useful for out-of-state children who cannot be on the ground and need a clear financial picture before the family commits to anything.
          </p>
          <p style={{ ...bodyStyle, marginBottom: 0 }}>
            <strong>This is not for families who have already signed a contract</strong> and are looking for validation that they made the right call. It is built for families who still have options on the table and want an independent look at the math before making a long-term financial commitment.
          </p>
        </div>
      </div>

      {/* ── S5/S6 — Calculator area ── */}
      <div id="calculator" style={sect('#EDE8DC', '40px 0 56px')}>
        <div style={{ maxWidth: 520, margin: '0 auto', padding: '0 24px' }}>
          <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #C4A882', padding: '24px 22px' }}>
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
              <ResultsScreen results={results} onBook={openCalendly} />
            )}
          </div>
        </div>
      </div>

      {/* ── Post-gate sections ── */}
      <div style={{ display: isPostGate ? 'block' : 'none' }}>

        {/* ── S7 extra copy + CTA ── */}
        <div style={sect('#fff')}>
          <div style={W}>
            <h3 style={h3Style}>What the Estimate Shows — and What It Doesn't</h3>
            <p style={bodyStyle}>
              The number above is one path: assisted living at today's costs, with 4.5% annual escalation built in. It is a planning estimate, not a quote from any specific community. Real-world annual increases in Colorado have often run higher — treat this as a conservative floor, not a prediction.
            </p>
            <p style={{ ...bodyStyle, marginBottom: 12 }}>Two things this estimate can't see, and that change the picture most often:</p>
            <p style={bodyStyle}>
              <strong>The staying-home illusion.</strong> Most families compare a community's monthly price to staying home "for free." That's not actually the comparison. Run it the right way and the runway can look very different than what families expect — sometimes in directions that surprise them. Which way it goes depends on specifics this estimate doesn't have.
            </p>
            <p style={{ ...bodyStyle, marginBottom: 36 }}>
              <strong>Care progression.</strong> This estimate holds care needs fixed at today's level. Over time, most residents need more help, and communities charge more as they do. A move from light to moderate care at the same community can add $900 or more per month. The estimate gives you a baseline. The Review shows where the trajectory leads.
            </p>

            <div style={{ border: '1px solid #C49A2A', borderRadius: 10, background: '#fdf8f0', padding: '28px 24px' }}>
              <h3 style={{ ...h3Style, textAlign: 'center', marginBottom: 16 }}>
                The Calculator Shows the Numbers. A Conversation Helps You Know What to Do with Them.
              </h3>
              <p style={{ ...bodyStyle, marginBottom: 24 }}>
                If the estimate raises a question, or you want someone who ran these communities to look at your loved one's specific situation, the next step is a free Runway Clarity Call: 20 minutes with a former Executive Director who takes no referral fee from any community for this Review.
              </p>
              <a href={BOOKING_URL} target="_blank" rel="noopener noreferrer" style={{ ...goldBtn(), display: 'block', marginBottom: 0 }}>
                Book Your Free Runway Clarity Call
              </a>
            </div>
          </div>
        </div>

        {/* ── S8 — Operator Credibility ── */}
        <div style={sect('#3D3025')}>
          <div style={W}>
            <h2 style={{ ...h2Style, color: '#C49A2A' }}>The View from Inside the Building</h2>
            <p style={{ ...bodyStyle, color: 'rgba(255,255,255,0.85)' }}>
              What families tell me most often, after they see the full picture for the first time, is that they stopped feeling like they were doing this wrong.
            </p>
            <p style={{ ...bodyStyle, color: 'rgba(255,255,255,0.85)' }}>
              Before designing this framework, I spent years operating Assisted Living, Memory Care, and Independent Living communities as an Executive Director.
            </p>
            <p style={{ ...bodyStyle, color: 'rgba(255,255,255,0.85)' }}>
              I have sat in the meetings where level-of-care rates were set. I have reviewed and authorized the care reassessment notices before they went out to families. I have watched plans that looked solid at move-in become precarious eighteen months later — not because the family did anything wrong, but because no one showed them what the true cost curve looked like over time.
            </p>
            <p style={{ ...bodyStyle, color: 'rgba(255,255,255,0.85)' }}>
              Communities aren't intentionally hiding this. They show families what families know to ask to see. Most families don't know what to ask.
            </p>
            <p style={{ ...bodyStyle, color: 'rgba(255,255,255,0.85)', marginBottom: 0 }}>
              I do. The Care Cost Runway Review gives your family the same view I had from inside the building. No community pays me a fee for it.
            </p>
          </div>
        </div>

        {/* ── S9 — Book the Call ── */}
        <div style={sect('#fff')}>
          <div style={W}>
            <h2 style={h2Style}>Ready to Talk It Through?</h2>
            <p style={bodyStyle}>
              A free Runway Clarity Call is 20 minutes, by phone or video. We look at your loved one's actual situation, what the estimate above means for your family specifically, and whether a full Care Cost Runway Review makes sense.
            </p>
            <p style={bodyStyle}>
              If it does, the Review covers all five realistic care paths (not just assisted living), is built by hand around your loved one's real numbers, and is delivered within about a week. Where it's useful, I'll also pull real numbers from communities your family is considering, not just benchmarks, and flag billing terms that affect the math, like what triggers a care fee increase or how it's structured. Some of what extends a family's runway isn't on any rate sheet. That's part of what the call is for.
            </p>
            <p style={{ ...bodyStyle, marginBottom: 24 }}>
              <strong>The founding rate is $1,500.</strong> If after the final call you don't feel you have a clearer picture, the fee is refunded in full.
            </p>
            <p style={bodyStyle}>
              This is built for families actively working through a real care decision, not for general research.
            </p>
            <p style={{ ...mutedStyle, fontStyle: 'italic', marginBottom: 24 }}>
              Former Executive Director of assisted living, memory care, and independent living communities — the person who built the schedules, set the care fees, and signed the level-of-care notices.
            </p>
            <a href={BOOKING_URL} target="_blank" rel="noopener noreferrer" style={{ ...goldBtn(), display: 'block', marginBottom: 12 }}>
              Book Your Free Runway Clarity Call
            </a>
            <p style={{ ...mutedStyle, fontStyle: 'italic', textAlign: 'center' }}>
              Takes 20 minutes. No forms before the call. If it doesn't raise your confidence, you've lost nothing.
            </p>
          </div>
        </div>

        {/* ── S10 — Social Proof / Early Client Pricing ── */}
        <div style={sect('#fff')}>
          <div style={W}>
            <h2 style={h2Style}>Early Client Pricing</h2>
            <p style={bodyStyle}>
              The first families I work with under the Care Cost Runway Review are helping me build the initial client results for this service. In exchange, they receive the full Blueprint at the current rate of <strong>$1,500</strong> — before pricing moves to $2,500. If you'd like to work together at the current rate, book your Free Runway Clarity Call below or reach out directly.
            </p>
            <p style={{ ...mutedStyle, margin: 0 }}>
              — David Johnstone · 720-258-6001 · Dave@ElderLifeTransitions.net
            </p>
          </div>
        </div>

        {/* ── S11 — FAQ ── */}
        <div style={sect('#fff')}>
          <div style={W}>
            <h2 style={h2Style}>Common Questions</h2>
            <div style={{ display: 'grid', gap: 28 }}>
              {[
                {
                  q: 'Is this financial or legal advice?',
                  a: 'No. The Review is a cost analysis built from operating experience. It doesn\'t replace a financial advisor or an elder law attorney, and when those questions come up, I\'ll tell you exactly who to talk to. That boundary is part of what keeps the analysis independent.',
                },
                {
                  q: 'What financial information do you actually need?',
                  a: 'Almost none to book the call. The full intake — approximate assets, rough income, any long-term care coverage — only happens after we\'ve talked and a Review makes sense. Ranges are fine. No account numbers, no statements.',
                },
                {
                  q: "What if we haven't toured any communities yet?",
                  a: "That's fine, and it's actually the best time to start. The calculator runs on regional benchmarks, no quote required. A real community quote, when you have one, just sharpens the picture.",
                },
                {
                  q: "Why not just use a free senior placement service?",
                  a: "Placement agencies are typically paid by communities when a family signs a lease. Many do good work, but the model is built around placements. This is built around independent analysis. Because you pay me directly, my only obligation is to your family's decision.",
                },
                {
                  q: 'What if my loved one lives outside Colorado?',
                  a: "The calculator above is built on Colorado benchmarks. The paid Care Cost Runway Review works nationwide, by phone and secure video, using your loved one's actual location and, where available, real community rates rather than benchmarks.",
                },
              ].map((faq, i) => (
                <div key={i} style={{ borderBottom: '1px solid #EDE8DC', paddingBottom: 24 }}>
                  <h4 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 16, fontWeight: 700, color: '#3D3025', marginBottom: 8 }}>{faq.q}</h4>
                  <p style={{ ...mutedStyle, margin: 0 }}>{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── S14 — Footer CTA ── */}
        <div style={sect('#3D3025', '56px 0')}>
          <div style={W}>
            <h2 style={{ ...h2Style, color: '#C49A2A', textAlign: 'center' }}>
              Most Families Only Find Out How Long the Money Lasts Once It Starts Running Short.
            </h2>
            <p style={{ ...bodyStyle, color: 'rgba(255,255,255,0.85)', textAlign: 'center', marginBottom: 36 }}>
              The families who arrive at a care transition with a clear picture already in hand know which path holds the longest runway. They know exactly where the financial cliff sits and what choices exist before they reach it. And they make this decision knowing they did right by the person depending on them. Your family can have that certainty today.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 400, margin: '0 auto 40px', alignItems: 'stretch' }}>
              <button onClick={scrollToCalc} style={{ ...goldBtn(), display: 'block', width: '100%' }}>
                Run the Free Calculator
              </button>
              <a
                href={BOOKING_URL}
                target="_blank"
                rel="noopener noreferrer"
                style={{ ...goldBtn(true), display: 'block', width: '100%' }}
              >
                Book Your Free Runway Clarity Call
              </a>
            </div>

            <p style={{ ...mutedStyle, color: 'rgba(255,255,255,0.35)', textAlign: 'center', fontSize: 11, lineHeight: 1.7 }}>
              Elder Life Transitions · David Johnstone · 720-258-6001 · Dave@ElderLifeTransitions.net · elderlifetransitions.net
              <br />
              Data sources: CareScout 2025/2026 Cost of Care Survey; Genworth 2024 Cost of Care Survey. All cost figures are regional medians and vary significantly by individual market. Care benchmarks are refreshed annually.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}

export default function LandingPage() {
  return (
    <Suspense>
      <LandingPageInner />
    </Suspense>
  );
}
