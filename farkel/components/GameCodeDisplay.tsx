'use client';

interface GameCodeDisplayProps {
  code: string;
  isMaster: boolean;
}

export default function GameCodeDisplay({ code, isMaster }: GameCodeDisplayProps) {
  return (
    <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
      <div
        style={{
          display: 'inline-block',
          border: '2px dashed #ffd700',
          borderRadius: '10px',
          padding: '0.75rem 1.5rem',
          marginBottom: '0.5rem',
        }}
      >
        <div
          style={{
            fontFamily: 'Bebas Neue, sans-serif',
            fontSize: '3rem',
            letterSpacing: '0.3em',
            color: '#ffd700',
            lineHeight: 1,
          }}
        >
          {code}
        </div>
        <div
          style={{
            fontFamily: 'Barlow, sans-serif',
            fontSize: '0.75rem',
            color: '#6b7084',
            marginTop: '0.25rem',
            letterSpacing: '0.05em',
          }}
        >
          Share this code with players
        </div>
      </div>
      <div style={{ marginTop: '0.4rem' }}>
        {isMaster ? (
          <span
            style={{
              background: 'rgba(255,77,77,0.15)',
              color: '#ff4d4d',
              border: '1px solid rgba(255,77,77,0.35)',
              borderRadius: '999px',
              padding: '0.2rem 0.75rem',
              fontFamily: 'Barlow, sans-serif',
              fontSize: '0.75rem',
              fontWeight: 700,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
            }}
          >
            Scorekeeper
          </span>
        ) : (
          <span
            style={{
              background: 'rgba(52,211,153,0.15)',
              color: '#34d399',
              border: '1px solid rgba(52,211,153,0.35)',
              borderRadius: '999px',
              padding: '0.2rem 0.75rem',
              fontFamily: 'Barlow, sans-serif',
              fontSize: '0.75rem',
              fontWeight: 700,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
            }}
          >
            Viewer — Live
          </span>
        )}
      </div>
    </div>
  );
}
