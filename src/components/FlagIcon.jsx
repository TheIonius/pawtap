import React from 'react';

/**
 * Pixel-crisp vector SVG flags for supported languages.
 * Completely cross-platform (renders identical on Windows, macOS, Linux, iOS, Android).
 * Zero Unicode emoji dependency (respects 0-emoji design standard).
 */
export function FlagIcon({ langId, width = 24, height = 16, style = {} }) {
  const containerStyle = {
    width: `${width}px`,
    height: `${height}px`,
    borderRadius: '3px',
    overflow: 'hidden',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    boxShadow: '0 0 0 1px rgba(0, 0, 0, 0.15)',
    verticalAlign: 'middle',
    ...style
  };

  switch (langId) {
    case 'english':
      // United States Flag
      return (
        <span style={containerStyle} title="English (United States)">
          <svg viewBox="0 0 60 40" width="100%" height="100%">
            <rect width="60" height="40" fill="#B22234" />
            <rect y="3.08" width="60" height="3.08" fill="#FFFFFF" />
            <rect y="9.23" width="60" height="3.08" fill="#FFFFFF" />
            <rect y="15.38" width="60" height="3.08" fill="#FFFFFF" />
            <rect y="21.54" width="60" height="3.08" fill="#FFFFFF" />
            <rect y="27.69" width="60" height="3.08" fill="#FFFFFF" />
            <rect y="33.85" width="60" height="3.08" fill="#FFFFFF" />
            <rect width="24" height="21.54" fill="#3C3B6E" />
            <g fill="#FFFFFF">
              <circle cx="4" cy="4" r="1.1" />
              <circle cx="8" cy="4" r="1.1" />
              <circle cx="12" cy="4" r="1.1" />
              <circle cx="16" cy="4" r="1.1" />
              <circle cx="20" cy="4" r="1.1" />
              <circle cx="6" cy="7.5" r="1.1" />
              <circle cx="10" cy="7.5" r="1.1" />
              <circle cx="14" cy="7.5" r="1.1" />
              <circle cx="18" cy="7.5" r="1.1" />
              <circle cx="4" cy="11" r="1.1" />
              <circle cx="8" cy="11" r="1.1" />
              <circle cx="12" cy="11" r="1.1" />
              <circle cx="16" cy="11" r="1.1" />
              <circle cx="20" cy="11" r="1.1" />
              <circle cx="6" cy="14.5" r="1.1" />
              <circle cx="10" cy="14.5" r="1.1" />
              <circle cx="14" cy="14.5" r="1.1" />
              <circle cx="18" cy="14.5" r="1.1" />
              <circle cx="4" cy="18" r="1.1" />
              <circle cx="8" cy="18" r="1.1" />
              <circle cx="12" cy="18" r="1.1" />
              <circle cx="16" cy="18" r="1.1" />
              <circle cx="20" cy="18" r="1.1" />
            </g>
          </svg>
        </span>
      );

    case 'english_cozy':
      // United Kingdom (Union Jack)
      return (
        <span style={containerStyle} title="Cozy English (United Kingdom)">
          <svg viewBox="0 0 60 40" width="100%" height="100%">
            <rect width="60" height="40" fill="#012169" />
            <path d="M0,0 L60,40 M60,0 L0,40" stroke="#FFFFFF" strokeWidth="8" />
            <path d="M0,0 L30,20 M60,40 L30,20 M60,0 L30,20 M0,40 L30,20" stroke="#C8102E" strokeWidth="4.5" />
            <path d="M30,0 V40 M0,20 H60" stroke="#FFFFFF" strokeWidth="12" />
            <path d="M30,0 V40 M0,20 H60" stroke="#C8102E" strokeWidth="7.2" />
          </svg>
        </span>
      );

    case 'spanish':
      // Spain Flag
      return (
        <span style={containerStyle} title="Español (Spain)">
          <svg viewBox="0 0 60 40" width="100%" height="100%">
            <rect width="60" height="10" fill="#AA151B" />
            <rect y="10" width="60" height="20" fill="#F1BF00" />
            <rect y="30" width="60" height="10" fill="#AA151B" />
            <rect x="11.5" y="16" width="6.5" height="8.5" rx="1.5" fill="#AA151B" />
            <path d="M12,18 H17 V21.5 Q14.5,24 12,21.5 Z" fill="#F1BF00" />
            <circle cx="14.7" cy="14.2" r="1.8" fill="#C69200" />
            <rect x="9.5" y="16" width="1.3" height="8.5" fill="#C69200" />
            <rect x="18.8" y="16" width="1.3" height="8.5" fill="#C69200" />
          </svg>
        </span>
      );

    case 'french':
      // France Flag
      return (
        <span style={containerStyle} title="Français (France)">
          <svg viewBox="0 0 60 40" width="100%" height="100%">
            <rect width="20" height="40" fill="#002654" />
            <rect x="20" width="20" height="40" fill="#FFFFFF" />
            <rect x="40" width="20" height="40" fill="#ED2939" />
          </svg>
        </span>
      );

    case 'german':
      // Germany Flag
      return (
        <span style={containerStyle} title="Deutsch (Germany)">
          <svg viewBox="0 0 60 40" width="100%" height="100%">
            <rect width="60" height="13.33" fill="#000000" />
            <rect y="13.33" width="60" height="13.34" fill="#DD0000" />
            <rect y="26.67" width="60" height="13.33" fill="#FFCC00" />
          </svg>
        </span>
      );

    case 'italian':
      // Italy Flag
      return (
        <span style={containerStyle} title="Italiano (Italy)">
          <svg viewBox="0 0 60 40" width="100%" height="100%">
            <rect width="20" height="40" fill="#009246" />
            <rect x="20" width="20" height="40" fill="#FFFFFF" />
            <rect x="40" width="20" height="40" fill="#CE2B37" />
          </svg>
        </span>
      );

    case 'portuguese':
      // Portugal Flag
      return (
        <span style={containerStyle} title="Português (Portugal)">
          <svg viewBox="0 0 60 40" width="100%" height="100%">
            <rect width="24" height="40" fill="#006600" />
            <rect x="24" width="36" height="40" fill="#FF0000" />
            <circle cx="24" cy="20" r="7.5" fill="#FFCC00" stroke="#B8860B" strokeWidth="0.8" />
            <path d="M21.5,16.5 H26.5 V21.5 Q24,25 21.5,21.5 Z" fill="#FFFFFF" />
            <path d="M22.5,17.5 H25.5 V21 Q24,23.5 22.5,21 Z" fill="#002654" />
          </svg>
        </span>
      );

    case 'dutch':
      // Netherlands Flag
      return (
        <span style={containerStyle} title="Nederlands (Netherlands)">
          <svg viewBox="0 0 60 40" width="100%" height="100%">
            <rect width="60" height="13.33" fill="#AE1C28" />
            <rect y="13.33" width="60" height="13.34" fill="#FFFFFF" />
            <rect y="26.67" width="60" height="13.33" fill="#21468B" />
          </svg>
        </span>
      );

    case 'polish':
      // Poland Flag
      return (
        <span style={containerStyle} title="Polski (Poland)">
          <svg viewBox="0 0 60 40" width="100%" height="100%">
            <rect width="60" height="20" fill="#FFFFFF" />
            <rect y="20" width="60" height="20" fill="#DC143C" />
          </svg>
        </span>
      );

    case 'russian':
      // Russia Flag
      return (
        <span style={containerStyle} title="Русский (Russia)">
          <svg viewBox="0 0 60 40" width="100%" height="100%">
            <rect width="60" height="13.33" fill="#FFFFFF" />
            <rect y="13.33" width="60" height="13.34" fill="#0039A6" />
            <rect y="26.67" width="60" height="13.33" fill="#D52B1E" />
          </svg>
        </span>
      );

    case 'japanese_romaji':
      // Japan Flag
      return (
        <span style={containerStyle} title="日本語 (Japan)">
          <svg viewBox="0 0 60 40" width="100%" height="100%">
            <rect width="60" height="40" fill="#FFFFFF" />
            <circle cx="30" cy="20" r="11" fill="#BC002D" />
          </svg>
        </span>
      );

    case 'indonesian':
      // Indonesia Flag
      return (
        <span style={containerStyle} title="Bahasa Indonesia (Indonesia)">
          <svg viewBox="0 0 60 40" width="100%" height="100%">
            <rect width="60" height="20" fill="#FF0000" />
            <rect y="20" width="60" height="20" fill="#FFFFFF" />
          </svg>
        </span>
      );

    case 'swedish':
      // Sweden Flag
      return (
        <span style={containerStyle} title="Svenska (Sweden)">
          <svg viewBox="0 0 60 40" width="100%" height="100%">
            <rect width="60" height="40" fill="#006AA7" />
            <rect x="18" width="8" height="40" fill="#FECC00" />
            <rect y="16" width="60" height="8" fill="#FECC00" />
          </svg>
        </span>
      );

    case 'turkish':
      // Turkey Flag
      return (
        <span style={containerStyle} title="Türkçe (Turkey)">
          <svg viewBox="0 0 60 40" width="100%" height="100%">
            <rect width="60" height="40" fill="#E30A17" />
            <circle cx="23" cy="20" r="10" fill="#FFFFFF" />
            <circle cx="26" cy="20" r="8" fill="#E30A17" />
            <polygon
              points="33,16 34.5,19 38,19.2 35.3,21.5 36.1,25 33,23.2 29.9,25 30.7,21.5 28,19.2 31.5,19"
              fill="#FFFFFF"
            />
          </svg>
        </span>
      );

    default:
      // Stylized international globe badge fallback
      return (
        <span style={containerStyle} title="Language">
          <svg viewBox="0 0 60 40" width="100%" height="100%">
            <rect width="60" height="40" fill="var(--surface-hover)" />
            <circle cx="30" cy="20" r="11" fill="none" stroke="var(--accent)" strokeWidth="2.5" />
            <ellipse cx="30" cy="20" rx="5.5" ry="11" fill="none" stroke="var(--accent)" strokeWidth="1.8" />
            <line x1="19" y1="20" x2="41" y2="20" stroke="var(--accent)" strokeWidth="1.8" />
          </svg>
        </span>
      );
  }
}
