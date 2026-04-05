'use client';

import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useGameState } from '../../../hooks/useGameState';
import { useGameSubscription } from '../../../hooks/useGameSubscription';
import GameBoard from '../../../components/GameBoard';
import Toast from '../../../components/Toast';
import { GameState } from '../../../lib/types';

export default function GamePage() {
  const params = useParams<{ code: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const code = (params.code ?? '').toUpperCase();

  // Determine master status: URL param OR localStorage token
  const [isMaster, setIsMaster] = useState(false);
  const [checkedMaster, setCheckedMaster] = useState(false);
  const [deletedToast, setDeletedToast] = useState(false);

  useEffect(() => {
    const urlMaster = searchParams.get('master') === '1';
    const storedMaster = localStorage.getItem(`farkel_master_${code}`) === 'true';
    setIsMaster(urlMaster || storedMaster);
    setCheckedMaster(true);
  }, [code, searchParams]);

  // Master hook
  const masterHook = useGameState(code);
  // Viewer hook
  const viewerHook = useGameSubscription(code);

  useEffect(() => {
    if (viewerHook.gameDeleted && !isMaster) {
      setDeletedToast(true);
      setTimeout(() => router.push('/'), 3000);
    }
  }, [viewerHook.gameDeleted, isMaster, router]);

  if (!checkedMaster) {
    return <LoadingScreen />;
  }

  if (isMaster) {
    if (masterHook.loading) return <LoadingScreen />;
    if (masterHook.error || !masterHook.gameState) {
      return <ErrorScreen message={masterHook.error ?? 'Game not found.'} onBack={() => router.push('/')} />;
    }
    return (
      <PageShell>
        <GameBoard
          initialState={masterHook.gameState}
          isMaster={true}
          onUpdate={masterHook.updateGame}
          onDelete={masterHook.deleteGame}
          onLeave={() => {
            localStorage.removeItem(`farkel_master_${code}`);
            router.push('/');
          }}
        />
      </PageShell>
    );
  }

  // Viewer
  if (viewerHook.loading) return <LoadingScreen />;
  if (viewerHook.error || !viewerHook.gameState) {
    return <ErrorScreen message={viewerHook.error ?? 'Game not found.'} onBack={() => router.push('/')} />;
  }

  return (
    <PageShell>
      {deletedToast && (
        <Toast
          message="The scorekeeper ended the game. Returning to lobby…"
          onDismiss={() => setDeletedToast(false)}
        />
      )}
      <GameBoard
        initialState={viewerHook.gameState}
        isMaster={false}
        onLeave={() => router.push('/')}
        lastSync={viewerHook.lastSync}
      />
    </PageShell>
  );
}

function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <main
      style={{
        maxWidth: '600px',
        margin: '0 auto',
        padding: '1.5rem 1rem 3rem',
        minHeight: '100vh',
      }}
    >
      {children}
    </main>
  );
}

function LoadingScreen() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        flexDirection: 'column',
        gap: '1rem',
      }}
    >
      <div
        style={{
          fontFamily: 'Bebas Neue, sans-serif',
          fontSize: '2rem',
          color: '#ff4d4d',
          letterSpacing: '0.1em',
        }}
      >
        Farkel
      </div>
      <div
        style={{
          fontFamily: 'Barlow, sans-serif',
          fontSize: '0.85rem',
          color: '#6b7084',
        }}
      >
        Loading game…
      </div>
    </div>
  );
}

function ErrorScreen({ message, onBack }: { message: string; onBack: () => void }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        flexDirection: 'column',
        gap: '1rem',
        padding: '2rem',
      }}
    >
      <div
        style={{
          fontFamily: 'Bebas Neue, sans-serif',
          fontSize: '1.5rem',
          color: '#ef4444',
          letterSpacing: '0.05em',
        }}
      >
        {message}
      </div>
      <button
        onClick={onBack}
        style={{
          background: 'rgba(255,77,77,0.15)',
          border: '1px solid rgba(255,77,77,0.4)',
          color: '#ff4d4d',
          borderRadius: '7px',
          padding: '0.65rem 1.5rem',
          cursor: 'pointer',
          fontFamily: 'Barlow, sans-serif',
          fontWeight: 700,
          fontSize: '0.9rem',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          minHeight: '44px',
        }}
      >
        Back to Lobby
      </button>
    </div>
  );
}
