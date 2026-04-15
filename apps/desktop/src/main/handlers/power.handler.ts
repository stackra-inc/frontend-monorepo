/**
 * Power IPC Handlers
 *
 * |--------------------------------------------------------------------------
 * | Main process handlers for power management.
 * |--------------------------------------------------------------------------
 * |
 * | Channels:
 * |   power:prevent-sleep — start a power save blocker
 * |   power:allow-sleep   — stop a power save blocker
 * |   power:state         — get current power state
 * |
 * @module desktop/main/handlers
 */

import { ipcMain, powerSaveBlocker, powerMonitor } from 'electron';

export function registerPowerHandlers(): void {
  /*
  |--------------------------------------------------------------------------
  | power:prevent-sleep
  |--------------------------------------------------------------------------
  */
  ipcMain.handle('power:prevent-sleep', async () => {
    return powerSaveBlocker.start('prevent-display-sleep');
  });

  /*
  |--------------------------------------------------------------------------
  | power:allow-sleep
  |--------------------------------------------------------------------------
  */
  ipcMain.handle('power:allow-sleep', async (_event, blockerId: number) => {
    if (powerSaveBlocker.isStarted(blockerId)) {
      powerSaveBlocker.stop(blockerId);
    }
  });

  /*
  |--------------------------------------------------------------------------
  | power:state
  |--------------------------------------------------------------------------
  */
  ipcMain.handle('power:state', async () => {
    const onBattery = powerMonitor.isOnBatteryPower();
    return onBattery ? 'on-battery' : 'on-ac';
  });
}
