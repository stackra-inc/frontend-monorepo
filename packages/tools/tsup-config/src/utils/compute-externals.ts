import type { IPackageJson } from '@/interfaces/package-json.interface';

/**
 * Computes external dependencies from package.json.
 *
 * @param {PackageJson} pkg - Package metadata
 * @returns {string[]} Deduplicated array of package names
 */
export function computeExternals(pkg: IPackageJson): string[] {
  // Extract production dependencies
  const deps = Object.keys(pkg.dependencies || {});

  // Extract development dependencies
  const devDeps = Object.keys(pkg.devDependencies || {});

  // Extract peer dependencies
  const peerDeps = Object.keys(pkg.peerDependencies || {});

  // Combine all dependencies and remove duplicates using Set
  return [...new Set([...deps, ...devDeps, ...peerDeps])];
}
