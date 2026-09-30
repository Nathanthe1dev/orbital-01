import * as THREE from 'three';

export function createAsteroidField(count = 20) {
  const group = new THREE.Group();
  group.name = 'ASTEROID_FIELD';
  const asteroids = [];

  const baseGeometry = new THREE.DodecahedronGeometry(1, 1);
  const asteroidMaterial = new THREE.MeshStandardMaterial({
    color: 0x64748b,
    roughness: 0.9,
    metalness: 0.1,
    flatShading: true
  });

  for (let i = 0; i < count; i++) {
    // Deform geometry for organic rock appearance
    const geometry = baseGeometry.clone();
    const posAttr = geometry.attributes.position;
    for (let j = 0; j < posAttr.count; j++) {
      const x = posAttr.getX(j);
      const y = posAttr.getY(j);
      const z = posAttr.getZ(j);
      const noise = (Math.random() - 0.5) * 0.35;
      posAttr.setXYZ(j, x + noise, y + noise, z + noise);
    }
    geometry.computeVertexNormals();

    const mesh = new THREE.Mesh(geometry, asteroidMaterial);

    // Position in orbital ring around center
    const radius = 12 + Math.random() * 18;
    const angle = Math.random() * Math.PI * 2;
    const height = (Math.random() - 0.5) * 8;

    mesh.position.set(
      Math.cos(angle) * radius,
      height,
      Math.sin(angle) * radius
    );

    const scale = 0.4 + Math.random() * 1.2;
    mesh.scale.set(scale, scale, scale);

    mesh.userData = {
      id: `HAZARD-${i + 1}`,
      name: `ASTEROID HAZARD Alpha-${i + 1}`,
      type: 'SPACE DEBRIS / HAZARD',
      health: 100,
      orbitSpeed: (0.05 + Math.random() * 0.1) * (Math.random() > 0.5 ? 1 : -1),
      rotSpeed: {
        x: (Math.random() - 0.5) * 0.02,
        y: (Math.random() - 0.5) * 0.02,
        z: (Math.random() - 0.5) * 0.02
      },
      distance: `${radius.toFixed(2)} AU`
    };

    group.add(mesh);
    asteroids.push(mesh);
  }

  group.userData = {
    asteroids,
    update: (delta) => {
      asteroids.forEach((ast) => {
        if (!ast.visible) return;
        // Rotate rock around its own center
        ast.rotation.x += ast.userData.rotSpeed.x;
        ast.rotation.y += ast.userData.rotSpeed.y;
        ast.rotation.z += ast.userData.rotSpeed.z;

        // Orbit around center point
        const currentRadius = Math.sqrt(ast.position.x ** 2 + ast.position.z ** 2);
        let currentAngle = Math.atan2(ast.position.z, ast.position.x);
        currentAngle += ast.userData.orbitSpeed * delta * 0.1;

        ast.position.x = Math.cos(currentAngle) * currentRadius;
        ast.position.z = Math.sin(currentAngle) * currentRadius;
      });
    }
  };

  return group;
}