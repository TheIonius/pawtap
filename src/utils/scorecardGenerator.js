import { getCozyPerformanceTitle } from './metrics';
import { getPresetAvatar } from '../constants/profile';

/**
 * Generates a PNG scorecard image of typing test results using HTML5 Canvas.
 */
export async function generateScorecardBlob(result, modeLabel, profile = null) {
  if (!result) return null;

  // Pre-load custom avatar image if present
  let avatarImg = null;
  if (profile?.avatarType === 'custom' && profile?.avatar) {
    try {
      avatarImg = await new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => resolve(img);
        img.onerror = () => resolve(null);
        img.src = profile.avatar;
      });
    } catch {}
  }

  const {
    wpm = 0,
    rawWpm = wpm,
    accuracy = 100,
    consistency = 100,
    duration = 1,
    wpmHistory = [],
    rawKeyStats = {},
    isNewRecord = false,
    failed = false,
    failedKey = '',
    targetWord = ''
  } = result;

  const tier = getCozyPerformanceTitle(wpm);

  // Extract theme colors from active DOM CSS variables
  let bg = '#1E1B18';
  let surface = '#28231F';
  let accent = '#D4A373';
  let textMain = '#F4EFEA';
  let textSub = '#9E9285';
  let textError = '#EF4444';

  if (typeof window !== 'undefined' && document?.documentElement) {
    const computed = window.getComputedStyle(document.documentElement);
    const getVal = (v) => computed.getPropertyValue(v)?.trim();
    bg = getVal('--bg') || bg;
    surface = getVal('--surface') || surface;
    accent = getVal('--accent') || accent;
    textMain = getVal('--text-main') || textMain;
    textSub = getVal('--text-sub') || textSub;
    textError = getVal('--text-error') || textError;
  }

  // Canvas dimensions (2x scale for high-DPI rendering)
  const width = 960;
  const height = 520;
  const scale = 2;

  const canvas = document.createElement('canvas');
  canvas.width = width * scale;
  canvas.height = height * scale;

  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  ctx.scale(scale, scale);

  // 1. Background fill
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, width, height);

  // Subtle interior container border
  ctx.strokeStyle = surface;
  ctx.lineWidth = 1.5;
  ctx.strokeRect(16, 16, width - 32, height - 32);

  // 2. Header Bar
  // Left: Brand logo & mode badge
  ctx.fillStyle = accent;
  ctx.font = 'bold 24px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText('pawtap', 40, 56);

  ctx.fillStyle = textSub;
  ctx.font = '14px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText('🐾', 124, 55);

  // Mode pill background
  const modeText = modeLabel || 'test';
  ctx.font = '600 12px "JetBrains Mono", monospace';
  const modeTextWidth = ctx.measureText(modeText).width;
  ctx.fillStyle = surface;
  ctx.beginPath();
  ctx.roundRect(154, 38, modeTextWidth + 18, 24, 6);
  ctx.fill();

  ctx.fillStyle = textSub;
  ctx.fillText(modeText, 163, 54);

  // Right: Rank / Status Badge
  const rankText = failed ? 'TERMINATED' : `RANK ${tier.rank} • ${tier.title}`;
  ctx.font = 'bold 12px "JetBrains Mono", monospace';
  const rankWidth = ctx.measureText(rankText).width;

  const badgeX = width - 40 - rankWidth - 24;
  ctx.fillStyle = failed ? 'rgba(239, 68, 68, 0.15)' : surface;
  ctx.strokeStyle = failed ? textError : accent;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(badgeX, 38, rankWidth + 24, 26, 6);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = failed ? textError : accent;
  ctx.fillText(rankText, badgeX + 12, 55);

  // If new record, draw star badge next to it
  let rightBoundary = badgeX;
  if (isNewRecord && !failed) {
    const nrText = '★ NEW PB';
    ctx.font = 'bold 11px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    const nrWidth = ctx.measureText(nrText).width;
    const nrX = badgeX - nrWidth - 20;
    rightBoundary = nrX;

    ctx.fillStyle = accent;
    ctx.beginPath();
    ctx.roundRect(nrX, 39, nrWidth + 14, 24, 6);
    ctx.fill();

    ctx.fillStyle = bg;
    ctx.fillText(nrText, nrX + 7, 55);
  }

  // Profile / Typist Identity Pill
  if (profile?.name) {
    const displayName = profile.name.trim();
    ctx.font = '600 12px "JetBrains Mono", -apple-system, BlinkMacSystemFont, sans-serif';
    const nameWidth = ctx.measureText(displayName).width;
    const pillWidth = nameWidth + (avatarImg ? 32 : 30);
    const pillX = 154 + modeTextWidth + 28;

    // Only draw if there's comfortable space before right-aligned badges
    if (pillX + pillWidth < rightBoundary - 24) {
      ctx.fillStyle = surface;
      ctx.beginPath();
      ctx.roundRect(pillX, 38, pillWidth, 24, 6);
      ctx.fill();

      // Render custom image or preset emoji
      if (avatarImg) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(pillX + 12, 50, 7.5, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(avatarImg, pillX + 4.5, 42.5, 15, 15);
        ctx.restore();
      } else {
        const preset = getPresetAvatar(profile?.avatar || 'cat');
        ctx.font = '11px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        ctx.fillText(preset.emoji, pillX + 5, 54);
      }

      ctx.fillStyle = textMain;
      ctx.font = '600 11.5px "JetBrains Mono", -apple-system, BlinkMacSystemFont, sans-serif';
      ctx.fillText(displayName, pillX + (avatarImg ? 24 : 22), 54);
    }
  }

  // 3. Primary Metrics Grid
  const metricY = 135;
  const metrics = [
    { label: 'WPM', val: `${wpm}`, color: accent, large: true },
    { label: 'ACCURACY', val: `${accuracy}%`, color: textMain },
    { label: 'RAW WPM', val: `${rawWpm || wpm}`, color: textMain },
    { label: 'CONSISTENCY', val: `${consistency}%`, color: textMain },
    { label: 'DURATION', val: `${duration}s`, color: textMain }
  ];

  let currentX = 42;
  const colSpacing = 175;

  metrics.forEach((m, idx) => {
    // Label
    ctx.fillStyle = textSub;
    ctx.font = 'bold 11px "JetBrains Mono", monospace';
    ctx.fillText(m.label, currentX, metricY - 24);

    // Value
    ctx.fillStyle = m.color;
    ctx.font = m.large
      ? '800 64px "JetBrains Mono", monospace'
      : '700 40px "JetBrains Mono", monospace';
    ctx.fillText(m.val, currentX, metricY + (m.large ? 24 : 16));

    currentX += idx === 0 ? colSpacing + 10 : colSpacing - 5;
  });

  // 4. Speed Trajectory Curve (if data available)
  const chartX = 42;
  const chartY = 205;
  const chartW = width - 84;
  const chartH = 180;

  if (wpmHistory && wpmHistory.length > 1) {
    const maxVal = Math.max(
      wpm,
      rawWpm,
      ...wpmHistory.map(p => Math.max(p.wpm || 0, p.rawWpm || 0))
    );
    const maxChartWpm = Math.max(40, Math.ceil((maxVal * 1.15) / 10) * 10);
    const maxSec = Math.max(1, wpmHistory[wpmHistory.length - 1].second || duration);

    // Chart header / subtle peak label
    ctx.fillStyle = textSub;
    ctx.font = 'bold 10px "JetBrains Mono", monospace';
    ctx.fillText(`PEAK ${Math.round(maxVal)} WPM`, chartX, chartY + 12);

    // Grid baseline
    ctx.strokeStyle = surface;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(chartX, chartY + chartH);
    ctx.lineTo(chartX + chartW, chartY + chartH);
    ctx.stroke();

    // Map points
    const points = wpmHistory.map(p => ({
      x: chartX + (p.second / maxSec) * chartW,
      y: chartY + chartH - (p.wpm / maxChartWpm) * chartH
    }));

    if (points.length > 1) {
      // Area gradient
      const grad = ctx.createLinearGradient(0, chartY, 0, chartY + chartH);
      grad.addColorStop(0, 'rgba(212, 163, 115, 0.28)');
      grad.addColorStop(1, 'rgba(212, 163, 115, 0.0)');

      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      for (let i = 0; i < points.length - 1; i++) {
        const xc = (points[i].x + points[i + 1].x) / 2;
        const yc = (points[i].y + points[i + 1].y) / 2;
        ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
      }
      ctx.lineTo(points[points.length - 1].x, points[points.length - 1].y);
      ctx.lineTo(points[points.length - 1].x, chartY + chartH);
      ctx.lineTo(points[0].x, chartY + chartH);
      ctx.closePath();
      ctx.fillStyle = grad;
      ctx.fill();

      // Stroke line
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      for (let i = 0; i < points.length - 1; i++) {
        const xc = (points[i].x + points[i + 1].x) / 2;
        const yc = (points[i].y + points[i + 1].y) / 2;
        ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
      }
      ctx.lineTo(points[points.length - 1].x, points[points.length - 1].y);
      ctx.strokeStyle = accent;
      ctx.lineWidth = 2.5;
      ctx.stroke();
    }
  } else {
    // Divider line if no trajectory
    ctx.strokeStyle = surface;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(42, 280);
    ctx.lineTo(width - 42, 280);
    ctx.stroke();
  }

  // 5. Character stats & footer
  const correctCount = rawKeyStats.correct || 0;
  const incorrectCount = rawKeyStats.incorrect || 0;
  const extraCount = rawKeyStats.extra || 0;
  const totalCharacters = correctCount + incorrectCount + extraCount;

  const footerY = height - 42;

  // Left: character breakdown
  ctx.fillStyle = textSub;
  ctx.font = '12px "JetBrains Mono", monospace';
  const charSummary = failed
    ? `missed '${failedKey}' on "${targetWord}"`
    : `correct: ${correctCount} • typos: ${incorrectCount} • total: ${totalCharacters} chars`;
  ctx.fillText(charSummary, 42, footerY);

  // Right: App link and tagline
  const brandTag = 'pawtap.app • type gently ~';
  ctx.font = 'italic 12.5px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  const brandWidth = ctx.measureText(brandTag).width;
  ctx.fillStyle = textSub;
  ctx.fillText(brandTag, width - 42 - brandWidth, footerY);

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      resolve(blob);
    }, 'image/png');
  });
}
