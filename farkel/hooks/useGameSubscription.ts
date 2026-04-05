'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase, GAMES_TABLE } from '../lib/supabase';
import { GameState } from '../lib/types';

export function useGameSubscription(code: string) {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [gameDeleted, setGameDeleted] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastUpdateRef = useRef<number>(Date.now());

  const fetchGame = useCallback(async () => {
    const { data, error: fetchError } = await supabase
      .from(GAMES_TABLE)
      .select('*')
      .eq('code', code.toUpperCase())
      .single();

    if (fetchError) {
      if (gameState !== null) {
        setGameDeleted(true);
      } else {
        setError('Game not found.');
      }
      setLoading(false);
      return null;
    }

    setGameState(data as GameState);
    setLastSync(new Date());
    lastUpdateRef.current = Date.now();
    setLoading(false);
    return data as GameState;
  }, [code, gameState]);

  useEffect(() => {
    fetchGame();

    // Supabase Realtime subscription
    const channel = supabase
      .channel(`game-${code}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: GAMES_TABLE,
          filter: `code=eq.${code.toUpperCase()}`,
        },
        (payload) => {
          if (payload.eventType === 'DELETE') {
            setGameDeleted(true);
            return;
          }
          if (payload.new) {
            setGameState(payload.new as GameState);
            setLastSync(new Date());
            lastUpdateRef.current = Date.now();
          }
        }
      )
      .subscribe();

    // Fallback polling every 5s
    pollRef.current = setInterval(() => {
      fetchGame();
    }, 5000);

    return () => {
      supabase.removeChannel(channel);
      if (pollRef.current) clearInterval(pollRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code]);

  return { gameState, loading, error, lastSync, gameDeleted };
}
