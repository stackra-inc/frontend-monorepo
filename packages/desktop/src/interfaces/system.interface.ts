/**
 * System Integration Interfaces
 *
 * |--------------------------------------------------------------------------
 * | Types for clipboard, file system, protocol, power, notification,
 * | and permission services.
 * |--------------------------------------------------------------------------
 * |
 * @module @stackra/ts-desktop
 */

/*
|--------------------------------------------------------------------------
| File System
|--------------------------------------------------------------------------
*/

/** Options for file open/save dialogs. */
export interface FileDialogOptions {
  /** Dialog title. */
  title?: string;
  /** File type filters. */
  filters?: Array<{ name: string; extensions: string[] }>;
  /** Default file path. */
  defaultPath?: string;
}

/** Result of a file open operation. */
export interface FileResult {
  /** File path. */
  path: string;
  /** File content (text or binary). */
  content: string | ArrayBuffer;
}

/*
|--------------------------------------------------------------------------
| Protocol
|--------------------------------------------------------------------------
*/

/** A parsed custom protocol URL. */
export interface ParsedProtocolUrl {
  /** The full original URL string. */
  raw: string;
  /** URL scheme (e.g. 'stackra-inc'). */
  scheme: string;
  /** Path segments (e.g. ['open', 'order']). */
  pathSegments: string[];
  /** Query parameters as key-value pairs. */
  query: Record<string, string>;
}

/*
|--------------------------------------------------------------------------
| Power
|--------------------------------------------------------------------------
*/

/** System power state. */
export type PowerState = 'on-ac' | 'on-battery' | 'unknown';

/*
|--------------------------------------------------------------------------
| Notifications
|--------------------------------------------------------------------------
*/

/** Options for showing a notification. */
export interface NotificationOptions {
  /** Notification title. */
  title: string;
  /** Notification body text. */
  body: string;
  /** Path to notification icon. */
  icon?: string;
  /** Whether to play the notification sound. @default false */
  sound?: boolean;
  /** Action buttons on the notification. */
  actions?: Array<{ id: string; label: string }>;
  /** Whether the notification should be silent. @default false */
  silent?: boolean;
  /** Urgency level. @default 'normal' */
  urgency?: 'low' | 'normal' | 'critical';
}

/*
|--------------------------------------------------------------------------
| Permissions
|--------------------------------------------------------------------------
*/

/** Device types that can be permission-managed. */
export type DeviceType = 'usb' | 'bluetooth' | 'serial' | 'camera' | 'microphone';

/** Permission state for a device type. */
export type PermissionState = 'granted' | 'denied' | 'prompt' | 'unsupported';
