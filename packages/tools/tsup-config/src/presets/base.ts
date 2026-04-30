import type { Options } from 'tsup';

import { buildBanner } from '@/utils/build-banner';
import { loadPackageJson } from '@/utils/load-package-json';
import { computeExternals } from '@/utils/compute-externals';

/**
 * Base Tsup Configuration Preset
 *
 * Foundation preset for standard TypeScript libraries.
 * Outputs both ESM and CJS formats with TypeScript declarations.
 *
 * @module tsup-config/base
 * @since 1.0.0
 *
 * @description
 * This preset provides:
 * - **Dual format output**: ESM (`.js`) and CJS (`.cjs`)
 * - **Type declarations**: Generates `.d.ts` files
 * - **Tree-shaking**: Removes unused code
 * - **Auto-externals**: Automatically marks dependencies as external
 * - **License banner**: Adds copyright comment to output files
 * - **Source maps**: Enabled in development mode
 * - **ES2022 target**: Modern JavaScript output
 *
 * Perfect for:
 * - Shared utility libraries
 * - Framework-agnostic packages
 * - Reusable TypeScript modules
 *
 * @example
 * ```typescript
 * import { defineConfig } from 'tsup';
 * import { preset as basePreset } from '@stackra/tsup-config';
 *
 * export default defineConfig({
 *   ...basePreset,
 *   entry: ['src/custom-entry.ts'], // Override entry point
 * });
 * ```
 */
export const preset: Options = (() => {
  // Load package.json to extract metadata for banner and externals
  const pkg = loadPackageJson();

  // Compute external dependencies (won't be bundled)
  const externals = computeExternals(pkg);

  // Build license/copyright banner for output files
  const banner = buildBanner(pkg);

  return {
    // Entry point(s) for the build
    entry: ['src/index.ts'],

    // Output formats: ES Module and CommonJS
    format: ['esm', 'cjs'],

    // Generate TypeScript declaration files (.d.ts)
    dts: true,

    // Clean output directory before build
    clean: true,

    // Disable code splitting (simpler output)
    splitting: false,

    // Enable tree-shaking to remove unused code
    treeshake: true,

    // Mark all dependencies as external (won't be bundled)
    external: ['figlet', ...externals],

    // Add license banner to JavaScript output
    banner: {
      js: banner,
    },

    // Generate source maps in development only
    sourcemap: process.env.NODE_ENV === 'development',

    // Don't minify output (keeps code readable)
    minify: false,

    // Target ES2022 for modern JavaScript features
    target: 'es2022',

    // Output directory
    outDir: 'dist',

    // ✅ Always bundle by default, so consumers don't have to override
    bundle: true,
  };
})();
