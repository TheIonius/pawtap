import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
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
  Pause,
  SkipBack,
  SkipForward,
  ListMusic,
  RotateCcw,
  Loader2
} from 'lucide-react';
import { parseYouTubeUrl } from '../constants/music';

// Helper to load YouTube IFrame Player API script once
let ytApiPromise = null;
function loadYouTubeIframeApi() {
  if (ytApiPromise) return ytApiPromise;

  ytApiPromise = new Promise((resolve) => {
    if (typeof window !== 'undefined' && window.YT && window.YT.Player) {
      resolve(window.YT);
      return;
    }
    if (typeof document !== 'undefined') {
      const existingScript = document.getElementById('yt-iframe-api-script');
      if (!existingScript) {
        const tag = document.createElement('script');
        tag.id = 'yt-iframe-api-script';
        tag.src = 'https://www.youtube.com/iframe_api';
        const firstScript = document.getElementsByTagName('script')[0];
        if (firstScript && firstScript.parentNode) {
          firstScript.parentNode.insertBefore(tag, firstScript);
        } else {
          document.head.appendChild(tag);
        }
      }

      const prevCallback = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        if (typeof prevCallback === 'function') prevCallback();
        resolve(window.YT);
      };

      const checkInterval = setInterval(() => {
        if (window.YT && window.YT.Player) {
          clearInterval(checkInterval);
          resolve(window.YT);
        }
      }, 80);
    }
  });

  return ytApiPromise;
}

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

  // Playback & Playlist state
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [playlistIds, setPlaylistIds] = useState([]);
  const [currentVideoId, setCurrentVideoId] = useState(null);
  const [currentTitle, setCurrentTitle] = useState('');
  const [currentAuthor, setCurrentAuthor] = useState('');
  const [playlistMeta, setPlaylistMeta] = useState(null);
  const [trackMetaMap, setTrackMetaMap] = useState({});
  const [isVolumeHovered, setIsVolumeHovered] = useState(false);
  const [isVolumeDragging, setIsVolumeDragging] = useState(false);
  const isVolumeVisible = isVolumeHovered || isVolumeDragging;

  const iframeRef = useRef(null);
  const ytPlayerRef = useRef(null);
  const prevVolumeRef = useRef(musicVolume > 0 ? musicVolume : 75);
  const fetchedTrackIdsRef = useRef(new Set());

  const parsed = useMemo(() => parseYouTubeUrl(musicUrl), [musicUrl]);

  // Adjust state during render when musicUrl prop changes (React recommended pattern)
  const [prevParsedUrl, setPrevParsedUrl] = useState(musicUrl);
  if (musicUrl !== prevParsedUrl) {
    setPrevParsedUrl(musicUrl);
    setTrackMetaMap({});
    if (!parsed) {
      setPlaylistIds([]);
      setCurrentVideoId(null);
      setCurrentTitle('');
      setCurrentAuthor('');
      setPlaylistMeta(null);
      setCurrentTrackIndex(0);
      setIsPlaying(false);
    } else {
      if (parsed.videoId) {
        setCurrentVideoId(parsed.videoId);
        setPlaylistIds([parsed.videoId]);
      } else if (parsed.type === 'video' && parsed.id) {
        setCurrentVideoId(parsed.id);
        setPlaylistIds([parsed.id]);
      } else {
        setPlaylistIds([]);
      }
      setCurrentTrackIndex(0);
      setIsPlaying(true);
    }
  }

  // Reset track cache when musicUrl changes
  useEffect(() => {
    fetchedTrackIdsRef.current.clear();
  }, [musicUrl]);

  // Keep track of non-zero volume for unmuting
  useEffect(() => {
    if (musicVolume > 0) {
      prevVolumeRef.current = musicVolume;
    }
  }, [musicVolume]);

  // Release dragging state on global pointerup
  useEffect(() => {
    if (!isVolumeDragging) return;
    const handlePointerUp = () => setIsVolumeDragging(false);
    window.addEventListener('pointerup', handlePointerUp);
    return () => window.removeEventListener('pointerup', handlePointerUp);
  }, [isVolumeDragging]);

  // Auto-close change link drawer whenever player is minimized or collapsed
  const [prevCollapsedState, setPrevCollapsedState] = useState(isCollapsed);
  if (isCollapsed !== prevCollapsedState) {
    setPrevCollapsedState(isCollapsed);
    if (isCollapsed) {
      setIsPickerOpen(false);
      setInputFeedback(null);
    }
  }

  // Fetch playlist-level metadata via oEmbed
  useEffect(() => {
    if (!parsed) return;

    let isMounted = true;
    const targetUrl = parsed.type === 'playlist'
      ? `https://www.youtube.com/playlist?list=${parsed.id}`
      : `https://www.youtube.com/watch?v=${parsed.id}`;

    fetch(`https://www.youtube.com/oembed?url=${encodeURIComponent(targetUrl)}&format=json`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!isMounted || !data) return;
        setPlaylistMeta({
          title: data.title || '',
          author: data.author_name || 'YouTube Music',
          thumbnail: data.thumbnail_url || (parsed.videoId ? `https://i.ytimg.com/vi/${parsed.videoId}/hqdefault.jpg` : null)
        });
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, [parsed]);

  // Fetch individual track titles/thumbnails for every item in playlistIds
  useEffect(() => {
    if (!playlistIds || playlistIds.length === 0) return;

    let isMounted = true;
    const missing = playlistIds.filter((id) => !fetchedTrackIdsRef.current.has(id));
    if (missing.length === 0) return;

    missing.forEach((id) => fetchedTrackIdsRef.current.add(id));

    missing.forEach((id) => {
      fetch(`https://www.youtube.com/oembed?url=${encodeURIComponent(`https://www.youtube.com/watch?v=${id}`)}&format=json`)
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (!isMounted || !data) return;
          setTrackMetaMap((prev) => ({
            ...prev,
            [id]: {
              title: data.title || '',
              author: data.author_name || 'YouTube Music',
              thumbnail: data.thumbnail_url || `https://i.ytimg.com/vi/${id}/mqdefault.jpg`
            }
          }));
        })
        .catch(() => {});
    });

    return () => {
      isMounted = false;
    };
  }, [playlistIds]);

  // Send control command to YouTube player (via postMessage and YT.Player object)
  const sendPlayerCommand = useCallback((func, args = []) => {
    if (ytPlayerRef.current && typeof ytPlayerRef.current[func] === 'function') {
      try {
        ytPlayerRef.current[func](...args);
      } catch {
        // fallback to postMessage
      }
    }
    const iframe = iframeRef.current;
    if (iframe && iframe.contentWindow) {
      try {
        iframe.contentWindow.postMessage(
          JSON.stringify({
            event: 'command',
            func: func,
            args: args
          }),
          '*'
        );
      } catch {
        // ignore cross-origin error
      }
    }
  }, []);

  // Sync volume to YouTube embed
  const syncVolume = useCallback((vol) => {
    sendPlayerCommand('setVolume', [vol]);
    if (vol === 0) {
      sendPlayerCommand('mute');
    } else {
      sendPlayerCommand('unMute');
    }
  }, [sendPlayerCommand]);

  // YouTube postMessage listener to capture real-time player events and playlist queues
  useEffect(() => {
    const handleWindowMessage = (e) => {
      if (!e.data || typeof e.data !== 'string') return;
      try {
        const payload = JSON.parse(e.data);
        if (payload.event === 'infoDelivery' && payload.info) {
          const info = payload.info;

          // 1. Playback State (1 = PLAYING, 2 = PAUSED, 0 = ENDED, 3 = BUFFERING)
          if (typeof info.playerState === 'number') {
            setIsPlaying(info.playerState === 1);
          }

          // 2. Currently Playing Video Metadata
          if (info.videoData) {
            if (info.videoData.video_id) {
              setCurrentVideoId(info.videoData.video_id);
              setPlaylistIds((prev) => (prev.length === 0 ? [info.videoData.video_id] : prev));
            }
            if (info.videoData.title) {
              setCurrentTitle(info.videoData.title);
            }
            if (info.videoData.author) {
              setCurrentAuthor(info.videoData.author);
            }
          }

          // 3. Playlist Video IDs Array
          if (Array.isArray(info.playlist) && info.playlist.length > 0) {
            setPlaylistIds((prev) => {
              if (
                prev.length === info.playlist.length &&
                prev.every((val, idx) => val === info.playlist[idx])
              ) {
                return prev;
              }
              return info.playlist;
            });
          }

          // 4. Playlist Index
          if (typeof info.playlistIndex === 'number' && info.playlistIndex >= 0) {
            setCurrentTrackIndex(info.playlistIndex);
          }
        }
      } catch {
        // Ignore non-json or unrelated messages
      }
    };

    window.addEventListener('message', handleWindowMessage);
    return () => window.removeEventListener('message', handleWindowMessage);
  }, []);

  const embedUrl = parsed?.embedUrl;

  // Initialize YouTube Iframe Player API instance on iframe
  useEffect(() => {
    if (!embedUrl) return;

    let isMounted = true;
    let pollInterval = null;

    loadYouTubeIframeApi().then((YT) => {
      if (!isMounted || !iframeRef.current) return;

      try {
        ytPlayerRef.current = new YT.Player(iframeRef.current, {
          events: {
            onReady: (event) => {
              if (!isMounted) return;
              try {
                event.target.setVolume(prevVolumeRef.current);

                const list = event.target.getPlaylist();
                if (Array.isArray(list) && list.length > 0) {
                  setPlaylistIds(list);
                }
                const idx = event.target.getPlaylistIndex();
                if (typeof idx === 'number' && idx >= 0) {
                  setCurrentTrackIndex(idx);
                }
                const vData = event.target.getVideoData();
                if (vData) {
                  if (vData.video_id) {
                    setCurrentVideoId(vData.video_id);
                    setPlaylistIds((prev) => (prev.length === 0 ? [vData.video_id] : prev));
                  }
                  if (vData.title) setCurrentTitle(vData.title);
                  if (vData.author) setCurrentAuthor(vData.author);
                }
              } catch {
                // ignore
              }
            },
            onStateChange: (event) => {
              if (!isMounted) return;
              setIsPlaying(event.data === 1);

              try {
                const list = event.target.getPlaylist();
                if (Array.isArray(list) && list.length > 0) {
                  setPlaylistIds(list);
                }
                const idx = event.target.getPlaylistIndex();
                if (typeof idx === 'number' && idx >= 0) {
                  setCurrentTrackIndex(idx);
                }
                const vData = event.target.getVideoData();
                if (vData) {
                  if (vData.video_id) {
                    setCurrentVideoId(vData.video_id);
                    setPlaylistIds((prev) => (prev.length === 0 ? [vData.video_id] : prev));
                  }
                  if (vData.title) setCurrentTitle(vData.title);
                  if (vData.author) setCurrentAuthor(vData.author);
                }
              } catch {
                // ignore
              }
            }
          }
        });

        // Polling to catch playlist IDs once buffering starts
        let polls = 0;
        pollInterval = setInterval(() => {
          if (!isMounted) return;
          polls += 1;
          try {
            // Handshake message to iframe to trigger infoDelivery stream
            iframeRef.current?.contentWindow?.postMessage(
              JSON.stringify({ event: 'listening' }),
              '*'
            );

            if (ytPlayerRef.current) {
              const list = ytPlayerRef.current.getPlaylist?.();
              if (Array.isArray(list) && list.length > 0) {
                setPlaylistIds(list);
                const idx = ytPlayerRef.current.getPlaylistIndex?.();
                if (typeof idx === 'number' && idx >= 0) {
                  setCurrentTrackIndex(idx);
                }
                const vData = ytPlayerRef.current.getVideoData?.();
                if (vData) {
                  if (vData.video_id) {
                    setCurrentVideoId(vData.video_id);
                    setPlaylistIds((prev) => (prev.length === 0 ? [vData.video_id] : prev));
                  }
                  if (vData.title) setCurrentTitle(vData.title);
                  if (vData.author) setCurrentAuthor(vData.author);
                }
                clearInterval(pollInterval);
              }
            }
          } catch {
            // ignore
          }
          if (polls > 15) clearInterval(pollInterval);
        }, 400);
      } catch {
        // ignore
      }
    });

    return () => {
      isMounted = false;
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [embedUrl]);

  // Sync volume without re-initializing player
  useEffect(() => {
    syncVolume(musicVolume);
  }, [musicVolume, syncVolume]);

  const handleIframeLoad = () => {
    const iframe = iframeRef.current;
    if (iframe && iframe.contentWindow) {
      try {
        iframe.contentWindow.postMessage(JSON.stringify({ event: 'listening' }), '*');
      } catch {
        // ignore
      }
    }
    setTimeout(() => {
      syncVolume(musicVolume);
    }, 400);
  };

  const handleTogglePlayPause = () => {
    if (isPlaying) {
      sendPlayerCommand('pauseVideo');
      setIsPlaying(false);
    } else {
      sendPlayerCommand('playVideo');
      setIsPlaying(true);
    }
  };

  const handlePreviousTrack = () => {
    sendPlayerCommand('previousVideo');
    if (currentTrackIndex > 0) {
      setCurrentTrackIndex((prev) => prev - 1);
    }
    setIsPlaying(true);
  };

  const handleNextTrack = () => {
    sendPlayerCommand('nextVideo');
    if (currentTrackIndex < playlistIds.length - 1) {
      setCurrentTrackIndex((prev) => prev + 1);
    }
    setIsPlaying(true);
  };

  const handleSelectTrack = (index) => {
    sendPlayerCommand('playVideoAt', [index]);
    setCurrentTrackIndex(index);
    setIsPlaying(true);
  };

  const handleVolumeChange = (e) => {
    const newVol = parseInt(e.target.value, 10);
    setMusicVolume(newVol);
    syncVolume(newVol);
  };

  const handleToggleMute = () => {
    if (musicVolume > 0) {
      setMusicVolume(0);
      syncVolume(0);
    } else {
      const restored = prevVolumeRef.current > 0 ? prevVolumeRef.current : 75;
      setMusicVolume(restored);
      syncVolume(restored);
    }
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

  const handleResetLink = () => {
    setMusicUrl('');
    setCustomInput('');
    setInputFeedback(null);
  };

  if (!isVisible) return null;

  // Active track details
  const activeVideoId =
    currentVideoId ||
    (playlistIds.length > 0 && playlistIds[currentTrackIndex]) ||
    parsed?.videoId ||
    parsed?.id ||
    null;

  const activeMeta = activeVideoId ? trackMetaMap[activeVideoId] : null;

  const displayTitle =
    currentTitle ||
    activeMeta?.title ||
    playlistMeta?.title ||
    (parsed?.type === 'playlist' ? 'YouTube Music Playlist' : 'YouTube Music');

  const displayAuthor =
    currentAuthor ||
    activeMeta?.author ||
    playlistMeta?.author ||
    'YouTube Music';

  const displayThumbnail =
    (activeVideoId ? `https://i.ytimg.com/vi/${activeVideoId}/mqdefault.jpg` : null) ||
    activeMeta?.thumbnail ||
    playlistMeta?.thumbnail ||
    null;

  return (
    <>
      {/* Minimized player pill */}
      {isCollapsed && (
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
            onClick={() => setIsCollapsed(false)}
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
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = '#FF4D4D';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = '#888888';
                      }}
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
                      onKeyDown={(e) => e.stopPropagation()}
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
                      onFocus={(e) => {
                        e.target.style.borderColor = '#FF0000';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = 'rgba(255, 255, 255, 0.15)';
                      }}
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
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#E60000';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#FF0000';
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

            {/* Current track details and playback controls */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 14px',
                backgroundColor: '#161616',
                borderBottom: '1px solid rgba(255, 255, 255, 0.06)'
              }}
            >
              {/* Track cover thumbnail */}
              {displayThumbnail ? (
                <div style={{ position: 'relative', flexShrink: 0 }}>
                  <img
                    src={displayThumbnail}
                    alt={displayTitle}
                    style={{
                      width: '52px',
                      height: '52px',
                      borderRadius: '8px',
                      objectFit: 'cover',
                      boxShadow: isPlaying
                        ? '0 6px 16px rgba(255, 0, 0, 0.25), 0 2px 8px rgba(0, 0, 0, 0.5)'
                        : '0 4px 12px rgba(0, 0, 0, 0.45)',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      display: 'block',
                      transition: 'box-shadow 0.2s ease'
                    }}
                  />
                  {isPlaying && (
                    <div
                      style={{
                        position: 'absolute',
                        bottom: '3px',
                        right: '3px',
                        backgroundColor: 'rgba(0, 0, 0, 0.75)',
                        borderRadius: '4px',
                        padding: '1px 3px',
                        display: 'flex',
                        alignItems: 'flex-end',
                        gap: '2px',
                        height: '10px'
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
                </div>
              ) : (
                <div
                  style={{
                    width: '52px',
                    height: '52px',
                    borderRadius: '8px',
                    backgroundColor: 'rgba(255, 0, 0, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  <Music2 size={24} color="#FF0000" />
                </div>
              )}

              {/* Title & Artist & Counter Badge */}
              <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div
                  style={{
                    fontSize: '13px',
                    fontWeight: 700,
                    lineHeight: '17px',
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
                    lineHeight: '15px',
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

                {/* Sound changer: hides slider when not hovered, expands smoothly on hover */}
                <div
                  onMouseEnter={() => setIsVolumeHovered(true)}
                  onMouseLeave={() => setIsVolumeHovered(false)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: isVolumeVisible ? '3px 8px 3px 4px' : '3px 4px',
                    borderRadius: '16px',
                    backgroundColor: isVolumeVisible ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
                    border: isVolumeVisible ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid transparent',
                    marginLeft: '2px',
                    transition: 'background-color 0.2s ease, border-color 0.2s ease, padding 0.2s ease'
                  }}
                >
                  <button
                    type="button"
                    onClick={handleToggleMute}
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: '4px',
                      color: musicVolume > 0 ? '#FFFFFF' : '#888888',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: '50%',
                      transition: 'color 0.15s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = '#FF0000';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = musicVolume > 0 ? '#FFFFFF' : '#888888';
                    }}
                    title={musicVolume > 0 ? `Mute Music (${musicVolume}%)` : 'Unmute Music'}
                    aria-label={musicVolume > 0 ? `Mute Music (${musicVolume}%)` : 'Unmute Music'}
                  >
                    {musicVolume === 0 ? (
                      <VolumeX size={16} color="#888888" />
                    ) : musicVolume < 50 ? (
                      <Volume1 size={16} color="#FFFFFF" />
                    ) : (
                      <Volume2 size={16} color="#FFFFFF" />
                    )}
                  </button>

                  <div
                    style={{
                      width: isVolumeVisible ? '86px' : '0px',
                      opacity: isVolumeVisible ? 1 : 0,
                      overflow: 'hidden',
                      transition: 'width 0.22s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.18s ease',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      pointerEvents: isVolumeVisible ? 'auto' : 'none',
                      marginLeft: isVolumeVisible ? '2px' : '0px'
                    }}
                  >
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={musicVolume}
                      onChange={handleVolumeChange}
                      onPointerDown={() => setIsVolumeDragging(true)}
                      onKeyDown={(e) => e.stopPropagation()}
                      style={{
                        width: '54px',
                        height: '4px',
                        borderRadius: '2px',
                        accentColor: '#FF0000',
                        cursor: 'pointer'
                      }}
                      title={`Music Volume: ${musicVolume}%`}
                      aria-label="Music Volume"
                    />
                    <span
                      style={{
                        fontSize: '10.5px',
                        color: '#B3B3B3',
                        minWidth: '24px',
                        textAlign: 'right',
                        fontVariantNumeric: 'tabular-nums',
                        userSelect: 'none'
                      }}
                    >
                      {musicVolume}%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Playlist tracklist */}
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Loader2 size={13} className="spin" />
                      <span>{playlistMeta?.title ? 'Connecting to playlist tracks...' : 'Loading playlist tracks...'}</span>
                    </div>
                    {playlistMeta?.title && (
                      <div
                        style={{
                          fontSize: '10px',
                          color: '#777777',
                          maxWidth: '260px',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}
                        title={playlistMeta.title}
                      >
                        {playlistMeta.title}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

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
