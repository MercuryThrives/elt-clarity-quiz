'use client';

import { useEffect } from 'react';

export default function RunwayThankYouPage() {
  useEffect(() => {
    type DL = { dataLayer?: unknown[] };
    const w = window as unknown as DL;
    if (!w.dataLayer) w.dataLayer = [];
    w.dataLayer.push({ event: 'runway_call_booked_pageview' });
  }, []);

  useEffect(() => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href =
      'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Open+Sans:wght@400;600&display=swap';
    document.head.appendChild(link);
  }, []);

  return (
    <div style={{ background: '#EDE8DC', minHeight: '100vh', fontFamily: "'Open Sans', sans-serif" }}>
      <header style={{ background: '#6B6B4A', padding: '18px 24px', borderBottom: '3px solid #C49A2A' }}>
        <div
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: 'rgba(255,255,255,0.65)',
            letterSpacing: '1.5px',
            textTransform: 'uppercase',
            textAlign: 'center',
          }}
        >
          Elder Life Transitions
        </div>
      </header>

      <div style={{ maxWidth: 520, margin: '0 auto', padding: '48px 24px', textAlign: 'center' }}>
        <h1
          style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: 32,
            fontWeight: 700,
            color: '#5D0E0E',
            marginBottom: 20,
            lineHeight: 1.3,
          }}
        >
          You&apos;re Booked.
        </h1>

        <p style={{ fontSize: 16, color: '#3D3025', lineHeight: 1.7, marginBottom: 24 }}>
          Thank you for scheduling a Runway Clarity Call. You&apos;ll receive a calendar
          confirmation by email shortly. If you have any documents or numbers you&apos;d like to
          have handy for the call, rough figures are all you need. No spreadsheets required.
        </p>

        <p style={{ fontSize: 12, color: '#7a6e64', lineHeight: 1.6 }}>
          This is care cost planning information and does not constitute financial, tax, legal, or
          medical advice.
        </p>
      </div>
    </div>
  );
}
