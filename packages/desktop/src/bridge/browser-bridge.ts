/**
 * Browser Bridge
 *
 * No-op / fallback implementation for when the app runs in a regular browser.
 * Provides graceful degradation — print uses window.print(), notifications
 * use the Notification API, etc.
 *
 * @module @stackra/ts-desktop
 */

import type { DesktopBridge } from '@/interfaces';

export class BrowserBridge implements DesktopBridge {
  readonly isDesktop = false;

  getAppVersion(): string {
    return '0.0.0-web';
  }

  async print(html: string): Promise<void> {
    const win = window.open('', '_blank', 'width=400,height=600');
    if (win) {
      win.document.write(html);
      win.document.close();
      win.focus();
      win.print();
      win.close();
    }
  }

  async openCashDrawer(): Promise<void> {
    console.warn('[BrowserBridge] Cash drawer not available in browser.');
  }

  async exportFile(data: string, filename: string): Promise<string | null> {
    const blob = new Blob([data], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    return filename;
  }

  async notify(title: string, body: string): Promise<void> {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, { body });
    } else if ('Notification' in window) {
      const perm = await Notification.requestPermission();
      if (perm === 'granted') new Notification(title, { body });
    }
  }

  async checkForUpdates(): Promise<null> {
    return null;
  }

  onMenuAction(_channel: string, _callback: (...args: unknown[]) => void): () => void {
    return () => {};
  }

  send(_channel: string, ..._args: unknown[]): void {
    // No-op in browser.
  }

  async invoke<T = unknown>(_channel: string, ..._args: unknown[]): Promise<T> {
    return undefined as T;
  }
}
