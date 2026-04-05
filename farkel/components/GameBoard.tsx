'use client';

import { useCallback, useState, useEffect } from 'react';
import { GameState } from '../lib/types';
import {
  addScore,
  farkel,
  skipTurn,
  undoLast,
  getSortedPlayers,
  getWinner,
} from '../lib/game-logic';
import PlayerCard from './PlayerCard';
import ScoreEntry from './ScoreEntry';
import TurnLog from './TurnLog';
import ScoringReference from './ScoringReference';
import WinnerBanner from './WinnerBanner';
import GameCodeDisplay from './GameCodeDisplay';
import Toast from './Toast';

interface GameBoardProps {
  initialState: GameState;
  isMaster: boolean;
  onUpdate?: (state: GameState) => Promise<void>;
  onDelete?: () => Promise<void>;
  onLeave: () => void;
  lastSync?: Date | null;
}

export default function GameBoard({
  initialState,
  isMaster,
  onUpdate,
  onDelete,
  onLeave,
  lastSync,
}: GameBoardProps) {
  const [gameState, setGameState] = useState<GameState>(initialState);
  const [toast, setToast] = useState<string | null>(null);

  // Sync external updates (viewer mode) — when initialState changes, update internal state
  useEffect(() => {
    if (!isMaster) {
      setGameState(initialState);
    }
  }, [isMaster, initialState]);

  const showToast = (msg: string) => setToast(msg);

  const dispatch = useCallback(
    async (newState: GameState) => {
      setGameState(newState);
      if (onUpdate) await onUpdate(newState);
    },
    [onUpdate]
  );

  const handleAddScore = async (pts: number) => {
    await dispatch(addScore(gameState, pts));
  };

  const handleFarkel = async () => {
    await dispatch(farkel(gameState));
  };

  const handleSkip = async () => {
    await dispatch(skipTurn(gameState));
  };

  const handleUndo = async () => {
    await dispatch(undoLast(gameState));
  };

  const handlePrevPlayer = () => {
    const prev =
      (gameState.current_player_index - 1 + gameState.players.length) %
      gameState.players.length;
    const newState = { ...gameState, current_player_index: prev };
    setGameState(newState);
    if (onUpdate) onUpdate(newState);
  };

  const handleNextPlayer = () => {
    const next = (gameState.current_player_index + 1) % gameState.players.length;
    const newState = { ...gameState, current_player_index: next };
    setGameState(newState);
    if (onUpdate) onUpdate(newState);
  };

  const handleSelectPlayer = (idx: number) => {
    if (gameState.game_over) return;
    const newState = { ...gameState, current_player_index: idx };
    setGameState(newState);
    if (onUpdate) onUpdate(newState);
  };

  const handleDeleteGame = async () => {
    if (!confirm('Delete this game? All viewers will be returned to the lobby.')) return;
    if (onDelete) await onDelete();
    onLeave();
  };

  const displayState = gameState;
  const sorted = getSortedPlayers(displayState.players);
  const winner = displayState.game_over ? getWinner(displayState.players) : null;

  return (
    <div style={{ position: 'relative' }}>
      {toast && (
        <Toast message={toast} onDismiss={() => setToast(null)} />
      )}

      <GameCodeDisplay code={displayState.code} isMaster={isMaster} />

      {/* Viewer sync indicator */}
      {!isMaster && lastSync && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            marginBottom: '0.75rem',
            justifyContent: 'center',
          }}
        >
          <span
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: '#34d399',
              display: 'inline-block',
              animation: 'pulse 1.5s infinite',
            }}
          />
          <span
            style={{
              fontFamily: 'Barlow, sans-serif',
              fontSize: '0.72rem',
              color: '#34d399',
            }}
          >
            Live · {lastSync.toLocaleTimeString()}
          </span>
        </div>
      )}

      {/* Final Round Banner */}
      {displayState.final_round && !displayState.game_over && (
        <div
          style={{
            background: 'rgba(255,215,0,0.08)',
            border: '1px solid rgba(255,215,0,0.4)',
            borderRadius: '8px',
            padding: '0.6rem 1rem',
            marginBottom: '0.85rem',
            textAlign: 'center',
            animation: 'finalPulse 1.5s ease-in-out infinite',
          }}
        >
          <span
            style={{
              fontFamily: 'Bebas Neue, sans-serif',
              fontSize: '1.1rem',
              color: '#ffd700',
              letterSpacing: '0.06em',
            }}
          >
            Final Round — Everyone gets one last turn!
          </span>
        </div>
      )}

      {/* Winner Banner */}
      {displayState.game_over && (
        <WinnerBanner players={displayState.players} />
      )}

      {/* Scoreboard */}
      <div style={{ marginBottom: '1rem' }}>
        <div
          style={{
            fontFamily: 'Bebas Neue, sans-serif',
            fontSize: '0.9rem',
            color: '#6b7084',
            letterSpacing: '0.1em',
            marginBottom: '0.4rem',
          }}
        >
          Scoreboard
        </div>
        {sorted.map(({ player, originalIndex }) => (
          <PlayerCard
            key={originalIndex}
            player={player}
            isCurrent={originalIndex === displayState.current_player_index}
            isWinner={winner?.name === player.name}
            isMaster={isMaster}
            gameOver={displayState.game_over}
            onClick={
              isMaster && !displayState.game_over
                ? () => handleSelectPlayer(originalIndex)
                : undefined
            }
          />
        ))}
      </div>

      {/* Score Entry (master only, game not over) */}
      {isMaster && !displayState.game_over && (
        <ScoreEntry
          players={displayState.players}
          currentIndex={displayState.current_player_index}
          onAddScore={handleAddScore}
          onFarkel={handleFarkel}
          onSkip={handleSkip}
          onPrevPlayer={handlePrevPlayer}
          onNextPlayer={handleNextPlayer}
          onSelectPlayer={handleSelectPlayer}
          onToast={showToast}
        />
      )}

      {/* Turn Log */}
      <TurnLog
        log={displayState.log}
        isMaster={isMaster}
        onUndo={isMaster && displayState.log.length > 0 ? handleUndo : undefined}
      />

      {/* Scoring Reference */}
      <ScoringReference />

      {/* Game actions */}
      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
        <button onClick={onLeave} style={leaveBtnStyle}>
          Leave Game
        </button>
        {isMaster && (
          <button onClick={handleDeleteGame} style={deleteBtnStyle}>
            End &amp; Delete
          </button>
        )}
      </div>
    </div>
  );
}

const leaveBtnStyle: React.CSSProperties = {
  flex: 1,
  background: 'transparent',
  border: '1px solid rgba(255,255,255,0.12)',
  color: '#6b7084',
  borderRadius: '7px',
  padding: '0.6rem',
  minHeight: '44px',
  cursor: 'pointer',
  fontFamily: 'Barlow, sans-serif',
  fontWeight: 700,
  fontSize: '0.82rem',
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
  transition: 'all 0.15s',
};

const deleteBtnStyle: React.CSSProperties = {
  flex: 1,
  background: 'rgba(239,68,68,0.1)',
  border: '1px solid rgba(239,68,68,0.4)',
  color: '#ef4444',
  borderRadius: '7px',
  padding: '0.6rem',
  minHeight: '44px',
  cursor: 'pointer',
  fontFamily: 'Barlow, sans-serif',
  fontWeight: 700,
  fontSize: '0.82rem',
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
  transition: 'all 0.15s',
};
