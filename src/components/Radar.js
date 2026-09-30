import * as THREE from 'three';

export class RadarController {
  constructor(canvasSelector, getContactsCallback, range = 35) {
    this.canvas = document.querySelector(canvasSelector);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.getContacts = getContactsCallback;
    this.range = range; // Max range in AU (covers asteroids up to 30 AU)
    this.visible = true;
    this.sweepAngle = 0;

    this.resizeCanvas();
  }

  resizeCanvas() {
    if (!this.canvas) return;
    this.canvas.width = 140;
    this.canvas.height = 140;
  }

  toggle() {
    this.visible = !this.visible;
    const container = document.querySelector('#radar-container');
    if (container) {
      container.style.display = this.visible ? 'flex' : 'none';
    }
  }

  update() {
    if (!this.visible || !this.ctx) return;

    const width = this.canvas.width;
    const height = this.canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = width / 2 - 6;

    // Clear Previous Frame
    this.ctx.clearRect(0, 0, width, height);

    // 1. Outer Radar Grid Circle
    this.ctx.beginPath();
    this.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    this.ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    this.ctx.fill();
    this.ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
    this.ctx.lineWidth = 1.5;
    this.ctx.stroke();

    // 2. Concentric Range Rings
    [0.33, 0.66].forEach((rRatio) => {
      this.ctx.beginPath();
      this.ctx.arc(centerX, centerY, radius * rRatio, 0, Math.PI * 2);
      this.ctx.strokeStyle = 'rgba(56, 189, 248, 0.15)';
      this.ctx.lineWidth = 1;
      this.ctx.stroke();
    });

    // 3. Tactical Crosshairs
    this.ctx.beginPath();
    this.ctx.moveTo(centerX, centerY - radius);
    this.ctx.lineTo(centerX, centerY + radius);
    this.ctx.moveTo(centerX - radius, centerY);
    this.ctx.lineTo(centerX + radius, centerY);
    this.ctx.strokeStyle = 'rgba(56, 189, 248, 0.2)';
    this.ctx.stroke();

    // 4. Rotating Radar Sweep Beam
    this.sweepAngle += 0.03;
    this.ctx.beginPath();
    this.ctx.moveTo(centerX, centerY);
    this.ctx.arc(
      centerX,
      centerY,
      radius,
      this.sweepAngle,
      this.sweepAngle + 0.35
    );
    this.ctx.closePath();
    const sweepGradient = this.ctx.createRadialGradient(
      centerX, centerY, 0,
      centerX, centerY, radius
    );
    sweepGradient.addColorStop(0, 'rgba(56, 189, 248, 0.25)');
    sweepGradient.addColorStop(1, 'rgba(56, 189, 248, 0.03)');
    this.ctx.fillStyle = sweepGradient;
    this.ctx.fill();

    // 5. Draw Target Contacts / Blips
    const contacts = this.getContacts ? this.getContacts() : [];
    const worldPos = new THREE.Vector3();

    contacts.forEach((contact) => {
      if (!contact.object || contact.object.visible === false) return;

      // Obtain global 3D world coordinates
      contact.object.getWorldPosition(worldPos);

      // Normalize coordinates against radar max range
      const normX = worldPos.x / this.range;
      const normZ = worldPos.z / this.range;

      const blipX = centerX + normX * radius;
      const blipY = centerY + normZ * radius;

      // Calculate distance from radar center
      const distFromCenter = Math.hypot(blipX - centerX, blipY - centerY);

      // Render blip if within radar circle bounds
      if (distFromCenter <= radius - 2) {
        this.ctx.beginPath();
        this.ctx.arc(blipX, blipY, contact.size || 3, 0, Math.PI * 2);
        this.ctx.fillStyle = contact.color || '#38bdf8';
        this.ctx.shadowColor = contact.color || '#38bdf8';
        this.ctx.shadowBlur = 6;
        this.ctx.fill();
        this.ctx.shadowBlur = 0; // Reset shadow for line passes
      }
    });
  }
}