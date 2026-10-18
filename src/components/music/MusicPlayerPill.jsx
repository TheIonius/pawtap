import React from 'react';
import { ChevronUp, Music2 } from 'lucide-react';

/**
 * Minimized floating player pill button for non-intrusive listening.
 */
export function MusicPlayerPill({
  isPlaying,
  displayThumbnail,
  displayTitle,
  onExpand
}) {
  return (
    <div
      className="music-player-container spotify-widget-container"
      onPointerDown={(e) => e.stopPropagation()}
      style={{
        position: 'fixed',
        bottom: '96px',
        right: '36px',
        zIndex: 996,
        animation: 'fadeInUp 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
      }}
    >
      <button
        onClick={onExpand}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 14px',
          borderRadius: '22px',
          backgroundColor: 'rgba(18, 18, 18, 0.95)',
          border: '1px solid rgba(255, 255, 255, 0.14)',
          boxShadow: '0 10px 28px rgba(0, 0, 0, 0.5)',
          color: '#FFFFFF',
          cursor: 'pointer',
          backdropFilter: 'blur(16px)',
          transition: 'all 0.15s ease'
        }}
        title="Expand YouTube Music Player"
        aria-label="Expand YouTube Music Player"
      >
        {/* Playback indicator dot */}
        <span
          style={{
            width: '7px',
            height: '7px',
            borderRadius: '50%',
            backgroundColor: '#FF0000',
            boxShadow: isPlaying ? '0 0 10px #FF0000' : 'none',
            flexShrink: 0
          }}
        />

        {/* Current track thumbnail */}
        {displayThumbnail ? (
          <img
            src={displayThumbnail}
            alt="Track Cover"
            style={{
              width: '20px',
              height: '20px',
              borderRadius: '5px',
              objectFit: 'cover'
            }}
          />
        ) : (
          <Music2 size={15} color="#FF0000" />
        )}

        {/* Title Snippet */}
        <span
          style={{
            fontSize: '12px',
            fontWeight: 600,
            maxWidth: '130px',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            color: '#EEEEEE'
          }}
        >
          {displayTitle || 'YT Music'}
        </span>

        {/* Equalizer animation */}
        {isPlaying && (
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-end',
              gap: '2px',
              height: '12px',
              marginLeft: '2px'
            }}
          >
            <span
              className="music-eq-bar-1"
              style={{ width: '2px', backgroundColor: '#FF0000', borderRadius: '1px' }}
            />
            <span
              className="music-eq-bar-2"
              style={{ width: '2px', backgroundColor: '#FF0000', borderRadius: '1px' }}
            />
            <span
              className="music-eq-bar-3"
              style={{ width: '2px', backgroundColor: '#FF0000', borderRadius: '1px' }}
            />
          </div>
        )}

        <ChevronUp size={14} style={{ opacity: 0.7, marginLeft: '2px' }} />
      </button>
    </div>
  );
}
