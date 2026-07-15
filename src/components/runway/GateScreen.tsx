'use client';
import React from 'react';
import type { CSSProperties } from 'react';
import { ctaBtnStyle } from './styles';

interface Props {
  firstName: string;
  email: string;
  honeypot: string;
  onFirstNameChange: (v: string) => void;
  onEmailChange: (v: string) => void;
  onHoneypotChange: (v: string) => void;
  submitting: boolean;
  error: string | null;
  onSubmit: () => void;
}

export default function GateScreen({
  firstName,
  email,
  honeypot,
  onFirstNameChange,
  onEmailChange,
  onHoneypotChange,
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

      {/* Honeypot: off-screen, not in tab order, no visible label — real users never see or fill this */}
      <div style={{ position: 'absolute', left: '-9999px', top: '-9999px', height: 0, width: 0, overflow: 'hidden' }} aria-hidden="true">
        <input
          type="text"
          name="company"
          tabIndex={-1}
          autoComplete="off"
          value={honeypot}
          onChange={e => onHoneypotChange(e.target.value)}
        />
      </div>

      <button
        style={ctaBtnStyle(!gateValid || submitting)}
        disabled={!gateValid || submitting}
        onClick={onSubmit}
      >
        {submitting ? 'Sending...' : 'Show my runway estimate →'}
      </button>

      {error && (
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 8,
            background: '#FBEEEE',
            border: '1px solid #D9A0A0',
            borderRadius: 6,
            padding: '10px 12px',
            marginTop: 10,
          }}
        >
          <span style={{ fontSize: 15, lineHeight: 1, flexShrink: 0 }} aria-hidden="true">⚠️</span>
          <p style={{ color: '#5D0E0E', fontSize: 13, fontWeight: 600, lineHeight: 1.45, margin: 0 }}>
            {error}
          </p>
        </div>
      )}

      <p style={{ textAlign: 'center', fontSize: 11, color: '#7a6e64', marginTop: 11, lineHeight: 1.5 }}>
        No spam. The Care Cost Runway Review is a flat-fee service paid directly by families. No referral fee from any community.
      </p>
    </div>
  );
}
