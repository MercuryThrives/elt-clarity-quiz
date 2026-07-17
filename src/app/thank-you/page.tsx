'use client';

import { useEffect } from 'react';

export default function ThankYouPage() {
  useEffect(() => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href =
      'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Open+Sans:wght@400;600&display=swap';
    document.head.appendChild(link);
  }, []);

  return (
    <div style={{ background: '#EDE8DC', minHeight: '100vh', fontFamily: "'Open Sans', sans-serif" }}>
      <div style={{ height: 5, background: '#4a6741' }} />
      <header style={{ background: '#6B6B4A', padding: '18px 24px', borderBottom: '3px solid #C49A2A' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 18 }}>
          <img src="/elt-logo.png" alt="Elder Life Transitions" style={{ height: 96, width: 'auto', flexShrink: 0 }} />
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.65)', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: 5 }}>
              Elder Life Transitions
            </div>
            <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 26, fontWeight: 700, color: '#fff', lineHeight: 1.2 }}>
              Memory Care Crisis Review
            </div>
          </div>
        </div>
      </header>

      <div style={{ maxWidth: 560, margin: '0 auto', padding: '52px 24px 56px', textAlign: 'center' }}>
        <h1
          style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: 'clamp(24px, 5vw, 36px)',
            fontWeight: 700,
            color: '#5D0E0E',
            lineHeight: 1.3,
            marginBottom: 18,
          }}
        >
          Thank You for Booking
        </h1>

        <p style={{ fontSize: 15, color: '#3D3025', lineHeight: 1.7, marginBottom: 28 }}>
          Thank you for booking a call. I&rsquo;ll speak with you soon.
        </p>

        <div
          style={{
            border: '1px solid #C49A2A',
            background: 'rgba(196,154,42,0.12)',
            borderRadius: 6,
            padding: '14px 18px',
            margin: '0 auto',
            maxWidth: 560,
            textAlign: 'center',
          }}
        >
          <p style={{ fontSize: 13, color: '#3D3025', lineHeight: 1.6, margin: 0 }}>
            If this is a medical emergency or your parent is in immediate danger, call
            911 or go to your nearest emergency room.
          </p>
        </div>
      </div>
    </div>
  );
}
