import React, { useState } from 'react';
import { getPresetAvatar } from '../constants/profile';

/**
 * Reusable Avatar component supporting cozy emoji presets or custom uploaded photos.
 */
export function Avatar({
  profile,
  size = 28,
  style = {},
  onClick = null,
  className = ''
}) {
  const [failedAvatarSrc, setFailedAvatarSrc] = useState(null);

  const isCustom = profile?.avatarType === 'custom' && Boolean(profile?.avatar) && failedAvatarSrc !== profile?.avatar;
  const preset = getPresetAvatar(profile?.avatar || 'cat');

  const baseStyle = {
    width: `${size}px`,
    height: `${size}px`,
    minWidth: `${size}px`,
    minHeight: `${size}px`,
    borderRadius: '50%',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    userSelect: 'none',
    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
    border: '1.5px solid var(--border)',
    backgroundColor: 'var(--surface-hover)',
    cursor: onClick ? 'pointer' : 'default',
    transition: 'transform 0.15s ease, border-color 0.15s ease',
    ...style
  };

  if (isCustom) {
    return (
      <div
        className={className}
        style={baseStyle}
        onClick={onClick}
      >
        <img
          src={profile.avatar}
          alt={profile.name || 'User Avatar'}
          onError={() => setFailedAvatarSrc(profile?.avatar)}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block'
          }}
        />
      </div>
    );
  }

  return (
    <div
      className={className}
      style={{
        ...baseStyle,
        fontSize: `${Math.round(size * 0.56)}px`,
        lineHeight: 1
      }}
      onClick={onClick}
    >
      <span role="img" aria-label={preset.label}>
        {preset.emoji}
      </span>
    </div>
  );
}
