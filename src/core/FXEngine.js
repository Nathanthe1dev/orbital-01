import gsap from 'gsap';

export class FXEngine {
  constructor(camera) {
    this.camera = camera;
    this.originalCamPos = camera.position.clone();
    this.overlayEl = document.querySelector('#fx-overlay');

    if (!this.overlayEl) {
      this.overlayEl = document.createElement('div');
      this.overlayEl.id = 'fx-overlay';
      document.body.appendChild(this.overlayEl);
    }
  }

  shake(intensity = 0.25, duration = 0.4) {
    if (!this.camera) return;

    const basePos = { x: this.camera.position.x, y: this.camera.position.y, z: this.camera.position.z };

    gsap.to(this.camera.position, {
      x: basePos.x + (Math.random() - 0.5) * intensity,
      y: basePos.y + (Math.random() - 0.5) * intensity,
      z: basePos.z + (Math.random() - 0.5) * intensity,
      duration: 0.05,
      repeat: Math.floor(duration / 0.05),
      yoyo: true,
      onComplete: () => {
        gsap.to(this.camera.position, {
          x: basePos.x,
          y: basePos.y,
          z: basePos.z,
          duration: 0.1
        });
      }
    });
  }

  triggerDamageFlash() {
    if (!this.overlayEl) return;
    this.overlayEl.style.background = 'radial-gradient(circle, rgba(239, 68, 68, 0.4) 0%, rgba(239, 68, 68, 0) 80%)';
    this.overlayEl.style.opacity = '1';

    gsap.to(this.overlayEl.style, {
      opacity: '0',
      duration: 0.6,
      ease: 'power2.out'
    });
  }

  setAlertState(active) {
    if (!this.overlayEl) return;
    if (active) {
      this.overlayEl.style.background = 'radial-gradient(circle, rgba(239, 68, 68, 0.2) 0%, rgba(15, 23, 42, 0.8) 90%)';
      this.overlayEl.style.opacity = '1';
      this.overlayEl.classList.add('pulse-alert');
    } else {
      this.overlayEl.classList.remove('pulse-alert');
      this.overlayEl.style.opacity = '0';
    }
  }
}