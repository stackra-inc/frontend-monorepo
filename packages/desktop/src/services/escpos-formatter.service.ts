/**
 * ESC/POS Formatter Service
 *
 * |--------------------------------------------------------------------------
 * | Converts receipt data into ESC/POS byte commands.
 * |--------------------------------------------------------------------------
 * |
 * | Encapsulates the ESC/POS protocol constants and formatting logic.
 * | Injectable so it can be swapped for different printer protocols
 * | (Star, Citizen, custom) by providing a different implementation.
 * |
 * | Usage:
 * |   const formatter = container.get(EscPosFormatter);
 * |   const bytes = formatter.formatReceipt(receiptData, 80);
 * |
 * @module @stackra-inc/ts-desktop
 */

import { Str } from '@stackra-inc/ts-support';
import { Injectable } from '@stackra-inc/ts-container';

import type { ReceiptData, ReceiptItem } from '@/interfaces/hardware.interface';

/*
|--------------------------------------------------------------------------
| ESC/POS Protocol Constants
|--------------------------------------------------------------------------
|
| These are the standard ESC/POS command bytes used by most thermal
| receipt printers (Epson, Star, Citizen, etc.).
|
| They live inside the formatter — not in the DI container — because
| they are static protocol constants with no dependencies or config.
|
*/

/** Initialize printer — resets to default settings. */
const CMD_INIT = new Uint8Array([0x1b, 0x40]);

/** Line feed — advance paper one line. */
const CMD_LF = new Uint8Array([0x0a]);

/** Partial cut — cut paper leaving a small tab. */
const CMD_CUT = new Uint8Array([0x1d, 0x56, 0x01]);

/** Bold on — enable emphasized printing. */
const CMD_BOLD_ON = new Uint8Array([0x1b, 0x45, 0x01]);

/** Bold off — disable emphasized printing. */
const CMD_BOLD_OFF = new Uint8Array([0x1b, 0x45, 0x00]);

/** Center alignment. */
const CMD_CENTER = new Uint8Array([0x1b, 0x61, 0x01]);

/** Left alignment. */
const CMD_LEFT = new Uint8Array([0x1b, 0x61, 0x00]);

@Injectable()
export class EscPosFormatter {
  /*
  |--------------------------------------------------------------------------
  | formatReceipt
  |--------------------------------------------------------------------------
  |
  | Converts receipt data into a complete ESC/POS byte sequence.
  | Starts with init command, ends with cut command.
  |
  */
  formatReceipt(data: ReceiptData, width = 80): Uint8Array {
    const parts: Uint8Array[] = [];

    /* Initialize printer. */
    parts.push(CMD_INIT);

    /* Header (centered, bold). */
    if (data.header) {
      parts.push(CMD_CENTER, CMD_BOLD_ON);
      parts.push(this.textToBytes(data.header));
      parts.push(CMD_LF, CMD_BOLD_OFF, CMD_LEFT);
      parts.push(CMD_LF);
    }

    /* Separator line. */
    parts.push(this.textToBytes(Str.repeat('-', width)));
    parts.push(CMD_LF);

    /* Line items. */
    for (const item of data.items) {
      const line = this.formatItemLine(item, width);
      parts.push(this.textToBytes(line));
      parts.push(CMD_LF);
    }

    /* Separator line. */
    parts.push(this.textToBytes(Str.repeat('-', width)));
    parts.push(CMD_LF);

    /* Subtotal. */
    if (data.subtotal !== undefined) {
      parts.push(this.textToBytes(this.padLine('Subtotal', data.subtotal.toFixed(2), width)));
      parts.push(CMD_LF);
    }

    /* Tax. */
    if (data.tax !== undefined) {
      parts.push(this.textToBytes(this.padLine('Tax', data.tax.toFixed(2), width)));
      parts.push(CMD_LF);
    }

    /* Total (bold). */
    parts.push(CMD_BOLD_ON);
    parts.push(this.textToBytes(this.padLine('TOTAL', data.total.toFixed(2), width)));
    parts.push(CMD_LF, CMD_BOLD_OFF);

    /* Payment method. */
    if (data.paymentMethod) {
      parts.push(CMD_LF);
      parts.push(this.textToBytes(this.padLine('Paid by', data.paymentMethod, width)));
      parts.push(CMD_LF);
    }

    /* Footer (centered). */
    if (data.footer) {
      parts.push(CMD_LF, CMD_CENTER);
      parts.push(this.textToBytes(data.footer));
      parts.push(CMD_LF, CMD_LEFT);
    }

    /* Feed and cut. */
    parts.push(CMD_LF, CMD_LF, CMD_LF);
    parts.push(CMD_CUT);

    return this.concatBytes(parts);
  }

  /*
  |--------------------------------------------------------------------------
  | formatItemLine
  |--------------------------------------------------------------------------
  |
  | Formats a single receipt line item: "2x Widget          $19.98"
  |
  */
  formatItemLine(item: ReceiptItem, width: number): string {
    const qty = `${item.quantity}x `;
    const total = (item.total ?? item.quantity * item.price).toFixed(2);
    const priceStr = `$${total}`;
    const nameWidth = width - qty.length - priceStr.length;
    const name = item.name.length > nameWidth ? Str.take(item.name, nameWidth) : item.name;
    const padding = Str.repeat(' ', Math.max(1, nameWidth - name.length));
    return `${qty}${name}${padding}${priceStr}`;
  }

  /*
  |--------------------------------------------------------------------------
  | Helpers
  |--------------------------------------------------------------------------
  */

  /** Pad a label-value pair to fill the line width. */
  padLine(label: string, value: string, width: number): string {
    const padding = Str.repeat(' ', Math.max(1, width - label.length - value.length));
    return `${label}${padding}${value}`;
  }

  /** Encode a string as UTF-8 bytes. */
  textToBytes(text: string): Uint8Array {
    return new TextEncoder().encode(text);
  }

  /** Concatenate multiple Uint8Arrays into one. */
  concatBytes(arrays: Uint8Array[]): Uint8Array {
    const totalLength = arrays.reduce((sum, arr) => sum + arr.length, 0);
    const result = new Uint8Array(totalLength);
    let offset = 0;
    for (const arr of arrays) {
      result.set(arr, offset);
      offset += arr.length;
    }
    return result;
  }
}
