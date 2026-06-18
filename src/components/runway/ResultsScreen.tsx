'use client';
import React, { useState } from 'react';
import type { Results } from './types';
import { GAP_CARDS, fmt, yrDisplay } from './constants';

interface Props {
  results: Results;
  bookingUrl: string;
}

export default function ResultsScreen({ results, bookingUrl }: Props) {
  const [openGaps, setOpenGaps] = useState<Set<number>>(new Set());

  function toggleGap(i: number) {
    setOpenGaps(prev => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i); else next.add(i);
      return next;
    });
  }

  return (
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
        What this estimate doesn&rsquo;t show and a Senior Care Savings Optimizer does.
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
            ? "Based on these inputs, your loved one's resources may run out sooner than your family expects. A Senior Care Savings Optimizer looks at five realistic care options and shows you which ones make the money last longer."
            : results.primaryYrs < 7
            ? "You have a planning window. A Senior Care Savings Optimizer shows you which of the five care options makes the most of it, and where the money runs short before you reach it."
            : "You have time to plan well. A Senior Care Savings Optimizer maps five realistic care options, shows you which ones extend the runway furthest, and gives you a written analysis to share with your family."}
        </p>
        <p style={{ fontSize: 12, color: '#7a6e64', marginBottom: 10, lineHeight: 1.5 }}>
          The Senior Care Savings Optimizer covers all five care paths, models how costs change as care needs progress, and delivers a written analysis within about a week. It is built by hand, for one family at a time, by a former Executive Director who ran these communities from the inside. Because each Senior Care Savings Optimizer requires that kind of attention, I only take on a small number of clients each month.
        </p>
        <p style={{ fontSize: 14, color: '#3D3025', fontWeight: 600, marginBottom: 8 }}>
          The founding rate for a Senior Care Savings Optimizer is $1,500.
        </p>
        <p style={{ fontSize: 12, color: '#7a6e64', marginBottom: 14, lineHeight: 1.5, fontStyle: 'italic' }}>
          This is built for families actively working through a care decision, not for general research.
        </p>
        <p style={{ fontSize: 13, color: '#3D3025', lineHeight: 1.55, marginBottom: 16 }}>
          This is a 20-minute conversation with someone who has run these communities from the inside, before you commit to anything. Bring your questions. If an Optimizer makes sense for your family, you&rsquo;ll know by the end of the call.
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
          Book Your Free Hidden Cost Audit
        </a>
      </div>

      <p style={{ textAlign: 'center', fontSize: 10, color: '#7a6e64', marginTop: 18, lineHeight: 1.5 }}>
        This is care cost planning information and does not constitute financial, tax, legal, or medical advice.<br />
        Benchmarks based on current Colorado senior care cost research.
      </p>
    </div>
  );
}
