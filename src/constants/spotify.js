/**
 * Curated Cozy Spotify Presets and URL Parser
 */

export const SPOTIFY_PRESETS = [
  {
    id: 'lofi-beats',
    name: 'Lofi Beats',
    desc: 'Beats to relax, study, and type to',
    icon: '☕',
    uri: 'https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M'
  },
  {
    id: 'peaceful-piano',
    name: 'Peaceful Piano',
    desc: 'Gentle, soothing piano melodies',
    icon: '🎹',
    uri: 'https://open.spotify.com/playlist/37i9dQZF1DX4sWSpwq3LiO'
  },
  {
    id: 'chillhop',
    name: 'Chillhop Essentials',
    desc: 'Cozy jazzy hip hop grooves',
    icon: '🍃',
    uri: 'https://open.spotify.com/playlist/37i9dQZF1DX0SM0LYsmbMT'
  },
  {
    id: 'coffeehouse',
    name: 'Cozy Coffeehouse',
    desc: 'Warm acoustic indie cafe vibes',
    icon: '🥐',
    uri: 'https://open.spotify.com/playlist/37i9dQZF1DX6ziVCJnEm59'
  },
  {
    id: 'deep-focus',
    name: 'Deep Focus',
    desc: 'Ambient instrumental focus flow',
    icon: '🎧',
    uri: 'https://open.spotify.com/playlist/37i9dQZF1DWZeKCadgRdKQ'
  }
];

export const DEFAULT_SPOTIFY_PLAYLIST = SPOTIFY_PRESETS[0].uri;

/**
 * Extracts and constructs a clean Spotify embed URL from any user input.
 * Supports:
 * - https://open.spotify.com/playlist/ID?si=...
 * - https://open.spotify.com/album/ID
 * - https://open.spotify.com/track/ID
 * - spotify:playlist:ID
 * - Raw Spotify ID
 */
export function parseSpotifyUrl(input) {
  if (!input || typeof input !== 'string') {
    return 'https://open.spotify.com/embed/playlist/37i9dQZF1DXcBWIGoYBM5M?utm_source=generator&theme=0';
  }

  const trimmed = input.trim();

  // Already an embed URL
  if (trimmed.includes('open.spotify.com/embed/')) {
    const hasTheme = trimmed.includes('theme=');
    return hasTheme ? trimmed : `${trimmed}${trimmed.includes('?') ? '&' : '?'}theme=0`;
  }

  // URI format: spotify:playlist:37i9dQZF1DXcBWIGoYBM5M
  const uriMatch = trimmed.match(/^spotify:(playlist|album|track|show|episode):([a-zA-Z0-9]+)/);
  if (uriMatch) {
    const [, type, id] = uriMatch;
    return `https://open.spotify.com/embed/${type}/${id}?utm_source=generator&theme=0`;
  }

  // URL format: https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M (supports /intl-es/, /intl-fr/, etc. and ?si= query params)
  const urlMatch = trimmed.match(/open\.spotify\.com\/(?:intl-[a-zA-Z-]+\/)?(playlist|album|track|show|episode)\/([a-zA-Z0-9]+)/i);
  if (urlMatch) {
    const [, type, id] = urlMatch;
    return `https://open.spotify.com/embed/${type}/${id}?utm_source=generator&theme=0`;
  }

  // If user pasted just a raw alphanumeric ID, assume playlist
  const idOnlyMatch = trimmed.match(/^[a-zA-Z0-9]{22}$/);
  if (idOnlyMatch) {
    return `https://open.spotify.com/embed/playlist/${trimmed}?utm_source=generator&theme=0`;
  }

  // Fallback to default Lofi Beats
  return 'https://open.spotify.com/embed/playlist/37i9dQZF1DXcBWIGoYBM5M?utm_source=generator&theme=0';
}
