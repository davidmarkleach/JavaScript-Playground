'use client';

import { LogEntry } from '../lib/types';

interface TurnLogProps {
  log: LogEntry[];
  isMaster: boolean;
  onUndo?: () => void;
}

export default function TurnLog({ log, isMaster, onUndo }: TurnLogProps) {
  return (
    <div
      style={{
        background: '#1a1d27',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: '10px',
        padding: '0.85rem',
        marginBottom: '1rem',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '0.6rem',
        }}
      >
        <div
          style={{
            fontFamily: 'Bebas Neue, sans-serif',
            fontSize: '1rem',
            color: '#6b7084',
            letterSpacing: '0.08em',
          }}
        >
          Turn Log
        </div>
        {isMaster && log.length > 0 && onUndo && (
          <button
            onClick={onUndo}
            style={{
              background: 'transparent',
              border: '1px solid rgba(255,255,255,0.12)',
              color: '#6b7084',
              borderRadius: '5px',
              padding: '0.2rem 0.6rem',
              cursor: 'pointer',
              fontFamily: 'Barlow, sans-serif',
              fontWeight: 600,
              fontSize: '0.72rem',
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              transition: 'all 0.15s',
              minHeight: '32px',
            }}
          >
            ↩ Undo
          </button>
        )}
      </div>
      <div
        style={{
          maxHeight: '220px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.3rem',
        }}
      >
        {log.length === 0 ? (
          <div
            style={{
              fontFamily: 'Barlow, sans-serif',
              fontSize: '0.8rem',
              color: '#6b7084',
              textAlign: 'center',
              padding: '0.5rem',
            }}
          >
            No actions yet.
          </div>
        ) : (
          log.map((entry, i) => <LogRow key={i} entry={entry} />)
        )}
      </div>
    </div>
  );
}

function LogRow({ entry }: { entry: LogEntry }) {
  let typeLabel = '';
  let typeColor = '#6b7084';
  let pointsStr = '';

  if (entry.type === 'score') {
    typeLabel = `+${entry.points?.toLocaleString()}`;
    typeColor = '#34d399';
    pointsStr = `→ ${entry.total?.toLocaleString()}`;
  } else if (entry.type === 'farkel') {
    typeLabel = 'FARKEL!';
    typeColor = '#ef4444';
    pointsStr = `${entry.total?.toLocaleString()} pts`;
  } else if (entry.type === 'skip') {
    typeLabel = 'Skipped';
    typeColor = '#6b7084';
    pointsStr = `${entry.total?.toLocaleString()} pts`;
  } else if (entry.type === 'undo') {
    typeLabel = 'Undone';
    typeColor = '#6b7084';
  }

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.3rem 0',
        borderBottom: '1px solid rgba(255,255,255,0.03)',
        fontFamily: 'Barlow, sans-serif',
        fontSize: '0.82rem',
      }}
    >
      <span style={{ color: '#e8e8ec', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {entry.player}
      </span>
      <span style={{ color: typeColor, fontWeight: 700, minWidth: '4.5rem', textAlign: 'right', flexShrink: 0 }}>
        {typeLabel}
      </span>
      {pointsStr && (
        <span style={{ color: '#6b7084', minWidth: '4rem', textAlign: 'right', flexShrink: 0 }}>
          {pointsStr}
        </span>
      )}
    </div>
  );
}
