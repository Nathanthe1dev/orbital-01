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
import { FlightController } from './simulation/FlightController.js';
import { TelemetryEngine } from './simulation/Telemetry.js';
import { MissionManager } from './simulation/MissionManager.js';
import { HUDController } from './components/HUD.js';
import { TerminalController } from './components/Terminal.js';
import { RadarController } from './components/Radar.js';
import { InspectorModalController } from './components/InspectorModal.js';
import { AudioVisualizerController } from './components/AudioVisualizer.js';
import { WarpDriveManager } from './simulation/WarpDrive.js';
import { initPostProcessing } from './core/PostProcessing.js';
import { initRaycaster } from './core/Raycaster.js';
import { StorageEngine } from './core/Storage.js';
import { audioEngine } from './core/AudioEngine.js';
import { FXEngine } from './core/FXEngine.js';
import { PerformanceOptimizer } from './core/Optimizer.js';
import { eventBus } from './core/EventBus.js';
import { store } from './core/State.js';

// 1. WebGL & Renderer Setup
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
PerformanceOptimizer.configureRenderer(renderer);

const postProcessing = initPostProcessing(renderer, scene, camera);
const fxEngine = new FXEngine(camera);

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

// 3. Starfield
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

// 5. Flight, Weapons & FX Integration
const flightController = new FlightController(spacecraft, camera, controls);
const weaponSystem = new PlasmaWeaponSystem(scene, spacecraft);
const missionManager = new MissionManager();
let activeTargetLock = null;

eventBus.on('weapons:fire', () => {
  weaponSystem.fire(activeTargetLock);
  audioEngine.playLaser();
  fxEngine.shake(0.12, 0.2);
});

eventBus.on('weapons:engage_locked', () => {
  if (activeTargetLock) {
    weaponSystem.fire(activeTargetLock);
    audioEngine.playLaser();
    fxEngine.shake(0.15, 0.25);
  } else {
    HUDController.addLog('No target lock acquired for engagement.', 'alert');
  }
});

eventBus.on('hazard:destroyed', () => {
  audioEngine.playExplosion();
  fxEngine.shake(0.35, 0.4);
  fxEngine.triggerDamageFlash();
});

eventBus.on('red_alert:toggle', (active) => {
  fxEngine.setAlertState(active);
});

// Storage System Listeners
eventBus.on('state:save', () => StorageEngine.save(missionManager));
eventBus.on('state:load', () => StorageEngine.load(missionManager));
StorageEngine.load(missionManager);
missionManager.updateHUDWidget();

// 6. Subsystem Controllers
const warpDrive = new WarpDriveManager(camera, starfield);
eventBus.on('warp:engage', () => warpDrive.engage());
eventBus.on('warp:disengage', () => warpDrive.disengage());
eventBus.on('thruster:boost', (mult) => thrusterParticles.userData.setBoost(mult));

const radar = new RadarController('#radar-canvas', () => {
  const contacts = [
    { object: spacecraft, color: '#38bdf8', size: 4 },
    { object: planet, color: '#22c55e', size: 5 },
    { object: anomaly, color: '#f59e0b', size: 3 }
  ];
  if (asteroidField && asteroidField.userData.asteroids) {
    asteroidField.userData.asteroids.forEach((ast) => {
      if (ast.visible) contacts.push({ object: ast, color: '#ef4444', size: 2.5 });
    });
  }
  return contacts;
}, 35);

new InspectorModalController();
const audioVisualizer = new AudioVisualizerController('#audio-visualizer-canvas');

// 7. Raycaster Interactivity
const interactiveObjects = [spacecraft, planet, anomaly, ...asteroidField.userData.asteroids];
initRaycaster(camera, canvas, interactiveObjects);

function focusTarget(target) {
  activeTargetLock = target;
  audioEngine.playTargetLock();

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

HUDController.addLog('ORBITAL-01 Command Bridge fully operational.', 'success');

const clock = new THREE.Clock();

function animate() {
  const delta = clock.getDelta();
  const elapsedTime = clock.getElapsedTime();

  controls.update();

  if (!flightController.enabled) {
    spacecraft.userData.update(elapsedTime);
  }
  flightController.update(delta);

  audioEngine.updateEnginePitch(flightController.velocity.length());

  thrusterParticles.userData.update(elapsedTime);
  planet.userData.update(elapsedTime);
  anomaly.userData.update(elapsedTime);
  trajectories.userData.update(elapsedTime);
  asteroidField.userData.update(delta);
  weaponSystem.update(delta, asteroidField.userData.asteroids);

  radar.update();
  audioVisualizer.update();

  postProcessing.composer.render();
  requestAnimationFrame(animate);
}

animate();