import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { getRandomWords } from '../constants/wordLists';
import { getRandomQuote } from '../constants/quotes';
import { calculateWpm, calculateRawWpm, calculateAccuracy, calculateConsistency } from '../utils/metrics';
import { playKeySound } from '../audio/soundEngine';

/**
 * Calculates net correct characters directly from actual words and typed history.
 * Guarantees zero double-counting, zero drift on backspaces, and 100% precision metrics.
 */
function getNetCorrectChars(words, typedHistory, currentWordIndex, currentInput) {
  let correct = 0;

  // 1. Check all completed words
  for (let i = 0; i < typedHistory.length; i++) {
    const target = words[i] || '';
    const typed = typedHistory[i] || '';
    const minLen = Math.min(target.length, typed.length);
    let wordMatches = 0;

    for (let c = 0; c < minLen; c++) {
      if (typed[c] === target[c]) {
        wordMatches++;
      }
    }
    correct += wordMatches;

    // Space counts as 1 correct character if the entire word was correct
    if (typed === target) {
      correct += 1;
    }
  }

  // 2. Check current word in progress
  const activeTarget = words[currentWordIndex] || '';
  const minActiveLen = Math.min(activeTarget.length, currentInput.length);
  for (let c = 0; c < minActiveLen; c++) {
    if (currentInput[c] === activeTarget[c]) {
      correct += 1;
    }
  }

  return correct;
}

