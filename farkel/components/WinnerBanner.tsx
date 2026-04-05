'use client';

import { Player } from '../lib/types';
import { getWinner } from '../lib/game-logic';

interface WinnerBannerProps {
  players: Player[];
}

export default function WinnerBanner({ players }: WinnerBannerProps) {
  const winner = getWinner(players);
  if (!winner) return null;

  return (
    <div
      style={{
        background: 'rgba(255,215,0,0.08)',
        border: '2px solid #ffd700',
        borderRadius: '12px',
        padding: '1.25rem',
        textAlign: 'center',
        marginBottom: '1rem',
        boxShadow: '0 0 32px rgba(255,215,0,0.2)',
      }}
    >
      <div style={{ fontSize: '3rem', marginBottom: '0.25rem' }}>🏆</div>
      <div
        style={{
          fontFamily: 'Bebas Neue, sans-serif',
          fontSize: '2rem',
          color: '#ffd700',
          letterSpacing: '0.06em',
          marginBottom: '0.25rem',
        }}
      >
        {winner.name} Wins!
      </div>
      <div
        style={{
          fontFamily: 'Barlow, sans-serif',
          fontSize: '0.9rem',
          color: '#e8e8ec',
          fontWeight: 600,
        }}
      >
        Final score: {winner.score.toLocaleString()} pts
      </div>
    </div>
  );
}
