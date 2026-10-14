/**
 * Cozy Ambient & Lo-Fi Soundscape Generator
 * Web Audio API synthesized procedural soundscapes.
 * Zero external audio files — 100% synthesized in real time.
 */

let ambientCtx = null;
let ambientMasterGain = null;
let currentAmbientType = 'none';

// Active nodes and timers tracking for clean stop/switch
let activeNoiseSource = null;
let activeOscillators = [];
let sequenceTimer = null;
let embellishmentTimer = null;

export const AMBIENT_PRESETS = [
  { id: 'none', name: 'Off' },
  { id: 'rain', name: 'Rainy Greenhouse' },
  { id: 'midnight', name: 'Midnight Cocoa' },
  { id: 'afternoon', name: 'Afternoon Reverie' },
  { id: 'starlit', name: 'Starlit Nap' },
  { id: 'cafe', name: 'Café Corner' },
  { id: 'sunbeam', name: 'Sunbeam Drowse' },
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

function registerOsc(osc) {
  activeOscillators.push(osc);
  osc.onended = () => {
    const idx = activeOscillators.indexOf(osc);
    if (idx !== -1) {
      activeOscillators.splice(idx, 1);
    }
  };
}

// -------------------------------------------------------------
// TEXTURE GENERATOR (Rain pink noise & Vintage tape/vinyl floor)
// -------------------------------------------------------------
function startTextureNoise(ctx, destinationGain, { type = 'vinyl', filterFreq = 420, filterQ = 0.8, gainVal = 0.08 } = {}) {
  const bufferSize = ctx.sampleRate * 2;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);

  if (type === 'rain') {
    // Pink noise generator algorithm (Paul Kellet's filtered pink noise)
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.13;
      b6 = white * 0.115926;
    }
  } else {
    // Warm vintage tape/vinyl noise floor with rare subtle micro-dust crackle
    for (let i = 0; i < bufferSize; i++) {
      let sample = (Math.random() * 2 - 1) * 0.022;
      if (Math.random() < 0.0003) {
        sample += (Math.random() * 2 - 1) * 0.09;
      }
      data[i] = sample;
    }
  }

  const noiseSource = ctx.createBufferSource();
  noiseSource.buffer = buffer;
  noiseSource.loop = true;

  const filter = ctx.createBiquadFilter();
  filter.type = type === 'rain' ? 'lowpass' : 'bandpass';
  filter.frequency.setValueAtTime(filterFreq, ctx.currentTime);
  filter.Q.setValueAtTime(filterQ, ctx.currentTime);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(gainVal, ctx.currentTime);

  noiseSource.connect(filter);
  filter.connect(gain);
  gain.connect(destinationGain);

  noiseSource.start();
  activeNoiseSource = noiseSource;
}

// -------------------------------------------------------------
// TRACK HARMONIC PROGRESSIONS & SOUND ENGINES
// -------------------------------------------------------------

// Track 1: Rainy Greenhouse — Random soft raindrop pings
function scheduleRaindrops(ctx, destinationGain) {
  function spawnDrop() {
    if (currentAmbientType !== 'rain' || !ambientCtx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const dropGain = ctx.createGain();
    const dropFilter = ctx.createBiquadFilter();

    const freq = 650 + Math.random() * 950;
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);
    osc.frequency.exponentialRampToValueAtTime(freq * 0.65, now + 0.08);

    dropFilter.type = 'lowpass';
    dropFilter.frequency.setValueAtTime(1200, now);

    dropGain.gain.setValueAtTime(0.001, now);
    dropGain.gain.linearRampToValueAtTime(0.028 + Math.random() * 0.02, now + 0.012);
    dropGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.11);

    osc.connect(dropFilter);
    dropFilter.connect(dropGain);
    dropGain.connect(destinationGain);

    osc.start(now);
    osc.stop(now + 0.12);
    registerOsc(osc);

    embellishmentTimer = setTimeout(spawnDrop, 220 + Math.random() * 550);
  }
  spawnDrop();
}

