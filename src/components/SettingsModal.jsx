import React from 'react';
import {
  X,
  Palette,
  Type,
  Volume2,
  VolumeX,
  Sliders,
  Cat,
  Coffee,
  Sprout,
  Headphones,
  Sparkles,
  CloudRain,
  Moon,
  Sun,
  Music,
  Gauge,
  Skull,
  EyeOff,
  Flashlight
} from 'lucide-react';
import { THEMES, FONTS, CARET_STYLES, COMPANION_TYPES } from '../constants/themes';
import { SOUND_PRESETS, playKeySound } from '../audio/soundEngine';
import { AMBIENT_PRESETS } from '../audio/ambientEngine';

export function SettingsModal({
  isOpen,
  onClose,
  activeThemeId,
  setThemeId,
  activeFontId,
  setFontId,
  caretStyle,
  setCaretStyle,
  companionType,
  setCompanionType,
  soundPreset,
  setSoundPreset,
  soundVolume,
  setSoundVolume,
  ambientSound,
  setAmbientSoundType,
  ambientVolume,
  setAmbientVolume,
  vocabularyMode = 'cozy',
  setVocabularyMode = () => {},
  challengeMods = [],
  setChallengeMods = () => {},
  // Backwards compatibility for single mode
  challengeMode = 'normal',
  setChallengeMode = null
}) {
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

  const activeModsList = Array.isArray(challengeMods)
    ? challengeMods
    : (challengeMods && challengeMods !== 'normal' && challengeMods !== 'none')
      ? [challengeMods]
      : (challengeMode && challengeMode !== 'normal' && challengeMode !== 'none')
        ? [challengeMode]
        : [];

  const handleToggleMod = (modId) => {
    let next;
    if (activeModsList.includes(modId)) {
      next = activeModsList.filter(id => id !== modId);
    } else {
      next = [...activeModsList, modId];
    }
    setChallengeMods(next);
    if (setChallengeMode) {
      setChallengeMode(next.length > 0 ? next[0] : 'normal');
    }
  };

  const handleClearMods = () => {
    setChallengeMods([]);
    if (setChallengeMode) setChallengeMode('normal');
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}
    >
      {/* 1. Fast GPU-efficient dimming backdrop scrim (zero rasterization lag on hover) */}
      <div
        onClick={onClose}
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: 'rgba(18, 15, 12, 0.65)',
          transform: 'translateZ(0)'
        }}
      />

      {/* 2. Isolated Modal Window */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'relative',
          zIndex: 1,
          width: '100%',
          maxWidth: '680px',
          maxHeight: '85vh',
          backgroundColor: 'var(--bg)',
          border: '1px solid var(--border)',
          borderRadius: '20px',
          boxShadow: '0 20px 50px rgba(0,0,0,0.22)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          animation: 'modalSlideUp 0.22s ease-out',
          transform: 'translateZ(0)',
          contain: 'content',
          isolation: 'isolate'
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: 'var(--surface)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Sliders size={18} color="var(--accent)" />
            <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>
              Pawtap Sanctuary Customizer
            </h2>
          </div>
          <button
            onClick={onClose}
            className="icon-btn"
            style={{ width: '32px', height: '32px' }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Body (Scrollable with hidden scrollbar & fluid performance) */}
        <div
          className="no-scrollbar"
          style={{
            padding: '24px',
            overflowY: 'auto',
            overscrollBehavior: 'contain',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            display: 'flex',
            flexDirection: 'column',
            gap: '28px'
          }}
        >
          {/* 1. Theme Color Palette */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <Palette size={16} color="var(--accent)" />
              <h3 style={{ fontSize: '14px', fontWeight: 600, margin: 0, color: 'var(--text-main)' }}>
                Color Aesthetic
              </h3>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                gap: '10px'
              }}
            >
              {Object.values(THEMES).map((thm) => {
                const isActive = activeThemeId === thm.id;
                return (
                  <button
                    key={thm.id}
                    onClick={() => setThemeId(thm.id)}
                    style={{
                      padding: '10px 12px',
                      borderRadius: '12px',
                      border: `1.5px solid ${isActive ? 'var(--accent)' : 'var(--border)'}`,
                      backgroundColor: thm.colors.surface,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-start',
                      gap: '8px',
                      cursor: 'pointer',
                      textAlign: 'left',
                      boxShadow: isActive ? '0 0 0 1px var(--accent)' : 'none',
                      transition: 'border-color 0.1s ease, background-color 0.1s ease'
                    }}
                  >
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: thm.colors.bg, border: '1px solid rgba(0,0,0,0.1)' }} />
                      <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: thm.colors.accent }} />
                      <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: thm.colors.textMain }} />
                    </div>
                    <div>
                      <span style={{ fontSize: '12px', fontWeight: 600, color: thm.colors.textMain, display: 'block' }}>
                        {thm.name}
                      </span>
                      <span style={{ fontSize: '10px', color: thm.colors.textSub }}>
                        {thm.badge}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Typography & Fonts (Accommodated & Space-Efficient) */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <Type size={16} color="var(--accent)" />
              <h3 style={{ fontSize: '14px', fontWeight: 600, margin: 0, color: 'var(--text-main)' }}>
                Typography & Font Family
              </h3>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {FONTS.map((f) => {
                const isActive = activeFontId === f.id;
                return (
                  <button
                    key={f.id}
                    onClick={() => setFontId(f.id)}
                    className={`pill-btn ${isActive ? 'active' : ''}`}
                    style={{
                      padding: '7px 13px',
                      fontFamily: f.family,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      borderRadius: '10px'
                    }}
                  >
                    <span style={{ fontSize: '13.5px', fontWeight: isActive ? 700 : 500 }}>
                      {f.name}
                    </span>
                    <span
                      style={{
                        fontSize: '10.5px',
                        color: 'var(--text-sub)',
                        opacity: 0.8,
                        fontFamily: 'sans-serif'
                      }}
                    >
                      {f.vibe}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Difficulty & Challenge Mode */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <Gauge size={16} color="var(--accent)" />
              <h3 style={{ fontSize: '14px', fontWeight: 600, margin: 0, color: 'var(--text-main)' }}>
                Difficulty & Challenge Mode
              </h3>
            </div>

            {/* A. Typing Mechanics Challenge (osu! Style Multi-Select Modifiers) */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <div style={{ fontSize: '11.5px', color: 'var(--text-sub)', fontWeight: 500 }}>
                osu! Difficulty Modifiers (Multi-Select)
              </div>
              {activeModsList.length > 0 && (
                <button
                  onClick={handleClearMods}
                  style={{
                    fontSize: '11px',
                    color: 'var(--accent)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    textDecoration: 'underline',
                    fontWeight: 600
                  }}
                >
                  Reset to Standard
                </button>
              )}
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(185px, 1fr))',
                gap: '10px',
                marginBottom: '18px'
              }}
            >
              {[
                {
                  id: 'sudden_death',
                  name: 'Sudden Death',
                  badge: 'SD',
                  desc: '1 typo = instant fail & metrics',
                  icon: Skull,
                  activeColor: '#EF4444',
                  activeBg: 'rgba(239, 68, 68, 0.08)'
                },
                {
                  id: 'disappearing',
                  name: 'Hidden',
                  badge: 'HD',
                  desc: 'Letters fade away ahead of you',
                  icon: EyeOff,
                  activeColor: '#A855F7',
                  activeBg: 'rgba(168, 85, 247, 0.08)'
                },
                {
                  id: 'flashlight',
                  name: 'Flashlight',
                  badge: 'FL',
                  desc: 'Narrow beam follows your caret',
                  icon: Flashlight,
                  activeColor: '#3B82F6',
                  activeBg: 'rgba(59, 130, 246, 0.08)'
                }
              ].map((m) => {
                const isActive = activeModsList.includes(m.id);
                const IconComponent = m.icon;
                return (
                  <button
                    key={m.id}
                    onClick={() => handleToggleMod(m.id)}
                    style={{
                      padding: '12px 14px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-start',
                      gap: '5px',
                      borderRadius: '12px',
                      textAlign: 'left',
                      border: `1.5px solid ${isActive ? m.activeColor : 'var(--border)'}`,
                      backgroundColor: isActive ? m.activeBg : 'var(--surface)',
                      cursor: 'pointer',
                      boxShadow: isActive ? `0 2px 8px ${m.activeColor}25` : 'none',
                      transition: 'border-color 0.1s ease, background-color 0.1s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                        <IconComponent size={15} color={isActive ? m.activeColor : 'var(--text-sub)'} />
                        <span style={{ fontSize: '13px', fontWeight: isActive ? 700 : 600, color: 'var(--text-main)' }}>
                          {m.name}
                        </span>
                      </div>
                      <span
                        style={{
                          fontSize: '10px',
                          fontWeight: 700,
                          padding: '2px 6px',
                          borderRadius: '6px',
                          backgroundColor: isActive ? m.activeColor : 'rgba(0,0,0,0.06)',
                          color: isActive ? '#FFFFFF' : 'var(--text-sub)'
                        }}
                      >
                        {m.badge}
                      </span>
                    </div>
                    <span style={{ fontSize: '11px', color: 'var(--text-sub)', opacity: 0.85 }}>
                      {m.desc}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* B. Text Vocabulary Complexity */}
            <div style={{ fontSize: '11.5px', color: 'var(--text-sub)', marginBottom: '8px', fontWeight: 500 }}>
              Text Vocabulary Complexity
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {[
                { id: 'cozy', name: 'Cozy Hygge', desc: 'Calming comfort words' },
                { id: 'standard', name: 'Standard', desc: 'Common everyday vocabulary' },
                { id: 'expert', name: 'Hard & Polysyllabic', desc: 'Complex multisyllabic words' }
              ].map((v) => {
                const isActive = vocabularyMode === v.id;
                return (
                  <button
                    key={v.id}
                    onClick={() => setVocabularyMode(v.id)}
                    className={`pill-btn ${isActive ? 'active' : ''}`}
                    style={{ padding: '8px 14px' }}
                  >
                    <span style={{ fontSize: '12.5px', fontWeight: isActive ? 600 : 500 }}>
                      {v.name}
                    </span>
                    <span style={{ fontSize: '10.5px', color: 'var(--text-sub)', marginLeft: '6px', opacity: 0.8 }}>
                      ({v.desc})
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. Caret Style */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <Sparkles size={16} color="var(--accent)" />
              <h3 style={{ fontSize: '14px', fontWeight: 600, margin: 0, color: 'var(--text-main)' }}>
                Caret Animation Style
              </h3>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {CARET_STYLES.map((cs) => {
                const isActive = caretStyle === cs.id;
                return (
                  <button
                    key={cs.id}
                    onClick={() => setCaretStyle(cs.id)}
                    className={`pill-btn ${isActive ? 'active' : ''}`}
                    style={{ padding: '8px 14px' }}
                  >
                    <span>{cs.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 5. Cozy Companion */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <Cat size={16} color="var(--accent)" />
              <h3 style={{ fontSize: '14px', fontWeight: 600, margin: 0, color: 'var(--text-main)' }}>
                Interactive Companion
              </h3>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                gap: '10px'
              }}
            >
              {COMPANION_TYPES.map((cp) => {
                const isActive = companionType === cp.id;
                return (
                  <button
                    key={cp.id}
                    onClick={() => setCompanionType(cp.id)}
                    style={{
                      padding: '12px',
                      borderRadius: '12px',
                      border: `1.5px solid ${isActive ? 'var(--accent)' : 'var(--border)'}`,
                      backgroundColor: 'var(--surface)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '4px',
                      cursor: 'pointer',
                      textAlign: 'center'
                    }}
                  >
                    <div style={{ height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {cp.id === 'cat' && <Cat size={24} color="var(--accent)" />}
                      {cp.id === 'coffee' && <Coffee size={24} color="var(--accent)" />}
                      {cp.id === 'plant' && <Sprout size={24} color="var(--accent)" />}
                      {cp.id === 'none' && <Sparkles size={24} color="var(--accent)" />}
                    </div>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-main)' }}>
                      {cp.name}
                    </span>
                    <span style={{ fontSize: '10px', color: 'var(--text-sub)' }}>
                      {cp.description}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 6. Sound & Atmosphere Controls */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <Volume2 size={16} color="var(--accent)" />
              <h3 style={{ fontSize: '14px', fontWeight: 600, margin: 0, color: 'var(--text-main)' }}>
                Tactile Switch Sound & Volume
              </h3>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '14px' }}>
              {SOUND_PRESETS.map((sp) => {
                const isActive = soundPreset === sp.id;
                return (
                  <button
                    key={sp.id}
                    onClick={() => {
                      setSoundPreset(sp.id);
                      playKeySound(sp.id, Math.max(0.5, soundVolume), ' ');
                    }}
                    className={`pill-btn ${isActive ? 'active' : ''}`}
                    style={{ padding: '8px 14px' }}
                  >
                    <span>{sp.name}</span>
                  </button>
                );
              })}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '0 4px' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-sub)', width: '90px' }}>
                Key Volume:
              </span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={soundVolume}
                onChange={(e) => setSoundVolume(parseFloat(e.target.value))}
                style={{ flex: 1, accentColor: 'var(--accent)' }}
              />
              <span style={{ fontSize: '12px', fontFamily: 'monospace', color: 'var(--text-main)', width: '36px' }}>
                {Math.round(soundVolume * 100)}%
              </span>
            </div>
          </div>

          {/* 7. Ambient Atmosphere */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <CloudRain size={16} color="var(--accent)" />
              <h3 style={{ fontSize: '14px', fontWeight: 600, margin: 0, color: 'var(--text-main)' }}>
                Calming Ambient Background Sound
              </h3>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '14px' }}>
              {AMBIENT_PRESETS.map((ap) => {
                const isActive = ambientSound === ap.id;
                return (
                  <button
                    key={ap.id}
                    onClick={() => {
                      setAmbientSoundType(ap.id);
                      if (ap.id !== 'none' && ambientVolume <= 0) {
                        setAmbientVolume(0.25);
                      }
                    }}
                    className={`pill-btn ${isActive ? 'active' : ''}`}
                    style={{ padding: '8px 14px' }}
                  >
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                      {ap.id === 'none' && <VolumeX size={13} />}
                      {ap.id === 'rain' && <CloudRain size={13} />}
                      {ap.id === 'midnight' && <Moon size={13} />}
                      {ap.id === 'afternoon' && <Sun size={13} />}
                      {ap.id === 'starlit' && <Sparkles size={13} />}
                      {ap.id === 'cafe' && <Coffee size={13} />}
                      {ap.id === 'sunbeam' && <Music size={13} />}
                      {['none', 'rain', 'midnight', 'afternoon', 'starlit', 'cafe', 'sunbeam'].indexOf(ap.id) === -1 && <Headphones size={13} />}
                      <span>{ap.name}</span>
                    </span>
                  </button>
                );
              })}
            </div>

            {ambientSound !== 'none' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '0 4px' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-sub)', width: '90px' }}>
                  Ambient Vol:
                </span>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={ambientVolume}
                  onChange={(e) => setAmbientVolume(parseFloat(e.target.value))}
                  style={{ flex: 1, accentColor: 'var(--accent)' }}
                />
                <span style={{ fontSize: '12px', fontFamily: 'monospace', color: 'var(--text-main)', width: '36px' }}>
                  {Math.round(ambientVolume * 100)}%
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
