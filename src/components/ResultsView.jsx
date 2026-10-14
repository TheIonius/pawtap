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
  Clock,
  Activity,
  CheckCircle2
} from 'lucide-react';
import { getCozyPerformanceTitle } from '../utils/metrics';

export function ResultsView({
  result,
  onRestart,
  onPracticeErrors
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

  // Format mode label for display and clipboard
  const modeLabel = useMemo(() => {
    if (!result) return '';
    const { mode, timeLimit, wordLimit, quoteInfo } = result;
    if (mode === 'time') return `${timeLimit}s`;
    if (mode === 'words') return `${wordLimit} words`;
    if (mode === 'quote') return quoteInfo?.source ? `quote ("${quoteInfo.source}")` : 'quote';
    return mode || 'custom';
  }, [result]);

  // Copy aesthetic collectible arcade card to clipboard
  const handleCopySummary = useCallback(() => {
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

    const text = failed
      ? `🐾 pawtap • sudden death
━━━━━━━━━━━━━━━━━━━━━━━━━
Status: Terminated by Typo
WPM: ${wpm} (raw: ${rawWpm || wpm})
Accuracy: ${accuracy}%
Missed: '${failedKey}' on "${targetWord}"
Duration: ${duration}s
━━━━━━━━━━━━━━━━━━━━━━━━━
press tab to restart ~`
      : `🐾 pawtap • collectible scorecard
━━━━━━━━━━━━━━━━━━━━━━━━━
Net Speed: ${wpm} WPM${isNewRecord ? ' ★ NEW PB ★' : ''}
Raw Speed: ${rawWpm || wpm} WPM
Accuracy: ${accuracy}%
Consistency: ${consistency}%
Duration: ${duration}s
Mode: ${modeLabel}
Arcade Rank: [${tier.rank}] ${tier.title} (${tier.stamp})
━━━━━━━━━━━━━━━━━━━━━━━━━
take a sip & type gently ~`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [result, modeLabel]);

  // Keyboard shortcuts: Tab/Enter restart, P for practice missed, S for share
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ignore if user is inside an input or editable field
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      if (e.key === 'Tab' || e.key === 'Enter') {
        e.preventDefault();
        onRestart();
      } else if ((e.key === 'p' || e.key === 'P') && hasErrors && onPracticeErrors) {
        e.preventDefault();
        onPracticeErrors();
      } else if (e.key === 's' || e.key === 'S') {
        e.preventDefault();
        handleCopySummary();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onRestart, onPracticeErrors, hasErrors, handleCopySummary]);

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

  // Choose Tier Motifs & Stamps
  const renderTierIcon = () => {
    if (failed) return <Skull size={28} color="#EF4444" />;
    if (isNewRecord) return <Trophy size={28} color="var(--accent)" />;
    switch (tier.icon) {
      case 'Sparkles': return <Sparkles size={28} color="var(--accent)" />;
      case 'Zap': return <Zap size={28} color="var(--accent)" />;
      case 'Flame': return <Flame size={28} color="var(--accent)" />;
      case 'Wind': return <Wind size={28} color="var(--accent)" />;
      case 'Coffee': return <Coffee size={28} color="var(--accent)" />;
      default: return <Moon size={28} color="var(--accent)" />;
    }
  };

  // Character counts
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
  const chartWidth = 820;
  const chartHeight = 180;
  const padding = { top: 22, right: 28, bottom: 30, left: 42 };

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

  // Bezier Spline Path Generator
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

    // Find closest data point
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
    if (acc === 100) return { label: 'Flawless', color: 'var(--accent)' };
    if (acc >= 98) return { label: 'Masterful', color: 'var(--accent)' };
    if (acc >= 94) return { label: 'Very Crisp', color: 'var(--text-main)' };
    if (acc >= 88) return { label: 'Solid', color: 'var(--text-sub)' };
    return { label: 'Needs Polish', color: 'var(--text-error)' };
  };

  const accuracyBadge = getAccuracyBadge(accuracy);

  return (
    <div
      style={{
        maxWidth: '920px',
        margin: '0 auto',
        padding: '16px 12px 32px 12px',
        animation: 'fadeInUp 0.26s cubic-bezier(0.16, 1, 0.3, 1)',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px'
      }}
    >
      {/* =========================================================================
          ROW 1: COLLECTIBLE ARCADE STAMP & ACTION BAR
          ========================================================================= */}
      <div
        className="bento-card"
        style={{
          padding: '20px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
          backgroundColor: failed
            ? 'rgba(239, 68, 68, 0.04)'
            : isNewRecord
            ? 'rgba(var(--accent-rgb, 184, 120, 65), 0.05)'
            : 'var(--surface)'
        }}
      >
        {/* Left: Collectible Arcade Stamp Seal */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '18px', flexWrap: 'wrap' }}>
          <div
            className="stamp-seal"
            style={{
              position: 'relative',
              width: '68px',
              height: '68px',
              borderRadius: '50%',
              backgroundColor: failed
                ? 'rgba(239, 68, 68, 0.12)'
                : isNewRecord
                ? 'rgba(var(--accent-rgb, 184, 120, 65), 0.16)'
                : 'var(--surface-hover)',
              border: `2.5px solid ${failed ? '#EF4444' : 'var(--accent)'}`,
              boxShadow: failed
                ? '0 4px 16px rgba(239, 68, 68, 0.25)'
                : '0 4px 16px var(--shadow)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
            title={`${tier.title} • Rank ${tier.rank}`}
          >
            {/* Concentric dashed seal ring */}
            <div
              style={{
                position: 'absolute',
                inset: '3px',
                borderRadius: '50%',
                border: `1.5px dashed ${failed ? '#EF4444' : 'var(--accent)'}`,
                opacity: 0.65
              }}
            />
            {renderTierIcon()}
            <span
              style={{
                fontSize: '9px',
                fontWeight: 800,
                letterSpacing: '0.6px',
                fontFamily: 'var(--font-mono)',
                color: failed ? '#EF4444' : 'var(--accent)',
                marginTop: '1px'
              }}
            >
              {failed ? 'FAIL' : `RANK ${tier.rank}`}
            </span>
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <h2
                style={{
                  fontSize: '22px',
                  fontWeight: 800,
                  color: failed ? '#EF4444' : 'var(--text-main)',
                  margin: 0,
                  letterSpacing: '-0.3px'
                }}
              >
                {failed ? 'Sudden Death Terminated' : tier.title}
              </h2>

              {isNewRecord && !failed && (
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '3px 10px',
                    borderRadius: '999px',
                    backgroundColor: 'rgba(var(--accent-rgb, 184, 120, 65), 0.16)',
                    border: '1.5px solid var(--accent)',
                    color: 'var(--accent)',
                    fontSize: '11px',
                    fontWeight: 800,
                    letterSpacing: '0.5px',
                    textTransform: 'uppercase',
                    boxShadow: '0 2px 8px rgba(var(--accent-rgb, 184, 120, 65), 0.25)'
                  }}
                >
                  <Sparkles size={12} />
                  New Personal Best!
                </span>
              )}

              {/* Mode indicator pill */}
              <span
                style={{
                  padding: '3px 9px',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(var(--accent-rgb, 184, 120, 65), 0.08)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-sub)',
                  fontSize: '11.5px',
                  fontFamily: 'var(--font-mono)'
                }}
              >
                {modeLabel}
              </span>
            </div>

            <p
              style={{
                fontSize: '13px',
                color: failed ? '#C04E49' : 'var(--text-sub)',
                margin: '4px 0 0 0',
                fontWeight: 500
              }}
            >
              {failed ? (
                <span>
                  Ended by typo on <strong style={{ color: '#EF4444' }}>&quot;{targetWord}&quot;</strong> (typed <strong style={{ color: '#EF4444' }}>&apos;{failedKey}&apos;</strong>{expectedKey && expectedKey !== '(end)' ? `, expected '${expectedKey}'` : ''})
                </span>
              ) : (
                <span>{tier.description}</span>
              )}
            </p>
          </div>
        </div>

        {/* Right: Tactile Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={handleCopySummary}
            className="action-btn"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '9px 15px',
              borderRadius: '12px',
              border: '1.5px solid var(--border)',
              backgroundColor: 'var(--surface)',
              color: 'var(--text-main)',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
            title="Copy score card to clipboard (S)"
          >
            {copied ? <Check size={15} color="var(--accent)" /> : <Share2 size={15} />}
            <span>{copied ? 'Card Copied!' : 'Share'}</span>
          </button>

          {hasErrors && onPracticeErrors && (
            <button
              onClick={onPracticeErrors}
              className="action-btn"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '9px 15px',
                borderRadius: '12px',
                border: '1.5px solid var(--accent)',
                backgroundColor: 'rgba(var(--accent-rgb, 184, 120, 65), 0.12)',
                color: 'var(--accent)',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
              title="Practice words containing missed keys (P)"
            >
              <Target size={15} />
              <span>Practice Missed</span>
            </button>
          )}

          <button
            onClick={onRestart}
            className="action-btn"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '7px',
              padding: '9px 20px',
              borderRadius: '12px',
              border: 'none',
              backgroundColor: failed ? '#EF4444' : 'var(--accent)',
              color: '#FFFFFF',
              fontSize: '13.5px',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: failed
                ? '0 3px 12px rgba(239, 68, 68, 0.32)'
                : '0 3px 12px rgba(var(--accent-rgb, 184, 120, 65), 0.35)'
            }}
            title="Restart run immediately (Tab or Enter)"
          >
            <RotateCcw size={15} />
            <span>{failed ? 'Retry (Tab)' : 'Restart (Tab)'}</span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          ROW 2: BENTO HERO METRICS MATRIX (4 Grid Cards)
          ========================================================================= */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '16px'
        }}
      >
        {/* Card 1: Primary Net WPM (Hero) */}
        <div
          className="bento-card"
          style={{
            padding: '20px 22px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            borderTop: `4px solid ${failed ? '#EF4444' : 'var(--accent)'}`
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span
              style={{
                fontSize: '12px',
                fontWeight: 700,
                color: 'var(--text-sub)',
                textTransform: 'uppercase',
                letterSpacing: '0.8px'
              }}
            >
              Net Speed
            </span>
            <span
              style={{
                padding: '2px 7px',
                borderRadius: '6px',
                backgroundColor: 'rgba(var(--accent-rgb, 184, 120, 65), 0.1)',
                fontSize: '11px',
                fontWeight: 700,
                color: 'var(--accent)',
                fontFamily: 'var(--font-mono)'
              }}
            >
              raw {rawWpm}
            </span>
          </div>

          <div style={{ margin: '10px 0 6px 0' }}>
            <span
              style={{
                fontSize: '56px',
                fontWeight: 800,
                fontFamily: 'var(--font-mono)',
                color: failed ? '#EF4444' : 'var(--accent)',
                lineHeight: 1,
                letterSpacing: '-1.5px'
              }}
            >
              {wpm}
            </span>
            <span style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-sub)', marginLeft: '6px' }}>
              wpm
            </span>
          </div>

          <span style={{ fontSize: '12px', color: 'var(--text-sub)', opacity: 0.85 }}>
            {isNewRecord
              ? `🔥 Beats PB by +${Math.max(1, wpm - previousPb)}!`
              : previousPb > 0
              ? `Personal best: ${previousPb} wpm`
              : 'Clean, accurate pace'}
          </span>
        </div>

        {/* Card 2: Accuracy */}
        <div
          className="bento-card"
          style={{
            padding: '20px 22px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span
              style={{
                fontSize: '12px',
                fontWeight: 700,
                color: 'var(--text-sub)',
                textTransform: 'uppercase',
                letterSpacing: '0.8px'
              }}
            >
              Accuracy
            </span>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 700,
                color: accuracyBadge.color
              }}
            >
              {accuracyBadge.label}
            </span>
          </div>

          <div style={{ margin: '10px 0 6px 0' }}>
            <span
              style={{
                fontSize: '56px',
                fontWeight: 800,
                fontFamily: 'var(--font-mono)',
                color: 'var(--text-main)',
                lineHeight: 1,
                letterSpacing: '-1.5px'
              }}
            >
              {accuracy}
            </span>
            <span style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-sub)', marginLeft: '3px' }}>
              %
            </span>
          </div>

          <span style={{ fontSize: '12px', color: 'var(--text-sub)', opacity: 0.85 }}>
            {incorrectCount === 0 ? 'Zero uncorrected errors' : `${incorrectCount} typos recorded`}
          </span>
        </div>

        {/* Card 3: Consistency */}
        <div
          className="bento-card"
          style={{
            padding: '20px 22px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span
              style={{
                fontSize: '12px',
                fontWeight: 700,
                color: 'var(--text-sub)',
                textTransform: 'uppercase',
                letterSpacing: '0.8px'
              }}
            >
              Consistency
            </span>
            <Activity size={14} color="var(--accent)" />
          </div>

          <div style={{ margin: '10px 0 6px 0' }}>
            <span
              style={{
                fontSize: '56px',
                fontWeight: 800,
                fontFamily: 'var(--font-mono)',
                color: 'var(--text-main)',
                lineHeight: 1,
                letterSpacing: '-1.5px'
              }}
            >
              {consistency}
            </span>
            <span style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-sub)', marginLeft: '3px' }}>
              %
            </span>
          </div>

          <span style={{ fontSize: '12px', color: 'var(--text-sub)', opacity: 0.85 }}>
            Rhythm cadence stability
          </span>
        </div>

        {/* Card 4: Duration & CPM */}
        <div
          className="bento-card"
          style={{
            padding: '20px 22px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span
              style={{
                fontSize: '12px',
                fontWeight: 700,
                color: 'var(--text-sub)',
                textTransform: 'uppercase',
                letterSpacing: '0.8px'
              }}
            >
              Duration
            </span>
            <Clock size={14} color="var(--text-sub)" />
          </div>

          <div style={{ margin: '10px 0 6px 0' }}>
            <span
              style={{
                fontSize: '56px',
                fontWeight: 800,
                fontFamily: 'var(--font-mono)',
                color: 'var(--text-main)',
                lineHeight: 1,
                letterSpacing: '-1.5px'
              }}
            >
              {duration}
            </span>
            <span style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-sub)', marginLeft: '4px' }}>
              sec
            </span>
          </div>

          <span style={{ fontSize: '12px', color: 'var(--text-sub)', opacity: 0.85 }}>
            {cpm} characters / min
          </span>
        </div>
      </div>

      {/* =========================================================================
          ROW 3: INTERACTIVE SPEED CHART BENTO BOX
          ========================================================================= */}
      {wpmHistory.length > 1 && (
        <div className="bento-card" style={{ padding: '22px 24px' }}>
          {/* Chart Header Bar */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '14px',
              flexWrap: 'wrap',
              gap: '12px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--accent)'
                }}
              />
              <span
                style={{
                  fontSize: '13px',
                  fontWeight: 700,
                  color: 'var(--text-main)',
                  letterSpacing: '0.3px'
                }}
              >
                Speed Trajectory
              </span>
              <span style={{ fontSize: '12px', color: 'var(--text-sub)' }}>
                • scrub along graph for exact second telemetry
              </span>
            </div>

            {/* Chart Legend & Toggles */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '12px',
                  color: 'var(--text-main)',
                  fontWeight: 600
                }}
              >
                <span
                  style={{
                    width: '12px',
                    height: '3px',
                    backgroundColor: 'var(--accent)',
                    borderRadius: '2px'
                  }}
                />
                Net WPM
              </span>

              <button
                onClick={() => setShowRawWpm(prev => !prev)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '12px',
                  color: showRawWpm ? 'var(--text-sub)' : 'var(--border)',
                  cursor: 'pointer',
                  fontWeight: 500,
                  opacity: showRawWpm ? 1 : 0.6
                }}
                title="Toggle raw speed curve"
              >
                <span
                  style={{
                    width: '12px',
                    height: '2px',
                    borderTop: `2px dashed ${showRawWpm ? 'var(--text-sub)' : 'var(--border)'}`
                  }}
                />
                Raw WPM {showRawWpm ? '(on)' : '(off)'}
              </button>

              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  fontSize: '12px',
                  color: 'var(--text-error)',
                  fontWeight: 500
                }}
              >
                <span
                  style={{
                    width: '7px',
                    height: '7px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--text-error)'
                  }}
                />
                Errors
              </span>
            </div>
          </div>

          {/* SVG Canvas Area with Relative Tooltip Positioning */}
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
                <linearGradient id="bentoWpmGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.25" />
                  <stop offset="70%" stopColor="var(--accent)" stopOpacity="0.04" />
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
                      strokeOpacity="0.6"
                      strokeDasharray="4 4"
                      strokeWidth="1"
                    />
                    <text
                      x={padding.left - 10}
                      y={y + 3.5}
                      fill="var(--text-sub)"
                      fontSize="10"
                      fontFamily="var(--font-mono)"
                      textAnchor="end"
                    >
                      {label}
                    </text>
                  </g>
                );
              })}

              {/* Shaded Area Under Net Curve */}
              {netAreaPath && (
                <path d={netAreaPath} fill="url(#bentoWpmGradient)" />
              )}

              {/* Optional Raw WPM Dashed Curve */}
              {showRawWpm && rawPath && (
                <path
                  d={rawPath}
                  fill="none"
                  stroke="var(--text-sub)"
                  strokeWidth="1.8"
                  strokeDasharray="4 4"
                  strokeOpacity="0.75"
                />
              )}

              {/* Net WPM Primary Organic Curve */}
              {netPath && (
                <path
                  d={netPath}
                  fill="none"
                  stroke="var(--accent)"
                  strokeWidth="3.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}

              {/* Error Markers along Timeline */}
              {wpmHistory.map((pt, idx) => {
                if (pt.errors <= 0) return null;
                const cx = getX(pt.second);
                const cy = chartHeight - padding.bottom + 14;
                return (
                  <g key={`err-${idx}`}>
                    <circle
                      cx={cx}
                      cy={cy}
                      r="3.5"
                      fill="var(--text-error)"
                    />
                    <line
                      x1={cx}
                      y1={chartHeight - padding.bottom}
                      x2={cx}
                      y2={cy - 4}
                      stroke="var(--text-error)"
                      strokeWidth="1"
                      strokeOpacity="0.4"
                    />
                  </g>
                );
              })}

              {/* Active Hover Scrubber Line & Circles */}
              {hoveredData && (
                <g>
                  {/* Vertical Hairline */}
                  <line
                    x1={hoveredData.x}
                    y1={padding.top}
                    x2={hoveredData.x}
                    y2={chartHeight - padding.bottom}
                    stroke="var(--accent)"
                    strokeWidth="1.5"
                    strokeDasharray="2 3"
                    strokeOpacity="0.8"
                  />

                  {/* Net WPM Dot */}
                  <circle
                    cx={hoveredData.x}
                    cy={hoveredData.y}
                    r="5.5"
                    fill="var(--accent)"
                    stroke="var(--bg)"
                    strokeWidth="2.5"
                  />

                  {/* Raw WPM Dot */}
                  {showRawWpm && (
                    <circle
                      cx={hoveredData.x}
                      cy={getY(hoveredData.pt.rawWpm || hoveredData.pt.wpm)}
                      r="4"
                      fill="var(--text-sub)"
                      stroke="var(--bg)"
                      strokeWidth="2"
                    />
                  )}
                </g>
              )}
            </svg>

            {/* Floating Arcade HUD Tooltip */}
            {hoveredData && (
              <div
                className="arcade-hud-tooltip"
                style={{
                  position: 'absolute',
                  left: `${(hoveredData.x / chartWidth) * 100}%`,
                  top: `${Math.max(10, (hoveredData.y / chartHeight) * 100 - 35)}%`,
                  transform: 'translate(-50%, -100%)',
                  padding: '8px 12px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '3px',
                  whiteSpace: 'nowrap'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '14px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-sub)', fontFamily: 'var(--font-mono)' }}>
                    ⏱ {hoveredData.sec}s
                  </span>
                  {hoveredData.pt.errors > 0 && (
                    <span style={{ fontSize: '10.5px', fontWeight: 700, color: 'var(--text-error)' }}>
                      ⚠ {hoveredData.pt.errors} err
                    </span>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--accent)', fontFamily: 'var(--font-mono)' }}>
                    {hoveredData.pt.wpm} <span style={{ fontSize: '10px', fontWeight: 600 }}>wpm</span>
                  </span>
                  {showRawWpm && (
                    <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-sub)', fontFamily: 'var(--font-mono)' }}>
                      raw {hoveredData.pt.rawWpm || hoveredData.pt.wpm}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          ROW 4: DETAILED BENTO BREAKDOWN (Characters & Missed Key Heatmap)
          ========================================================================= */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: '16px'
        }}
      >
        {/* Left Bento: Visual Character Telemetry & Segmented Progress Bar */}
        <div className="bento-card" style={{ padding: '22px 24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span
              style={{
                fontSize: '12px',
                fontWeight: 700,
                color: 'var(--text-sub)',
                textTransform: 'uppercase',
                letterSpacing: '0.8px'
              }}
            >
              Character Accuracy Ratio
            </span>
            <span style={{ fontSize: '12px', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--text-main)' }}>
              {totalCharacters} typed
            </span>
          </div>

          {/* Continuous Segmented Bar */}
          <div className="accuracy-segment-bar" title={`Correct: ${correctCount}, Errors: ${incorrectCount}, Extra: ${extraCount}`}>
            <div
              style={{
                width: `${correctPct}%`,
                backgroundColor: 'var(--accent)',
                transition: 'width 0.3s ease'
              }}
            />
            <div
              style={{
                width: `${incorrectPct}%`,
                backgroundColor: 'var(--text-error)',
                transition: 'width 0.3s ease'
              }}
            />
            <div
              style={{
                width: `${extraPct}%`,
                backgroundColor: 'rgba(216, 158, 98, 0.9)',
                transition: 'width 0.3s ease'
              }}
            />
          </div>

          {/* Detailed Telemetry Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '10px',
              paddingTop: '6px'
            }}
          >
            {/* Correct */}
            <div
              style={{
                padding: '10px',
                borderRadius: '12px',
                backgroundColor: 'var(--surface-hover)',
                textAlign: 'center'
              }}
            >
              <span style={{ fontSize: '11px', color: 'var(--text-sub)', display: 'block' }}>correct</span>
              <strong style={{ fontSize: '18px', color: 'var(--text-main)', fontFamily: 'var(--font-mono)' }}>
                {correctCount}
              </strong>
            </div>

            {/* Incorrect */}
            <div
              style={{
                padding: '10px',
                borderRadius: '12px',
                backgroundColor: incorrectCount > 0 ? 'rgba(200, 90, 84, 0.12)' : 'var(--surface-hover)',
                border: incorrectCount > 0 ? '1px solid rgba(200, 90, 84, 0.3)' : '1px solid transparent',
                textAlign: 'center'
              }}
            >
              <span style={{ fontSize: '11px', color: incorrectCount > 0 ? 'var(--text-error)' : 'var(--text-sub)', display: 'block' }}>
                typos
              </span>
              <strong style={{ fontSize: '18px', color: incorrectCount > 0 ? 'var(--text-error)' : 'var(--text-main)', fontFamily: 'var(--font-mono)' }}>
                {incorrectCount}
              </strong>
            </div>

            {/* Extra */}
            <div
              style={{
                padding: '10px',
                borderRadius: '12px',
                backgroundColor: 'var(--surface-hover)',
                textAlign: 'center'
              }}
            >
              <span style={{ fontSize: '11px', color: 'var(--text-sub)', display: 'block' }}>extra</span>
              <strong style={{ fontSize: '18px', color: 'var(--text-sub)', fontFamily: 'var(--font-mono)' }}>
                {extraCount}
              </strong>
            </div>

            {/* Missed */}
            <div
              style={{
                padding: '10px',
                borderRadius: '12px',
                backgroundColor: 'var(--surface-hover)',
                textAlign: 'center'
              }}
            >
              <span style={{ fontSize: '11px', color: 'var(--text-sub)', display: 'block' }}>missed</span>
              <strong style={{ fontSize: '18px', color: 'var(--text-sub)', fontFamily: 'var(--font-mono)' }}>
                {missedCount}
              </strong>
            </div>
          </div>
        </div>

        {/* Right Bento: Missed Keys Heatmap & Drill Arcade */}
        <div className="bento-card" style={{ padding: '22px 24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span
              style={{
                fontSize: '12px',
                fontWeight: 700,
                color: 'var(--text-sub)',
                textTransform: 'uppercase',
                letterSpacing: '0.8px'
              }}
            >
              Missed Keys Heatmap
            </span>

            {hasErrors && onPracticeErrors && (
              <button
                onClick={onPracticeErrors}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '11.5px',
                  fontWeight: 700,
                  color: 'var(--accent)',
                  cursor: 'pointer'
                }}
              >
                <span>Drill Missed</span>
                <kbd className="kbd" style={{ fontSize: '10px' }}>P</kbd>
              </button>
            )}
          </div>

          {hasErrors ? (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center' }}>
              {topErrors.map(([keyChar, count]) => {
                // Determine heat intensity
                const heatColor = count >= 3
                  ? 'rgba(239, 68, 68, 0.22)'
                  : count === 2
                  ? 'rgba(239, 68, 68, 0.14)'
                  : 'rgba(239, 68, 68, 0.08)';

                const borderColor = count >= 3
                  ? '#EF4444'
                  : 'rgba(239, 68, 68, 0.4)';

                const displayChar = keyChar === ' ' ? '␣ space' : keyChar;

                return (
                  <div
                    key={keyChar}
                    className="arcade-keycap"
                    style={{
                      backgroundColor: heatColor,
                      border: `1.5px solid ${borderColor}`,
                      color: 'var(--text-error)'
                    }}
                    title={`Missed '${displayChar}' ${count} time(s)`}
                  >
                    <span style={{ fontSize: '15px', fontWeight: 800 }}>{displayChar}</span>
                    <span style={{ fontSize: '10px', fontWeight: 700, opacity: 0.85 }}>×{count}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '14px',
                borderRadius: '14px',
                backgroundColor: 'rgba(var(--accent-rgb, 184, 120, 65), 0.08)',
                border: '1px solid var(--border)'
              }}
            >
              <CheckCircle2 size={24} color="var(--accent)" />
              <div>
                <strong style={{ display: 'block', fontSize: '14px', color: 'var(--text-main)' }}>
                  Flawless Finger Precision ✨
                </strong>
                <span style={{ fontSize: '12px', color: 'var(--text-sub)' }}>
                  Zero missed keys recorded across the entire session.
                </span>
              </div>
            </div>
          )}

          <div style={{ marginTop: 'auto', paddingTop: '4px' }}>
            <span style={{ fontSize: '11.5px', color: 'var(--text-sub)', opacity: 0.8 }}>
              {hasErrors
                ? 'Keys with deeper coral tint represent highest error frequency.'
                : 'Pure tactile balance achieved with consistent stroke accuracy.'}
            </span>
          </div>
        </div>
      </div>

      {/* =========================================================================
          ROW 5: SEAMLESS ARCADE SHORTCUTS HINT
          ========================================================================= */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px',
          fontSize: '12.5px',
          color: 'var(--text-sub)',
          opacity: 0.85,
          paddingTop: '6px',
          userSelect: 'none'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <kbd className="kbd">Tab</kbd>
          <span>or</span>
          <kbd className="kbd">Enter</kbd>
          <span>to restart</span>
        </div>

        {hasErrors && (
          <>
            <span>•</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <kbd className="kbd">P</kbd>
              <span>practice drill</span>
            </div>
          </>
        )}

        <span>•</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <kbd className="kbd">S</kbd>
          <span>share card</span>
        </div>
      </div>
    </div>
  );
}
