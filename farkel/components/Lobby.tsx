'use client';

import { useState } from 'react';
import CreateGame from './CreateGame';
import JoinGame from './JoinGame';

type Panel = null | 'create' | 'join';

export default function Lobby() {
  const [active, setActive] = useState<Panel>(null);

  return (
    <div>
      <div
        style={{
          fontFamily: 'Bebas Neue, sans-serif',
          fontSize: '3rem',
          color: '#ff4d4d',
          letterSpacing: '0.1em',
          textAlign: 'center',
          marginBottom: '0.25rem',
        }}
      >
        Farkel
      </div>
      <div
        style={{
          fontFamily: 'Barlow, sans-serif',
          fontSize: '0.85rem',
          color: '#6b7084',
          textAlign: 'center',
          marginBottom: '2rem',
        }}
      >
        Multiplayer 6-Dice Scorekeeper
      </div>

      {/* Create Game Card */}
      <div
        style={{
          background: '#1a1d27',
          border: `1px solid ${active === 'create' ? 'rgba(255,77,77,0.35)' : 'rgba(255,255,255,0.06)'}`,
          borderRadius: '10px',
          padding: '1rem',
          marginBottom: '0.85rem',
          transition: 'border-color 0.2s',
          cursor: active === 'create' ? 'default' : 'pointer',
        }}
        onClick={() => active !== 'create' && setActive('create')}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: active === 'create' ? '1rem' : 0,
          }}
        >
          <div
            style={{
              fontFamily: 'Bebas Neue, sans-serif',
              fontSize: '1.3rem',
              color: active === 'create' ? '#ff4d4d' : '#e8e8ec',
              letterSpacing: '0.05em',
            }}
          >
            Create Game
          </div>
          <span style={{ color: '#6b7084', fontSize: '0.8rem', fontFamily: 'Barlow, sans-serif' }}>
            {active === 'create' ? '▲' : '▼'}
          </span>
        </div>
        {active === 'create' && <CreateGame />}
      </div>

      {/* Join Game Card */}
      <div
        style={{
          background: '#1a1d27',
          border: `1px solid ${active === 'join' ? 'rgba(52,211,153,0.35)' : 'rgba(255,255,255,0.06)'}`,
          borderRadius: '10px',
          padding: '1rem',
          transition: 'border-color 0.2s',
          cursor: active === 'join' ? 'default' : 'pointer',
        }}
        onClick={() => active !== 'join' && setActive('join')}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: active === 'join' ? '1rem' : 0,
          }}
        >
          <div
            style={{
              fontFamily: 'Bebas Neue, sans-serif',
              fontSize: '1.3rem',
              color: active === 'join' ? '#34d399' : '#e8e8ec',
              letterSpacing: '0.05em',
            }}
          >
            Join Game
          </div>
          <span style={{ color: '#6b7084', fontSize: '0.8rem', fontFamily: 'Barlow, sans-serif' }}>
            {active === 'join' ? '▲' : '▼'}
          </span>
        </div>
        {active === 'join' && <JoinGame />}
      </div>
    </div>
  );
}
