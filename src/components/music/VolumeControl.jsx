import React, { useState, useEffect } from 'react';
import { Volume2, Volume1, VolumeX } from 'lucide-react';

/**
 * Modern tactile flat-bar volume control.
 * Smoothly reveals on hover / dragging with full ARIA slider semantics.
 */
export function VolumeControl({
  musicVolume,
  setMusicVolume,
  syncVolume,
  prevVolumeRef
}) {
  const [isVolumeHovered, setIsVolumeHovered] = useState(false);
  const [isVolumeDragging, setIsVolumeDragging] = useState(false);
  const isVolumeVisible = isVolumeHovered || isVolumeDragging;

  // Release dragging state on global pointerup
  useEffect(() => {
    if (!isVolumeDragging) return;
    const handlePointerUp = () => setIsVolumeDragging(false);
    window.addEventListener('pointerup', handlePointerUp);
    return () => window.removeEventListener('pointerup', handlePointerUp);
  }, [isVolumeDragging]);

  const handleToggleMute = (e) => {
    e?.stopPropagation();
    if (musicVolume > 0) {
      setMusicVolume(0);
      syncVolume(0);
    } else {
      const restored = prevVolumeRef?.current > 0 ? prevVolumeRef.current : 75;
      setMusicVolume(restored);
      syncVolume(restored);
    }
  };

  const handleVolumeBarPointerDown = (e) => {
    e.stopPropagation();
    const bar = e.currentTarget;
    const updateFromClientX = (clientX) => {
      const rect = bar.getBoundingClientRect();
      if (rect.width <= 0) return;
      const rawRatio = (clientX - rect.left) / rect.width;
      const clampedRatio = Math.max(0, Math.min(1, rawRatio));
      const newVol = Math.round(clampedRatio * 100);
      setMusicVolume(newVol);
      syncVolume(newVol);
    };

    updateFromClientX(e.clientX);
    setIsVolumeDragging(true);

    const onPointerMove = (moveEvent) => {
      updateFromClientX(moveEvent.clientX);
    };

    const onPointerUp = () => {
      setIsVolumeDragging(false);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
  };

  const handleVolumeBarKeyDown = (e) => {
    e.stopPropagation();
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
      e.preventDefault();
      const newVol = Math.min(100, musicVolume + 5);
      setMusicVolume(newVol);
      syncVolume(newVol);
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
      e.preventDefault();
      const newVol = Math.max(0, musicVolume - 5);
      setMusicVolume(newVol);
      syncVolume(newVol);
    }
  };

  return (
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
          width: isVolumeVisible ? '88px' : '0px',
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
        {/* Flat bar volume slider without circular dot */}
        <div
          role="slider"
          tabIndex={0}
          aria-label="Music Volume"
          aria-valuenow={musicVolume}
          aria-valuemin={0}
          aria-valuemax={100}
          onPointerDown={handleVolumeBarPointerDown}
          onKeyDown={handleVolumeBarKeyDown}
          style={{
            width: '56px',
            height: '14px',
            display: 'flex',
            alignItems: 'center',
            cursor: 'pointer',
            outline: 'none',
            userSelect: 'none',
            touchAction: 'none'
          }}
          title={`Music Volume: ${musicVolume}%`}
        >
          <div
            style={{
              width: '100%',
              height: '5px',
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              borderRadius: '2.5px',
              overflow: 'hidden',
              position: 'relative'
            }}
          >
            <div
              style={{
                width: `${musicVolume}%`,
                height: '100%',
                backgroundColor: musicVolume > 0 ? '#FF0000' : 'transparent',
                borderRadius: '2.5px',
                transition: isVolumeDragging ? 'none' : 'width 0.12s ease'
              }}
            />
          </div>
        </div>

        <span
          style={{
            fontSize: '10.5px',
            fontFamily: 'monospace',
            color: '#A0A0A0',
            width: '26px',
            textAlign: 'right',
            userSelect: 'none'
          }}
        >
          {musicVolume}%
        </span>
      </div>
    </div>
  );
}
