import { store } from './State.js';
import { eventBus } from './EventBus.js';
import { HUDController } from '../components/HUD.js';

const STORAGE_KEY = 'orbital01_save_v1';

export class StorageEngine {
  static save(missionManager) {
    try {
      const state = store.get();
      const saveData = {
        timestamp: Date.now(),
        telemetry: state.telemetry,
        shieldsActive: state.shieldsActive,
        status: state.status,
        missions: missionManager ? missionManager.getState() : []
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(saveData));
      HUDController.addLog('[SYSTEM] Telemetry state persisted to local sector storage.', 'success');
    } catch (e) {
      console.error('Failed to save state:', e);
    }
  }

  static load(missionManager) {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        HUDController.addLog('[SYSTEM] No existing save state detected.', 'info');
        return false;
      }

      const saveData = JSON.parse(raw);
      if (saveData.telemetry) {
        Object.keys(saveData.telemetry).forEach((key) => {
          store.updateTelemetry(key, saveData.telemetry[key]);
        });
      }

      if (saveData.shieldsActive !== undefined) {
        store.setShields(saveData.shieldsActive);
      }

      if (saveData.status) {
        store.setStatus(saveData.status);
      }

      if (missionManager && saveData.missions) {
        missionManager.setState(saveData.missions);
      }

      HUDController.addLog(`[SYSTEM] Save state restored (Saved: ${new Date(saveData.timestamp).toLocaleTimeString()}).`, 'success');
      return true;
    } catch (e) {
      console.error('Failed to load state:', e);
      return false;
    }
  }

  static reset() {
    localStorage.removeItem(STORAGE_KEY);
    HUDController.addLog('[SYSTEM] Local storage cache cleared. Reloading standard parameters...', 'alert');
    setTimeout(() => location.reload(), 1200);
  }
}