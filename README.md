Working Prototype is under development!

# 🛰️ ORBITAL-01 // Deep Space Mission Control Interface

> *An interactive 3D WebGL deep-space mission control terminal built with Vanilla JavaScript and Three.js.*

---

## 🪐 Overview

**ORBITAL-01: The Last Signal** is a web-based aerospace mission control platform. As mission controller, the user monitors an unmanned deep-space vessel that has encountered an unexplained signal at the edge of known space.

The application combines high-performance 3D WebGL rendering with a tactical glassmorphism HUD overlay to simulate live telemetry, interactive spacecraft operations, and an unfolding deep-space narrative.

---

## ✨ Key Features

*   **3D Space Engine:** Lightweight WebGL scene featuring procedural starfields, dynamic camera controls, and custom lighting.
*   **Tactical HUD Interface:** Glassmorphism UI panels with real-time system status indicators.
*   **Live Telemetry Engine:** Mathematical simulation of fuel, power, signal strength, hull integrity, and environment parameters.
*   **Mission Command Terminal:** Interactive command line interface to execute diagnostic scans, vessel rotations, shield activation, and Earth pings.
*   **Dynamic Alert System:** Simulated space hazards including solar flares, micrometeoroid impacts, and signal dropouts.
*   **Deep Space Narrative:** Decryptable transmission logs revealing an unfolding space mystery.

---

## 🛠️ Tech Stack

*   **Core:** HTML5, CSS3 (Modern CSS Variables & Grid), JavaScript (ES Modules)
*   **3D / Graphics:** [Three.js](https://threejs.org/) (WebGL Render Engine)
*   **Animation:** [GSAP](https://greensock.com/gsap/)
*   **Build Tool & Dev Server:** [Vite](https://vitejs.dev/)
*   **Version Control:** Git & GitHub

---

## ⚡ Getting Started

### Prerequisites

Ensure you have [Node.js](https://nodejs.org/) (v16 or higher) installed.

### Installation & Local Setup

1. **Clone the repository:**
bash
git clone https://github.com/Nathanthe1dev/orbital-01.git
cd orbital-01

2. **Install dependencies:**
bash
npm install

3. **Start the local development server:**
bash
npm run dev

4. Open the local address printed in your terminal (e.g., `http://localhost:5173`) in your browser.

---

## 📐 Architecture Overview

This project uses a modular **Vanilla ES Engine Architecture** driven by an **Event Bus (Pub/Sub pattern)** to keep the application decoupled and performant:

text
┌─────────────────────────┐
│      EventBus.js        │
│   (Pub/Sub Engine)      │
└────────────▲────────────┘
│
┌───────────────────────────┼───────────────────────────┐
│                           │                           │
┌────┴────────────┐    ┌─────────┴─────────┐    ┌────────────┴────────┐
│  SceneManager   │    │ Telemetry & State │    │  UI & HUD Overlay   │
│   (Three.js)    │    │ (Simulation Engine)│    │    (DOM Engine)     │
└─────────────────┘    └───────────────────┘    └─────────────────────┘

---

## 📋 Development Roadmap

*   [x] **Day 1:** Project scaffolding, Vite setup, WebGL baseline, dynamic starfield, HUD overlay.
*   [ ] **Day 2:** Procedural spacecraft geometry & 3D celestial planet with atmosphere.
*   [ ] **Day 3:** Full HUD glassmorphism layout & responsive telemetry panels.
*   [ ] **Day 4:** State management store, EventBus, and real-time mathematical telemetry drift.
*   [ ] **Day 5:** Interactive mission terminal & command parser execution system.
*   [ ] **Day 6:** Automated random system events engine & alert notifications.
*   [ ] **Day 7:** Mystery signal transmission log decryption & narrative triggers.
*   [ ] **Day 8:** Web Audio API sound effects & post-processing UI visual polish.
*   [ ] **Day 9:** Documentation, architecture diagramming, and performance optimization.
*   [ ] **Day 10:** Final QA profiling and live deployment.

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
