/**
 * @fileoverview Global Helper Registry — extensible global function management.
 *
 * Provides a centralized registry where `@stackra/ts-support` and other
 * packages can register global helper functions. Once registered, helpers
 * are available on the `globalThis` object and can be called without imports.
 *
 * ## How It Works
 *
 * 1. **Support registers built-in helpers** — `env()`, `str()`, `collect()`, etc.
 *    are registered automatically when `bootGlobals()` is called.
 *
 * 2. **Other packages extend the registry** — any `@stackra/*` package can
 *    call `GlobalRegistry.register()` to add its own helpers.
 *
 * 3. **TypeScript types** — consumers add `@stackra/ts-support/@types` to
 *    their `tsconfig.json` `types` array for full IntelliSense.
 *
 * ## Architecture
 *
 * ```
 * GlobalRegistry (singleton)
 *   ├── register(name, fn)     — add a helper
 *   ├── registerMany(map)      — add multiple helpers at once
 *   ├── unregister(name)       — remove a helper
 *   ├── boot()                 — install all registered helpers onto globalThis
 *   ├── isBooted()             — check if boot() has been called
 *   └── reset()                — remove all helpers (for testing)
 *
 * bootGlobals()                — registers built-in helpers + calls boot()
 * ```
 *
 * ## Safety
 *
 * - Helpers are only installed on `globalThis` when `boot()` is called.
 *   This is opt-in — no globals are polluted by simply importing the package.
 * - Existing `globalThis` properties are **never** overwritten unless
 *   `force: true` is passed to `register()`.
 * - A warning is logged if a name collision is detected.
 *
 * @module globals/global-registry
 * @category Globals
 */

// ============================================================================
// Types
// ============================================================================

/**
 * A global helper function that can be registered.
 *
 * Can be any callable — arrow function, class method reference,
 * or traditional function.
 */
export type GlobalHelper = (...args: any[]) => any;

/**
 * Options for registering a global helper.
 */
export interface RegisterOptions {
  /**
   * If `true`, overwrite an existing global with the same name.
   * Default: `false` — a warning is logged and the existing global is preserved.
   */
  force?: boolean;

  /**
   * Human-readable description of what this helper does.
   * Used in debug output and documentation generation.
   */
  description?: string;

  /**
   * The package that registered this helper (e.g., `'@stackra/ts-cache'`).
   * Used for debugging and conflict resolution.
   */
  source?: string;
}

/**
 * Internal metadata stored for each registered helper.
 */
interface HelperEntry {
  /** The helper function itself. */
  fn: GlobalHelper;
  /** Human-readable description. */
  description: string;
  /** The package that registered this helper. */
  source: string;
}

// ============================================================================
// Global Registry
// ============================================================================

/**
 * Centralized registry for global helper functions.
 *
 * This is the single point of control for all global helpers in the
 * Stackra ecosystem. Packages register their helpers here, and
 * `boot()` installs them onto `globalThis`.
 *
 * The registry is a singleton — all operations are static.
 *
 * @example
 * ```typescript
 * import { GlobalRegistry } from '@stackra/ts-support';
 *
 * // Register a custom helper
 * GlobalRegistry.register('myHelper', (x: number) => x * 2, {
 *   description: 'Doubles a number',
 *   source: '@myorg/my-package',
 * });
 *
 * // Boot all helpers onto globalThis
 * GlobalRegistry.boot();
 *
 * // Now available globally
 * myHelper(5); // 10
 * ```
 *
 * @example
 * ```typescript
 * // From another @stackra package (e.g., @stackra/ts-cache)
 * import { GlobalRegistry } from '@stackra/ts-support';
 *
 * GlobalRegistry.register('cache', CacheFacade.store.bind(CacheFacade), {
 *   description: 'Get a cache store instance',
 *   source: '@stackra/ts-cache',
 * });
 * ```
 */
export class GlobalRegistry {
  /**
   * Internal map of registered helpers.
   * Keyed by the global function name.
   */
  private static readonly helpers = new Map<string, HelperEntry>();

  /**
   * Whether `boot()` has been called.
   * When true, new registrations are immediately installed on globalThis.
   */
  private static booted = false;

  // ── Registration ────────────────────────────────────────────────────────

  /**
   * Register a global helper function.
   *
   * The helper is stored in the registry. If `boot()` has already been
   * called, the helper is immediately installed on `globalThis`.
   *
   * @param name    - The global function name (e.g., `'env'`, `'str'`)
   * @param fn      - The helper function
   * @param options - Registration options (force, description, source)
   *
   * @example
   * ```typescript
   * GlobalRegistry.register('env', envHelper, {
   *   description: 'Get an environment variable',
   *   source: '@stackra/ts-support',
   * });
   * ```
   */
  static register(name: string, fn: GlobalHelper, options: RegisterOptions = {}): void {
    const { force = false, description = '', source = 'unknown' } = options;

    /* Check for existing registration */
    if (GlobalRegistry.helpers.has(name) && !force) {
      const existing = GlobalRegistry.helpers.get(name)!;
      console.warn(
        `[GlobalRegistry] Helper "${name}" is already registered by ${existing.source}. ` +
          `Use { force: true } to overwrite.`
      );
      return;
    }

    /* Store the helper */
    GlobalRegistry.helpers.set(name, { fn, description, source });

    /* If already booted, install immediately */
    if (GlobalRegistry.booted) {
      GlobalRegistry.installOnGlobal(name, fn, force);
    }
  }

