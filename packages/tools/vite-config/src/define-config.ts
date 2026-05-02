/**
 * defineConfig — Primary Entry Point
 *
 * Returns a Vite config function that:
 *   1. Receives `{ mode }` from Vite
 *   2. Loads `.env` files via `loadEnv` and seeds the `Env` repository
 *   3. Creates mode-aware defaults (sourcemaps, log level, build target)
 *   4. Deep-merges: defaults → user overrides
 *   5. Resolves the flat plugin map into a Vite Plugin array
 *
 * The consumer always wins — any value they provide overrides the default.
 *
 * @module define-config
 */

import { loadEnv } from 'vite';
import type { UserConfig, Plugin, ConfigEnv } from 'vite';
import type { StackraOptions, PluginMap } from '@/interfaces';
import { deepMerge } from '@/utils/deep-merge';
import { createDefaults } from '@/defaults';
import { decoratorDiscovery } from '@/plugins/decorator-discovery';
import type { DecoratorDiscoveryOptions } from '@/interfaces/decorator-discovery-options.interface';
import { env as envPlugin } from '@/plugins/env';
import type { ISupportEnvPluginOptions } from '@/interfaces/support-env-plugin-options.interface';
import { typeGen } from '@/plugins/type-gen';
import type { ITypeGenPluginOptions } from '@/interfaces/type-gen-plugin-options.interface';
import { ssg } from '@/plugins/ssg';
import type { ISSGPluginOptions } from '@/interfaces/ssg-plugin-options.interface';

// ============================================================================
// Stackra Plugin Registry
// ============================================================================

/** Known Stackra plugin keys → factory functions. */
const STACKRA_PLUGINS: Record<string, (opts?: any) => Plugin | Promise<Plugin>> = {
  env: (opts?: ISupportEnvPluginOptions) => envPlugin(opts),
  typeGen: (opts?: ITypeGenPluginOptions) => typeGen(opts),
  decoratorDiscovery: (opts?: DecoratorDiscoveryOptions) => decoratorDiscovery(opts),
  ssg: (opts?: ISSGPluginOptions) => ssg(opts),
  ngrok: async (opts?: any) => {
    const mod = await import('./plugins/ngrok');
    return mod.ngrok(opts);
  },
  qrcode: async (opts?: any) => {
    const mod = await import('./plugins/qrcode');
    return mod.qrcode(opts);
  },
};

/** Plugin resolution order — Stackra plugins first, then third-party. */
const STACKRA_PLUGIN_ORDER = ['env', 'typeGen', 'decoratorDiscovery', 'ssg', 'ngrok', 'qrcode'];

// ============================================================================
// Helpers
// ============================================================================

/**
 * Check if a value is a raw Vite Plugin instance.
 * A Vite plugin is an object with a `name: string` property.
 */
function isVitePlugin(value: unknown): value is Plugin {
  return (
    typeof value === 'object' &&
    value !== null &&
    'name' in value &&
    typeof (value as any).name === 'string'
  );
}

/**
 * Check if a value is a Vite plugin or an array of Vite plugins.
 * Many plugins (react, tailwindcss) return arrays.
 */
function isVitePluginOrArray(value: unknown): value is Plugin | Plugin[] {
  if (Array.isArray(value)) {
    return value.length > 0 && value.every((item) => isVitePlugin(item));
  }
  return isVitePlugin(value);
}

/**
 * Resolve the flat PluginMap into an ordered Vite Plugin array.
 *
 * Phase 1: Stackra plugins in `STACKRA_PLUGIN_ORDER`
 * Phase 2: Raw Vite plugins (pass-through, in object order)
 */
