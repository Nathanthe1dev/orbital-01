import * as THREE from 'three';

export function createThrusterParticles() {
  const particleCount = 150;
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);
  const opacities = new Float32Array(particleCount);
  const velocities = [];

  for (let i = 0; i < particleCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 0.2;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 0.2;
    positions[i * 3 + 2] = -1.2 - Math.random() * 0.5;

    opacities[i] = Math.random();
    velocities.push({
      x: (Math.random() - 0.5) * 0.02,
      y: (Math.random() - 0.5) * 0.02,
      z: -(0.05 + Math.random() * 0.1)
    });
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('opacity', new THREE.BufferAttribute(opacities, 1));

  const material = new THREE.PointsMaterial({
    color: 0x38bdf8,
    size: 0.15,
    transparent: true,
    opacity: 0.8,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });

  const particles = new THREE.Points(geometry, material);
  let boostMultiplier = 1.0;

  particles.userData = {
    setBoost: (multiplier) => {
      boostMultiplier = multiplier;
      material.color.setHex(multiplier > 1.5 ? 0xef4444 : 0x38bdf8);
    },
    update: (elapsedTime) => {
      const posAttr = geometry.attributes.position;
      const posArray = posAttr.array;

      for (let i = 0; i < particleCount; i++) {
        const idx = i * 3;
        posArray[idx + 2] += velocities[i].z * boostMultiplier;

        // Reset particle when it travels too far back
        if (posArray[idx + 2] < -3.5 * boostMultiplier) {
          posArray[idx] = (Math.random() - 0.5) * 0.2;
          posArray[idx + 1] = (Math.random() - 0.5) * 0.2;
          posArray[idx + 2] = -1.2;
        }
      }
      posAttr.needsUpdate = true;
    }
  };

  return particles;
}