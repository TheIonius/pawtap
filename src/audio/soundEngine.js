/**
 * Web Audio API Creamy Mechanical Keyboard & Tactile Synthesizer
 * Zero external audio files required — 100% synthesized in real time with zero latency.
 * Engineered for authentic lubed custom mechanical switch acoustics (thock, cream, pop).
 */

let audioCtx = null;

export function getAudioContext() {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

// Global unlock listener on first user gesture
if (typeof window !== 'undefined') {
  const unlockAudio = () => {
    const ctx = getAudioContext();
    if (ctx && ctx.state === 'suspended') {
      ctx.resume();
    }
  };
  ['keydown', 'pointerdown', 'mousedown', 'touchstart'].forEach(evt => {
    window.addEventListener(evt, unlockAudio, { passive: true });
  });
}

export const SOUND_PRESETS = [
  { id: 'creamy', name: 'Creamy Thock', desc: 'Lubed Milky Yellow & Cream linear switches' },
  { id: 'matcha', name: 'Matcha Clack', desc: 'Crisp poppy tactile switch on brass plate' },
  { id: 'bubble', name: 'Bubble Pop', desc: 'Satisfying soft popping water droplets' },
  { id: 'typewriter', name: 'Typewriter', desc: 'Vintage mechanical striking clatter' },
  { id: 'wood', name: 'Wood Tap', desc: 'Soft organic wooden marimba click' },
  { id: 'silent', name: 'Silent', desc: 'Pure quiet typing' }
];

let creamyNoiseBuffer = null;
function getCreamyNoiseBuffer(ctx) {
  if (!creamyNoiseBuffer || creamyNoiseBuffer.sampleRate !== ctx.sampleRate) {
    const bufferSize = Math.floor(ctx.sampleRate * 0.015);
    creamyNoiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = creamyNoiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.25));
    }
  }
  return creamyNoiseBuffer;
}

/**
 * Synthesizes a realistic keystroke sound.
 * @param {string} preset - Sound profile ID
 * @param {number} volume - Volume (0 to 1)
 * @param {string} key - The key pressed (' ', 'Backspace', 'Enter', or char)
 */
