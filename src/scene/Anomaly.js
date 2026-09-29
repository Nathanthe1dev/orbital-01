import * as THREE from 'three';

export function createAnomaly() {
  const group = new THREE.Group();

  // Outer wireframe octahedron structure
  const geo = new THREE.OctahedronGeometry(0.8, 0);
  const mat = new THREE.MeshStandardMaterial({
    color: 0xf59e0b,
    wireframe: true,
    emissive: 0xd97706,
    emissiveIntensity: 0.5,
  });
  const mesh = new THREE.Mesh(geo, mat);
  group.add(mesh);

  // Inner glowing energy core
  const coreGeo = new THREE.SphereGeometry(0.3, 16, 16);
  const coreMat = new THREE.MeshBasicMaterial({
    color: 0xfcb316,
  });
  const core = new THREE.Mesh(coreGeo, coreMat);
  group.add(core);

  // Orbital position near planet
  group.position.set(3.5, 1.2, -7.0);
  group.name = 'ANOMALY_X1';

  group.userData = {
    name: 'ANOMALY-X1 (DEEP SPACE PULSE)',
    type: 'UNIDENTIFIED PROBE',
    distance: '7.82 AU',
    update: (elapsedTime) => {
      mesh.rotation.x = elapsedTime * 0.5;
      mesh.rotation.y = elapsedTime * 0.8;
      group.position.y = 1.2 + Math.sin(elapsedTime * 1.2) * 0.2;
    }
  };

  return group;
}