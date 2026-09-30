import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import gsap from 'gsap';
import { createSpacecraft } from './scene/Spacecraft.js';
import { createPlanet } from './scene/Planet.js';
import { createAnomaly } from './scene/Anomaly.js';
import { createOrbitalTrajectories } from './scene/Trajectory.js';
import { createThrusterParticles } from './scene/ThrusterParticles.js';
import { createAsteroidField } from './scene/Asteroids.js';
import { PlasmaWeaponSystem } from './scene/Weapons.js';
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

// 1. WebGL Setup
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

const postProcessing = initPostProcessing(renderer, scene, camera);

eventBus.on('bloom:toggle', () => postProcessing.toggleBloom());
eventBus.on('bloom:intensity', (val) => postProcessing.setIntensity(val));

// 2. Controls & Lighting
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.dampingFactor = 0.05;

const ambientLight = new THREE.AmbientLight(0x0f172a, 1.5);
scene.add(ambientLight);

const sunLight = new THREE.DirectionalLight(0xffffff, 2.5);
sunLight.position.set(10, 10, 10);
scene.add(sunLight);

const rimLight = new THREE.DirectionalLight(0x38bdf8, 1.2);
rimLight.position.set(-10, -5, -10);
scene.add(rimLight);

// 3. Background Starfield
const starCount = 2500;
const starGeometry = new THREE.BufferGeometry();
const positions = new Float32Array(starCount * 3);
for (let i = 0; i < starCount * 3; i += 3) {
  positions[i] = (Math.random() - 0.5) * 200;
  positions[i + 1] = (Math.random() - 0.5) * 200;
  positions[i + 2] = (Math.random() - 0.5) * 200;
}
starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
const starfield = new THREE.Points(
  starGeometry,
  new THREE.PointsMaterial({ color: 0xffffff, size: 0.7, transparent: true, opacity: 0.8 })
);
scene.add(starfield);

// 4. Entities
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

let asteroidField = createAsteroidField(16);
scene.add(asteroidField);

// 5. Combat & Weapons System
const weaponSystem = new PlasmaWeaponSystem(scene, spacecraft);
let activeTargetLock = null;

eventBus.on('weapons:fire', () => weaponSystem.fire(activeTargetLock));
eventBus.on('weapons:engage_locked', () => {
  if (activeTargetLock) weaponSystem.fire(activeTargetLock);
  else HUDController.addLog('No target lock acquired for engagement.', 'alert');
});

eventBus.on('hazards:respawn', () => {
  scene.remove(asteroidField);
  asteroidField = createAsteroidField(16);
  scene.add(asteroidField);
});

// 6. Subsystems Initialization
const warpDrive = new WarpDriveManager(camera, starfield);
eventBus.on('warp:engage', () => warpDrive.engage());
eventBus.on('warp:disengage', () => warpDrive.disengage());
eventBus.on('thruster:boost', (mult) => thrusterParticles.userData.setBoost(mult));

// Radar Tracking Integration
const radar = new RadarController('#radar-canvas', () => {
  const contacts = [
    { object: spacecraft, color: '#38bdf8', size: 4 },
    { object: planet, color: '#22c55e', size: 5 },
    { object: anomaly, color: '#f59e0b', size: 3 }
  ];

  // Safely push visible asteroid hazards
  if (asteroidField && asteroidField.userData.asteroids) {
    asteroidField.userData.asteroids.forEach((ast) => {
      if (ast.visible) {
        contacts.push({ object: ast, color: '#ef4444', size: 2.5 });
      }
    });
  }

  return contacts;
}, 35); // 35 AU Range to fit 12-30 AU orbital paths

new InspectorModalController();

// 7. Raycaster & Target Selection
const interactiveObjects = [spacecraft, planet, anomaly, ...asteroidField.userData.asteroids];
initRaycaster(camera, canvas, interactiveObjects);

function focusTarget(target) {
  activeTargetLock = target;
  const targetPos = new THREE.Vector3();
  target.getWorldPosition(targetPos);

  const label = target.userData.name || 'UNKNOWN TARGET';
  HUDController.addLog(`[TARGET LOCK] Tracking: ${label}`, 'warning');
  store.setStatus(`TARGET LOCKED: ${label}`);

  gsap.to(controls.target, { x: targetPos.x, y: targetPos.y, z: targetPos.z, duration: 1.2 });
  gsap.to(camera.position, {
    x: targetPos.x + 1.5,
    y: targetPos.y + 1.0,
    z: targetPos.z + 3.5,
    duration: 1.2
  });
}

eventBus.on('target:selected', (target) => {
  focusTarget(target);
  eventBus.emit('target:inspect', target);
});

eventBus.on('camera:reset', () => {
  activeTargetLock = null;
  gsap.to(controls.target, { x: 0, y: 0, z: 0, duration: 1.2 });
  gsap.to(camera.position, { x: defaultCamPos.x, y: defaultCamPos.y, z: defaultCamPos.z, duration: 1.2 });
  store.setStatus('SYSTEM ONLINE');
});

// 8. Main Render Loop
new HUDController();
new TerminalController();

const telemetry = new TelemetryEngine();
telemetry.start();

HUDController.addLog('Plasma defense system & asteroid threat field online.', 'info');

const clock = new THREE.Clock();

function animate() {
  const delta = clock.getDelta();
  const elapsedTime = clock.getElapsedTime();

  controls.update();
  spacecraft.userData.update(elapsedTime);
  thrusterParticles.userData.update(elapsedTime);
  planet.userData.update(elapsedTime);
  anomaly.userData.update(elapsedTime);
  trajectories.userData.update(elapsedTime);
  asteroidField.userData.update(delta);
  weaponSystem.update(delta, asteroidField.userData.asteroids);
  radar.update();

  postProcessing.composer.render();
  requestAnimationFrame(animate);
}

animate();