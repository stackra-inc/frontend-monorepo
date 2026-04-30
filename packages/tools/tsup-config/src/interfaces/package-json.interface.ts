/**
 * Represents a subset of the package.json file structure.
 *
 * This interface defines the relevant fields from a package.json file that are
 * used for build configuration and dependency management. It focuses on metadata
 * and dependency-related properties rather than the complete package.json specification.
 *
 * @see https://docs.npmjs.com/cli/v9/configuring-npm/package-json
 */
export interface IPackageJson {
  /**
   * The package name.
   *
   * This is the unique identifier for the package in the npm registry.
   * Must be lowercase and can contain hyphens and underscores.
   */
  name?: string;

  /**
   * The package version.
   *
   * Follows semantic versioning (semver) format: MAJOR.MINOR.PATCH
   */
  version?: string;

  /**
   * The package author.
   *
   * Can be a string in the format "Name <email> (url)" or just "Name".
   */
  author?: string;

  /**
   * The package license identifier.
   *
   * Should be a valid SPDX license identifier (e.g., "MIT", "Apache-2.0").
   */
  license?: string;

  /**
   * Production dependencies.
   *
   * Maps package names to their version ranges. These dependencies are
   * required for the package to function in production environments.
   */
  dependencies?: Record<string, string>;

  /**
   * Development dependencies.
   *
   * Maps package names to their version ranges. These dependencies are
   * only needed during development and testing, not in production.
   */
  devDependencies?: Record<string, string>;

  /**
   * Peer dependencies.
   *
   * Maps package names to their version ranges. These specify dependencies
   * that the consuming application is expected to provide, typically used
   * for plugins or extensions.
   */
  peerDependencies?: Record<string, string>;
}