async function resolvePlugins(pluginMap?: PluginMap): Promise<Plugin[]> {
  const plugins: Plugin[] = [];
  if (!pluginMap) return plugins;

  // Phase 1 — Stackra plugins (ordered, some may be async)
  for (const key of STACKRA_PLUGIN_ORDER) {
    const value = pluginMap[key];
    if (value === undefined || value === false) continue;

    const factory = STACKRA_PLUGINS[key];
    if (!factory) continue;

    if (value === true) {
      const plugin = await factory();
      plugins.push(plugin);
    } else if (typeof value === 'object' && !isVitePluginOrArray(value)) {
      const plugin = await factory(value);
      plugins.push(plugin);
    }
  }

  // Phase 2 — Raw Vite plugins (pass-through, supports arrays)
  for (const [key, value] of Object.entries(pluginMap)) {
    if (key in STACKRA_PLUGINS) {
      // Check if it was passed as a raw Vite plugin instance under a Stackra key name
      if (isVitePluginOrArray(value)) {
        const items = Array.isArray(value) ? value : [value];
        for (const item of items) {
          plugins.push(item as Plugin);
        }
      }
      continue;
    }
    if (isVitePluginOrArray(value)) {
      const items = Array.isArray(value) ? value : [value];
      for (const item of items) {
        plugins.push(item as Plugin);
      }
    }
  }

  return plugins;
}

/**
 * Seed the Env repository with loaded env vars so `Env.get()` works
 * at config time with `.env` file values.
 */
async function seedEnvRepository(loaded: Record<string, string>): Promise<void> {
  try {
    const { Env } = await import('@stackra/ts-support');
    const merged = { ...process.env, ...loaded };
    Env.setRepository(merged);
  } catch {
    // ts-support not installed — env() falls back to process.env
  }
}

/**
 * Boot global helpers (`env()`, `collect()`, `tap()`, `filled()`, etc.)
 * so they're available during Vite config resolution.
 *
 * Plugins like `configPlugin` load `*.config.ts` files that use `env()`.
 * Without this call, the global `env()` function doesn't exist yet.
 */
async function bootGlobalHelpers(): Promise<void> {
  try {
    const { bootGlobals } = await import('@stackra/ts-support');
    bootGlobals();
  } catch {
    // ts-support not installed — globals not available
  }
}

// ============================================================================
// defineConfig
// ============================================================================

/**
 * Create a Vite configuration with Stackra defaults.
 *
 * Returns a Vite config function that receives `{ mode }` and produces
 * a fully resolved `UserConfig`. Defaults are mode-aware — sourcemaps,
 * build targets, and log levels adapt automatically.
 *
 * @param options - Stackra options (full Vite UserConfig + flat plugin map)
 * @returns Vite config function `({ mode }) => UserConfig`
 *
 * @example
 * ```typescript
 * import { defineConfig } from '@stackra/vite-config';
 * import react from '@vitejs/plugin-react-swc';
 * import tsconfigPaths from 'vite-tsconfig-paths';
 * import tailwindcss from '@tailwindcss/vite';
 *
 * export default defineConfig({
 *   plugins: {
 *     env: true,
 *     typeGen: true,
 *     decoratorDiscovery: true,
 *     react: react({ tsDecorators: true }),
 *     tsconfigPaths: tsconfigPaths(),
 *     tailwindcss: tailwindcss(),
 *   },
 * });
 * ```
 *
 * @example
 * ```typescript
 * // Override defaults — your values always win
 * export default defineConfig({
 *   server: { port: 3000, open: true },
 *   build: { sourcemap: 'hidden' },
 *   plugins: {
 *     env: true,
 *     react: react(),
 *   },
 * });
 * ```
 */
export function defineConfig(
  options: StackraOptions = {}
): (env: ConfigEnv) => Promise<UserConfig> {
  return async ({ mode }: ConfigEnv): Promise<UserConfig> => {
    // 1. Load .env files for the current mode and seed Env repository
    const envDir = options.envDir ?? process.cwd();
    const loaded = loadEnv(mode, envDir, '');

    await seedEnvRepository(loaded);

    // 2. Boot global helpers so env() works during plugin resolution
    await bootGlobalHelpers();

    // 3. Create mode-aware defaults
    const defaults = createDefaults(mode);

    // 4. Resolve plugins from the flat map
    const plugins = await resolvePlugins(options.plugins);

    // 5. Extract Stackra-only keys, leaving pure Vite UserConfig overrides
    const { plugins: _plugins, ...userOverrides } = options;

    // 6. Deep merge: defaults → user overrides (user always wins)
    const config = deepMerge<UserConfig>(defaults, userOverrides as Partial<UserConfig>);

    // 7. Attach resolved plugins
    config.plugins = plugins;

    // 8. Ensure envDir is passed through to Vite if specified
    if (options.envDir) {
      config.envDir = options.envDir;
    }

    return config;
  };
}
