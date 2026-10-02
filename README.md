# ORBITAL-01 // The Last Signal

> A browser-based deep-space mission control interface built with Vanilla JavaScript, Three.js and WebGL.

[Live Demo](https://nathanthe1dev.github.io/orbital-01/) · [Source Code](https://github.com/Nathanthe1dev/orbital-01)

---

## `MISSION BRIEF`

ORBITAL-01 is an interactive deep-space control console.

You monitor a remote exploration vessel, inspect objects in local space, track telemetry, execute commands, handle system events, complete mission directives, and investigate an unidentified signal.

There is a small story hidden inside the interface.

No framework. No game engine. Just browser APIs, Three.js, a simulation layer, and a lot of UI.

---

## `WHAT YOU CAN DO`

* Explore the 3D scene with orbital camera controls
* Switch into manual flight and pilot the vessel
* Monitor live hull, power, fuel, signal, oxygen and temperature telemetry
* Detect and inspect celestial objects and anomalies
* Lock the camera onto targets
* Track nearby contacts through the tactical radar
* Execute commands through the terminal
* Complete mission directives
* Engage warp propulsion
* Boost thrusters
* Activate shields
* Fire simulated plasma weapons
* Trigger automated defense systems
* Handle simulated hazards and red-alert events
* Listen to procedural ship / system audio
* Toggle bloom and adjust visual intensity
* Save and restore mission state locally
* Follow the signal thread hidden throughout the mission logs

---

## `SYSTEMS`

### 3D Scene

The scene is built from procedural and Three.js-based components:

* Exploration vessel
* Celestial planet
* Anomaly
* Orbital trajectories
* Asteroid field
* Thruster particles
* Weapon effects

### Telemetry

Telemetry is simulated continuously rather than being static UI data.

Current systems include:

```text
HULL INTEGRITY
CORE POWER
FUEL RESERVES
SIGNAL STRENGTH
OXYGEN SUPPLY
CORE TEMPERATURE
VESSEL SPEED
```

### Command Terminal

The terminal acts as the main control interface.

Try:

```text
HELP
MISSIONS
SCAN_SIGNAL
RUN_DIAGNOSTICS
LOCK_TARGET ANOMALY
INSPECT_TARGET ANOMALY
WARP_SPEED
THRUST_BOOST
TOGGLE_RADAR
ACTIVATE_SHIELDS
RED_ALERT
```

There are more commands available in `HELP`.

### Mission System

Current directives include:

```text
DEEP SPACE SCAN
HAZARD CLEARANCE
HYPERDRIVE TEST
```

Completing directives changes mission state and affects the vessel.

### Tactical Radar

A lightweight 2D canvas radar maps nearby scene objects into a tactical view.

### Manual Flight

Enter pilot mode through:

```text
MANUAL_FLIGHT
```

Controls:

```text
W / S       Forward / Reverse
A / D       Strafe
SPACE       Move Up
C / SHIFT   Move Down
Q / E       Roll
```

Use:

```text
HALT
```

to kill vessel momentum.

### Audio

The sound layer is generated with the Web Audio API rather than relying entirely on external audio files.

It includes:

* engine hum
* target lock
* weapon sounds
* explosion effects
* alert audio
* terminal feedback
* audio spectrum visualization

### State & Persistence

Mission state can be stored locally and restored later:

```text
SAVE_GAME
LOAD_GAME
RESET_DATA
```

No backend is required for the save system.

---

## `ARCHITECTURE`

ORBITAL-01 uses a modular Vanilla ES module architecture.

The main idea is to keep the simulation, rendering and interface from becoming one giant script.

```text
                         ORBITAL-01
                              │
              ┌───────────────┴───────────────┐
              │                               │
           THREE.JS                        DOM / HUD
              │                               │
      ┌───────┼────────┐              ┌───────┼─────────┐
      │       │        │              │       │         │
    Scene   Flight   Effects        HUD   Terminal    Radar
      │       │        │
      └───────┴────────┘
              │
        Simulation Layer
              │
      ┌───────┼────────┐
      │       │        │
 Telemetry  Missions  Warp
      │       │        │
      └───────┴────────┘
              │
           State Store
              │
           EventBus
              │
      ┌───────┼──────────────┐
      │       │              │
   Audio    Storage       Interaction
```

### Core design ideas

**EventBus**

A lightweight Pub/Sub layer is used for communication between otherwise separate systems.

For example:

```text
target:selected
telemetry:updated
hazard:destroyed
warp:engage
flight:manual_toggle
state:save
```

This keeps systems from directly depending on each other's internal implementation.

**State Store**

Centralized runtime state holds vessel status, telemetry and system flags.

**Subsystem Controllers**

Major behaviours are separated into focused modules instead of being handled directly inside the render loop.

---

## `PROJECT STRUCTURE`

```text
orbital-01/
│
├── public/
│   └── assets/
│
├── src/
│   ├── components/
│   │   ├── AudioVisualizer.js
│   │   ├── HUD.js
│   │   ├── InspectorModal.js
│   │   ├── Radar.js
│   │   └── Terminal.js
│   │
│   ├── core/
│   │   ├── AudioEngine.js
│   │   ├── EventBus.js
│   │   ├── FXEngine.js
│   │   ├── Optimizer.js
│   │   ├── PostProcessing.js
│   │   ├── Raycaster.js
│   │   ├── State.js
│   │   └── Storage.js
│   │
│   ├── scene/
│   │   ├── Anomaly.js
│   │   ├── Asteroids.js
│   │   ├── Planet.js
│   │   ├── Spacecraft.js
│   │   ├── ThrusterParticles.js
│   │   ├── Trajectory.js
│   │   └── Weapons.js
│   │
│   ├── simulation/
│   │   ├── Commands.js
│   │   ├── FlightController.js
│   │   ├── MissionManager.js
│   │   ├── Telemetry.js
│   │   └── WarpDrive.js
│   │
│   ├── styles/
│   │   ├── hud.css
│   │   └── main.css
│   │
│   └── main.js
│
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

---

## `TECH STACK`

| Layer           | Technology              |
| --------------- | ----------------------- |
| Language        | JavaScript (ES Modules) |
| 3D / WebGL      | Three.js                |
| Animation       | GSAP                    |
| UI              | HTML5 + CSS3            |
| Audio           | Web Audio API           |
| 2D Radar        | Canvas API              |
| Build Tool      | Vite                    |
| Version Control | Git + GitHub            |
| Deployment      | GitHub Pages            |

---

## `INTERACTION MODEL`

The project is intentionally built around multiple small systems communicating through events.

A simplified example:

```text
User
 │
 ├── clicks anomaly
 │
 ↓
Raycaster
 │
 ↓
target:selected
 │
 ├── Camera focuses target
 ├── HUD updates
 ├── Inspector opens
 └── MissionManager checks objective
```

Another:

```text
User
 │
 └── SCAN_SIGNAL
          │
          ↓
     CommandProcessor
          │
          ↓
     State updates
          │
          ↓
    telemetry:updated
          │
          ↓
       HUD render
```

This keeps the interactive layer and simulation logic loosely coupled.

---

## `PERFORMANCE NOTES`

The application is a real-time WebGL scene running alongside a DOM-heavy HUD.

A few things are deliberately kept under control:

* Device pixel ratio is capped to avoid unnecessary GPU load on high-DPI displays
* Scene objects are split into reusable modules
* Disposable Three.js resources have explicit cleanup paths
* The radar uses a lightweight 2D canvas
* Post-processing is isolated behind its own module
* Animation uses delta time where simulation behaviour depends on frame progression

Performance is still a trade-off between visual effects, scene complexity and device capability.

---

## `RUN LOCALLY`

### Requirements

* Node.js
* npm
* Git

### Clone

```bash
git clone https://github.com/Nathanthe1dev/orbital-01.git
cd orbital-01
```

### Install

```bash
npm install
```

### Development server

```bash
npm run dev
```

Open the local URL printed by Vite.

### Production build

```bash
npm run build
```

### Preview production build

```bash
npm run preview
```

---

## `COMMAND REFERENCE`

The terminal supports a range of commands.

| Command                  | Purpose                              |
| ------------------------ | ------------------------------------ |
| `HELP`                   | List available commands              |
| `RUN_DIAGNOSTICS`        | Run a vessel diagnostic              |
| `SCAN_SIGNAL`            | Scan the unidentified signal         |
| `PING_EARTH`             | Send a simulated Earth transmission  |
| `ROTATE_SHIP`            | Execute a ship rotation              |
| `ACTIVATE_SHIELDS`       | Toggle defensive shields             |
| `LOCK_TARGET ANOMALY`    | Lock onto the anomaly                |
| `INSPECT_TARGET ANOMALY` | Inspect a target                     |
| `WARP_SPEED`             | Engage warp                          |
| `DISENGAGE_WARP`         | Exit warp                            |
| `THRUST_BOOST`           | Temporarily increase thruster output |
| `TOGGLE_RADAR`           | Show / hide tactical radar           |
| `RED_ALERT`              | Enter emergency mode                 |
| `CLEAR_ALERT`            | Exit emergency mode                  |
| `MANUAL_FLIGHT`          | Enable manual piloting               |
| `AUTOPILOT`              | Return to automatic mode             |
| `HALT_VESSEL`            | Stop vessel movement                 |
| `FIRE`                   | Fire weapons                         |
| `ENGAGE_TARGET`          | Engage the locked target             |
| `AUTO_DEFENSE`           | Toggle automated defense             |
| `SPAWN_HAZARDS`          | Respawn asteroid hazards             |
| `MISSIONS`               | Show mission directives              |
| `SAVE_GAME`              | Save local state                     |
| `LOAD_GAME`              | Restore local state                  |
| `RESET_DATA`             | Clear saved state                    |
| `MUTE` / `UNMUTE`        | Toggle audio                         |
| `CLEAR`                  | Clear terminal output                |

---

## `WHY IT EXISTS`

This started as a simple Three.js experiment.

It turned into a small systems playground.

The interesting part isn't the spaceship itself. It is the attempt to make several independent browser systems behave like one coherent interface:

```text
3D Rendering
+
Simulation
+
State
+
Events
+
UI
+
Audio
+
Interaction
```

That made ORBITAL-01 a useful place to experiment with modular frontend architecture, real-time rendering and interactive systems without hiding everything behind a framework.

---

## `ROADMAP`

Things I may explore later:

* deeper mission progression
* richer signal decoding
* more complex flight physics
* additional celestial objects
* better mobile controls
* improved accessibility
* more detailed performance profiling
* additional visual effects
* expanded save-state handling

The project is intentionally kept small enough to experiment with without turning it into a full game engine.

---

## `STATUS`

```text
BUILD: ACTIVE EXPERIMENT
ENGINE: THREE.JS / WEBGL
MODE: MISSION CONTROL
SIGNAL: UNIDENTIFIED
VESSEL: ORBITAL-01
```

---

## `LICENSE`

MIT License.

See `LICENSE` for details.

---

## `CREDITS`

Built with:

* [Three.js](https://threejs.org/)
* [GSAP](https://gsap.com/)
* [Vite](https://vite.dev/)

---

```text
// END TRANSMISSION

ORBITAL-01
THE LAST SIGNAL
```
