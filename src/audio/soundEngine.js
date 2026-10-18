/**
 * Web Audio API Keystroke Sound Synthesizer.
 * Synthesizes keystroke audio effects in real time using Web Audio oscillators and filters.
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

  // Disconnect masterGain node after sound decay to prevent audio graph accumulation
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

  // Dynamic finger velocity jitter (mimics human keystroke variation)
  const velocityJitter = 0.94 + Math.random() * 0.12;

  // Key-specific fundamental pitch variance & stabilizer acoustic weighting
  const pitchVar = isSpace
    ? 0.68 + Math.random() * 0.05 // Deeper hollow 6.25u spacebar chamber
    : isEnter
    ? 0.80 + Math.random() * 0.04 // 2.25u Enter stabilizer
    : isBackspace
    ? 0.83 + Math.random() * 0.04 // 2u Backspace stabilizer
    : (0.95 + Math.random() * 0.10) * velocityJitter; // 1u Alpha key with micro-variation

  switch (preset) {
    case 'creamy': {
      // Multi-layer mechanical switch synthesis: body impact, sub resonance, noise transient, upstroke, stabilizer thud
      // 1. Body impact oscillator
      const bodyOsc = ctx.createOscillator();
      const bodyGain = ctx.createGain();
      const bodyFilter = ctx.createBiquadFilter();

      bodyFilter.type = 'lowpass';
      bodyFilter.frequency.setValueAtTime(isSpace ? 250 : isEnter ? 320 : 390, now);
      bodyFilter.Q.setValueAtTime(isSpace ? 2.2 : 1.8, now);

      bodyOsc.type = 'triangle';
      const startFreq = (isSpace ? 110 : isEnter ? 145 : 178) * pitchVar;
      const endFreq = isSpace ? 36 : isEnter ? 50 : 64;
      bodyOsc.frequency.setValueAtTime(startFreq, now);
      bodyOsc.frequency.exponentialRampToValueAtTime(endFreq, now + (isSpace ? 0.075 : 0.046));

      const decayTime = isSpace ? 0.088 : isEnter ? 0.065 : 0.052;
      bodyGain.gain.setValueAtTime((isSpace ? 1.05 : 0.82) * velocityJitter, now);
      bodyGain.gain.exponentialRampToValueAtTime(0.001, now + decayTime);

      bodyOsc.connect(bodyFilter);
      bodyFilter.connect(bodyGain);
      bodyGain.connect(masterGain);

      // 2. Low-frequency resonance (Deep spacebar stabilizer bar cavity)
      const subOsc = ctx.createOscillator();
      const subGain = ctx.createGain();
      subOsc.type = 'sine';
      subOsc.frequency.setValueAtTime((isSpace ? 62 : isEnter ? 85 : 108) * pitchVar, now);
      subOsc.frequency.exponentialRampToValueAtTime(32, now + (isSpace ? 0.07 : 0.04));

      subGain.gain.setValueAtTime((isSpace ? 0.75 : isEnter ? 0.55 : 0.42) * velocityJitter, now);
      subGain.gain.exponentialRampToValueAtTime(0.001, now + (isSpace ? 0.08 : 0.045));

      subOsc.connect(subGain);
      subGain.connect(masterGain);

      // 3. Stabilizer wire transient (exclusive to Spacebar, Enter, Backspace)
      if (isSpace || isEnter || isBackspace) {
        const wireOsc = ctx.createOscillator();
        const wireGain = ctx.createGain();
        const wireFilter = ctx.createBiquadFilter();

        wireFilter.type = 'bandpass';
        wireFilter.frequency.setValueAtTime(isSpace ? 480 : 620, now);
        wireFilter.Q.setValueAtTime(3.0, now);

        wireOsc.type = 'sine';
        wireOsc.frequency.setValueAtTime(isSpace ? 180 : 240, now);
        wireOsc.frequency.exponentialRampToValueAtTime(80, now + 0.025);

        wireGain.gain.setValueAtTime(isSpace ? 0.35 : 0.22, now);
        wireGain.gain.exponentialRampToValueAtTime(0.001, now + 0.028);

        wireOsc.connect(wireFilter);
        wireFilter.connect(wireGain);
        wireGain.connect(masterGain);

        wireOsc.start(now);
        wireOsc.stop(now + 0.03);
      }

      // 4. Transient noise click (tactile stem bottom-out)
      const noise = ctx.createBufferSource();
      noise.buffer = getCreamyNoiseBuffer(ctx);

      const noiseFilter = ctx.createBiquadFilter();
      noiseFilter.type = 'bandpass';
      noiseFilter.frequency.setValueAtTime((isSpace ? 880 : isEnter ? 1150 : 1380) * pitchVar, now);
      noiseFilter.Q.setValueAtTime(2.4, now);

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime((isSpace ? 0.48 : 0.36) * velocityJitter, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.014);

      noise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(masterGain);

      // 5. Upstroke return click
      const upstrokeOsc = ctx.createOscillator();
      const upstrokeGain = ctx.createGain();
      const upstrokeFilter = ctx.createBiquadFilter();

      const upstrokeTime = now + (isSpace ? 0.068 : 0.044);
      upstrokeOsc.type = 'triangle';
      upstrokeOsc.frequency.setValueAtTime((isSpace ? 260 : 330) * pitchVar, upstrokeTime);
      upstrokeOsc.frequency.exponentialRampToValueAtTime(130, upstrokeTime + 0.022);

      upstrokeFilter.type = 'lowpass';
      upstrokeFilter.frequency.setValueAtTime(isSpace ? 460 : 560, upstrokeTime);

      upstrokeGain.gain.setValueAtTime(0.001, now);
      upstrokeGain.gain.setValueAtTime(isSpace ? 0.22 : 0.18, upstrokeTime);
      upstrokeGain.gain.exponentialRampToValueAtTime(0.001, upstrokeTime + 0.022);

      upstrokeOsc.connect(upstrokeFilter);
      upstrokeFilter.connect(upstrokeGain);
      upstrokeGain.connect(masterGain);

      // Start & Stop nodes
      bodyOsc.start(now);
      subOsc.start(now);
      noise.start(now);
      upstrokeOsc.start(upstrokeTime);

      bodyOsc.stop(now + decayTime + 0.01);
      subOsc.stop(now + 0.085);
      noise.stop(now + 0.018);
      upstrokeOsc.stop(upstrokeTime + 0.026);
      break;
    }

    case 'matcha': {
      // Mid-frequency bandpass click with brass plate resonance
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime((isSpace ? 920 : 1450) * pitchVar, now);
      filter.Q.setValueAtTime(isSpace ? 2.2 : 1.8, now);

      osc.type = isSpace ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime((isSpace ? 480 : 820) * pitchVar, now);
      osc.frequency.exponentialRampToValueAtTime(isSpace ? 110 : 220, now + (isSpace ? 0.055 : 0.035));

      oscGain.gain.setValueAtTime((isSpace ? 0.85 : 0.65) * velocityJitter, now);
      oscGain.gain.exponentialRampToValueAtTime(0.001, now + (isSpace ? 0.06 : 0.04));

      osc.connect(filter);
      filter.connect(oscGain);
      oscGain.connect(masterGain);

      // Spacebar brass plate low thud
      if (isSpace) {
        const plateOsc = ctx.createOscillator();
        const plateGain = ctx.createGain();
        plateOsc.type = 'sine';
        plateOsc.frequency.setValueAtTime(85 * pitchVar, now);
        plateOsc.frequency.exponentialRampToValueAtTime(45, now + 0.05);

        plateGain.gain.setValueAtTime(0.55 * velocityJitter, now);
        plateGain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

        plateOsc.connect(plateGain);
        plateGain.connect(masterGain);

        plateOsc.start(now);
        plateOsc.stop(now + 0.065);
      }

      osc.start(now);
      osc.stop(now + (isSpace ? 0.065 : 0.045));
      break;
    }

    case 'bubble': {
      // Rising frequency sweep
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime((isSpace ? 220 : 340) * pitchVar, now);
      osc.frequency.exponentialRampToValueAtTime((isSpace ? 520 : 780) * pitchVar, now + (isSpace ? 0.055 : 0.04));

      oscGain.gain.setValueAtTime((isSpace ? 0.85 : 0.7) * velocityJitter, now);
      oscGain.gain.exponentialRampToValueAtTime(0.001, now + (isSpace ? 0.065 : 0.05));

      osc.connect(oscGain);
      oscGain.connect(masterGain);

      osc.start(now);
      osc.stop(now + (isSpace ? 0.07 : 0.055));
      break;
    }

    case 'typewriter': {
      // Typewriter click with square wave, bandpass filter, and carriage spring
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime((isSpace ? 280 : 450) * pitchVar, now);
      osc.frequency.exponentialRampToValueAtTime(isSpace ? 70 : 110, now + (isSpace ? 0.045 : 0.03));

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(isSpace ? 1600 : 2400, now);

      oscGain.gain.setValueAtTime((isSpace ? 0.65 : 0.5) * velocityJitter, now);
      oscGain.gain.exponentialRampToValueAtTime(0.001, now + (isSpace ? 0.05 : 0.035));

      osc.connect(filter);
      filter.connect(oscGain);
      oscGain.connect(masterGain);

      // Carriage advance mechanical clunk for spacebar
      if (isSpace) {
        const clunkOsc = ctx.createOscillator();
        const clunkGain = ctx.createGain();
        clunkOsc.type = 'triangle';
        clunkOsc.frequency.setValueAtTime(140 * pitchVar, now);
        clunkOsc.frequency.exponentialRampToValueAtTime(50, now + 0.055);

        clunkGain.gain.setValueAtTime(0.55 * velocityJitter, now);
        clunkGain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

        clunkOsc.connect(clunkGain);
        clunkGain.connect(masterGain);

        clunkOsc.start(now);
        clunkOsc.stop(now + 0.065);
      }

      osc.start(now);
      osc.stop(now + (isSpace ? 0.055 : 0.04));
      break;
    }

    case 'wood': {
      // Woodblock tap synthesis with hollow cavity
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime((isSpace ? 170 : 260) * pitchVar, now);
      osc.frequency.exponentialRampToValueAtTime(isSpace ? 55 : 80, now + (isSpace ? 0.06 : 0.045));

      oscGain.gain.setValueAtTime((isSpace ? 0.95 : 0.8) * velocityJitter, now);
      oscGain.gain.exponentialRampToValueAtTime(0.001, now + (isSpace ? 0.065 : 0.05));

      osc.connect(oscGain);
      oscGain.connect(masterGain);

      osc.start(now);
      osc.stop(now + (isSpace ? 0.07 : 0.055));
      break;
    }

    default:
      break;
  }
}

/**
 * Plays a completion chime when a test finishes.
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
 * Plays an arpeggio fanfare when a new personal record is achieved.
 */
export function playRecordFanfare(volume = 0.65) {
  if (volume <= 0) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  // Fanfare notes: C5, E5, G5, B5, C6, E6
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
