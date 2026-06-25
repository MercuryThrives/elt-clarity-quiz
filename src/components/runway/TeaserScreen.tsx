'use client';
import React from 'react';
import { MARKET_PREFIX } from './constants';
import { ctaBtnStyle } from './styles';

interface Props {
  market: string;
  onContinue: () => void;
}

export default function TeaserScreen({ market, onContinue }: Props) {
  return (
    <div>
      <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 22, color: '#5D0E0E', marginBottom: 6 }}>
        Here&rsquo;s what I saw from the inside.
      </h2>
      <p style={{ fontSize: 14, color: '#3D3025', fontWeight: 600, marginBottom: 20, lineHeight: 1.5 }}>
        They quote the brochure rate. I show you what gets billed after the first assessment, and how long the money lasts.
      </p>

      <div style={{ background: '#fff', border: '1px solid #C4A882', borderRadius: 8, padding: '18px 20px', marginBottom: 18 }}>
        <p style={{ fontSize: 14, color: '#3D3025', lineHeight: 1.65, margin: '0 0 12px' }}>
          {MARKET_PREFIX[market] ?? 'Colorado communities'} quote a monthly rate that covers housing and meals. It does not cover the care assessment that happens within the first 60 to 90 days.
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

      <button style={ctaBtnStyle(false)} onClick={onContinue}>
        Show my runway estimate &rarr;
      </button>
      <p style={{ textAlign: 'center', fontSize: 11, color: '#7a6e64', marginTop: 10 }}>
        Enter your email on the next screen to see it.
      </p>
    </div>
  );
}
