'use client';
import React from 'react';
import type { Sels } from './types';
import { optBtnStyle, ctaBtnStyle } from './styles';

interface Props {
  sels: Sels;
  onPick: (group: keyof Sels, val: string) => void;
  onSubmit: () => void;
}

export default function IntakeScreen({ sels, onPick, onSubmit }: Props) {
  const allSelected = !!(sels.assets && sels.income && sels.market && sels.careLevel);

  return (
    <div>
      <p style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 18, color: '#3D3025', lineHeight: 1.55, marginBottom: 24 }}>
        Most families make this care decision not knowing whether the money will last. In two minutes, you&rsquo;ll have an estimate, based on what care in your area costs after the first assessment, not just the quoted rate.
      </p>

      <div style={{ borderLeft: '2px solid #C49A2A', paddingLeft: 12, marginBottom: 14 }}>
        <p style={{ fontStyle: 'italic', fontSize: 12, color: '#7a6e64', lineHeight: 1.55, margin: 0 }}>
          Built by a former Executive Director who ran assisted living, memory care, and independent living communities, and who approved the care assessments that showed up on the second invoice.
        </p>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <img
          src="/Dave_2025-16b.png"
          alt="David Johnstone"
          style={{ width: 96, height: 96, borderRadius: '50%', flexShrink: 0, border: '2px solid #C49A2A' }}
        />
        <div>
          <div style={{ fontWeight: 700, fontSize: 13, color: '#3D3025' }}>David Johnstone</div>
          <div style={{ fontSize: 12, color: '#7a6e64' }}>Former Executive Director, Assisted Living</div>
        </div>
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
            <button key={o.val} style={optBtnStyle(sels.assets === o.val)} onClick={() => onPick('assets', o.val)}>
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
            <button key={o.val} style={optBtnStyle(sels.income === o.val)} onClick={() => onPick('income', o.val)}>
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
            <button key={o.val} style={optBtnStyle(sels.market === o.val)} onClick={() => onPick('market', o.val)}>
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
            <button key={o.val} style={optBtnStyle(sels.careLevel === o.val)} onClick={() => onPick('careLevel', o.val)}>
              <div style={{ fontWeight: 600 }}>{o.label}</div>
              <div style={{ fontSize: 11, opacity: 0.85, marginTop: 2 }}>{o.desc}</div>
            </button>
          ))}
        </div>
      </div>

      <p style={{ fontSize: 12, color: '#7a6e64', textAlign: 'center', marginBottom: 14 }}>
        Rough numbers are enough. This takes about 2 minutes.
      </p>

      <button style={ctaBtnStyle(!allSelected)} disabled={!allSelected} onClick={onSubmit}>
        Show me how long the money lasts &rarr;
      </button>

      <p style={{ textAlign: 'center', fontSize: 11, color: '#7a6e64', marginTop: 11 }}>
        Benchmarks from CareScout 2025 and December 2025 primary community data.
      </p>
    </div>
  );
}
