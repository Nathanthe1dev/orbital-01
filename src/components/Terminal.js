import { CommandProcessor } from '../simulation/Commands.js';

export class TerminalController {
  constructor() {
    this.form = document.querySelector('#terminal-form');
    this.input = document.querySelector('#terminal-input');
    this.history = [];
    this.historyIndex = -1;

    this.initListeners();
  }

  initListeners() {
    if (!this.form || !this.input) return;

    this.form.addEventListener('submit', (e) => {
      e.preventDefault();
      const command = this.input.value;

      if (command.trim()) {
        this.history.push(command);
        this.historyIndex = this.history.length;
        CommandProcessor.execute(command);
        this.input.value = '';
      }
    });

    // Arrow key command history navigation (Up / Down)
    this.input.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (this.historyIndex > 0) {
          this.historyIndex--;
          this.input.value = this.history[this.historyIndex];
        }
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (this.historyIndex < this.history.length - 1) {
          this.historyIndex++;
          this.input.value = this.history[this.historyIndex];
        } else {
          this.historyIndex = this.history.length;
          this.input.value = '';
        }
      }
    });
  }
}