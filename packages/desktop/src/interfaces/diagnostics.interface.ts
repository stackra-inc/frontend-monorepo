/**
 * Diagnostics & Crash Reporting Interfaces
 *
 * |--------------------------------------------------------------------------
 * | Types for system info, memory, GPU, network, and crash reporting.
 * |--------------------------------------------------------------------------
 * |
 * @module @stackra/ts-desktop
 */

/*
|--------------------------------------------------------------------------
| System Info
|--------------------------------------------------------------------------
*/

/** System information from the Electron main process. */
export interface SystemInfo {
  /** OS platform and release (e.g. 'darwin 23.1.0'). */
  os: string;
  /** CPU model name. */
  cpu: string;
  /** Total system memory in bytes. */
  totalMemory: number;
  /** Electron version. */
  electronVersion: string;
  /** Node.js version. */
  nodeVersion: string;
  /** Chrome version. */
  chromeVersion: string;
}

/*
|--------------------------------------------------------------------------
| Memory Usage
|--------------------------------------------------------------------------
*/

/** Application memory usage. */
export interface MemoryUsage {
  /** Heap memory used in bytes. */
  heapUsed: number;
  /** Total heap size in bytes. */
  heapTotal: number;
  /** Resident set size in bytes. */
  rss: number;
}

/*
|--------------------------------------------------------------------------
| GPU Info
|--------------------------------------------------------------------------
*/

/** GPU information from Electron. */
export interface GpuInfo {
  /** GPU vendor string. */
  vendor: string;
  /** GPU renderer string. */
  renderer: string;
  /** Raw GPU info object from Electron. */
  raw: unknown;
}

/*
|--------------------------------------------------------------------------
| Network Status
|--------------------------------------------------------------------------
*/

/** Current network connectivity status. */
export interface NetworkStatus {
  /** Whether the device is online. */
  online: boolean;
  /** Connection type (wifi, ethernet, cellular, none, unknown). */
  type: 'wifi' | 'ethernet' | 'cellular' | 'none' | 'unknown';
  /** Effective connection type from Network Information API. */
  effectiveType?: string;
  /** Downlink speed in Mbps. */
  downlink?: number;
}

/*
|--------------------------------------------------------------------------
| Crash Reporter
|--------------------------------------------------------------------------
*/

/** Configuration for the CrashReporterService. */
export interface CrashReporterConfig {
  /** Sentry DSN for error reporting. */
  sentryDsn?: string;
  /** Environment name (e.g. 'production', 'staging'). */
  environment?: string;
  /** Release version string. */
  release?: string;
  /** Whether to enable the Electron crashReporter. @default true */
  enableElectronCrashReporter?: boolean;
}
