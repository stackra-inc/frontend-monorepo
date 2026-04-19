/**
 * File System Service
 *
 * |--------------------------------------------------------------------------
 * | Native file open/save dialogs and drag-and-drop handling.
 * |--------------------------------------------------------------------------
 * |
 * | In Electron: shows native file dialogs via IPC to the main process.
 * | In browser: uses HTML file input for open, triggers download for save.
 * |
 * | Usage:
 * |   const fs = container.get(FileSystemService);
 * |   const file = await fs.openFile({ filters: [{ name: 'CSV', extensions: ['csv'] }] });
 * |   await fs.saveFile(csvData, { defaultPath: 'export.csv' });
 * |
 * @module @stackra-inc/ts-desktop
 */

import { Injectable, Inject } from '@stackra-inc/ts-container';

import type { FileDialogOptions, FileResult } from '@/interfaces/system.interface';
import { DesktopManager } from './desktop-manager.service';

@Injectable()
export class FileSystemService {
  constructor(@Inject(DesktopManager) private readonly desktop: DesktopManager) {}

  /*
  |--------------------------------------------------------------------------
  | openFile
  |--------------------------------------------------------------------------
  |
  | Opens a file selection dialog and returns the selected file.
  |
  | Electron: native dialog via IPC.
  | Browser: hidden <input type="file"> element.
  |
  */
  async openFile(options?: FileDialogOptions): Promise<FileResult | null> {
    if (this.desktop.isDesktop) {
      return this.desktop.bridge.invoke<FileResult | null>('fs:open', options);
    }

    return this.browserOpenFile(options);
  }

  /*
  |--------------------------------------------------------------------------
  | saveFile
  |--------------------------------------------------------------------------
  |
  | Saves data to a file.
  |
  | Electron: native save dialog via IPC.
  | Browser: triggers a download with the given filename.
  |
  */
  async saveFile(data: string | ArrayBuffer, options?: FileDialogOptions): Promise<string | null> {
    if (this.desktop.isDesktop) {
      return this.desktop.bridge.invoke<string | null>('fs:save', data, options);
    }

    return this.browserSaveFile(data, options);
  }

  /*
  |--------------------------------------------------------------------------
  | onDrop
  |--------------------------------------------------------------------------
  |
  | Registers a drag-and-drop handler on the given element (or document).
  | Returns an unsubscribe function.
  |
  */
  onDrop(callback: (files: File[]) => void, element?: HTMLElement): () => void {
    const target = element ?? document.body;

    const handleDragOver = (e: DragEvent): void => {
      e.preventDefault();
      e.stopPropagation();
    };

    const handleDrop = (e: DragEvent): void => {
      e.preventDefault();
      e.stopPropagation();

      const files = e.dataTransfer?.files;
      if (files && files.length > 0) {
        callback(Array.from(files));
      }
    };

    target.addEventListener('dragover', handleDragOver);
    target.addEventListener('drop', handleDrop);

    return () => {
      target.removeEventListener('dragover', handleDragOver);
      target.removeEventListener('drop', handleDrop);
    };
  }

  /*
  |--------------------------------------------------------------------------
  | Browser Fallbacks
  |--------------------------------------------------------------------------
  */

  /** Opens a hidden file input and resolves with the selected file. */
  private browserOpenFile(options?: FileDialogOptions): Promise<FileResult | null> {
    return new Promise((resolve) => {
      const input = document.createElement('input');
      input.type = 'file';

      /* Build accept string from filters. */
      if (options?.filters?.length) {
        const extensions = options.filters.flatMap((f) => f.extensions.map((ext) => `.${ext}`));
        input.accept = extensions.join(',');
      }

      input.onchange = async () => {
        const file = input.files?.[0];
        if (!file) {
          resolve(null);
          return;
        }

        const content = await file.text();
        resolve({ path: file.name, content });
      };

      /* Handle cancel — onchange won't fire, so use a focus listener. */
      input.oncancel = () => resolve(null);

      input.click();
    });
  }

  /** Triggers a browser download with the given data. */
  private browserSaveFile(
    data: string | ArrayBuffer,
    options?: FileDialogOptions
  ): Promise<string | null> {
    const blob =
      typeof data === 'string'
        ? new Blob([data], { type: 'text/plain' })
        : new Blob([data], { type: 'application/octet-stream' });

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = options?.defaultPath ?? 'download';
    a.click();
    URL.revokeObjectURL(url);

    return Promise.resolve(options?.defaultPath ?? 'download');
  }
}
