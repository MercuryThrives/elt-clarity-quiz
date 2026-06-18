'use client';
import React from 'react';
import type { CSSProperties } from 'react';
import { ctaBtnStyle } from './styles';

interface Props {
  firstName: string;
  email: string;
  onFirstNameChange: (v: string) => void;
  onEmailChange: (v: string) => void;
  submitting: boolean;
  error: string | null;
  onSubmit: () => void;
}

export default function GateScreen({
  firstName,
  email,
  onFirstNameChange,
  onEmailChange,
  submitting,
  error,
  onSubmit,
}: Props) {
  const gateValid =
    firstName.trim().length > 0 &&
    email.trim().includes('@') &&
    email.trim().length > 3;

  const inputStyle: CSSProperties = {
    width: '100%',
    padding: '10px 13px',
    border: '1px solid #C4A882',
    borderRadius: 6,
    fontSize: 14,
    fontFamily: "'Open Sans', sans-serif",
    color: '#3D3025',
    background: '#fff',
    outline: 'none',
    boxSizing: 'border-box',
  };

  return (
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
          onChange={e => onFirstNameChange(e.target.value)}
          placeholder="Your first name"
          style={inputStyle}
        />
      </div>

      <div style={{ marginBottom: 20 }}>
        <label style={{ display: 'block', fontWeight: 600, fontSize: 13, color: '#3D3025', marginBottom: 7 }}>
          Email address
        </label>
        <input
          type="email"
          value={email}
          onChange={e => onEmailChange(e.target.value)}
          placeholder="your@email.com"
          style={inputStyle}
        />
      </div>

      <p style={{ fontSize: 12, color: '#7a6e64', textAlign: 'center', marginBottom: 14 }}>
        I work with a small number of families each month. If the estimate raises questions, the 20-minute call is the right next step.
      </p>

      <button
        style={ctaBtnStyle(!gateValid || submitting)}
        disabled={!gateValid || submitting}
        onClick={onSubmit}
      >
        {submitting ? 'Sending...' : 'Show my runway estimate →'}
      </button>

      {error && (
        <p style={{ color: '#5D0E0E', fontSize: 13, marginTop: 8, textAlign: 'center' }}>
          {error}
        </p>
      )}

      <p style={{ textAlign: 'center', fontSize: 11, color: '#7a6e64', marginTop: 11, lineHeight: 1.5 }}>
        No spam. The Senior Care Savings Optimizer is a flat-fee service paid directly by families. No referral fee from any community.
      </p>
    </div>
  );
}
