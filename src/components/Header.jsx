import React, { useState, useRef, useEffect } from 'react';
import {
  Palette,
  Sliders,
  Volume2,
  VolumeX,
  ChevronDown
} from 'lucide-react';
import { THEMES } from '../constants/themes';
import { GithubIcon } from './GithubIcon';
import { Avatar } from './Avatar';

export function Header({
  activeThemeId,
  setThemeId,
  isAudioActive,
  onToggleSound,
  onOpenSettings,
  profile,
  onOpenProfile
}) {
  const [openMenu, setOpenMenu] = useState(null); // 'theme' | null
  const [hoveredThemeId, setHoveredThemeId] = useState(null);
  const dockRef = useRef(null);

  const activeTheme = THEMES[activeThemeId] || THEMES['boba-tea'] || THEMES['oat-latte'];
  const previewTheme = (hoveredThemeId && THEMES[hoveredThemeId]) || activeTheme;

  const openMenuRef = useRef(openMenu);
  useEffect(() => {
    openMenuRef.current = openMenu;
  }, [openMenu]);

  // Close floating menus when clicking outside or pressing Escape
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dockRef.current && !dockRef.current.contains(e.target)) {
        setOpenMenu(null);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && openMenuRef.current) {
        e.stopPropagation();
        setOpenMenu(null);
      }
    };
    document.addEventListener('pointerdown', handleOutsideClick);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const toggleMenu = (menuName) => {
    setOpenMenu(prev => prev === menuName ? null : menuName);
  };

  return (
    <header
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '24px 36px 16px 36px',
        maxWidth: '1180px',
        margin: '0 auto',
        width: '100%',
        userSelect: 'none',
        flexWrap: 'wrap',
        gap: '16px',
        position: 'relative',
        zIndex: 50
      }}
    >
      {/* 1. Brand & Subtitle */}
      <div>
        <div>
          <h1
            style={{
              fontSize: '22px',
              fontWeight: 700,
              letterSpacing: '-0.3px',
              color: 'var(--text-main)',
              margin: 0,
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <span>pawtap</span>
            <span
              style={{
                fontSize: '11px',
                padding: '2px 7px',
                borderRadius: '6px',
                backgroundColor: 'var(--surface)',
                border: '1.5px solid var(--border)',
                color: 'var(--accent)',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.4px'
              }}
            >
              sanctuary
            </span>
          </h1>
          <p style={{ margin: 0, fontSize: '12.5px', color: 'var(--text-sub)' }}>
            a gentle typing space
          </p>
        </div>
      </div>

      {/* 2. Two-Capsule Layout: Personal Identity + Sanctuary Controls */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          flexWrap: 'wrap'
        }}
      >
        {/* Capsule 1: Typist Identity Capsule */}
        {profile && (
          <button
            onClick={onOpenProfile}
            className="pill-btn"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '4px 12px 4px 6px',
              borderRadius: '16px',
              backgroundColor: 'var(--surface)',
              border: '1.5px solid var(--border)',
              boxShadow: '0 3px 12px var(--shadow)',
              backdropFilter: 'blur(8px)',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
            title="Typist Identity (Name & Avatar)"
            aria-label="Open Typist Profile"
          >
            <Avatar profile={profile} size={22} />
            <span
              style={{
                fontWeight: 600,
                fontSize: '13px',
                color: 'var(--text-main)',
                maxWidth: '120px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}
            >
              {profile.name?.trim() || 'Profile'}
            </span>
          </button>
        )}

        {/* Capsule 2: Sanctuary Controls Capsule */}
        <div
          ref={dockRef}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            padding: '4px 6px',
            borderRadius: '16px',
            backgroundColor: 'var(--surface)',
            border: '1.5px solid var(--border)',
            boxShadow: '0 3px 12px var(--shadow)',
            backdropFilter: 'blur(8px)',
            position: 'relative',
            zIndex: 60,
            fontSize: '13px',
            fontWeight: 500
          }}
        >
          {/* A. Theme Selector Button & Floating Popover */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => toggleMenu('theme')}
              className={`pill-btn ${openMenu === 'theme' ? 'active' : ''}`}
              style={{ padding: '6px 11px', gap: '7px' }}
              title="Choose Aesthetic Color Theme"
              aria-label={`Current Theme: ${activeTheme.name}`}
            >
              <Palette size={13} color="var(--accent)" />
              <span style={{ fontWeight: 600, fontSize: '13px' }}>{activeTheme.name}</span>
              <ChevronDown
                size={12}
                style={{
                  opacity: 0.6,
                  transform: openMenu === 'theme' ? 'rotate(180deg)' : 'none',
                  transition: 'transform 0.15s ease'
                }}
              />
            </button>

            {openMenu === 'theme' && (
              <div
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 8px)',
                  left: 0,
                  width: '190px',
                  backgroundColor: 'var(--bg)',
                  border: '1.5px solid var(--border)',
                  borderRadius: '14px',
                  boxShadow: '0 10px 30px var(--shadow), 0 3px 10px rgba(0,0,0,0.08)',
                  padding: '10px 12px',
                  zIndex: 100,
                  animation: 'modalSlideUp 0.22s cubic-bezier(0.16, 1, 0.3, 1)',
                  backdropFilter: 'blur(16px)'
                }}
              >
                {/* 5-Column Grid of Original Accent Dots */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(5, 1fr)',
                    gap: '4px',
                    justifyItems: 'center',
                    alignItems: 'center'
                  }}
                >
                  {Object.values(THEMES).map((thm) => {
                    const isSelected = thm.id === activeThemeId;
                    const isHovered = hoveredThemeId === thm.id;
                    return (
                      <button
                        key={thm.id}
                        type="button"
                        onClick={() => {
                          setThemeId(thm.id);
                          setOpenMenu(null);
                        }}
                        onMouseEnter={() => setHoveredThemeId(thm.id)}
                        onMouseLeave={() => setHoveredThemeId(null)}
                        style={{
                          width: '30px',
                          height: '30px',
                          borderRadius: '8px',
                          backgroundColor: isSelected ? 'var(--surface-hover)' : isHovered ? 'var(--surface)' : 'transparent',
                          border: isSelected ? '1px solid var(--border)' : '1px solid transparent',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: 0,
                          transition: 'all 0.12s ease'
                        }}
                        title={thm.name}
                        aria-label={`Select ${thm.name} theme`}
                      >
                        <span
                          style={{
                            width: '13px',
                            height: '13px',
                            borderRadius: '50%',
                            backgroundColor: thm.colors.accent,
                            border: `2px solid ${thm.colors.bg}`,
                            boxShadow: isSelected
                              ? `0 0 0 2px ${thm.colors.accent}, 0 1px 4px rgba(0,0,0,0.2)`
                              : '0 1px 3px rgba(0,0,0,0.12)',
                            transform: isHovered ? 'scale(1.2)' : 'scale(1)',
                            transition: 'transform 0.15s ease'
                          }}
                        />
                      </button>
                    );
                  })}
                </div>

                {/* Dynamic Theme Name Preview on Hover / Active */}
                <div
                  style={{
                    marginTop: '8px',
                    paddingTop: '6px',
                    borderTop: '1px solid var(--border)',
                    textAlign: 'center',
                    fontSize: '11px',
                    fontWeight: 600,
                    color: 'var(--text-sub)',
                    letterSpacing: '-0.1px',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}
                >
                  {previewTheme.name}
                </div>
              </div>
            )}
          </div>

          {/* Divider */}
          <div style={{ width: '1px', height: '14px', backgroundColor: 'var(--border)', opacity: 0.8 }} />

          {/* B. Mute/Unmute Quick Button */}
          <button
            onClick={onToggleSound}
            className="pill-btn"
            style={{ padding: '6px 8px' }}
            title={isAudioActive ? "Mute All Audio (Key Sounds & Music)" : "Unmute Audio"}
            aria-label="Toggle Sound"
          >
            {isAudioActive ? <Volume2 size={14} color="var(--accent)" /> : <VolumeX size={14} />}
          </button>

          {/* C. Settings Modal Trigger */}
          <button
            onClick={onOpenSettings}
            className="pill-btn"
            style={{ padding: '6px 8px' }}
            title="Full Sanctuary Customizer (Esc)"
            aria-label="Open Settings"
          >
            <Sliders size={14} />
          </button>

          {/* D. GitHub Profile Link */}
          <a
            href="https://github.com/TheIonius"
            target="_blank"
            rel="noopener noreferrer"
            className="pill-btn"
            style={{
              padding: '6px 8px',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              textDecoration: 'none',
              color: 'inherit'
            }}
            title="GitHub Profile @TheIonius"
            aria-label="GitHub Profile @TheIonius"
          >
            <GithubIcon size={14} />
          </a>
        </div>
      </div>
    </header>
  );
}
