import { store } from '../core/State.js';

export class TelemetryEngine {
  constructor() {
    this.intervalId = null;
  }

  start() {
    // Run continuous simulation tick every 1.5 seconds
    this.intervalId = setInterval(() => this.tick(), 1500);
  }

  stop() {
    if (this.intervalId) clearInterval(this.intervalId);
  }

  tick() {
    const state = store.get();
    const current = state.telemetry;

    // 1. Slow fuel consumption drift
    const newFuel = current.fuel - 0.02;

    // 2. Core power minor oscillation (random walk math)
    const powerDrift = (Math.random() - 0.5) * 0.1;
    const newPower = current.power + powerDrift;

    // 3. Oxygen slow usage
    const newOxygen = current.oxygen - 0.01;

    // 4. Signal strength fluctuation
    const signalDrift = (Math.random() - 0.48) * 0.8;
    const newSignal = current.signal + signalDrift;

    // 5. Temperature minor variance
    const tempDrift = (Math.random() - 0.5) * 0.3;
    const newTemp = current.temp + tempDrift;

    // Commit updates to store (triggers EventBus events)
    store.updateTelemetry('fuel', newFuel);
    store.updateTelemetry('power', newPower);
    store.updateTelemetry('oxygen', newOxygen);
    store.updateTelemetry('signal', newSignal);
    store.updateTelemetry('temp', newTemp);
  }
}