import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { createSpacecraft } from './scene/Spacecraft.js';
import { createPlanet } from './scene/Planet.js';
import { TelemetryEngine } from './simulation/Telemetry.js';
import { HUDController } from './components/HUD.js';
import { TerminalController } from './components/Terminal.js';
import { eventBus } from './core/EventBus.js';

// 1. WebGL Canvas & Scene Setup
const canvas = document.querySelector('#webgl-canvas');
const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(0, 1.5, 5);

const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true,
  powerPreference: 'high-performance'
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// 2. Camera Orbit Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.minDistance = 2;
controls.maxDistance = 25;

// 3. Lights
const ambientLight = new THREE.AmbientLight(0x0f172a, 1.5);
scene.add(ambientLight);

const sunLight = new THREE.DirectionalLight(0xffffff, 2.5);
sunLight.position.set(10, 10, 10);
scene.add(sunLight);

const rimLight = new THREE.DirectionalLight(0x38bdf8, 1.2);
rimLight.position.set(-10, -5, -10);
scene.add(rimLight);

// 4. Starfield
const starCount = 2500;
const starGeometry = new THREE.BufferGeometry();
const positions = new Float32Array(starCount * 3);

for (let i = 0; i < starCount * 3; i += 3) {
  positions[i] = (Math.random() - 0.5) * 200;
  positions[i + 1] = (Math.random() - 0.5) * 200;
  positions[i + 2] = (Math.random() - 0.5) * 200;
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

// 5. Instantiate Spacecraft & Planet
const spacecraft = createSpacecraft();
scene.add(spacecraft);

const planet = createPlanet();
scene.add(planet);

// Wire 3D actions to EventBus events
eventBus.on('ship:rotate', () => {
  spacecraft.userData.rotateShip();
});

eventBus.on('shields:updated', (active) => {
  spacecraft.userData.toggleShields(active);
});

// 6. Window Resize Handler
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

// 7. Initialize Modules
const hud = new HUDController();
const terminal = new TerminalController();

const telemetry = new TelemetryEngine();
telemetry.start();

HUDController.addLog('Live telemetry and command terminal ready.', 'info');

// 8. Render Loop
const clock = new THREE.Clock();

function animate() {
  const elapsedTime = clock.getElapsedTime();

  controls.update();
  spacecraft.userData.update(elapsedTime);
  planet.userData.update(elapsedTime);

  starfield.rotation.y = elapsedTime * 0.005;

  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

animate();