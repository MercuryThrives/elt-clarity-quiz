'use client';

import React, { Suspense, useEffect, useRef } from 'react';
import type { CSSProperties } from 'react';
import Script from 'next/script';
import { useSearchParams } from 'next/navigation';

// Same Calendly event used by the CCRR page's post-gate "Book Your Free Runway
// Clarity Call" CTA, reused as-is here so the existing "booking confirmation"
// conversion action keeps firing correctly. Swap this if a dedicated Calendly
// event type is set up for this crisis-intake offer.
const CALENDLY_URL = 'https://calendly.com/elder-life-transitions-dave-johnstone/free-runway-clarity-call';

const W: CSSProperties = { maxWidth: 680, margin: '0 auto', padding: '0 24px' };

function goldBtn(): CSSProperties {
  return {
    display: 'block',
    width: '100%',
    maxWidth: 360,
    padding: '14px 24px',
    background: '#C49A2A',
    color: '#3D3025',
    border: 'none',
    borderRadius: 6,
    fontFamily: "'Open Sans', sans-serif",
    fontWeight: 700,
    fontSize: 16,
    textDecoration: 'none',
    cursor: 'pointer',
    textAlign: 'center',
    boxSizing: 'border-box',
    margin: '0 auto',
  };
}

function MemoryCareReviewInner() {
  const searchParams = useSearchParams();

  const gclid = useRef(searchParams.get('gclid') ?? undefined);
  const utmSource = useRef(searchParams.get('utm_source') ?? undefined);
  const utmMedium = useRef(searchParams.get('utm_medium') ?? undefined);
  const utmCampaign = useRef(searchParams.get('utm_campaign') ?? undefined);

  useEffect(() => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href =
      'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Open+Sans:wght@400;600&display=swap';
    document.head.appendChild(link);
    const calLink = document.createElement('link');
    calLink.rel = 'stylesheet';
    calLink.href = 'https://assets.calendly.com/assets/external/widget.css';
    document.head.appendChild(calLink);
  }, []);

  useEffect(() => {
    function handleMessage(e: MessageEvent) {
      if (e.data?.event !== 'calendly.event_scheduled') return;
      type DL = { dataLayer?: unknown[] };
      const w = window as unknown as DL;
      if (!w.dataLayer) w.dataLayer = [];
      // Same conversion action as the CCRR page: booking confirmation.
      w.dataLayer.push({
        event: 'runway_call_booked',
        landingPage: 'memory-care-review',
        gclid: gclid.current,
        utmSource: utmSource.current,
        utmMedium: utmMedium.current,
        utmCampaign: utmCampaign.current,
      });
    }
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  function openCalendly() {
    type Cal = { Calendly: { initPopupWidget: (o: { url: string }) => void } };
    (window as unknown as Cal).Calendly.initPopupWidget({ url: CALENDLY_URL });
  }

  return (
    <div style={{ background: '#EDE8DC', minHeight: '100vh', fontFamily: "'Open Sans', sans-serif" }}>
      <Script src="https://assets.calendly.com/assets/external/widget.js" strategy="afterInteractive" />

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
              Memory Care Crisis Second Opinion
            </div>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <div style={{ background: '#EDE8DC', padding: '52px 0 56px' }}>
        <div style={W}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 22 }}>
            <div style={{ flexShrink: 0 }}>
              <img
                src="/Dave_2025-16b.png"
                alt="David Johnstone"
                width={112}
                height={112}
                style={{ borderRadius: '50%', border: '2px solid #C49A2A', display: 'block' }}
              />
            </div>
            <div style={{ paddingTop: 4 }}>
              <div style={{ fontWeight: 700, fontSize: 15, color: '#3D3025', marginBottom: 6 }}>David Johnstone</div>
              <p style={{ fontSize: 13, color: '#3D3025', lineHeight: 1.6, margin: 0 }}>
                I spent years as a Registered Nurse on a hospital psychiatric unit and as
                an Executive Director of assisted living, memory care, and independent
                living communities. I&rsquo;ve sat on the other side of the exact discharge letter
                you may be holding right now. This is not a placement service, and I will
                not take any referral fees related to this service &mdash; my only job is telling
                you the truth about your options.
              </p>
            </div>
          </div>

          <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 'clamp(24px, 5vw, 36px)', fontWeight: 700, color: '#5D0E0E', lineHeight: 1.3, marginBottom: 18 }}>
            If Your Parent&rsquo;s Memory Care Community Just Threatened Eviction, or the Hospital Called About a Psychiatric Hold &mdash; You Don&rsquo;t Have Weeks to Figure Out What&rsquo;s Next.
          </h1>

          <p style={{ fontSize: 15, color: '#3D3025', lineHeight: 1.7, marginBottom: 32 }}>
            Behavioral changes in dementia &mdash; aggression, paranoia, resisting care &mdash;
            often trigger a crisis moment: a discharge notice, an ER visit, a hospital
            psychiatric hold. You need someone who has actually run a memory care
            community to tell you, plainly, what&rsquo;s really going on and what to do next.
            Not a salesperson. A second opinion.
          </p>

          <button onClick={openCalendly} style={goldBtn()}>
            Book a 20-Minute Call
          </button>

          <p style={{ fontSize: 12, color: 'rgba(61,48,37,0.75)', textAlign: 'center', lineHeight: 1.6, marginTop: 16, fontStyle: 'italic' }}>
            P.S. &mdash; If the crisis is active right now (an eviction notice with a
            deadline, a hospital discharge happening this week), say so when you book &mdash;
            I prioritize those calls.
          </p>
        </div>
      </div>

      {/* Privacy / Terms footer — identical to CCRR footer block */}
      <div style={{ padding: '20px 24px', textAlign: 'center', background: '#fff', borderTop: '1px solid #EDE8DC' }}>
        <p style={{ fontSize: 12, color: '#3D3025', lineHeight: 1.6, marginBottom: 10 }}>
          This is educational information about senior care options and does not constitute financial, legal, or medical advice.
        </p>
        <p style={{ fontSize: 13, color: '#7a6e64', lineHeight: 1.6, marginBottom: 8 }}>
          Elder Life Transitions · 2525 Arapahoe Ave, Ste E4#1112, Boulder, CO 80302
        </p>
        <p style={{ fontSize: 13, color: '#7a6e64', lineHeight: 1.6, marginBottom: 0 }}>
          © Elder Life Transitions ·{' '}
          <a href="https://www.elderlifetransitions.net/privacy_policy" target="_blank" rel="noopener noreferrer" style={{ color: '#7a6e64', textDecoration: 'underline' }}>Privacy Policy</a>
          {' '}·{' '}
          <a href="https://www.elderlifetransitions.net/terms_of_service" target="_blank" rel="noopener noreferrer" style={{ color: '#7a6e64', textDecoration: 'underline' }}>Terms of Service</a>
        </p>
      </div>
    </div>
  );
}

export default function MemoryCareReviewPage() {
  return (
    <Suspense>
      <MemoryCareReviewInner />
    </Suspense>
  );
}