// Track 2: Midnight Cocoa (Ebmaj9 -> Cm9 -> Fm9 -> Bb13)
// Deep neo-soul Rhodes chords, sleepy sub-bass, 28ms human strum delay
const MIDNIGHT_CHORDS = [
  { sub: 77.78, notes: [196.00, 233.08, 293.66, 349.23] }, // Ebmaj9 (Eb2 sub + G3, Bb3, D4, F4)
  { sub: 65.41, notes: [196.00, 233.08, 311.13, 392.00] }, // Cm9 (C2 sub + G3, Bb3, Eb4, G4)
  { sub: 87.31, notes: [207.65, 261.63, 311.13, 392.00] }, // Fm9 (F2 sub + Ab3, C4, Eb4, G4)
  { sub: 116.54, notes: [207.65, 261.63, 293.66, 392.00] } // Bb13 (Bb2 sub + Ab3, C4, D4, G4)
];

function playMidnightChord(ctx, destinationGain, chord) {
  const now = ctx.currentTime;
  const duration = 3.8;

  // Gentle vintage tape pitch wow/flutter
  const lfo = ctx.createOscillator();
  const lfoGain = ctx.createGain();
  lfo.type = 'sine';
  lfo.frequency.setValueAtTime(0.28, now);
  lfoGain.gain.setValueAtTime(3.8, now); // ±3.8 cents warble
  lfo.connect(lfoGain);
  lfo.start(now);
  lfo.stop(now + duration + 0.1);
  registerOsc(lfo);

  // Sub-Bass fundamental (warm, grounding low end)
  const subOsc = ctx.createOscillator();
  const subGain = ctx.createGain();
  const subFilter = ctx.createBiquadFilter();
  subOsc.type = 'sine';
  subOsc.frequency.setValueAtTime(chord.sub, now);
  subFilter.type = 'lowpass';
  subFilter.frequency.setValueAtTime(140, now);

  subGain.gain.setValueAtTime(0.001, now);
  subGain.gain.linearRampToValueAtTime(0.22, now + 0.12);
  subGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

  subOsc.connect(subFilter);
  subFilter.connect(subGain);
  subGain.connect(destinationGain);
  subOsc.start(now);
  subOsc.stop(now + duration);
  registerOsc(subOsc);

  // Strummed Rhodes chords
  chord.notes.forEach((freq, idx) => {
    const noteStart = now + idx * 0.028; // 28ms human strum offset
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, noteStart);
    lfoGain.connect(osc.detune);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(460, noteStart);
    filter.frequency.exponentialRampToValueAtTime(340, noteStart + duration);

    gain.gain.setValueAtTime(0.001, noteStart);
    gain.gain.linearRampToValueAtTime(0.14, noteStart + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.001, noteStart + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(destinationGain);

    osc.start(noteStart);
    osc.stop(noteStart + duration);
    registerOsc(osc);
  });
}

// Track 3: Afternoon Reverie (Fmaj9 -> Am9 -> Bbmaj7 -> C9sus4)
// Dreamy keys with soft pentatonic celesta music-box chimes
const AFTERNOON_CHORDS = [
  { sub: 87.31, notes: [220.00, 261.63, 329.63, 392.00] }, // Fmaj9
  { sub: 110.00, notes: [261.63, 329.63, 392.00, 493.88] }, // Am9
  { sub: 116.54, notes: [220.00, 293.66, 349.23, 440.00] }, // Bbmaj7
  { sub: 130.81, notes: [174.61, 233.08, 293.66, 392.00] }  // C9sus4
];

const CELESTA_NOTES = [523.25, 587.33, 659.25, 783.99, 880.00, 1046.50];

function playAfternoonChord(ctx, destinationGain, chord) {
  const now = ctx.currentTime;
  const duration = 3.6;

  // Sub warmth
  const subOsc = ctx.createOscillator();
  const subGain = ctx.createGain();
  subOsc.type = 'sine';
  subOsc.frequency.setValueAtTime(chord.sub, now);
  subGain.gain.setValueAtTime(0.001, now);
  subGain.gain.linearRampToValueAtTime(0.16, now + 0.1);
  subGain.gain.exponentialRampToValueAtTime(0.001, now + duration);
  subOsc.connect(subGain);
  subGain.connect(destinationGain);
  subOsc.start(now);
  subOsc.stop(now + duration);
  registerOsc(subOsc);

  // Soft keys
  chord.notes.forEach((freq, idx) => {
    const noteStart = now + idx * 0.022;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, noteStart);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(500, noteStart);
    filter.frequency.exponentialRampToValueAtTime(380, noteStart + duration);

    gain.gain.setValueAtTime(0.001, noteStart);
    gain.gain.linearRampToValueAtTime(0.13, noteStart + 0.07);
    gain.gain.exponentialRampToValueAtTime(0.001, noteStart + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(destinationGain);

    osc.start(noteStart);
    osc.stop(noteStart + duration);
    registerOsc(osc);
  });
}

