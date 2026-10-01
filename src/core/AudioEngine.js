import { eventBus } from './EventBus.js';

class AudioEngine {
  constructor() {
    this.ctx = null;
    this.analyser = null;
    this.dataArray = null;
    this.masterGain = null;
    this.engineOsc = null;
    this.engineGain = null;
    this.isMuted = false;
    this.initialized = false;
  }

  init() {
    if (this.initialized) return;

    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContextClass();

      // 1. Master Spectrum Analyser Node
      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 64; // 32 frequency bins
      this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);

      // 2. Master Gain
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.4, this.ctx.currentTime);
      this.masterGain.connect(this.analyser);
      this.analyser.connect(this.ctx.destination);

      // 3. Ambient Ship Engine Rumble (Continuous Low-Pass Sawtooth)
      this.startEngineHum();
      this.initialized = true;
    } catch (e) {
      console.warn('Web Audio API not supported in this browser.', e);
    }
  }

  startEngineHum() {
    if (!this.ctx) return;

    this.engineOsc = this.ctx.createOscillator();
    this.engineGain = this.ctx.createGain();

    this.engineOsc.type = 'sawtooth';
    this.engineOsc.frequency.setValueAtTime(40, this.ctx.currentTime); // Low 40Hz sub hum

    // Filter out harsh high harmonics
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(110, this.ctx.currentTime);

    this.engineGain.gain.setValueAtTime(0.08, this.ctx.currentTime);

    this.engineOsc.connect(filter);
    filter.connect(this.engineGain);
    this.engineGain.connect(this.masterGain);

    this.engineOsc.start();
  }

  updateEnginePitch(velocityMagnitude) {
    if (!this.initialized || !this.engineOsc) return;
    // Modulate engine pitch from 40Hz base up to 120Hz based on speed
    const targetFreq = 40 + Math.min(80, velocityMagnitude * 3.5);
    this.engineOsc.frequency.setTargetAtTime(targetFreq, this.ctx.currentTime, 0.1);
  }

  playLaser() {
    if (!this.initialized) this.init();
    if (this.isMuted || !this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(950, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(120, this.ctx.currentTime + 0.18);

    gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.18);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.18);
  }

  playExplosion() {
    if (!this.initialized) this.init();
    if (this.isMuted || !this.ctx) return;

    // Sub-bass thump
    const subOsc = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();

    subOsc.type = 'triangle';
    subOsc.frequency.setValueAtTime(160, this.ctx.currentTime);
    subOsc.frequency.exponentialRampToValueAtTime(25, this.ctx.currentTime + 0.5);

    subGain.gain.setValueAtTime(0.6, this.ctx.currentTime);
    subGain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.5);

    subOsc.connect(subGain);
    subGain.connect(this.masterGain);

    subOsc.start();
    subOsc.stop(this.ctx.currentTime + 0.5);
  }

  playTargetLock() {
    if (!this.initialized) this.init();
    if (this.isMuted || !this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1200, this.ctx.currentTime);
    osc.frequency.setValueAtTime(1600, this.ctx.currentTime + 0.05);

    gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.12);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.12);
  }

  getFrequencyData() {
    if (!this.analyser || !this.dataArray) return new Uint8Array(0);
    this.analyser.getByteFrequencyData(this.dataArray);
    return this.dataArray;
  }

  setVolume(val) {
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(Math.max(0, Math.min(1.0, val)), this.ctx.currentTime);
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.4, this.ctx.currentTime);
    }
    return this.isMuted;
  }
}

export const audioEngine = new AudioEngine();

// Auto-initialize audio engine on first user click or keypress
const unlockAudio = () => {
  audioEngine.init();
  window.removeEventListener('click', unlockAudio);
  window.removeEventListener('keydown', unlockAudio);
};
window.addEventListener('click', unlockAudio);
window.addEventListener('keydown', unlockAudio);