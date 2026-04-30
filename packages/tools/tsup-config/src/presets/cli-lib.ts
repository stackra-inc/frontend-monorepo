import type { Options } from 'tsup';

import { buildBanner } from '@/utils/build-banner';
import { loadPackageJson } from '@/utils/load-package-json';
import { computeExternals } from '@/utils/compute-externals';

/**
 * CLI Library Preset Configuration
 *
 * Tsup options configured for building executable CLI tools.
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
    entry: ['src/index.ts'],

    // CJS only (Node.js standard)
    format: ['cjs'],

    // No type declarations for CLI tools
    dts: false,

    // Clean before build
    clean: true,

    // Single file output
    splitting: false,

    // Remove unused code
    treeshake: true,

    // External dependencies
    external: externals,

    // Shebang + license banner
    banner: {
      js: `#!/usr/bin/env node\n${banner}`,
    },

    // Source maps in dev only
    sourcemap: process.env.NODE_ENV === 'development',

    // Keep readable
    minify: false,

    // Node18 LTS target
    target: 'node18',

    outDir: 'dist',

    // Bundle everything
    bundle: true,
  };
})();
