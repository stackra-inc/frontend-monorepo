/**
 * @fileoverview TemplateRegistry — stores page templates keyed by template ID.
 *
 * Extends `BaseRegistry<PageTemplate>` from `@stackra/ts-support` for
 * the standard registry API (`register`, `get`, `has`, `getAll`, `getKeys`,
 * `remove`, `clear`, `count`). Adds a convenience `getTemplates()` method.
 *
 * Registered via `PageBuilderModule.forRoot()` as a DI-managed singleton.
 * Built-in templates (Blank, Dashboard, Landing_Page, Form_Page) are seeded
 * during module bootstrap. Custom templates are added via
 * `PageBuilderModule.forFeature({ templates })`.
 *
 * @module @stackra/react-page-builder
 * @category Registries
 */

import { Injectable } from "@stackra/ts-container";
import { BaseRegistry } from "@stackra/ts-support";
import type { PageTemplate } from "@/interfaces/page-template.interface";

/**
 * Registry for page builder templates.
 *
 * Stores {@link PageTemplate} objects keyed by their `id` string.
 * The TemplateDialog reads from this registry to display available
 * templates when a user creates a new page.
 *
 * @example
 * ```typescript
 * const registry = new TemplateRegistry();
 * registry.register("blank", blankTemplate);
 *
 * registry.getTemplates(); // → [blankTemplate, ...]
 * ```
 */
@Injectable()
export class TemplateRegistry extends BaseRegistry<PageTemplate> {
  /*
  |--------------------------------------------------------------------------
  | getTemplates
  |--------------------------------------------------------------------------
  |
  | Returns all registered templates in registration order.
  | Used by the TemplateDialog to list available starting points.
  |
  */

  /**
   * Get all registered page templates.
   *
   * @returns Array of {@link PageTemplate} entries in registration order
   */
  public getTemplates(): PageTemplate[] {
    return this.getAll();
  }
}
