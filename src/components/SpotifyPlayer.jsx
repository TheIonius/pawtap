import React, { useState, useMemo } from 'react';
import {
  ChevronDown,
  ChevronUp,
  X,
  ListMusic,
  Check,
  Music2
} from 'lucide-react';
import { SPOTIFY_PRESETS, parseSpotifyUrl } from '../constants/spotify';

export function SpotifyPlayer({
  playlistUrl,
  setPlaylistUrl,
  isVisible,
  onClose,
  isCollapsed,
  setIsCollapsed,
  onRestoreFocus = () => {}
}) {
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [customInput, setCustomInput] = useState('');
  const [inputFeedback, setInputFeedback] = useState(null);

  const embedUrl = useMemo(() => parseSpotifyUrl(playlistUrl), [playlistUrl]);

  // Find active preset title if current URL matches one
  const activePreset = useMemo(() => {
    return SPOTIFY_PRESETS.find(p => p.uri === playlistUrl || embedUrl.includes(p.uri.split('/').pop()));
  }, [playlistUrl, embedUrl]);

  const activeTitle = activePreset ? activePreset.name : 'Custom Playlist';

  const handleApplyCustomUrl = (e) => {
    e?.preventDefault();
    if (!customInput.trim()) return;

    if (!customInput.includes('spotify.com') && !customInput.startsWith('spotify:')) {
      setInputFeedback('Please paste a valid Spotify link or URI.');
      return;
    }

    setPlaylistUrl(customInput.trim());
    setInputFeedback('Playlist applied!');
    setTimeout(() => {
      setInputFeedback(null);
      setIsPickerOpen(false);
      setCustomInput('');
    }, 900);
  };

  const handleSelectPreset = (uri) => {
    setPlaylistUrl(uri);
    setIsPickerOpen(false);
    setInputFeedback(null);
  };

  if (!isVisible) return null;

  // 1. Minimized / Collapsed Pill State
  if (isCollapsed) {
    return (
      <div
        className="spotify-widget-container"
        onPointerDown={(e) => e.stopPropagation()}
        style={{
          position: 'fixed',
          bottom: '96px',
          right: '36px',
          zIndex: 80,
          animation: 'fadeInUp 0.24s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        <button
          onClick={() => setIsCollapsed(false)}
          className="pill-btn"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px 8px 12px',
            borderRadius: '18px',
            backgroundColor: 'var(--surface)',
            border: '1.5px solid var(--border)',
            boxShadow: '0 6px 20px var(--shadow)',
            color: 'var(--text-main)',
            fontWeight: 600,
            fontSize: '12.5px',
            cursor: 'pointer',
            backdropFilter: 'blur(10px)',
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
          <span>{activeTitle}</span>
          <ChevronUp size={13} style={{ opacity: 0.7 }} />
        </button>
      </div>
    );
  }

  // 2. Expanded Floating Mini-Player
  return (
    <div
      className="spotify-widget-container"
      onPointerDown={(e) => e.stopPropagation()}
      style={{
        position: 'fixed',
        bottom: '96px',
        right: '36px',
        width: '360px',
        maxWidth: 'calc(100vw - 44px)',
        backgroundColor: 'var(--bg)',
        border: '1.5px solid var(--border)',
        borderRadius: '20px',
        boxShadow: '0 20px 52px var(--shadow), 0 8px 24px rgba(0,0,0,0.16)',
        zIndex: 80,
        overflow: 'hidden',
        animation: 'modalSlideUp 0.28s cubic-bezier(0.16, 1, 0.3, 1)',
        backdropFilter: 'blur(12px)'
      }}
    >
      {/* Top Header Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 14px',
          borderBottom: '1px solid var(--border)',
          backgroundColor: 'var(--surface)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: '#1DB954',
              boxShadow: '0 0 6px #1DB954'
            }}
          />
          <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-main)' }}>
            {activeTitle}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          {/* Change Playlist Button */}
          <button
            onClick={() => setIsPickerOpen(prev => !prev)}
            className="pill-btn"
            style={{
              padding: '4px 8px',
              fontSize: '11px',
              borderRadius: '8px',
              backgroundColor: isPickerOpen ? 'var(--surface-hover)' : 'transparent',
              color: isPickerOpen ? 'var(--accent)' : 'var(--text-sub)'
            }}
            title="Change Spotify Playlist"
          >
            <ListMusic size={13} />
            <span>Playlist</span>
          </button>

          {/* Minimize / Collapse */}
          <button
            onClick={() => {
              setIsCollapsed(true);
              onRestoreFocus();
            }}
            className="pill-btn"
            style={{ padding: '4px 6px', borderRadius: '8px' }}
            title="Minimize Spotify Player"
          >
            <ChevronDown size={14} />
          </button>

          {/* Close / Hide */}
          <button
            onClick={() => {
              onClose();
              onRestoreFocus();
            }}
            className="pill-btn"
            style={{ padding: '4px 6px', borderRadius: '8px' }}
            title="Close Spotify Player"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Playlist Selector Dropdown Popover */}
      {isPickerOpen && (
        <div
          style={{
            padding: '12px 14px',
            borderBottom: '1.5px solid var(--border)',
            backgroundColor: 'var(--surface)',
            animation: 'fadeIn 0.2s ease-out'
          }}
        >
          <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-sub)', textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: '8px' }}>
            Choose Cozy Atmosphere
          </div>

          {/* Presets List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '12px' }}>
            {SPOTIFY_PRESETS.map((preset) => {
              const isSelected = playlistUrl === preset.uri;
              return (
                <button
                  key={preset.id}
                  onClick={() => handleSelectPreset(preset.uri)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    width: '100%',
                    padding: '6px 10px',
                    borderRadius: '8px',
                    backgroundColor: isSelected ? 'var(--surface-hover)' : 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.04)';
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '14px' }}>{preset.icon}</span>
                    <div>
                      <div style={{ fontSize: '12px', fontWeight: isSelected ? 700 : 600, color: isSelected ? 'var(--accent)' : 'var(--text-main)' }}>
                        {preset.name}
                      </div>
                      <div style={{ fontSize: '10.5px', color: 'var(--text-sub)' }}>
                        {preset.desc}
                      </div>
                    </div>
                  </div>
                  {isSelected && <Check size={13} color="var(--accent)" />}
                </button>
              );
            })}
          </div>

          {/* Custom Link Input Form */}
          <form onSubmit={handleApplyCustomUrl}>
            <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-sub)', textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: '6px' }}>
              Or Paste Custom Spotify Link
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              <input
                type="text"
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                placeholder="https://open.spotify.com/playlist/..."
                style={{
                  flex: 1,
                  padding: '6px 10px',
                  borderRadius: '8px',
                  border: '1px solid var(--border)',
                  backgroundColor: 'var(--bg)',
                  color: 'var(--text-main)',
                  fontSize: '12px',
                  outline: 'none',
                  fontFamily: 'inherit'
                }}
              />
              <button
                type="submit"
                className="pill-btn"
                style={{
                  padding: '6px 12px',
                  borderRadius: '8px',
                  backgroundColor: 'var(--accent)',
                  color: '#FFFFFF',
                  fontWeight: 600,
                  fontSize: '11.5px',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                Apply
              </button>
            </div>
            {inputFeedback && (
              <div style={{ fontSize: '11px', color: 'var(--accent)', marginTop: '4px', fontWeight: 500 }}>
                {inputFeedback}
              </div>
            )}
          </form>
        </div>
      )}

      {/* Spotify Official Compact Embed Player */}
      <div style={{ padding: '8px', backgroundColor: 'var(--bg)', minHeight: '152px' }}>
        <iframe
          title="Spotify Web Player"
          src={embedUrl}
          width="100%"
          height="152"
          frameBorder="0"
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy"
          style={{
            borderRadius: '12px',
            border: 'none',
            display: 'block'
          }}
        />
      </div>
    </div>
  );
}
