import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import gsap from 'gsap';
import { createSpacecraft } from './scene/Spacecraft.js';
import { createPlanet } from './scene/Planet.js';
import { createAnomaly } from './scene/Anomaly.js';
import { TelemetryEngine } from './simulation/Telemetry.js';
import { HUDController } from './components/HUD.js';
import { TerminalController } from './components/Terminal.js';
import { initRaycaster } from './core/Raycaster.js';
import { eventBus } from './core/EventBus.js';
import { store } from './core/State.js';

// 1. WebGL Canvas & Scene Setup
const canvas = document.querySelector('#webgl-canvas');
const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
const defaultCamPos = { x: 0, y: 1.5, z: 5 };
camera.position.set(defaultCamPos.x, defaultCamPos.y, defaultCamPos.z);

const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true,
  powerPreference: 'high-performance'
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// 2. Camera Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.dampingFactor = 0.05;

// 3. Lighting
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

// 5. Instantiate Entities
const spacecraft = createSpacecraft();
spacecraft.userData.name = 'ORBITAL-01 (FLAGSHIP)';
scene.add(spacecraft);

const planet = createPlanet();
planet.userData.name = 'KEPLER-186F (CELESTIAL)';
scene.add(planet);

const anomaly = createAnomaly();
scene.add(anomaly);

// 6. Raycasting Interactivity
const interactiveObjects = [spacecraft, planet, anomaly];
initRaycaster(camera, canvas, interactiveObjects);

// Function to focus camera on target
function focusTarget(target) {
  const targetPos = new THREE.Vector3();
  target.getWorldPosition(targetPos);

  const label = target.userData.name || 'UNKNOWN TARGET';
  HUDController.addLog(`[TARGET LOCK] Tracking: ${label}`, 'warning');
  store.setStatus(`TARGET LOCKED: ${label}`);

  gsap.to(controls.target, {
    x: targetPos.x,
    y: targetPos.y,
    z: targetPos.z,
    duration: 1.5,
    ease: 'power2.out'
  });

  gsap.to(camera.position, {
    x: targetPos.x + 1.5,
    y: targetPos.y + 1.0,
    z: targetPos.z + 3.5,
    duration: 1.5,
    ease: 'power2.out'
  });
}

eventBus.on('target:selected', (target) => {
  focusTarget(target);
});

eventBus.on('target:lock_by_name', (query) => {
  const q = query.toLowerCase();
  if (q.includes('ship')) focusTarget(spacecraft);
  else if (q.includes('planet')) focusTarget(planet);
  else if (q.includes('anomaly')) focusTarget(anomaly);
  else HUDController.addLog(`Target '${query}' not recognized in radar range.`, 'alert');
});

eventBus.on('camera:reset', () => {
  gsap.to(controls.target, { x: 0, y: 0, z: 0, duration: 1.5, ease: 'power2.out' });
  gsap.to(camera.position, {
    x: defaultCamPos.x,
    y: defaultCamPos.y,
    z: defaultCamPos.z,
    duration: 1.5,
    ease: 'power2.out'
  });
});

// Wire 3D actions
eventBus.on('ship:rotate', () => spacecraft.userData.rotateShip());
eventBus.on('shields:updated', (active) => spacecraft.userData.toggleShields(active));

// Resize Handler
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

// 7. Initialize Modules
new HUDController();
new TerminalController();

const telemetry = new TelemetryEngine();
telemetry.start();

HUDController.addLog('Tactical radar raycaster online. Click any 3D object to lock target.', 'info');

// 8. Render Loop
const clock = new THREE.Clock();

function animate() {
  const elapsedTime = clock.getElapsedTime();

  controls.update();
  spacecraft.userData.update(elapsedTime);
  planet.userData.update(elapsedTime);
  anomaly.userData.update(elapsedTime);

  starfield.rotation.y = elapsedTime * 0.005;

  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

animate();