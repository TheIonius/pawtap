import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
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
import { getWordsTargetingKeys } from './constants/wordLists';
import { DEFAULT_CUSTOM_TEXT } from './constants/codeSnippets';
import { DEFAULT_PROFILE } from './constants/profile';
import { ProfileModal } from './components/ProfileModal';
import { MusicPlayer } from './components/MusicPlayer';
import { DEFAULT_MUSIC_URL } from './constants/music';

export default function App() {
  // User preferences
  const [activeThemeId, setThemeId] = useLocalStorage('pawtap_theme', 'boba-tea');
  const [activeFontId, setFontId] = useLocalStorage('pawtap_font', 'nunito');
  const [caretStyle, setCaretStyle] = useLocalStorage('pawtap_caret', 'underline');
  const [paceCaret, setPaceCaret] = useLocalStorage('pawtap_pace_caret', 'off');
  const [companionType, setCompanionType] = useLocalStorage('pawtap_companion', 'cat');
  const [soundPreset, setSoundPreset] = useLocalStorage('pawtap_sound_preset', 'matcha');
  const [soundVolume, setSoundVolume] = useLocalStorage('pawtap_sound_vol', 0.65);
  const [showKeyboard, setShowKeyboard] = useLocalStorage('pawtap_show_keyboard', false);
  const [language, setLanguage] = useLocalStorage('pawtap_language', 'english');
  const [customText, setCustomText] = useLocalStorage('pawtap_custom_text', DEFAULT_CUSTOM_TEXT);
  const [profile, setProfile] = useLocalStorage('pawtap_profile', DEFAULT_PROFILE);
  const [hasOnboardedProfile, setHasOnboardedProfile] = useLocalStorage('pawtap_profile_onboarded', false);
  const [musicUrl, setMusicUrl] = useLocalStorage('pawtap_music_url', DEFAULT_MUSIC_URL);
  const [isMusicVisible, setIsMusicVisible] = useLocalStorage('pawtap_music_visible', true);
  const [isMusicCollapsed, setIsMusicCollapsed] = useLocalStorage('pawtap_music_collapsed', true);
  const [musicVolume, setMusicVolume] = useLocalStorage('pawtap_music_vol', 75);

  // Music player state initialization and legacy cleanup
  useEffect(() => {
    if (musicUrl && musicUrl.includes('jfKfPfyJRdk')) {
      setMusicUrl('');
    }
    if (isMusicVisible === false) {
      setIsMusicVisible(true);
    }
  }, [musicUrl, setMusicUrl, isMusicVisible, setIsMusicVisible]);

  // Ensure profile has default values if missing from storage
  const safeProfile = useMemo(() => ({
    ...DEFAULT_PROFILE,
    ...(profile && typeof profile === 'object' ? profile : {})
  }), [profile]);

  // Statistics persistence
  const [testsCompleted, setTestsCompleted] = useLocalStorage('pawtap_tests_count', 0);
  const [personalBestWpm, setPersonalBestWpm] = useLocalStorage('pawtap_pb_wpm', 0);

  // Test configuration
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

  // Modal and result state
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isLanguageModalOpen, setIsLanguageModalOpen] = useState(false);
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  const [lastResult, setLastResult] = useState(null);

  // Focus tracking
  const [isFocused, setIsFocused] = useState(true);
  const typingInputRef = useRef(null);

  // Prompt profile modal on first visit
  useEffect(() => {
    if (!hasOnboardedProfile) {
      const timer = setTimeout(() => {
        setIsProfileModalOpen(true);
        setIsFocused(true);
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [hasOnboardedProfile, setIsFocused]);

  // Theme and font resolution
  const activeTheme = THEMES[activeThemeId] || THEMES['boba-tea'] || THEMES['oat-latte'];
  const activeFont = FONTS.find(f => f.id === activeFontId) || FONTS[1];

  // Apply CSS variables to document root
  useEffect(() => {
    const root = document.documentElement;
    Object.entries(activeTheme.colors).forEach(([key, val]) => {
      const cssVar = '--' + key.replace(/([A-Z])/g, '-$1').toLowerCase();
      root.style.setProperty(cssVar, val);
    });
    root.style.setProperty('--font-active', activeFont.family);
  }, [activeTheme, activeFont]);

  // Test completion handler
  const handleTestFinish = useCallback((result) => {
    // Check if user set a new personal record
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

      // Trigger confetti on new personal record
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

  // Initialize typing engine
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

  // Restore focus to typing input
  const restoreFocus = useCallback((e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setIsFocused(true);
    if (typingInputRef.current) {
      typingInputRef.current.focus({ preventScroll: true });
    }
  }, [setIsFocused]);

  // Consolidated active modal state
  const isAnyModalOpen = isSettingsOpen || isProfileModalOpen || isLanguageModalOpen || isCustomModalOpen;

  // Window blur and visibility change handlers
  useEffect(() => {
    const isMusicActive = isMusicVisible && !isMusicCollapsed;

    const handleWindowBlur = () => {
      // Do not trigger blur overlay if focus moved to an iframe or music player is active
      if (isMusicActive || (document.activeElement && document.activeElement.tagName === 'IFRAME')) {
        return;
      }
      // Do not trigger blur overlay if a modal is open
      if (engine.status !== 'finished' && !isAnyModalOpen) {
        setIsFocused(false);
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden && engine.status !== 'finished' && !isAnyModalOpen && !isMusicActive) {
        setIsFocused(false);
      }
    };

    const handleWindowFocus = () => {
      if (isAnyModalOpen || isMusicActive) {
        setIsFocused(true);
      }
    };

    window.addEventListener('blur', handleWindowBlur);
    window.addEventListener('focus', handleWindowFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      window.removeEventListener('blur', handleWindowBlur);
      window.removeEventListener('focus', handleWindowFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [engine.status, isAnyModalOpen, isMusicVisible, isMusicCollapsed]);

  // Global pointer and keydown listeners to restore focus
  useEffect(() => {
    const handleGlobalPointerDown = (e) => {
      // Minimize music player when clicking outside
      if (isMusicVisible && !isMusicCollapsed) {
        if (!e.target.closest || (!e.target.closest('.music-player-container') && !e.target.closest('.spotify-widget-container'))) {
          setIsMusicCollapsed(true);
        }
      }

      // Ignore interactive elements
      if (e.target.closest && e.target.closest('button, select, input, [role="dialog"], .modal-content, a, textarea, .music-player-container, .spotify-widget-container, iframe')) {
        return;
      }
      if (!isAnyModalOpen) {
        restoreFocus(e);
      }
    };

    const handleGlobalKeyDown = (e) => {
      if (isAnyModalOpen) return;

      // Toggle visual keyboard shortcut: Alt+K or F2
      if ((e.altKey && (e.key === 'k' || e.key === 'K')) || e.key === 'F2') {
        e.preventDefault();
        setShowKeyboard(prev => !prev);
        return;
      }

      // Allow browser keyboard shortcuts to pass through untouched
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
  }, [isFocused, isAnyModalOpen, isMusicVisible, isMusicCollapsed, setIsMusicCollapsed, restoreFocus, engine, setShowKeyboard]);

  // Practice words containing errors from last test
  const handlePracticeErrors = useCallback((targetKeys = null) => {
    if (!lastResult || !lastResult.keyErrors) return;
    const errorKeys = targetKeys && targetKeys.length > 0 ? targetKeys : Object.keys(lastResult.keyErrors);
    if (errorKeys.length === 0) return;

    // Save previous configuration to restore on restart
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

  // Handle Escape key to close open modal or toggle settings
  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        if (isMusicVisible && !isMusicCollapsed) {
          setIsMusicCollapsed(true);
          restoreFocus();
        } else if (isProfileModalOpen) {
          setIsProfileModalOpen(false);
          if (!isSettingsOpen) {
            restoreFocus();
          }
        } else if (isCustomModalOpen) {
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
  }, [isProfileModalOpen, isCustomModalOpen, isLanguageModalOpen, isSettingsOpen, isMusicVisible, isMusicCollapsed, setIsMusicCollapsed, restoreFocus]);

  const isMusicActive = isMusicVisible && !isMusicCollapsed;
  const shouldShowFullPageBlur = !isFocused && engine.status !== 'finished' && !isAnyModalOpen && !isMusicActive;

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
      {/* Main page layout */}
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
        {/* Header navigation */}
        <Header
          activeThemeId={activeThemeId}
          setThemeId={setThemeId}
          onOpenSettings={() => {
            setIsSettingsOpen(true);
            setIsFocused(true);
          }}
          profile={safeProfile}
          onOpenProfile={() => {
            setIsProfileModalOpen(true);
            setIsFocused(true);
          }}
        />

        {/* Main test container */}
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
              {/* Test settings bar */}
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
                onOpenCustomModal={() => {
                  setIsCustomModalOpen(true);
                  setIsFocused(true);
                }}
              />

              {/* Companion avatar */}
              <div style={{ marginBottom: '8px' }}>
                <Companion
                  type={companionType}
                  isTyping={engine.isActivelyTyping}
                  status={engine.status}
                  wpm={engine.liveWpm}
                  streak={engine.currentStreak}
                  hasError={engine.hasRecentError}
                  themeAccent={activeTheme.colors.accent}
                  profile={safeProfile}
                />
              </div>

              {/* Typing test engine */}
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
                onOpenLanguageModal={() => {
                  setIsLanguageModalOpen(true);
                  setIsFocused(true);
                }}
                onRestart={handleRestart}
                paceCaret={paceCaret}
                personalBestWpm={personalBestWpm}
                showKeyboard={showKeyboard}
                onToggleKeyboard={() => setShowKeyboard(prev => !prev)}
              />

              {/* On-screen visual keyboard */}
              {showKeyboard && (
                <div style={{ marginTop: '24px' }}>
                  <KeyboardVisualizer />
                </div>
              )}
            </>
          ) : (
            /* Results view */
            <ResultsView
              result={lastResult}
              onRestart={handleRestart}
              onPracticeErrors={handlePracticeErrors}
              profile={safeProfile}
            />
          )}
        </main>

        {/* Footer */}
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
            <span>v1.1.0-dev pawtap</span>
          </div>
        </footer>
      </div>

      {/* Unfocused blur overlay */}
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
            userSelect: 'none',
            animation: 'fadeIn 0.24s cubic-bezier(0.16, 1, 0.3, 1)'
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '8px',
              animation: 'fadeInUp 0.28s cubic-bezier(0.16, 1, 0.3, 1)'
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

      {/* Settings modal */}
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
        vocabularyMode={vocabularyMode}
        setVocabularyMode={setVocabularyMode}
        challengeMods={normalizedChallengeMods}
        setChallengeMods={setChallengeMods}
        paceCaret={paceCaret}
        setPaceCaret={setPaceCaret}
        personalBestWpm={personalBestWpm}
        profile={safeProfile}
        onOpenProfile={() => {
          setIsProfileModalOpen(true);
          setIsFocused(true);
        }}
        musicUrl={musicUrl}
        setMusicUrl={setMusicUrl}
        isMusicVisible={isMusicVisible}
        setIsMusicVisible={setIsMusicVisible}
        musicVolume={musicVolume}
        setMusicVolume={setMusicVolume}
      />

      {/* Language selection modal */}
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

      {/* Custom text modal */}
      <CustomTextModal
        isOpen={isCustomModalOpen}
        onClose={() => {
          setIsCustomModalOpen(false);
          restoreFocus();
        }}
        customText={customText}
        onApplyCustomText={handleApplyCustomText}
      />

      {/* Profile modal */}
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => {
          setHasOnboardedProfile(true);
          setIsProfileModalOpen(false);
          if (!isSettingsOpen) {
            restoreFocus();
          }
        }}
        profile={safeProfile}
        setProfile={setProfile}
        personalBestWpm={personalBestWpm}
        testsCompleted={testsCompleted}
        isFirstVisit={!hasOnboardedProfile}
      />

      {/* Music player widget */}
      <MusicPlayer
        musicUrl={musicUrl}
        setMusicUrl={setMusicUrl}
        isVisible={isMusicVisible}
        onClose={() => {
          setIsMusicCollapsed(true);
          restoreFocus();
        }}
        isCollapsed={isMusicCollapsed}
        setIsCollapsed={setIsMusicCollapsed}
        musicVolume={musicVolume}
        setMusicVolume={setMusicVolume}
        onRestoreFocus={restoreFocus}
      />
    </div>
  );
}
