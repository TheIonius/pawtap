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

// -------------------------------------------------------------
// TRACK 2: Midnight Cocoa — Mellow Lo-Fi Chillhop Groove (75 BPM)
// Head-bobbing lofi beat with soft felt kick, tape rim-clicks, and neo-soul keys
// -------------------------------------------------------------
const MIDNIGHT_CHORDS = [
  { bass: 58.27, notes: [174.61, 207.65, 261.63, 277.18] }, // Bbm9 (Bb1 bass, F3, Ab3, C4, Db4)
  { bass: 46.25, notes: [174.61, 207.65, 233.08, 277.18] }, // Gbmaj9 (Gb1 bass, F3, Ab3, Bb3, Db4)
  { bass: 38.89, notes: [185.00, 233.08, 277.18, 349.23] }, // Ebm9 (Eb1 bass, F#3, Bb3, Db4, F4)
  { bass: 43.65, notes: [174.61, 220.00, 261.63, 311.13] }  // F7alt (F1 bass, F3, A3, C4, Eb4)
];

function playLofiKick(ctx, dest, time) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.frequency.setValueAtTime(80, time);
  osc.frequency.exponentialRampToValueAtTime(32, time + 0.11);
  gain.gain.setValueAtTime(0.001, time);
  gain.gain.linearRampToValueAtTime(0.22, time + 0.008);
  gain.gain.exponentialRampToValueAtTime(0.001, time + 0.16);
  osc.connect(gain);
  gain.connect(dest);
  osc.start(time);
  osc.stop(time + 0.18);
  registerOsc(osc);
}

function playLofiRim(ctx, dest, time) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const filter = ctx.createBiquadFilter();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(420, time);
  osc.frequency.exponentialRampToValueAtTime(160, time + 0.035);
  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(1800, time);
  filter.Q.setValueAtTime(1.5, time);
  gain.gain.setValueAtTime(0.001, time);
  gain.gain.linearRampToValueAtTime(0.09, time + 0.004);
  gain.gain.exponentialRampToValueAtTime(0.001, time + 0.045);
  osc.connect(filter);
  filter.connect(gain);
  gain.connect(dest);
  osc.start(time);
  osc.stop(time + 0.05);
  registerOsc(osc);
}

function playMidnightBar(ctx, dest, chord) {
  const now = ctx.currentTime;

  // 1. Drum groove: Beat 1 (kick), Beat 2 (rim), Beat 2.5 (kick), Beat 4 (rim)
  playLofiKick(ctx, dest, now);
  playLofiRim(ctx, dest, now + 0.8);
  playLofiKick(ctx, dest, now + 1.2);
  playLofiRim(ctx, dest, now + 2.4);

  // 2. Sub bass note on beat 1 and beat 2.5
  [0, 1.2].forEach((offset) => {
    const bassOsc = ctx.createOscillator();
    const bassGain = ctx.createGain();
    const bassFilter = ctx.createBiquadFilter();
    bassOsc.type = 'sine';
    bassOsc.frequency.setValueAtTime(chord.bass, now + offset);
    bassFilter.type = 'lowpass';
    bassFilter.frequency.setValueAtTime(130, now + offset);
    bassGain.gain.setValueAtTime(0.001, now + offset);
    bassGain.gain.linearRampToValueAtTime(0.18, now + offset + 0.06);
    bassGain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.9);
    bassOsc.connect(bassFilter);
    bassFilter.connect(bassGain);
    bassGain.connect(dest);
    bassOsc.start(now + offset);
    bassOsc.stop(now + offset + 0.95);
    registerOsc(bassOsc);
  });

  // 3. Rhodes chord on beat 1 (long) & syncopated tap on beat 2.5
  [
    { offset: 0, dur: 1.6, vel: 0.12 },
    { offset: 1.2, dur: 1.8, vel: 0.09 }
  ].forEach(({ offset, dur, vel }) => {
    chord.notes.forEach((freq, idx) => {
      const noteStart = now + offset + idx * 0.02;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, noteStart);
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(450, noteStart);
      filter.frequency.exponentialRampToValueAtTime(320, noteStart + dur);
      gain.gain.setValueAtTime(0.001, noteStart);
      gain.gain.linearRampToValueAtTime(vel, noteStart + 0.06);
      gain.gain.exponentialRampToValueAtTime(0.001, noteStart + dur);
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(dest);
      osc.start(noteStart);
      osc.stop(noteStart + dur);
      registerOsc(osc);
    });
  });
}

