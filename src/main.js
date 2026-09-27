import * as THREE from 'three';

// 1. Scene, Camera & Renderer Setup
const canvas = document.querySelector('#webgl-canvas');
const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(0, 0, 5);

const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true,
  powerPreference: 'high-performance'
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// 2. Deep Space Procedural Starfield
const starCount = 2500;
const starGeometry = new THREE.BufferGeometry();
const positions = new Float32Array(starCount * 3);

for (let i = 0; i < starCount * 3; i += 3) {
  positions[i] = (Math.random() - 0.5) * 200;     // X axis spread
  positions[i + 1] = (Math.random() - 0.5) * 200; // Y axis spread
  positions[i + 2] = (Math.random() - 0.5) * 200; // Z axis spread
}

starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

const starMaterial = new THREE.PointsMaterial({
  color: 0xffffff,
  size: 0.7,
  transparent: true,
  opacity: 0.8,
  sizeAttenuation: true
});

const starfield = new THREE.Points(starGeometry, starMaterial);
scene.add(starfield);

// 3. Handle Responsive Window Resizing
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

// 4. Render Loop
const clock = new THREE.Clock();

function animate() {
  const elapsedTime = clock.getElapsedTime();

  // Slow drift rotation for space depth effect
  starfield.rotation.y = elapsedTime * 0.008;
  starfield.rotation.x = elapsedTime * 0.004;

  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

animate();
console.log('ORBITAL-01 // Core WebGL Engine Initialized');