function scheduleCelestaChimes(ctx, destinationGain) {
  function ringChime() {
    if (currentAmbientType !== 'afternoon' || !ambientCtx) return;
    const now = ctx.currentTime;
    const note = CELESTA_NOTES[Math.floor(Math.random() * CELESTA_NOTES.length)];

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(note, now);

    const overtone = ctx.createOscillator();
    const otGain = ctx.createGain();
    overtone.type = 'sine';
    overtone.frequency.setValueAtTime(note * 2, now);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.055, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.0);

    otGain.gain.setValueAtTime(0.001, now);
    otGain.gain.linearRampToValueAtTime(0.018, now + 0.015);
    otGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);

    osc.connect(gain);
    gain.connect(destinationGain);
    overtone.connect(otGain);
    otGain.connect(destinationGain);

    osc.start(now);
    osc.stop(now + 2.1);
    overtone.start(now);
    overtone.stop(now + 1.3);

    registerOsc(osc);
    registerOsc(overtone);

    embellishmentTimer = setTimeout(ringChime, 1800 + Math.random() * 2200);
  }
  embellishmentTimer = setTimeout(ringChime, 1200);
}

// Track 4: Starlit Nap (Dmaj9 -> Gmaj7#11 -> Bm9 -> Asus4add9)
// Weightless ambient pad swells, dual detuned chorus, slow breathing filter
const STARLIT_CHORDS = [
  [73.42, 146.83, 185.00, 277.18, 329.63], // Dmaj9
  [98.00, 146.83, 246.94, 277.18, 369.99], // Gmaj7#11
  [123.47, 185.00, 293.66, 369.99, 440.00], // Bm9
  [110.00, 164.81, 293.66, 329.63, 493.88]  // Asus4add9
];

function playStarlitPad(ctx, destinationGain, notes) {
  const now = ctx.currentTime;
  const duration = 5.6;

  notes.forEach((freq) => {
    // Dual oscillators with ±4 cents detune for lush analog chorusing
    [-4, 4].forEach((cents) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);
      osc.detune.setValueAtTime(cents, now);

      // Slow breathing filter sweep (240Hz -> 460Hz -> 220Hz)
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(240, now);
      filter.frequency.linearRampToValueAtTime(460, now + 2.2);
      filter.frequency.linearRampToValueAtTime(220, now + duration);

      // Slow breathing envelope: 1.8s attack, 2.0s sustain, gentle release
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.09, now + 1.8);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(destinationGain);

      osc.start(now);
      osc.stop(now + duration);
      registerOsc(osc);
    });
  });
}

// Track 5: Café Corner (Dm9 -> G13 -> Cmaj9 -> A7#9)
// Vintage 70s electric piano, cassette tape flutter, warm muted harmonics
const CAFE_CHORDS = [
  { sub: 73.42, notes: [174.61, 220.00, 261.63, 329.63] }, // Dm9
  { sub: 98.00, notes: [174.61, 246.94, 329.63, 440.00] }, // G13
  { sub: 65.41, notes: [164.81, 196.00, 246.94, 293.66] }, // Cmaj9
  { sub: 110.00, notes: [196.00, 277.18, 311.13, 392.00] } // A7#9
];

