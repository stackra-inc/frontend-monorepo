/**
 * Printer Service
 *
 * |--------------------------------------------------------------------------
 * | ESC/POS thermal receipt printing.
 * |--------------------------------------------------------------------------
 * |
 * | In Electron: sends ESC/POS commands to a configured thermal printer
 * | via serial or USB through IPC to the main process.
 * |
 * | In browser: falls back to window.print() with HTML content.
 * |
 * | Delegates formatting to EscPosFormatter (injectable, swappable
 * | for Star/Citizen/custom protocols).
 * |
 * | Usage:
 * |   const printer = container.get(PrinterService);
 * |   printer.configurePrinter({ type: 'usb', vendorId: 0x04b8, productId: 0x0202 });
 * |   await printer.printReceipt({ items: [...], total: 42.50 });
 * |
 * @module @stackra-inc/ts-desktop
 */

import { Injectable, Inject } from '@stackra-inc/ts-container';

import { DESKTOP_CONFIG } from '@/constants';
import type { DesktopModuleOptions } from '@/interfaces/desktop-module-options.interface';
import type { PrinterConfig, PrinterInfo, ReceiptData } from '@/interfaces/hardware.interface';
import { DesktopManager } from './desktop-manager.service';
import { EscPosFormatter } from './escpos-formatter.service';
import { HardwareNotConfiguredError } from '@/errors';

@Injectable()
export class PrinterService {
  /** Current printer configuration. */
  private config: PrinterConfig | null = null;

  constructor(
    @Inject(DesktopManager) private readonly desktop: DesktopManager,
    @Inject(EscPosFormatter) private readonly formatter: EscPosFormatter,
    @Inject(DESKTOP_CONFIG) private readonly moduleConfig: DesktopModuleOptions
  ) {
    /*
    |--------------------------------------------------------------------------
    | Apply config from module options if provided.
    |--------------------------------------------------------------------------
    */
    if (this.moduleConfig.printer) {
      this.config = this.moduleConfig.printer;
    }
  }

  /*
  |--------------------------------------------------------------------------
  | printReceipt
  |--------------------------------------------------------------------------
  |
  | Formats receipt data into ESC/POS commands and sends to the printer.
  | In browser mode, falls back to window.print() with HTML.
  |
  */
  async printReceipt(data: ReceiptData): Promise<void> {
    if (!this.desktop.isDesktop) {
      return this.desktop.bridge.print(this.receiptToHtml(data));
    }

    this.ensureConfigured();
    const commands = this.formatter.formatReceipt(data, this.config!.width);
    await this.desktop.bridge.invoke('printer:print-escpos', commands, this.config);
  }

  /*
  |--------------------------------------------------------------------------
  | printRaw
  |--------------------------------------------------------------------------
  |
  | Sends raw ESC/POS byte commands directly to the printer.
  |
  */
  async printRaw(commands: Uint8Array): Promise<void> {
    if (!this.desktop.isDesktop) {
      console.warn('[PrinterService] Raw ESC/POS printing not available in browser.');
      return;
    }

    this.ensureConfigured();
    await this.desktop.bridge.invoke('printer:print-escpos', commands, this.config);
  }

  /*
  |--------------------------------------------------------------------------
  | getAvailablePrinters
  |--------------------------------------------------------------------------
  |
  | Returns a list of detected serial and USB printers.
  | In browser mode, returns an empty array.
  |
  */
  async getAvailablePrinters(): Promise<PrinterInfo[]> {
    if (!this.desktop.isDesktop) {
      return [];
    }

    return this.desktop.bridge.invoke<PrinterInfo[]>('printer:list');
  }

  /*
  |--------------------------------------------------------------------------
  | configurePrinter
  |--------------------------------------------------------------------------
  |
  | Stores the printer configuration for subsequent print jobs.
  |
  */
  configurePrinter(config: PrinterConfig): void {
    this.config = config;
  }

  /*
  |--------------------------------------------------------------------------
  | Private Helpers
  |--------------------------------------------------------------------------
  */

  /** Throws if no printer is configured. */
  private ensureConfigured(): void {
    if (!this.config) {
      throw new HardwareNotConfiguredError('PrinterService');
    }
  }

  /** Convert receipt data to HTML for browser fallback. */
  private receiptToHtml(data: ReceiptData): string {
    const lines: string[] = [
      "<html><body style='font-family:monospace;font-size:12px;width:300px;margin:auto'>",
    ];
    if (data.header) lines.push(`<h2 style='text-align:center'>${data.header}</h2>`);
    lines.push('<hr>');
    for (const item of data.items) {
      const total = (item.total ?? item.quantity * item.price).toFixed(2);
      lines.push(
        `<div>${item.quantity}x ${item.name} <span style='float:right'>$${total}</span></div>`
      );
    }
    lines.push('<hr>');
    lines.push(
      `<div><strong>TOTAL <span style='float:right'>$${data.total.toFixed(2)}</span></strong></div>`
    );
    if (data.footer) lines.push(`<p style='text-align:center'>${data.footer}</p>`);
    lines.push('</body></html>');
    return lines.join('\n');
  }
}
