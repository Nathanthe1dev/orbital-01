import { eventBus } from './EventBus.js';

export const initialState = {
  status: 'SYSTEM ONLINE',
  telemetry: {
    hull: 100.0,
    power: 98.4,
    fuel: 84.2,
    signal: 42.0,
    oxygen: 99.1,
    temp: 294.2, // Kelvin
  },
  shieldsActive: false,
  diagnosticsRunning: false
};

class StateStore {
  constructor() {
    this.state = JSON.parse(JSON.stringify(initialState));
  }

  get() {
    return this.state;
  }

  updateTelemetry(key, value) {
    // Clamp values between safe bounds
    if (key === 'temp') {
      this.state.telemetry.temp = Math.max(100, Math.min(500, value));
    } else {
      this.state.telemetry[key] = Math.max(0, Math.min(100, value));
    }

    eventBus.emit('telemetry:updated', {
      key,
      value: this.state.telemetry[key],
      telemetry: this.state.telemetry
    });
  }

  setStatus(newStatus) {
    this.state.status = newStatus;
    eventBus.emit('status:updated', newStatus);
  }
}

export const store = new StateStore();