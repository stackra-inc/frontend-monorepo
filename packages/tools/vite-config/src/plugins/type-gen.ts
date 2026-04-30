/**
 * Env Types Plugin
 *
 * Vite plugin that reads `.env` files and generates a TypeScript
 * definition file with an `EnvKey` union type. This gives consumers
 * autocomplete and compile-time warnings when calling `env('...')`.
 *
 * ## What It Does
 *
 * 1. **Scans `.env` files** — reads `.env`, `.env.local`,
 *    `.env.[mode]`, `.env.[mode].local` (same order as Vite)
 * 2. **Extracts all key names** — deduplicates across all files
 * 3. **Generates a `.d.ts` file** that:
 *    - Declares an `EnvKey` union type of all discovered keys
 *    - Overrides the global `env()` function to accept `EnvKey`
 *      instead of `string`, giving autocomplete and type errors
 * 4. **Regenerates on change** — watches `.env*` files and
 *    regenerates the type file on save (HMR)
 *
 * ## Generated Output
 *
 * ```typescript
 * // .stackra/type-gen/index.d.ts (auto-generated)
 * type EnvKey =
 *   | "VITE_API_URL"
 *   | "VITE_APP_NAME"
 *   | "VITE_PUSHER_APP_KEY"
 *   | "NODE_ENV";
 *
 * declare function env<T extends string | number | boolean | undefined>(
 *   key: EnvKey,
 *   fallback?: T,
 * ): ...;
 * ```
 *
 * @module plugins/type-gen
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import type { Plugin } from 'vite';

// ============================================================================
// Types
// ============================================================================

/**
 * Configuration options for the type-gen plugin.
 */
export interface ITypeGenPluginOptions {
  /**
   * Output directory for the generated `.d.ts` file.
   * Relative to the project root.
   *
   * @default '.stackra/type-gen'
   */
  outputDir?: string;

  /**
   * Additional `.env` file paths to scan (relative to root).
   * The standard Vite `.env` files are always included.
   *
   * @default []
   */
  extraEnvFiles?: string[];

  /**
   * Whether to include `NODE_ENV` and `MODE` as known keys.
   * These are always available in Vite but not in `.env` files.
   *
   * @default true
   */
  includeBuiltins?: boolean;

  /**
   * Enable debug logging.
   *
   * @default false
   */
  debug?: boolean;
}

// ============================================================================
// Constants
// ============================================================================

/**
 * Built-in environment variables that Vite always provides,
 * even if they're not in any `.env` file.
 */
const VITE_BUILTINS = ['NODE_ENV', 'MODE', 'BASE_URL', 'DEV', 'PROD', 'SSR'];

// ============================================================================
// Core Logic
// ============================================================================

/**
 * Parse a single `.env` file and extract all key names.
 *
 * Handles:
 * - `KEY=value` pairs
 * - Quoted values (`KEY="value"`, `KEY='value'`)
 * - Comments (`# ...`)
 * - Empty lines
 * - `export KEY=value` syntax
 *
 * @param filePath - Absolute path to the `.env` file
 * @returns Array of key names found in the file
 */
function parseEnvFile(filePath: string): string[] {
  if (!existsSync(filePath)) return [];

  const content = readFileSync(filePath, 'utf-8');
  const keys: string[] = [];

  for (const line of content.split('\n')) {
    const trimmed = line.trim();

    /* Skip empty lines and comments */
    if (!trimmed || trimmed.startsWith('#')) continue;

    /* Strip optional `export ` prefix */
    const cleaned = trimmed.startsWith('export ') ? trimmed.slice(7).trim() : trimmed;

    /* Extract the key (everything before the first `=`) */
    const eqIndex = cleaned.indexOf('=');
    if (eqIndex > 0) {
      const key = cleaned.slice(0, eqIndex).trim();
      /* Validate key name — must be a valid identifier */
      if (/^[A-Za-z_][A-Za-z0-9_]*$/.test(key)) {
        keys.push(key);
      }
    }
  }

  return keys;
}

/**
 * Discover all `.env` files for the given root and mode.
 *
 * Follows Vite's loading order:
 *   1. `.env`
 *   2. `.env.local`
 *   3. `.env.[mode]`
 *   4. `.env.[mode].local`
 *
 * @param root - Project root directory
 * @param mode - Vite mode (e.g., 'development', 'production')
 * @param extra - Additional env file paths
 * @returns Array of absolute file paths
 */
function discoverEnvFiles(root: string, mode: string, extra: string[] = []): string[] {
  const files = ['.env', '.env.local', `.env.${mode}`, `.env.${mode}.local`, ...extra];

  return files.map((f) => resolve(root, f));
}

/**
 * Collect all unique env keys from all `.env` files.
 *
 * @param root - Project root directory
 * @param mode - Vite mode
 * @param options - Plugin options
 * @returns Sorted, deduplicated array of env key names
 */
