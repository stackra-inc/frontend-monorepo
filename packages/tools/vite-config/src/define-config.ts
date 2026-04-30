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
import type { DecoratorDiscoveryOptions } from '@/plugins/decorator-discovery';
import { ngrok } from '@/plugins/ngrok';
import type { INgrokPluginOptions } from '@/plugins/ngrok';
import { qrcode } from '@/plugins/qrcode';
import type { IQRCodePluginOptions } from '@/plugins/qrcode';
import { env as envPlugin } from '@/plugins/env';
import type { ISupportEnvPluginOptions } from '@/plugins/env';
import { typeGen } from '@/plugins/type-gen';
import type { ITypeGenPluginOptions } from '@/plugins/type-gen';

// ============================================================================
// Stackra Plugin Registry
// ============================================================================

/** Known Stackra plugin keys → factory functions. */
const STACKRA_PLUGINS: Record<string, (opts?: any) => Plugin> = {
  env: (opts?: ISupportEnvPluginOptions) => envPlugin(opts),
  typeGen: (opts?: ITypeGenPluginOptions) => typeGen(opts),
  decoratorDiscovery: (opts?: DecoratorDiscoveryOptions) => decoratorDiscovery(opts),
  ngrok: (opts?: INgrokPluginOptions) => ngrok(opts),
  qrcode: (opts?: IQRCodePluginOptions) => qrcode(opts),
};

/** Plugin resolution order — Stackra plugins first, then third-party. */
const STACKRA_PLUGIN_ORDER = ['env', 'typeGen', 'decoratorDiscovery', 'ngrok', 'qrcode'];

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
 * Resolve the flat PluginMap into an ordered Vite Plugin array.
 *
 * Phase 1: Stackra plugins in `STACKRA_PLUGIN_ORDER`
 * Phase 2: Raw Vite plugins (pass-through, in object order)
 */
function resolvePlugins(pluginMap?: PluginMap): Plugin[] {
  const plugins: Plugin[] = [];
  if (!pluginMap) return plugins;

  // Phase 1 — Stackra plugins (ordered)
  for (const key of STACKRA_PLUGIN_ORDER) {
    const value = pluginMap[key];
    if (value === undefined || value === false) continue;

    const factory = STACKRA_PLUGINS[key];
    if (!factory) continue;

    if (value === true) {
      plugins.push(factory());
    } else if (typeof value === 'object' && !isVitePlugin(value)) {
      plugins.push(factory(value));
    }
  }

  // Phase 2 — Raw Vite plugins (pass-through)
  for (const [key, value] of Object.entries(pluginMap)) {
    if (key in STACKRA_PLUGINS) continue;
    if (isVitePlugin(value)) {
      plugins.push(value);
    }
  }

  return plugins;
}

/**
 * Seed the Env repository with loaded env vars so `env()` works
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
    const loaded = loadEnv(mode, process.cwd(), '');
    await seedEnvRepository(loaded);

    // 2. Create mode-aware defaults
    const defaults = createDefaults(mode);

    // 3. Resolve plugins from the flat map
    const plugins = resolvePlugins(options.plugins);

    // 4. Extract Stackra-only keys, leaving pure Vite UserConfig overrides
    const { plugins: _plugins, ...userOverrides } = options;

    // 5. Deep merge: defaults → user overrides (user always wins)
    const config = deepMerge<UserConfig>(defaults, userOverrides as Partial<UserConfig>);

    // 6. Attach resolved plugins
    config.plugins = plugins;

    return config;
  };
}
