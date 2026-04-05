'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase, GAMES_TABLE } from '../lib/supabase';
import { generateCode } from '../lib/game-logic';
import { GameState } from '../lib/types';

export default function CreateGame() {
  const router = useRouter();
  const [playerNames, setPlayerNames] = useState(['', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const addPlayer = () => {
    if (playerNames.length < 6) setPlayerNames([...playerNames, '']);
  };

  const removePlayer = (i: number) => {
    if (playerNames.length <= 2) return;
    setPlayerNames(playerNames.filter((_, idx) => idx !== i));
  };

  const updateName = (i: number, val: string) => {
    const updated = [...playerNames];
    updated[i] = val;
    setPlayerNames(updated);
  };

  const handleCreate = async () => {
    const names = playerNames.map((n) => n.trim()).filter(Boolean);
    if (names.length < 2) {
      setError('Please enter at least 2 player names.');
      return;
    }
    if (new Set(names.map((n) => n.toLowerCase())).size !== names.length) {
      setError('Player names must be unique.');
      return;
    }

    setLoading(true);
    setError('');

    // Generate unique code
    let code = '';
    let attempts = 0;
    while (attempts < 10) {
      code = generateCode();
      const { data } = await supabase
        .from(GAMES_TABLE)
        .select('code')
        .eq('code', code)
        .single();
      if (!data) break;
      attempts++;
    }

    const gameState: GameState = {
      code,
      players: names.map((name) => ({ name, score: 0, inGame: false })),
      current_player_index: 0,
      log: [],
      final_round: false,
      final_round_trigger_index: -1,
      game_over: false,
      turns_taken_in_final_round: 0,
    };

    const { error: insertError } = await supabase
      .from(GAMES_TABLE)
      .insert(gameState);

    if (insertError) {
      setError('Failed to create game. Please try again.');
      setLoading(false);
      return;
    }

    // Store master token in localStorage
    localStorage.setItem(`farkel_master_${code}`, 'true');
    router.push(`/game/${code}?master=1`);
  };

  return (
    <div>
      <div style={{ marginBottom: '0.75rem' }}>
        {playerNames.map((name, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '0.5rem',
            }}
          >
            <input
              type="text"
              value={name}
              onChange={(e) => updateName(i, e.target.value)}
              placeholder={`Player ${i + 1}`}
              maxLength={20}
              style={inputStyle}
            />
            {playerNames.length > 2 && (
              <button
                onClick={() => removePlayer(i)}
                aria-label="Remove player"
                style={removeStyle}
              >
                ×
              </button>
            )}
          </div>
        ))}
      </div>

      {playerNames.length < 6 && (
        <button onClick={addPlayer} style={addStyle}>
          + Add Player
        </button>
      )}

      {error && (
        <div
          style={{
            color: '#ef4444',
            fontFamily: 'Barlow, sans-serif',
            fontSize: '0.8rem',
            marginTop: '0.5rem',
          }}
        >
          {error}
        </div>
      )}

      <button
        onClick={handleCreate}
        disabled={loading}
        style={{
          ...createStyle,
          opacity: loading ? 0.6 : 1,
          cursor: loading ? 'not-allowed' : 'pointer',
        }}
      >
        {loading ? 'Creating…' : 'Create Game'}
      </button>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  flex: 1,
  background: '#242836',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '6px',
  color: '#e8e8ec',
  fontFamily: 'Barlow, sans-serif',
  fontSize: '1rem',
  padding: '0.55rem 0.75rem',
  outline: 'none',
  minHeight: '44px',
};

const removeStyle: React.CSSProperties = {
  background: 'rgba(239,68,68,0.12)',
  border: '1px solid rgba(239,68,68,0.3)',
  color: '#ef4444',
  borderRadius: '5px',
  width: '32px',
  height: '44px',
  cursor: 'pointer',
  fontSize: '1.2rem',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
};

const addStyle: React.CSSProperties = {
  background: 'transparent',
  border: '1px dashed rgba(255,255,255,0.15)',
  color: '#6b7084',
  borderRadius: '6px',
  padding: '0.45rem 1rem',
  cursor: 'pointer',
  fontFamily: 'Barlow, sans-serif',
  fontWeight: 600,
  fontSize: '0.82rem',
  width: '100%',
  minHeight: '40px',
  marginBottom: '0.75rem',
  transition: 'all 0.15s',
};

const createStyle: React.CSSProperties = {
  background: 'rgba(255,77,77,0.15)',
  border: '1px solid rgba(255,77,77,0.5)',
  color: '#ff4d4d',
  borderRadius: '7px',
  padding: '0.7rem',
  width: '100%',
  minHeight: '48px',
  marginTop: '0.5rem',
  fontFamily: 'Barlow, sans-serif',
  fontWeight: 700,
  fontSize: '0.95rem',
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  transition: 'all 0.15s',
};