function collectEnvKeys(root: string, mode: string, options: ITypeGenPluginOptions): string[] {
  const files = discoverEnvFiles(root, mode, options.extraEnvFiles);
  const allKeys = new Set<string>();

  /* Add built-in Vite keys */
  if (options.includeBuiltins !== false) {
    for (const key of VITE_BUILTINS) {
      allKeys.add(key);
    }
  }

  /* Parse each .env file */
  for (const file of files) {
    const keys = parseEnvFile(file);
    for (const key of keys) {
      allKeys.add(key);
    }
  }

  return Array.from(allKeys).sort();
}

/**
 * Generate the TypeScript definition file content.
 *
 * @param keys - Sorted array of env key names
 * @returns Complete `.d.ts` file content
 */
function generateTypeGenCode(keys: string[]): string {
  if (keys.length === 0) {
    return `/**
 * AUTO-GENERATED FILE — DO NOT EDIT
 * Generated by @stackra/vite-config type-gen plugin
 *
 * No environment variables found. Add keys to your .env file
 * and restart the dev server to generate types.
 */

export {};
`;
  }

  const unionMembers = keys.map((k) => `  | '${k}'`).join('\n');

  return `/**
 * AUTO-GENERATED FILE — DO NOT EDIT
 * Generated by @stackra/vite-config type-gen plugin
 *
 * This file provides type-safe autocomplete for env() calls.
 * Regenerated automatically when .env files change.
 *
 * To use: add this to your tsconfig.json:
 *   "include": [".stackra/type-gen/index.d.ts"]
 */

/**
 * Union type of all known environment variable keys.
 * Extracted from .env, .env.local, .env.[mode], .env.[mode].local
 */
type EnvKey =
${unionMembers};

declare global {
  /**
   * Get an environment variable with autocomplete and type safety.
   *
   * @param key      - Environment variable name (autocompleted from .env files)
   * @param fallback - Default value if the variable is not set
   */
  function env<T extends string | number | boolean | undefined = undefined>(
    key: EnvKey | (string & {}),
    fallback?: T,
  ): T extends boolean ? boolean : T extends number ? number : string | T;
}

export {};
`;
}

/**
 * Write the generated type file to disk.
 *
 * @param root - Project root directory
 * @param outputDir - Output directory (relative to root)
 * @param content - The generated `.d.ts` content
 */
function writeTypeFile(root: string, outputDir: string, content: string): void {
  const outPath = resolve(root, outputDir, 'index.d.ts');
  const dir = dirname(outPath);

  mkdirSync(dir, { recursive: true });
  writeFileSync(outPath, content, 'utf-8');
}

// ============================================================================
// Plugin Factory
// ============================================================================

/**
 * Create the type-gen Vite plugin.
 *
 * Scans `.env` files at build start and generates a `.d.ts` file with
 * an `EnvKey` union type. Watches for `.env` file changes and regenerates.
 *
 * @param options - Plugin configuration options
 * @returns Configured Vite Plugin instance
 *
 * @example
 * ```typescript
 * // Via defineConfig plugin map (recommended)
 * import { defineConfig } from '@stackra/vite-config';
 *
 * export default defineConfig({
 *   plugins: {
 *     typeGen: true,
 *   },
 * });
 * ```
 *
 * @example
 * ```typescript
 * // Standalone usage
 * import { typeGen } from '@stackra/vite-config';
 *
 * export default {
 *   plugins: [typeGen({ outputDir: '.types/env' })],
 * };
 * ```
 */
export function typeGen(options: ITypeGenPluginOptions = {}): Plugin {
  const { outputDir = '.stackra/type-gen', debug = false } = options;

  let root = '';
  let mode = 'development';

  /**
   * Run the type generation pipeline.
   */
  function generate(): void {
    const keys = collectEnvKeys(root, mode, options);
    const code = generateTypeGenCode(keys);
    writeTypeFile(root, outputDir, code);

    if (debug) {
      console.log(`[type-gen] Generated ${keys.length} env keys → ${outputDir}/index.d.ts`);
    }
  }

  return {
    name: '@stackra/type-gen',

    /**
     * Capture the resolved root and mode from Vite config.
     */
    configResolved(config) {
      root = config.root;
      mode = config.mode;
    },

    /**
     * Generate types at build start.
     */
    buildStart() {
      generate();
    },

    /**
     * Regenerate types when .env files change (HMR).
     */
    handleHotUpdate({ file }) {
      const relative = file.replace(root, '').replace(/^\//, '');

      if (relative.startsWith('.env')) {
        if (debug) {
          console.log(`[type-gen] .env file changed: ${relative} — regenerating types`);
        }
        generate();
      }
    },
  };
}
