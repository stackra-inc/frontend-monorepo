/**
 * Scanner Service
 *
 * |--------------------------------------------------------------------------
 * | Barcode scanner input detection via HID keyboard mode.
 * |--------------------------------------------------------------------------
 * |
 * | Listens for rapid keystroke sequences characteristic of HID barcode
 * | scanners. Distinguishes scanner input from normal keyboard typing
 * | based on inter-keystroke timing.
 * |
 * | Works identically in Electron and browser — no bridge needed.
 * |
 * | Usage:
 * |   const scanner = container.get(ScannerService);
 * |   scanner.start();
 * |   const unsub = scanner.onScan((barcode) => console.log(barcode));
 * |   // later: unsub(); scanner.stop();
 * |
 * @module @stackra-inc/ts-desktop
 */

import { Injectable, Inject } from '@stackra-inc/ts-container';

import { DESKTOP_CONFIG } from '@/constants';
import type { DesktopModuleOptions } from '@/interfaces/desktop-module-options.interface';
import type { ScannerConfig } from '@/interfaces/hardware.interface';

@Injectable()
export class ScannerService {
  /** Keystroke timing threshold in ms. */
  private threshold: number;

  /** Key that terminates a scan. */
  private terminatorKey: string;

  /** Minimum barcode length to accept. */
  private minLength: number;

  /** Buffer of keystrokes being accumulated. */
  private buffer: string[] = [];

  /** Timestamp of the last keystroke. */
  private lastKeystrokeTime = 0;

  /** Registered scan callbacks. */
  private callbacks = new Set<(barcode: string) => void>();

  /** Whether the scanner listener is active. */
  private active = false;

  /** Bound keydown handler reference (for removeEventListener). */
  private readonly handleKeydown: (e: KeyboardEvent) => void;

  constructor(@Inject(DESKTOP_CONFIG) private readonly moduleConfig: DesktopModuleOptions) {
    /*
    |--------------------------------------------------------------------------
    | Apply config from module options or use defaults.
    |--------------------------------------------------------------------------
    */
    const cfg: ScannerConfig = this.moduleConfig.scanner ?? {};
    this.threshold = cfg.keystrokeThreshold ?? 50;
    this.terminatorKey = cfg.terminatorKey ?? 'Enter';
    this.minLength = cfg.minLength ?? 4;

    /* Bind the handler once so we can add/remove it cleanly. */
    this.handleKeydown = this.onKeydown.bind(this);
  }

  /*
  |--------------------------------------------------------------------------
  | onScan
  |--------------------------------------------------------------------------
  |
  | Register a callback to receive scanned barcode strings.
  | Returns an unsubscribe function.
  |
  */
  onScan(callback: (barcode: string) => void): () => void {
    this.callbacks.add(callback);
    return () => {
      this.callbacks.delete(callback);
    };
  }

  /*
  |--------------------------------------------------------------------------
  | setScanThreshold
  |--------------------------------------------------------------------------
  |
  | Update the keystroke timing threshold (ms between keystrokes).
  |
  */
  setScanThreshold(ms: number): void {
    this.threshold = ms;
  }

  /*
  |--------------------------------------------------------------------------
  | start / stop
  |--------------------------------------------------------------------------
  |
  | Attach or detach the DOM keydown listener.
  |
  */
  start(): void {
    if (this.active) return;
    if (typeof document === 'undefined') return;

    document.addEventListener('keydown', this.handleKeydown, true);
    this.active = true;
  }

  stop(): void {
    if (!this.active) return;
    if (typeof document === 'undefined') return;

    document.removeEventListener('keydown', this.handleKeydown, true);
    this.active = false;
    this.resetBuffer();
  }

  /*
  |--------------------------------------------------------------------------
  | Private: keydown handler
  |--------------------------------------------------------------------------
  |
  | Accumulates keystrokes. If all inter-keystroke gaps are below the
  | threshold and the sequence is terminated by the terminator key
  | with length >= minLength, it's emitted as a barcode scan.
  |
  */
  private onKeydown(e: KeyboardEvent): void {
    const now = Date.now();

    /*
    |--------------------------------------------------------------------------
    | Check if this keystroke is part of a rapid sequence.
    |--------------------------------------------------------------------------
    */
    if (this.buffer.length > 0 && now - this.lastKeystrokeTime > this.threshold) {
      /* Gap too large — reset buffer, this is normal typing. */
      this.resetBuffer();
    }

    this.lastKeystrokeTime = now;

    /*
    |--------------------------------------------------------------------------
    | Terminator key — check if we have a valid scan.
    |--------------------------------------------------------------------------
    */
    if (e.key === this.terminatorKey) {
      if (this.buffer.length >= this.minLength) {
        const barcode = this.buffer.join('');
        this.emitScan(barcode);
      }
      this.resetBuffer();
      return;
    }

    /*
    |--------------------------------------------------------------------------
    | Accumulate printable characters only.
    |--------------------------------------------------------------------------
    */
    if (e.key.length === 1) {
      this.buffer.push(e.key);
    }
  }

  /** Emit a scanned barcode to all registered callbacks. */
  private emitScan(barcode: string): void {
    for (const cb of this.callbacks) {
      try {
        cb(barcode);
      } catch (err) {
        console.error('[ScannerService] Callback error:', err);
      }
    }
  }

  /** Reset the keystroke buffer. */
  private resetBuffer(): void {
    this.buffer = [];
    this.lastKeystrokeTime = 0;
  }
}
