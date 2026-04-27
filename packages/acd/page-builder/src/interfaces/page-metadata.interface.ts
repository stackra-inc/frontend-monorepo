/**
 * @fileoverview PageMetadata interface — metadata fields included in the
 * root-level Page_JSON document alongside the component tree.
 *
 * @module @stackra/react-page-builder
 * @category Interfaces
 */

/**
 * Metadata about a page, stored at the root level of the Page_JSON document.
 *
 * Timestamps use ISO 8601 format (e.g. "2024-01-15T10:30:00.000Z").
 */
export interface PageMetadata {
  /** Page title displayed in the editor and page listings */
  title: string;

  /** Page description for search and documentation purposes */
  description: string;

  /** ISO 8601 creation timestamp */
  createdAt: string;

  /** ISO 8601 last-modified timestamp */
  updatedAt: string;
}
