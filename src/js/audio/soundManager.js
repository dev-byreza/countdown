/**
 * Procedural Web Audio API Sound Synthesizer
 * 100% self-contained without external audio assets
 */

export class SoundManager {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.isMuted = false;
    this.volume = 0.5;
    this.currentAmbient = 'none'; // 'none' | 'space' | 'rain' | 'zen'
    this.ambientNodes = [];
    this.isInitialized = false;
  }

  init() {
    if (this.isInitialized) return;
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return;
      
      this.ctx = new AudioContextClass();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.volume, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
      this.isInitialized = true;
    } catch (e) {
      console.warn('AudioContext initialization failed:', e);
    }
  }

  ensureContext() {
    if (!this.isInitialized) {
      this.init();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  setVolume(val) {
    this.volume = Math.max(0, Math.min(1, val));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.volume, this.ctx.currentTime);
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.volume, this.ctx.currentTime);
    }
    return this.isMuted;
  }

  // --- TICK SOUND GENERATORS ---

  playTick(type = 'mechanical') {
    if (this.isMuted || !this.ctx) return;
    this.ensureContext();
    if (this.ctx.state !== 'running') return;

    const t = this.ctx.currentTime;

    switch (type) {
      case 'mechanical':
        this._playMechanicalTick(t);
        break;
      case 'blip':
        this._playCyberBlip(t);
        break;
      case 'pulse':
        this._playSubPulse(t);
        break;
      case 'soft':
        this._playSoftWood(t);
        break;
      default:
        break;
    }
  }

  _playMechanicalTick(t) {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(1400, t);
    osc.frequency.exponentialRampToValueAtTime(120, t + 0.025);

    filter.type = 'highpass';
    filter.frequency.setValueAtTime(800, t);

    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.03);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 0.035);
  }

  _playCyberBlip(t) {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, t);
    osc.frequency.exponentialRampToValueAtTime(1760, t + 0.04);

    gain.gain.setValueAtTime(0.25, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.05);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 0.05);
  }

  _playSubPulse(t) {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(120, t);
    osc.frequency.exponentialRampToValueAtTime(45, t + 0.08);

    gain.gain.setValueAtTime(0.4, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.09);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 0.09);
  }

  _playSoftWood(t) {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, t);
    osc.frequency.exponentialRampToValueAtTime(250, t + 0.03);

    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.04);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 0.04);
  }

  // --- CELEBRATION CHIME (ZERO MOMENT) ---

  playCelebration() {
    this.ensureContext();
    if (!this.ctx || this.isMuted) return;

    const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51]; // C Major arpeggio
    notes.forEach((freq, idx) => {
      const t = this.ctx.currentTime + idx * 0.12;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0.35, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 1.2);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(t);
      osc.stop(t + 1.3);
    });
  }

  // --- PROCEDURAL AMBIENT GENERATORS ---

  setAmbient(type) {
    this.stopAmbient();
    this.currentAmbient = type;
    if (type === 'none' || this.isMuted) return;

    this.ensureContext();
    if (this.ctx.state !== 'running') return;

    if (type === 'space') {
      this._startSpaceDrone();
    } else if (type === 'rain') {
      this._startRainNoise();
    } else if (type === 'zen') {
      this._startZenHarmonics();
    }
  }

  stopAmbient() {
    this.ambientNodes.forEach(node => {
      try {
        if (node.stop) node.stop();
        if (node.disconnect) node.disconnect();
      } catch (e) {}
    });
    this.ambientNodes = [];
  }

  _startSpaceDrone() {
    const t = this.ctx.currentTime;
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const lfo = this.ctx.createOscillator();
    const lfoGain = this.ctx.createGain();
    const gain = this.ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(80, t);

    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(83, t); // Binaural beat

    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(0.2, t); // Slow breathing LFO
    lfoGain.gain.setValueAtTime(0.03, t);

    lfo.connect(gain.gain);
    gain.gain.setValueAtTime(0.08, t);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.masterGain);

    osc1.start();
    osc2.start();
    lfo.start();

    this.ambientNodes.push(osc1, osc2, lfo, gain, lfoGain);
  }

  _startRainNoise() {
    // Generate pink noise buffer
    const bufferSize = 2 * this.ctx.sampleRate;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0;

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      output[i] = (b0 + b1 + b2) * 0.11;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(900, this.ctx.currentTime);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.08, this.ctx.currentTime);

    whiteNoise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    whiteNoise.start();
    this.ambientNodes.push(whiteNoise, filter, gain);
  }

  _startZenHarmonics() {
    const t = this.ctx.currentTime;
    const freqs = [216, 432, 648]; // 432Hz harmonics
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.05, t);

    freqs.forEach(f => {
      const osc = this.ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, t);
      osc.connect(gain);
      osc.start();
      this.ambientNodes.push(osc);
    });

    gain.connect(this.masterGain);
    this.ambientNodes.push(gain);
  }
}
