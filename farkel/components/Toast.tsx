'use client';

import { useEffect, useState } from 'react';

interface ToastProps {
  message: string;
  onDismiss: () => void;
}

export default function Toast({ message, onDismiss }: ToastProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Trigger slide-up
    requestAnimationFrame(() => setVisible(true));
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onDismiss, 300);
    }, 3000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <div
      style={{
        position: 'fixed',
        bottom: visible ? '2rem' : '-5rem',
        left: '50%',
        transform: 'translateX(-50%)',
        background: '#ef4444',
        color: '#fff',
        padding: '0.75rem 1.5rem',
        borderRadius: '8px',
        fontFamily: 'Barlow, sans-serif',
        fontWeight: 600,
        fontSize: '0.9rem',
        zIndex: 9999,
        transition: 'bottom 0.3s ease, opacity 0.3s ease',
        opacity: visible ? 1 : 0,
        maxWidth: '90vw',
        textAlign: 'center',
        boxShadow: '0 4px 20px rgba(239,68,68,0.4)',
        whiteSpace: 'pre-wrap',
      }}
    >
      {message}
    </div>
  );
}
