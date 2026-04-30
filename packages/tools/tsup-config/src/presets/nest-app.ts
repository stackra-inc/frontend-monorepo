import type { Options } from 'tsup';

import { buildBanner } from '@/utils/build-banner';
import { loadPackageJson } from '@/utils/load-package-json';
import { computeExternals } from '@/utils/compute-externals';

/**
 * NestJS Application Preset Configuration
 *
 * Tsup options configured for building NestJS applications as executable bundles.
 * Uses IIFE to compute externals and banner at initialization.
 *
 * @type {Options}
 * @constant
 */
export const preset: Options = (() => {
  // Load package.json metadata
  const pkg = loadPackageJson();
  const externals = computeExternals(pkg);
  const banner = buildBanner(pkg);

  return {
    // NestJS application entry point (convention)
    entry: ['src/main.ts'],

    // CommonJS format only (NestJS runtime requirement)
    format: ['cjs'],

    // No type declarations for applications
    dts: false,

    // Clean output directory before build
    clean: true,

    // Single file output (no code splitting)
    splitting: false,

    // Remove unused code
    treeshake: true,

    // External dependencies (not bundled)
    external: externals,

    // Shebang for executability + license banner
    banner: {
      js: `#!/usr/bin/env node\n${banner}`,
    },

    // Source maps in development only
    sourcemap: process.env.NODE_ENV === 'development',

    // Keep code readable
    minify: false,

    // Node.js 18 LTS target
    target: 'node18',

    // Output directory
    outDir: 'dist',

    // Bundle all dependencies into single file
    bundle: true,

    // Use project's TypeScript config (for decorators/metadata)
    tsconfig: './tsconfig.json',
  };
})();
