/**
 * Cozy Ambient Sound Generator (Gentle Rain & Lo-Fi Chill)
 * Web Audio API synthesized pink noise rain and lush vintage Lo-Fi Rhodes chords.
 * Zero external audio files — 100% synthesized in real time.
 */

let ambientCtx = null;
let ambientMasterGain = null;
let currentAmbientType = 'none';

// Active sound node tracking for clean stop/switch
let activeNoiseSource = null;
let activeLofiOscs = [];
let lofiChordTimer = null;

export const AMBIENT_PRESETS = [
  { id: 'none', name: 'Off' },
  { id: 'rain', name: 'Gentle Rain' },
  { id: 'lofi', name: 'Lo-Fi Chill' },
];

function getAmbientContext() {
  if (!ambientCtx && typeof window !== 'undefined') {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      ambientCtx = new AudioContextClass();
    }
  }
  if (ambientCtx && ambientCtx.state === 'suspended') {
    ambientCtx.resume();
  }
  return ambientCtx;
}

// Gentle Lo-Fi jazz chord progression (Cmaj9 -> Am9 -> Dm9 -> G13)
const LOFI_CHORDS = [
  [130.81, 196.00, 246.94, 329.63], // Cmaj9: C3, G3, B3, E4
  [110.00, 196.00, 261.63, 329.63], // Am9: A2, G3, C4, E4
  [146.83, 174.61, 261.63, 329.63], // Dm9: D3, F3, C4, E4
  [98.00, 174.61, 246.94, 329.63]   // G13: G2, F3, B3, E4
];

let currentChordIdx = 0;

function playLofiChord(ctx, destinationGain) {
  if (!ctx || currentAmbientType !== 'lofi') return;

  const now = ctx.currentTime;
  const chordNotes = LOFI_CHORDS[currentChordIdx % LOFI_CHORDS.length];
  currentChordIdx++;

  const chordDuration = 3.6;

  // Vintage Cassette Tape Wow/Flutter LFO
  const lfo = ctx.createOscillator();
  const lfoGain = ctx.createGain();
  lfo.type = 'sine';
  lfo.frequency.setValueAtTime(0.35, now); // Slow tape warble
  lfoGain.gain.setValueAtTime(4.5, now); // ±4.5 cents wobble
  lfo.connect(lfoGain);
  lfo.start(now);
  lfo.stop(now + chordDuration + 0.2);
  activeLofiOscs.push(lfo);

  chordNotes.forEach((freq, idx) => {
    // Warm Rhodes tine oscillator (triangle + mellow sine body)
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.type = idx === 0 ? 'sine' : 'triangle';
    osc.frequency.setValueAtTime(freq, now);
    lfoGain.connect(osc.detune);

    // Warm Lo-Fi lowpass filter roll-off (sleepy, warm, no harsh highs)
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(420, now);
    filter.frequency.exponentialRampToValueAtTime(320, now + chordDuration);

    // Lush smooth envelope: soft 80ms attack, gentle warm decay
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.18, now + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.001, now + chordDuration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(destinationGain);

    osc.start(now);
    osc.stop(now + chordDuration);

    activeLofiOscs.push(osc);
  });
}

export function setAmbientSound(type = 'none', volume = 0.25) {
  currentAmbientType = type;

  if (type === 'none' || volume <= 0) {
    stopAmbientSound();
    return;
  }

  const ctx = getAmbientContext();
  if (!ctx) return;

  // Stop previous sources
  stopAmbientSound();

  currentAmbientType = type;

  // Master ambient gain
  ambientMasterGain = ctx.createGain();
  ambientMasterGain.gain.setValueAtTime(Math.max(0, volume * 0.4), ctx.currentTime);
  ambientMasterGain.connect(ctx.destination);

  if (type === 'rain') {
    // Pink/Brown noise generator for continuous rain
    const bufferSize = ctx.sampleRate * 2;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);

    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
      b6 = white * 0.115926;
    }

    activeNoiseSource = ctx.createBufferSource();
    activeNoiseSource.buffer = noiseBuffer;
    activeNoiseSource.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(750, ctx.currentTime);

    activeNoiseSource.connect(filter);
    filter.connect(ambientMasterGain);
    activeNoiseSource.start();
  } else if (type === 'lofi') {
    // 1. Warm Vinyl Cassette Tape Floor Noise
    const bufferSize = ctx.sampleRate * 2;
    const tapeBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = tapeBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = (Math.random() * 2 - 1) * 0.035;
    }

    activeNoiseSource = ctx.createBufferSource();
    activeNoiseSource.buffer = tapeBuffer;
    activeNoiseSource.loop = true;

    const tapeFilter = ctx.createBiquadFilter();
    tapeFilter.type = 'bandpass';
    tapeFilter.frequency.setValueAtTime(380, ctx.currentTime);
    tapeFilter.Q.setValueAtTime(0.8, ctx.currentTime);

    const tapeGain = ctx.createGain();
    tapeGain.gain.setValueAtTime(0.2, ctx.currentTime);

    activeNoiseSource.connect(tapeFilter);
    tapeFilter.connect(tapeGain);
    tapeGain.connect(ambientMasterGain);
    activeNoiseSource.start();

    // 2. Continuous Lush Lo-Fi Rhodes Chords
    currentChordIdx = 0;
    playLofiChord(ctx, ambientMasterGain);

    lofiChordTimer = setInterval(() => {
      if (currentAmbientType === 'lofi' && ambientCtx && ambientMasterGain) {
        playLofiChord(ambientCtx, ambientMasterGain);
      }
    }, 3600);
  }
}

export function updateAmbientVolume(volume) {
  if (volume <= 0) {
    if (ambientMasterGain && ambientCtx) {
      try {
        ambientMasterGain.gain.setValueAtTime(0, ambientCtx.currentTime);
      } catch {
        // Ignored
      }
    }
    stopAmbientSound();
    return;
  }

  const ctx = getAmbientContext();
  if (!ctx) return;

  if (ambientMasterGain) {
    ambientMasterGain.gain.setValueAtTime(Math.max(0, volume * 0.4), ctx.currentTime);
  }

  // If ambient was stopped (e.g. muted/volume 0) and is now restored
  if (currentAmbientType !== 'none' && !activeNoiseSource && !lofiChordTimer) {
    setAmbientSound(currentAmbientType, volume);
  }
}

export function stopAmbientSound() {
  if (lofiChordTimer) {
    clearInterval(lofiChordTimer);
    lofiChordTimer = null;
  }

  activeLofiOscs.forEach((osc) => {
    try {
      osc.stop();
      osc.disconnect();
    } catch {
      // Ignored
    }
  });
  activeLofiOscs = [];

  if (activeNoiseSource) {
    try {
      activeNoiseSource.stop();
      activeNoiseSource.disconnect();
    } catch {
      // Ignored
    }
    activeNoiseSource = null;
  }

  if (ambientMasterGain && ambientCtx) {
    try {
      ambientMasterGain.gain.setValueAtTime(0, ambientCtx.currentTime);
    } catch {
      // Ignored
    }
  }
}
