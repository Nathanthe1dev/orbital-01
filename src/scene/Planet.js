import * as THREE from 'three';

export function createPlanet() {
  const planetGroup = new THREE.Group();

  // Planet Surface Sphere
  const planetGeo = new THREE.SphereGeometry(3.5, 32, 32);
  const planetMat = new THREE.MeshStandardMaterial({
    color: 0x0f2b48,
    roughness: 0.7,
    metalness: 0.2,
    wireframe: false
  });
  const planet = new THREE.Mesh(planetGeo, planetMat);
  planetGroup.add(planet);

  // Surface Topography Overlay (Segment Grid for Tech/Aerospace Look)
  const topoGeo = new THREE.SphereGeometry(3.52, 24, 24);
  const topoMat = new THREE.MeshBasicMaterial({
    color: 0x38bdf8,
    wireframe: true,
    transparent: true,
    opacity: 0.08
  });
  const topoMesh = new THREE.Mesh(topoGeo, topoMat);
  planetGroup.add(topoMesh);

  // Atmospheric Glow Layer
  const atmosphereGeo = new THREE.SphereGeometry(3.8, 32, 32);
  const atmosphereMat = new THREE.MeshBasicMaterial({
    color: 0x0284c7,
    transparent: true,
    opacity: 0.15,
    side: THREE.BackSide
  });
  const atmosphere = new THREE.Mesh(atmosphereGeo, atmosphereMat);
  planetGroup.add(atmosphere);

  // Position the planet distant background right
  planetGroup.position.set(7, -2, -12);

  planetGroup.userData = {
    update: (elapsedTime) => {
      // Slow axis rotation
      planet.rotation.y = elapsedTime * 0.03;
      topoMesh.rotation.y = elapsedTime * 0.03;
      topoMesh.rotation.x = elapsedTime * 0.01;
    }
  };

  return planetGroup;
}