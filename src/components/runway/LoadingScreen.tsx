'use client';
import React, { useState, useEffect } from 'react';
import { MARKET_LABEL } from './constants';

interface Props {
  market: string;
  onComplete: () => void;
}

export default function LoadingScreen({ market, onComplete }: Props) {
  const [loadPct, setLoadPct] = useState(0);

  useEffect(() => {
    setLoadPct(0);
    let pct = 0;
    const iv = setInterval(() => {
      pct += 2;
      setLoadPct(Math.min(pct, 100));
      if (pct >= 100) {
        clearInterval(iv);
        setTimeout(onComplete, 300);
      }
    }, 40);
    return () => clearInterval(iv);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div style={{ paddingTop: 40, textAlign: 'center' }}>
      <p style={{ fontSize: 13, color: '#7a6e64', marginBottom: 6 }}>
        Calculating your runway estimate for{' '}
        <strong style={{ color: '#3D3025' }}>{MARKET_LABEL[market] ?? 'Colorado'}</strong>
        {' '}...
      </p>
      <div style={{ width: '100%', height: 6, background: 'rgba(196,154,42,0.25)', borderRadius: 3, margin: '24px 0 20px', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${loadPct}%`, background: '#C49A2A', borderRadius: 3, transition: 'width 0.1s linear' }} />
      </div>
      <p style={{ fontSize: 12, color: '#7a6e64', lineHeight: 1.6, maxWidth: 340, margin: '0 auto' }}>
        Comparing advertised rates against what families in your situation pay, and projecting how long the money is likely to last.
      </p>
    </div>
  );
}