function playCafeChord(ctx, destinationGain, chord) {
  const now = ctx.currentTime;
  const duration = 3.8;

  // Vintage Cassette Wow/Flutter LFO
  const lfo = ctx.createOscillator();
  const lfoGain = ctx.createGain();
  lfo.type = 'sine';
  lfo.frequency.setValueAtTime(0.35, now);
  lfoGain.gain.setValueAtTime(4.2, now);
  lfo.connect(lfoGain);
  lfo.start(now);
  lfo.stop(now + duration + 0.1);
  registerOsc(lfo);

  // Sub bass
  const subOsc = ctx.createOscillator();
  const subGain = ctx.createGain();
  subOsc.type = 'sine';
  subOsc.frequency.setValueAtTime(chord.sub, now);
  subGain.gain.setValueAtTime(0.001, now);
  subGain.gain.linearRampToValueAtTime(0.18, now + 0.1);
  subGain.gain.exponentialRampToValueAtTime(0.001, now + duration);
  subOsc.connect(subGain);
  subGain.connect(destinationGain);
  subOsc.start(now);
  subOsc.stop(now + duration);
  registerOsc(subOsc);

  // Warm vintage keys with slight velocity randomization
  chord.notes.forEach((freq, idx) => {
    const noteStart = now + idx * 0.03;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, noteStart);
    lfoGain.connect(osc.detune);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(400, noteStart);
    filter.frequency.exponentialRampToValueAtTime(300, noteStart + duration);

    const noteVel = 0.12 + (Math.random() - 0.5) * 0.02;
    gain.gain.setValueAtTime(0.001, noteStart);
    gain.gain.linearRampToValueAtTime(noteVel, noteStart + 0.07);
    gain.gain.exponentialRampToValueAtTime(0.001, noteStart + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(destinationGain);

    osc.start(noteStart);
    osc.stop(noteStart + duration);
    registerOsc(osc);
  });
}

// Track 6: Sunbeam Drowse (Gmaj7 -> Cmaj9 -> Em9 -> Dadd9)
// Relaxed rolled picking arpeggios, warm acoustic tone, comforting golden warmth
const SUNBEAM_CHORDS = [
  [98.00, 146.83, 246.94, 293.66, 369.99], // Gmaj7
  [65.41, 130.81, 196.00, 246.94, 293.66], // Cmaj9
  [82.41, 123.47, 196.00, 293.66, 369.99], // Em9
  [73.42, 110.00, 185.00, 293.66, 329.63]  // Dadd9
];

function playSunbeamChord(ctx, destinationGain, notes) {
  const now = ctx.currentTime;
  const duration = 4.2;

  // Strum notes sequentially with lazy 55ms acoustic roll delay
  notes.forEach((freq, idx) => {
    const noteStart = now + idx * 0.055;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.type = idx === 0 ? 'sine' : 'triangle';
    osc.frequency.setValueAtTime(freq, noteStart);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(540, noteStart);
    filter.frequency.exponentialRampToValueAtTime(320, noteStart + (duration - idx * 0.055));

    gain.gain.setValueAtTime(0.001, noteStart);
    gain.gain.linearRampToValueAtTime(0.14, noteStart + 0.06);
    gain.gain.exponentialRampToValueAtTime(0.001, noteStart + (duration - idx * 0.055));

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(destinationGain);

    osc.start(noteStart);
    osc.stop(noteStart + duration);
    registerOsc(osc);
  });
}

// -------------------------------------------------------------
// MAIN AMBIENT ENGINE CONTROLS
// -------------------------------------------------------------
let chordIndex = 0;

