/**
 * @file connection-not-configured.error.ts
 * @description Error thrown when a requested database connection name
 * does not exist in the ConnectionManager's configuration.
 * This typically happens when a Model references a connection
 * that was never registered, or when calling
 * `connectionManager.connection('unknown')`.
 */

/**
 * Thrown when a connection name is requested that does not exist
 * in the ConnectionManager's configuration map.
 *
 * @example
 * ```ts
 * throw new ConnectionNotConfiguredError('analytics');
 * // Error: Connection "analytics" is not configured.
 * ```
 */
export class ConnectionNotConfiguredError extends Error {
  /**
   * The connection name that was requested but not found
   * in the configuration.
   */
  public readonly name: string;

  /**
   * @param name - The invalid connection name that was requested
   */
  constructor(name: string) {
    super(`Connection "${name}" is not configured.`);
    this.name = name;
    Object.setPrototypeOf(this, ConnectionNotConfiguredError.prototype);
  }
}
