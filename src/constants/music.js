/**
 * Curated Cozy YouTube Music Presets and URL Parser
 * Supports:
 * - https://music.youtube.com/watch?v=ID
 * - https://music.youtube.com/playlist?list=ID
 * - https://www.youtube.com/watch?v=ID
 * - https://youtu.be/ID
 * - https://www.youtube.com/playlist?list=ID
 * - Raw 11-char video ID
 */

// Empty by default: user is prompted for their playlist/video link right away
export const DEFAULT_MUSIC_URL = '';

/**
 * Parses any YouTube or YouTube Music link and returns clean video/playlist embed data.
 * Supports:
 * - https://music.youtube.com/watch?v=ID
 * - https://music.youtube.com/playlist?list=ID
 * - https://www.youtube.com/watch?v=ID
 * - https://youtu.be/ID
 * - https://www.youtube.com/shorts/ID
 * - https://www.youtube.com/playlist?list=ID
 * - Raw 11-char video ID
 * Returns null if input is empty or invalid.
 */
export function parseYouTubeUrl(input) {
  if (!input || typeof input !== 'string' || !input.trim()) {
    return null;
  }

  const trimmed = input.trim();
  const origin = typeof window !== 'undefined' && window.location?.origin ? window.location.origin : '';
  const originParam = origin ? `&origin=${encodeURIComponent(origin)}` : '';

  // 1. Extract Video ID if present
  let vidId = null;
  const watchMatch = trimmed.match(/[?&]v=([a-zA-Z0-9_-]{11})/i);
  const youtuBeMatch = trimmed.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/i);
  const shortsMatch = trimmed.match(/\/shorts\/([a-zA-Z0-9_-]{11})/i);
  const embedMatch = trimmed.match(/\/embed\/([a-zA-Z0-9_-]{11})/i);
  const rawIdMatch = trimmed.match(/^[a-zA-Z0-9_-]{11}$/);

  if (watchMatch) {
    vidId = watchMatch[1];
  } else if (youtuBeMatch) {
    vidId = youtuBeMatch[1];
  } else if (shortsMatch) {
    vidId = shortsMatch[1];
  } else if (embedMatch) {
    vidId = embedMatch[1];
  } else if (rawIdMatch) {
    vidId = trimmed;
  }

  // 2. Extract Playlist ID if present
  const playlistMatch = trimmed.match(/[?&]list=([a-zA-Z0-9_-]+)/i);
  const listId = playlistMatch ? playlistMatch[1] : null;

  // Case A: Specific Video found
  if (vidId) {
    if (listId) {
      return {
        type: 'playlist',
        id: listId,
        videoId: vidId,
        embedUrl: `https://www.youtube.com/embed/${vidId}?list=${listId}&enablejsapi=1${originParam}&autoplay=1`
      };
    }
    // Single video
    return {
      type: 'video',
      id: vidId,
      videoId: vidId,
      embedUrl: `https://www.youtube.com/embed/${vidId}?enablejsapi=1${originParam}&autoplay=1`
    };
  }

  // Case B: Pure playlist link without video ID
  if (listId) {
    return {
      type: 'playlist',
      id: listId,
      videoId: null,
      embedUrl: `https://www.youtube.com/embed/videoseries?list=${listId}&enablejsapi=1${originParam}&autoplay=1`
    };
  }

  return null;
}
