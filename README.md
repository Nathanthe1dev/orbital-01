# 🚀 ORBITAL-01 // Bridge & Flight Simulator

[![Vite](https://img.shields.io/badge/Vite-5.0-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Three.js](https://img.shields.io/badge/Three.js-r160-000000?style=flat-square&logo=three.js&logoColor=white)](https://threejs.org/)
[![GitHub Pages](https://img.shields.io/badge/Deployment-GitHub_Pages-22c55e?style=flat-square&logo=github)](https://nathanthe1dev.github.io/orbital-01/)
[![Status](https://img.shields.io/badge/Bridge_Status-OPERATIONAL-00c8ff?style=flat-square)]()

> **TRANSMISSION INCOMING...**  
> Welcome to **ORBITAL-01**, an interactive WebGL 3D space flight simulator and tactical command bridge running natively in your browser. Powered by **Three.js**, **Vite**, **GSAP**, and modular HUD components.

🌐 **Live Demo:** [nathanthe1dev.github.io/orbital-01](https://nathanthe1dev.github.io/orbital-01/)

---

## 🛰️ Core Features & Subsystems

* **3D Celestial Scene & Entities**: Rendered high-performance WebGL environment featuring the `ORBITAL-01` flagship cruiser, exoplanet `KEPLER-186F`, pulsating `QUANTUM SINGULARITY` anomaly, orbit trajectory rings, and a dynamic asteroid hazard field.
* **Raycast Targeting & Inspector Modal**: Click on any celestial object or asteroid in 3D space to lock target. GSAP smoothly focuses the camera while opening the **Target Analysis & Inspector Modal** displaying real-time distance (AU), structural integrity, and status.
* **Interactive Terminal CLI**: Fully functional command-line terminal with command history buffer (`Up`/`Down` arrows) to execute system-wide ship commands.
* **2D Tactical Radar Canvas**: Dynamic 2D radar widget rendering real-time relative spatial coordinates for the flagship, planet, anomaly, and surrounding asteroid hazards.
* **Manual Flight & Weapons System**: Toggle manual piloting mode (`FLIGHT`) to navigate the vessel using WASD + Altitude controls, and discharge plasma cannon bolts (`F` key) with collision detection against asteroid hazards.
* **Subsystem Visual Effects**: Full-screen Red Alert pulsing mode, screen camera shake FX on weapon impact/hazard destruction, and starfield warp drive particle contraction.
* **Audio Spectrum Matrix**: Dynamic HUD visualizer widget rendering active audio matrix frequency animations.
* **Persistent Bridge State**: Integrated LocalStorage manager to save and load mission telemetry, state logs, and status parameters.

---

## 🕹️ Flight Deck & Navigation Controls

| Input / Action | System Mode | Function |
| :--- | :--- | :--- |
| **`LEFT CLICK` (on 3D Object)** | Global | Raycast inspect object & acquire camera lock |
| **`RIGHT CLICK + DRAG`** | Global | 360° Free look orbit camera controls |
| **`MOUSE WHEEL`** | Global | Camera zoom in / out |
| **`W` / `S`** | Manual Flight | Translate Forward / Backward |
| **`A` / `D`** | Manual Flight | Translate Left / Right |
| **`SPACE` / `LEFT SHIFT`** | Manual Flight | Translate Altitude Up / Down |
| **`F`** | Manual Flight | Discharge plasma cannons |
| **`UP` / `DOWN` ARROW KEYS** | Terminal CLI | Navigate command history buffer |

---

## 💻 Command Terminal CLI Directory

Type commands directly into the CLI input prompt at the bottom left of the bridge:

```bash
# Terminal Mainframe Directory

HELP            # Display list of available bridge commands
FLIGHT          # Toggle WASD manual flight mode (or MANUAL_FLIGHT)
FIRE            # Discharge dual plasma cannon bolts
WARP            # Engage / disengage warp drive speed animation
RED_ALERT       # Toggle red alert visual status pulse (or ALERT)
RESET           # Reset camera focus back to orbital vessel center (or CAMERA)
SAVE            # Persist current mission state to browser storage
LOAD            # Restore saved state snapshot from storage
CLEAR           # Flush terminal console log screen (or CLS)