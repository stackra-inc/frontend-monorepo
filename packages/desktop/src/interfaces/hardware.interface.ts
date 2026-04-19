/**
 * POS Hardware Interfaces
 *
 * |--------------------------------------------------------------------------
 * | Types for printer, cash drawer, scanner, scale, and display services.
 * |--------------------------------------------------------------------------
 * |
 * @module @stackra-inc/ts-desktop
 */

/*
|--------------------------------------------------------------------------
| Printer
|--------------------------------------------------------------------------
*/

/** Configuration for a thermal receipt printer. */
export interface PrinterConfig {
  /** Connection type. */
  type: 'serial' | 'usb' | 'network';
  /** Serial port path (e.g. '/dev/ttyUSB0' or 'COM3'). */
  path?: string;
  /** USB vendor ID. */
  vendorId?: number;
  /** USB product ID. */
  productId?: number;
  /** Network printer IP address. */
  ip?: string;
  /** Network printer port. */
  port?: number;
  /** Character width (48 for 58mm, 80 for 80mm). @default 80 */
  width?: 48 | 80;
}

/** Information about a detected printer. */
export interface PrinterInfo {
  /** Printer display name. */
  name: string;
  /** Serial port path or USB device path. */
  path: string;
  /** Connection type. */
  type: 'serial' | 'usb';
}

/** Data for a receipt to be printed. */
export interface ReceiptData {
  /** Store/business header text. */
  header?: string;
  /** Line items on the receipt. */
  items: ReceiptItem[];
  /** Subtotal before tax. */
  subtotal: number;
  /** Tax amount. */
  tax?: number;
  /** Total amount. */
  total: number;
  /** Footer text (e.g. "Thank you!"). */
  footer?: string;
  /** Payment method description. */
  paymentMethod?: string;
  /** Barcode to print at the bottom. */
  barcode?: string;
}

/** A single line item on a receipt. */
export interface ReceiptItem {
  /** Item name. */
  name: string;
  /** Quantity. */
  quantity: number;
  /** Unit price. */
  price: number;
  /** Total for this line (quantity × price). */
  total?: number;
}

/*
|--------------------------------------------------------------------------
| Cash Drawer
|--------------------------------------------------------------------------
*/

/** Configuration for a cash drawer. */
export interface CashDrawerConfig {
  /** How the drawer is connected. */
  type: 'serial' | 'printer-kick';
  /** Serial port path (for direct serial connection). */
  path?: string;
  /** Printer config (for printer-kick — drawer connected to printer). */
  printerConfig?: PrinterConfig;
}

/*
|--------------------------------------------------------------------------
| Scanner
|--------------------------------------------------------------------------
*/

/** Configuration for a barcode scanner (HID keyboard mode). */
export interface ScannerConfig {
  /** Max ms between keystrokes to be considered scanner input. @default 50 */
  keystrokeThreshold?: number;
  /** Key that terminates a scan. @default 'Enter' */
  terminatorKey?: string;
  /** Minimum barcode length to accept. @default 4 */
  minLength?: number;
}

/*
|--------------------------------------------------------------------------
| Scale
|--------------------------------------------------------------------------
*/

/** Configuration for a weight scale. */
export interface ScaleConfig {
  /** Serial port path. */
  path: string;
  /** Baud rate. @default 9600 */
  baudRate?: number;
  /** Scale protocol. @default 'generic' */
  protocol?: 'toledo' | 'cas' | 'generic';
}

/** A weight reading from the scale. */
export interface ScaleReading {
  /** Weight value. */
  weight: number;
  /** Weight unit. */
  unit: 'kg' | 'lb' | 'g';
  /** Whether the reading is stable. */
  stable: boolean;
}

/*
|--------------------------------------------------------------------------
| Display
|--------------------------------------------------------------------------
*/

/** Configuration for a customer-facing display. */
export interface DisplayConfig {
  /** Display type. */
  type: 'pole' | 'screen';
  /** Serial port path (for pole display). */
  path?: string;
  /** Screen index (for second screen display). */
  screenIndex?: number;
}

/** Information about an available display. */
export interface DisplayInfo {
  /** Display identifier. */
  id: string;
  /** Display name. */
  name: string;
  /** Display type. */
  type: 'pole' | 'screen';
}
