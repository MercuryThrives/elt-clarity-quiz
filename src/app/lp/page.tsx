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
    h1a: "Will Your Loved One’s Care Money Last?",
    h1b: "Find Out — and What It Would Take to Add Years to That Number.",
    qualifiers: [
      "Even if you don’t have official facility quotes yet.",
      "Even if you aren’t completely sure which care path makes sense.",
      "Even if what you really want is just to stop guessing and know where you actually stand.",
    ],
    subhead:
      "The monthly price on a community tour isn’t what you end up paying. This free calculator models the real, all-in cost of assisted living in your area — what communities quote, what they bill after the first care assessment, and how many years your loved one’s resources are likely to hold at that number.",
    ctaLabel: 'Run the Free Calculator ↓',
    trustLine:
      'No email required to start · Takes about 2 minutes · Built for Colorado families · No financial statements required',
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
            It doesn’t happen because anyone is hiding the numbers. It happens because no one walks a family through what the full cost curve looks like over time before they commit to a lease.
          </p>
          <p style={{ ...bodyStyle, marginBottom: 0 }}>
            Most families don’t figure this out until they’re two or three years in. By then, the options aren’t just financial — they involve moving a loved one who has already found her footing somewhere. A chair she’s claimed by a window. A nurse whose name she knows. Most families are trying to make sure they never have to have that conversation.
          </p>
        </div>
      </div>

      {/* ── S3 — What the Calculator Models ── */}
      <div style={sect('#EDE8DC')}>
        <div style={W}>
          <h2 style={h2Style}>What You Are About to See</h2>
          <p style={bodyStyle}>
            This calculator models one care path: assisted living in Colorado. It runs your loved one’s approximate assets and income against what assisted living in your area actually costs — not just the rate communities quote on the tour, but the all-in number after the first care assessment, which is almost always higher. Annual escalation is built in at 4.5%, based on West Region senior care cost trend data. Real-world increases in Colorado have often run significantly higher — the 4.5% figure is a planning baseline, not a ceiling.
          </p>
          <p style={bodyStyle}>
            What comes back is a single number: how many years the money is likely to hold at that real cost.
          </p>
          <p style={{ ...bodyStyle, marginBottom: 12 }}>
            After you see your estimate, the calculator raises five questions it cannot answer — the same questions the Senior Care Savings Optimizer addresses in full:
          </p>
          <ul style={{ paddingLeft: 20, margin: '0 0 20px' }}>
            {[
              'What happens to the monthly bill as care needs increase over time.',
              'What changes if the family home eventually sells and that money enters the plan.',
              'Whether your family has VA or long-term care insurance benefits that have never been activated.',
              'Whether staying home with paid care might actually cost more than moving to a community — once you run the honest comparison.',
              'Whether a type of community that costs more upfront might actually stretch the money further than the alternatives.',
            ].map((item, i) => (
              <li key={i} style={{ ...bodyStyle, marginBottom: 10 }}>{item}</li>
            ))}
          </ul>
          <p style={bodyStyle}>
            These are not footnotes. They are the planning questions a single-path estimate raises and that the Senior Care Savings Optimizer answers — across all five care paths, built on your loved one’s specific situation, not regional benchmarks.
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
            <h3 style={h3Style}>What the Estimate Shows — and What It Doesn’t</h3>
            <p style={bodyStyle}>
              The number above is one path: assisted living at today’s costs, with 4.5% annual escalation built in. It is a planning estimate, not a quote from any specific community. Real-world annual increases in Colorado have often run higher — treat this as a conservative floor, not a prediction.
            </p>
            <p style={bodyStyle}>
              Below it, the calculator surfaces five things that estimate cannot model. Each one applies to most families. Each one changes the runway — sometimes by years.
            </p>
            <p style={{ ...bodyStyle, marginBottom: 12 }}>Two that consistently matter most:</p>
            <p style={bodyStyle}>
              <strong>The staying-home illusion.</strong> When you run the comparison honestly — accounting for what the home costs to carry each month, what private care actually runs at your loved one’s care level, and what the home equity adds back when the home eventually sells — moving to a community frequently shows a longer runway than staying home with paid care. Most families expect the opposite. The calculator cannot model this. The Senior Care Savings Optimizer does.
            </p>
            <p style={{ ...bodyStyle, marginBottom: 36 }}>
              <strong>Care progression.</strong> This estimate holds care needs fixed at today’s level. Over time, most residents need more help, and communities charge more as they do. A move from light to moderate care at the same community can add $900 or more per month. The estimate gives you a baseline. The Optimizer shows where the trajectory leads.
            </p>

            <div style={{ border: '1px solid #C49A2A', borderRadius: 10, background: '#fdf8f0', padding: '28px 24px' }}>
              <h3 style={{ ...h3Style, textAlign: 'center', marginBottom: 16 }}>
                The Calculator Shows the Numbers. A Conversation Helps You Know What to Do with Them.
              </h3>
              <p style={bodyStyle}>
                If the estimate raises questions — or if you want someone who ran these communities to look at your loved one’s specific situation — the next step is a free Hidden Cost Audit: a 20-minute call with a former Executive Director who has no financial relationship with any community.
              </p>
              <p style={{ ...bodyStyle, marginBottom: 24 }}>
                On that call, we look at your specific situation — what your runway estimate means, what the estimate cannot see, and whether a Senior Care Savings Optimizer makes sense for your family. You will leave with a clearer picture of where you actually stand and what the right next steps are.
              </p>
              <a href={BOOKING_URL} target="_blank" rel="noopener noreferrer" style={{ ...goldBtn(), display: 'block', marginBottom: 12 }}>
                Book Your Free Hidden Cost Audit
              </a>
              <p style={{ ...mutedStyle, fontStyle: 'italic', textAlign: 'center', margin: 0 }}>
                The sooner the picture exists, the more your family can do with it. I keep a small number of spots available each month for these calls.
              </p>
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
              Communities aren’t intentionally hiding this. They show families what families know to ask to see. Most families don’t know what to ask.
            </p>
            <p style={{ ...bodyStyle, color: 'rgba(255,255,255,0.85)', marginBottom: 36 }}>
              I do. This entire framework gives your family the same view I had from inside the building.
            </p>

            <div style={{ display: 'grid', gap: 20 }}>
              {[
                {
                  title: 'The Operator Perspective',
                  body: "I know what the second and third invoices look like because I used to send them. That knowledge doesn’t exist in generic software and cannot be replicated by financial advisors or placement agents who have never run a facility.",
                },
                {
                  title: 'Zero Referral Fees. Period.',
                  body: 'The Senior Care Savings Optimizer is paid for directly by you. I accept no fees from any community in connection with this engagement. The analysis answers only to your family.',
                },
                {
                  title: 'Models Operational Reality',
                  body: 'The Senior Care Savings Optimizer models realistic care progression, actual compounding rent adjustments, and localized level-of-care step-ups — built from direct operating experience, not software defaults. It gives your family a clear picture of where the money goes and how long it holds, before you commit to anything.',
                },
              ].map((d, i) => (
                <div key={i} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(196,154,42,0.35)', borderRadius: 8, padding: '20px 22px' }}>
                  <h3 style={{ ...h3Style, color: '#C49A2A', marginBottom: 10 }}>{d.title}</h3>
                  <p style={{ ...mutedStyle, color: 'rgba(255,255,255,0.75)', margin: 0 }}>{d.body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── S9 — The Senior Care Savings Optimizer ── */}
        <div style={sect('#fff')}>
          <div style={W}>
            <h2 style={h2Style}>When the Numbers Raise Real Questions</h2>
            <p style={bodyStyle}>
              The free calculator gives you a solid baseline: what assisted living typically costs in your area, and how long your loved one’s resources are likely to last under one care path. The Senior Care Savings Optimizer builds that same picture from the ground up — on your loved one’s actual financial situation, specific care path, and the communities your family is considering. All five options. Your real numbers. Delivered within one week.
            </p>
            <p style={{ ...mutedStyle, marginBottom: 32 }}>
              To be clear: I do not provide legal, asset-management, or medical advice. What I provide is an operational cost analysis — built from the perspective of someone who ran these communities, reviewed the assessments, and signed the billing notices.
            </p>

            <h3 style={{ ...h3Style, marginBottom: 20 }}>
              Together, these seven components form one complete decision brief — everything your family needs to move forward with certainty.
            </h3>

            <div style={{ display: 'grid', gap: 16, marginBottom: 40 }}>
              {[
                {
                  title: 'Your Five-Path Cost Map',
                  body: "Most families only look at one option. This shows all five, side by side — what it costs to stay home with paid help, move to assisted living, move to independent living, move to memory care, or choose a community that locks in your care costs for life. Built on your loved one’s real assets and income, not national averages. If you already know which communities you are considering, we use their actual published rate sheets instead of benchmarks.",
                },
                {
                  title: 'Your Money-Out Timeline',
                  body: 'A simple visual showing when the money runs out under each path — not just a monthly number, but a date. Alongside that date: what needs to happen before you reach it, what options still exist, and who needs to be involved to make them happen.',
                },
                {
                  title: 'Your Hidden Benefits Check',
                  body: 'Most families are sitting on money they do not know about. This is a review of whether your loved one qualifies for VA benefits or has a long-term care insurance policy that has never been turned on. Most families who qualify have never applied. Finding one benefit can add years to the timeline.',
                },
                {
                  title: 'Your Life Plan Community Comparison',
                  body: "Some communities ask for a large payment upfront and then cover your care costs for life. Most families see that upfront number and stop reading. This component runs the real math — what that payment means for your loved one’s specific situation, compared against every other path. It is the comparison that most consistently surprises the families I work with.",
                },
                {
                  title: 'Your Community Record Review',
                  body: "State inspection records for any communities your family is considering — pulled, reviewed, and translated into plain language. I don’t tell you whether a community is safe. I make sure you have the same information regulators have, in language you can use when asking questions on a tour. For life plan communities, I cover the residential care portion and note where the skilled nursing records are held separately.",
                },
                {
                  title: 'Your Move-In Fee Decoder',
                  body: "Most families don’t know what the care assessment measures, what triggers a tier increase, or how billing compounds over time. This component flags the fee clauses in any agreements you are considering and gives you the exact questions to ask before you sign — so the second invoice doesn’t catch your family off guard. Built from the assessment tools I approved as Executive Director.",
                },
                {
                  title: 'Your Family Alignment Summary',
                  body: 'A one-page summary built to end the sibling argument — formatted so the out-of-state brother, the attorney, and the financial advisor are all reading the same document in the same meeting. Built from the financial picture that took you 45 minutes to assemble, so you do not have to rebuild it four more times for four different people.',
                },
              ].map((c, i) => (
                <div key={i} style={{ background: '#EDE8DC', borderRadius: 8, border: '1px solid #C4A882', padding: '18px 20px' }}>
                  <h4 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 15, fontWeight: 700, color: '#5D0E0E', marginBottom: 8 }}>{c.title}</h4>
                  <p style={{ ...mutedStyle, margin: 0 }}>{c.body}</p>
                </div>
              ))}
            </div>

            <div style={{ borderTop: '1px solid #C4A882', paddingTop: 32, marginBottom: 32 }}>
              <h3 style={h3Style}>How It Works — Built by Hand, for One Family</h3>
              <p style={{ ...bodyStyle, marginBottom: 8 }}>
                After your free Hidden Cost Audit, if a full Optimizer makes sense for your situation:
              </p>
              <p style={{ ...mutedStyle, marginBottom: 24 }}>
                This is not software output. Each Senior Care Savings Optimizer Blueprint is built by hand, specific to your loved one’s situation — and delivered within approximately one week of the intake call.
              </p>

              <div style={{ display: 'grid', gap: 18 }}>
                {[
                  {
                    n: '1',
                    title: 'The Intake Form — About 15 Minutes',
                    body: 'You provide approximate asset ranges and rough monthly income. No account numbers, no financial statements, nothing identifying. Ranges are completely fine. This is the official start of the engagement.',
                  },
                  {
                    n: '2',
                    title: 'The Deep-Dive Call — 45 to 60 Minutes',
                    body: "We meet by phone or secure video to map your loved one’s care needs, the communities you are considering, and your family’s transition goals.",
                  },
                  {
                    n: '3',
                    title: 'Your Blueprint Is Delivered',
                    body: "Your complete seven-component Senior Care Savings Optimizer, built by hand on your loved one’s specific inputs, within approximately one week of the call.",
                  },
                  {
                    n: '4',
                    title: 'The Walkthrough Session — 30 Minutes',
                    body: 'We go through the findings together, answer every question, and make sure every family member has what they need to move forward.',
                  },
                ].map(step => (
                  <div key={step.n} style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#5D0E0E', color: '#fff', fontWeight: 700, fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {step.n}
                    </div>
                    <div>
                      <p style={{ fontWeight: 700, fontSize: 14, color: '#3D3025', marginBottom: 4 }}>{step.title}</p>
                      <p style={{ ...mutedStyle, margin: 0 }}>{step.body}</p>
                    </div>
                  </div>
                ))}
              </div>

              <p style={{ ...mutedStyle, fontStyle: 'italic', marginTop: 20 }}>
                Note on community rates: If you do not know your target communities yet, we build your initial Blueprint using local benchmarks. We will run up to two custom community rate updates at no extra charge within 60 days of your intake call. Updates requested after 60 days are available for a separate fee.
              </p>
            </div>

            <div style={{ background: '#fdf8f0', border: '1px solid #C49A2A', borderRadius: 10, padding: '24px', marginBottom: 24 }}>
              <p style={bodyStyle}>
                Colorado assisted living costs approximately $250 per day all-in. The Optimizer costs less than six days of care to make sure your family does not make a $50,000 mistake choosing the wrong path.
              </p>
              <p style={{ ...bodyStyle, fontWeight: 700, fontSize: 17 }}>
                The Senior Care Savings Optimizer is $1,500 for early clients.{' '}
                <span style={{ fontWeight: 400, fontSize: 14, color: '#7a6e64' }}>The rate moves to $2,500 when this introductory pricing closes.</span>
              </p>
              <p style={bodyStyle}>
                This fee is typically paid from your loved one’s care funds as part of the planning process. It is not an out-of-pocket expense for the adult child managing the transition. It is the money protecting itself.
              </p>
              <p style={{ ...bodyStyle, marginBottom: 0 }}>
                <strong>The Find Its Own Fee Guarantee:</strong> If the Optimizer does not identify at least $1,500 in potential savings, unquoted community fee reductions, or unactivated benefits, you receive a full refund. No questions asked.
              </p>
            </div>

            <p style={{ ...mutedStyle, fontStyle: 'italic', marginBottom: 24 }}>
              Former Executive Director of assisted living, memory care, and independent living communities — the person who built the schedules, set the care fees, and signed the level-of-care notices.
            </p>

            <a href={BOOKING_URL} target="_blank" rel="noopener noreferrer" style={{ ...goldBtn(), display: 'block', marginBottom: 12 }}>
              Book Your Free Hidden Cost Audit
            </a>
            <p style={{ ...mutedStyle, fontStyle: 'italic', textAlign: 'center' }}>
              Takes 20 minutes. No forms before the call. If it doesn’t raise your confidence, you’ve lost nothing.
            </p>
          </div>
        </div>

        {/* ── S10 — The Guarantee ── */}
        <div style={sect('#EDE8DC')}>
          <div style={W}>
            <h2 style={h2Style}>The Find Its Own Fee Guarantee</h2>
            <p style={bodyStyle}>
              If the Optimizer does not identify at least $1,500 in potential savings, unquoted community fee reductions, or unactivated benefits for your loved one, I refund your fee in full. Every dollar. No questions asked.
            </p>
            <p style={{ ...bodyStyle, marginBottom: 0 }}>
              I structured this guarantee to be completely measurable. Either the final Blueprint surfaces $1,500 in identifiable financial value for your family, or it costs you nothing. A promise you cannot verify is easy to make and easy to dispute. This one has a number attached to it.
            </p>
          </div>
        </div>

        {/* ── S11 — Social Proof / Early Client Pricing ── */}
        <div style={sect('#fff')}>
          <div style={W}>
            <h2 style={h2Style}>Early Client Pricing</h2>
            <p style={bodyStyle}>
              The first families I work with under the Senior Care Savings Optimizer are helping me build the initial client results for this service. In exchange, they receive the full seven-component Blueprint at the current rate of <strong>$1,500</strong> — before pricing moves to $2,500. If you’d like to work together at the current rate, book your free Hidden Cost Audit below or reach out directly.
            </p>
            <p style={{ ...mutedStyle, margin: 0 }}>
              — David Johnstone · 720-258-6001 · Dave@ElderLifeTransitions.net
            </p>
          </div>
        </div>

        {/* ── S12 — About Dave ── */}
        <div style={sect('#EDE8DC')}>
          <div style={W}>
            <h2 style={h2Style}>Who Builds Your Blueprint</h2>
            <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start', flexWrap: 'wrap', marginBottom: 24 }}>
              <img
                src="/dave-headshot.jpg"
                alt="David Johnstone"
                style={{ width: 100, height: 100, borderRadius: '50%', objectFit: 'cover', objectPosition: 'center top', border: '3px solid #C49A2A', flexShrink: 0 }}
              />
              <div style={{ flex: 1, minWidth: 200 }}>
                <p style={{ fontWeight: 700, fontSize: 16, color: '#3D3025', marginBottom: 4 }}>David Johnstone</p>
                <p style={{ ...mutedStyle, margin: 0 }}>Former Executive Director, Assisted Living, Memory Care, and Independent Living</p>
              </div>
            </div>
            <p style={bodyStyle}>
              David Johnstone is a former Executive Director of assisted living, memory care, and independent living communities. He is the specific operator who built the fee schedules, set the monthly care rates, and signed the official level-of-care price increase notices that arrived in family mailboxes after move-in.
            </p>
            <p style={bodyStyle}>
              He has been on both sides of this decision — the side that conducts resident assessments to set invoices, and the side that has to build a sustainable family budget around them.
            </p>
            <p style={{ ...bodyStyle, marginBottom: 32 }}>
              The Senior Care Savings Optimizer exists because most families never get the view from inside the building. He built it to change that.
            </p>

            <div style={{ background: '#fff', border: '1px solid #C4A882', borderRadius: 8, padding: '22px' }}>
              <h3 style={{ ...h3Style, marginBottom: 14 }}>Our Transparent Fee Model</h3>
              <p style={bodyStyle}>
                The Senior Care Savings Optimizer is completely independent. I accept no referral fees or placement commissions from senior communities in connection with building your Blueprint. The analysis answers only to your family’s numbers.
              </p>
              <p style={{ ...bodyStyle, marginBottom: 16 }}>
                If your family later chooses to work with me on finding and placing with a community, those services are separate and may involve a standard industry commission. But for the Optimizer Blueprint, you pay a flat fee directly to me. My only obligation is to your family’s decision.
              </p>
              <p style={{ ...mutedStyle, margin: 0 }}>
                <strong>Contact:</strong> David Johnstone · 720-258-6001 · Dave@ElderLifeTransitions.net · elderlifetransitions.net
              </p>
            </div>
          </div>
        </div>

        {/* ── S13 — FAQ ── */}
        <div style={sect('#fff')}>
          <div style={W}>
            <h2 style={h2Style}>Common Questions</h2>
            <div style={{ display: 'grid', gap: 28 }}>
              {[
                {
                  q: 'Is this formal financial or legal advice?',
                  a: 'No. The Optimizer provides an operational cost analysis and flags facility billing practices. It does not provide tax, legal, asset-management, or investment guidance. When those questions come up (and they usually do), I will tell you exactly what kind of professional to speak with. That boundary keeps the analysis independent.',
                },
                {
                  q: 'Are you reviewing the legal terms of the community contract?',
                  a: 'No. I do not provide legal review, contract law advice, or formal legal counsel. My analysis is strictly operational and financial. I review the community rate sheets, itemized care tiers, and billing schedules to show you exactly how the numbers compound over time. If your family needs a legal review of a lease or liability clauses, I will connect you with a qualified local elder law attorney.',
                },
                {
                  q: 'What financial information do you actually need?',
                  a: 'Almost none to book the free Hidden Cost Audit. The booking form asks only a few basic questions about your situation. The full intake form — approximate assets, rough monthly income, whether long-term care coverage exists — comes after you decide the full Optimizer is the right next step. Ranges are fine. No account numbers, no statements, nothing identifying. I have held this kind of information in confidence throughout my career as an Executive Director. It goes nowhere.',
                },
                {
                  q: "What if we’re not ready to share financial details yet?",
                  a: "That’s fine. The free calculator runs entirely on regional benchmarks — no personal financial data required. Most families find that’s enough to know whether they have a real problem. If the picture it shows raises questions, we can get more precise from there. The Optimizer’s ask is only a step beyond that: planning figures, not financial disclosure.",
                },
                {
                  q: "Why shouldn’t I just use a free senior placement service?",
                  a: "Placement agencies are typically paid by communities when a family signs a lease. Many do good work — but their model is built around placements. Mine is built around independent analysis. Because you pay me directly for the Optimizer, my only obligation is to your family’s decision — not to any particular outcome. That distinction shows up clearly in the numbers.",
                },
                {
                  q: "What if we haven’t toured any communities yet?",
                  a: "That’s fine — and honestly, this is the best time to start. The model runs on verified regional benchmarks for your area. It builds a credible picture before you have ever talked to a salesperson or received a formal quote. A real community quote, when you have one, simply sharpens the picture further.",
                },
                {
                  q: "Why isn’t this offered for free?",
                  a: 'Because the insight comes from years of direct operating experience, and I limit my calendar to a specific number of families each month. You are not paying for an automated report. You are paying for a former Executive Director to build a custom care cost analysis of your loved one’s specific situation and then walk you through it on a call.',
                },
                {
                  q: 'What if my loved one lives outside Colorado?',
                  a: "The Optimizer works nationwide. All sessions are by phone and secure video. For families who are already looking at specific communities, the Optimizer is built on those communities’ actual rates — not regional benchmarks. Benchmarks are the starting point; your communities’ real numbers are better.",
                },
                {
                  q: 'What if the situation is still a few years out?',
                  a: 'Earlier is almost always better. Families who have a clear picture before a crisis have more options — in communities, in timing, in finances — than those figuring out the math during a hospital discharge window. The sooner the question gets answered, the more time your family has to act on it.',
                },
                {
                  q: 'Why should I spend $1,500 on this when I need to protect that money for care?',
                  a: 'Entering a long-term care commitment without a clear cost picture is often the most expensive path a family can take. An unexpected care tier step or a misread move-in structure can easily cost $10,000 to $15,000 in the first year alone. Investing $1,500 to independently stress-test a six-figure annual commitment is not an added expense — it is protection against a forced, unplanned move later when the money runs short. And if the Optimizer does not surface at least $1,500 in identifiable value, the fee is refunded in full.',
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
                Book Your Free Hidden Cost Audit
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
