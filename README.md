# 🚀 ORBITAL-01 // Bridge & Flight Simulator

[![Vite](https://img.shields.io/badge/Vite-5.0-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Three.js](https://img.shields.io/badge/Three.js-r160-000000?style=flat-square&logo=three.js&logoColor=white)](https://threejs.org/)
[![License](https://img.shields.io/badge/License-MIT-00C8FF?style=flat-square)](LICENSE)
[![Status](https://img.shields.io/badge/Tactical_Status-ONLINE-00FF88?style=flat-square)]()

> **TRANSMISSION INCOMING...**  
> Welcome aboard **ORBITAL-01**, a high-performance WebGL 3D space flight simulator and tactical command bridge running natively in your browser. Built on raw Three.js mathematical transforms, Web Audio DSP, and reactive HUD telemetry. 

---

## 🛰️ Mission Parameters & Architecture Highlights

* **6-DoF Physics Flight Model**: Switch seamlessly from orbital camera navigation to direct manual vector piloting with linear inertia, thruster particle dynamics, and velocity damping.
* **Dual Plasma Cannon System**: Forward-firing projectile ballistics calculated relative to the ship's current velocity vector ($V_{bolt} = V_{ship} + V_{relative}$), featuring collision detection against Class-C asteroid hazards.
* **Tactical 2D Radar Canvas**: Real-time relative spatial projection mapping celestial bodies, anomalies, and hostile hazards onto a multi-ring radial sweep grid.
* **Command Terminal CLI**: Keyboard-driven command prompt complete with input buffer history (`Up`/`Down`), event routing, and state overrides.
* **Target Analysis & Inspection**: Raycaster cursor mapping to lock onto 3D world entities, calculate relative AU distance, and project object telemetry modals.
* **Dynamic Audio Spectrum Matrix**: Custom Web Audio API synthesizer engine generating real-time thruster pitch shifts, target lock audio feedback, and audio spectrum matrix visualizer bars.
* **Persistent Bridge State**: Client-side storage layer for saving/restoring mission directives, telemetry logs, and bridge overrides.

---

## 🛠️ Tech Stack Matrix

| Core Engine | Renderer & Math | UI Layer | Audio & FX | Build Pipeline |
| :--- | :--- | :--- | :--- | :--- |
| **JavaScript ES6+** | **Three.js** (WebGL) | **HTML5 Canvas / CSS3** | **Web Audio API** | **Vite** |
| Event Bus Architecture | GSAP Animations | Monospace HUD overlay | Real-time Synthesizer | **`gh-pages`** deployment |

---

## 🕹️ Flight Deck Keybindings

| Input | Action Mode | Subsystem |
| :--- | :--- | :--- |
| **`W` / `S`** | Pitch Forward / Reverse Thrust | Flight Controller |
| **`A` / `D`** | Yaw / Roll Thrust Vector | Flight Controller |
| **`SPACE` / `LEFT SHIFT`** | Strafe Altitude Up / Down | Flight Controller |
| **`F`** | Discharge Dual Plasma Cannons | Weapon Systems |
| **`LEFT MOUSE`** | Raycast Object Inspection & Target Lock | Tactical Targeting |
| **`RIGHT MOUSE DRAG`** | 360° Free Look Camera Orbit | Orbit Controls |

---

## 💻 Tactical Terminal CLI Commands

Open the command prompt at the bottom left of your HUD and feed parameters directly into the ship's mainframe:

```bash
# Terminal Command Directory

HELP            # Displays available subsystem commands
MANUAL_FLIGHT   # Toggles WASD flight controller & 6-DoF mode
FIRE            # Fires plasma cannon bolts directly from command deck
WARP            # Engages hyper-drive starfield particle contraction
RED_ALERT       # Toggles red alert visual overrides & status flashers
RESET           # Resets orbital camera back to central ship origin
SAVE            # Persists current flight & mission state to local storage
LOAD            # Restores previous bridge state snapshot
CLEAR           # Flushes terminal log buffer

