import type { IPackageJson } from '@/interfaces/package-json.interface';

/**
 * Builds a license banner from package metadata.
 *
 * @param {PackageJson} pkg - Package metadata
 * @returns {string} Formatted JSDoc banner comment
 */
export function buildBanner(pkg: IPackageJson): string {
  // Get package name with fallback
  const name = pkg.name || 'Unknown Package';

  // Get package version with fallback
  const version = pkg.version || '0.0.0';

  // Get author name with fallback
  const author = pkg.author || 'Unknown Author';

  // Get license type with fallback
  const license = pkg.license || 'UNLICENSED';

  // Format as JSDoc comment block
  return `/**
 * ${name} v${version}
 * (c) ${new Date().getFullYear()} ${author}
 * @license ${license}
 */`;
}
