import { build, Options } from 'tsup';
import type { Plugin, ResolvedConfig } from 'vite';

/**
 * Creates a Vite plugin that runs tsup during the build process.
 *
 * This plugin integrates tsup bundling into Vite's build lifecycle. It's particularly
 * useful when you want to bundle library code or specific parts of your application
 * using tsup while still leveraging Vite's development server and other features.
 *
 * **Use Cases:**
 * - Building library packages alongside your Vite application
 * - Bundling worker files or isolated modules with tsup
 * - Creating dual builds (Vite for app, tsup for library)
 * - Leveraging tsup's superior TypeScript declaration generation
 *
 * **Lifecycle:**
 * The plugin hooks into Vite's `configResolved` lifecycle, which runs after all
 * Vite config has been resolved but before the build starts. This ensures tsup
 * runs with the correct configuration context.
 *
 * @param options - tsup configuration options
 * @param options.entry - Entry points for bundling (e.g., ['src/index.ts'])
 * @param options.format - Output format(s): 'cjs', 'esm', or 'iife'
 * @param options.dts - Whether to generate TypeScript declaration files
 * @param options.outDir - Output directory for bundled files
 * @param options.clean - Whether to clean output directory before build
 * @param options.splitting - Enable code splitting (ESM only)
 * @param options.sourcemap - Generate source maps
 * @param options.minify - Minify output (esbuild or terser)
 *
 * @returns A Vite plugin instance that integrates tsup into the build process
 *
 * @example
 * ```typescript
 * // vite.config.ts
 * import { defineConfig } from 'vite';
 * import { tsupPlugin } from '@stackra/tsup-config/adapters/vite';
 *
 * export default defineConfig({
 *   plugins: [
 *     tsupPlugin({
 *       entry: ['src/lib/index.ts'],
 *       format: ['esm', 'cjs'],
 *       dts: true,
 *       outDir: 'dist',
 *       clean: true,
 *     }),
 *   ],
 * });
 * ```
 *
 * @example
 * ```typescript
 * // Advanced usage with multiple entry points
 * import { defineConfig } from 'vite';
 * import { tsupPlugin } from '@stackra/tsup-config/adapters/vite';
 *
 * export default defineConfig({
 *   plugins: [
 *     tsupPlugin({
 *       entry: {
 *         index: 'src/index.ts',
 *         worker: 'src/worker.ts',
 *       },
 *       format: ['esm'],
 *       dts: true,
 *       splitting: true,
 *       sourcemap: true,
 *       outDir: 'dist/lib',
 *     }),
 *   ],
 * });
 * ```
 *
 * @see https://tsup.egoist.dev/ - tsup documentation
 * @see https://vitejs.dev/guide/api-plugin.html - Vite plugin API
 */
export const tsupPlugin = (options: Options): Plugin => {
  return {
    /**
     * Plugin identifier used by Vite for debugging and plugin ordering.
     * This name appears in build logs and can be used to filter plugins.
     */
    name: 'vite-plugin-tsup',

    /**
     * Specifies when this plugin should be active.
     *
     * Setting `apply: 'build'` ensures the plugin only runs during production builds,
     * not during development server execution. This is important because:
     * - tsup bundling is typically only needed for production artifacts
     * - Running tsup during dev would slow down HMR and development experience
     * - Vite's dev server already handles module transformation efficiently
     */
    apply: 'build',

    /**
     * Vite lifecycle hook that runs after the config has been fully resolved.
     *
     * This hook is called once Vite has processed all configuration (including
     * user config, environment variables, and plugin-applied modifications).
     * At this point, we have access to the complete build context.
     *
     * **Why use configResolved instead of buildStart?**
     * - configResolved runs before any build operations begin
     * - It ensures tsup completes before Vite starts its own bundling
     * - This prevents race conditions or file conflicts
     *
     * **Error Handling:**
     * If tsup build fails, the error will propagate and fail the entire Vite build,
     * which is the desired behavior to prevent shipping broken builds.
     *
     * @param _config - The resolved Vite configuration (unused but available)
     *                  Prefixed with underscore to indicate intentionally unused parameter
     *
     * @throws Will throw if tsup build fails (compilation errors, file system issues, etc.)
     */
    async configResolved(_config: ResolvedConfig) {
      // Execute tsup build with the provided options
      // This runs synchronously (awaited) to ensure completion before Vite continues
      await build(options);
    },
  };
};
