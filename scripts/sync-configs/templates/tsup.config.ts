/**
 * @fileoverview tsup build configuration for {{PACKAGE_NAME}} package
 *
 * This configuration uses the @nesvel/tsup-config base preset which
 * automatically handles build output, externals, and declarations.
 *
 * Configuration Features:
 * - Dual Format: Outputs both ESM (.mjs) and CJS (.js) for maximum compatibility
 * - TypeScript Declarations: Generates .d.ts files for type safety
 * - Auto Externals: Reads package.json to externalize all dependencies
 * - License Banner: Injects package name, version, author, and license
 * - Tree Shaking: Enabled for optimal bundle size
 * - Clean Build: Removes dist/ before each build
 *
 * Build Output:
 *   dist/index.mjs     — ESM (tree-shakeable, modern bundlers)
 *   dist/index.js      — CJS (Node.js, legacy bundlers)
 *   dist/index.d.ts    — TypeScript declarations
 *   dist/index.d.cts   — CTS declarations
 *
 * @module {{PACKAGE_NAME}}
 * @category Configuration
 * @see https://tsup.egoist.dev/
 */

// Import the base preset from @nesvel/tsup-config.
// The preset auto-detects externals from package.json
// (dependencies + peerDependencies + devDependencies).
import { basePreset as preset } from '@nesvel/tsup-config';

export default preset;
