import React from 'react';
import {
  Clock,
  FileText,
  Quote,
  Infinity as InfinityIcon,
  Sparkles
} from 'lucide-react';

export function TestSettingsBar({
  mode,
  setMode,
  timeLimit,
  setTimeLimit,
  wordLimit,
  setWordLimit,
  quoteLength,
  setQuoteLength,
  punctuation,
  setPunctuation,
  numbers,
  setNumbers,
  vocabularyMode,
  setVocabularyMode
}) {
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '6px 14px',
        borderRadius: '16px',
        backgroundColor: 'var(--surface)',
        border: '1.5px solid var(--border)',
        boxShadow: '0 3px 12px var(--shadow), 0 1px 3px rgba(0,0,0,0.03)',
        fontSize: '13px',
        fontWeight: 500,
        userSelect: 'none',
        margin: '0 auto 12px auto',
        justifyContent: 'center',
        backdropFilter: 'blur(8px)',
        transition: 'all 0.2s ease'
      }}
      className="settings-bar"
    >
      {/* 1. Modifiers Section: Punctuation, Numbers, Vocabulary */}
      {mode !== 'quote' && mode !== 'zen' && (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
            <button
              className={`pill-btn ${punctuation ? 'active' : ''}`}
              onClick={() => setPunctuation(!punctuation)}
              title="Toggle Punctuation (@)"
            >
              <span>@ punctuation</span>
            </button>

            <button
              className={`pill-btn ${numbers ? 'active' : ''}`}
              onClick={() => setNumbers(!numbers)}
              title="Toggle Numbers (#)"
            >
              <span># numbers</span>
            </button>

            {setVocabularyMode && (
              <button
                className={`pill-btn ${vocabularyMode !== 'cozy' ? 'active' : ''}`}
                onClick={() => {
                  const next = vocabularyMode === 'cozy' ? 'standard' : vocabularyMode === 'standard' ? 'expert' : 'cozy';
                  setVocabularyMode(next);
                }}
                title="Vocabulary Complexity: Cozy -> Standard -> Expert (Hard & Polysyllabic)"
              >
                <Sparkles size={12} />
                <span>{vocabularyMode}</span>
              </button>
            )}
          </div>

          <div
            style={{
              width: '1px',
              height: '14px',
              backgroundColor: 'var(--border)',
              margin: '0 4px',
              opacity: 0.85
            }}
          />
        </>
      )}

      {/* 2. Mode Selectors: time, words, quote, zen */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
        <button
          className={`pill-btn ${mode === 'time' ? 'active' : ''}`}
          onClick={() => setMode('time')}
          title="Time Countdown Mode"
        >
          <Clock size={13} />
          <span>time</span>
        </button>

        <button
          className={`pill-btn ${mode === 'words' ? 'active' : ''}`}
          onClick={() => setMode('words')}
          title="Word Count Mode"
        >
          <FileText size={13} />
          <span>words</span>
        </button>

        <button
          className={`pill-btn ${mode === 'quote' ? 'active' : ''}`}
          onClick={() => setMode('quote')}
          title="Literary Quote Mode"
        >
          <Quote size={13} />
          <span>quote</span>
        </button>

        <button
          className={`pill-btn ${mode === 'zen' ? 'active' : ''}`}
          onClick={() => setMode('zen')}
          title="Zen Free Typing Mode"
        >
          <InfinityIcon size={13} />
          <span>zen</span>
        </button>
      </div>

      {/* 3. Mode Sub-options (only when mode is not zen) */}
      {mode !== 'zen' && (
        <>
          <div
            style={{
              width: '1px',
              height: '14px',
              backgroundColor: 'var(--border)',
              margin: '0 4px',
              opacity: 0.85
            }}
          />

          {mode === 'time' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
              {[15, 30, 60, 120].map((t) => (
                <button
                  key={t}
                  className={`pill-btn ${timeLimit === t ? 'active' : ''}`}
                  onClick={() => setTimeLimit(t)}
                  title={`${t} seconds`}
                >
                  {t}
                </button>
              ))}
            </div>
          )}

          {mode === 'words' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
              {[10, 25, 50, 100].map((w) => (
                <button
                  key={w}
                  className={`pill-btn ${wordLimit === w ? 'active' : ''}`}
                  onClick={() => setWordLimit(w)}
                  title={`${w} words`}
                >
                  {w}
                </button>
              ))}
            </div>
          )}

          {mode === 'quote' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
              {['short', 'medium', 'long'].map((q) => (
                <button
                  key={q}
                  className={`pill-btn ${quoteLength === q ? 'active' : ''}`}
                  onClick={() => setQuoteLength(q)}
                  title={`${q} quote`}
                >
                  {q}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
