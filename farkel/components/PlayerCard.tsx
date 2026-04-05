'use client';

import { Player } from '../lib/types';

interface PlayerCardProps {
  player: Player;
  isCurrent: boolean;
  isWinner: boolean;
  isMaster: boolean;
  gameOver: boolean;
  onClick?: () => void;
}

export default function PlayerCard({
  player,
  isCurrent,
  isWinner,
  isMaster,
  gameOver,
  onClick,
}: PlayerCardProps) {
  const isClickable = isMaster && !gameOver && onClick;

  let borderColor = 'rgba(255,255,255,0.04)';
  let boxShadow = 'none';
  let leftBorderColor = 'transparent';

  if (isWinner && gameOver) {
    leftBorderColor = '#ffd700';
    boxShadow = '0 0 16px rgba(255,215,0,0.25)';
    borderColor = 'rgba(255,215,0,0.2)';
  } else if (isCurrent) {
    leftBorderColor = '#ff4d4d';
    boxShadow = '0 0 16px rgba(255,77,77,0.2)';
    borderColor = 'rgba(255,77,77,0.15)';
  }

  return (
    <div
      onClick={isClickable ? onClick : undefined}
      style={{
        background: '#1a1d27',
        border: `1px solid ${borderColor}`,
        borderLeft: `3px solid ${leftBorderColor}`,
        borderRadius: '8px',
        padding: '0.85rem 1rem',
        marginBottom: '0.5rem',
        cursor: isClickable ? 'pointer' : 'default',
        boxShadow,
        transition: 'all 0.2s ease',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '0.5rem',
      }}
      onMouseEnter={(e) => {
        if (isClickable) {
          (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255,77,77,0.35)';
          (e.currentTarget as HTMLDivElement).style.transform = 'translateX(2px)';
        }
      }}
      onMouseLeave={(e) => {
        if (isClickable) {
          (e.currentTarget as HTMLDivElement).style.borderColor = borderColor;
          (e.currentTarget as HTMLDivElement).style.transform = 'translateX(0)';
        }
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontFamily: 'Bebas Neue, sans-serif',
            fontSize: '1.2rem',
            color: isWinner && gameOver ? '#ffd700' : isCurrent ? '#ff4d4d' : '#e8e8ec',
            letterSpacing: '0.05em',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {isWinner && gameOver && '🏆 '}{player.name}
        </div>
        <div
          style={{
            fontFamily: 'Barlow, sans-serif',
            fontSize: '0.72rem',
            color: player.inGame ? '#34d399' : '#6b7084',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginTop: '0.1rem',
          }}
        >
          {player.inGame
            ? (isCurrent && !gameOver ? 'Rolling…' : 'In game')
            : 'Need 500 to enter'}
        </div>
      </div>
      <div
        style={{
          fontFamily: 'Bebas Neue, sans-serif',
          fontSize: '1.6rem',
          color: isWinner && gameOver ? '#ffd700' : '#e8e8ec',
          letterSpacing: '0.03em',
          flexShrink: 0,
        }}
      >
        {player.score.toLocaleString()}
      </div>
    </div>
  );
}
