import React, { useState, useEffect } from 'react';

const KEYBOARD_ROWS = [
  ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
  ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
  ['z', 'x', 'c', 'v', 'b', 'n', 'm'],
  ['space']
];

export function KeyboardVisualizer() {
  const [pressedKey, setPressedKey] = useState(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      setPressedKey(e.key === ' ' ? 'space' : e.key.toLowerCase());
    };
    const handleKeyUp = () => {
      setPressedKey(null);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '6px',
        padding: '16px',
        maxWidth: '540px',
        margin: '0 auto',
        userSelect: 'none',
        opacity: 0.85
      }}
    >
      {KEYBOARD_ROWS.map((row, rIdx) => (
        <div key={rIdx} style={{ display: 'flex', gap: '5px' }}>
          {row.map((k) => {
            const isPressed = pressedKey === k || (k === 'space' && pressedKey === ' ');
            const isSpace = k === 'space';
            return (
              <div
                key={k}
                style={{
                  width: isSpace ? '220px' : '36px',
                  height: '36px',
                  borderRadius: '8px',
                  backgroundColor: isPressed ? 'var(--accent)' : 'var(--surface)',
                  color: isPressed ? '#FFFFFF' : 'var(--text-sub)',
                  border: `1px solid ${isPressed ? 'var(--accent)' : 'var(--border)'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: isSpace ? '11px' : '13px',
                  fontWeight: 600,
                  fontFamily: 'var(--font-mono, monospace)',
                  transform: isPressed ? 'scale(0.94)' : 'scale(1)',
                  boxShadow: isPressed ? '0 0 10px var(--accent)' : '0 2px 4px var(--shadow, rgba(0,0,0,0.03))',
                  transition: 'all 0.08s ease'
                }}
              >
                {isSpace ? '␣ space' : k}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
