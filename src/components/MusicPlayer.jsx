import React, { useState } from 'react';
import {
  ChevronDown,
  X,
  Music2,
  Link2,
  Check,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw
} from 'lucide-react';
import { parseYouTubeUrl } from '../constants/music';
import { useYouTubePlayer } from '../hooks/useYouTubePlayer';
import { VolumeControl } from './music/VolumeControl';
import { TrackList } from './music/TrackList';
import { MusicPlayerPill } from './music/MusicPlayerPill';

/**
 * YouTube Music player component with persistent hidden stream,
 * expandable drawer, and minimized floating pill.
 */
export function MusicPlayer({
  musicUrl,
  setMusicUrl,
  isVisible = true,
  onClose,
  isCollapsed,
  setIsCollapsed,
  musicVolume = 75,
  setMusicVolume = () => {},
  onRestoreFocus = () => {}
}) {
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [customInput, setCustomInput] = useState('');
  const [inputFeedback, setInputFeedback] = useState(null);

  const {
    iframeRef,
    prevVolumeRef,
    parsed,
    isPlaying,
    currentTrackIndex,
    playlistIds,
    currentTitle,
    currentAuthor,
    playlistMeta,
    trackMetaMap,
    displayTitle,
    displayAuthor,
    displayThumbnail,
    syncVolume,
    handleIframeLoad,
    handleTogglePlayPause,
    handlePreviousTrack,
    handleNextTrack,
    handleSelectTrack
  } = useYouTubePlayer({ musicUrl, musicVolume });

  // Auto-close change link drawer whenever player is minimized
  const [prevCollapsedState, setPrevCollapsedState] = useState(isCollapsed);
  if (isCollapsed !== prevCollapsedState) {
    setPrevCollapsedState(isCollapsed);
    if (isCollapsed) {
      setIsPickerOpen(false);
      setInputFeedback(null);
    }
  }

  const handleApplyCustomUrl = (e) => {
    e?.preventDefault();
    if (!customInput.trim()) return;

    const lower = customInput.toLowerCase();
    if (
      !lower.includes('youtube.com') &&
      !lower.includes('youtu.be') &&
      !lower.match(/^[a-zA-Z0-9_-]{11}$/)
    ) {
      setInputFeedback('Please paste a valid YouTube or YouTube Music link');
      return;
    }

    const parsedTest = parseYouTubeUrl(customInput.trim());
    if (!parsedTest) {
      setInputFeedback('Could not find a valid video or playlist ID');
      return;
    }

    setMusicUrl(customInput.trim());
    setInputFeedback('Connected!');
    setTimeout(() => {
      setInputFeedback(null);
      setIsPickerOpen(false);
      setCustomInput('');
    }, 600);
  };

  const handleResetLink = () => {
    setMusicUrl('');
    setCustomInput('');
    setInputFeedback(null);
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Minimized player pill */}
      {isCollapsed && (
        <MusicPlayerPill
          isPlaying={isPlaying}
          displayThumbnail={displayThumbnail}
          displayTitle={displayTitle}
          onExpand={() => setIsCollapsed(false)}
        />
      )}

      {/* Expanded audio player window */}
      <div
        className="music-player-container spotify-widget-container"
        onPointerDown={(e) => e.stopPropagation()}
        style={{
          position: 'fixed',
          bottom: '96px',
          right: '36px',
          width: '380px',
          maxWidth: 'calc(100vw - 44px)',
          backgroundColor: '#121212',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: '16px',
          boxShadow: '0 24px 64px rgba(0, 0, 0, 0.6), 0 8px 24px rgba(0, 0, 0, 0.4)',
          zIndex: 996,
          overflow: 'hidden',
          backdropFilter: 'blur(20px)',
          opacity: !isCollapsed ? 1 : 0,
          transform: !isCollapsed ? 'translateY(0) scale(1)' : 'translateY(12px) scale(0.96)',
          pointerEvents: !isCollapsed ? 'auto' : 'none',
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
                backgroundColor: '#FF0000',
                boxShadow: isPlaying ? '0 0 10px #FF0000' : 'none'
              }}
            />
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#FFFFFF', letterSpacing: '-0.2px' }}>
              YouTube Music
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            {/* If a link is playing, allow toggling "Change link" */}
            {parsed && (
              <button
                onClick={() => setIsPickerOpen((prev) => !prev)}
                style={{
                  padding: '4px 9px',
                  fontSize: '11px',
                  fontWeight: 600,
                  borderRadius: '12px',
                  backgroundColor: isPickerOpen ? 'rgba(255, 0, 0, 0.2)' : 'rgba(255, 255, 255, 0.08)',
                  color: isPickerOpen ? '#FF4D4D' : '#E0E0E0',
                  border: isPickerOpen ? '1px solid #FF0000' : '1px solid transparent',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  transition: 'all 0.15s ease'
                }}
                title="Change playlist or video link"
              >
                <Link2 size={12} />
                <span>Change link</span>
              </button>
            )}

            {/* Minimize to Pill */}
            <button
              onClick={() => {
                setIsPickerOpen(false);
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
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#FFFFFF';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#B3B3B3';
              }}
              title="Minimize to Pill"
              aria-label="Minimize to Pill"
            >
              <ChevronDown size={14} />
            </button>

            {/* Close / Minimize */}
            <button
              onClick={() => {
                setIsPickerOpen(false);
                setIsCollapsed(true);
                onClose?.();
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
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#FFFFFF';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#B3B3B3';
              }}
              title="Minimize to Floating Pill"
              aria-label="Minimize to Floating Pill"
            >
              <X size={14} />
            </button>
          </div>
        </div>

        {/* Setup view for unconfigured player */}
        {!parsed && (
          <div style={{ padding: '18px 16px', backgroundColor: '#141414' }}>
            <div style={{ textAlign: 'center', marginBottom: '14px' }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(255, 0, 0, 0.12)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '8px'
                }}
              >
                <Music2 size={22} color="#FF0000" />
              </div>
              <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#FFFFFF', margin: '0 0 4px 0' }}>
                Connect Your Music Sanctuary
              </h3>
              <p style={{ fontSize: '11.5px', color: '#999999', margin: 0, lineHeight: 1.4 }}>
                Paste any YouTube Music or YouTube playlist link to listen while typing.
              </p>
            </div>

            {/* Link input form */}
            <form onSubmit={handleApplyCustomUrl} style={{ marginBottom: '14px' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                  onKeyDown={(e) => e.stopPropagation()}
                  placeholder="https://music.youtube.com/playlist?list=..."
                  autoFocus
                  style={{
                    flex: 1,
                    padding: '9px 12px',
                    borderRadius: '10px',
                    border: '1px solid rgba(255, 255, 255, 0.16)',
                    backgroundColor: '#181818',
                    color: '#FFFFFF',
                    fontSize: '12.5px',
                    outline: 'none',
                    fontFamily: 'inherit',
                    transition: 'border-color 0.15s ease'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#FF0000';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'rgba(255, 255, 255, 0.16)';
                  }}
                />
                <button
                  type="submit"
                  style={{
                    padding: '9px 14px',
                    borderRadius: '10px',
                    backgroundColor: '#FF0000',
                    color: '#FFFFFF',
                    fontWeight: 700,
                    fontSize: '12px',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#E60000';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#FF0000';
                  }}
                >
                  <Play size={12} fill="#FFFFFF" />
                  Play
                </button>
              </div>

              {inputFeedback && (
                <div
                  style={{
                    fontSize: '11px',
                    color: inputFeedback.includes('Connected') ? '#1DB954' : '#FF6B6B',
                    marginTop: '6px',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  {inputFeedback.includes('Connected') && <Check size={12} />}
                  {inputFeedback}
                </div>
              )}
            </form>
          </div>
        )}

        {/* Active playback view */}
        {parsed && (
          <>
            {/* Link change drawer */}
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
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '8px'
                    }}
                  >
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        color: '#B3B3B3',
                        textTransform: 'uppercase',
                        letterSpacing: '0.6px'
                      }}
                    >
                      Paste New YouTube Link
                    </span>
                    <button
                      type="button"
                      onClick={handleResetLink}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#FF6B6B',
                        fontSize: '11px',
                        cursor: 'pointer',
                        padding: 0,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                      title="Clear playlist link"
                    >
                      <RotateCcw size={11} />
                      <span>Reset</span>
                    </button>
                  </div>

                  <div style={{ display: 'flex', gap: '6px' }}>
                    <input
                      type="text"
                      value={customInput}
                      onChange={(e) => setCustomInput(e.target.value)}
                      onKeyDown={(e) => e.stopPropagation()}
                      placeholder="Paste YouTube or YouTube Music link..."
                      autoFocus
                      style={{
                        flex: 1,
                        padding: '7px 10px',
                        borderRadius: '8px',
                        border: '1px solid rgba(255, 255, 255, 0.16)',
                        backgroundColor: '#121212',
                        color: '#FFFFFF',
                        fontSize: '12px',
                        outline: 'none',
                        fontFamily: 'inherit'
                      }}
                    />
                    <button
                      type="submit"
                      style={{
                        padding: '7px 12px',
                        borderRadius: '8px',
                        backgroundColor: '#FF0000',
                        color: '#FFFFFF',
                        fontWeight: 600,
                        fontSize: '11.5px',
                        border: 'none',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      Apply
                    </button>
                  </div>

                  {inputFeedback && (
                    <div
                      style={{
                        fontSize: '11px',
                        color: inputFeedback.includes('Connected') ? '#1DB954' : '#FF6B6B',
                        marginTop: '6px',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      {inputFeedback.includes('Connected') && <Check size={12} />}
                      {inputFeedback}
                    </div>
                  )}
                </form>
              </div>
            )}

            {/* Currently Playing Card */}
            <div
              style={{
                padding: '14px 16px',
                borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                backgroundColor: '#161616'
              }}
            >
              {/* Thumbnail */}
              {displayThumbnail ? (
                <img
                  src={displayThumbnail}
                  alt={displayTitle}
                  style={{
                    width: '52px',
                    height: '52px',
                    borderRadius: '8px',
                    objectFit: 'cover',
                    backgroundColor: '#242424',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)',
                    flexShrink: 0
                  }}
                />
              ) : (
                <div
                  style={{
                    width: '52px',
                    height: '52px',
                    borderRadius: '8px',
                    backgroundColor: '#242424',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  <Music2 size={24} color="#FF0000" />
                </div>
              )}

              {/* Title, Artist & Track indicator */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: '13px',
                    fontWeight: 700,
                    color: '#FFFFFF',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    letterSpacing: '-0.1px'
                  }}
                  title={displayTitle}
                >
                  {displayTitle}
                </div>
                <div
                  style={{
                    fontSize: '11px',
                    color: '#A0A0A0',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    marginTop: '1px'
                  }}
                  title={displayAuthor}
                >
                  {displayAuthor}
                </div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    marginTop: '4px',
                    minWidth: 0,
                    overflow: 'hidden'
                  }}
                >
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      height: '18px',
                      boxSizing: 'border-box',
                      fontSize: '9.5px',
                      fontWeight: 600,
                      lineHeight: 1,
                      color: '#FF6B6B',
                      backgroundColor: 'rgba(255, 0, 0, 0.12)',
                      padding: '0 6px',
                      borderRadius: '4px',
                      whiteSpace: 'nowrap',
                      flexShrink: 0
                    }}
                  >
                    {playlistIds.length > 1
                      ? `Track ${currentTrackIndex + 1} of ${playlistIds.length}`
                      : 'Single Track'}
                  </span>
                  {playlistMeta?.title && playlistMeta.title !== displayTitle && (
                    <>
                      <span
                        style={{
                          width: '3px',
                          height: '3px',
                          borderRadius: '50%',
                          backgroundColor: '#666666',
                          flexShrink: 0
                        }}
                      />
                      <span
                        style={{
                          fontSize: '10px',
                          lineHeight: '18px',
                          color: '#777777',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          minWidth: 0,
                          flex: 1
                        }}
                        title={playlistMeta.title}
                      >
                        {playlistMeta.title}
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Playback Controls & Expandable Hover Volume Controller */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '3px', flexShrink: 0 }}>
                <button
                  type="button"
                  onClick={handlePreviousTrack}
                  disabled={currentTrackIndex <= 0 && playlistIds.length <= 1}
                  style={{
                    padding: '6px',
                    borderRadius: '50%',
                    backgroundColor: 'transparent',
                    border: 'none',
                    color: currentTrackIndex > 0 ? '#FFFFFF' : '#666666',
                    cursor: currentTrackIndex > 0 ? 'pointer' : 'default',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.15s ease'
                  }}
                  title="Previous Track"
                  aria-label="Previous Track"
                >
                  <SkipBack size={16} />
                </button>

                <button
                  type="button"
                  onClick={handleTogglePlayPause}
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    backgroundColor: '#FF0000',
                    border: 'none',
                    color: '#FFFFFF',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 14px rgba(255, 0, 0, 0.4)',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#E60000';
                    e.currentTarget.style.transform = 'scale(1.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#FF0000';
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                  title={isPlaying ? 'Pause' : 'Play'}
                  aria-label={isPlaying ? 'Pause' : 'Play'}
                >
                  {isPlaying ? <Pause size={17} fill="#FFFFFF" /> : <Play size={17} fill="#FFFFFF" style={{ marginLeft: '2px' }} />}
                </button>

                <button
                  type="button"
                  onClick={handleNextTrack}
                  disabled={playlistIds.length <= 1 || currentTrackIndex >= playlistIds.length - 1}
                  style={{
                    padding: '6px',
                    borderRadius: '50%',
                    backgroundColor: 'transparent',
                    border: 'none',
                    color:
                      playlistIds.length > 1 && currentTrackIndex < playlistIds.length - 1
                        ? '#FFFFFF'
                        : '#666666',
                    cursor:
                      playlistIds.length > 1 && currentTrackIndex < playlistIds.length - 1
                        ? 'pointer'
                        : 'default',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.15s ease'
                  }}
                  title="Next Track"
                  aria-label="Next Track"
                >
                  <SkipForward size={16} />
                </button>

                {/* Modular Volume Controller */}
                <VolumeControl
                  musicVolume={musicVolume}
                  setMusicVolume={setMusicVolume}
                  syncVolume={syncVolume}
                  prevVolumeRef={prevVolumeRef}
                />
              </div>
            </div>

            {/* Modular Playlist Tracklist */}
            <TrackList
              playlistIds={playlistIds}
              currentTrackIndex={currentTrackIndex}
              currentTitle={currentTitle}
              currentAuthor={currentAuthor}
              playlistMeta={playlistMeta}
              trackMetaMap={trackMetaMap}
              isPlaying={isPlaying}
              handleSelectTrack={handleSelectTrack}
            />

            {/* Hidden audio playback iframe */}
            <div
              style={{
                position: 'absolute',
                width: '1px',
                height: '1px',
                opacity: 0,
                pointerEvents: 'none',
                overflow: 'hidden',
                bottom: 0,
                right: 0,
                zIndex: -1
              }}
              aria-hidden="true"
            >
              <iframe
                key={parsed.embedUrl}
                ref={iframeRef}
                id="yt-hidden-audio-iframe"
                title="YouTube Audio Stream"
                src={parsed.embedUrl}
                width="1"
                height="1"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                loading="eager"
                onLoad={handleIframeLoad}
              />
            </div>
          </>
        )}
      </div>
    </>
  );
}
