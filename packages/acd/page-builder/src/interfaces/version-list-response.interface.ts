/**
 * @fileoverview VersionListResponse interface — paginated response from
 * the backend version history API endpoint.
 *
 * @module @stackra/react-page-builder
 * @category Interfaces
 */

import type { VersionEntry } from "./version-entry.interface";

/**
 * Paginated response from the version history API.
 *
 * Used by the VersionHistory panel to display version entries
 * with pagination controls.
 */
export interface VersionListResponse {
  /** Array of version entries for the current page */
  versions: VersionEntry[];

  /** Total number of versions across all pages */
  total: number;

  /** Current page number (1-indexed) */
  page: number;

  /** Number of items per page */
  perPage: number;
}
