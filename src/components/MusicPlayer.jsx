import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  ChevronDown,
  ChevronUp,
  X,
  Music2,
  Link2,
  Check,
  Volume2,
  VolumeX,
  Volume1,
  Play,
  Sparkles,
  RotateCcw
} from 'lucide-react';
import { parseYouTubeUrl, YOUTUBE_PRESETS } from '../constants/music';

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
  const iframeRef = useRef(null);
  const prevVolumeRef = useRef(musicVolume > 0 ? musicVolume : 75);

  const parsed = useMemo(() => parseYouTubeUrl(musicUrl), [musicUrl]);

  // Keep track of non-zero volume for unmuting
  useEffect(() => {
    if (musicVolume > 0) {
      prevVolumeRef.current = musicVolume;
    }
  }, [musicVolume]);

  // Sync volume to YouTube embed via postMessage API
  const syncVolumeToPlayer = (volumeValue) => {
    const iframe = iframeRef.current;
    if (iframe && iframe.contentWindow) {
      iframe.contentWindow.postMessage(
        JSON.stringify({
          event: 'command',
          func: 'setVolume',
          args: [volumeValue]
        }),
        '*'
      );
      if (volumeValue === 0) {
        iframe.contentWindow.postMessage(
          JSON.stringify({ event: 'command', func: 'mute' }),
          '*'
        );
      } else {
        iframe.contentWindow.postMessage(
          JSON.stringify({ event: 'command', func: 'unMute' }),
          '*'
        );
      }
    }
  };

  const handleVolumeChange = (e) => {
    const newVol = parseInt(e.target.value, 10);
    setMusicVolume(newVol);
    syncVolumeToPlayer(newVol);
  };

  const handleToggleMute = () => {
    if (musicVolume > 0) {
      setMusicVolume(0);
      syncVolumeToPlayer(0);
    } else {
      const restored = prevVolumeRef.current > 0 ? prevVolumeRef.current : 75;
      setMusicVolume(restored);
      syncVolumeToPlayer(restored);
    }
  };

  const handleIframeLoad = () => {
    // Send initial volume once iframe document loads
    setTimeout(() => {
      syncVolumeToPlayer(musicVolume);
    }, 600);
  };

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

  const handleSelectPreset = (presetUrl) => {
    setMusicUrl(presetUrl);
    setIsPickerOpen(false);
    setCustomInput('');
    setInputFeedback(null);
  };

  const handleResetLink = () => {
    setMusicUrl('');
    setCustomInput('');
    setInputFeedback(null);
  };

  if (!isVisible) return null;

  return (
    <>
      {/* 1. Minimized Floating Micro-Pill State (Visible by default) */}
      {isCollapsed && (
        <div
          className="music-player-container spotify-widget-container"
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
              gap: '6px',
              padding: '8px 12px',
              borderRadius: '20px',
              backgroundColor: 'rgba(18, 18, 18, 0.94)',
              border: '1px solid rgba(255, 255, 255, 0.14)',
              boxShadow: '0 10px 28px rgba(0, 0, 0, 0.45)',
              color: '#FFFFFF',
              cursor: 'pointer',
              backdropFilter: 'blur(16px)',
              transition: 'all 0.15s ease'
            }}
            title="Expand YouTube Music Player"
            aria-label="Expand YouTube Music Player"
          >
            <span
              style={{
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                backgroundColor: '#FF0000',
                boxShadow: '0 0 8px #FF0000'
              }}
            />
            <Music2 size={14} color="#FF0000" />
            <ChevronUp size={13} style={{ opacity: 0.7 }} />
          </button>
        </div>
      )}

      {/* 2. Expanded Floating Mini-Player */}
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
          boxShadow: '0 24px 64px rgba(0, 0, 0, 0.55), 0 8px 24px rgba(0, 0, 0, 0.35)',
          zIndex: 80,
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
                boxShadow: '0 0 8px #FF0000'
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
                onClick={() => setIsPickerOpen(prev => !prev)}
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

        {/* 3A. Setup View: Shown right away if no link is configured yet */}
        {!parsed && (
          <div style={{ padding: '16px 16px 18px 16px', backgroundColor: '#141414' }}>
            <div style={{ textAlign: 'center', marginBottom: '14px' }}>
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(255, 0, 0, 0.12)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '8px'
                }}
              >
                <Music2 size={20} color="#FF0000" />
              </div>
              <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#FFFFFF', margin: '0 0 4px 0' }}>
                Connect Your Music Sanctuary
              </h3>
              <p style={{ fontSize: '11.5px', color: '#999999', margin: 0, lineHeight: 1.4 }}>
                Paste any YouTube Music or YouTube playlist link to listen while typing.
              </p>
            </div>

            {/* Link Input Form */}
            <form onSubmit={handleApplyCustomUrl} style={{ marginBottom: '14px' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
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
                  onFocus={(e) => { e.target.style.borderColor = '#FF0000'; }}
                  onBlur={(e) => { e.target.style.borderColor = 'rgba(255, 255, 255, 0.16)'; }}
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
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#E60000'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#FF0000'; }}
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

            {/* Cozy Presets Section */}
            <div>
              <div
                style={{
                  fontSize: '10.5px',
                  fontWeight: 600,
                  color: '#777777',
                  textTransform: 'uppercase',
                  letterSpacing: '0.6px',
                  marginBottom: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px'
                }}
              >
                <Sparkles size={11} color="#FF0000" />
                Or start with a cozy preset
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                {YOUTUBE_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleSelectPreset(preset.url)}
                    style={{
                      padding: '8px 10px',
                      borderRadius: '10px',
                      backgroundColor: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      color: '#FFFFFF',
                      cursor: 'pointer',
                      textAlign: 'left',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      transition: 'all 0.15s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(255, 0, 0, 0.12)';
                      e.currentTarget.style.borderColor = 'rgba(255, 0, 0, 0.3)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.04)';
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                    }}
                  >
                    <span style={{ fontSize: '14px' }}>{preset.icon}</span>
                    <div style={{ overflow: 'hidden' }}>
                      <div style={{ fontSize: '11.5px', fontWeight: 600, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                        {preset.name}
                      </div>
                      <div style={{ fontSize: '9.5px', color: '#888888', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                        {preset.desc}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 3B. Active Player View: Shown when a valid link is loaded */}
        {parsed && (
          <>
            {/* Drawer to Change Link / Select Preset */}
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
                        fontWeight: 600,
                        color: '#B3B3B3',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}
                    >
                      Paste New YouTube / YT Music Link
                    </span>
                    <button
                      type="button"
                      onClick={handleResetLink}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#888888',
                        fontSize: '11px',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.color = '#FF4D4D'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.color = '#888888'; }}
                      title="Reset and clear link"
                    >
                      <RotateCcw size={11} />
                      Reset
                    </button>
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type="text"
                      value={customInput}
                      onChange={(e) => setCustomInput(e.target.value)}
                      placeholder="https://music.youtube.com/playlist?list=..."
                      autoFocus
                      style={{
                        flex: 1,
                        padding: '8px 12px',
                        borderRadius: '8px',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        backgroundColor: '#121212',
                        color: '#FFFFFF',
                        fontSize: '12px',
                        outline: 'none',
                        fontFamily: 'inherit',
                        transition: 'border-color 0.15s ease'
                      }}
                      onFocus={(e) => { e.target.style.borderColor = '#FF0000'; }}
                      onBlur={(e) => { e.target.style.borderColor = 'rgba(255, 255, 255, 0.15)'; }}
                    />
                    <button
                      type="submit"
                      style={{
                        padding: '8px 14px',
                        borderRadius: '8px',
                        backgroundColor: '#FF0000',
                        color: '#FFFFFF',
                        fontWeight: 700,
                        fontSize: '12px',
                        border: 'none',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#E60000'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#FF0000'; }}
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

                  {/* Preset Pills */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '10px' }}>
                    {YOUTUBE_PRESETS.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => handleSelectPreset(p.url)}
                        style={{
                          padding: '4px 8px',
                          borderRadius: '8px',
                          backgroundColor: 'rgba(255, 255, 255, 0.06)',
                          border: '1px solid rgba(255, 255, 255, 0.08)',
                          color: '#DDDDDD',
                          fontSize: '10.5px',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        <span>{p.icon}</span>
                        <span>{p.name}</span>
                      </button>
                    ))}
                  </div>
                </form>
              </div>
            )}

            {/* Dedicated Volume Slider Bar */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '8px 14px',
                backgroundColor: '#161616',
                borderBottom: '1px solid rgba(255, 255, 255, 0.06)'
              }}
            >
              <button
                type="button"
                onClick={handleToggleMute}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: '2px',
                  color: musicVolume > 0 ? '#FFFFFF' : '#888888',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                title={musicVolume > 0 ? "Mute Music" : "Unmute Music"}
              >
                {musicVolume === 0 ? (
                  <VolumeX size={15} color="#888888" />
                ) : musicVolume < 50 ? (
                  <Volume1 size={15} color="#FFFFFF" />
                ) : (
                  <Volume2 size={15} color="#FFFFFF" />
                )}
              </button>

              <input
                type="range"
                min="0"
                max="100"
                value={musicVolume}
                onChange={handleVolumeChange}
                style={{
                  flex: 1,
                  height: '4px',
                  borderRadius: '2px',
                  accentColor: '#FF0000',
                  cursor: 'pointer'
                }}
                title={`Music Volume: ${musicVolume}%`}
              />

              <span
                style={{
                  fontSize: '11px',
                  color: '#B3B3B3',
                  minWidth: '28px',
                  textAlign: 'right',
                  fontVariantNumeric: 'tabular-nums'
                }}
              >
                {musicVolume}%
              </span>
            </div>

            {/* YouTube Embed Player */}
            <div style={{ padding: '8px', backgroundColor: '#121212', minHeight: '180px' }}>
              <iframe
                ref={iframeRef}
                title="YouTube Music Player"
                src={parsed.embedUrl}
                width="100%"
                height="180"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                loading="eager"
                onLoad={handleIframeLoad}
                style={{
                  borderRadius: '12px',
                  border: 'none',
                  display: 'block'
                }}
              />
            </div>
          </>
        )}
      </div>
    </>
  );
}