// -------------------------------------------------------------
// TRACK 3: Afternoon Reverie — Sunny Bossa Nova Acoustic Guitar
// Breezy Brazilian nylon guitar with syncopated comping & alternating bass
// -------------------------------------------------------------
const AFTERNOON_CHORDS = [
  { root: 73.42, fifth: 110.00, notes: [185.00, 220.00, 277.18, 329.63] }, // Dmaj9 (D2, A2 | F#3, A3, C#4, E4)
  { root: 61.74, fifth: 92.50, notes: [185.00, 220.00, 293.66, 369.99] },  // Bm9 (B1, F#2 | F#3, A3, D4, F#4)
  { root: 82.41, fifth: 123.47, notes: [196.00, 246.94, 293.66, 369.99] }, // Em9 (E2, B2 | G3, B3, D4, F#4)
  { root: 55.00, fifth: 82.41, notes: [196.00, 277.18, 369.99, 493.88] }   // A13 (A1, E2 | G3, C#4, F#4, B4)
];

function playNylonNote(ctx, dest, freq, time, duration = 0.55, velocity = 0.12) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const filter = ctx.createBiquadFilter();

  osc.type = 'triangle';
  osc.frequency.setValueAtTime(freq, time);

  // Resonant nylon acoustic body filter
  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(680, time);
  filter.Q.setValueAtTime(1.4, time);

  gain.gain.setValueAtTime(0.001, time);
  gain.gain.linearRampToValueAtTime(velocity, time + 0.008);
  gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(dest);

  osc.start(time);
  osc.stop(time + duration + 0.02);
  registerOsc(osc);
}

function playAfternoonBossaBar(ctx, dest, chord) {
  const now = ctx.currentTime;
  // Bossa nova groove over 2.4s (100 BPM)
  // Bass: Root on beat 1 (t=0), Fifth on beat 3 (t=1.2)
  playNylonNote(ctx, dest, chord.root, now, 0.7, 0.18);
  playNylonNote(ctx, dest, chord.fifth, now + 1.2, 0.7, 0.16);

  // Syncopated nylon chord plucks: beat 1 (0s), beat 1.75 (0.45s), beat 2.5 (0.9s), beat 3.5 (1.5s), beat 4.25 (1.95s)
  const compTimes = [0, 0.45, 0.9, 1.5, 1.95];
  compTimes.forEach((offset, cIdx) => {
    chord.notes.forEach((freq, nIdx) => {
      const noteTime = now + offset + nIdx * 0.012; // Finger roll
      const vel = cIdx === 0 || cIdx === 2 ? 0.09 : 0.065;
      playNylonNote(ctx, dest, freq, noteTime, 0.45, vel);
    });
  });
}

// -------------------------------------------------------------
// TRACK 4: Starlit Nap — Celestial Ambient Float & Shimmer Chimes
// Deep meditative Lydian pad drone with drifting crystal bells (zero drums)
// -------------------------------------------------------------
const STARLIT_DRONE_FREQS = [36.71, 55.00, 73.42, 110.00, 185.00]; // Open D-A-F# celestial drone
const CELESTIAL_SCALE = [587.33, 659.25, 739.99, 830.61, 880.00, 987.77, 1174.66]; // D Lydian bells

function playStarlitDrone(ctx, dest) {
  const now = ctx.currentTime;
  const duration = 7.0;

  STARLIT_DRONE_FREQS.forEach((freq) => {
    [-3.5, 3.5].forEach((cents) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);
      osc.detune.setValueAtTime(cents, now);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(180, now);
      filter.frequency.linearRampToValueAtTime(380, now + 3.2);
      filter.frequency.linearRampToValueAtTime(190, now + duration);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.08, now + 2.5);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(dest);

      osc.start(now);
      osc.stop(now + duration);
      registerOsc(osc);
    });
  });
}

function scheduleCelestialChimes(ctx, dest) {
  function spawnChime() {
    if (currentAmbientType !== 'starlit' || !ambientCtx) return;
    const now = ctx.currentTime;
    const note = CELESTIAL_SCALE[Math.floor(Math.random() * CELESTIAL_SCALE.length)];

    // Fundamental bell
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(note, now);
    gain1.gain.setValueAtTime(0.001, now);
    gain1.gain.linearRampToValueAtTime(0.045, now + 0.015);
    gain1.gain.exponentialRampToValueAtTime(0.0001, now + 2.8);
    osc1.connect(gain1);
    gain1.connect(dest);
    osc1.start(now);
    osc1.stop(now + 2.9);
    registerOsc(osc1);

    // Shimmer harmonic (2x)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(note * 2, now);
    gain2.gain.setValueAtTime(0.001, now);
    gain2.gain.linearRampToValueAtTime(0.016, now + 0.01);
    gain2.gain.exponentialRampToValueAtTime(0.0001, now + 1.6);
    osc2.connect(gain2);
    gain2.connect(dest);
    osc2.start(now);
    osc2.stop(now + 1.7);
    registerOsc(osc2);

    embellishmentTimer = setTimeout(spawnChime, 1800 + Math.random() * 2400);
  }
  embellishmentTimer = setTimeout(spawnChime, 800);
}

// -------------------------------------------------------------
// TRACK 5: Café Corner (Dm9 -> G13 -> Cmaj9 -> A7#9) [UNTOUCHED]
// Vintage 70s electric piano, cassette tape flutter, warm muted harmonics
// -------------------------------------------------------------
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

