import React, { useState, useEffect } from 'react';
import {
  RotateCcw,
  Check,
  Share2,
  Sparkles,
  Award,
  Skull
} from 'lucide-react';
import { getCozyPerformanceTitle } from '../utils/metrics';

export function ResultsView({
  result,
  onRestart,
  onPracticeErrors
}) {
  const [copied, setCopied] = useState(false);
  const [hoveredPoint, setHoveredPoint] = useState(null);

  // Keyboard shortcut: Press Tab or Enter to restart immediately from results view
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Tab' || e.key === 'Enter') {
        e.preventDefault();
        onRestart();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onRestart]);

  if (!result) return null;

  const {
    wpm,
    accuracy,
    consistency,
    duration,
    wpmHistory = [],
    rawKeyStats = {},
    keyErrors = {},
    mode,
    timeLimit,
    wordLimit,
    quoteInfo,
    isNewRecord = false,
    failed = false,
    failedKey = '',
    expectedKey = '',
    targetWord = ''
  } = result;

  const tier = getCozyPerformanceTitle(wpm);

  // Copy aesthetic score card to clipboard (100% emoji-free)
  const handleCopySummary = () => {
    const modeLabel = mode === 'time'
      ? `${timeLimit}s`
      : mode === 'words'
      ? `${wordLimit} words`
      : quoteInfo?.source
      ? `quote ("${quoteInfo.source}")`
      : 'quote';

    const text = failed
      ? `pawtap
━━━━━━━━━━━━━━━━━━
Status: Run Terminated (Sudden Death)
WPM: ${wpm}
Accuracy: ${accuracy}%
Missed: '${failedKey}' on "${targetWord}"
Duration: ${duration}s
━━━━━━━━━━━━━━━━━━
press tab to retry ~`
      : `pawtap
━━━━━━━━━━━━━━━━━━
WPM: ${wpm}${isNewRecord ? ' (New PB!)' : ''}
Accuracy: ${accuracy}%
Consistency: ${consistency}%
Mode: ${modeLabel}
Rank: ${tier.title} (${tier.badge})
━━━━━━━━━━━━━━━━━━
take a sip & type gently ~`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // SVG Chart Dimensions & Coordinate Math
  const chartWidth = 760;
  const chartHeight = 170;
  const padding = { top: 20, right: 24, bottom: 26, left: 36 };

  const maxWpm = Math.max(40, ...wpmHistory.map(p => p.wpm || 0)) * 1.15;
  const maxSeconds = Math.max(1, wpmHistory.length > 0 ? wpmHistory[wpmHistory.length - 1].second : duration);

  const getX = (sec) => padding.left + (sec / maxSeconds) * (chartWidth - padding.left - padding.right);
  const getY = (val) => chartHeight - padding.bottom - (val / maxWpm) * (chartHeight - padding.top - padding.bottom);

  // Construct SVG Path strings with organic cubic Bezier spline interpolation
  const chartPoints = wpmHistory.map(p => ({
    x: getX(p.second),
    y: getY(p.wpm)
  }));

  const getSmoothPath = (pts) => {
    if (!pts || pts.length === 0) return '';
    if (pts.length === 1) return `M ${pts[0].x} ${pts[0].y}`;
    if (pts.length === 2) return `M ${pts[0].x} ${pts[0].y} L ${pts[1].x} ${pts[1].y}`;

    let path = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i === 0 ? 0 : i - 1];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = pts[i + 2 < pts.length ? i + 2 : i + 1];

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      path += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
    }
    return path;
  };

  const smoothLinePath = getSmoothPath(chartPoints);
  const bottomY = chartHeight - padding.bottom;
  const smoothAreaPath = chartPoints.length > 0
    ? `${smoothLinePath} L ${chartPoints[chartPoints.length - 1].x} ${bottomY} L ${chartPoints[0].x} ${bottomY} Z`
    : '';

  // Sort top missed keys
  const topErrors = Object.entries(keyErrors)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <div
      style={{
        maxWidth: '860px',
        margin: '0 auto',
        padding: '24px 20px',
        animation: 'fadeInUp 0.28s ease-out',
        display: 'flex',
        flexDirection: 'column',
        gap: '32px'
      }}
    >
      {/* 1. Header: Clean Title, Performance Rank & Quick Actions */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '14px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              backgroundColor: failed ? 'rgba(239, 68, 68, 0.12)' : 'var(--surface)',
              border: `1.5px solid ${failed ? '#EF4444' : 'var(--border)'}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: failed ? '#EF4444' : 'var(--accent)',
              boxShadow: failed ? '0 2px 8px rgba(239, 68, 68, 0.25)' : 'none'
            }}
          >
            {failed ? <Skull size={20} color="#EF4444" /> : <Award size={18} />}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 700, color: failed ? '#EF4444' : 'var(--text-main)', margin: 0 }}>
                {failed ? 'Failed • Sudden Death' : tier.title}
              </h2>
              {isNewRecord && !failed && (
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    backgroundColor: 'rgba(var(--accent-rgb, 184, 120, 65), 0.12)',
                    border: '1.5px solid var(--accent)',
                    color: 'var(--accent)',
                    fontSize: '10.5px',
                    fontWeight: 700,
                    letterSpacing: '0.4px',
                    textTransform: 'uppercase'
                  }}
                >
                  <Sparkles size={11} />
                  New Record!
                </span>
              )}
            </div>
            <span style={{ fontSize: '12.5px', color: failed ? 'var(--text-sub)' : 'var(--accent)', fontWeight: 600 }}>
              {failed ? (
                <span>
                  1 typo ended the run • missed <strong style={{ color: '#EF4444' }}>'{failedKey}'</strong> {expectedKey && expectedKey !== '(end)' ? `(expected '${expectedKey}')` : ''} on &quot;{targetWord}&quot;
                </span>
              ) : (
                tier.badge
              )}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={handleCopySummary}
            className="action-btn"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              borderRadius: '10px',
              border: '1px solid var(--border)',
              backgroundColor: 'var(--surface)',
              color: 'var(--text-main)',
              fontSize: '12.5px',
              fontWeight: 500,
              cursor: 'pointer'
            }}
          >
            {copied ? <Check size={14} color="var(--accent)" /> : <Share2 size={14} />}
            <span>{copied ? 'Copied Card!' : 'Share'}</span>
          </button>

          <button
            onClick={onRestart}
            className="action-btn"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 18px',
              borderRadius: '10px',
              border: 'none',
              backgroundColor: failed ? '#EF4444' : 'var(--accent)',
              color: '#FFFFFF',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: failed ? '0 2px 10px rgba(239, 68, 68, 0.28)' : '0 2px 8px rgba(0,0,0,0.1)'
            }}
          >
            <RotateCcw size={14} />
            <span>{failed ? 'Retry Run (Tab)' : 'Restart'}</span>
          </button>
        </div>
      </div>

      {/* 2. Hero Primary Metrics (Seamless Typographic Display — The 3 Main Metrics) */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'flex-start',
          justifyContent: 'flex-start',
          gap: '56px',
          width: '100%',
          flexWrap: 'wrap'
        }}
      >
        {/* Net WPM */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-sub)', textTransform: 'lowercase', letterSpacing: '0.4px' }}>
            wpm
          </span>
          <span
            style={{
              fontSize: '64px',
              fontWeight: 800,
              fontFamily: 'var(--font-mono, monospace)',
              color: 'var(--accent)',
              lineHeight: 1,
              letterSpacing: '-1.5px'
            }}
          >
            {wpm}
          </span>
          <span style={{ fontSize: '11.5px', color: 'var(--text-sub)', opacity: 0.8, marginTop: '2px' }}>
            net speed
          </span>
        </div>

        {/* Accuracy */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-sub)', textTransform: 'lowercase', letterSpacing: '0.4px' }}>
            acc
          </span>
          <span
            style={{
              fontSize: '64px',
              fontWeight: 800,
              fontFamily: 'var(--font-mono, monospace)',
              color: 'var(--text-main)',
              lineHeight: 1,
              letterSpacing: '-1.5px'
            }}
          >
            {accuracy}%
          </span>
          <span style={{ fontSize: '11.5px', color: 'var(--text-sub)', opacity: 0.8, marginTop: '2px' }}>
            accuracy
          </span>
        </div>

        {/* Consistency */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-sub)', textTransform: 'lowercase', letterSpacing: '0.4px' }}>
            consistency
          </span>
          <span
            style={{
              fontSize: '64px',
              fontWeight: 800,
              fontFamily: 'var(--font-mono, monospace)',
              color: 'var(--text-main)',
              lineHeight: 1,
              letterSpacing: '-1.5px'
            }}
          >
            {consistency}%
          </span>
          <span style={{ fontSize: '11.5px', color: 'var(--text-sub)', opacity: 0.8, marginTop: '2px' }}>
            rhythm stability
          </span>
        </div>
      </div>

      {/* 3. Speed Trajectory Chart (Seamless SVG resting directly on background) */}
      {wpmHistory.length > 1 && (
        <div style={{ width: '100%', position: 'relative' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '10px'
            }}
          >
            <span
              style={{
                fontSize: '11.5px',
                fontWeight: 600,
                color: 'var(--text-sub)',
                textTransform: 'uppercase',
                letterSpacing: '0.6px'
              }}
            >
              speed trajectory
            </span>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                fontSize: '11.5px',
                color: 'var(--text-sub)'
              }}
            >
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                <span
                  style={{
                    width: '7px',
                    height: '7px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--accent)'
                  }}
                />
                wpm
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                <span
                  style={{
                    width: '7px',
                    height: '7px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--text-error)'
                  }}
                />
                errors
              </span>
            </div>
          </div>

          <div style={{ position: 'relative', width: '100%', overflowX: 'auto' }}>
            <svg
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              style={{ width: '100%', height: 'auto', display: 'block', overflow: 'visible' }}
            >
              <defs>
                <linearGradient id="wpmGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.22" />
                  <stop offset="100%" stopColor="var(--accent)" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              {[0, 0.25, 0.5, 0.75, 1.0].map((ratio, idx) => {
                const y = chartHeight - padding.bottom - ratio * (chartHeight - padding.top - padding.bottom);
                const label = Math.round(ratio * maxWpm);
                return (
                  <g key={idx}>
                    <line
                      x1={padding.left}
                      y1={y}
                      x2={chartWidth - padding.right}
                      y2={y}
                      stroke="var(--border)"
                      strokeOpacity="0.75"
                      strokeDasharray="4 4"
                      strokeWidth="1"
                    />
                    <text
                      x={padding.left - 8}
                      y={y + 3.5}
                      fill="var(--text-sub)"
                      fontSize="9.5"
                      fontFamily="var(--font-mono, monospace)"
                      textAnchor="end"
                    >
                      {label}
                    </text>
                  </g>
                );
              })}

              {/* Shaded Area under WPM with Smooth Organic Curves */}
              {smoothAreaPath && (
                <path d={smoothAreaPath} fill="url(#wpmGradient)" />
              )}

              {/* WPM Main Organic Curve Line */}
              {smoothLinePath && (
                <path
                  d={smoothLinePath}
                  fill="none"
                  stroke="var(--accent)"
                  strokeWidth="2.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}

              {/* Individual Data Points */}
              {wpmHistory.map((pt, idx) => {
                const cx = getX(pt.second);
                const cy = getY(pt.wpm);
                return (
                  <circle
                    key={idx}
                    cx={cx}
                    cy={cy}
                    r={hoveredPoint === idx ? 5 : 2.6}
                    fill={hoveredPoint === idx ? 'var(--text-main)' : 'var(--accent)'}
                    stroke="var(--bg)"
                    strokeWidth="1.5"
                    style={{ cursor: 'pointer', transition: 'r 0.15s ease' }}
                    onMouseEnter={() => setHoveredPoint(idx)}
                    onMouseLeave={() => setHoveredPoint(null)}
                  />
                );
              })}

              {/* Error Markers on Timeline */}
              {wpmHistory.map((pt, idx) => {
                if (pt.errors <= 0) return null;
                const cx = getX(pt.second);
                const cy = chartHeight - padding.bottom + 12;
                return (
                  <circle
                    key={`err-${idx}`}
                    cx={cx}
                    cy={cy}
                    r="3.5"
                    fill="var(--text-error)"
                    title={`${pt.errors} error(s) at ${pt.second}s`}
                  />
                );
              })}
            </svg>
          </div>
        </div>
      )}

      {/* 4. Secondary Breakdown: Characters & Missed Keys (Cardless & Seamless) */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: '36px',
          flexWrap: 'wrap',
          paddingTop: '6px'
        }}
      >
        {/* Left Column: Characters Breakdown */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <span
            style={{
              fontSize: '11.5px',
              fontWeight: 600,
              color: 'var(--text-sub)',
              textTransform: 'uppercase',
              letterSpacing: '0.6px'
            }}
          >
            characters
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap', fontSize: '13px' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
              <span style={{ color: 'var(--text-sub)', fontSize: '12px' }}>correct:</span>
              <strong style={{ color: 'var(--text-main)', fontFamily: 'var(--font-mono, monospace)', fontSize: '15px' }}>
                {rawKeyStats.correct || 0}
              </strong>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
              <span style={{ color: 'var(--text-sub)', fontSize: '12px' }}>incorrect:</span>
              <strong style={{ color: 'var(--text-error)', fontFamily: 'var(--font-mono, monospace)', fontSize: '15px' }}>
                {rawKeyStats.incorrect || 0}
              </strong>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
              <span style={{ color: 'var(--text-sub)', fontSize: '12px' }}>extra:</span>
              <strong style={{ color: 'var(--text-sub)', fontFamily: 'var(--font-mono, monospace)', fontSize: '15px' }}>
                {rawKeyStats.extra || 0}
              </strong>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
              <span style={{ color: 'var(--text-sub)', fontSize: '12px' }}>missed:</span>
              <strong style={{ color: 'var(--text-sub)', fontFamily: 'var(--font-mono, monospace)', fontSize: '15px' }}>
                {rawKeyStats.missed || 0}
              </strong>
            </div>
          </div>
        </div>

        {/* Right Column: Missed Keys Analysis & Practice Drill */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', minWidth: '220px' }}>
          <span
            style={{
              fontSize: '11.5px',
              fontWeight: 600,
              color: 'var(--text-sub)',
              textTransform: 'uppercase',
              letterSpacing: '0.6px'
            }}
          >
            missed keys
          </span>
          {topErrors.length > 0 ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {topErrors.map(([k, count]) => (
                  <span
                    key={k}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '2px 7px',
                      borderRadius: '6px',
                      backgroundColor: 'rgba(200, 90, 84, 0.08)',
                      border: '1px solid rgba(200, 90, 84, 0.22)',
                      fontSize: '12px',
                      color: 'var(--text-error)',
                      fontFamily: 'var(--font-mono, monospace)'
                    }}
                  >
                    <span>'{k}'</span>
                    <span style={{ opacity: 0.7, fontSize: '10.5px' }}>×{count}</span>
                  </span>
                ))}
              </div>

              {onPracticeErrors && (
                <button
                  onClick={onPracticeErrors}
                  className="pill-btn"
                  style={{
                    padding: '4px 10px',
                    fontSize: '11.5px',
                    fontWeight: 600,
                    color: 'var(--text-main)',
                    gap: '5px'
                  }}
                >
                  <RotateCcw size={11} />
                  <span>Practice Missed</span>
                </button>
              )}
            </div>
          ) : (
            <span style={{ fontSize: '12.5px', color: 'var(--text-sub)' }}>
              Flawless precision — zero missed characters recorded.
            </span>
          )}
        </div>
      </div>

      {/* 5. Seamless Bottom Hint */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          fontSize: '12px',
          color: 'var(--text-sub)',
          opacity: 0.75,
          paddingTop: '8px'
        }}
      >
        <span>press</span>
        <kbd className="kbd">Tab</kbd>
        <span>or</span>
        <kbd className="kbd">Enter</kbd>
        <span>to restart</span>
      </div>
    </div>
  );
}
