/**
 * @fileoverview VersionEntry interface — a single entry in the page
 * version history list returned by the backend API.
 *
 * @module @stackra/react-page-builder
 * @category Interfaces
 */

/**
 * A single version entry in the page version history.
 *
 * Displayed in the VersionHistory panel with version number,
 * author, timestamp, and optional label.
 */
export interface VersionEntry {
  /** Unique version identifier (backend-assigned) */
  id: string;

  /** Sequential version number (1, 2, 3, ...) */
  versionNumber: number;

  /** Display name of the author who created this version */
  authorName: string;

  /** ISO 8601 timestamp of when this version was saved */
  timestamp: string;

  /** Optional user-provided label or comment for this version */
  label?: string;
}