export function playKeySound(preset = 'creamy', volume = 0.65, key = '') {
  if (preset === 'silent' || volume <= 0) return;

  const ctx = getAudioContext();
  if (!ctx) return;

  // Make sure context is active
  if (ctx.state === 'suspended') {
    ctx.resume();
  }

  const now = ctx.currentTime;
  const masterGain = ctx.createGain();
  // Scaled master volume
  masterGain.gain.setValueAtTime(Math.min(1, volume * 1.1), now);
  masterGain.connect(ctx.destination);

  // Automatically disconnect masterGain once the brief switch acoustic decays to prevent audio graph accumulation
  setTimeout(() => {
    try {
      masterGain.disconnect();
    } catch {
      // Ignored
    }
  }, 160);

  // Key-specific characteristics
  const isSpace = key === ' ';
  const isBackspace = key === 'Backspace';
  const isEnter = key === 'Enter';

  // Organic micro-pitch variation (different keys on keyboard vibrate subtly differently)
  const pitchVar = isSpace
    ? 0.72 // Spacebar has heavy deep stabilizer sound
    : isBackspace || isEnter
    ? 0.84 // Backspace and Enter are deeper
    : 0.94 + Math.random() * 0.12; // Regular keys vary slightly

  switch (preset) {
    case 'creamy': {
      /* =========================================================================
         CREAMY MECHANICAL SWITCH (Lubed Gateron Milky Yellow / NovelKeys Cream)
         Acoustics:
         1. Bottom-Out Body Thock: Warm triangle swept 170Hz -> 65Hz through 360Hz LPF
         2. Desk Resonance Sub-Body: Sine wave ~110Hz giving that deep, solid thud
         3. Stem Slide Transient: Soft lubed noise pop filtered at 1300Hz
         4. Upstroke Snap: Very quiet subtle key return tap 40ms later
         ========================================================================= */

      // 1. Bottom-Out Body Thock
      const bodyOsc = ctx.createOscillator();
      const bodyGain = ctx.createGain();
      const bodyFilter = ctx.createBiquadFilter();

      bodyFilter.type = 'lowpass';
      bodyFilter.frequency.setValueAtTime(isSpace ? 280 : 380, now);
      bodyFilter.Q.setValueAtTime(1.8, now);

      bodyOsc.type = 'triangle';
      const startFreq = (isSpace ? 120 : 175) * pitchVar;
      const endFreq = (isSpace ? 42 : 62);
      bodyOsc.frequency.setValueAtTime(startFreq, now);
      bodyOsc.frequency.exponentialRampToValueAtTime(endFreq, now + (isSpace ? 0.065 : 0.045));

      const decayTime = isSpace ? 0.075 : 0.052;
      bodyGain.gain.setValueAtTime(isSpace ? 0.95 : 0.8, now);
      bodyGain.gain.exponentialRampToValueAtTime(0.001, now + decayTime);

      bodyOsc.connect(bodyFilter);
      bodyFilter.connect(bodyGain);
      bodyGain.connect(masterGain);

      // 2. Desk & Housing Resonance (Sub Bass Thud)
      const subOsc = ctx.createOscillator();
      const subGain = ctx.createGain();
      subOsc.type = 'sine';
      subOsc.frequency.setValueAtTime((isSpace ? 75 : 105) * pitchVar, now);
      subOsc.frequency.exponentialRampToValueAtTime(40, now + 0.04);

      subGain.gain.setValueAtTime(isSpace ? 0.6 : 0.45, now);
      subGain.gain.exponentialRampToValueAtTime(0.001, now + (isSpace ? 0.06 : 0.04));

      subOsc.connect(subGain);
      subGain.connect(masterGain);

      // 3. Stem Impact Transient (Soft Lubed Pop)
      const noise = ctx.createBufferSource();
      noise.buffer = getCreamyNoiseBuffer(ctx);

      const noiseFilter = ctx.createBiquadFilter();
      noiseFilter.type = 'bandpass';
      noiseFilter.frequency.setValueAtTime((isSpace ? 950 : 1350) * pitchVar, now);
      noiseFilter.Q.setValueAtTime(2.2, now);

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(isSpace ? 0.45 : 0.35, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.012);

      noise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(masterGain);

      // 4. Subtle Key Return Upstroke (Simulates switch spring snapping back up)
      const upstrokeOsc = ctx.createOscillator();
      const upstrokeGain = ctx.createGain();
      const upstrokeFilter = ctx.createBiquadFilter();

      const upstrokeTime = now + (isSpace ? 0.06 : 0.042);
      upstrokeOsc.type = 'triangle';
      upstrokeOsc.frequency.setValueAtTime(320 * pitchVar, upstrokeTime);
      upstrokeOsc.frequency.exponentialRampToValueAtTime(140, upstrokeTime + 0.02);

      upstrokeFilter.type = 'lowpass';
      upstrokeFilter.frequency.setValueAtTime(550, upstrokeTime);

      upstrokeGain.gain.setValueAtTime(0.001, now);
      upstrokeGain.gain.setValueAtTime(0.18, upstrokeTime);
      upstrokeGain.gain.exponentialRampToValueAtTime(0.001, upstrokeTime + 0.02);

      upstrokeOsc.connect(upstrokeFilter);
      upstrokeFilter.connect(upstrokeGain);
      upstrokeGain.connect(masterGain);

      // Start & Stop nodes
      bodyOsc.start(now);
      subOsc.start(now);
      noise.start(now);
      upstrokeOsc.start(upstrokeTime);

      bodyOsc.stop(now + decayTime + 0.01);
      subOsc.stop(now + 0.065);
      noise.stop(now + 0.015);
      upstrokeOsc.stop(upstrokeTime + 0.025);
      break;
    }

    case 'matcha': {
      // Crisp poppy linear clack
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1450 * pitchVar, now);
      filter.Q.setValueAtTime(1.8, now);

      osc.type = 'sine';
      osc.frequency.setValueAtTime(820 * pitchVar, now);
      osc.frequency.exponentialRampToValueAtTime(220, now + 0.035);

      oscGain.gain.setValueAtTime(0.65, now);
      oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

      osc.connect(filter);
      filter.connect(oscGain);
      oscGain.connect(masterGain);

      osc.start(now);
      osc.stop(now + 0.045);
      break;
    }

    case 'bubble': {
      // Bubble pop: Smooth rising frequency sweep
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(340 * pitchVar, now);
      osc.frequency.exponentialRampToValueAtTime(780 * pitchVar, now + 0.04);

      oscGain.gain.setValueAtTime(0.7, now);
      oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

      osc.connect(oscGain);
      oscGain.connect(masterGain);

      osc.start(now);
      osc.stop(now + 0.055);
      break;
    }

    case 'typewriter': {
      // Vintage typewriter mechanical clatter
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(450 * pitchVar, now);
      osc.frequency.exponentialRampToValueAtTime(110, now + 0.03);

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(2400, now);

      oscGain.gain.setValueAtTime(0.5, now);
      oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

      osc.connect(filter);
      filter.connect(oscGain);
      oscGain.connect(masterGain);

      osc.start(now);
      osc.stop(now + 0.04);
      break;
    }

    case 'wood': {
      // Soft organic wooden tap
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(260 * pitchVar, now);
      osc.frequency.exponentialRampToValueAtTime(80, now + 0.045);

      oscGain.gain.setValueAtTime(0.8, now);
      oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

      osc.connect(oscGain);
      oscGain.connect(masterGain);

      osc.start(now);
      osc.stop(now + 0.055);
      break;
    }

    default:
      break;
  }
}

/**
 * Plays a cheerful warm chime when a test completes
 */
export function playCompletionChime(volume = 0.6) {
  if (volume <= 0) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6 arpeggio
  const now = ctx.currentTime;

  notes.forEach((freq, idx) => {
    const startTime = now + idx * 0.08;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, startTime);

    gain.gain.setValueAtTime(0.3 * volume, startTime);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.45);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(startTime);
    osc.stop(startTime + 0.5);
  });
}

/**
 * Plays a triumphant, warm celebratory fanfare when a new Personal Record / Best WPM is achieved!
 */
export function playRecordFanfare(volume = 0.65) {
  if (volume <= 0) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  // Uplifting triumphant arpeggio: C5, E5, G5, B5, C6, E6
  const notes = [523.25, 659.25, 783.99, 987.77, 1046.50, 1318.51];
  const now = ctx.currentTime;

  notes.forEach((freq, idx) => {
    const startTime = now + idx * 0.075;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = idx >= 4 ? 'triangle' : 'sine';
    osc.frequency.setValueAtTime(freq, startTime);

    gain.gain.setValueAtTime(0.35 * volume, startTime);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.6);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(startTime);
    osc.stop(startTime + 0.65);
  });
}
