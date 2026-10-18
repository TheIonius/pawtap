import { describe, it, expect } from 'vitest';
import {
  calculateWpm,
  calculateRawWpm,
  calculateAccuracy,
  calculateConsistency,
  getCozyPerformanceTitle
} from '../src/utils/metrics';

describe('Typing Metrics Engine', () => {
  describe('calculateWpm', () => {
    it('calculates standard WPM based on 5 characters per word', () => {
      // 300 net characters in 60 seconds = 60 words / 1 minute = 60 WPM
      expect(calculateWpm(300, 60)).toBe(60);
      // 150 net characters in 30 seconds = 30 words / 0.5 minute = 60 WPM
      expect(calculateWpm(150, 30)).toBe(60);
      // 500 net characters in 60 seconds = 100 WPM
      expect(calculateWpm(500, 60)).toBe(100);
    });

    it('safely handles zero and negative elapsed time', () => {
      expect(calculateWpm(100, 0)).toBe(0);
      expect(calculateWpm(100, -5)).toBe(0);
    });

    it('handles zero characters typed', () => {
      expect(calculateWpm(0, 30)).toBe(0);
    });

    it('rounds to the nearest whole integer', () => {
      // 123 chars in 30 seconds = 24.6 words / 0.5 min = 49.2 -> 49 WPM
      expect(calculateWpm(123, 30)).toBe(49);
    });
  });

  describe('calculateRawWpm', () => {
    it('calculates raw WPM regardless of errors', () => {
      expect(calculateRawWpm(350, 60)).toBe(70);
    });

    it('returns 0 for non-positive elapsed seconds', () => {
      expect(calculateRawWpm(200, 0)).toBe(0);
    });
  });

  describe('calculateAccuracy', () => {
    it('calculates percentage accuracy correctly', () => {
      expect(calculateAccuracy(100, 100)).toBe(100);
      expect(calculateAccuracy(95, 100)).toBe(95);
      expect(calculateAccuracy(190, 200)).toBe(95);
    });

    it('defaults to 100% when no characters have been typed yet', () => {
      expect(calculateAccuracy(0, 0)).toBe(100);
    });

    it('clamps values between 0 and 100', () => {
      expect(calculateAccuracy(0, 50)).toBe(0);
      expect(calculateAccuracy(60, 50)).toBe(100);
    });
  });

  describe('calculateConsistency', () => {
    it('returns 100% for empty, null, or single-entry history', () => {
      expect(calculateConsistency([])).toBe(100);
      expect(calculateConsistency(null)).toBe(100);
      expect(calculateConsistency([{ wpm: 80 }])).toBe(100);
    });

    it('returns 100% for perfectly steady typing pace', () => {
      const history = [
        { wpm: 75, second: 1 },
        { wpm: 75, second: 2 },
        { wpm: 75, second: 3 },
        { wpm: 75, second: 4 }
      ];
      expect(calculateConsistency(history)).toBe(100);
    });

    it('calculates lower consistency percentage for fluctuating typing speeds', () => {
      const steadyHistory = [
        { wpm: 79 },
        { wpm: 81 },
        { wpm: 80 },
        { wpm: 80 }
      ];
      const volatileHistory = [
        { wpm: 30 },
        { wpm: 120 },
        { wpm: 40 },
        { wpm: 110 }
      ];

      const steadyConsistency = calculateConsistency(steadyHistory);
      const volatileConsistency = calculateConsistency(volatileHistory);

      expect(steadyConsistency).toBeGreaterThan(95);
      expect(volatileConsistency).toBeLessThan(75);
    });
  });

  describe('getCozyPerformanceTitle', () => {
    it('returns Cosmic Scribe for WPM >= 120', () => {
      const result = getCozyPerformanceTitle(125);
      expect(result.rank).toBe('S+');
      expect(result.title).toBe('Cosmic Scribe');
    });

    it('returns Matcha Lightning for 95 <= WPM < 120', () => {
      const result = getCozyPerformanceTitle(100);
      expect(result.rank).toBe('S');
      expect(result.title).toBe('Matcha Lightning');
    });

    it('returns Bakery Rush Hour for 75 <= WPM < 95', () => {
      const result = getCozyPerformanceTitle(80);
      expect(result.rank).toBe('A');
      expect(result.title).toBe('Bakery Rush Hour');
    });

    it('returns Warm Autumn Breeze for 50 <= WPM < 75', () => {
      const result = getCozyPerformanceTitle(60);
      expect(result.rank).toBe('B');
      expect(result.title).toBe('Warm Autumn Breeze');
    });

    it('returns Gentle Morning Sip for 30 <= WPM < 50', () => {
      const result = getCozyPerformanceTitle(35);
      expect(result.rank).toBe('C');
      expect(result.title).toBe('Gentle Morning Sip');
    });

    it('returns Sleepy Tea Steeping for WPM < 30', () => {
      const result = getCozyPerformanceTitle(22);
      expect(result.rank).toBe('D');
      expect(result.title).toBe('Sleepy Tea Steeping');
    });
  });
});
