import { GameState, Player, LogEntry } from './types';

const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

export function generateCode(): string {
  let code = '';
  for (let i = 0; i < 4; i++) {
    code += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)];
  }
  return code;
}

export function validateScoreEntry(
  value: number,
  player: Player
): string | null {
  if (!Number.isInteger(value) || value <= 0) {
    return 'Score must be a positive whole number.';
  }
  if (!player.inGame && value < 500) {
    return `${player.name} needs 500+ points to enter the game.`;
  }
  return null;
}

export function addScore(state: GameState, points: number): GameState {
  const players = state.players.map((p, i) => {
    if (i !== state.current_player_index) return p;
    const newScore = p.score + points;
    return {
      ...p,
      score: newScore,
      inGame: true,
    };
  });

  const currentPlayer = state.players[state.current_player_index];
  const newScore = currentPlayer.score + points;

  const logEntry: LogEntry = {
    type: 'score',
    player: currentPlayer.name,
    points,
    total: newScore,
    timestamp: new Date().toISOString(),
  };

  // Check for win condition (10000+)
  let final_round = state.final_round;
  let final_round_trigger_index = state.final_round_trigger_index;
  let turns_taken = state.turns_taken_in_final_round;

  if (!state.final_round && newScore >= 10000) {
    final_round = true;
    final_round_trigger_index = state.current_player_index;
  }

  // Advance to next player
  const nextIndex = getNextPlayerIndex(state.current_player_index, players.length);

  let game_over = state.game_over;
  if (final_round) {
    if (nextIndex === final_round_trigger_index) {
      // We've gone all the way around — game over
      game_over = true;
    } else {
      turns_taken += 1;
    }
  }

  return {
    ...state,
    players,
    current_player_index: game_over ? state.current_player_index : nextIndex,
    log: [logEntry, ...state.log].slice(0, 30),
    final_round,
    final_round_trigger_index,
    game_over,
    turns_taken_in_final_round: turns_taken,
    updated_at: new Date().toISOString(),
  };
}

export function farkel(state: GameState): GameState {
  const currentPlayer = state.players[state.current_player_index];

  const logEntry: LogEntry = {
    type: 'farkel',
    player: currentPlayer.name,
    total: currentPlayer.score,
    timestamp: new Date().toISOString(),
  };

  const nextIndex = getNextPlayerIndex(state.current_player_index, state.players.length);

  let game_over = state.game_over;
  let turns_taken = state.turns_taken_in_final_round;

  if (state.final_round) {
    if (nextIndex === state.final_round_trigger_index) {
      game_over = true;
    } else {
      turns_taken += 1;
    }
  }

  return {
    ...state,
    current_player_index: game_over ? state.current_player_index : nextIndex,
    log: [logEntry, ...state.log].slice(0, 30),
    game_over,
    turns_taken_in_final_round: turns_taken,
    updated_at: new Date().toISOString(),
  };
}

export function skipTurn(state: GameState): GameState {
  const currentPlayer = state.players[state.current_player_index];

  const logEntry: LogEntry = {
    type: 'skip',
    player: currentPlayer.name,
    total: currentPlayer.score,
    timestamp: new Date().toISOString(),
  };

  const nextIndex = getNextPlayerIndex(state.current_player_index, state.players.length);

  let game_over = state.game_over;
  let turns_taken = state.turns_taken_in_final_round;

  if (state.final_round) {
    if (nextIndex === state.final_round_trigger_index) {
      game_over = true;
    } else {
      turns_taken += 1;
    }
  }

  return {
    ...state,
    current_player_index: game_over ? state.current_player_index : nextIndex,
    log: [logEntry, ...state.log].slice(0, 30),
    game_over,
    turns_taken_in_final_round: turns_taken,
    updated_at: new Date().toISOString(),
  };
}

export function undoLast(state: GameState): GameState {
  if (state.log.length === 0) return state;

  const [lastEntry, ...remainingLog] = state.log;

  if (lastEntry.type === 'score') {
    const players = state.players.map((p) => {
      if (p.name !== lastEntry.player) return p;
      const newScore = p.score - (lastEntry.points ?? 0);
      // Determine inGame status: if score drops to 0 or less, they're not in game
      return {
        ...p,
        score: Math.max(0, newScore),
        inGame: newScore >= 500 ? p.inGame : false,
      };
    });

    // Find the index of the player who had the last action
    const prevIndex = state.players.findIndex((p) => p.name === lastEntry.player);

    // Undo final round trigger if applicable
    const undidScore = (lastEntry.points ?? 0);
    const playerScoreBeforeUndo = state.players.find(p => p.name === lastEntry.player)?.score ?? 0;
    const scoreAfterUndo = playerScoreBeforeUndo - undidScore;

    let final_round = state.final_round;
    let final_round_trigger_index = state.final_round_trigger_index;
    let turns_taken = state.turns_taken_in_final_round;

    if (state.final_round && scoreAfterUndo < 10000 && final_round_trigger_index === prevIndex) {
      final_round = false;
      final_round_trigger_index = -1;
      turns_taken = 0;
    }

    return {
      ...state,
      players,
      current_player_index: prevIndex,
      log: remainingLog,
      final_round,
      final_round_trigger_index,
      game_over: false,
      turns_taken_in_final_round: turns_taken,
      updated_at: new Date().toISOString(),
    };
  }

  if (lastEntry.type === 'farkel' || lastEntry.type === 'skip') {
    const prevIndex = state.players.findIndex((p) => p.name === lastEntry.player);

    let turns_taken = state.turns_taken_in_final_round;
    if (state.final_round && turns_taken > 0) {
      turns_taken -= 1;
    }

    return {
      ...state,
      current_player_index: prevIndex,
      log: remainingLog,
      game_over: false,
      turns_taken_in_final_round: turns_taken,
      updated_at: new Date().toISOString(),
    };
  }

  return state;
}

export function getWinner(players: Player[]): Player | null {
  if (players.length === 0) return null;
  const maxScore = Math.max(...players.map((p) => p.score));
  return players.find((p) => p.score === maxScore) ?? null;
}

function getNextPlayerIndex(current: number, total: number): number {
  return (current + 1) % total;
}

export function getSortedPlayers(players: Player[]): { player: Player; originalIndex: number }[] {
  return players
    .map((player, originalIndex) => ({ player, originalIndex }))
    .sort((a, b) => b.player.score - a.player.score);
}
