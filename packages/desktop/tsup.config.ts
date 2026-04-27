/**
 * @fileoverview tsup build configuration for @stackra/ts-desktop
 *
 * Uses the @stackra/tsup-config base preset which automatically handles:
 * - Dual format output (ESM + CJS)
 * - TypeScript declaration generation
 * - Auto-externalization from package.json (deps, peerDeps, devDeps)
 * - License banner injection
 * - Tree shaking and clean builds
 *
 * Build output:
 *   dist/index.mjs   — ESM (tree-shakeable, modern bundlers)
 *   dist/index.js    — CJS (Node.js, legacy bundlers)
 *   dist/index.d.ts  — TypeScript declarations
 *
 * @module @stackra/ts-desktop
 * @category Configuration
 * @see https://tsup.egoist.dev/
 */

import { basePreset as preset } from '@stackra/tsup-config';

export default preset;
