import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
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

export function useYouTubePlayer({ musicUrl, musicVolume = 75 }) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [playlistIds, setPlaylistIds] = useState([]);
  const [currentVideoId, setCurrentVideoId] = useState(null);
  const [currentTitle, setCurrentTitle] = useState('');
  const [currentAuthor, setCurrentAuthor] = useState('');
  const [playlistMeta, setPlaylistMeta] = useState(null);
  const [trackMetaMap, setTrackMetaMap] = useState({});

  const iframeRef = useRef(null);
  const ytPlayerRef = useRef(null);
  const prevVolumeRef = useRef(musicVolume > 0 ? musicVolume : 75);
  const fetchedTrackIdsRef = useRef(new Set());

  const parsed = useMemo(() => parseYouTubeUrl(musicUrl), [musicUrl]);

  // Adjust state when musicUrl prop changes
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

  // Fetch individual track titles/thumbnails for items in playlistIds
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

  // Send control command to YouTube player
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

  // YouTube postMessage listener
  useEffect(() => {
    const handleWindowMessage = (e) => {
      if (!e.data || typeof e.data !== 'string') return;
      try {
        const payload = JSON.parse(e.data);
        if (payload.event === 'infoDelivery' && payload.info) {
          const info = payload.info;

          if (typeof info.playerState === 'number') {
            setIsPlaying(info.playerState === 1);
          }

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

  const handleIframeLoad = useCallback(() => {
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
  }, [musicVolume, syncVolume]);

  const handleTogglePlayPause = useCallback(() => {
    if (isPlaying) {
      sendPlayerCommand('pauseVideo');
      setIsPlaying(false);
    } else {
      sendPlayerCommand('playVideo');
      setIsPlaying(true);
    }
  }, [isPlaying, sendPlayerCommand]);

  const handlePreviousTrack = useCallback(() => {
    sendPlayerCommand('previousVideo');
    if (currentTrackIndex > 0) {
      setCurrentTrackIndex((prev) => prev - 1);
    }
    setIsPlaying(true);
  }, [currentTrackIndex, sendPlayerCommand]);

  const handleNextTrack = useCallback(() => {
    sendPlayerCommand('nextVideo');
    if (currentTrackIndex < playlistIds.length - 1) {
      setCurrentTrackIndex((prev) => prev + 1);
    }
    setIsPlaying(true);
  }, [currentTrackIndex, playlistIds.length, sendPlayerCommand]);

  const handleSelectTrack = useCallback((index) => {
    sendPlayerCommand('playVideoAt', [index]);
    setCurrentTrackIndex(index);
    setIsPlaying(true);
  }, [sendPlayerCommand]);

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

  return {
    iframeRef,
    ytPlayerRef,
    prevVolumeRef,
    parsed,
    embedUrl,
    isPlaying,
    currentTrackIndex,
    playlistIds,
    currentVideoId,
    currentTitle,
    currentAuthor,
    playlistMeta,
    trackMetaMap,
    activeVideoId,
    displayTitle,
    displayAuthor,
    displayThumbnail,
    syncVolume,
    handleIframeLoad,
    handleTogglePlayPause,
    handlePreviousTrack,
    handleNextTrack,
    handleSelectTrack
  };
}