export function useTypingEngine({
  mode = 'time',           // 'time' | 'words' | 'quote' | 'zen'
  timeLimit = 30,          // 15 | 30 | 60 | 120
  wordLimit = 25,          // 10 | 25 | 50 | 100
  quoteLength = 'medium',  // 'short' | 'medium' | 'long'
  punctuation = false,
  numbers = false,
  language = 'english',
  vocabularyMode = 'cozy', // 'cozy' | 'standard' | 'expert'
  challengeMods = [],      // array of active mods: ['sudden_death', 'disappearing', 'flashlight']
  challengeMode = null,    // backwards compatibility fallback
  soundPreset = 'creamy',
  soundVolume = 0.65,
  isPaused = false,
  onRestart = null,
  onFinish = null,
}) {
  const activeMods = useMemo(() => {
    return Array.isArray(challengeMods)
      ? challengeMods
      : (challengeMods && challengeMods !== 'normal' && challengeMods !== 'none')
        ? [challengeMods]
        : (challengeMode && challengeMode !== 'normal' && challengeMode !== 'none')
          ? [challengeMode]
          : [];
  }, [challengeMods, challengeMode]);

  const [words, setWords] = useState([]);
  const [quoteInfo, setQuoteInfo] = useState(null);
  
  // Typing progress state
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentInput, setCurrentInput] = useState('');
  const [typedHistory, setTypedHistory] = useState([]); // Array of strings (one per completed word)
  
  // Status: 'idle' | 'running' | 'finished'
  const [status, setStatus] = useState('idle');
  const [isActivelyTyping, setIsActivelyTyping] = useState(false);
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Live stats & metrics
  const [liveWpm, setLiveWpm] = useState(0);
  const [liveAccuracy, setLiveAccuracy] = useState(100);
  const [wpmHistory, setWpmHistory] = useState([]); // [{ second, wpm, rawWpm, errors }]
  const [rawKeyStats, setRawKeyStats] = useState({ correct: 0, incorrect: 0, extra: 0, missed: 0 });
  const [keyErrors, setKeyErrors] = useState({}); // { 'e': 3, 'a': 1 }
  const [currentStreak, setCurrentStreak] = useState(0);
  const [hasRecentError, setHasRecentError] = useState(false);

  const timerRef = useRef(null);
  const typingActivityTimerRef = useRef(null);
  const startTimeRef = useRef(null);
  const pausedAtRef = useRef(null);
  const totalKeystrokesRef = useRef(0);
  const totalErrorsRef = useRef(0);
  const lastLoggedSecRef = useRef(0);
  const statusRef = useRef(status);
  const wordsRef = useRef(words);
  const typedHistoryRef = useRef(typedHistory);
  const currentWordIndexRef = useRef(currentWordIndex);
  const currentInputRef = useRef(currentInput);

  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  useEffect(() => {
    wordsRef.current = words;
    typedHistoryRef.current = typedHistory;
    currentWordIndexRef.current = currentWordIndex;
    currentInputRef.current = currentInput;
  }, [words, typedHistory, currentWordIndex, currentInput]);

  // Handle Pause when tab or browser unfocuses
  useEffect(() => {
    if (isPaused && status === 'running') {
      if (!pausedAtRef.current) {
        pausedAtRef.current = Date.now();
      }
    } else if (!isPaused && status === 'running') {
      if (pausedAtRef.current && startTimeRef.current) {
        const pauseDuration = Date.now() - pausedAtRef.current;
        startTimeRef.current += pauseDuration;
        pausedAtRef.current = null;
      }
    }
  }, [isPaused, status]);

  // 1. Initialize words or quote based on active mode
  const initializeTest = useCallback((overrideWords = null) => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (typingActivityTimerRef.current) clearTimeout(typingActivityTimerRef.current);
    
    setStatus('idle');
    statusRef.current = 'idle';
    setIsActivelyTyping(false);
    setCurrentWordIndex(0);
    setCurrentInput('');
    setTypedHistory([]);
    setWpmHistory([]);
    setLiveWpm(0);
    setLiveAccuracy(100);
    totalKeystrokesRef.current = 0;
    totalErrorsRef.current = 0;
    setRawKeyStats({ correct: 0, incorrect: 0, extra: 0, missed: 0 });
    setKeyErrors({});
    setCurrentStreak(0);
    setHasRecentError(false);
    setTimeLeft(timeLimit);
    setElapsedSeconds(0);
    startTimeRef.current = null;
    pausedAtRef.current = null;
    lastLoggedSecRef.current = 0;

    if (overrideWords && Array.isArray(overrideWords) && overrideWords.length > 0) {
      setQuoteInfo(null);
      setWords(overrideWords);
      return;
    }

    if (mode === 'quote') {
      const q = getRandomQuote(quoteLength);
      setQuoteInfo(q);
      setWords(q.text.split(' '));
    } else {
      setQuoteInfo(null);
      const count = mode === 'words' ? wordLimit : Math.max(90, Math.ceil(timeLimit * 2.8));
      const generated = getRandomWords(count, { punctuation, numbers, language, mode: vocabularyMode });
      setWords(generated);
    }
  }, [mode, timeLimit, wordLimit, quoteLength, punctuation, numbers, language, vocabularyMode]);

  useEffect(() => {
    // oxlint-disable-next-line react/set-state-in-effect
    initializeTest();
  }, [initializeTest]);

  // 2. Finalize test handler
  const finishTest = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (typingActivityTimerRef.current) {
      clearTimeout(typingActivityTimerRef.current);
    }
    setStatus('finished');
    statusRef.current = 'finished';
    setIsActivelyTyping(false);

    const now = Date.now();
    const duration = startTimeRef.current ? Math.max(1, (now - startTimeRef.current) / 1000) : 1;
    
    // Accurate net characters calculation
    const netCorrect = getNetCorrectChars(words, typedHistory, currentWordIndex, currentInput);
    const totalTyped = totalKeystrokesRef.current;
    const finalWpm = calculateWpm(netCorrect, duration);
    const finalRaw = calculateRawWpm(totalTyped, duration);
    const finalAcc = calculateAccuracy(netCorrect, totalTyped);

    const finalKeyStats = {
      correct: netCorrect,
      incorrect: totalErrorsRef.current,
      extra: Math.max(0, totalTyped - netCorrect - totalErrorsRef.current),
      missed: 0
    };
    setRawKeyStats(finalKeyStats);

    setWpmHistory(prev => {
      const finalConsistency = calculateConsistency(prev);
      const resultPayload = {
        wpm: finalWpm,
        rawWpm: finalRaw,
        accuracy: finalAcc,
        consistency: finalConsistency,
        duration: Math.round(duration),
        wpmHistory: prev,
        rawKeyStats: finalKeyStats,
        keyErrors,
        mode,
        timeLimit,
        wordLimit,
        quoteInfo,
        timestamp: Date.now(),
        wordsCompleted: currentWordIndex + (currentInput.length > 0 ? 1 : 0)
      };

      if (onFinish) {
        onFinish(resultPayload);
      }
      return prev;
    });
  }, [
    words,
    typedHistory,
    currentWordIndex,
    currentInput,
    keyErrors,
    mode,
    timeLimit,
    wordLimit,
    quoteInfo,
    onFinish
  ]);

  // Sudden Death Failure Handler: takes user immediately to results screen with loss metrics
  const failTest = useCallback(({ failedKey, expectedKey, targetWord }) => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (typingActivityTimerRef.current) {
      clearTimeout(typingActivityTimerRef.current);
    }
    setStatus('finished');
    statusRef.current = 'finished';
    setIsActivelyTyping(false);

    const now = Date.now();
    const duration = startTimeRef.current ? Math.max(1, (now - startTimeRef.current) / 1000) : 1;

    const netCorrect = getNetCorrectChars(words, typedHistory, currentWordIndex, currentInput);
    const totalTyped = totalKeystrokesRef.current;
    const finalWpm = calculateWpm(netCorrect, duration);
    const finalRaw = calculateRawWpm(totalTyped, duration);
    const finalAcc = calculateAccuracy(netCorrect, totalTyped);

    const finalKeyStats = {
      correct: netCorrect,
      incorrect: totalErrorsRef.current,
      extra: Math.max(0, totalTyped - netCorrect - totalErrorsRef.current),
      missed: 1
    };
    setRawKeyStats(finalKeyStats);

    setWpmHistory(prev => {
      const finalConsistency = calculateConsistency(prev);
      const updatedKeyErrors = {
        ...keyErrors,
        [expectedKey || failedKey]: (keyErrors[expectedKey || failedKey] || 0) + 1
      };
      const historyToSave = prev.length > 0
        ? prev
        : [{ second: Math.max(1, Math.round(duration)), wpm: finalWpm, rawWpm: finalRaw, errors: 1 }];

      const resultPayload = {
        wpm: finalWpm,
        rawWpm: finalRaw,
        accuracy: finalAcc,
        consistency: finalConsistency,
        duration: Math.round(duration),
        wpmHistory: historyToSave,
        rawKeyStats: finalKeyStats,
        keyErrors: updatedKeyErrors,
        mode,
        timeLimit,
        wordLimit,
        quoteInfo,
        timestamp: Date.now(),
        wordsCompleted: currentWordIndex,
        failed: true,
        failureReason: 'sudden_death',
        failedKey,
        expectedKey,
        targetWord,
        challengeMods: activeMods
      };

      if (onFinish) {
        onFinish(resultPayload);
      }
      return historyToSave;
    });
  }, [
    words,
    typedHistory,
    currentWordIndex,
    currentInput,
    keyErrors,
    mode,
    timeLimit,
    wordLimit,
    quoteInfo,
    activeMods,
    onFinish
  ]);

  // 3. High-Precision Real-Time Clock Loop (Fluid & Butter-Smooth)
  useEffect(() => {
    if (status !== 'running' || isPaused) return;

    timerRef.current = setInterval(() => {
      if (!startTimeRef.current || statusRef.current !== 'running') return;

      const now = Date.now();
      const elapsed = Math.max(0, (now - startTimeRef.current) / 1000);

      // Check countdown in time mode
      if (mode === 'time') {
        const remaining = Math.max(0, timeLimit - elapsed);
        const displayRemaining = Math.ceil(remaining);
        setTimeLeft(prev => (prev !== displayRemaining ? displayRemaining : prev));

        if (remaining <= 0) {
          finishTest();
          return;
        }
      } else if (mode === 'zen') {
        const displayElapsed = Math.round(elapsed);
        setElapsedSeconds(prev => (prev !== displayElapsed ? displayElapsed : prev));
      }

      // Record second-by-second telemetry snapshot for SVG chart
      const currentSecond = Math.floor(elapsed);
      if (currentSecond > lastLoggedSecRef.current) {
        lastLoggedSecRef.current = currentSecond;

        const netCorrect = getNetCorrectChars(
          wordsRef.current,
          typedHistoryRef.current,
          currentWordIndexRef.current,
          currentInputRef.current
        );
        const totalTyped = totalKeystrokesRef.current;
        const currentWpm = calculateWpm(netCorrect, elapsed);
        const currentRaw = calculateRawWpm(totalTyped, elapsed);
        const currentAcc = calculateAccuracy(netCorrect, totalTyped);

        setLiveWpm(currentWpm);
        setLiveAccuracy(currentAcc);

        setWpmHistory(prev => [
          ...prev,
          {
            second: currentSecond,
            wpm: currentWpm,
            rawWpm: currentRaw,
            errors: totalErrorsRef.current
          }
        ]);
      }
    }, 100);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [status, isPaused, mode, timeLimit, finishTest]);

  // 4. Handle incoming keypress
  const handleKeyDown = useCallback((e) => {
    if (status === 'finished') return;

    // 1. Allow all browser shortcuts (Ctrl+R refresh, Ctrl+W, Ctrl+T, Ctrl+F, Cmd+R, Cmd+W, etc.)
    // Only intercept Ctrl/Alt if it is Ctrl+Backspace (standard word deletion)
    if ((e.ctrlKey || e.metaKey) && e.key !== 'Backspace') {
      return;
    }

    // 2. Restart shortcut: Tab
    if (e.key === 'Tab') {
      e.preventDefault();
      if (onRestart) {
        onRestart();
      } else {
        initializeTest();
      }
      return;
    }

    // 3. Shift + Enter in Zen mode finishes test
    if (mode === 'zen' && e.key === 'Enter' && e.shiftKey) {
      e.preventDefault();
      finishTest();
      return;
    }

    // 4. Ignore non-character control and function keys (F1-F12, etc.)
    if ([
      'Shift', 'Control', 'Alt', 'Meta', 'CapsLock', 'Escape',
      'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
      'F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10', 'F11', 'F12'
    ].includes(e.key)) {
      return;
    }

    // Ignore idle backspace or idle leading space (do not start timer prematurely)
    if (status === 'idle') {
      if (e.key === 'Backspace' || (e.key === ' ' && currentInput.length === 0)) {
        e.preventDefault();
        return;
      }
      setStatus('running');
      statusRef.current = 'running';
      startTimeRef.current = Date.now();
      lastLoggedSecRef.current = 0;
    }

    // Trigger active typing state for companion animation
    setIsActivelyTyping(true);
    if (typingActivityTimerRef.current) clearTimeout(typingActivityTimerRef.current);
    typingActivityTimerRef.current = setTimeout(() => {
      setIsActivelyTyping(false);
    }, 450);

    const targetWord = words[currentWordIndex] || '';

    // Play synthetic creamy mechanical keyboard sound with key parameter
    playKeySound(soundPreset, soundVolume, e.key);

    // Track total keystroke
    totalKeystrokesRef.current += 1;

    // A) Handle Backspace
    if (e.key === 'Backspace') {
      e.preventDefault();
      if (e.ctrlKey || e.altKey || e.metaKey) {
        setCurrentInput('');
      } else if (currentInput.length > 0) {
        setCurrentInput(prev => prev.slice(0, -1));
      } else if (currentWordIndex > 0) {
        const prevIndex = currentWordIndex - 1;
        const prevTyped = typedHistory[prevIndex] || '';
        const prevTarget = words[prevIndex] || '';
        if (prevTyped !== prevTarget) {
          setCurrentWordIndex(prevIndex);
          setCurrentInput(prevTyped);
          setTypedHistory(prev => prev.slice(0, -1));
        }
      }
      return;
    }

    // B) Handle Space (Word submission)
    if (e.key === ' ') {
      e.preventDefault();
      if (currentInput.length === 0) return; // Disallow repeated spaces without typing

      if (currentInput !== targetWord) {
        totalErrorsRef.current += 1;
        setHasRecentError(true);
        if (activeMods.includes('sudden_death')) {
          failTest({
            failedKey: 'Space',
            expectedKey: targetWord.slice(currentInput.length) || targetWord,
            targetWord
          });
          return;
        }
      } else {
        setHasRecentError(false);
      }

      setTypedHistory(prev => [...prev, currentInput]);
      setCurrentInput('');

      const nextWordIdx = currentWordIndex + 1;

      // In Time or Zen mode, typing never runs out of words
      if (mode === 'time' || mode === 'zen') {
        if (nextWordIdx >= words.length - 15) {
          const moreWords = getRandomWords(40, { punctuation, numbers, language, mode: vocabularyMode });
          setWords(prev => [...prev, ...moreWords]);
        }
        setCurrentWordIndex(nextWordIdx);
        return;
      }

      // In Words mode, finish when total target word count reached
      if (nextWordIdx >= words.length) {
        finishTest();
        return;
      }

      setCurrentWordIndex(nextWordIdx);
      return;
    }

    // C) Handle standard printable character typing
    if (e.key.length === 1) {
      e.preventDefault();
      const nextInput = currentInput + e.key;
      const charIndex = currentInput.length;
      const expectedChar = targetWord[charIndex];
      const isCorrect = expectedChar === e.key;

      if (isCorrect) {
        setCurrentStreak(prev => prev + 1);
        setHasRecentError(false);
      } else {
        totalErrorsRef.current += 1;
        setKeyErrors(prev => ({ ...prev, [expectedChar || e.key]: (prev[expectedChar || e.key] || 0) + 1 }));
        setCurrentStreak(0);
        setHasRecentError(true);
        if (activeMods.includes('sudden_death')) {
          failTest({
            failedKey: e.key,
            expectedKey: expectedChar || '(end)',
            targetWord
          });
          return;
        }
      }

      setCurrentInput(nextInput);

      // In quote mode or words mode: check if last word completed exactly
      if ((mode === 'words' || mode === 'quote') && currentWordIndex === words.length - 1 && nextInput === targetWord) {
        finishTest();
      }
    }
  }, [
    status,
    words,
    currentWordIndex,
    currentInput,
    typedHistory,
    soundPreset,
    soundVolume,
    mode,
    punctuation,
    numbers,
    language,
    vocabularyMode,
    activeMods,
    onRestart,
    initializeTest,
    finishTest,
    failTest
  ]);

  return {
    words,
    quoteInfo,
    currentWordIndex,
    currentInput,
    typedHistory,
    status,
    isActivelyTyping,
    timeLeft,
    elapsedSeconds,
    liveWpm,
    liveAccuracy,
    wpmHistory,
    rawKeyStats,
    keyErrors,
    currentStreak,
    hasRecentError,
    vocabularyMode,
    challengeMods: activeMods,
    challengeMode: activeMods.length > 0 ? activeMods[0] : 'normal',
    initializeTest,
    handleKeyDown
  };
}