// -------------------------------------------------------------
// TRACK 6: Sunbeam Drowse — Acoustic Fingerstyle Folk Waltz (3/4)
// Intimate picked acoustic guitar in golden 3/4 waltz time (One-two-three)
// -------------------------------------------------------------
const SUNBEAM_WALTZ = [
  { bass: 65.41, dyad1: [164.81, 246.94], dyad2: [196.00, 293.66] }, // Cmaj7 (C2 bass, E3+B3, G3+D4)
  { bass: 55.00, dyad1: [130.81, 196.00], dyad2: [164.81, 246.94] }, // Am9 (A1 bass, C3+G3, E3+B3)
  { bass: 43.65, dyad1: [110.00, 164.81], dyad2: [130.81, 196.00] }, // Fmaj7 (F1 bass, A2+E3, C3+G3)
  { bass: 49.00, dyad1: [123.47, 164.81], dyad2: [146.83, 220.00] }  // G6add9 (G1 bass, B2+E3, D3+A3)
];

function playAcousticPluck(ctx, dest, freq, time, duration = 0.6, velocity = 0.11) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const filter = ctx.createBiquadFilter();

  osc.type = 'triangle';
  osc.frequency.setValueAtTime(freq, time);

  // Warm acoustic body resonance
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(560, time);
  filter.frequency.exponentialRampToValueAtTime(320, time + duration);

  gain.gain.setValueAtTime(0.001, time);
  gain.gain.linearRampToValueAtTime(velocity, time + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(dest);

  osc.start(time);
  osc.stop(time + duration + 0.02);
  registerOsc(osc);
}

function playSunbeamMeasure(ctx, dest, measure) {
  const now = ctx.currentTime;
  const beat = 0.65; // ~92 BPM 3/4 waltz (0.65s per beat, 1.95s per measure)

  // Beat 1: Thumbed bass note
  playAcousticPluck(ctx, dest, measure.bass, now, 1.2, 0.18);

  // Beat 2: Plucked mid dyad
  measure.dyad1.forEach((freq, idx) => {
    playAcousticPluck(ctx, dest, freq, now + beat + idx * 0.018, 0.7, 0.08);
  });

  // Beat 3: Plucked high dyad
  measure.dyad2.forEach((freq, idx) => {
    playAcousticPluck(ctx, dest, freq, now + beat * 2 + idx * 0.018, 0.7, 0.075);
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
      gainVal: 0.12
    });
    playMidnightBar(ctx, ambientMasterGain, MIDNIGHT_CHORDS[0]);
    sequenceTimer = setInterval(() => {
      chordIndex = (chordIndex + 1) % MIDNIGHT_CHORDS.length;
      if (currentAmbientType === 'midnight' && ambientCtx && ambientMasterGain) {
        playMidnightBar(ambientCtx, ambientMasterGain, MIDNIGHT_CHORDS[chordIndex]);
      }
    }, 3200);
  } else if (resolvedType === 'afternoon') {
    startTextureNoise(ctx, ambientMasterGain, {
      type: 'vinyl',
      filterFreq: 460,
      filterQ: 0.8,
      gainVal: 0.09
    });
    playAfternoonBossaBar(ctx, ambientMasterGain, AFTERNOON_CHORDS[0]);
    sequenceTimer = setInterval(() => {
      chordIndex = (chordIndex + 1) % AFTERNOON_CHORDS.length;
      if (currentAmbientType === 'afternoon' && ambientCtx && ambientMasterGain) {
        playAfternoonBossaBar(ambientCtx, ambientMasterGain, AFTERNOON_CHORDS[chordIndex]);
      }
    }, 2400);
  } else if (resolvedType === 'starlit') {
    startTextureNoise(ctx, ambientMasterGain, {
      type: 'vinyl',
      filterFreq: 260,
      filterQ: 0.6,
      gainVal: 0.06
    });
    playStarlitDrone(ctx, ambientMasterGain);
    scheduleCelestialChimes(ctx, ambientMasterGain);
    sequenceTimer = setInterval(() => {
      if (currentAmbientType === 'starlit' && ambientCtx && ambientMasterGain) {
        playStarlitDrone(ambientCtx, ambientMasterGain);
      }
    }, 7000);
  } else if (resolvedType === 'cafe') {
    // 100% UNTOUCHED
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
      gainVal: 0.08
    });
    playSunbeamMeasure(ctx, ambientMasterGain, SUNBEAM_WALTZ[0]);
    sequenceTimer = setInterval(() => {
      chordIndex = (chordIndex + 1) % SUNBEAM_WALTZ.length;
      if (currentAmbientType === 'sunbeam' && ambientCtx && ambientMasterGain) {
        playSunbeamMeasure(ambientCtx, ambientMasterGain, SUNBEAM_WALTZ[chordIndex]);
      }
    }, 1950);
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
