import { store } from '../core/State.js';
import { eventBus } from '../core/EventBus.js';
import { HUDController } from '../components/HUD.js';

export class CommandProcessor {
  static execute(rawCmd) {
    const cmd = rawCmd.trim().toUpperCase();
    if (!cmd) return;

    HUDController.addLog(`> ${cmd}`, 'cmd');

    switch (cmd) {
      case 'HELP':
        HUDController.addLog('AVAILABLE COMMANDS:', 'info');
        HUDController.addLog('  RUN_DIAGNOSTICS  - Run full vessel integrity check', 'info');
        HUDController.addLog('  SCAN_SIGNAL      - Scan for deep space signal transmissions', 'info');
        HUDController.addLog('  PING_EARTH       - Transmit ping to Earth ground station', 'info');
        HUDController.addLog('  ROTATE_SHIP      - Execute 360 degree maneuvering maneuver', 'info');
        HUDController.addLog('  ACTIVATE_SHIELDS - Toggle energy deflection shield', 'info');
        HUDController.addLog('  CLEAR            - Clear terminal output buffer', 'info');
        break;

      case 'RUN_DIAGNOSTICS':
        HUDController.addLog('[DIAG] Initiating full system diagnostic scan...', 'info');
        setTimeout(() => HUDController.addLog('[DIAG] Hull structure: NOMINAL (100%)', 'success'), 600);
        setTimeout(() => HUDController.addLog('[DIAG] Thruster matrix: ONLINE', 'success'), 1200);
        setTimeout(() => HUDController.addLog('[DIAG] Diagnostics complete. No critical faults.', 'success'), 1800);
        break;

      case 'SCAN_SIGNAL':
        HUDController.addLog('[SCAN] Orienting long-range directional antenna array...', 'info');
        const currentSignal = store.get().telemetry.signal;
        store.updateTelemetry('signal', Math.min(100, currentSignal + 25));
        setTimeout(() => {
          HUDController.addLog('[SCAN] Signal boosted. Dynamic pulse detected at 14.82 GHz!', 'warning');
          HUDController.addLog('[NARRATIVE] "..." [ENCRYPTED SIGNAL - RECOVERY NEEDED]', 'warning');
        }, 1000);
        break;

      case 'PING_EARTH':
        HUDController.addLog('[COMM] Transmitting carrier wave to Deep Space Network...', 'info');
        setTimeout(() => {
          const delay = (Math.random() * 80 + 120).toFixed(1);
          HUDController.addLog(`[COMM] Ping ACK received from Goldstone DSN. Round-trip: ${delay}ms`, 'success');
        }, 1200);
        break;

      case 'ROTATE_SHIP':
        HUDController.addLog('[MANEUVER] Executing 360-degree rotation yaw maneuver...', 'info');
        eventBus.emit('ship:rotate');
        break;

      case 'ACTIVATE_SHIELDS':
      case 'SHIELDS':
        const currentState = store.get();
        const nextShieldState = !currentState.shieldsActive;
        store.setShields(nextShieldState);

        if (nextShieldState) {
          store.updateTelemetry('power', currentState.telemetry.power - 5.0);
          HUDController.addLog('[SHIELDS] Deflector shield matrix ENABLED (-5.0% power)', 'warning');
        } else {
          HUDController.addLog('[SHIELDS] Deflector shield matrix DISABLED', 'info');
        }
        break;

      case 'CLEAR':
        const terminal = document.querySelector('#terminal-output');
        if (terminal) terminal.innerHTML = '';
        break;

      default:
        HUDController.addLog(`UNKNOWN COMMAND: '${cmd}'. Type 'HELP' for available commands.`, 'alert');
        break;
    }
  }
}