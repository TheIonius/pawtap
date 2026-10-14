import React, { useState, useEffect, useCallback, useRef } from 'react';
import confetti from 'canvas-confetti';
import { THEMES, FONTS } from './constants/themes';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useTypingEngine } from './hooks/useTypingEngine';
import { Header } from './components/Header';
import { TestSettingsBar } from './components/TestSettingsBar';
import { TypingTest } from './components/TypingTest';
import { ResultsView } from './components/ResultsView';
import { Companion } from './components/Companion';
import { SettingsModal } from './components/SettingsModal';
import { LanguageModal } from './components/LanguageModal';
import { CustomTextModal } from './components/CustomTextModal';
import { KeyboardVisualizer } from './components/KeyboardVisualizer';
import { setAmbientSound, updateAmbientVolume, stopAmbientSound } from './audio/ambientEngine';
import { getWordsTargetingKeys } from './constants/wordLists';
import { DEFAULT_CUSTOM_TEXT } from './constants/codeSnippets';
import { Keyboard } from 'lucide-react';
import { GithubIcon } from './components/GithubIcon';

export default function App() {
  // 1. Persistent User Preferences
  const [activeThemeId, setThemeId] = useLocalStorage('pawtap_theme', 'boba-tea');
  const [activeFontId, setFontId] = useLocalStorage('pawtap_font', 'nunito');
  const [caretStyle, setCaretStyle] = useLocalStorage('pawtap_caret', 'underline');
  const [paceCaret, setPaceCaret] = useLocalStorage('pawtap_pace_caret', 'off');
  const [companionType, setCompanionType] = useLocalStorage('pawtap_companion', 'cat');
  const [soundPreset, setSoundPreset] = useLocalStorage('pawtap_sound_preset', 'matcha');
  const [soundVolume, setSoundVolume] = useLocalStorage('pawtap_sound_vol', 0.65);
  const [ambientSound, setAmbientSoundType] = useLocalStorage('pawtap_ambient_type', 'none');
  const [ambientVolume, setAmbientVolume] = useLocalStorage('pawtap_ambient_vol', 0.25);
  const [showKeyboard, setShowKeyboard] = useLocalStorage('pawtap_show_keyboard', false);
  const [language, setLanguage] = useLocalStorage('pawtap_language', 'english');
  const [customText, setCustomText] = useLocalStorage('pawtap_custom_text', DEFAULT_CUSTOM_TEXT);

  // Statistics & History Persistence
  const [, setTestsCompleted] = useLocalStorage('pawtap_tests_count', 0);
  const [personalBestWpm, setPersonalBestWpm] = useLocalStorage('pawtap_pb_wpm', 0);

  // Active Test Configuration
  const [mode, setMode] = useState('time');
  const [timeLimit, setTimeLimit] = useState(30);
  const [wordLimit, setWordLimit] = useState(25);
  const [quoteLength, setQuoteLength] = useState('medium');
  const [punctuation, setPunctuation] = useState(false);
  const [numbers, setNumbers] = useState(false);
  const [vocabularyMode, setVocabularyMode] = useLocalStorage('pawtap_vocab_mode', 'cozy');
  const [challengeMods, setChallengeMods] = useLocalStorage('pawtap_challenges', []);
  const normalizedChallengeMods = Array.isArray(challengeMods)
    ? challengeMods
    : (challengeMods && challengeMods !== 'normal' && challengeMods !== 'none')
      ? [challengeMods]
      : [];

  // Modals & Results State
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isLanguageModalOpen, setIsLanguageModalOpen] = useState(false);
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  const [lastResult, setLastResult] = useState(null);

  // Full-Page Focus & Window Blur Tracking
  const [isFocused, setIsFocused] = useState(true);
  const typingInputRef = useRef(null);

  // 2. Resolve Active Theme & Font
  const activeTheme = THEMES[activeThemeId] || THEMES['boba-tea'] || THEMES['oat-latte'];
  const activeFont = FONTS.find(f => f.id === activeFontId) || FONTS[1];

  // Apply CSS Variables to Document Root
  useEffect(() => {
    const root = document.documentElement;
    Object.entries(activeTheme.colors).forEach(([key, val]) => {
      const cssVar = '--' + key.replace(/([A-Z])/g, '-$1').toLowerCase();
      root.style.setProperty(cssVar, val);
    });
    root.style.setProperty('--font-active', activeFont.family);
  }, [activeTheme, activeFont]);

  // Handle Ambient Audio Updates
  const ambientVolumeRef = useRef(ambientVolume);
  useEffect(() => {
    ambientVolumeRef.current = ambientVolume;
  }, [ambientVolume]);

  useEffect(() => {
    setAmbientSound(ambientSound, ambientVolumeRef.current);
  }, [ambientSound]);

  useEffect(() => {
    updateAmbientVolume(ambientVolume);
  }, [ambientVolume]);

  // Audio Mute Memory & Unified Toggle
  const prevSoundVolumeRef = useRef(soundVolume > 0 ? soundVolume : 0.65);
  const prevAmbientVolumeRef = useRef(ambientVolume > 0 ? ambientVolume : 0.25);

  useEffect(() => {
    if (soundVolume > 0) prevSoundVolumeRef.current = soundVolume;
  }, [soundVolume]);

  useEffect(() => {
    if (ambientVolume > 0) prevAmbientVolumeRef.current = ambientVolume;
  }, [ambientVolume]);

  const isAudioActive = soundVolume > 0 || (ambientSound !== 'none' && ambientVolume > 0);

  const handleToggleSound = useCallback(() => {
    if (isAudioActive) {
      // Mute all sound
      if (soundVolume > 0) prevSoundVolumeRef.current = soundVolume;
      if (ambientVolume > 0) prevAmbientVolumeRef.current = ambientVolume;
      setSoundVolume(0);
      setAmbientVolume(0);
      stopAmbientSound();
    } else {
      // Unmute and restore previous volumes
      const restoredSound = prevSoundVolumeRef.current > 0 ? prevSoundVolumeRef.current : 0.65;
      const restoredAmbient = prevAmbientVolumeRef.current > 0 ? prevAmbientVolumeRef.current : 0.25;
      setSoundVolume(restoredSound);
      setAmbientVolume(restoredAmbient);
      if (ambientSound !== 'none') {
        setAmbientSound(ambientSound, restoredAmbient);
      }
    }
  }, [isAudioActive, soundVolume, ambientVolume, ambientSound, setSoundVolume, setAmbientVolume]);

  // 3. Test Completion Callback
  const handleTestFinish = useCallback((result) => {
    // Only celebrate if user achieves a valid WPM that beats their previous personal best
    const previousBest = personalBestWpm || 0;
    const isNewRecord = result.wpm > 0 && result.wpm > previousBest;

    const enrichedResult = {
      ...result,
      isNewRecord,
      previousPb: previousBest
    };

    setLastResult(enrichedResult);
    setTestsCompleted(prev => (prev || 0) + 1);

    if (isNewRecord) {
      setPersonalBestWpm(result.wpm);

      // Launch celebratory confetti ONLY when setting a new record / BPM (sound removed per user preference)
      try {
        confetti({
          particleCount: 65,
          spread: 70,
          origin: { y: 0.6 },
          colors: [
            activeTheme.colors.accent,
            activeTheme.colors.caret,
            '#F4B8C1',
            '#E8A758',
            '#7A9A7E'
          ],
          ticks: 240,
          gravity: 0.85,
          scalar: 1.0
        });
      } catch {
        // Ignored if canvas-confetti unavailable
      }
    }
  }, [personalBestWpm, activeTheme, setTestsCompleted, setPersonalBestWpm]);

  const savedModeConfigRef = useRef(null);
  const engineRef = useRef(null);

  const customWords = React.useMemo(() => {
    return (customText || DEFAULT_CUSTOM_TEXT).trim().split(/\s+/).filter(Boolean);
  }, [customText]);

  const handleRestart = useCallback(() => {
    setLastResult(null);
    if (savedModeConfigRef.current) {
      const prev = savedModeConfigRef.current;
      savedModeConfigRef.current = null;
      setMode(prev.mode);
      setTimeLimit(prev.timeLimit);
      setWordLimit(prev.wordLimit);
      setQuoteLength(prev.quoteLength);
      if (prev.mode === mode && prev.wordLimit === wordLimit) {
        engineRef.current?.initializeTest();
      }
    } else if (mode === 'custom') {
      engineRef.current?.initializeTest(customWords);
    } else {
      engineRef.current?.initializeTest();
    }
  }, [mode, wordLimit, customWords]);

  // 4. Initialize Core Typing Engine (pauses when browser window/tab is unfocused)
  const engine = useTypingEngine({
    mode,
    timeLimit,
    wordLimit,
    quoteLength,
    punctuation,
    numbers,
    language,
    vocabularyMode,
    challengeMods: normalizedChallengeMods,
    customWords,
    soundPreset,
    soundVolume,
    isPaused: !isFocused,
    onRestart: handleRestart,
    onFinish: handleTestFinish
  });

  useEffect(() => {
    engineRef.current = engine;
  });

  // Apply custom text handler
  const handleApplyCustomText = useCallback((text) => {
    setCustomText(text);
    const parsed = text.trim().split(/\s+/).filter(Boolean);
    savedModeConfigRef.current = null;
    setMode('custom');
    setLastResult(null);
    engine.initializeTest(parsed);
  }, [setCustomText, engine]);

  // Restore focus helper for clicking anywhere or pressing any key
  const restoreFocus = useCallback((e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setIsFocused(true);
    if (typingInputRef.current) {
      typingInputRef.current.focus({ preventScroll: true });
    }
  }, []);

  // Browser Window Blur & Tab Switching Handlers
  useEffect(() => {
    const handleWindowBlur = () => {
      if (engine.status !== 'finished' && !isSettingsOpen && !isLanguageModalOpen && !isCustomModalOpen) {
        setIsFocused(false);
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden && engine.status !== 'finished' && !isSettingsOpen && !isLanguageModalOpen && !isCustomModalOpen) {
        setIsFocused(false);
      }
    };

    window.addEventListener('blur', handleWindowBlur);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      window.removeEventListener('blur', handleWindowBlur);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [engine.status, isSettingsOpen, isLanguageModalOpen, isCustomModalOpen]);

  // Global Pointer & Keydown Listeners to Re-Focus
  useEffect(() => {
    const handleGlobalPointerDown = (e) => {
      // Allow interaction with buttons, selects, modals, etc.
      if (e.target.closest && e.target.closest('button, select, input, [role="dialog"], .modal-content, a, textarea')) {
        return;
      }
      restoreFocus(e);
    };

    const handleGlobalKeyDown = (e) => {
      if (isSettingsOpen || isLanguageModalOpen || isCustomModalOpen) return;

      // Allow browser shortcuts (like Ctrl+R, Ctrl+W, Cmd+R) to pass through untouched
      if ((e.ctrlKey || e.metaKey) && e.key !== 'Backspace') {
        return;
      }

      const activeEl = document.activeElement;
      const tagName = activeEl?.tagName?.toLowerCase();
      if (tagName === 'select' || (tagName === 'input' && activeEl !== typingInputRef.current) || tagName === 'textarea') {
        return;
      }
      if ([
        'Shift', 'Control', 'Alt', 'Meta', 'CapsLock', 'Escape',
        'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
        'F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10', 'F11', 'F12'
      ].includes(e.key)) return;

      if (!isFocused) {
        restoreFocus(e);
        engine.handleKeyDown(e);
      }
    };

    window.addEventListener('pointerdown', handleGlobalPointerDown);
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => {
      window.removeEventListener('pointerdown', handleGlobalPointerDown);
      window.removeEventListener('keydown', handleGlobalKeyDown);
    };
  }, [isFocused, isSettingsOpen, isLanguageModalOpen, isCustomModalOpen, restoreFocus, engine]);

  // Handle Practice Missed Words (all errors or specific target keys)
  const handlePracticeErrors = useCallback((targetKeys = null) => {
    if (!lastResult || !lastResult.keyErrors) return;
    const errorKeys = targetKeys && targetKeys.length > 0 ? targetKeys : Object.keys(lastResult.keyErrors);
    if (errorKeys.length === 0) return;

    // Save previous configuration so restarting restores previous mode (e.g. time 30s)
    if (!savedModeConfigRef.current) {
      savedModeConfigRef.current = {
        mode,
        timeLimit,
        wordLimit,
        quoteLength
      };
    }

    const practiceWords = getWordsTargetingKeys(15, errorKeys, {
      punctuation,
      numbers,
      language,
      mode: vocabularyMode
    });

    setMode('words');
    setWordLimit(15);
    setLastResult(null);
    engine.initializeTest(practiceWords);
  }, [lastResult, mode, timeLimit, wordLimit, quoteLength, punctuation, numbers, language, vocabularyMode, engine]);

  // Keyboard Navigation: Esc to toggle Customizer & Themes modal (or close open modal)
  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        if (isCustomModalOpen) {
          setIsCustomModalOpen(false);
          restoreFocus();
        } else if (isLanguageModalOpen) {
          setIsLanguageModalOpen(false);
          restoreFocus();
        } else if (isSettingsOpen) {
          setIsSettingsOpen(false);
          restoreFocus();
        } else {
          setIsSettingsOpen(true);
        }
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [isCustomModalOpen, isLanguageModalOpen, isSettingsOpen, restoreFocus]);

  const shouldShowFullPageBlur = !isFocused && engine.status !== 'finished' && !isSettingsOpen && !isLanguageModalOpen && !isCustomModalOpen;

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        backgroundColor: 'var(--bg)',
        color: 'var(--text-main)',
        position: 'relative',
        transition: 'background-color 0.25s ease'
      }}
    >
      {/* Full-Page Content Wrapper (Receives Full-Page Blur When Unfocused) */}
      <div
        className={shouldShowFullPageBlur ? 'page-blurred' : 'page-focused'}
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          width: '100%'
        }}
      >
        {/* 1. Header Navigation (Responsive for bigger screens) */}
        <Header
          activeThemeId={activeThemeId}
          setThemeId={setThemeId}
          activeFontId={activeFontId}
          setFontId={setFontId}
          soundPreset={soundPreset}
          setSoundPreset={setSoundPreset}
          soundVolume={soundVolume}
          isAudioActive={isAudioActive}
          onToggleSound={handleToggleSound}
          onOpenSettings={() => setIsSettingsOpen(true)}
        />

        {/* 2. Main Content Sanctuary (Expanded for Bigger Screens & Ultrawide) */}
        <main
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '12px 32px clamp(48px, 7vh, 84px) 32px',
            width: '100%',
            maxWidth: 'min(1360px, 94vw)',
            margin: '0 auto',
            position: 'relative',
            zIndex: 1
          }}
        >
          {engine.status !== 'finished' ? (
            <>
              {/* Mode & Punctuation Controls Bar */}
              <TestSettingsBar
                mode={mode}
                setMode={(m) => {
                  savedModeConfigRef.current = null;
                  setMode(m);
                  setLastResult(null);
                }}
                timeLimit={timeLimit}
                setTimeLimit={(t) => {
                  savedModeConfigRef.current = null;
                  setTimeLimit(t);
                  setLastResult(null);
                }}
                wordLimit={wordLimit}
                setWordLimit={(w) => {
                  savedModeConfigRef.current = null;
                  setWordLimit(w);
                  setLastResult(null);
                }}
                quoteLength={quoteLength}
                setQuoteLength={(q) => {
                  savedModeConfigRef.current = null;
                  setQuoteLength(q);
                  setLastResult(null);
                }}
                punctuation={punctuation}
                setPunctuation={setPunctuation}
                numbers={numbers}
                setNumbers={setNumbers}
                vocabularyMode={vocabularyMode}
                setVocabularyMode={setVocabularyMode}
                onOpenCustomModal={() => setIsCustomModalOpen(true)}
              />

              {/* Interactive Animated Companion (Mochi the Cat / Steaming Latte) */}
              <div style={{ marginBottom: '8px' }}>
                <Companion
                  type={companionType}
                  isTyping={engine.isActivelyTyping}
                  status={engine.status}
                  wpm={engine.liveWpm}
                  streak={engine.currentStreak}
                  hasError={engine.hasRecentError}
                  themeAccent={activeTheme.colors.accent}
                />
              </div>

              {/* Core Typing Test Area (Responsive Big Screen Dimensions) */}
              <TypingTest
                engine={engine}
                mode={mode}
                timeLimit={timeLimit}
                wordLimit={wordLimit}
                caretStyle={caretStyle}
                fontFamily={activeFont.family}
                isFocused={isFocused}
                setIsFocused={setIsFocused}
                inputRef={typingInputRef}
                language={language}
                challengeMods={normalizedChallengeMods}
                onOpenLanguageModal={() => setIsLanguageModalOpen(true)}
                onRestart={handleRestart}
                paceCaret={paceCaret}
                personalBestWpm={personalBestWpm}
              />

              {/* Optional On-Screen Aesthetic Keyboard */}
              {showKeyboard && (
                <div style={{ marginTop: '24px' }}>
                  <KeyboardVisualizer />
                </div>
              )}
            </>
          ) : (
            /* 3. Post-Test Results Sanctuary */
            <ResultsView
              result={lastResult}
              onRestart={handleRestart}
              onPracticeErrors={handlePracticeErrors}
            />
          )}
        </main>

        {/* 4. Footer & Aesthetic Credits (Responsive for bigger screens) */}
        <footer
          style={{
            padding: '24px 36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            maxWidth: 'min(1400px, 95vw)',
            margin: '0 auto',
            width: '100%',
            fontSize: '13px',
            color: 'var(--text-sub)',
            userSelect: 'none'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span>built for cozy focus & gentle fingers</span>
            {personalBestWpm > 0 && (
              <span>• PB: <strong style={{ color: 'var(--accent)' }}>{personalBestWpm} wpm</strong></span>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <button
              onClick={() => setShowKeyboard(prev => !prev)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                color: showKeyboard ? 'var(--accent)' : 'var(--text-sub)',
                fontSize: '13px',
                cursor: 'pointer'
              }}
              title="Toggle on-screen visual keyboard"
            >
              <Keyboard size={15} />
              <span>{showKeyboard ? 'hide keyboard' : 'visual keyboard'}</span>
            </button>
            <span>•</span>
            <a
              href="https://github.com/TheIonius"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                color: 'var(--text-sub)',
                fontSize: '13px',
                textDecoration: 'none',
                transition: 'color 0.15s ease'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--accent)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-sub)'; }}
              title="GitHub Profile @TheIonius"
              aria-label="GitHub Profile @TheIonius"
            >
              <GithubIcon size={14} />
              <span>@TheIonius</span>
            </a>
            <span>•</span>
            <span>v1.0 pawtap</span>
          </div>
        </footer>
      </div>

      {/* 5. Full-Screen Unfocused Blur Overlay (Clean Borderless Floating Text) */}
      {shouldShowFullPageBlur && (
        <div
          onPointerDown={restoreFocus}
          onClick={restoreFocus}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 995,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.04)',
            backdropFilter: 'blur(4px)',
            cursor: 'pointer',
            userSelect: 'none'
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '8px',
              animation: 'fadeInUp 0.2s ease-out'
            }}
          >
            <span
              style={{
                fontSize: '24px',
                fontWeight: 600,
                color: 'var(--text-main)',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                letterSpacing: '-0.2px'
              }}
            >
              Click or press any key to focus
            </span>
            <span style={{ fontSize: '14px', color: 'var(--text-sub)' }}>
              your cozy sanctuary is waiting
            </span>
          </div>
        </div>
      )}

      {/* 6. Customizer Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => {
          setIsSettingsOpen(false);
          restoreFocus();
        }}
        activeThemeId={activeThemeId}
        setThemeId={setThemeId}
        activeFontId={activeFontId}
        setFontId={setFontId}
        caretStyle={caretStyle}
        setCaretStyle={setCaretStyle}
        companionType={companionType}
        setCompanionType={setCompanionType}
        soundPreset={soundPreset}
        setSoundPreset={setSoundPreset}
        soundVolume={soundVolume}
        setSoundVolume={setSoundVolume}
        ambientSound={ambientSound}
        setAmbientSoundType={setAmbientSoundType}
        ambientVolume={ambientVolume}
        setAmbientVolume={setAmbientVolume}
        vocabularyMode={vocabularyMode}
        setVocabularyMode={setVocabularyMode}
        challengeMods={normalizedChallengeMods}
        setChallengeMods={setChallengeMods}
        paceCaret={paceCaret}
        setPaceCaret={setPaceCaret}
        personalBestWpm={personalBestWpm}
      />

      {/* 7. Language Switcher Modal */}
      <LanguageModal
        isOpen={isLanguageModalOpen}
        onClose={() => {
          setIsLanguageModalOpen(false);
          restoreFocus();
        }}
        currentLanguage={language}
        onSelectLanguage={(newLang) => {
          setLanguage(newLang);
          setLastResult(null);
          setIsLanguageModalOpen(false);
          restoreFocus();
        }}
      />

      {/* 8. Custom Text & Code Snippets Modal */}
      <CustomTextModal
        isOpen={isCustomModalOpen}
        onClose={() => {
          setIsCustomModalOpen(false);
          restoreFocus();
        }}
        customText={customText}
        onApplyCustomText={handleApplyCustomText}
      />
    </div>
  );
}
