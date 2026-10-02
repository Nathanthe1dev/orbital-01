# ORBITAL-01 // THE LAST SIGNAL

> A browser-based deep-space mission control experiment built with Three.js.

**[LIVE DEMO](https://nathanthe1dev.github.io/orbital-01/)** · **[SOURCE](https://github.com/Nathanthe1dev/orbital-01)**

---

## `MISSION`

You are the controller of **ORBITAL-01**.

Something is transmitting from deep space.

Scan it.
Fly the ship.
Watch the systems.
Figure out what the hell is out there.

---

## `SYSTEMS`

```text
3D SCENE          → Three.js / WebGL
FLIGHT            → Manual + Autopilot
TELEMETRY         → Live vessel state
RADAR             → Tactical object tracking
MISSIONS          → Objectives + progression
TERMINAL          → Command interface
TARGETING         → Raycasting + inspection
WARP              → Hyperdrive simulation
WEAPONS           → Plasma / defense systems
AUDIO             → Web Audio API
STATE             → Local persistence
FX                → Bloom + particles
```

---

## `TRY THIS`

Open the terminal and type:

```text
HELP
MISSIONS
SCAN_SIGNAL
RUN_DIAGNOSTICS
LOCK_TARGET ANOMALY
INSPECT_TARGET ANOMALY
MANUAL_FLIGHT
WARP_SPEED
TOGGLE_RADAR
RED_ALERT
```

Then try breaking something.

---

## `UNDER THE HOOD`

The project is built as small independent systems connected through an event bus and shared state.

```text
             ┌───────────┐
             │  EventBus │
             └─────┬─────┘
                   / \
                  /   \
             Simulation  UI
                │        │
             Flight    HUD
             Missions  Radar
             Telemetry Terminal
                │
              State
```

No framework.
No game engine.
Just browser APIs + Three.js + a bunch of systems talking to each other.

---

## `STACK`

`JavaScript` · `Three.js` · `GSAP` · `HTML/CSS` · `Canvas API` · `Web Audio API` · `Vite`

---

## `RUN IT`

```bash
git clone https://github.com/Nathanthe1dev/orbital-01.git
cd orbital-01
npm install
npm run dev
```

---

## `STATUS`

```text
VESSEL   : ORBITAL-01
MISSION  : ACTIVE
SIGNAL   : UNKNOWN
MODE     : EXPLORATION
```

Made as a playground for **3D graphics, simulation, interaction and frontend architecture**.

```text
// END TRANSMISSION
```
