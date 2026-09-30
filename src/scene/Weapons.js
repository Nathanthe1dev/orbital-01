import * as THREE from 'three';
import { eventBus } from '../core/EventBus.js';
import { soundFX } from '../core/SoundFX.js';
import { HUDController } from '../components/HUD.js';

export class PlasmaWeaponSystem {
  constructor(scene, shipMesh) {
    this.scene = scene;
    this.shipMesh = shipMesh;
    this.projectiles = [];
    this.explosions = [];

    // Projectile Geometry & Glowing Material
    this.boltGeometry = new THREE.CylinderGeometry(0.04, 0.04, 0.6, 8);
    this.boltGeometry.rotateX(Math.PI / 2); // Align with forward vector
    this.boltMaterial = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.9
    });
  }

  fire(targetMesh = null) {
    if (!this.shipMesh) return;

    const startPos = new THREE.Vector3();
    this.shipMesh.getWorldPosition(startPos);

    const projectile = new THREE.Mesh(this.boltGeometry, this.boltMaterial.clone());
    projectile.position.copy(startPos);

    let direction = new THREE.Vector3();

    if (targetMesh && targetMesh.visible) {
      const targetPos = new THREE.Vector3();
      targetMesh.getWorldPosition(targetPos);
      direction.subVectors(targetPos, startPos).normalize();
    } else {
      // Default forward trajectory
      this.shipMesh.getWorldDirection(direction);
      direction.negate(); // Align with ship facing direction
    }

    projectile.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, -1), direction);

    this.projectiles.push({
      mesh: projectile,
      direction: direction,
      speed: 28.0,
      lifespan: 2.5,
      target: targetMesh
    });

    this.scene.add(projectile);
    soundFX.playWarpEngage(); // Trigger energy release sound
    HUDController.addLog('[WEAPONS] Plasma cannon discharged.', 'warning');
  }

  createExplosion(position) {
    const particleCount = 18;
    const geom = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const velocities = [];

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = position.x;
      positions[i * 3 + 1] = position.y;
      positions[i * 3 + 2] = position.z;

      velocities.push(
        new THREE.Vector3(
          (Math.random() - 0.5) * 4,
          (Math.random() - 0.5) * 4,
          (Math.random() - 0.5) * 4
        )
      );
    }

    geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const mat = new THREE.PointsMaterial({
      color: 0xf59e0b,
      size: 0.25,
      transparent: true,
      opacity: 1.0
    });

    const pSystem = new THREE.Points(geom, mat);
    this.scene.add(pSystem);

    this.explosions.push({
      system: pSystem,
      velocities,
      life: 0.6
    });
  }

  update(delta, targetables = []) {
    // Update Projectiles
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i];
      p.lifespan -= delta;

      p.mesh.position.addScaledVector(p.direction, p.speed * delta);

      // Hit detection against targetables
      let hit = false;
      for (const target of targetables) {
        if (!target.visible) continue;
        const targetPos = new THREE.Vector3();
        target.getWorldPosition(targetPos);

        if (p.mesh.position.distanceTo(targetPos) < 1.2) {
          hit = true;
          this.createExplosion(p.mesh.position);

          if (target.userData && target.userData.health !== undefined) {
            target.userData.health -= 50;
            HUDController.addLog(`[IMPACT] Direct hit on ${target.userData.name}! Health: ${target.userData.health}%`, 'alert');

            if (target.userData.health <= 0) {
              target.visible = false;
              HUDController.addLog(`[DESTROYED] Threat target ${target.userData.name} neutralized.`, 'success');
            }
          }
          break;
        }
      }

      if (hit || p.lifespan <= 0) {
        this.scene.remove(p.mesh);
        p.mesh.geometry.dispose();
        this.projectiles.splice(i, 1);
      }
    }

    // Update Explosion Particles
    for (let i = this.explosions.length - 1; i >= 0; i--) {
      const exp = this.explosions[i];
      exp.life -= delta;

      const positions = exp.system.geometry.attributes.position.array;
      for (let j = 0; j < exp.velocities.length; j++) {
        positions[j * 3] += exp.velocities[j].x * delta;
        positions[j * 3 + 1] += exp.velocities[j].y * delta;
        positions[j * 3 + 2] += exp.velocities[j].z * delta;
      }
      exp.system.geometry.attributes.position.needsUpdate = true;
      exp.system.material.opacity = exp.life / 0.6;

      if (exp.life <= 0) {
        this.scene.remove(exp.system);
        exp.system.geometry.dispose();
        this.explosions.splice(i, 1);
      }
    }
  }
}