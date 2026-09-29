export class HUDController {
  constructor() {
    this.startTime = Date.now();
    this.clockElement = document.querySelector('#met-clock');
    
    // Start live Mission Elapsed Time (MET) counter tick
    this.initClock();
  }

  initClock() {
    setInterval(() => {
      const elapsedMs = Date.now() - this.startTime;
      
      const totalSeconds = Math.floor(elapsedMs / 1000);
      const hours = String(Math.floor(totalSeconds / 3600)).padStart(3, '0');
      const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
      const seconds = String(totalSeconds % 60).padStart(2, '0');
      const millis = String(Math.floor((elapsedMs % 1000) / 10)).padStart(2, '0');

      if (this.clockElement) {
        this.clockElement.textContent = `${hours}:${minutes}:${seconds}:${millis}`;
      }
    }, 50);
  }

  // Dynamic gauge bar updater helper
  static updateGauge(key, valuePercent, formattedText) {
    const valElem = document.querySelector(`#val-${key}`);
    const barElem = document.querySelector(`#bar-${key}`);

    if (valElem) valElem.textContent = formattedText || `${valuePercent.toFixed(1)}%`;
    if (barElem) barElem.style.width = `${Math.min(100, Math.max(0, valuePercent))}%`;
  }

  // Add a log entry to the terminal panel
  static addLog(message, type = 'info') {
    const terminal = document.querySelector('#terminal-output');
    if (!terminal) return;

    const log = document.createElement('div');
    log.className = `log-line ${type}`;
    log.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;

    terminal.appendChild(log);
    terminal.scrollTop = terminal.scrollHeight; // Auto-scroll to latest log
  }
}