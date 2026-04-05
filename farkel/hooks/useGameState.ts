'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase, GAMES_TABLE } from '../lib/supabase';
import { GameState } from '../lib/types';

export function useGameState(code: string) {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const stateRef = useRef<GameState | null>(null);

  useEffect(() => {
    stateRef.current = gameState;
  }, [gameState]);

  const fetchGame = useCallback(async () => {
    const { data, error: fetchError } = await supabase
      .from(GAMES_TABLE)
      .select('*')
      .eq('code', code.toUpperCase())
      .single();

    if (fetchError) {
      setError('Game not found.');
      setLoading(false);
      return;
    }

    setGameState(data as GameState);
    setLoading(false);
  }, [code]);

  useEffect(() => {
    fetchGame();
  }, [fetchGame]);

  const updateGame = useCallback(async (newState: GameState) => {
    setGameState(newState);
    const { error: updateError } = await supabase
      .from(GAMES_TABLE)
      .update({
        players: newState.players,
        current_player_index: newState.current_player_index,
        log: newState.log,
        final_round: newState.final_round,
        final_round_trigger_index: newState.final_round_trigger_index,
        game_over: newState.game_over,
        turns_taken_in_final_round: newState.turns_taken_in_final_round,
        updated_at: new Date().toISOString(),
      })
      .eq('code', code.toUpperCase());

    if (updateError) {
      console.error('Failed to update game:', updateError);
    }
  }, [code]);

  const deleteGame = useCallback(async () => {
    await supabase.from(GAMES_TABLE).delete().eq('code', code.toUpperCase());
  }, [code]);

  return { gameState, loading, error, updateGame, deleteGame, refetch: fetchGame };
}
