/**
 * Auto-Update Interfaces
 *
 * |--------------------------------------------------------------------------
 * | Types for the auto-update service lifecycle events.
 * |--------------------------------------------------------------------------
 * |
 * @module @stackra-inc/ts-desktop
 */

/*
|--------------------------------------------------------------------------
| Update Event
|--------------------------------------------------------------------------
*/

/** Events emitted during the update lifecycle. */
export type UpdateEvent =
  | { type: 'checking' }
  | { type: 'available'; version: string }
  | { type: 'not-available' }
  | { type: 'downloading'; progress: number }
  | { type: 'downloaded'; version: string }
  | { type: 'error'; error: string };

/*
|--------------------------------------------------------------------------
| Update Info
|--------------------------------------------------------------------------
*/

/** Information about an available update. */
export interface UpdateInfo {
  /** New version string. */
  version: string;
  /** Release notes (markdown or plain text). */
  releaseNotes?: string;
  /** Release date ISO string. */
  releaseDate?: string;
}
