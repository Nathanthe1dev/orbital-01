import { audioEngine } from '../core/AudioEngine.js';

export class AudioVisualizerController {
  constructor(canvasSelector) {
    this.canvas = document.querySelector(canvasSelector);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.visible = true;

    this.canvas.width = 160;
    this.canvas.height = 36;
  }

  update() {
    if (!this.visible || !this.canvas || !this.ctx) return;

    const width = this.canvas.width;
    const height = this.canvas.height;
    const freqData = audioEngine.getFrequencyData();

    this.ctx.clearRect(0, 0, width, height);

    const barCount = 20;
    const barWidth = width / barCount - 2;

    for (let i = 0; i < barCount; i++) {
      // Read frequency bin or generate subtle baseline pulse if audio inactive
      const rawVal = freqData[i] || Math.sin(Date.now() * 0.005 + i * 0.4) * 8 + 12;
      const barHeight = (rawVal / 255) * height;

      const x = i * (barWidth + 2);
      const y = height - barHeight;

      // Cyan to magenta spectral color gradient
      const hue = 190 + (i / barCount) * 60;
      this.ctx.fillStyle = `hsl(${hue}, 90%, 60%)`;
      this.ctx.fillRect(x, y, barWidth, barHeight);
    }
  }
}