export function setAmbientSound(type = 'none', volume = 0.25) {
  // Alias legacy 'lofi' to 'midnight'
  const resolvedType = type === 'lofi' ? 'midnight' : type;
  currentAmbientType = resolvedType;

  if (resolvedType === 'none' || volume <= 0) {
    stopAmbientSound();
    return;
  }

  const ctx = getAmbientContext();
  if (!ctx) return;

  stopAmbientSound();
  currentAmbientType = resolvedType;
  chordIndex = 0;

  ambientMasterGain = ctx.createGain();
  ambientMasterGain.gain.setValueAtTime(Math.max(0, volume * 0.35), ctx.currentTime);
  ambientMasterGain.connect(ctx.destination);

  if (resolvedType === 'rain') {
    startTextureNoise(ctx, ambientMasterGain, {
      type: 'rain',
      filterFreq: 820,
      filterQ: 0.6,
      gainVal: 0.35
    });
    scheduleRaindrops(ctx, ambientMasterGain);
  } else if (resolvedType === 'midnight') {
    startTextureNoise(ctx, ambientMasterGain, {
      type: 'vinyl',
      filterFreq: 400,
      filterQ: 0.9,
      gainVal: 0.14
    });
    playMidnightChord(ctx, ambientMasterGain, MIDNIGHT_CHORDS[0]);
    sequenceTimer = setInterval(() => {
      chordIndex = (chordIndex + 1) % MIDNIGHT_CHORDS.length;
      if (currentAmbientType === 'midnight' && ambientCtx && ambientMasterGain) {
        playMidnightChord(ambientCtx, ambientMasterGain, MIDNIGHT_CHORDS[chordIndex]);
      }
    }, 3800);
  } else if (resolvedType === 'afternoon') {
    startTextureNoise(ctx, ambientMasterGain, {
      type: 'vinyl',
      filterFreq: 460,
      filterQ: 0.8,
      gainVal: 0.12
    });
    playAfternoonChord(ctx, ambientMasterGain, AFTERNOON_CHORDS[0]);
    scheduleCelestaChimes(ctx, ambientMasterGain);
    sequenceTimer = setInterval(() => {
      chordIndex = (chordIndex + 1) % AFTERNOON_CHORDS.length;
      if (currentAmbientType === 'afternoon' && ambientCtx && ambientMasterGain) {
        playAfternoonChord(ambientCtx, ambientMasterGain, AFTERNOON_CHORDS[chordIndex]);
      }
    }, 3600);
  } else if (resolvedType === 'starlit') {
    startTextureNoise(ctx, ambientMasterGain, {
      type: 'vinyl',
      filterFreq: 320,
      filterQ: 0.7,
      gainVal: 0.08
    });
    playStarlitPad(ctx, ambientMasterGain, STARLIT_CHORDS[0]);
    sequenceTimer = setInterval(() => {
      chordIndex = (chordIndex + 1) % STARLIT_CHORDS.length;
      if (currentAmbientType === 'starlit' && ambientCtx && ambientMasterGain) {
        playStarlitPad(ambientCtx, ambientMasterGain, STARLIT_CHORDS[chordIndex]);
      }
    }, 5600);
  } else if (resolvedType === 'cafe') {
    startTextureNoise(ctx, ambientMasterGain, {
      type: 'vinyl',
      filterFreq: 380,
      filterQ: 1.0,
      gainVal: 0.16
    });
    playCafeChord(ctx, ambientMasterGain, CAFE_CHORDS[0]);
    sequenceTimer = setInterval(() => {
      chordIndex = (chordIndex + 1) % CAFE_CHORDS.length;
      if (currentAmbientType === 'cafe' && ambientCtx && ambientMasterGain) {
        playCafeChord(ambientCtx, ambientMasterGain, CAFE_CHORDS[chordIndex]);
      }
    }, 3800);
  } else if (resolvedType === 'sunbeam') {
    startTextureNoise(ctx, ambientMasterGain, {
      type: 'vinyl',
      filterFreq: 480,
      filterQ: 0.75,
      gainVal: 0.11
    });
    playSunbeamChord(ctx, ambientMasterGain, SUNBEAM_CHORDS[0]);
    sequenceTimer = setInterval(() => {
      chordIndex = (chordIndex + 1) % SUNBEAM_CHORDS.length;
      if (currentAmbientType === 'sunbeam' && ambientCtx && ambientMasterGain) {
        playSunbeamChord(ambientCtx, ambientMasterGain, SUNBEAM_CHORDS[chordIndex]);
      }
    }, 4200);
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
    ambientMasterGain.gain.setValueAtTime(Math.max(0, volume * 0.35), ctx.currentTime);
  }

  // Restore if stopped
  if (currentAmbientType !== 'none' && !activeNoiseSource && !sequenceTimer) {
    setAmbientSound(currentAmbientType, volume);
  }
}

export function stopAmbientSound() {
  if (sequenceTimer) {
    clearInterval(sequenceTimer);
    sequenceTimer = null;
  }

  if (embellishmentTimer) {
    clearTimeout(embellishmentTimer);
    embellishmentTimer = null;
  }

  activeOscillators.forEach((osc) => {
    try {
      osc.stop();
      osc.disconnect();
    } catch {
      // Ignored
    }
  });
  activeOscillators = [];

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
