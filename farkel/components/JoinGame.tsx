'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase, GAMES_TABLE } from '../lib/supabase';

export default function JoinGame() {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleJoin = async () => {
    const trimmed = code.trim().toUpperCase();
    if (trimmed.length !== 4) {
      setError('Please enter a 4-character game code.');
      return;
    }

    setLoading(true);
    setError('');

    const { data, error: fetchError } = await supabase
      .from(GAMES_TABLE)
      .select('code')
      .eq('code', trimmed)
      .single();

    if (fetchError || !data) {
      setError('Game not found. Check the code and try again.');
      setLoading(false);
      return;
    }

    router.push(`/game/${trimmed}`);
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleJoin();
  };

  return (
    <div>
      <input
        type="text"
        value={code}
        onChange={(e) => setCode(e.target.value.toUpperCase().slice(0, 4))}
        onKeyDown={handleKey}
        placeholder="XXXX"
        maxLength={4}
        style={{
          width: '100%',
          background: '#242836',
          border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: '8px',
          color: '#ffd700',
          fontFamily: 'Bebas Neue, sans-serif',
          fontSize: '2.5rem',
          textAlign: 'center',
          letterSpacing: '0.3em',
          padding: '0.5rem',
          outline: 'none',
          marginBottom: '0.75rem',
          boxSizing: 'border-box',
          minHeight: '64px',
        }}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="characters"
        spellCheck={false}
      />

      {error && (
        <div
          style={{
            color: '#ef4444',
            fontFamily: 'Barlow, sans-serif',
            fontSize: '0.8rem',
            marginBottom: '0.5rem',
          }}
        >
          {error}
        </div>
      )}

      <button
        onClick={handleJoin}
        disabled={loading}
        style={{
          background: 'rgba(52,211,153,0.15)',
          border: '1px solid rgba(52,211,153,0.5)',
          color: '#34d399',
          borderRadius: '7px',
          padding: '0.7rem',
          width: '100%',
          minHeight: '48px',
          cursor: loading ? 'not-allowed' : 'pointer',
          fontFamily: 'Barlow, sans-serif',
          fontWeight: 700,
          fontSize: '0.95rem',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          transition: 'all 0.15s',
          opacity: loading ? 0.6 : 1,
        }}
      >
        {loading ? 'Joining…' : 'Join Game'}
      </button>
    </div>
  );
}
