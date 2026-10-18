import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  RotateCcw,
  Check,
  Share2,
  Sparkles,
  Trophy,
  Skull,
  Zap,
  Flame,
  Wind,
  Coffee,
  Moon,
  Target,
  CheckCircle2
} from 'lucide-react';
import { getCozyPerformanceTitle } from '../utils/metrics';
import { generateScorecardBlob } from '../utils/scorecardGenerator';
import { Avatar } from './Avatar';

export function ResultsView({
  result,
  onRestart,
  onPracticeErrors,
  onPracticeMissedWords,
  profile
}) {
  const [copied, setCopied] = useState(false);
  const [showRawWpm, setShowRawWpm] = useState(true);
  const [hoveredData, setHoveredData] = useState(null); // { pt, x, y, sec }
  const chartSvgRef = useRef(null);

  // Top errors list
  const topErrors = useMemo(() => {
    const errors = result?.keyErrors || {};
    return Object.entries(errors)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8);
  }, [result?.keyErrors]);

  const hasErrors = topErrors.length > 0;

  // Format mode label
  const modeLabel = useMemo(() => {
    if (!result) return '';
    const { mode, timeLimit, wordLimit, quoteInfo } = result;
    if (mode === 'time') return `${timeLimit}s`;
    if (mode === 'words') return `${wordLimit} words`;
    if (mode === 'quote') return quoteInfo?.source ? `quote ("${quoteInfo.source}")` : 'quote';
    if (mode === 'custom') return `custom (${result.wordsCompleted || ''} words)`;
    return mode || 'custom';
  }, [result]);

  // Copy aesthetic minimalist scorecard image to clipboard (PNG) using existing Share button
  const handleCopySummary = useCallback(async () => {
    if (!result) return;
    const {
      wpm,
      rawWpm,
      accuracy,
      consistency,
      duration,
      isNewRecord = false,
      failed = false,
      failedKey = '',
      targetWord = ''
    } = result;

    const tier = getCozyPerformanceTitle(wpm);

    const typistName = profile?.name?.trim() ? `Typist: ${profile.name.trim()}\n` : '';
    const fallbackText = failed
      ? `pawtap • sudden death
━━━━━━━━━━━━━━━━━━━━━━━━━
${typistName}Status: Terminated by Typo
WPM: ${wpm} (raw: ${rawWpm || wpm})
Accuracy: ${accuracy}%
Missed: '${failedKey}' on "${targetWord}"
Duration: ${duration}s
━━━━━━━━━━━━━━━━━━━━━━━━━
press tab to restart ~`
      : `pawtap • test summary
━━━━━━━━━━━━━━━━━━━━━━━━━
${typistName}Net Speed: ${wpm} WPM${isNewRecord ? ' ★ NEW PB ★' : ''}
Raw Speed: ${rawWpm || wpm} WPM
Accuracy: ${accuracy}%
Consistency: ${consistency}%
Duration: ${duration}s
Mode: ${modeLabel}
Rank: [${tier.rank}] ${tier.title} (${tier.stamp})
━━━━━━━━━━━━━━━━━━━━━━━━━
take a sip & type gently ~`;

    try {
      const blob = await generateScorecardBlob(result, modeLabel, profile);
      if (blob && typeof window !== 'undefined' && navigator.clipboard && window.ClipboardItem) {
        try {
          const item = new ClipboardItem({ 'image/png': blob });
          await navigator.clipboard.write([item]);
          setCopied('image');
          setTimeout(() => setCopied(false), 2200);
          return;
        } catch (clipErr) {
          console.warn('Direct image clipboard copy failed, falling back:', clipErr);
        }
      }

      // Fallback: download PNG file + copy text to clipboard
      if (blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `pawtap-${wpm}wpm.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        setCopied('downloaded');
        setTimeout(() => setCopied(false), 2200);
      }

      try {
        await navigator.clipboard.writeText(fallbackText);
      } catch {}
    } catch (err) {
      console.error('Error generating scorecard image:', err);
      try {
        await navigator.clipboard.writeText(fallbackText);
        setCopied('text');
        setTimeout(() => setCopied(false), 2000);
      } catch {}
    }
  }, [result, modeLabel, profile]);

  const missedWords = useMemo(() => result?.missedWords || [], [result?.missedWords]);

  // Keyboard shortcuts: Tab/Enter restart, P for practice missed, S for share
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      if (e.key === 'Tab' || e.key === 'Enter') {
        e.preventDefault();
        onRestart();
      } else if (e.key === 'p' || e.key === 'P') {
        if (missedWords.length > 0 && onPracticeMissedWords) {
          e.preventDefault();
          onPracticeMissedWords();
        } else if (hasErrors && onPracticeErrors) {
          e.preventDefault();
          onPracticeErrors();
        }
      } else if (e.key === 's' || e.key === 'S') {
        e.preventDefault();
        handleCopySummary();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onRestart, onPracticeErrors, onPracticeMissedWords, hasErrors, missedWords, handleCopySummary]);

  if (!result) return null;

  const {
    wpm = 0,
    rawWpm = wpm,
    accuracy = 100,
    consistency = 100,
    duration = 1,
    wpmHistory = [],
    rawKeyStats = {},
    isNewRecord = false,
    previousPb = 0,
    failed = false,
    failedKey = '',
    expectedKey = '',
    targetWord = ''
  } = result;

  const tier = getCozyPerformanceTitle(wpm);

  // Minimalist Tier Icon
  const renderTierIcon = () => {
    if (failed) return <Skull size={18} color="#EF4444" />;
    if (isNewRecord) return <Trophy size={18} color="var(--accent)" />;
    switch (tier.icon) {
      case 'Sparkles': return <Sparkles size={18} color="var(--accent)" />;
      case 'Zap': return <Zap size={18} color="var(--accent)" />;
      case 'Flame': return <Flame size={18} color="var(--accent)" />;
      case 'Wind': return <Wind size={18} color="var(--accent)" />;
      case 'Coffee': return <Coffee size={18} color="var(--accent)" />;
      default: return <Moon size={18} color="var(--accent)" />;
    }
  };

  // Character calculations
  const correctCount = rawKeyStats.correct || 0;
  const incorrectCount = rawKeyStats.incorrect || 0;
  const extraCount = rawKeyStats.extra || 0;
  const missedCount = rawKeyStats.missed || 0;
  const totalCharacters = correctCount + incorrectCount + extraCount;
  const cpm = Math.max(0, Math.round((totalCharacters / Math.max(1, duration)) * 60));

  const correctPct = totalCharacters > 0 ? (correctCount / totalCharacters) * 100 : 100;
  const incorrectPct = totalCharacters > 0 ? (incorrectCount / totalCharacters) * 100 : 0;
  const extraPct = totalCharacters > 0 ? (extraCount / totalCharacters) * 100 : 0;

  // Chart Dimensions & Math
  const chartWidth = 840;
  const chartHeight = 160;
  const padding = { top: 20, right: 24, bottom: 26, left: 38 };

  const maxValInHistory = Math.max(
    wpm,
    rawWpm,
    ...wpmHistory.map(p => Math.max(p.wpm || 0, p.rawWpm || 0))
  );
  const maxChartWpm = Math.max(40, Math.ceil((maxValInHistory * 1.15) / 10) * 10);
  const maxSeconds = Math.max(
    1,
    wpmHistory.length > 0 ? wpmHistory[wpmHistory.length - 1].second : duration
  );

  const getX = (sec) => padding.left + (sec / maxSeconds) * (chartWidth - padding.left - padding.right);
  const getY = (val) => chartHeight - padding.bottom - (val / maxChartWpm) * (chartHeight - padding.top - padding.bottom);

  // Smooth Cubic Bezier Interpolation
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

  const netPoints = wpmHistory.map(p => ({ x: getX(p.second), y: getY(p.wpm) }));
  const rawPoints = wpmHistory.map(p => ({ x: getX(p.second), y: getY(p.rawWpm || p.wpm) }));

  const netPath = getSmoothPath(netPoints);
  const rawPath = getSmoothPath(rawPoints);

  const bottomY = chartHeight - padding.bottom;
  const netAreaPath = netPoints.length > 0
    ? `${netPath} L ${netPoints[netPoints.length - 1].x} ${bottomY} L ${netPoints[0].x} ${bottomY} Z`
    : '';

  // Interactive Chart Scrubbing
  const handleChartMouseMove = (e) => {
    if (!chartSvgRef.current || wpmHistory.length === 0) return;
    const svgRect = chartSvgRef.current.getBoundingClientRect();
    const clientX = e.clientX;
    const relativeX = Math.max(0, Math.min(1, (clientX - svgRect.left) / svgRect.width));
    const targetSecond = relativeX * maxSeconds;

    let closestPt = wpmHistory[0];
    let minDiff = Infinity;
    for (const pt of wpmHistory) {
      const diff = Math.abs(pt.second - targetSecond);
      if (diff < minDiff) {
        minDiff = diff;
        closestPt = pt;
      }
    }

    if (closestPt) {
      const x = getX(closestPt.second);
      const y = getY(closestPt.wpm);
      setHoveredData({
        pt: closestPt,
        x,
        y,
        sec: closestPt.second
      });
    }
  };

  const handleChartMouseLeave = () => {
    setHoveredData(null);
  };

  // Accuracy evaluation label
  const getAccuracyBadge = (acc) => {
    if (acc === 100) return 'flawless';
    if (acc >= 98) return 'masterful';
    if (acc >= 94) return 'crisp';
    if (acc >= 88) return 'steady';
    return 'inconsistent';
  };

  return (
    <div className="seamless-results-container">
      {/* =========================================================================
          1. HEADER: SEAMLESS MINIMALIST STATUS & ACTIONS (Cardless)
          ========================================================================= */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '14px',
          paddingBottom: '4px'
        }}
      >
        {/* Left: Minimalist Status & Rank Pill */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '5px 10px',
              borderRadius: '8px',
              backgroundColor: failed ? 'rgba(239, 68, 68, 0.12)' : 'rgba(var(--accent-rgb, 184, 120, 65), 0.1)',
              border: `1px solid ${failed ? 'rgba(239, 68, 68, 0.3)' : 'rgba(var(--accent-rgb, 184, 120, 65), 0.25)'}`,
              color: failed ? '#EF4444' : 'var(--accent)'
            }}
          >
            {renderTierIcon()}
            <span style={{ fontSize: '12px', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
              {failed ? 'TERMINATED' : `RANK ${tier.rank}`}
            </span>
          </div>

          {profile && (
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 10px 4px 6px',
                borderRadius: '8px',
                backgroundColor: 'var(--surface)',
                border: '1px solid var(--border)',
                color: 'var(--text-main)',
                fontSize: '12px',
                fontWeight: 600
              }}
              title="Typist Identity"
            >
              <Avatar profile={profile} size={18} />
              <span
                style={{
                  maxWidth: '120px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}
              >
                {profile.name?.trim() || 'Typist'}
              </span>
            </div>
          )}

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <h2
                style={{
                  fontSize: '18px',
                  fontWeight: 700,
                  color: failed ? '#EF4444' : 'var(--text-main)',
                  margin: 0,
                  letterSpacing: '-0.2px'
                }}
              >
                {failed ? 'Sudden Death Run Over' : tier.title}
              </h2>

              {isNewRecord && !failed && (
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    backgroundColor: 'rgba(var(--accent-rgb, 184, 120, 65), 0.14)',
                    border: '1px solid var(--accent)',
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

              <span
                style={{
                  fontSize: '11.5px',
                  color: 'var(--text-sub)',
                  fontFamily: 'var(--font-mono)',
                  opacity: 0.8
                }}
              >
                {modeLabel}
              </span>
            </div>

            <p
              style={{
                fontSize: '12.5px',
                color: failed ? '#C04E49' : 'var(--text-sub)',
                margin: '2px 0 0 0',
                fontWeight: 500
              }}
            >
              {failed ? (
                <span>
                  Missed <strong style={{ color: '#EF4444' }}>&apos;{failedKey}&apos;</strong>{expectedKey && expectedKey !== '(end)' ? ` (expected '${expectedKey}')` : ''} on &quot;{targetWord}&quot;
                </span>
              ) : (
                <span>{tier.description}</span>
              )}
            </p>
          </div>
        </div>

        {/* Right: Minimalist Tactile Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={handleCopySummary}
            className="action-btn"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '7px 13px',
              borderRadius: '9px',
              border: '1px solid var(--border)',
              backgroundColor: 'var(--surface)',
              color: 'var(--text-main)',
              fontSize: '12.5px',
              fontWeight: 500,
              cursor: 'pointer'
            }}
            title="Copy scorecard image to clipboard (S)"
          >
            {copied ? (
              <>
                <Check size={14} color="var(--accent)" />
                <span>{copied === 'image' ? 'Image Copied!' : copied === 'downloaded' ? 'Image Saved!' : 'Copied!'}</span>
              </>
            ) : (
              <>
                <Share2 size={14} />
                <span>Share</span>
              </>
            )}
          </button>

          {missedWords.length > 0 && onPracticeMissedWords ? (
            <button
              onClick={() => onPracticeMissedWords()}
              className="action-btn"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '7px 14px',
                borderRadius: '9px',
                border: '1px solid rgba(var(--accent-rgb, 184, 120, 65), 0.35)',
                backgroundColor: 'rgba(var(--accent-rgb, 184, 120, 65), 0.12)',
                color: 'var(--accent)',
                fontSize: '12.5px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
              title="Practice words with typos from this test (P)"
            >
              <RotateCcw size={14} />
              <span>Practice Missed Words ({missedWords.length})</span>
            </button>
          ) : hasErrors && onPracticeErrors ? (
            <button
              onClick={() => onPracticeErrors()}
              className="action-btn"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '7px 13px',
                borderRadius: '9px',
                border: '1px solid var(--border)',
                backgroundColor: 'rgba(var(--accent-rgb, 184, 120, 65), 0.08)',
                color: 'var(--accent)',
                fontSize: '12.5px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
              title="Practice missed keys (P)"
            >
              <Target size={14} />
              <span>Practice Missed</span>
            </button>
          ) : null}

          <button
            onClick={onRestart}
            className="action-btn"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '7px 18px',
              borderRadius: '9px',
              border: 'none',
              backgroundColor: failed ? '#EF4444' : 'var(--accent)',
              color: '#FFFFFF',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: failed
                ? '0 2px 10px rgba(239, 68, 68, 0.28)'
                : '0 2px 8px rgba(var(--accent-rgb, 184, 120, 65), 0.3)'
            }}
            title="Restart run (Tab or Enter)"
          >
            <RotateCcw size={14} />
            <span>{failed ? 'Retry (Tab)' : 'Restart (Tab)'}</span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          2. HERO PRIMARY METRICS (Seamless Horizontal Typographic Matrix)
          ========================================================================= */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: '24px 36px',
          padding: '4px 0'
        }}
      >
        {/* Metric 1: Net WPM */}
        <div className="seamless-metric-block">
          <span
            style={{
              fontSize: '11px',
              fontWeight: 700,
              color: 'var(--text-sub)',
              textTransform: 'uppercase',
              letterSpacing: '0.8px'
            }}
          >
            wpm
          </span>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', lineHeight: 1 }}>
            <span
              style={{
                fontSize: '60px',
                fontWeight: 800,
                fontFamily: 'var(--font-mono)',
                color: failed ? '#EF4444' : 'var(--accent)',
                letterSpacing: '-1.5px'
              }}
            >
              {wpm}
            </span>
            <span
              style={{
                fontSize: '12px',
                fontFamily: 'var(--font-mono)',
                color: 'var(--text-sub)',
                opacity: 0.85
              }}
            >
              raw {rawWpm}
            </span>
          </div>
          <span style={{ fontSize: '12px', color: 'var(--text-sub)', opacity: 0.8 }}>
            {isNewRecord
              ? `★ New PB (+${Math.max(1, wpm - previousPb)})`
              : previousPb > 0
              ? `personal best: ${previousPb}`
              : 'net speed'}
          </span>
        </div>

        {/* Metric 2: Accuracy */}
        <div className="seamless-metric-block">
          <span
            style={{
              fontSize: '11px',
              fontWeight: 700,
              color: 'var(--text-sub)',
              textTransform: 'uppercase',
              letterSpacing: '0.8px'
            }}
          >
            acc
          </span>
          <div style={{ display: 'flex', alignItems: 'baseline', lineHeight: 1 }}>
            <span
              style={{
                fontSize: '60px',
                fontWeight: 800,
                fontFamily: 'var(--font-mono)',
                color: 'var(--text-main)',
                letterSpacing: '-1.5px'
              }}
            >
              {accuracy}
            </span>
            <span style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-sub)', marginLeft: '2px' }}>
              %
            </span>
          </div>
          <span style={{ fontSize: '12px', color: 'var(--text-sub)', opacity: 0.8 }}>
            {getAccuracyBadge(accuracy)} precision
          </span>
        </div>

        {/* Metric 3: Consistency */}
        <div className="seamless-metric-block">
          <span
            style={{
              fontSize: '11px',
              fontWeight: 700,
              color: 'var(--text-sub)',
              textTransform: 'uppercase',
              letterSpacing: '0.8px'
            }}
          >
            consistency
          </span>
          <div style={{ display: 'flex', alignItems: 'baseline', lineHeight: 1 }}>
            <span
              style={{
                fontSize: '60px',
                fontWeight: 800,
                fontFamily: 'var(--font-mono)',
                color: 'var(--text-main)',
                letterSpacing: '-1.5px'
              }}
            >
              {consistency}
            </span>
            <span style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-sub)', marginLeft: '2px' }}>
              %
            </span>
          </div>
          <span style={{ fontSize: '12px', color: 'var(--text-sub)', opacity: 0.8 }}>
            rhythm stability
          </span>
        </div>

        {/* Metric 4: Duration & CPM */}
        <div className="seamless-metric-block">
          <span
            style={{
              fontSize: '11px',
              fontWeight: 700,
              color: 'var(--text-sub)',
              textTransform: 'uppercase',
              letterSpacing: '0.8px'
            }}
          >
            time
          </span>
          <div style={{ display: 'flex', alignItems: 'baseline', lineHeight: 1 }}>
            <span
              style={{
                fontSize: '60px',
                fontWeight: 800,
                fontFamily: 'var(--font-mono)',
                color: 'var(--text-main)',
                letterSpacing: '-1.5px'
              }}
            >
              {duration}
            </span>
            <span style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-sub)', marginLeft: '3px' }}>
              s
            </span>
          </div>
          <span style={{ fontSize: '12px', color: 'var(--text-sub)', opacity: 0.8 }}>
            {cpm} cpm
          </span>
        </div>
      </div>

      {/* =========================================================================
          3. SPEED TRAJECTORY CHART (Seamless Canvas — Zero Box Borders)
          ========================================================================= */}
      {wpmHistory.length > 1 && (
        <div style={{ width: '100%', position: 'relative', marginTop: '-4px' }}>
          {/* Chart Header Bar */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '8px',
              flexWrap: 'wrap',
              gap: '10px'
            }}
          >
            <span
              style={{
                fontSize: '11px',
                fontWeight: 700,
                color: 'var(--text-sub)',
                textTransform: 'uppercase',
                letterSpacing: '0.8px'
              }}
            >
              speed trajectory
            </span>

            {/* Legend & Toggle Controls */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '11.5px' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', color: 'var(--text-main)', fontWeight: 600 }}>
                <span style={{ width: '10px', height: '2.5px', backgroundColor: 'var(--accent)', borderRadius: '2px' }} />
                wpm
              </span>

              <button
                onClick={() => setShowRawWpm(prev => !prev)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  color: showRawWpm ? 'var(--text-sub)' : 'var(--border)',
                  cursor: 'pointer',
                  fontWeight: 500,
                  opacity: showRawWpm ? 1 : 0.6
                }}
                title="Toggle raw speed trajectory"
              >
                <span
                  style={{
                    width: '10px',
                    height: '1.5px',
                    borderTop: `1.5px dashed ${showRawWpm ? 'var(--text-sub)' : 'var(--border)'}`
                  }}
                />
                raw {showRawWpm ? 'on' : 'off'}
              </button>

              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: 'var(--text-error)' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--text-error)' }} />
                errors
              </span>
            </div>
          </div>

          {/* SVG Canvas Area */}
          <div
            style={{
              position: 'relative',
              width: '100%',
              userSelect: 'none'
            }}
            onMouseMove={handleChartMouseMove}
            onMouseLeave={handleChartMouseLeave}
          >
            <svg
              ref={chartSvgRef}
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              style={{
                width: '100%',
                height: 'auto',
                display: 'block',
                overflow: 'visible'
              }}
            >
              <defs>
                <linearGradient id="seamlessWpmGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.2" />
                  <stop offset="80%" stopColor="var(--accent)" stopOpacity="0.02" />
                  <stop offset="100%" stopColor="var(--accent)" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Horizontal Reference Grids */}
              {[0, 0.25, 0.5, 0.75, 1.0].map((ratio, idx) => {
                const y = chartHeight - padding.bottom - ratio * (chartHeight - padding.top - padding.bottom);
                const label = Math.round(ratio * maxChartWpm);
                return (
                  <g key={idx}>
                    <line
                      x1={padding.left}
                      y1={y}
                      x2={chartWidth - padding.right}
                      y2={y}
                      stroke="var(--border)"
                      strokeOpacity="0.5"
                      strokeDasharray="4 4"
                      strokeWidth="1"
                    />
                    <text
                      x={padding.left - 8}
                      y={y + 3.5}
                      fill="var(--text-sub)"
                      fontSize="9.5"
                      fontFamily="var(--font-mono)"
                      textAnchor="end"
                      opacity="0.85"
                    >
                      {label}
                    </text>
                  </g>
                );
              })}

              {/* Shaded Area Under Net WPM Curve */}
              {netAreaPath && (
                <path d={netAreaPath} fill="url(#seamlessWpmGradient)" />
              )}

              {/* Optional Raw WPM Dashed Curve */}
              {showRawWpm && rawPath && (
                <path
                  d={rawPath}
                  fill="none"
                  stroke="var(--text-sub)"
                  strokeWidth="1.6"
                  strokeDasharray="4 4"
                  strokeOpacity="0.65"
                />
              )}

              {/* Net WPM Primary Smooth Curve */}
              {netPath && (
                <path
                  d={netPath}
                  fill="none"
                  stroke="var(--accent)"
                  strokeWidth="2.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}

              {/* Error Markers along Timeline */}
              {wpmHistory.map((pt, idx) => {
                if (pt.errors <= 0) return null;
                const cx = getX(pt.second);
                const cy = chartHeight - padding.bottom + 12;
                return (
                  <g key={`err-${idx}`}>
                    <circle cx={cx} cy={cy} r="3" fill="var(--text-error)" />
                    <line
                      x1={cx}
                      y1={chartHeight - padding.bottom}
                      x2={cx}
                      y2={cy - 3}
                      stroke="var(--text-error)"
                      strokeWidth="1"
                      strokeOpacity="0.4"
                    />
                  </g>
                );
              })}

              {/* Active Scrubber Line & Cursor Points */}
              {hoveredData && (
                <g>
                  <line
                    x1={hoveredData.x}
                    y1={padding.top}
                    x2={hoveredData.x}
                    y2={chartHeight - padding.bottom}
                    stroke="var(--accent)"
                    strokeWidth="1.2"
                    strokeDasharray="3 3"
                    strokeOpacity="0.8"
                  />
                  <circle
                    cx={hoveredData.x}
                    cy={hoveredData.y}
                    r="4.5"
                    fill="var(--accent)"
                    stroke="var(--bg)"
                    strokeWidth="2"
                  />
                  {showRawWpm && (
                    <circle
                      cx={hoveredData.x}
                      cy={getY(hoveredData.pt.rawWpm || hoveredData.pt.wpm)}
                      r="3.5"
                      fill="var(--text-sub)"
                      stroke="var(--bg)"
                      strokeWidth="1.5"
                    />
                  )}
                </g>
              )}
            </svg>

            {/* Seamless Minimalist Floating Tooltip HUD */}
            {hoveredData && (
              <div
                className="seamless-hud-tooltip"
                style={{
                  position: 'absolute',
                  left: `${(hoveredData.x / chartWidth) * 100}%`,
                  top: `${Math.max(8, (hoveredData.y / chartHeight) * 100 - 32)}%`,
                  transform: 'translate(-50%, -100%)',
                  padding: '6px 10px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  whiteSpace: 'nowrap'
                }}
              >
                <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-sub)', fontFamily: 'var(--font-mono)' }}>
                  {hoveredData.sec}s
                </span>
                <span style={{ fontSize: '12.5px', fontWeight: 800, color: 'var(--accent)', fontFamily: 'var(--font-mono)' }}>
                  {hoveredData.pt.wpm} <span style={{ fontSize: '10px', fontWeight: 600 }}>wpm</span>
                </span>
                {showRawWpm && (
                  <span style={{ fontSize: '11.5px', fontWeight: 600, color: 'var(--text-sub)', fontFamily: 'var(--font-mono)' }}>
                    raw {hoveredData.pt.rawWpm || hoveredData.pt.wpm}
                  </span>
                )}
                {hoveredData.pt.errors > 0 && (
                  <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-error)' }}>
                    • {hoveredData.pt.errors} err
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          4. SECONDARY BREAKDOWN: CHARACTERS & MISSED KEYS (Seamless Split)
          ========================================================================= */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '32px',
          paddingTop: '2px'
        }}
      >
        {/* Left: Character Breakdown & Accuracy Segmented Bar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 700,
                color: 'var(--text-sub)',
                textTransform: 'uppercase',
                letterSpacing: '0.8px'
              }}
            >
              characters
            </span>
            <span style={{ fontSize: '12px', color: 'var(--text-sub)', fontFamily: 'var(--font-mono)' }}>
              {totalCharacters} typed
            </span>
          </div>

          {/* Ultra-sleek segmented line */}
          <div className="accuracy-segment-bar" title={`Correct: ${correctCount}, Errors: ${incorrectCount}, Extra: ${extraCount}`}>
            <div style={{ width: `${correctPct}%`, backgroundColor: 'var(--accent)', transition: 'width 0.3s ease' }} />
            <div style={{ width: `${incorrectPct}%`, backgroundColor: 'var(--text-error)', transition: 'width 0.3s ease' }} />
            <div style={{ width: `${extraPct}%`, backgroundColor: 'rgba(216, 158, 98, 0.9)', transition: 'width 0.3s ease' }} />
          </div>

          {/* Minimalist character counters */}
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '20px', flexWrap: 'wrap', fontSize: '13px', paddingTop: '2px' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
              <span style={{ color: 'var(--text-sub)', fontSize: '12px' }}>correct:</span>
              <strong style={{ color: 'var(--text-main)', fontFamily: 'var(--font-mono)', fontSize: '15px' }}>
                {correctCount}
              </strong>
            </div>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
              <span style={{ color: 'var(--text-sub)', fontSize: '12px' }}>typos:</span>
              <strong style={{ color: incorrectCount > 0 ? 'var(--text-error)' : 'var(--text-main)', fontFamily: 'var(--font-mono)', fontSize: '15px' }}>
                {incorrectCount}
              </strong>
            </div>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
              <span style={{ color: 'var(--text-sub)', fontSize: '12px' }}>extra:</span>
              <strong style={{ color: 'var(--text-sub)', fontFamily: 'var(--font-mono)', fontSize: '15px' }}>
                {extraCount}
              </strong>
            </div>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
              <span style={{ color: 'var(--text-sub)', fontSize: '12px' }}>missed:</span>
              <strong style={{ color: 'var(--text-sub)', fontFamily: 'var(--font-mono)', fontSize: '15px' }}>
                {missedCount}
              </strong>
            </div>
          </div>
        </div>

        {/* Right: Missed Keys Minimalist Analysis */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 700,
                color: 'var(--text-sub)',
                textTransform: 'uppercase',
                letterSpacing: '0.8px'
              }}
            >
              missed keys
            </span>

            {hasErrors && onPracticeErrors && (
              <button
                onClick={onPracticeErrors}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '11.5px',
                  fontWeight: 600,
                  color: 'var(--accent)',
                  cursor: 'pointer'
                }}
              >
                <span>Practice drill</span>
                <kbd className="kbd" style={{ fontSize: '9.5px', padding: '1px 5px' }}>P</kbd>
              </button>
            )}
          </div>

          {hasErrors ? (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
              {topErrors.map(([keyChar, count]) => {
                const displayChar = keyChar === ' ' ? '␣ space' : keyChar;
                return (
                  <button
                    key={keyChar}
                    onClick={() => onPracticeErrors && onPracticeErrors([keyChar])}
                    className="minimal-keycap"
                    style={{
                      backgroundColor: count >= 3 ? 'rgba(239, 68, 68, 0.16)' : 'rgba(239, 68, 68, 0.08)',
                      border: '1px solid rgba(239, 68, 68, 0.28)',
                      color: 'var(--text-error)',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '4px 8px',
                      borderRadius: '6px',
                      transition: 'all 0.15s ease',
                      fontFamily: 'inherit',
                      outline: 'none'
                    }}
                    title={`Click to practice 15-word drill targeting '${displayChar}'`}
                  >
                    <strong>&apos;{displayChar}&apos;</strong>
                    <span style={{ opacity: 0.75, fontSize: '10.5px' }}>×{count}</span>
                    <span style={{ fontSize: '9px', opacity: 0.6, marginLeft: '2px' }}>drill ➔</span>
                  </button>
                );
              })}
            </div>
          ) : missedWords.length === 0 ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px', color: 'var(--text-sub)' }}>
              <CheckCircle2 size={16} color="var(--accent)" />
              <span>Flawless precision — zero missed characters recorded.</span>
            </div>
          ) : null}

          {/* Missed Words Tag Pills Drill */}
          {missedWords.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: hasErrors ? '4px' : '0' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    color: 'var(--text-sub)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.8px'
                  }}
                >
                  missed words ({missedWords.length})
                </span>
                {onPracticeMissedWords && (
                  <button
                    onClick={() => onPracticeMissedWords()}
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: 0,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '11.5px',
                      fontWeight: 600,
                      color: 'var(--accent)',
                      cursor: 'pointer'
                    }}
                  >
                    <span>Practice all</span>
                    <kbd className="kbd" style={{ fontSize: '9.5px', padding: '1px 5px' }}>P</kbd>
                  </button>
                )}
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center' }}>
                {missedWords.map((word, idx) => (
                  <button
                    key={`${word}-${idx}`}
                    onClick={() => onPracticeMissedWords && onPracticeMissedWords([word])}
                    className="minimal-keycap"
                    style={{
                      backgroundColor: 'rgba(239, 68, 68, 0.08)',
                      border: '1px solid rgba(239, 68, 68, 0.22)',
                      color: 'var(--text-error)',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      padding: '3px 8px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontFamily: 'var(--font-mono)',
                      transition: 'all 0.15s ease',
                      outline: 'none'
                    }}
                    title={`Click to practice 15-word drill targeting "${word}"`}
                  >
                    <span>{word}</span>
                    <span style={{ fontSize: '9px', opacity: 0.6 }}>drill ➔</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* =========================================================================
          5. SEAMLESS BOTTOM SHORTCUTS HINT
          ========================================================================= */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '10px',
          fontSize: '12px',
          color: 'var(--text-sub)',
          opacity: 0.75,
          paddingTop: '8px',
          userSelect: 'none'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <span>press</span>
          <kbd className="kbd">Tab</kbd>
          <span>or</span>
          <kbd className="kbd">Enter</kbd>
          <span>to restart</span>
        </div>

        {hasErrors && (
          <>
            <span>•</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <kbd className="kbd">P</kbd>
              <span>practice drill</span>
            </div>
          </>
        )}

        <span>•</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <kbd className="kbd">S</kbd>
          <span>share</span>
        </div>
      </div>
    </div>
  );
}
