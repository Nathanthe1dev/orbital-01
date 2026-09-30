import { eventBus } from '../core/EventBus.js';
import { soundFX } from '../core/SoundFX.js';

export class InspectorModalController {
  constructor() {
    this.modal = document.querySelector('#inspector-modal');
    this.closeBtn = document.querySelector('#inspector-close-btn');
    this.titleEl = document.querySelector('#inspector-title');
    this.typeEl = document.querySelector('#inspector-type');
    this.distanceEl = document.querySelector('#inspector-distance');
    this.detailsEl = document.querySelector('#inspector-details');

    this.initListeners();
  }

  initListeners() {
    if (!this.modal) return;

    if (this.closeBtn) {
      this.closeBtn.addEventListener('click', () => this.hide());
    }

    eventBus.on('target:inspect', (target) => {
      this.show(target);
    });

    eventBus.on('target:inspect_close', () => {
      this.hide();
    });
  }

  show(target) {
    if (!target || !this.modal) return;

    const data = target.userData || {};
    this.titleEl.textContent = data.name || 'UNIDENTIFIED OBJECT';
    this.typeEl.textContent = `CLASS: ${data.type || 'UNKNOWN MATRIX'}`;
    this.distanceEl.textContent = `DISTANCE: ${data.distance || 'CALCULATING...'}`;

    let detailsText = '';
    if (target.userData.name?.includes('FLAGSHIP')) {
      detailsText = 'PRIMARY VESSEL. Hull Integrity: 100%. Twin plasma thrusters operating at sub-light speed. Shield deflector grid standing by.';
    } else if (target.userData.name?.includes('CELESTIAL')) {
      detailsText = 'HABITABLE EXOPLANET (Kepler-186f). Atmosphere composed of Nitrogen-Oxygen. Magnetosphere stable. Surface liquid water detected.';
    } else if (target.userData.name?.includes('ANOMALY')) {
      detailsText = 'UNIDENTIFIED PULSE ANOMALY. Emitting high-frequency electromagnetic bursts at 14.82 GHz. Quantum origin unknown.';
    } else {
      detailsText = 'Tactical radar lock established. Telemetry streams active.';
    }

    this.detailsEl.textContent = detailsText;
    this.modal.classList.add('visible');
    soundFX.playTargetLock();
  }

  hide() {
    if (!this.modal) return;
    this.modal.classList.remove('visible');
  }
}