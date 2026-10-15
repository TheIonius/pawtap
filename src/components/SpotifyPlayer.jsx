import React, { useState, useMemo } from 'react';
import {
  ChevronDown,
  ChevronUp,
  X,
  Music2,
  Link2,
  Check
} from 'lucide-react';
import { parseSpotifyUrl } from '../constants/spotify';

export function SpotifyPlayer({
  playlistUrl,
  setPlaylistUrl,
  isVisible,
  onClose,
  isCollapsed,
  setIsCollapsed,
  onRestoreFocus = () => {}
}) {
  const [hasOpened, setHasOpened] = useState(isVisible);
  if (isVisible && !hasOpened) {
    setHasOpened(true);
  }

  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [customInput, setCustomInput] = useState('');
  const [inputFeedback, setInputFeedback] = useState(null);

  const embedUrl = useMemo(() => parseSpotifyUrl(playlistUrl), [playlistUrl]);

  const handleApplyCustomUrl = (e) => {
    e?.preventDefault();
    if (!customInput.trim()) return;

    if (!customInput.includes('spotify.com') && !customInput.startsWith('spotify:')) {
      setInputFeedback('Please paste a valid Spotify link or URI');
      return;
    }

    setPlaylistUrl(customInput.trim());
    setInputFeedback('Playlist applied!');
    setTimeout(() => {
      setInputFeedback(null);
      setIsPickerOpen(false);
      setCustomInput('');
    }, 800);
  };

  // If never opened yet, return null for zero impact on initial app load
  if (!hasOpened && !isVisible) return null;

  return (
    <>
      {/* 1. Minimized / Collapsed Floating Pill State */}
      {isVisible && isCollapsed && (
        <div
          className="spotify-widget-container"
          onPointerDown={(e) => e.stopPropagation()}
          style={{
            position: 'fixed',
            bottom: '96px',
            right: '36px',
            zIndex: 80,
            animation: 'fadeInUp 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
          }}
        >
          <button
            onClick={() => setIsCollapsed(false)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px 8px 12px',
              borderRadius: '20px',
              backgroundColor: 'rgba(18, 18, 18, 0.94)',
              border: '1px solid rgba(255, 255, 255, 0.14)',
              boxShadow: '0 12px 32px rgba(0, 0, 0, 0.45)',
              color: '#FFFFFF',
              fontWeight: 600,
              fontSize: '12.5px',
              cursor: 'pointer',
              backdropFilter: 'blur(16px)',
              transition: 'all 0.15s ease'
            }}
            title="Expand Spotify Player"
          >
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: '#1DB954',
                boxShadow: '0 0 8px #1DB954'
              }}
            />
            <Music2 size={14} color="#1DB954" />
            <span style={{ letterSpacing: '-0.2px' }}>Spotify Player</span>
            <ChevronUp size={13} style={{ opacity: 0.7 }} />
          </button>
        </div>
      )}

      {/* 2. Expanded Floating Mini-Player (Kept mounted for zero lag & uninterrupted music) */}
      <div
        className="spotify-widget-container"
        onPointerDown={(e) => e.stopPropagation()}
        style={{
          position: 'fixed',
          bottom: '96px',
          right: '36px',
          width: '360px',
          maxWidth: 'calc(100vw - 44px)',
          backgroundColor: '#121212',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: '16px',
          boxShadow: '0 24px 64px rgba(0, 0, 0, 0.55), 0 8px 24px rgba(0, 0, 0, 0.35)',
          zIndex: 80,
          overflow: 'hidden',
          backdropFilter: 'blur(20px)',
          opacity: isVisible && !isCollapsed ? 1 : 0,
          transform: isVisible && !isCollapsed ? 'translateY(0) scale(1)' : 'translateY(12px) scale(0.96)',
          pointerEvents: isVisible && !isCollapsed ? 'auto' : 'none',
          transition: 'opacity 0.22s cubic-bezier(0.16, 1, 0.3, 1), transform 0.22s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        {/* Top Header Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px 14px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            backgroundColor: '#181818'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: '#1DB954',
                boxShadow: '0 0 8px #1DB954'
              }}
            />
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#FFFFFF', letterSpacing: '-0.2px' }}>
              Spotify Player
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            {/* Custom Link Toggle */}
            <button
              onClick={() => setIsPickerOpen(prev => !prev)}
              style={{
                padding: '4px 9px',
                fontSize: '11px',
                fontWeight: 600,
                borderRadius: '12px',
                backgroundColor: isPickerOpen ? 'rgba(29, 185, 84, 0.2)' : 'rgba(255, 255, 255, 0.08)',
                color: isPickerOpen ? '#1DB954' : '#E0E0E0',
                border: isPickerOpen ? '1px solid #1DB954' : '1px solid transparent',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                transition: 'all 0.15s ease'
              }}
              title="Change Spotify Link"
            >
              <Link2 size={12} />
              <span>Custom link</span>
            </button>

            {/* Minimize */}
            <button
              onClick={() => {
                setIsCollapsed(true);
                onRestoreFocus();
              }}
              style={{
                padding: '4px 6px',
                borderRadius: '8px',
                backgroundColor: 'transparent',
                color: '#B3B3B3',
                border: 'none',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'color 0.15s ease'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = '#FFFFFF'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = '#B3B3B3'; }}
              title="Minimize to Pill"
            >
              <ChevronDown size={14} />
            </button>

            {/* Close */}
            <button
              onClick={() => {
                onClose();
                onRestoreFocus();
              }}
              style={{
                padding: '4px 6px',
                borderRadius: '8px',
                backgroundColor: 'transparent',
                color: '#B3B3B3',
                border: 'none',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'color 0.15s ease'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = '#FFFFFF'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = '#B3B3B3'; }}
              title="Close Player"
            >
              <X size={14} />
            </button>
          </div>
        </div>

        {/* Custom Link Input ONLY (Zero fluff, clean paste form) */}
        {isPickerOpen && (
          <div
            style={{
              padding: '12px 14px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
              backgroundColor: '#181818',
              animation: 'fadeIn 0.2s ease-out'
            }}
          >
            <form onSubmit={handleApplyCustomUrl}>
              <div
                style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  color: '#B3B3B3',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  marginBottom: '8px'
                }}
              >
                Paste Spotify Link
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                  placeholder="https://open.spotify.com/playlist/..."
                  autoFocus
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    backgroundColor: '#121212',
                    color: '#FFFFFF',
                    fontSize: '12.5px',
                    outline: 'none',
                    fontFamily: 'inherit',
                    transition: 'border-color 0.15s ease'
                  }}
                  onFocus={(e) => { e.target.style.borderColor = '#1DB954'; }}
                  onBlur={(e) => { e.target.style.borderColor = 'rgba(255, 255, 255, 0.15)'; }}
                />
                <button
                  type="submit"
                  style={{
                    padding: '8px 14px',
                    borderRadius: '8px',
                    backgroundColor: '#1DB954',
                    color: '#000000',
                    fontWeight: 700,
                    fontSize: '12px',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#1ed760'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#1DB954'; }}
                >
                  Apply
                </button>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginTop: '6px'
                }}
              >
                <span style={{ fontSize: '11px', color: '#888888' }}>
                  Log into Spotify in your browser for full continuous songs
                </span>
                {inputFeedback && (
                  <span
                    style={{
                      fontSize: '11px',
                      color: inputFeedback.includes('valid') ? '#ff6b6b' : '#1DB954',
                      fontWeight: 600,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    {!inputFeedback.includes('valid') && <Check size={11} />}
                    {inputFeedback}
                  </span>
                )}
              </div>
            </form>
          </div>
        )}

        {/* Spotify Official Compact Embed Player */}
        <div style={{ padding: '8px', backgroundColor: '#121212', minHeight: '152px' }}>
          <iframe
            title="Spotify Web Player"
            src={embedUrl}
            width="100%"
            height="152"
            frameBorder="0"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="eager"
            style={{
              borderRadius: '12px',
              border: 'none',
              display: 'block'
            }}
          />
        </div>
      </div>
    </>
  );
}
