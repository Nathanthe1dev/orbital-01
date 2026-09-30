import * as THREE from 'three';
import { eventBus } from '../core/EventBus.js';
import { store } from '../core/State.js';

export class FlightController {
  constructor(shipMesh, camera, controls) {
    this.ship = shipMesh;
    this.camera = camera;
    this.controls = controls;

    this.enabled = false;

    // Linear & Rotational Motion States
    this.velocity = new THREE.Vector3();
    this.angularVelocity = new THREE.Vector3();

    // Flight Tuning Parameters
    this.acceleration = 12.0;
    this.maxSpeed = 45.0;
    this.drag = 0.98; // Space inertia damping
    this.rotSpeed = 1.8;

    // Key State Matrix
    this.keys = {
      forward: false,
      backward: false,
      left: false,
      right: false,
      up: false,
      down: false,
      rollLeft: false,
      rollRight: false
    };

    this.initKeyListeners();
    this.initEvents();
  }

  initKeyListeners() {
    window.addEventListener('keydown', (e) => {
      if (!this.enabled || e.target.tagName === 'INPUT') return;
      this.setKey(e.code, true);
    });

    window.addEventListener('keyup', (e) => {
      if (!this.enabled || e.target.tagName === 'INPUT') return;
      this.setKey(e.code, false);
    });
  }

  setKey(code, isPressed) {
    switch (code) {
      case 'KeyW': this.keys.forward = isPressed; break;
      case 'KeyS': this.keys.backward = isPressed; break;
      case 'KeyA': this.keys.left = isPressed; break;
      case 'KeyD': this.keys.right = isPressed; break;
      case 'Space': this.keys.up = isPressed; break;
      case 'KeyC':
      case 'ShiftLeft': this.keys.down = isPressed; break;
      case 'KeyQ': this.keys.rollLeft = isPressed; break;
      case 'KeyE': this.keys.rollRight = isPressed; break;
    }
  }

  initEvents() {
    eventBus.on('flight:manual_toggle', (enable) => {
      this.enabled = enable !== undefined ? enable : !this.enabled;
      if (this.controls) this.controls.enabled = !this.enabled; // Disable orbit control in manual mode
      
      if (this.enabled) {
        store.setStatus('MANUAL FLIGHT MODE ENGAGED');
      } else {
        store.setStatus('SYSTEM ONLINE');
        this.velocity.set(0, 0, 0);
      }
    });

    eventBus.on('flight:halt', () => {
      this.velocity.set(0, 0, 0);
      this.angularVelocity.set(0, 0, 0);
    });
  }

  update(delta) {
    if (!this.ship) return;

    if (this.enabled) {
      // Compute Direction Vectors based on current ship orientation
      const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(this.ship.quaternion);
      const right = new THREE.Vector3(1, 0, 0).applyQuaternion(this.ship.quaternion);
      const up = new THREE.Vector3(0, 1, 0).applyQuaternion(this.ship.quaternion);

      // Apply Thrust Accelerations
      if (this.keys.forward) this.velocity.addScaledVector(forward, this.acceleration * delta);
      if (this.keys.backward) this.velocity.addScaledVector(forward, -this.acceleration * 0.5 * delta);
      if (this.keys.left) this.velocity.addScaledVector(right, -this.acceleration * 0.6 * delta);
      if (this.keys.right) this.velocity.addScaledVector(right, this.acceleration * 0.6 * delta);
      if (this.keys.up) this.velocity.addScaledVector(up, this.acceleration * 0.6 * delta);
      if (this.keys.down) this.velocity.addScaledVector(up, -this.acceleration * 0.6 * delta);

      // Apply Rotations (Yaw / Pitch / Roll)
      if (this.keys.rollLeft) this.ship.rotateZ(this.rotSpeed * delta);
      if (this.keys.rollRight) this.ship.rotateZ(-this.rotSpeed * delta);

      // Speed Clamp
      this.velocity.clampLength(0, this.maxSpeed);

      // Apply Inertial Drag
      this.velocity.multiplyScalar(this.drag);

      // Update Position
      this.ship.position.addScaledVector(this.velocity, delta);

      // Dynamic Camera Follow Mode
      if (this.camera) {
        const camOffset = new THREE.Vector3(0, 2.0, 6.0).applyQuaternion(this.ship.quaternion);
        const targetCamPos = this.ship.position.clone().add(camOffset);
        this.camera.position.lerp(targetCamPos, 0.1);
        this.camera.lookAt(this.ship.position);
      }

      // Emit Thruster State for Particles
      const activeThrust = this.keys.forward ? 2.2 : (this.velocity.length() > 0.5 ? 1.0 : 0.2);
      eventBus.emit('thruster:boost', activeThrust);

      // Live Telemetry Speed Output (convert internal speed to KM/H)
      const currentKmH = Math.round(28400 + this.velocity.length() * 450);
      store.updateTelemetry('speed', `${currentKmH.toLocaleString()} KM/H`);
    }
  }
}