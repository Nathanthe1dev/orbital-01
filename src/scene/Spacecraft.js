import * as THREE from 'three';

export function createSpacecraft() {
  const shipGroup = new THREE.Group();

  // Common Materials
  const hullMaterial = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    metalness: 0.8,
    roughness: 0.2,
  });

  const detailMaterial = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    metalness: 0.5,
    roughness: 0.3,
  });

  const panelMaterial = new THREE.MeshStandardMaterial({
    color: 0x0f172a,
    roughness: 0.1,
    metalness: 0.9,
  });

  const engineGlowMaterial = new THREE.MeshBasicMaterial({
    color: 0x00f0ff,
    transparent: true,
    opacity: 0.85,
  });

  // 1. Central Hull / Fuselage
  const hullGeo = new THREE.CylinderGeometry(0.3, 0.45, 2.2, 8);
  const hull = new THREE.Mesh(hullGeo, hullMaterial);
  hull.rotation.x = Math.PI / 2; // Orient along Z axis
  shipGroup.add(hull);

  // 2. Command Nose Cone
  const noseGeo = new THREE.ConeGeometry(0.3, 0.8, 8);
  const nose = new THREE.Mesh(noseGeo, detailMaterial);
  nose.rotation.x = -Math.PI / 2;
  nose.position.z = 1.5;
  shipGroup.add(nose);

  // 3. Solar Panel Wings (Port & Starboard)
  const wingGeo = new THREE.BoxGeometry(2.8, 0.04, 0.6);
  const wings = new THREE.Mesh(wingGeo, panelMaterial);
  wings.position.set(0, 0, -0.2);
  shipGroup.add(wings);

  // Solar Wing Framing Details
  const wingFrameGeo = new THREE.BoxGeometry(2.85, 0.06, 0.08);
  const wingFrame = new THREE.Mesh(wingFrameGeo, detailMaterial);
  wingFrame.position.set(0, 0, -0.2);
  shipGroup.add(wingFrame);

  // 4. Engine Nozzle
  const engineGeo = new THREE.CylinderGeometry(0.35, 0.2, 0.4, 8);
  const engine = new THREE.Mesh(engineGeo, hullMaterial);
  engine.rotation.x = Math.PI / 2;
  engine.position.z = -1.3;
  shipGroup.add(engine);

  // 5. Plasma Thruster Engine Glow
  const glowGeo = new THREE.ConeGeometry(0.28, 0.9, 8);
  const glow = new THREE.Mesh(glowGeo, engineGlowMaterial);
  glow.rotation.x = -Math.PI / 2;
  glow.position.z = -1.8;
  shipGroup.add(glow);

  // Scale overall vessel to fit scene
  shipGroup.scale.set(0.8, 0.8, 0.8);

  // Animation handler for floating pitch/yaw motion
  shipGroup.userData = {
    update: (elapsedTime) => {
      // Subtle hover motion in micro-gravity
      shipGroup.position.y = Math.sin(elapsedTime * 0.8) * 0.12;
      shipGroup.rotation.z = Math.sin(elapsedTime * 0.5) * 0.04;
      shipGroup.rotation.y = Math.cos(elapsedTime * 0.3) * 0.03;

      // Pulse engine glow opacity
      engineGlowMaterial.opacity = 0.7 + Math.sin(elapsedTime * 6) * 0.2;
    }
  };

  return shipGroup;
}