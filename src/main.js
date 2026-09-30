import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import gsap from 'gsap';
import { createSpacecraft } from './scene/Spacecraft.js';
import { createPlanet } from './scene/Planet.js';
import { createAnomaly } from './scene/Anomaly.js';
import { createOrbitalTrajectories } from './scene/Trajectory.js';
import { createThrusterParticles } from './scene/ThrusterParticles.js';
import { TelemetryEngine } from './simulation/Telemetry.js';
import { HUDController } from './components/HUD.js';
import { TerminalController } from './components/Terminal.js';
import { RadarController } from './components/Radar.js';
import { InspectorModalController } from './components/InspectorModal.js';
import { WarpDriveManager } from './simulation/WarpDrive.js';
import { initPostProcessing } from './core/PostProcessing.js';
import { initRaycaster } from './core/Raycaster.js';
import { eventBus } from './core/EventBus.js';
import { store } from './core/State.js';
import './core/SoundFX.js';

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

// Post-Processing Bloom Engine
const postProcessing = initPostProcessing(renderer, scene, camera);

eventBus.on('bloom:toggle', () => {
  const active = postProcessing.toggleBloom();
  HUDController.addLog(`[VISUALS] Post-processing bloom ${active ? 'ENABLED' : 'DISABLED'}`, 'info');
});

eventBus.on('bloom:intensity', (val) => {
  postProcessing.setIntensity(val);
});

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
spacecraft.userData.type = 'EXPLORATION CRUISER';
spacecraft.userData.distance = '0.00 AU';
scene.add(spacecraft);

const thrusterParticles = createThrusterParticles();
spacecraft.add(thrusterParticles);

const planet = createPlanet();
planet.userData.name = 'KEPLER-186F (CELESTIAL)';
planet.userData.type = 'TERRESTRIAL EXOPLANET';
planet.userData.distance = '14.82 AU';
scene.add(planet);

const anomaly = createAnomaly();
scene.add(anomaly);

const trajectories = createOrbitalTrajectories();
scene.add(trajectories);

// 6. Systems Initialization
const warpDrive = new WarpDriveManager(camera, starfield);
eventBus.on('warp:engage', () => warpDrive.engage());
eventBus.on('warp:disengage', () => warpDrive.disengage());
eventBus.on('thruster:boost', (mult) => thrusterParticles.userData.setBoost(mult));

const radar = new RadarController('#radar-canvas', () => [
  { object: spacecraft, color: '#38bdf8', size: 4 },
  { object: planet, color: '#22c55e', size: 6 },
  { object: anomaly, color: '#f59e0b', size: 3 }
]);
eventBus.on('radar:toggle', () => radar.toggle());

new InspectorModalController();

// Inspector commands trigger
eventBus.on('target:inspect_by_name', (query) => {
  const q = query.toLowerCase();
  if (q.includes('ship')) eventBus.emit('target:inspect', spacecraft);
  else if (q.includes('planet')) eventBus.emit('target:inspect', planet);
  else if (q.includes('anomaly')) eventBus.emit('target:inspect', anomaly);
  else HUDController.addLog(`Inspection target '${query}' not found in tactical range.`, 'alert');
});

// 7. Raycasting Interactivity
const interactiveObjects = [spacecraft, planet, anomaly];
initRaycaster(camera, canvas, interactiveObjects);

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
  eventBus.emit('target:inspect', target); // Open modal on target click
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

eventBus.on('ship:rotate', () => spacecraft.userData.rotateShip());
eventBus.on('shields:updated', (active) => spacecraft.userData.toggleShields(active));

// Resize Handler
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  postProcessing.resize(window.innerWidth, window.innerHeight);
});

// 8. Initialize Modules & Render Loop
new HUDController();
new TerminalController();

const telemetry = new TelemetryEngine();
telemetry.start();

HUDController.addLog('Unreal Bloom post-processing and Target Inspector modal online.', 'info');

const clock = new THREE.Clock();

function animate() {
  const elapsedTime = clock.getElapsedTime();

  controls.update();
  spacecraft.userData.update(elapsedTime);
  thrusterParticles.userData.update(elapsedTime);
  planet.userData.update(elapsedTime);
  anomaly.userData.update(elapsedTime);
  trajectories.userData.update(elapsedTime);
  radar.update();

  if (!warpDrive.isWarping) {
    starfield.rotation.y = elapsedTime * 0.005;
  }

  // Render through EffectComposer instead of standard renderer
  postProcessing.composer.render();
  requestAnimationFrame(animate);
}

animate();