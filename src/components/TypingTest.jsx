import React, { useRef, useEffect, useState, useLayoutEffect } from 'react';
import { Sparkles, Skull, EyeOff, Flashlight } from 'lucide-react';
import { SUPPORTED_LANGUAGES } from '../constants/wordLists';
import { FlagIcon } from './FlagIcon';

export function TypingTest({
  engine,
  mode,
  caretStyle = 'underline',
  fontFamily = "'Nunito', sans-serif",
  isFocused = true,
  setIsFocused = () => {},
  inputRef = null,
  language = 'english',
  challengeMods = [],
  challengeMode = 'normal',
  onOpenLanguageModal = () => {},
  paceCaret = 'off',
  personalBestWpm = 0,
  showKeyboard = false,
  onToggleKeyboard = () => {}
}) {
  const activeMods = Array.isArray(challengeMods) && challengeMods.length > 0
    ? challengeMods
    : (engine.challengeMods && Array.isArray(engine.challengeMods) && engine.challengeMods.length > 0)
      ? engine.challengeMods
      : (challengeMode && challengeMode !== 'normal' && challengeMode !== 'none')
        ? [challengeMode]
        : [];

  const isDisappearing = activeMods.includes('disappearing');
  const isFlashlight = activeMods.includes('flashlight');
  const isSuddenDeath = activeMods.includes('sudden_death');
  const {
    words,
    currentWordIndex,
    currentInput,
    typedHistory,
    status,
    timeLeft,
    elapsedSeconds,
    currentStreak,
    handleKeyDown
  } = engine;

  const currentLangObj = SUPPORTED_LANGUAGES.find(l => l.id === language) || SUPPORTED_LANGUAGES[0];
  const currentLanguageName = currentLangObj.name.toLowerCase();

  const containerRef = useRef(null);
  const wordsContainerRef = useRef(null);
  const localInputRef = useRef(null);
  const activeInputRef = inputRef || localInputRef;
  const lastActiveTopRef = useRef(-1);

  const [caretPos, setCaretPos] = useState({ top: 0, left: 0, height: 32, width: 2 });
  const [ghostCaretPos, setGhostCaretPos] = useState(null);
  const [lineOffsetY, setLineOffsetY] = useState(0);
  const [isCapsLock, setIsCapsLock] = useState(false);
  const [, setResizeTick] = useState(0);

  // Track CapsLock state
  useEffect(() => {
    const handleKeyMod = (e) => {
      if (typeof e.getModifierState === 'function') {
        setIsCapsLock(e.getModifierState('CapsLock'));
      }
    };
    window.addEventListener('keydown', handleKeyMod);
    window.addEventListener('keyup', handleKeyMod);
    return () => {
      window.removeEventListener('keydown', handleKeyMod);
      window.removeEventListener('keyup', handleKeyMod);
    };
  }, []);

  // Recalculate caret coordinates on window resize
  useEffect(() => {
    const handleResize = () => {
      setResizeTick(t => t + 1);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Invalidate line cache on words change
  useEffect(() => {
    lastActiveTopRef.current = -1;
  }, [words]);

  // Auto-focus input when words change
  useEffect(() => {
    if (activeInputRef.current) {
      activeInputRef.current.focus({ preventScroll: true });
    }
  }, [words, activeInputRef]);

  // Pace caret position update
  useEffect(() => {
    if (paceCaret === 'off' || !wordsContainerRef.current || words.length === 0) {
      setGhostCaretPos(null);
      return;
    }

    const targetWpm = paceCaret === 'pb' ? Math.max(20, personalBestWpm || 60) : (parseInt(paceCaret, 10) || 60);

    if (status === 'idle') {
      const firstWordElem = wordsContainerRef.current.querySelector('[data-word-index="0"]');
      if (firstWordElem) {
        const containerRect = wordsContainerRef.current.getBoundingClientRect();
        const wordRect = firstWordElem.getBoundingClientRect();
        setGhostCaretPos({
          top: wordRect.top - containerRect.top,
          left: wordRect.left - containerRect.left - 2,
          height: wordRect.height || 32,
          targetWpm
        });
      }
      return;
    }

    if (status !== 'running') {
      setGhostCaretPos(null);
      return;
    }

    let animId;
    const updateGhostPosition = () => {
      if (!wordsContainerRef.current) return;
      const startTime = engine.startTime || Date.now();
      const elapsed = Math.max(0, (Date.now() - startTime) / 1000);
      const targetChars = (targetWpm * 5 / 60) * elapsed;

      let accumulated = 0;
      let targetWordIdx = 0;
      let targetCharIdx = 0;
      let charFraction = 0;

      for (let i = 0; i < words.length; i++) {
        const wordLen = words[i].length + 1;
        if (accumulated + wordLen > targetChars || i === words.length - 1) {
          targetWordIdx = i;
          const charsIntoWord = Math.max(0, targetChars - accumulated);
          targetCharIdx = Math.min(words[i].length, Math.floor(charsIntoWord));
          charFraction = charsIntoWord - Math.floor(charsIntoWord);
          break;
        }
        accumulated += wordLen;
      }

      const wordElem = wordsContainerRef.current.querySelector(`[data-word-index="${targetWordIdx}"]`);
      if (wordElem) {
        const containerRect = wordsContainerRef.current.getBoundingClientRect();
        const charSpans = wordElem.querySelectorAll('.char');

        if (targetCharIdx < charSpans.length) {
          const charSpan = charSpans[targetCharIdx];
          const charRect = charSpan.getBoundingClientRect();
          const left = charRect.left - containerRect.left - 2 + (charFraction * charRect.width);
          const top = charRect.top - containerRect.top;
          setGhostCaretPos({
            top,
            left,
            height: charRect.height || 32,
            targetWpm
          });
        } else if (charSpans.length > 0) {
          const lastSpan = charSpans[charSpans.length - 1];
          const lastRect = lastSpan.getBoundingClientRect();
          const left = lastRect.right - containerRect.left;
          const top = lastRect.top - containerRect.top;
          setGhostCaretPos({
            top,
            left,
            height: lastRect.height || 32,
            targetWpm
          });
        }
      }

      animId = requestAnimationFrame(updateGhostPosition);
    };

    animId = requestAnimationFrame(updateGhostPosition);
    return () => cancelAnimationFrame(animId);
  }, [paceCaret, personalBestWpm, status, words, engine.startTime]);

  // Calculate caret coordinates and line scroll offset
  useLayoutEffect(() => {
    if (!wordsContainerRef.current) return;

    // Find active word and character element
    const activeWordElem = wordsContainerRef.current.querySelector(`[data-word-index="${currentWordIndex}"]`);
    if (!activeWordElem) return;

    let targetCharElem = null;
    const charIndex = currentInput.length;

    const charSpans = activeWordElem.querySelectorAll('.char');
    if (charIndex < charSpans.length) {
      targetCharElem = charSpans[charIndex];
    } else if (charSpans.length > 0) {
      // Past word end: position after last character
      targetCharElem = charSpans[charSpans.length - 1];
    }

    const containerRect = wordsContainerRef.current.getBoundingClientRect();

    if (targetCharElem) {
      const charRect = targetCharElem.getBoundingClientRect();
      const isPastEnd = charIndex >= charSpans.length;

      const top = charRect.top - containerRect.top;
      // Offset caret 2px to the left of target character
      const left = (isPastEnd ? charRect.right : charRect.left) - containerRect.left - 2;
      const height = charRect.height;
      const width = charRect.width;

      setCaretPos({
        top,
        left,
        height,
        width: Math.max(2, width)
      });

      // Scroll container if caret advances past line 1
      const computedLineHeight = activeWordElem.offsetHeight || 54;
      const lineIndex = Math.floor(activeWordElem.offsetTop / computedLineHeight);
      if (lineIndex > 1) {
        setLineOffsetY((lineIndex - 1) * computedLineHeight);
      } else {
        setLineOffsetY(0);
      }
    } else {
      // Word start fallback
      const wordRect = activeWordElem.getBoundingClientRect();
      setCaretPos({
        top: wordRect.top - containerRect.top,
        left: wordRect.left - containerRect.left - 2,
        height: wordRect.height,
        width: 2
      });
    }

    // Apply line focus opacity to surrounding rows
    const computedLineHeight = activeWordElem.offsetHeight || 54;
    const activeTop = activeWordElem.offsetTop;

    if (!isDisappearing && !isFlashlight) {
      if (lastActiveTopRef.current !== activeTop) {
        lastActiveTopRef.current = activeTop;
        const allWordElems = wordsContainerRef.current.querySelectorAll('.word');
        allWordElems.forEach(el => {
          const diff = el.offsetTop - activeTop;
          if (diff < -5) {
            el.style.opacity = '0.42'; // Scrolled past
          } else if (Math.abs(diff) <= 8) {
            el.style.opacity = '1';    // Active line
          } else if (diff <= computedLineHeight + 10) {
            el.style.opacity = '0.68'; // Next line
          } else {
            el.style.opacity = '0.36'; // Subsequent lines
          }
        });
      }
    } else {
      if (lastActiveTopRef.current !== -2) {
        lastActiveTopRef.current = -2;
        const allWordElems = wordsContainerRef.current.querySelectorAll('.word');
        allWordElems.forEach(el => {
          el.style.opacity = '';
        });
      }
    }
  }, [currentWordIndex, currentInput, words, isDisappearing, isFlashlight]);

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        maxWidth: 'min(1360px, 94vw)',
        margin: '0 auto',
        position: 'relative',
        userSelect: 'none',
        outline: 'none',
        cursor: 'default'
      }}
    >
      {/* Hidden dummy input to capture keyboard focus */}
      <input
        ref={activeInputRef}
        type="text"
        autoCapitalize="off"
        autoComplete="off"
        autoCorrect="off"
        spellCheck="false"
        onKeyDown={handleKeyDown}
        onFocus={() => setIsFocused(true)}
        style={{
          position: 'absolute',
          opacity: 0,
          pointerEvents: 'none',
          top: 0,
          left: 0
        }}
      />

      {/* Live test status bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '10px',
          padding: '0 4px',
          minHeight: '36px'
        }}
      >
        {/* Progress counter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {mode === 'time' && status === 'running' && isFocused && (
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', animation: 'fadeInUp 0.15s ease' }}>
              <span
                style={{
                  fontSize: '34px',
                  fontWeight: 700,
                  fontFamily: 'var(--font-mono, monospace)',
                  color: timeLeft <= 5 ? 'var(--text-error)' : 'var(--accent)',
                  transition: 'color 0.2s ease',
                  lineHeight: 1
                }}
              >
                {timeLeft}
              </span>
              <span style={{ fontSize: '14px', color: 'var(--text-sub)', fontWeight: 500 }}>s</span>
            </div>
          )}

          {mode === 'words' && status === 'running' && isFocused && (
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', animation: 'fadeInUp 0.15s ease' }}>
              <span
                style={{
                  fontSize: '30px',
                  fontWeight: 700,
                  fontFamily: 'var(--font-mono, monospace)',
                  color: 'var(--accent)',
                  lineHeight: 1
                }}
              >
                {currentWordIndex}
              </span>
              <span style={{ fontSize: '15px', color: 'var(--text-sub)' }}>/ {words.length}</span>
              <span style={{ fontSize: '13px', color: 'var(--text-sub)', opacity: 0.8, fontFamily: 'var(--font-mono, monospace)' }}>
                • {Math.round(elapsedSeconds)}s
              </span>
            </div>
          )}

          {mode === 'quote' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', animation: 'fadeInUp 0.15s ease' }}>
              {status === 'running' && isFocused && (
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '5px' }}>
                  <span
                    style={{
                      fontSize: '28px',
                      fontWeight: 700,
                      fontFamily: 'var(--font-mono, monospace)',
                      color: 'var(--accent)',
                      lineHeight: 1
                    }}
                  >
                    {Math.round(elapsedSeconds)}
                  </span>
                  <span style={{ fontSize: '13px', color: 'var(--text-sub)', fontWeight: 500 }}>s</span>
                  <span style={{ fontSize: '12.5px', color: 'var(--text-sub)', fontFamily: 'var(--font-mono, monospace)', opacity: 0.85 }}>
                    ({currentWordIndex}/{words.length})
                  </span>
                  <span style={{ color: 'var(--border)', margin: '0 2px' }}>•</span>
                </div>
              )}
              <span style={{ fontSize: '13.5px', color: 'var(--text-sub)', fontStyle: 'italic' }}>
                {engine.quoteInfo ? `"${engine.quoteInfo.source}"` : 'Literary Quote'}
              </span>
            </div>
          )}

          {mode === 'zen' && status === 'running' && isFocused && (
            <span style={{ fontSize: '14px', color: 'var(--text-sub)', fontWeight: 500, animation: 'fadeInUp 0.15s ease' }}>
              zen mode • {Math.round(elapsedSeconds)}s
            </span>
          )}

          {/* CapsLock warning indicator */}
          {isCapsLock && (
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '3px 10px',
                borderRadius: '8px',
                backgroundColor: 'rgba(239, 68, 68, 0.12)',
                border: '1px solid rgba(239, 68, 68, 0.35)',
                color: 'var(--text-error)',
                fontSize: '11.5px',
                fontWeight: 700,
                letterSpacing: '0.4px',
                animation: 'pulseGlow 1.8s infinite'
              }}
              title="Caps Lock is active"
            >
              <span>⇪ Caps Lock ON</span>
            </div>
          )}

          {/* Streak indicator */}
          {currentStreak >= 10 && (
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '4px 12px',
                borderRadius: '14px',
                background: 'var(--surface)',
                border: '1.5px solid var(--border)',
                fontSize: '12px',
                fontWeight: 600,
                color: 'var(--accent)',
                boxShadow: '0 2px 8px var(--shadow)',
                animation: 'pulseGlow 2s infinite'
              }}
            >
              <Sparkles size={13} />
              <span>{currentStreak} streak!</span>
            </div>
          )}

          {/* Active challenge modifier badges */}
          {activeMods.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              {isSuddenDeath && (
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '28px',
                    height: '28px',
                    borderRadius: '8px',
                    backgroundColor: 'rgba(239, 68, 68, 0.12)',
                    border: '1.5px solid #EF4444',
                    boxShadow: '0 2px 6px rgba(239, 68, 68, 0.22)',
                    cursor: 'default'
                  }}
                  title="Sudden Death: 1 typo = instant fail"
                >
                  <Skull size={15} color="#EF4444" />
                </div>
              )}
              {isDisappearing && (
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '28px',
                    height: '28px',
                    borderRadius: '8px',
                    backgroundColor: 'rgba(168, 85, 247, 0.12)',
                    border: '1.5px solid #A855F7',
                    boxShadow: '0 2px 6px rgba(168, 85, 247, 0.22)',
                    cursor: 'default'
                  }}
                  title="Hidden: letters fade away ahead of typing"
                >
                  <EyeOff size={15} color="#A855F7" />
                </div>
              )}
              {isFlashlight && (
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '28px',
                    height: '28px',
                    borderRadius: '8px',
                    backgroundColor: 'rgba(59, 130, 246, 0.12)',
                    border: '1.5px solid #3B82F6',
                    boxShadow: '0 2px 6px rgba(59, 130, 246, 0.22)',
                    cursor: 'default'
                  }}
                  title="Flashlight: vision restricted to narrow beam around caret"
                >
                  <Flashlight size={15} color="#3B82F6" />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Language selector button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenLanguageModal();
            }}
            title="Switch Language (click to change test language)"
            className="action-btn"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '7px',
              padding: '7px 14px',
              borderRadius: '10px',
              border: '1.5px solid var(--border)',
              background: 'var(--surface)',
              color: 'var(--text-main)',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 2px 6px var(--shadow)',
              transition: 'all 0.16s ease'
            }}
          >
            <FlagIcon langId={language} width={18} height={12} />
            <span>{currentLanguageName}</span>
          </button>
        </div>
      </div>

      {/* Main words display container */}
      <div
        style={{
          position: 'relative',
          height: 'calc(var(--test-line-height, 54px) * 3)', // 3 visible lines
          overflow: 'hidden',
          padding: '0 4px',
          fontFamily: fontFamily,
          fontSize: 'var(--test-font-size, 32px)',
          lineHeight: 'var(--test-line-height, 54px)',
          letterSpacing: '0.015em'
        }}
      >
        {/* Word stream */}
        <div
          ref={wordsContainerRef}
          style={{
            position: 'relative',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0 16px',
            transform: `translateY(-${lineOffsetY}px)`,
            transition: 'transform 0.2s cubic-bezier(0.2, 0.85, 0.3, 1)'
          }}
        >
          {/* Active caret indicator */}
          {isFocused && status !== 'finished' && (
            <div
              className={`caret caret-${caretStyle} ${status === 'idle' ? 'caret-blink' : ''}`}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                transform: `translate3d(${caretPos.left}px, ${caretPos.top}px, 0)`,
                willChange: 'transform',
                height: caretStyle === 'underline' ? '2.5px' : `${caretPos.height}px`,
                width: caretStyle === 'block' ? `${caretPos.width}px` : caretStyle === 'underline' ? `${caretPos.width}px` : '2px',
                backgroundColor: caretStyle === 'block' ? 'transparent' : 'var(--caret)',
                borderBottom: caretStyle === 'underline' ? '2.5px solid var(--caret)' : undefined,
                borderRadius: caretStyle === 'block' ? '4px' : '1px',
                boxShadow: caretStyle === 'block' ? '0 0 0 1.5px var(--caret)' : undefined,
                opacity: caretStyle === 'block' ? 0.35 : 0.75,
                zIndex: 10,
                pointerEvents: 'none',
                transition: 'transform 0.07s cubic-bezier(0.15, 0.85, 0.35, 1)'
              }}
            />
          )}

          {/* Pace caret indicator */}
          {paceCaret !== 'off' && ghostCaretPos && (status === 'idle' || status === 'running') && (
            <div
              className="ghost-caret"
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                transform: `translate3d(${ghostCaretPos.left}px, ${ghostCaretPos.top}px, 0)`,
                willChange: 'transform',
                height: `${ghostCaretPos.height}px`,
                width: '2px',
                backgroundColor: 'var(--accent)',
                opacity: 0.45,
                zIndex: 8,
                pointerEvents: 'none',
                boxShadow: '0 0 6px var(--accent)'
              }}
            >
              {/* Pace target badge */}
              <div
                style={{
                  position: 'absolute',
                  bottom: '100%',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  marginBottom: '3px',
                  padding: '1px 5px',
                  borderRadius: '5px',
                  backgroundColor: 'var(--surface)',
                  border: '1px solid var(--accent)',
                  color: 'var(--accent)',
                  fontSize: '9.5px',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 700,
                  whiteSpace: 'nowrap',
                  opacity: 0.9,
                  lineHeight: 1.2,
                  boxShadow: '0 2px 6px rgba(0,0,0,0.15)'
                }}
              >
                {paceCaret === 'pb' ? `PB ${ghostCaretPos.targetWpm}` : `${ghostCaretPos.targetWpm} wpm`}
              </div>
            </div>
          )}

          {/* Flashlight mode overlay */}
          {isFlashlight && isFocused && status !== 'finished' && (
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none',
                background: `radial-gradient(circle 140px at ${caretPos.left + 8}px ${caretPos.top + 22}px, rgba(59, 130, 246, 0.14) 0%, rgba(59, 130, 246, 0.03) 55%, transparent 100%)`,
                zIndex: 6,
                transition: 'background 0.06s ease-out'
              }}
            />
          )}

          {words.map((word, wIdx) => {
            const isCurrent = wIdx === currentWordIndex;
            const isCompleted = wIdx < currentWordIndex;
            const typedWord = isCompleted ? typedHistory[wIdx] || '' : isCurrent ? currentInput : '';

            let wordOpacity = 1;
            if (isFlashlight) {
              const diff = Math.abs(wIdx - currentWordIndex);
              if (diff > 1) {
                wordOpacity = 0;
              } else if (wIdx === currentWordIndex - 1) {
                wordOpacity = 0.12;
              } else if (wIdx === currentWordIndex + 1) {
                wordOpacity = 0.22;
              } else {
                wordOpacity = 1;
              }
            } else if (isDisappearing) {
              if (isCompleted) {
                wordOpacity = 0.12;
              } else if (wIdx > currentWordIndex + 1) {
                wordOpacity = 0;
              } else if (wIdx === currentWordIndex + 1) {
                wordOpacity = 0.55;
              } else {
                wordOpacity = 1;
              }
            }

            return (
              <span
                key={wIdx}
                data-word-index={wIdx}
                className={`word ${isCurrent ? 'word-active' : ''}`}
                style={{
                  display: 'inline-block',
                  position: 'relative',
                  whiteSpace: 'nowrap',
                  opacity: wordOpacity,
                  transition: 'opacity 0.22s cubic-bezier(0.2, 0.8, 0.2, 1)'
                }}
              >
                {/* Render word characters */}
                {word.split('').map((char, cIdx) => {
                  let charClass = 'char char-untyped';
                  let charColor = 'var(--text-sub)';
                  let charBg = 'transparent';
                  let charTextDeco = 'none';
                  let charOpacity = 1;

                  if (cIdx < typedWord.length) {
                    if (typedWord[cIdx] === char) {
                      charClass = 'char char-correct';
                      charColor = 'var(--text-main)';
                    } else {
                      charClass = 'char char-incorrect';
                      charColor = 'var(--text-error)';
                      charBg = 'rgba(192, 78, 73, 0.12)';
                      charTextDeco = 'underline';
                    }

                    if (isDisappearing && isCurrent) {
                      charOpacity = 0.15;
                    } else if (isFlashlight && isCurrent) {
                      const distFromCaret = typedWord.length - cIdx;
                      charOpacity = distFromCaret <= 1 ? 0.8 : 0.25;
                    }
                  } else {
                    // Untyped characters in current word
                    if (isDisappearing && isCurrent) {
                      // Disappearing mode: hide remaining untyped letters
                      charOpacity = typedWord.length > 0 ? 0 : 0.35;
                    }

                    if (isFlashlight && isCurrent) {
                      // Flashlight mode: distance-based illumination
                      const distFromCaret = cIdx - typedWord.length;
                      if (distFromCaret === 0) {
                        charOpacity = (isDisappearing && typedWord.length > 0) ? 0 : 1;
                      } else if (distFromCaret === 1) {
                        charOpacity = (isDisappearing && typedWord.length > 0) ? 0 : 0.65;
                      } else {
                        charOpacity = 0;
                      }
                    }
                  }

                  return (
                    <span
                      key={cIdx}
                      className={charClass}
                      style={{
                        color: charColor,
                        backgroundColor: charBg,
                        borderRadius: charBg !== 'transparent' ? '4px' : undefined,
                        padding: charBg !== 'transparent' ? '0 1px' : undefined,
                        textDecorationLine: charTextDeco,
                        textUnderlineOffset: '4px',
                        textDecorationColor: 'var(--text-error)',
                        opacity: charOpacity,
                        transition: 'color 0.04s ease-out, background-color 0.1s ease, opacity 0.25s ease'
                      }}
                    >
                      {char}
                    </span>
                  );
                })}

                {/* Render extra overflow characters */}
                {typedWord.length > word.length && (
                  typedWord.slice(word.length).split('').map((extraChar, eIdx) => (
                    <span
                      key={`extra-${eIdx}`}
                      className="char char-extra"
                      style={{
                        color: 'var(--text-error-extra, #8A2E3D)',
                        backgroundColor: 'rgba(138, 46, 61, 0.14)',
                        borderRadius: '4px',
                        padding: '0 1px',
                        opacity: 0.9,
                        transition: 'background-color 0.1s ease'
                      }}
                    >
                      {extraChar}
                    </span>
                  ))
                )}
              </span>
            );
          })}
        </div>
      </div>

      {/* Keyboard shortcut hints */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '16px',
          marginTop: '24px',
          fontSize: '12.5px',
          color: 'var(--text-sub)'
        }}
      >
        <span><kbd className="kbd">tab</kbd> to restart</span>
        <span>•</span>
        <span><kbd className="kbd">esc</kbd> for themes & fonts</span>
        <span>•</span>
        <button
          type="button"
          onClick={onToggleKeyboard}
          onMouseDown={(e) => e.preventDefault()}
          style={{
            background: 'none',
            border: 'none',
            padding: 0,
            font: 'inherit',
            color: showKeyboard ? 'var(--accent)' : 'inherit',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'color 0.15s ease'
          }}
          title="Toggle on-screen visual keyboard (Alt+K)"
        >
          <kbd className="kbd">alt+k</kbd>
          <span>{showKeyboard ? 'hide keyboard' : 'keyboard'}</span>
        </button>
      </div>
    </div>
  );
}
