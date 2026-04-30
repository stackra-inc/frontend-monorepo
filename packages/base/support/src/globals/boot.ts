/**
 * @fileoverview Boot function — registers all built-in helpers and activates globals.
 *
 * Call `bootGlobals()` once in your application's entry point to make
 * all helper functions available on `globalThis`.
 *
 * ## What Gets Registered
 *
 * | Global Name    | Maps To                        | Description                          |
 * |----------------|--------------------------------|--------------------------------------|
 * | `env`          | `helpers.env`                  | Get an environment variable          |
 * | `collect`      | `helpers._collect`             | Create a Collection from an array    |
 * | `collectMap`   | `helpers._collectMap`          | Create a MapCollection               |
 * | `collectSet`   | `helpers._collectSet`          | Create a SetCollection               |
 * | `value`        | `helpers.value`                | Resolve a value or callable          |
 * | `tap`          | `helpers.tap`                  | Side-effect then return value        |
 * | `filled`       | `helpers.filled`               | Check if a value is filled           |
 * | `blank`        | `helpers.blank`                | Check if a value is blank            |
 * | `retry`        | `helpers.retry`                | Retry a callback N times             |
 * | `sleep`        | `helpers.sleep`                | Promise-based delay                  |
 *
 * @module globals/boot
 * @category Globals
 */

import { GlobalRegistry } from './global-registry';
import {
  env,
  _collect,
  _collectMap,
  _collectSet,
  value,
  tap,
  filled,
  blank,
  retry,
  sleep,
} from './helpers';

/**
 * The source identifier for built-in helpers.
 * Used in `GlobalRegistry.inspect()` output.
 */
const SOURCE = '@stackra/ts-support';

/**
 * Register all built-in global helpers and install them on `globalThis`.
 *
 * Call this once during application bootstrap. Subsequent calls are
 * safe — helpers are only registered once (unless `force` is used).
 *
 * @example
 * ```typescript
 * // main.ts — application entry point
 * import { bootGlobals } from '@stackra/ts-support';
 *
 * bootGlobals();
 *
 * // Now available everywhere without imports
 * const name = env('APP_NAME', 'Stackra');
 * const items = collect([1, 2, 3]);
 * ```
 *
 * @example
 * ```typescript
 * // With Vite — pass import.meta.env to Env before booting
 * import { Env, bootGlobals } from '@stackra/ts-support';
 *
 * Env.setRepository(import.meta.env);
 * bootGlobals();
 * ```
 */
export function bootGlobals(): void {
  /* Skip if already booted */
  if (GlobalRegistry.isBooted()) {
    return;
  }

  /* ── Environment ─────────────────────────────────────────────────────── */

  GlobalRegistry.register('env', env, {
    description: 'Get an environment variable with optional default and type coercion',
    source: SOURCE,
  });

  /* ── Collections ─────────────────────────────────────────────────────── */

  GlobalRegistry.register('collect', _collect, {
    description: 'Create a Collection instance from an array',
    source: SOURCE,
  });

  GlobalRegistry.register('collectMap', _collectMap, {
    description: 'Create a MapCollection from entries or a record',
    source: SOURCE,
  });

  GlobalRegistry.register('collectSet', _collectSet, {
    description: 'Create a SetCollection from an iterable',
    source: SOURCE,
  });

  /* ── Value Helpers ───────────────────────────────────────────────────── */

  GlobalRegistry.register('value', value, {
    description: 'Resolve a value — call it if it is a function, otherwise return as-is',
    source: SOURCE,
  });

  GlobalRegistry.register('tap', tap, {
    description: 'Call a callback with the value for side effects, then return the value',
    source: SOURCE,
  });

  /* ── Inspection ──────────────────────────────────────────────────────── */

  GlobalRegistry.register('filled', filled, {
    description: 'Check if a value is "filled" (not null, empty, or whitespace)',
    source: SOURCE,
  });

  GlobalRegistry.register('blank', blank, {
    description: 'Check if a value is "blank" (null, undefined, empty string, empty array/object)',
    source: SOURCE,
  });

  /* ── Async ───────────────────────────────────────────────────────────── */

  GlobalRegistry.register('retry', retry, {
    description: 'Retry a callback N times with optional delay between attempts',
    source: SOURCE,
  });

  GlobalRegistry.register('sleep', sleep, {
    description: 'Promise-based sleep / delay',
    source: SOURCE,
  });

  /* ── Activate ────────────────────────────────────────────────────────── */

  GlobalRegistry.boot();
}
