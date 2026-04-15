/**
 * Diagnostics IPC Handlers
 *
 * |--------------------------------------------------------------------------
 * | Main process handlers for system diagnostics.
 * |--------------------------------------------------------------------------
 * |
 * | Channels:
 * |   diagnostics:system-info — OS, CPU, memory, versions
 * |   diagnostics:gpu-info    — GPU information
 * |   diagnostics:memory      — process memory usage
 * |
 * @module desktop/main/handlers
 */

import { ipcMain, app } from 'electron';
import * as os from 'os';

export function registerDiagnosticsHandlers(): void {
  /*
  |--------------------------------------------------------------------------
  | diagnostics:system-info
  |--------------------------------------------------------------------------
  */
  ipcMain.handle('diagnostics:system-info', async () => {
    return {
      os: `${os.platform()} ${os.release()}`,
      cpu: os.cpus()[0]?.model ?? 'unknown',
      totalMemory: os.totalmem(),
      electronVersion: process.versions.electron ?? 'unknown',
      nodeVersion: process.versions.node ?? 'unknown',
      chromeVersion: process.versions.chrome ?? 'unknown',
    };
  });

  /*
  |--------------------------------------------------------------------------
  | diagnostics:gpu-info
  |--------------------------------------------------------------------------
  */
  ipcMain.handle('diagnostics:gpu-info', async () => {
    try {
      const gpuInfo = await app.getGPUInfo('complete');
      return {
        vendor: (gpuInfo as any)?.gpuDevice?.[0]?.vendorString ?? 'unknown',
        renderer: (gpuInfo as any)?.gpuDevice?.[0]?.deviceString ?? 'unknown',
        raw: gpuInfo,
      };
    } catch {
      return { vendor: 'unavailable', renderer: 'unavailable', raw: null };
    }
  });

  /*
  |--------------------------------------------------------------------------
  | diagnostics:memory
  |--------------------------------------------------------------------------
  */
  ipcMain.handle('diagnostics:memory', async () => {
    const mem = process.memoryUsage();
    return {
      heapUsed: mem.heapUsed,
      heapTotal: mem.heapTotal,
      rss: mem.rss,
    };
  });
}
