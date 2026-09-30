import gsap from 'gsap';
import { eventBus } from '../core/EventBus.js';
import { store } from '../core/State.js';
import { HUDController } from '../components/HUD.js';

export class WarpDriveManager {
  constructor(camera, starfield) {
    this.camera = camera;
    this.starfield = starfield;
    this.isWarping = false;
  }

  engage() {
    if (this.isWarping) return;
    this.isWarping = true;

    store.setStatus('HYPERDRIVE ENGAGED // WARP 9');
    HUDController.addLog('[WARP] Initiating warp core ignition. Field geometry expanding...', 'warning');

    // FOV Surge
    gsap.to(this.camera, {
      fov: 110,
      duration: 1.2,
      ease: 'power3.inOut',
      onUpdate: () => this.camera.updateProjectionMatrix()
    });

    // Stretch Starfield
    gsap.to(this.starfield.scale, {
      z: 15,
      x: 0.3,
      y: 0.3,
      duration: 1.2,
      ease: 'power3.inOut'
    });

    eventBus.emit('warp:started');
  }

  disengage() {
    if (!this.isWarping) return;
    this.isWarping = false;

    store.setStatus('SYSTEM ONLINE');
    HUDController.addLog('[WARP] Dropping out of warp velocity into tactical grid.', 'info');

    // Restore Camera FOV
    gsap.to(this.camera, {
      fov: 60,
      duration: 0.8,
      ease: 'back.out(1.4)',
      onUpdate: () => this.camera.updateProjectionMatrix()
    });

    // Restore Starfield Scale
    gsap.to(this.starfield.scale, {
      x: 1, y: 1, z: 1,
      duration: 0.8,
      ease: 'power2.out'
    });

    eventBus.emit('warp:ended');
  }
}