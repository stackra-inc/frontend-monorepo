/**
 * Desktop Bridge Interface
 *
 * |--------------------------------------------------------------------------
 * | Platform abstraction layer.
 * |--------------------------------------------------------------------------
 * |
 * | Same API in Electron and browser. The DesktopModule auto-detects
 * | the platform and registers the correct implementation:
 * |   - ElectronBridge: real IPC via window.electronAPI
 * |   - BrowserBridge: graceful fallbacks (window.print, etc.)
 * |
 * @module @stackra-inc/ts-desktop
 */

export interface DesktopBridge {
  /** Whether the app is running inside Electron. */
  readonly isDesktop: boolean;

  /** Get the app version from Electron or package.json. */
  getAppVersion(): string;

  /** Print HTML content (receipt, report, etc.). */
  print(html: string): Promise<void>;

  /** Open the cash drawer (serial port command). */
  openCashDrawer(): Promise<void>;

  /** Export data to a file (opens save dialog in Electron). */
  exportFile(data: string, filename: string): Promise<string | null>;

  /** Show an OS notification. */
  notify(title: string, body: string): Promise<void>;

  /** Check for app updates (Electron only). */
  checkForUpdates(): Promise<{ available: boolean; version?: string } | null>;

  /** Listen for a menu action from the main process. Returns unsubscribe fn. */
  onMenuAction(channel: string, callback: (...args: unknown[]) => void): () => void;

  /** Send a message to the main process. */
  send(channel: string, ...args: unknown[]): void;

  /** Invoke a main process handler and get a result. */
  invoke<T = unknown>(channel: string, ...args: unknown[]): Promise<T>;
}
