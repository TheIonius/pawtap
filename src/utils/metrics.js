/**
 * Typing Statistics & Metrics Calculation Engine
 */

export function calculateWpm(correctChars, elapsedSeconds) {
  if (elapsedSeconds <= 0) return 0;
  const minutes = elapsedSeconds / 60;
  const words = correctChars / 5;
  return Math.max(0, Math.round(words / minutes));
}

export function calculateRawWpm(totalCharsTyped, elapsedSeconds) {
  if (elapsedSeconds <= 0) return 0;
  const minutes = elapsedSeconds / 60;
  const words = totalCharsTyped / 5;
  return Math.max(0, Math.round(words / minutes));
}

export function calculateAccuracy(correctChars, totalTypedChars) {
  if (totalTypedChars <= 0) return 100;
  return Math.max(0, Math.min(100, Math.round((correctChars / totalTypedChars) * 100)));
}

/**
 * Consistency percentage based on 100 * (1 - Coefficient of Variation)
 * sampled across 1-second WPM intervals.
 */
export function calculateConsistency(wpmHistory = []) {
  if (!wpmHistory || !Array.isArray(wpmHistory) || wpmHistory.length < 2) return 100;

  const validWpms = wpmHistory
    .map(p => (p && typeof p.wpm === 'number' ? p.wpm : 0))
    .filter(v => v > 0 && !isNaN(v) && isFinite(v));
  if (validWpms.length < 2) return 100;

  const n = validWpms.length;
  const mean = validWpms.reduce((a, b) => a + b, 0) / n;
  if (!isFinite(mean) || mean <= 0) return 100;

  const variance = validWpms.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / (n - 1);
  const stdDev = Math.sqrt(Math.max(0, variance));
  const cv = stdDev / mean;

  const consistency = Math.max(0, Math.min(100, Math.round(100 * (1 - cv))));
  return isNaN(consistency) || !isFinite(consistency) ? 100 : consistency;
}

/**
 * Returns performance title, rank, and stamp metadata based on final WPM.
 */
export function getCozyPerformanceTitle(wpm) {
  if (wpm >= 120) {
    return {
      title: "Cosmic Scribe",
      badge: "Celestial Speed",
      rank: "S+",
      stamp: "COSMIC",
      icon: "Sparkles",
      description: "Transcendent fingers dancing at astronomical velocity."
    };
  }
  if (wpm >= 95) {
    return {
      title: "Matcha Lightning",
      badge: "Master Artisan",
      rank: "S",
      stamp: "ARTISAN",
      icon: "Zap",
      description: "Razor-sharp rhythm with effortless, crisp mastery."
    };
  }
  if (wpm >= 75) {
    return {
      title: "Bakery Rush Hour",
      badge: "Swift & Crisp",
      rank: "A",
      stamp: "BAKERY",
      icon: "Flame",
      description: "Warm, brisk momentum like fresh morning pastries."
    };
  }
  if (wpm >= 50) {
    return {
      title: "Warm Autumn Breeze",
      badge: "Fluid & Steady",
      rank: "B",
      stamp: "BREEZE",
      icon: "Wind",
      description: "Comfortable, soothing cadence with balanced grace."
    };
  }
  if (wpm >= 30) {
    return {
      title: "Gentle Morning Sip",
      badge: "Peaceful Flow",
      rank: "C",
      stamp: "GENTLE",
      icon: "Coffee",
      description: "Relaxed sips of tea with calm, mindful strokes."
    };
  }
  return {
    title: "Sleepy Tea Steeping",
    badge: "Cozy Beginning",
    rank: "D",
    stamp: "SLEEPY",
    icon: "Moon",
    description: "Taking your time as the cozy tea gently warms up."
  };
}
