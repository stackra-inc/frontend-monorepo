/**
 * Path Resolution Utilities
 *
 * Helpers for resolving and normalizing file paths used when scanning
 * for translation files and writing generated output.
 *
 * @module utils/resolve-paths
 */

import { resolve, isAbsolute } from "path";

/**
 * Resolve a path to an absolute path.
 *
 * If the given path is already absolute it is returned unchanged;
 * otherwise it is resolved relative to `basePath`.
 *
 * @param path - Absolute or relative path to resolve
 * @param basePath - Base directory for relative resolution
 * @returns Absolute path string
 *
 * @example
 * ```typescript
 * resolvePath('/absolute/path');            // '/absolute/path'
 * resolvePath('relative/path', '/base');    // '/base/relative/path'
 * resolvePath('src/i18n');                  // '<cwd>/src/i18n'
 * ```
 */
export function resolvePath(path: string, basePath: string = process.cwd()): string {
  if (isAbsolute(path)) {
    return path;
  }

  return resolve(basePath, path);
}

/**
 * Normalize an array of paths to absolute paths.
 *
 * Each element is passed through {@link resolvePath} using the current
 * working directory as the base.
 *
 * @param paths - Array of absolute or relative paths
 * @returns Array of resolved absolute paths
 *
 * @example
 * ```typescript
 * normalizePaths(['./src', 'dist/', './build']);
 * // => ['/project/src', '/project/dist', '/project/build']
 * ```
 */
export function normalizePaths(paths: string[]): string[] {
  return paths.map((p) => resolvePath(p));
}
