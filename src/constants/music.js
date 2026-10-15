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

export const YOUTUBE_PRESETS = [
  {
    id: 'lofi-girl',
    name: 'Lofi Girl Live',
    desc: '24/7 beats to relax, study, and type to',
    icon: '☕',
    url: 'https://www.youtube.com/watch?v=5qap5aO4i9A'
  },
  {
    id: 'synthwave-chill',
    name: 'Synthwave Chill',
    desc: 'Calm retro synthwave & lofi beats',
    icon: '🌆',
    url: 'https://www.youtube.com/watch?v=4xDzrJKXOOY'
  },
  {
    id: 'peaceful-piano',
    name: 'Peaceful Piano',
    desc: 'Gentle, soothing piano melodies',
    icon: '🎹',
    url: 'https://www.youtube.com/watch?v=lCOF9LN_Zxs'
  },
  {
    id: 'coffee-shop',
    name: 'Cozy Coffeehouse',
    desc: 'Warm acoustic indie cafe atmosphere',
    icon: '🥐',
    url: 'https://www.youtube.com/watch?v=Dx5qFachd3A'
  }
];

// Empty by default: user is prompted for their playlist/video link right away
export const DEFAULT_MUSIC_URL = '';

/**
 * Parses any YouTube or YouTube Music link and returns clean video/playlist embed data.
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
  const embedMatch = trimmed.match(/\/embed\/([a-zA-Z0-9_-]{11})/i);
  const rawIdMatch = trimmed.match(/^[a-zA-Z0-9_-]{11}$/);

  if (watchMatch) {
    vidId = watchMatch[1];
  } else if (youtuBeMatch) {
    vidId = youtuBeMatch[1];
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
    // If it also points to a true public playlist or album (starts with PL, OLAK, UU), load playlist player
    if (listId && (listId.startsWith('PL') || listId.startsWith('OLAK') || listId.startsWith('UU'))) {
      return {
        type: 'playlist',
        id: listId,
        videoId: vidId,
        embedUrl: `https://www.youtube.com/embed/videoseries?list=${listId}&enablejsapi=1${originParam}`
      };
    }
    // Single video or dynamic radio mix (RDAM...) which YouTube embed cannot handle as videoseries
    return {
      type: 'video',
      id: vidId,
      videoId: vidId,
      embedUrl: `https://www.youtube.com/embed/${vidId}?enablejsapi=1${originParam}`
    };
  }

  // Case B: Pure playlist link without video ID
  if (listId) {
    return {
      type: 'playlist',
      id: listId,
      embedUrl: `https://www.youtube.com/embed/videoseries?list=${listId}&enablejsapi=1${originParam}`
    };
  }

  return null;
}
