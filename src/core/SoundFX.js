import { eventBus } from './EventBus.js';

class SoundFXEngine {
  constructor() {
    this.ctx = null;
    this.muted = false;
    this.alarmInterval = null;

    // Initialize AudioContext on user's first click or keystroke to bypass browser autoplay restrictions
    const initAudio = () => {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        this.ctx = new AudioCtx();
        window.removeEventListener('click', initAudio);
        window.removeEventListener('keydown', initAudio);
      } else if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    };

    window.addEventListener('click', initAudio);
    window.addEventListener('keydown', initAudio);

    this.setupSubscriptions();
  }

  playKeypress() {
    if (this.muted || !this.ctx) return;
    
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(800 + Math.random() * 200, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(300, this.ctx.currentTime + 0.03);

    gain.gain.setValueAtTime(0.05, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.03);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.03);
  }

  playTargetLock() {
    if (this.muted || !this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.setValueAtTime(880, now + 0.08);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(now + 0.25);
  }

  playShieldToggle(active) {
    if (this.muted || !this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    if (active) {
      osc.frequency.setValueAtTime(120, now);
      osc.frequency.exponentialRampToValueAtTime(480, now + 0.3);
    } else {
      osc.frequency.setValueAtTime(480, now);
      osc.frequency.exponentialRampToValueAtTime(120, now + 0.3);
    }

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(now + 0.3);
  }

  startAlarm() {
    if (this.alarmInterval || this.muted) return;

    const pulse = () => {
      if (!this.ctx || this.muted) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(660, now);
      osc.frequency.exponentialRampToValueAtTime(440, now + 0.35);

      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(now + 0.35);
    };

    pulse();
    this.alarmInterval = setInterval(pulse, 800);
  }

  stopAlarm() {
    if (this.alarmInterval) {
      clearInterval(this.alarmInterval);
      this.alarmInterval = null;
    }
  }

  setupSubscriptions() {
    eventBus.on('target:selected', () => this.playTargetLock());
    eventBus.on('target:lock_by_name', () => this.playTargetLock());
    eventBus.on('shields:updated', (active) => this.playShieldToggle(active));
    eventBus.on('alert:start', () => this.startAlarm());
    eventBus.on('alert:clear', () => this.stopAlarm());
  }
}

export const soundFX = new SoundFXEngine();