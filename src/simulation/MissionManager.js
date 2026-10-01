import { eventBus } from '../core/EventBus.js';
import { HUDController } from '../components/HUD.js';
import { store } from '../core/State.js';

export class MissionManager {
  constructor() {
    this.missions = [
      {
        id: 'm1',
        title: 'DEEP SPACE SCAN',
        description: 'Scan the quantum pulse anomaly in local orbit.',
        trigger: 'scan:completed',
        completed: false
      },
      {
        id: 'm2',
        title: 'HAZARD CLEARANCE',
        description: 'Destroy at least 1 asteroid threat in the sector.',
        trigger: 'hazard:destroyed',
        completed: false
      },
      {
        id: 'm3',
        title: 'HYPERDRIVE TEST',
        description: 'Engage warp speed propulsion matrix.',
        trigger: 'warp:engaged',
        completed: false
      }
    ];

    this.initListeners();
  }

  initListeners() {
    eventBus.on('target:inspect', (target) => {
      if (target && target.userData && target.userData.name?.includes('ANOMALY')) {
        this.completeMission('m1');
      }
    });

    eventBus.on('hazard:destroyed', () => {
      this.completeMission('m2');
    });

    eventBus.on('warp:engage', () => {
      this.completeMission('m3');
    });

    eventBus.on('missions:get', () => {
      this.renderToTerminal();
    });
  }

  completeMission(id) {
    const mission = this.missions.find((m) => m.id === id);
    if (mission && !mission.completed) {
      mission.completed = true;
      HUDController.addLog(`[MISSION COMPLETE] ${mission.title}`, 'success');
      
      // Reward: Boost Core Power Telemetry
      const currentPower = store.get().telemetry.power;
      store.updateTelemetry('power', Math.min(100, currentPower + 5.0));
      
      this.updateHUDWidget();
      eventBus.emit('state:modified');
    }
  }

  getActiveMission() {
    return this.missions.find((m) => !m.completed) || null;
  }

  updateHUDWidget() {
    const container = document.querySelector('#mission-content');
    if (!container) return;

    const active = this.getActiveMission();
    if (active) {
      container.innerHTML = `
        <div class="mission-title">${active.title}</div>
        <div class="mission-desc">${active.description}</div>
      `;
    } else {
      container.innerHTML = `
        <div class="mission-title" style="color: #22c55e;">ALL DIRECTIVES CLEARED</div>
        <div class="mission-desc">Sector telemetry nominal. Awaiting fleet commands.</div>
      `;
    }
  }

  renderToTerminal() {
    HUDController.addLog('--- TACTICAL MISSION DIRECTIVES ---', 'info');
    this.missions.forEach((m) => {
      const status = m.completed ? '[COMPLETED]' : '[ACTIVE]';
      const type = m.completed ? 'success' : 'warning';
      HUDController.addLog(`${status} ${m.title} - ${m.description}`, type);
    });
  }

  getState() {
    return this.missions.map(m => ({ id: m.id, completed: m.completed }));
  }

  setState(savedMissions) {
    if (!Array.isArray(savedMissions)) return;
    savedMissions.forEach((saved) => {
      const m = this.missions.find(item => item.id === saved.id);
      if (m) m.completed = saved.completed;
    });
    this.updateHUDWidget();
  }
}