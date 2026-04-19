/**
 * Diagnostics Service
 *
 * |--------------------------------------------------------------------------
 * | System info, memory usage, GPU info, and network status.
 * |--------------------------------------------------------------------------
 * |
 * | In Electron: queries system info from the main process via IPC.
 * | In browser: returns available data from browser APIs, 'unavailable'
 * | for Electron-only fields.
 * |
 * | Usage:
 * |   const diag = container.get(DiagnosticsService);
 * |   const info = await diag.getSystemInfo();
 * |   const mem = await diag.getMemoryUsage();
 * |
 * @module @stackra-inc/ts-desktop
 */

import { Injectable, Inject } from '@stackra-inc/ts-container';

import type {
  SystemInfo,
  MemoryUsage,
  GpuInfo,
  NetworkStatus,
} from '@/interfaces/diagnostics.interface';
import { DesktopManager } from './desktop-manager.service';

@Injectable()
export class DiagnosticsService {
  constructor(@Inject(DesktopManager) private readonly desktop: DesktopManager) {}

  /*
  |--------------------------------------------------------------------------
  | getSystemInfo
  |--------------------------------------------------------------------------
  */
  async getSystemInfo(): Promise<SystemInfo> {
    if (this.desktop.isDesktop) {
      return this.desktop.bridge.invoke<SystemInfo>('diagnostics:system-info');
    }

    return {
      os: navigator.userAgent,
      cpu: 'unavailable',
      totalMemory: 0,
      electronVersion: 'N/A',
      nodeVersion: 'N/A',
      chromeVersion: this.extractChromeVersion(),
    };
  }

  /*
  |--------------------------------------------------------------------------
  | getMemoryUsage
  |--------------------------------------------------------------------------
  */
  async getMemoryUsage(): Promise<MemoryUsage> {
    if (this.desktop.isDesktop) {
      return this.desktop.bridge.invoke<MemoryUsage>('diagnostics:memory');
    }

    /* Browser fallback: performance.memory (Chrome only, non-standard). */
    const perf = performance as any;
    if (perf.memory) {
      return {
        heapUsed: perf.memory.usedJSHeapSize ?? 0,
        heapTotal: perf.memory.totalJSHeapSize ?? 0,
        rss: perf.memory.jsHeapSizeLimit ?? 0,
      };
    }

    return { heapUsed: 0, heapTotal: 0, rss: 0 };
  }

  /*
  |--------------------------------------------------------------------------
  | getGpuInfo
  |--------------------------------------------------------------------------
  */
  async getGpuInfo(): Promise<GpuInfo> {
    if (this.desktop.isDesktop) {
      return this.desktop.bridge.invoke<GpuInfo>('diagnostics:gpu-info');
    }

    /* Browser fallback: WebGL renderer info. */
    return this.browserGpuInfo();
  }

  /*
  |--------------------------------------------------------------------------
  | getNetworkStatus
  |--------------------------------------------------------------------------
  */
  async getNetworkStatus(): Promise<NetworkStatus> {
    const online = typeof navigator !== 'undefined' ? navigator.onLine : false;

    const conn = (navigator as any).connection;
    if (conn) {
      return {
        online,
        type: this.mapConnectionType(conn.type),
        effectiveType: conn.effectiveType,
        downlink: conn.downlink,
      };
    }

    return {
      online,
      type: online ? 'unknown' : 'none',
    };
  }

  /*
  |--------------------------------------------------------------------------
  | Private Helpers
  |--------------------------------------------------------------------------
  */

  /** Extract Chrome version from user agent string. */
  private extractChromeVersion(): string {
    if (typeof navigator === 'undefined') return 'N/A';
    const match = navigator.userAgent.match(/Chrome\/(\d+\.\d+\.\d+\.\d+)/);
    return match?.[1] ?? 'N/A';
  }

  /** Get GPU info from WebGL context. */
  private browserGpuInfo(): GpuInfo {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') ?? canvas.getContext('experimental-webgl');
      if (gl && gl instanceof WebGLRenderingContext) {
        const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
        if (debugInfo) {
          return {
            vendor: gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) ?? 'unknown',
            renderer: gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) ?? 'unknown',
            raw: null,
          };
        }
      }
    } catch {
      /* WebGL not available. */
    }

    return { vendor: 'unavailable', renderer: 'unavailable', raw: null };
  }

  /** Map Network Information API connection type to our type. */
  private mapConnectionType(type?: string): NetworkStatus['type'] {
    switch (type) {
      case 'wifi':
        return 'wifi';
      case 'ethernet':
        return 'ethernet';
      case 'cellular':
        return 'cellular';
      case 'none':
        return 'none';
      default:
        return 'unknown';
    }
  }
}
