import React, { useRef, useState } from 'react';
import {
  X,
  Upload,
  Trash2,
  Check
} from 'lucide-react';
import { AVATAR_PRESETS, DEFAULT_PROFILE } from '../constants/profile';
import { Avatar } from './Avatar';
import { getCozyPerformanceTitle } from '../utils/metrics';

export function ProfileModal({
  isOpen,
  onClose,
  profile = DEFAULT_PROFILE,
  setProfile,
  personalBestWpm = 0,
  testsCompleted = 0,
  isFirstVisit = false
}) {
  const fileInputRef = useRef(null);
  const savedBadgeTimerRef = useRef(null);
  const [uploadError, setUploadError] = useState(null);
  const [savedBadge, setSavedBadge] = useState(false);

  React.useEffect(() => {
    return () => {
      if (savedBadgeTimerRef.current) clearTimeout(savedBadgeTimerRef.current);
    };
  }, []);

  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const currentProfile = {
    name: profile?.name ?? DEFAULT_PROFILE.name,
    avatar: profile?.avatar ?? DEFAULT_PROFILE.avatar,
    avatarType: profile?.avatarType ?? DEFAULT_PROFILE.avatarType
  };

  const tier = getCozyPerformanceTitle(personalBestWpm);

  const handleNameChange = (e) => {
    const val = e.target.value.slice(0, 24);
    setProfile(prev => ({
      ...prev,
      name: val
    }));
    triggerSaved();
  };

  const handleSelectPreset = (presetId) => {
    setProfile(prev => ({
      ...prev,
      avatar: presetId,
      avatarType: 'preset'
    }));
    setUploadError(null);
    triggerSaved();
  };

  const triggerSaved = () => {
    if (savedBadgeTimerRef.current) clearTimeout(savedBadgeTimerRef.current);
    setSavedBadge(true);
    savedBadgeTimerRef.current = setTimeout(() => setSavedBadge(false), 1200);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUploadError('Please select a valid image file (PNG, JPG, WEBP).');
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      setUploadError('Image is too large. Please select an image under 8MB.');
      return;
    }

    setUploadError(null);
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Crop & resize to crisp 180x180 square for optimal localStorage footprint
        const canvas = document.createElement('canvas');
        const size = 180;
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');

        const minDim = Math.min(img.width, img.height);
        const sx = (img.width - minDim) / 2;
        const sy = (img.height - minDim) / 2;

        ctx.drawImage(img, sx, sy, minDim, minDim, 0, 0, size, size);

        try {
          const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
          setProfile(prev => ({
            ...prev,
            avatar: dataUrl,
            avatarType: 'custom'
          }));
          triggerSaved();
        } catch {
          setUploadError('Could not process image. Please try another one.');
        }
      };
      img.onerror = () => {
        setUploadError('Failed to load image file.');
      };
      img.src = event.target?.result;
    };
    reader.readAsDataURL(file);

    // Reset input value so re-selecting the same file works
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveCustomPhoto = () => {
    setProfile(prev => ({
      ...prev,
      avatarType: 'preset',
      avatar: prev.avatar?.startsWith('data:') ? 'cat' : (prev.avatar || 'cat')
    }));
    setUploadError(null);
    triggerSaved();
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.45)',
        backdropFilter: 'blur(5px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1050,
        padding: '20px',
        animation: isFirstVisit
          ? 'fadeIn 0.35s cubic-bezier(0.16, 1, 0.3, 1)'
          : 'fadeIn 0.26s cubic-bezier(0.16, 1, 0.3, 1)'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="pawtap-profile-title"
        style={{
          width: '100%',
          maxWidth: '480px',
          maxHeight: '90vh',
          backgroundColor: 'var(--bg)',
          border: '1.5px solid var(--border)',
          borderRadius: '20px',
          boxShadow: '0 20px 48px var(--shadow), 0 4px 16px rgba(0,0,0,0.08)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          animation: isFirstVisit
            ? 'modalSlideUp 0.38s cubic-bezier(0.16, 1, 0.3, 1)'
            : 'modalSlideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '20px 24px 16px',
            borderBottom: '1px solid var(--border)'
          }}
        >
          <div>
            <h2
              id="pawtap-profile-title"
              style={{
                fontSize: '17px',
                fontWeight: 700,
                margin: 0,
                color: 'var(--text-main)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <span>{isFirstVisit ? 'Welcome to PawTap' : 'Typist Identity'}</span>
              {savedBadge && (
                <span
                  style={{
                    fontSize: '11px',
                    padding: '2px 6px',
                    borderRadius: '6px',
                    backgroundColor: 'rgba(74, 122, 84, 0.15)',
                    color: 'var(--accent)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontWeight: 600
                  }}
                >
                  <Check size={11} /> Saved
                </span>
              )}
            </h2>
            <p style={{ margin: '3px 0 0', fontSize: '12px', color: 'var(--text-sub)' }}>
              {isFirstVisit
                ? 'Pick a nickname and cozy avatar for your journey (optional).'
                : 'Stored locally in your browser. No sign-in required.'}
            </p>
          </div>

          <button
            onClick={onClose}
            className="pill-btn"
            style={{
              padding: '6px',
              borderRadius: '8px',
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              color: 'var(--text-sub)'
            }}
            title="Close (Esc)"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div
          style={{
            padding: '20px 24px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px'
          }}
        >
          {/* 1. Live Identity Preview Card */}
          <div
            className="stagger-item"
            style={{
              backgroundColor: 'var(--surface)',
              border: '1.5px solid var(--border)',
              borderRadius: '16px',
              padding: '16px 18px',
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              position: 'relative',
              animationDelay: '30ms'
            }}
          >
            <Avatar profile={currentProfile} size={64} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <span
                  style={{
                    fontSize: '17px',
                    fontWeight: 700,
                    color: 'var(--text-main)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {currentProfile.name.trim() || 'Anonymous Typist'}
                </span>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 600,
                    padding: '2px 8px',
                    borderRadius: '6px',
                    backgroundColor: 'var(--surface-hover)',
                    color: 'var(--accent)',
                    border: '1px solid var(--border)',
                    letterSpacing: '0.3px'
                  }}
                >
                  RANK {tier.rank} • {tier.title}
                </span>
              </div>
              <div
                style={{
                  fontSize: '12px',
                  color: 'var(--text-sub)',
                  marginTop: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}
              >
                {isFirstVisit && testsCompleted === 0 ? (
                  <span>Ready for your cozy typing journey ~</span>
                ) : (
                  <>
                    <span>★ PB: {personalBestWpm} WPM</span>
                    <span>•</span>
                    <span>{testsCompleted} tests completed</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* 2. Display Name Input */}
          <div className="stagger-item" style={{ animationDelay: '65ms' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '8px'
              }}
            >
              <label
                htmlFor="pawtap-profile-name"
                style={{
                  fontSize: '13px',
                  fontWeight: 600,
                  color: 'var(--text-main)'
                }}
              >
                Display Name
              </label>
              <span style={{ fontSize: '11px', color: 'var(--text-sub)' }}>
                {currentProfile.name.length}/24
              </span>
            </div>
            <input
              id="pawtap-profile-name"
              type="text"
              value={currentProfile.name}
              onChange={handleNameChange}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  onClose();
                }
              }}
              placeholder="What should we call you? (e.g. Mairo)"
              maxLength={24}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '12px',
                backgroundColor: 'var(--surface)',
                border: '1.5px solid var(--border)',
                color: 'var(--text-main)',
                fontSize: '14px',
                fontFamily: 'inherit',
                outline: 'none',
                boxSizing: 'border-box',
                transition: 'border-color 0.15s ease'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = 'var(--accent)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'var(--border)';
              }}
            />
          </div>

          {/* 3. Preset Icons Grid */}
          <div className="stagger-item" style={{ animationDelay: '100ms' }}>
            <div
              style={{
                fontSize: '13px',
                fontWeight: 600,
                color: 'var(--text-main)',
                marginBottom: '10px'
              }}
            >
              Choose a Cozy Icon
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(6, 1fr)',
                gap: '8px'
              }}
            >
              {AVATAR_PRESETS.map((preset) => {
                const isSelected =
                  currentProfile.avatarType === 'preset' && currentProfile.avatar === preset.id;
                return (
                  <button
                    key={preset.id}
                    onClick={() => handleSelectPreset(preset.id)}
                    title={preset.label}
                    style={{
                      height: '48px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: '12px',
                      backgroundColor: isSelected ? 'var(--surface-hover)' : 'var(--surface)',
                      border: isSelected
                        ? '2px solid var(--accent)'
                        : '1.5px solid var(--border)',
                      cursor: 'pointer',
                      fontSize: '22px',
                      transition: 'all 0.15s ease',
                      boxShadow: isSelected ? '0 2px 8px var(--shadow)' : 'none'
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) e.currentTarget.style.backgroundColor = 'var(--surface-hover)';
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) e.currentTarget.style.backgroundColor = 'var(--surface)';
                    }}
                  >
                    <span>{preset.emoji}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. Custom Photo Upload Section */}
          <div className="stagger-item" style={{ animationDelay: '135ms' }}>
            <div
              style={{
                fontSize: '13px',
                fontWeight: 600,
                color: 'var(--text-main)',
                marginBottom: '8px'
              }}
            >
              Or Upload Your Own Photo
            </div>

            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                flexWrap: 'wrap'
              }}
            >
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="pill-btn"
                style={{
                  padding: '9px 16px',
                  borderRadius: '12px',
                  backgroundColor: 'var(--surface)',
                  border: '1.5px solid var(--border)',
                  color: 'var(--text-main)',
                  fontWeight: 600,
                  fontSize: '13px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer'
                }}
              >
                <Upload size={14} color="var(--accent)" />
                <span>Upload picture from device</span>
              </button>

              {currentProfile.avatarType === 'custom' && (
                <button
                  type="button"
                  onClick={handleRemoveCustomPhoto}
                  className="pill-btn"
                  style={{
                    padding: '9px 14px',
                    borderRadius: '12px',
                    backgroundColor: 'transparent',
                    border: '1.5px solid var(--border)',
                    color: 'var(--text-sub)',
                    fontWeight: 500,
                    fontSize: '12.5px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    cursor: 'pointer'
                  }}
                  title="Remove custom photo and use preset icon"
                >
                  <Trash2 size={13} />
                  <span>Remove Photo</span>
                </button>
              )}
            </div>

            {uploadError && (
              <div
                style={{
                  marginTop: '8px',
                  fontSize: '12px',
                  color: 'var(--text-error)',
                  fontWeight: 500
                }}
              >
                {uploadError}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div
          className="stagger-item"
          style={{
            padding: '14px 24px',
            borderTop: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: 'var(--surface)',
            gap: '12px',
            animationDelay: '170ms'
          }}
        >
          {isFirstVisit ? (
            <button
              type="button"
              onClick={onClose}
              className="pill-btn"
              style={{
                padding: '8px 14px',
                borderRadius: '10px',
                backgroundColor: 'transparent',
                border: '1.5px solid var(--border)',
                color: 'var(--text-sub)',
                fontWeight: 500,
                fontSize: '12.5px',
                cursor: 'pointer'
              }}
            >
              Skip for now
            </button>
          ) : (
            <span style={{ fontSize: '11.5px', color: 'var(--text-sub)' }}>
              Appears on results scorecard & header
            </span>
          )}

          <button
            onClick={onClose}
            className="pill-btn active"
            style={{
              padding: '8px 20px',
              borderRadius: '10px',
              backgroundColor: 'var(--accent)',
              color: 'var(--bg)',
              fontWeight: 600,
              fontSize: '13px',
              cursor: 'pointer',
              border: 'none'
            }}
          >
            {isFirstVisit ? 'Save & Start Typing' : 'Done'}
          </button>
        </div>
      </div>
    </div>
  );
}
