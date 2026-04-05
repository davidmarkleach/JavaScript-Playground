'use client';

import { useState } from 'react';

const SCORING_ROWS = [
  ['1s (per die)', '100 pts'],
  ['5s (per die)', '50 pts'],
  ['Three 1s', '300 pts'],
  ['Three 2s', '200 pts'],
  ['Three 3s', '300 pts'],
  ['Three 4s', '400 pts'],
  ['Three 5s', '500 pts'],
  ['Three 6s', '600 pts'],
  ['Four of a kind', '1,000 pts'],
  ['Five of a kind', '2,000 pts'],
  ['Six of a kind', '3,000 pts'],
  ['Three Pairs', '1,500 pts'],
  ['Two Triplets', '2,500 pts'],
  ['Straight (1–6)', '1,500 pts'],
];

export default function ScoringReference() {
  const [open, setOpen] = useState(false);

  return (
    <div
      style={{
        background: '#1a1d27',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: '10px',
        marginBottom: '1rem',
        overflow: 'hidden',
      }}
    >
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          width: '100%',
          background: 'transparent',
          border: 'none',
          color: '#6b7084',
          padding: '0.75rem 1rem',
          cursor: 'pointer',
          fontFamily: 'Barlow, sans-serif',
          fontWeight: 600,
          fontSize: '0.82rem',
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
          textAlign: 'left',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          minHeight: '44px',
        }}
      >
        Scoring Reference
        <span style={{ transition: 'transform 0.2s', display: 'inline-block', transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}>
          ▾
        </span>
      </button>
      {open && (
        <div style={{ padding: '0 0.85rem 0.85rem' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '0.2rem 0.75rem',
            }}
          >
            {SCORING_ROWS.map(([label, value]) => (
              <>
                <div
                  key={`l-${label}`}
                  style={{
                    fontFamily: 'Barlow, sans-serif',
                    fontSize: '0.78rem',
                    color: '#e8e8ec',
                    padding: '0.2rem 0',
                    borderBottom: '1px solid rgba(255,255,255,0.04)',
                  }}
                >
                  {label}
                </div>
                <div
                  key={`v-${label}`}
                  style={{
                    fontFamily: 'Barlow, sans-serif',
                    fontSize: '0.78rem',
                    color: '#ffd700',
                    fontWeight: 600,
                    padding: '0.2rem 0',
                    borderBottom: '1px solid rgba(255,255,255,0.04)',
                    textAlign: 'right',
                  }}
                >
                  {value}
                </div>
              </>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
