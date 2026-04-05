'use client';

import { useState, useRef } from 'react';

interface TooltipProps {
  content: string;
  children: React.ReactNode;
}

export default function Tooltip({ content, children }: TooltipProps) {
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setVisible(true);
  };

  const hide = () => {
    timerRef.current = setTimeout(() => setVisible(false), 100);
  };

  const toggle = () => setVisible((v) => !v);

  return (
    <span
      style={{ position: 'relative', display: 'inline-block' }}
      onMouseEnter={show}
      onMouseLeave={hide}
      onClick={toggle}
    >
      {children}
      {visible && (
        <div
          style={{
            position: 'absolute',
            bottom: 'calc(100% + 8px)',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '260px',
            background: '#2a2e3d',
            color: '#e8e8ec',
            padding: '0.6rem 0.85rem',
            borderRadius: '6px',
            fontFamily: 'Barlow, sans-serif',
            fontSize: '0.78rem',
            fontWeight: 400,
            lineHeight: 1.4,
            zIndex: 1000,
            boxShadow: '0 4px 16px rgba(0,0,0,0.5)',
            border: '1px solid rgba(255,255,255,0.08)',
            pointerEvents: 'none',
          }}
        >
          {/* Arrow */}
          <span
            style={{
              position: 'absolute',
              bottom: '-6px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: 0,
              height: 0,
              borderLeft: '6px solid transparent',
              borderRight: '6px solid transparent',
              borderTop: '6px solid #2a2e3d',
            }}
          />
          {content}
        </div>
      )}
    </span>
  );
}
