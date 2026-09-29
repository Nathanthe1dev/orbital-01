import { store } from '../core/State.js';

export class TelemetryEngine {
  constructor() {
    this.intervalId = null;
  }

  start() {
    this.intervalId = setInterval(() => this.tick(), 1500);
  }

  stop() {
    if (this.intervalId) clearInterval(this.intervalId);
  }

  tick() {
    const state = store.get();
    const current = state.telemetry;

    const newFuel = current.fuel - 0.02;
    const powerDrift = (Math.random() - 0.5) * 0.1;
    const newPower = current.power + powerDrift;
    const newOxygen = current.oxygen - 0.01;
    const signalDrift = (Math.random() - 0.48) * 0.8;
    const newSignal = current.signal + signalDrift;
    const tempDrift = (Math.random() - 0.5) * 0.3;
    const newTemp = current.temp + tempDrift;

    store.updateTelemetry('fuel', newFuel);
    store.updateTelemetry('power', newPower);
    store.updateTelemetry('oxygen', newOxygen);
    store.updateTelemetry('signal', newSignal);
    store.updateTelemetry('temp', newTemp);
  }
}