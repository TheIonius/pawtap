/**
 * Curated Cozy YouTube Music Presets and URL Parser
 * Supports:
 * - https://music.youtube.com/watch?v=ID
 * - https://music.youtube.com/playlist?list=ID
 * - https://www.youtube.com/watch?v=ID
 * - https://youtu.be/ID
 * - https://www.youtube.com/playlist?list=ID
 * - Raw video ID
 */

export const YOUTUBE_PRESETS = [
  {
    id: 'lofi-girl',
    name: 'Lofi Girl Live',
    desc: '24/7 beats to relax, study, and type to',
    icon: '☕',
    url: 'https://www.youtube.com/watch?v=jfKfPfyJRdk'
  },
  {
    id: 'peaceful-piano',
    name: 'Peaceful Piano',
    desc: 'Gentle, soothing piano melodies',
    icon: '🎹',
    url: 'https://www.youtube.com/watch?v=lCOF9LN_Zxs'
  },
  {
    id: 'synthwave-chill',
    name: 'Synthwave Chill',
    desc: 'Calm retro synthwave & lofi beats',
    icon: '🌆',
    url: 'https://www.youtube.com/watch?v=4xDzrJKXOOY'
  },
  {
    id: 'coffee-shop',
    name: 'Cozy Coffeehouse',
    desc: 'Warm acoustic indie cafe atmosphere',
    icon: '🥐',
    url: 'https://www.youtube.com/watch?v=Dx5qFachd3A'
  }
];

export const DEFAULT_MUSIC_URL = YOUTUBE_PRESETS[0].url;

/**
 * Parses any YouTube or YouTube Music link and returns clean video/playlist data.
 */
export function parseYouTubeUrl(input) {
  if (!input || typeof input !== 'string') {
    return {
      type: 'video',
      id: 'jfKfPfyJRdk',
      embedUrl: 'https://www.youtube.com/embed/jfKfPfyJRdk?enablejsapi=1'
    };
  }

  const trimmed = input.trim();

  // 1. Playlist
  const playlistMatch = trimmed.match(/[?&]list=([a-zA-Z0-9_-]+)/i);
  if (playlistMatch) {
    const listId = playlistMatch[1];
    return {
      type: 'playlist',
      id: listId,
      embedUrl: `https://www.youtube.com/embed/videoseries?list=${listId}&enablejsapi=1`
    };
  }

  // 2. Shortened link: youtu.be/ID
  const youtuBeMatch = trimmed.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/i);
  if (youtuBeMatch) {
    const vidId = youtuBeMatch[1];
    return {
      type: 'video',
      id: vidId,
      embedUrl: `https://www.youtube.com/embed/${vidId}?enablejsapi=1`
    };
  }

  // 3. Standard watch link: v=ID (music.youtube.com or youtube.com)
  const watchMatch = trimmed.match(/[?&]v=([a-zA-Z0-9_-]{11})/i);
  if (watchMatch) {
    const vidId = watchMatch[1];
    return {
      type: 'video',
      id: vidId,
      embedUrl: `https://www.youtube.com/embed/${vidId}?enablejsapi=1`
    };
  }

  // 4. Already an embed URL
  const embedMatch = trimmed.match(/\/embed\/([a-zA-Z0-9_-]{11})/i);
  if (embedMatch) {
    const vidId = embedMatch[1];
    return {
      type: 'video',
      id: vidId,
      embedUrl: `https://www.youtube.com/embed/${vidId}?enablejsapi=1`
    };
  }

  // 5. Raw video ID (11 chars)
  const rawIdMatch = trimmed.match(/^[a-zA-Z0-9_-]{11}$/);
  if (rawIdMatch) {
    return {
      type: 'video',
      id: trimmed,
      embedUrl: `https://www.youtube.com/embed/${trimmed}?enablejsapi=1`
    };
  }

  // Fallback default
  return {
    type: 'video',
    id: 'jfKfPfyJRdk',
    embedUrl: 'https://www.youtube.com/embed/jfKfPfyJRdk?enablejsapi=1'
  };
}
