import React, { useState, useRef, useEffect } from 'react';
import {
  Palette,
  Type,
  Sliders,
  Volume2,
  VolumeX,
  ChevronDown,
  Check,
  Music2
} from 'lucide-react';
import { THEMES, FONTS } from '../constants/themes';
import { SOUND_PRESETS, playKeySound } from '../audio/soundEngine';
import { GithubIcon } from './GithubIcon';

export function Header({
  activeThemeId,
  setThemeId,
  activeFontId,
  setFontId,
  soundPreset,
  setSoundPreset,
  soundVolume,
  isAudioActive,
  onToggleSound,
  onOpenSettings
}) {
  const [openMenu, setOpenMenu] = useState(null); // 'theme' | 'font' | 'sound' | null
  const dockRef = useRef(null);

  const activeTheme = THEMES[activeThemeId] || THEMES['oat-latte'];
  const activeFont = FONTS.find(f => f.id === activeFontId) || FONTS[1];
  const currentSound = SOUND_PRESETS.find(p => p.id === soundPreset) || SOUND_PRESETS[0];

  // Close floating menus when clicking outside or pressing Escape
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dockRef.current && !dockRef.current.contains(e.target)) {
        setOpenMenu(null);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
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

      {/* 2. Unified Aesthetic Customizer Capsule Dock */}
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
            style={{ padding: '6px 10px', gap: '6px' }}
            title="Choose Aesthetic Color Theme"
          >
            <Palette size={13} color="var(--accent)" />
            <span>{activeTheme.name}</span>
            <ChevronDown size={12} style={{ opacity: 0.6, transform: openMenu === 'theme' ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s ease' }} />
          </button>

          {openMenu === 'theme' && (
            <div
              style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                right: '-40px',
                width: '220px',
                maxHeight: '300px',
                overflowY: 'auto',
                backgroundColor: 'var(--bg)',
                border: '1.5px solid var(--border)',
                borderRadius: '14px',
                boxShadow: '0 8px 26px var(--shadow), 0 2px 8px rgba(0,0,0,0.06)',
                padding: '6px',
                zIndex: 100,
                animation: 'modalSlideUp 0.16s ease-out'
              }}
            >
              <div style={{ padding: '4px 8px 6px', fontSize: '11px', fontWeight: 600, color: 'var(--text-sub)', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                Color Palettes
              </div>
              {Object.values(THEMES).map((thm) => {
                const isSelected = thm.id === activeThemeId;
                return (
                  <button
                    key={thm.id}
                    onClick={() => {
                      setThemeId(thm.id);
                      setOpenMenu(null);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      width: '100%',
                      padding: '7px 10px',
                      borderRadius: '8px',
                      backgroundColor: isSelected ? 'var(--surface-hover)' : 'transparent',
                      color: isSelected ? 'var(--accent)' : 'var(--text-main)',
                      fontWeight: isSelected ? 600 : 500,
                      fontSize: '12.5px',
                      cursor: 'pointer',
                      transition: 'background-color 0.12s ease'
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) e.currentTarget.style.backgroundColor = 'var(--surface)';
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span
                        style={{
                          width: '12px',
                          height: '12px',
                          borderRadius: '50%',
                          backgroundColor: thm.colors.accent,
                          border: `2px solid ${thm.colors.bg}`,
                          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                        }}
                      />
                      <span>{thm.name}</span>
                    </div>
                    {isSelected && <Check size={13} color="var(--accent)" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Divider */}
        <div style={{ width: '1px', height: '14px', backgroundColor: 'var(--border)', opacity: 0.8 }} />

        {/* B. Font Selector Button & Floating Popover */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => toggleMenu('font')}
            className={`pill-btn ${openMenu === 'font' ? 'active' : ''}`}
            style={{ padding: '6px 10px', gap: '6px' }}
            title="Choose Typography Font"
          >
            <Type size={13} color="var(--accent)" />
            <span>{activeFont.name}</span>
            <ChevronDown size={12} style={{ opacity: 0.6, transform: openMenu === 'font' ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s ease' }} />
          </button>

          {openMenu === 'font' && (
            <div
              style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                right: '-30px',
                width: '190px',
                maxHeight: '280px',
                overflowY: 'auto',
                backgroundColor: 'var(--bg)',
                border: '1.5px solid var(--border)',
                borderRadius: '14px',
                boxShadow: '0 8px 26px var(--shadow), 0 2px 8px rgba(0,0,0,0.06)',
                padding: '6px',
                zIndex: 100,
                animation: 'modalSlideUp 0.16s ease-out'
              }}
            >
              <div style={{ padding: '4px 8px 6px', fontSize: '11px', fontWeight: 600, color: 'var(--text-sub)', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                Typography
              </div>
              {FONTS.map((f) => {
                const isSelected = f.id === activeFontId;
                return (
                  <button
                    key={f.id}
                    onClick={() => {
                      setFontId(f.id);
                      setOpenMenu(null);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      width: '100%',
                      padding: '7px 10px',
                      borderRadius: '8px',
                      backgroundColor: isSelected ? 'var(--surface-hover)' : 'transparent',
                      color: isSelected ? 'var(--accent)' : 'var(--text-main)',
                      fontWeight: isSelected ? 600 : 500,
                      fontSize: '13px',
                      fontFamily: f.family,
                      cursor: 'pointer',
                      transition: 'background-color 0.12s ease'
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) e.currentTarget.style.backgroundColor = 'var(--surface)';
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <span>{f.name}</span>
                    {isSelected && <Check size={13} color="var(--accent)" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Divider */}
        <div style={{ width: '1px', height: '14px', backgroundColor: 'var(--border)', opacity: 0.8 }} />

        {/* C. Mechanical Sound Selector Button & Floating Popover */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => toggleMenu('sound')}
            className={`pill-btn ${openMenu === 'sound' ? 'active' : ''}`}
            style={{ padding: '6px 10px', gap: '6px' }}
            title="Switch Mechanical Keyboard Sound Profile"
          >
            <Music2 size={13} color="var(--accent)" />
            <span>{currentSound.name}</span>
            <ChevronDown size={12} style={{ opacity: 0.6, transform: openMenu === 'sound' ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s ease' }} />
          </button>

          {openMenu === 'sound' && (
            <div
              style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                right: '0',
                width: '235px',
                backgroundColor: 'var(--bg)',
                border: '1.5px solid var(--border)',
                borderRadius: '14px',
                boxShadow: '0 8px 26px var(--shadow), 0 2px 8px rgba(0,0,0,0.06)',
                padding: '6px',
                zIndex: 100,
                animation: 'modalSlideUp 0.16s ease-out'
              }}
            >
              <div style={{ padding: '4px 8px 5px', fontSize: '11px', fontWeight: 600, color: 'var(--text-sub)', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                Tactile Switch Acoustics
              </div>
              {SOUND_PRESETS.map((p) => {
                const isSelected = p.id === soundPreset;
                return (
                  <button
                    key={p.id}
                    onClick={() => {
                      setSoundPreset(p.id);
                      playKeySound(p.id, soundVolume, ' ');
                      setOpenMenu(null);
                    }}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-start',
                      width: '100%',
                      padding: '6px 9px',
                      borderRadius: '8px',
                      backgroundColor: isSelected ? 'var(--surface-hover)' : 'transparent',
                      color: isSelected ? 'var(--accent)' : 'var(--text-main)',
                      fontSize: '12.5px',
                      cursor: 'pointer',
                      transition: 'background-color 0.12s ease'
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) e.currentTarget.style.backgroundColor = 'var(--surface)';
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                      <span style={{ fontWeight: isSelected ? 600 : 500 }}>{p.name}</span>
                      {isSelected && <Check size={13} color="var(--accent)" />}
                    </div>
                    {p.desc && (
                      <span style={{ fontSize: '11px', color: 'var(--text-sub)', marginTop: '2px', textAlign: 'left' }}>
                        {p.desc}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Divider */}
        <div style={{ width: '1px', height: '14px', backgroundColor: 'var(--border)', opacity: 0.8 }} />

        {/* D. Mute/Unmute Quick Button */}
        <button
          onClick={onToggleSound}
          className="pill-btn"
          style={{ padding: '6px 8px' }}
          title={isAudioActive ? "Mute All Audio (Key Sounds & Lo-Fi)" : "Unmute Audio"}
          aria-label="Toggle Sound"
        >
          {isAudioActive ? <Volume2 size={14} color="var(--accent)" /> : <VolumeX size={14} />}
        </button>

        {/* E. Settings Modal Trigger */}
        <button
          onClick={onOpenSettings}
          className="pill-btn"
          style={{ padding: '6px 8px' }}
          title="Full Sanctuary Customizer (Esc)"
          aria-label="Open Settings"
        >
          <Sliders size={14} />
        </button>

        {/* F. GitHub Profile Link */}
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
    </header>
  );
}
