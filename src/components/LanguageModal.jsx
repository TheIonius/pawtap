import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Globe, Search, X, Check } from 'lucide-react';
import { SUPPORTED_LANGUAGES } from '../constants/wordLists';
import { FlagIcon } from './FlagIcon';

export function LanguageModal({
  isOpen,
  onClose,
  currentLanguage,
  onSelectLanguage
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const inputRef = useRef(null);

  const handleClose = useCallback(() => {
    setSearchTerm('');
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;
      if (e.key === 'Escape') {
        e.preventDefault();
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleClose]);

  if (!isOpen) return null;

  const filteredLanguages = SUPPORTED_LANGUAGES.filter((lang) => {
    const term = searchTerm.toLowerCase().trim();
    return (
      lang.name.toLowerCase().includes(term) ||
      lang.nativeName.toLowerCase().includes(term) ||
      lang.id.toLowerCase().includes(term)
    );
  });

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}
    >
      {/* 1. Independent GPU-Cached Backdrop Layer */}
      <div
        onClick={handleClose}
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: 'rgba(18, 15, 12, 0.65)',
          transform: 'translateZ(0)'
        }}
      />

      {/* 2. Isolated Language Modal Card */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'relative',
          zIndex: 1,
          backgroundColor: 'var(--surface)',
          border: '1.5px solid var(--border)',
          borderRadius: '24px',
          width: '100%',
          maxWidth: '680px',
          maxHeight: '84vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 16px 48px var(--shadow, rgba(0,0,0,0.22))',
          overflow: 'hidden',
          animation: 'slideUp 0.22s ease-out',
          transform: 'translateZ(0)',
          contain: 'content',
          isolation: 'isolate'
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '20px 24px 16px 24px',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                backgroundColor: 'rgba(var(--accent-rgb, 120, 100, 80), 0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--accent)'
              }}
            >
              <Globe size={20} />
            </div>
            <div>
              <h2
                style={{
                  fontSize: '18px',
                  fontWeight: 700,
                  color: 'var(--text-main)',
                  margin: 0,
                  lineHeight: 1.2
                }}
              >
                select language
              </h2>
              <span style={{ fontSize: '12px', color: 'var(--text-sub)' }}>
                choose from {SUPPORTED_LANGUAGES.length} supported languages & dialects
              </span>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="action-btn"
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-sub)',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title="Close (Esc)"
          >
            <X size={20} />
          </button>
        </div>

        {/* Search input bar */}
        <div style={{ padding: '16px 24px 12px 24px' }}>
          <div
            style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              backgroundColor: 'var(--bg)',
              border: '1.5px solid var(--border)',
              borderRadius: '14px',
              padding: '0 14px'
            }}
          >
            <Search size={16} style={{ color: 'var(--text-sub)', marginRight: '10px', flexShrink: 0 }} />
            <input
              ref={inputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="type to search language..."
              style={{
                width: '100%',
                padding: '12px 0',
                background: 'transparent',
                border: 'none',
                color: 'var(--text-main)',
                fontSize: '14px',
                outline: 'none',
                fontFamily: 'inherit'
              }}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-sub)',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Languages Grid */}
        <div
          className="no-scrollbar"
          style={{
            padding: '8px 24px 24px 24px',
            overflowY: 'auto',
            overscrollBehavior: 'contain',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: '12px',
            flex: 1
          }}
        >
          {filteredLanguages.length === 0 ? (
            <div
              style={{
                gridColumn: '1 / -1',
                textAlign: 'center',
                padding: '40px 0',
                color: 'var(--text-sub)'
              }}
            >
              <p style={{ margin: 0, fontSize: '15px' }}>No language found matching "{searchTerm}"</p>
              <span style={{ fontSize: '12px', opacity: 0.8 }}>Try searching English, Spanish, French, etc.</span>
            </div>
          ) : (
            filteredLanguages.map((lang) => {
              const isSelected = lang.id === currentLanguage;
              return (
                <button
                  key={lang.id}
                  onClick={() => {
                    onSelectLanguage(lang.id);
                    onClose();
                  }}
                  className="action-btn"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    borderRadius: '14px',
                    border: isSelected
                      ? '1.5px solid var(--accent)'
                      : '1.5px solid var(--border)',
                    backgroundColor: isSelected
                      ? 'rgba(var(--accent-rgb, 120, 100, 80), 0.08)'
                      : 'var(--surface)',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.16s ease',
                    boxShadow: isSelected
                      ? '0 2px 10px rgba(var(--accent-rgb, 120, 100, 80), 0.15)'
                      : 'none'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                      <FlagIcon langId={lang.id} width={25} height={17} />
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 700,
                          padding: '3px 6px',
                          borderRadius: '6px',
                          backgroundColor: isSelected ? 'var(--accent)' : 'var(--surface-hover)',
                          color: isSelected ? '#FFFFFF' : 'var(--text-main)',
                          letterSpacing: '0.6px',
                          fontFamily: 'var(--font-mono, monospace)',
                          flexShrink: 0
                        }}
                      >
                        {lang.code || 'LG'}
                      </span>
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: '14px',
                          fontWeight: isSelected ? 700 : 600,
                          color: isSelected ? 'var(--accent)' : 'var(--text-main)',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}
                      >
                        {lang.name}
                      </div>
                      <div
                        style={{
                          fontSize: '11.5px',
                          color: 'var(--text-sub)',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}
                      >
                        {lang.nativeName} • {lang.wordCount}
                      </div>
                    </div>
                  </div>

                  {isSelected && (
                    <div
                      style={{
                        width: '20px',
                        height: '20px',
                        borderRadius: '50%',
                        backgroundColor: 'var(--accent)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#FFFFFF',
                        flexShrink: 0,
                        marginLeft: '8px'
                      }}
                    >
                      <Check size={12} strokeWidth={3} />
                    </div>
                  )}
                </button>
              );
            })
          )}
        </div>

        {/* Footer tip */}
        <div
          style={{
            padding: '12px 24px',
            borderTop: '1px solid var(--border)',
            backgroundColor: 'var(--bg)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '12px',
            color: 'var(--text-sub)'
          }}
        >
          <span>press <kbd style={{ padding: '2px 5px', borderRadius: '4px', background: 'var(--surface)', border: '1px solid var(--border)' }}>Esc</kbd> to close</span>
          <span>Tab restarts the test anytime</span>
        </div>
      </div>
    </div>
  );
}
