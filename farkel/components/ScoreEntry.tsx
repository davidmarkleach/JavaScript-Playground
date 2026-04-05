'use client';

import { useState } from 'react';
import Tooltip from './Tooltip';
import { Player } from '../lib/types';
import { validateScoreEntry } from '../lib/game-logic';

interface ScoreEntryProps {
  players: Player[];
  currentIndex: number;
  onAddScore: (points: number) => void;
  onFarkel: () => void;
  onSkip: () => void;
  onPrevPlayer: () => void;
  onNextPlayer: () => void;
  onSelectPlayer: (index: number) => void;
  onToast: (msg: string) => void;
}

const QUICK_SCORES = [50, 100, 200, 300, 500, 1000, 1500];

export default function ScoreEntry({
  players,
  currentIndex,
  onAddScore,
  onFarkel,
  onSkip,
  onPrevPlayer,
  onNextPlayer,
  onToast,
}: ScoreEntryProps) {
  const [inputValue, setInputValue] = useState('');

  const currentPlayer = players[currentIndex];

  const handleQuick = (pts: number) => {
    setInputValue(String(pts));
  };

  const handleSubmit = () => {
    const pts = parseInt(inputValue, 10);
    const err = validateScoreEntry(pts, currentPlayer);
    if (err) {
      onToast(err);
      return;
    }
    onAddScore(pts);
    setInputValue('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSubmit();
  };

  return (
    <div
      style={{
        background: '#1a1d27',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: '10px',
        padding: '1rem',
        marginBottom: '1rem',
      }}
    >
      {/* Player navigation row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '0.85rem',
          gap: '0.5rem',
        }}
      >
        <button
          onClick={onPrevPlayer}
          style={navBtnStyle}
          aria-label="Previous player"
        >
          ◀
        </button>
        <div style={{ flex: 1, textAlign: 'center' }}>
          <div
            style={{
              fontFamily: 'Bebas Neue, sans-serif',
              fontSize: '1.3rem',
              color: '#ff4d4d',
              letterSpacing: '0.05em',
            }}
          >
            {currentPlayer?.name}
          </div>
          <div
            style={{
              fontFamily: 'Barlow, sans-serif',
              fontSize: '0.7rem',
              color: '#6b7084',
            }}
          >
            {currentPlayer?.inGame
              ? `Score: ${currentPlayer.score.toLocaleString()}`
              : 'Needs 500 to enter'}
          </div>
        </div>
        <button
          onClick={onNextPlayer}
          style={navBtnStyle}
          aria-label="Next player"
        >
          ▶
        </button>
        <Tooltip content="Skip this player's turn without scoring. The turn is logged and play advances.">
          <button onClick={onSkip} style={skipBtnStyle}>
            Skip Turn
          </button>
        </Tooltip>
      </div>

      {/* Quick score buttons */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.4rem',
          marginBottom: '0.75rem',
        }}
      >
        {QUICK_SCORES.map((pts) => (
          <button
            key={pts}
            onClick={() => handleQuick(pts)}
            style={quickBtnStyle}
          >
            +{pts}
          </button>
        ))}
      </div>

      {/* Score input */}
      <input
        type="number"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Enter score…"
        min={0}
        style={{
          width: '100%',
          background: '#242836',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '6px',
          color: '#e8e8ec',
          fontFamily: 'Bebas Neue, sans-serif',
          fontSize: '1.6rem',
          textAlign: 'center',
          padding: '0.5rem',
          outline: 'none',
          marginBottom: '0.75rem',
          boxSizing: 'border-box',
          letterSpacing: '0.05em',
        }}
      />

      {/* Action buttons */}
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <Tooltip content="No scoring dice this roll? Lose all points accumulated this turn and pass the dice to the next player.">
          <button
            onClick={onFarkel}
            style={{
              ...actionBtnBase,
              background: 'rgba(239,68,68,0.15)',
              border: '1px solid rgba(239,68,68,0.5)',
              color: '#ef4444',
              flex: 1,
            }}
          >
            Farkel!
          </button>
        </Tooltip>
        <Tooltip content="Add the entered score to the current player's total and advance to the next player.">
          <button
            onClick={handleSubmit}
            style={{
              ...actionBtnBase,
              background: 'rgba(52,211,153,0.15)',
              border: '1px solid rgba(52,211,153,0.5)',
              color: '#34d399',
              flex: 2,
            }}
          >
            Add Score
          </button>
        </Tooltip>
      </div>
    </div>
  );
}

const navBtnStyle: React.CSSProperties = {
  background: '#242836',
  border: '1px solid rgba(255,255,255,0.1)',
  color: '#e8e8ec',
  borderRadius: '6px',
  width: '2.5rem',
  height: '2.5rem',
  minWidth: '44px',
  minHeight: '44px',
  cursor: 'pointer',
  fontFamily: 'Barlow, sans-serif',
  fontSize: '1rem',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
  transition: 'background 0.15s',
};

const skipBtnStyle: React.CSSProperties = {
  background: '#242836',
  border: '1px solid rgba(255,255,255,0.1)',
  color: '#6b7084',
  borderRadius: '6px',
  padding: '0 0.75rem',
  height: '2.5rem',
  minHeight: '44px',
  cursor: 'pointer',
  fontFamily: 'Barlow, sans-serif',
  fontWeight: 700,
  fontSize: '0.75rem',
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
  flexShrink: 0,
  transition: 'all 0.15s',
};

const quickBtnStyle: React.CSSProperties = {
  background: '#242836',
  border: '1px solid rgba(255,255,255,0.08)',
  color: '#e8e8ec',
  borderRadius: '5px',
  padding: '0.35rem 0.6rem',
  minHeight: '36px',
  cursor: 'pointer',
  fontFamily: 'Barlow, sans-serif',
  fontWeight: 600,
  fontSize: '0.8rem',
  transition: 'all 0.15s',
};

const actionBtnBase: React.CSSProperties = {
  padding: '0.65rem 1rem',
  minHeight: '44px',
  borderRadius: '7px',
  cursor: 'pointer',
  fontFamily: 'Barlow, sans-serif',
  fontWeight: 700,
  fontSize: '0.9rem',
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  transition: 'all 0.15s',
  display: 'inline-block',
  textAlign: 'center',
  width: '100%',
};
