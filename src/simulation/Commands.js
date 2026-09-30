import { store } from '../core/State.js';
import { eventBus } from '../core/EventBus.js';
import { HUDController } from '../components/HUD.js';
import { soundFX } from '../core/SoundFX.js';

export class CommandProcessor {
  static execute(rawCmd) {
    const cmd = rawCmd.trim().toUpperCase();
    if (!cmd) return;

    HUDController.addLog(`> ${cmd}`, 'cmd');

    const parts = cmd.split(' ');
    const mainCmd = parts[0];
    const arg = parts[1];

    switch (mainCmd) {
      case 'HELP':
        HUDController.addLog('AVAILABLE COMMANDS:', 'info');
        HUDController.addLog('  RUN_DIAGNOSTICS  - Run full vessel integrity check', 'info');
        HUDController.addLog('  SCAN_SIGNAL      - Scan for deep space signal transmissions', 'info');
        HUDController.addLog('  PING_EARTH       - Transmit ping to Earth ground station', 'info');
        HUDController.addLog('  ROTATE_SHIP      - Execute 360 degree maneuvering maneuver', 'info');
        HUDController.addLog('  ACTIVATE_SHIELDS - Toggle energy deflection shield', 'info');
        HUDController.addLog('  LOCK_TARGET      - Lock camera onto object (SHIP | PLANET | ANOMALY)', 'info');
        HUDController.addLog('  WARP_SPEED       - Engage hyperdrive warp propulsion', 'info');
        HUDController.addLog('  DISENGAGE_WARP   - Drop out of warp speed', 'info');
        HUDController.addLog('  THRUST_BOOST     - Increase thruster plasma exhaust output', 'info');
        HUDController.addLog('  TOGGLE_RADAR     - Toggle 2D radar minimap visibility', 'info');
        HUDController.addLog('  RED_ALERT        - Engage vessel emergency status & sirens', 'info');
        HUDController.addLog('  CLEAR_ALERT      - Disengage emergency protocol', 'info');
        HUDController.addLog('  MUTE / UNMUTE    - Toggle sound synthesizer audio', 'info');
        HUDController.addLog('  CLEAR            - Clear terminal output buffer', 'info');
        break;

      case 'WARP_SPEED':
      case 'WARP':
        eventBus.emit('warp:engage');
        break;

      case 'DISENGAGE_WARP':
      case 'DROPOUT':
        eventBus.emit('warp:disengage');
        break;

      case 'THRUST_BOOST':
      case 'BOOST':
        eventBus.emit('thruster:boost', 2.5);
        HUDController.addLog('[ENGINES] Thruster output boosted to 250% capacity.', 'warning');
        setTimeout(() => {
          eventBus.emit('thruster:boost', 1.0);
          HUDController.addLog('[ENGINES] Thruster output returned to standard cruise.', 'info');
        }, 4000);
        break;

      case 'TOGGLE_RADAR':
      case 'RADAR':
        eventBus.emit('radar:toggle');
        HUDController.addLog('[TACTICAL] Toggled 2D Radar Minimap.', 'info');
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
          HUDController.addLog('[NARRATIVE] "ANOMALY-X1 telemetry responding..."', 'warning');
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

      case 'LOCK_TARGET':
        if (!arg) {
          HUDController.addLog('USAGE: LOCK_TARGET <SHIP | PLANET | ANOMALY>', 'alert');
          return;
        }
        eventBus.emit('target:lock_by_name', arg);
        break;

      case 'CAM_RESET':
      case 'RELEASE_TARGET':
        eventBus.emit('camera:reset');
        HUDController.addLog('[TACTICAL] Target lock released. Camera reset to home view.', 'info');
        store.setStatus('SYSTEM ONLINE');
        break;

      case 'RED_ALERT':
      case 'ALERT':
        document.body.classList.add('red-alert');
        store.setStatus('EMERGENCY // RED ALERT');
        eventBus.emit('alert:start');
        HUDController.addLog('[ALERT] CRITICAL WARNING: RED ALERT PROTOCOL ENGAGED!', 'alert');
        break;

      case 'CLEAR_ALERT':
      case 'NORMAL':
        document.body.classList.remove('red-alert');
        store.setStatus('SYSTEM ONLINE');
        eventBus.emit('alert:clear');
        HUDController.addLog('[ALERT] Emergency protocol disengaged. Systems normal.', 'success');
        break;

      case 'MUTE':
        soundFX.muted = true;
        soundFX.stopAlarm();
        HUDController.addLog('[AUDIO] Web Audio synthesizer muted.', 'info');
        break;

      case 'UNMUTE':
        soundFX.muted = false;
        HUDController.addLog('[AUDIO] Web Audio synthesizer unmuted.', 'info');
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