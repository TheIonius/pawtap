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
  if (!wpmHistory || wpmHistory.length < 2) return 100;

  const validWpms = wpmHistory.map(p => p.wpm).filter(v => v > 0);
  if (validWpms.length < 2) return 100;

  const n = validWpms.length;
  const mean = validWpms.reduce((a, b) => a + b, 0) / n;
  if (mean <= 0) return 100;

  const variance = validWpms.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / (n - 1);
  const stdDev = Math.sqrt(variance);
  const cv = stdDev / mean;

  const consistency = Math.max(0, Math.min(100, Math.round(100 * (1 - cv))));
  return consistency;
}

/**
 * Returns a cozy, charming title based on final WPM
 */
export function getCozyPerformanceTitle(wpm) {
  if (wpm >= 120) return { title: "Cosmic Scribe", badge: "Celestial Speed" };
  if (wpm >= 95) return { title: "Matcha Lightning", badge: "Master Artisan" };
  if (wpm >= 75) return { title: "Bakery Rush Hour", badge: "Swift & Crisp" };
  if (wpm >= 50) return { title: "Warm Autumn Breeze", badge: "Fluid & Steady" };
  if (wpm >= 30) return { title: "Gentle Morning Sip", badge: "Peaceful Flow" };
  return { title: "Sleepy Tea Steeping", badge: "Cozy Beginning" };
}