  /**
   * Register multiple helpers at once.
   *
   * Convenience method for packages that register several helpers.
   *
   * @param helpers - Map of name → function pairs
   * @param options - Shared registration options applied to all helpers
   *
   * @example
   * ```typescript
   * GlobalRegistry.registerMany({
   *   cache: cacheHelper,
   *   event: eventHelper,
   * }, { source: '@stackra/ts-cache' });
   * ```
   */
  static registerMany(helpers: Record<string, GlobalHelper>, options: RegisterOptions = {}): void {
    for (const [name, fn] of Object.entries(helpers)) {
      GlobalRegistry.register(name, fn, options);
    }
  }

  /**
   * Remove a registered helper.
   *
   * Also removes it from `globalThis` if it was installed.
   *
   * @param name - The global function name to remove
   * @returns `true` if the helper was found and removed
   */
  static unregister(name: string): boolean {
    const existed = GlobalRegistry.helpers.delete(name);

    if (existed && typeof globalThis !== 'undefined') {
      try {
        delete (globalThis as any)[name];
      } catch {
        /* Some environments don't allow deleting from globalThis */
      }
    }

    return existed;
  }

  // ── Boot / Lifecycle ────────────────────────────────────────────────────

  /**
   * Install all registered helpers onto `globalThis`.
   *
   * This is the opt-in step that makes helpers available without imports.
   * Call this once during application bootstrap (e.g., in `main.ts`).
   *
   * After boot, any new `register()` calls will immediately install
   * the helper on `globalThis` as well.
   *
   * @example
   * ```typescript
   * import { bootGlobals } from '@stackra/ts-support';
   *
   * // In your app's entry point
   * bootGlobals();
   *
   * // Now available everywhere
   * env('APP_NAME');
   * str('hello world').upper();
   * collect([1, 2, 3]).sum();
   * ```
   */
  static boot(): void {
    GlobalRegistry.booted = true;

    for (const [name, entry] of GlobalRegistry.helpers) {
      GlobalRegistry.installOnGlobal(name, entry.fn, false);
    }
  }

  /**
   * Check whether `boot()` has been called.
   *
   * @returns `true` if helpers have been installed on globalThis
   */
  static isBooted(): boolean {
    return GlobalRegistry.booted;
  }

  /**
   * Remove all registered helpers and reset the booted state.
   *
   * Primarily used in tests to ensure a clean state between test cases.
   *
   * @example
   * ```typescript
   * afterEach(() => {
   *   GlobalRegistry.reset();
   * });
   * ```
   */
  static reset(): void {
    /* Remove from globalThis */
    for (const name of GlobalRegistry.helpers.keys()) {
      try {
        delete (globalThis as any)[name];
      } catch {
        /* Ignore deletion errors */
      }
    }

    GlobalRegistry.helpers.clear();
    GlobalRegistry.booted = false;
  }

  // ── Inspection ──────────────────────────────────────────────────────────

  /**
   * Get the names of all registered helpers.
   *
   * @returns Array of registered helper names
   */
  static registered(): string[] {
    return Array.from(GlobalRegistry.helpers.keys());
  }

  /**
   * Check if a helper is registered.
   *
   * @param name - The helper name to check
   * @returns `true` if the helper is registered
   */
  static has(name: string): boolean {
    return GlobalRegistry.helpers.has(name);
  }

  /**
   * Get metadata about all registered helpers.
   *
   * Useful for debugging and documentation generation.
   *
   * @returns Array of helper metadata objects
   *
   * @example
   * ```typescript
   * GlobalRegistry.inspect();
   * // [
   * //   { name: 'env', description: 'Get an environment variable', source: '@stackra/ts-support' },
   * //   { name: 'str', description: 'Create a Str proxy', source: '@stackra/ts-support' },
   * //   ...
   * // ]
   * ```
   */
  static inspect(): Array<{ name: string; description: string; source: string }> {
    return Array.from(GlobalRegistry.helpers.entries()).map(([name, entry]) => ({
      name,
      description: entry.description,
      source: entry.source,
    }));
  }

  // ── Internal ────────────────────────────────────────────────────────────

  /**
   * Install a single helper function onto `globalThis`.
   *
   * Skips installation if a property with the same name already exists
   * on `globalThis` (unless `force` is true).
   *
   * @param name  - The property name on globalThis
   * @param fn    - The function to install
   * @param force - Whether to overwrite existing properties
   */
  private static installOnGlobal(name: string, fn: GlobalHelper, force: boolean): void {
    if (typeof globalThis === 'undefined') return;

    /* Don't overwrite existing globals unless forced */
    if (name in globalThis && !force) {
      return;
    }

    try {
      (globalThis as any)[name] = fn;
    } catch {
      /* Some environments restrict writes to globalThis */
    }
  }
}
