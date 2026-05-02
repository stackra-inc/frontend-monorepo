/**
 * Global Translation Function Declarations
 *
 * These functions are registered on `globalThis` via `GlobalRegistry`
 * from `@stackra/ts-support` when `bootI18nGlobals()` is called.
 *
 * This follows the same pattern as `env()`, `collect()`, `tap()`, etc.
 * from `@stackra/ts-support`.
 *
 * Add to your `tsconfig.json` for IDE autocomplete:
 * ```json
 * {
 *   "compilerOptions": {
 *     "types": ["@stackra/react-i18n/@types"]
 *   }
 * }
 * ```
 *
 * @module @types/globals
 */

declare global {
  /**
   * Simple translation function (no interpolation).
   *
   * @param key - The translation key (e.g. `'common.welcome'`)
   * @returns The translated string
   */
  function __(key: string): string;

  /**
   * Main translation function with optional interpolation.
   *
   * @param key - The translation key (e.g. `'common.hello_user'`)
   * @param options - Optional i18next options (interpolation values, etc.)
   * @returns The translated string
   */
  function t(key: string, options?: Record<string, any>): string;

  /**
   * Translation function (alias for t).
   *
   * @param key - The translation key
   * @param options - Optional i18next options
   * @returns The translated string
   */
  function trans(key: string, options?: Record<string, any>): string;
}

export {};
