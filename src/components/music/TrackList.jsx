import React from 'react';
import { ListMusic, Play } from 'lucide-react';

/**
 * Scrollable playlist tracklist rendering with live equalizer animation,
 * track numbers, and single-click song switching.
 */
export function TrackList({
  playlistIds = [],
  currentTrackIndex = 0,
  currentTitle = '',
  currentAuthor = '',
  playlistMeta = null,
  trackMetaMap = {},
  isPlaying = false,
  handleSelectTrack = () => {}
}) {
  return (
    <div style={{ padding: '10px 12px 14px 12px', backgroundColor: '#121212' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '8px',
          padding: '0 4px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <ListMusic size={14} color="#FF0000" />
          <span
            style={{
              fontSize: '11px',
              fontWeight: 700,
              color: '#B3B3B3',
              textTransform: 'uppercase',
              letterSpacing: '0.6px'
            }}
          >
            Songs inside playlist
          </span>
        </div>
        <span
          style={{
            fontSize: '10px',
            fontWeight: 600,
            color: '#888888',
            backgroundColor: 'rgba(255, 255, 255, 0.06)',
            padding: '2px 6px',
            borderRadius: '10px'
          }}
        >
          {playlistIds.length > 0 ? `${playlistIds.length} tracks` : '1 track'}
        </span>
      </div>

      {/* Track list */}
      <div
        className="playlist-tracks-scroll"
        style={{
          maxHeight: '200px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
          paddingRight: '2px'
        }}
      >
        {playlistIds.length > 0 ? (
          playlistIds.map((trackId, index) => {
            const isCurrent = index === currentTrackIndex;
            const itemMeta = trackMetaMap[trackId];
            const itemTitle =
              (isCurrent && currentTitle) ||
              itemMeta?.title ||
              `Track ${index + 1}`;
            const itemAuthor =
              (isCurrent && currentAuthor) ||
              itemMeta?.author ||
              playlistMeta?.author ||
              '';
            const itemThumbnail =
              itemMeta?.thumbnail || `https://i.ytimg.com/vi/${trackId}/default.jpg`;

            return (
              <button
                key={`${trackId}-${index}`}
                type="button"
                onClick={() => handleSelectTrack(index)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '7px 8px',
                  borderRadius: '8px',
                  backgroundColor: isCurrent
                    ? 'rgba(255, 0, 0, 0.16)'
                    : 'rgba(255, 255, 255, 0.03)',
                  border: isCurrent
                    ? '1px solid rgba(255, 0, 0, 0.35)'
                    : '1px solid transparent',
                  color: '#FFFFFF',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => {
                  if (!isCurrent) {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.07)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isCurrent) {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.03)';
                  }
                }}
                title={`Play "${itemTitle}"`}
              >
                {/* Track Index or Equalizer */}
                <div
                  style={{
                    width: '20px',
                    textAlign: 'center',
                    fontSize: '11px',
                    fontWeight: 600,
                    color: isCurrent ? '#FF4D4D' : '#777777',
                    flexShrink: 0
                  }}
                >
                  {isCurrent && isPlaying ? (
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'flex-end',
                        gap: '2px',
                        height: '12px',
                        justifyContent: 'center'
                      }}
                    >
                      <span
                        className="music-eq-bar-1"
                        style={{
                          width: '2px',
                          backgroundColor: '#FF0000',
                          borderRadius: '1px'
                        }}
                      />
                      <span
                        className="music-eq-bar-2"
                        style={{
                          width: '2px',
                          backgroundColor: '#FF0000',
                          borderRadius: '1px'
                        }}
                      />
                      <span
                        className="music-eq-bar-3"
                        style={{
                          width: '2px',
                          backgroundColor: '#FF0000',
                          borderRadius: '1px'
                        }}
                      />
                    </div>
                  ) : (
                    index + 1
                  )}
                </div>

                {/* Song Thumbnail */}
                <img
                  src={itemThumbnail}
                  alt={itemTitle}
                  style={{
                    width: '34px',
                    height: '34px',
                    borderRadius: '6px',
                    objectFit: 'cover',
                    backgroundColor: '#222222',
                    flexShrink: 0
                  }}
                />

                {/* Song Title & Author */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: '11.5px',
                      fontWeight: isCurrent ? 700 : 500,
                      color: isCurrent ? '#FFFFFF' : '#D0D0D0',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}
                  >
                    {itemTitle}
                  </div>
                  {itemAuthor && (
                    <div
                      style={{
                        fontSize: '10px',
                        color: '#888888',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        marginTop: '1px'
                      }}
                    >
                      {itemAuthor}
                    </div>
                  )}
                </div>

                {/* Playing badge or Play indicator */}
                <div style={{ flexShrink: 0, paddingLeft: '4px' }}>
                  {isCurrent ? (
                    <span
                      style={{
                        fontSize: '9px',
                        fontWeight: 700,
                        color: '#FF4D4D',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}
                    >
                      {isPlaying ? 'Playing' : 'Paused'}
                    </span>
                  ) : (
                    <Play size={12} color="#777777" />
                  )}
                </div>
              </button>
            );
          })
        ) : (
          <div
            style={{
              padding: '16px',
              textAlign: 'center',
              color: '#888888',
              fontSize: '11px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            <span>Single video track loaded.</span>
          </div>
        )}
      </div>
    </div>
  );
}
