/**
 * @fileoverview PageTemplate interface — a pre-built page layout that
 * users can select as a starting point for a new page.
 *
 * Templates are stored in the TemplateRegistry and displayed in the
 * TemplateDialog when creating a new page.
 *
 * @module @stackra/react-page-builder
 * @category Interfaces
 */

import type { PageJson } from "./page-json.interface";

/**
 * A pre-built page template providing a starting point for new pages.
 *
 * Registered via `PageBuilderModule.forRoot()` (built-in templates)
 * or `PageBuilderModule.forFeature({ templates })` (custom templates).
 */
export interface PageTemplate {
  /** Unique template identifier */
  id: string;

  /** Template display name shown in the template picker */
  name: string;

  /** Template description explaining its purpose and layout */
  description: string;

  /** Optional thumbnail URL for visual preview in the template picker */
  thumbnail?: string;

  /** The template's Page_JSON content loaded into the Canvas on selection */
  pageJson: PageJson;
}
