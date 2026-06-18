import type { CSSProperties } from 'react';

export function optBtnStyle(selected: boolean): CSSProperties {
  return {
    padding: '9px 12px',
    borderRadius: 6,
    cursor: 'pointer',
    textAlign: 'left',
    border: `2px solid ${selected ? '#5D0E0E' : '#C4A882'}`,
    background: selected ? '#5D0E0E' : '#fff',
    color: selected ? '#fff' : '#3D3025',
    fontFamily: "'Open Sans', sans-serif",
    fontSize: 13,
    lineHeight: '1.35',
    width: '100%',
    transition: 'all 0.1s',
  };
}

export function ctaBtnStyle(disabled: boolean): CSSProperties {
  return {
    width: '100%',
    padding: 13,
    borderRadius: 6,
    border: 'none',
    cursor: disabled ? 'not-allowed' : 'pointer',
    background: disabled ? '#ccc' : '#C49A2A',
    color: disabled ? '#999' : '#3D3025',
    fontFamily: "'Open Sans', sans-serif",
    fontWeight: 600,
    fontSize: 14,
  };
}
