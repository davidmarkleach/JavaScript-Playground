export interface Player {
  name: string;
  score: number;
  inGame: boolean;
}

export interface LogEntry {
  type: 'score' | 'farkel' | 'skip' | 'undo';
  player: string;
  points?: number;
  total?: number;
  timestamp?: string;
}

export interface GameState {
  code: string;
  players: Player[];
  current_player_index: number;
  log: LogEntry[];
  final_round: boolean;
  final_round_trigger_index: number;
  game_over: boolean;
  turns_taken_in_final_round: number;
  created_at?: string;
  updated_at?: string;
}
