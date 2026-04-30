/**
 * @file connection-manager.test.ts
 * @description Unit tests for the ConnectionManager class. Verifies config-driven
 * connection creation, caching, default connection resolution, error handling
 * for unknown connections, and close/closeAll lifecycle management.
 */

import { describe, it, expect, afterEach } from 'vitest';
import { ConnectionManager } from '@/connection/connection.manager';
import { Connection } from '@/connection/connection';
import { ConnectionNotConfiguredError } from '@/errors/connection-not-configured.error';
import type { ConnectionConfig } from '@/connection/connection.types';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Create a fresh config with a unique database name to avoid RxDB collisions. */
function createConfig(): ConnectionConfig {
  return {
    default: 'local',
    connections: {
      local: { driver: 'memory', name: `test-db-${Date.now()}-${Math.random()}` },
    },
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('ConnectionManager', () => {
  let manager: ConnectionManager;

  afterEach(async () => {
    if (manager) {
      await manager.closeAll();
    }
  });

  // -------------------------------------------------------------------------
  // Constructor & getDefaultConnectionName
  // -------------------------------------------------------------------------

  it('accepts a ConnectionConfig and exposes the default connection name', () => {
    const config = createConfig();
    manager = new ConnectionManager(config);

    expect(manager.getDefaultConnectionName()).toBe('local');
  });

  // -------------------------------------------------------------------------
  // connection() — default resolution
  // -------------------------------------------------------------------------

  it('connection() with no args uses the default connection name', async () => {
    const config = createConfig();
    manager = new ConnectionManager(config);

    const conn = await manager.connection();

    expect(conn).toBeInstanceOf(Connection);
    expect(conn.name).toBe('local');
  });

  // -------------------------------------------------------------------------
  // connection() — unknown name
  // -------------------------------------------------------------------------

  it('connection("unknown") throws ConnectionNotConfiguredError', async () => {
    const config = createConfig();
    manager = new ConnectionManager(config);

    await expect(manager.connection('unknown')).rejects.toThrow(ConnectionNotConfiguredError);
  });

  // -------------------------------------------------------------------------
  // connection() — creates and returns a Connection
  // -------------------------------------------------------------------------

  it('connection("local") creates and returns a Connection with memory driver', async () => {
    const config = createConfig();
    manager = new ConnectionManager(config);

    const conn = await manager.connection('local');

    expect(conn).toBeInstanceOf(Connection);
    expect(conn.driver).toBe('memory');
  });

  // -------------------------------------------------------------------------
  // connection() — caching
  // -------------------------------------------------------------------------

  it('connection("local") called twice returns the same cached instance', async () => {
    const config = createConfig();
    manager = new ConnectionManager(config);

    const first = await manager.connection('local');
    const second = await manager.connection('local');

    expect(first).toBe(second);
  });

  // -------------------------------------------------------------------------
  // close() — removes from cache
  // -------------------------------------------------------------------------

  it('close("local") removes from cache; next connection() creates a new instance', async () => {
    const config: ConnectionConfig = {
      default: 'local',
      connections: {
        local: { driver: 'memory', name: `test-db-close-${Date.now()}-${Math.random()}` },
      },
    };
    manager = new ConnectionManager(config);

    const first = await manager.connection('local');
    await manager.close('local');

    // Update the config db name so RxDB doesn't complain about reuse
    config.connections.local!.name = `test-db-close2-${Date.now()}-${Math.random()}`;
    // Need a new manager since config is read at construction, but the internal
    // cache was cleared. The same manager with a new db name in config works
    // because createConnection reads config.connections at call time.
    const second = await manager.connection('local');

    expect(second).toBeInstanceOf(Connection);
    expect(second).not.toBe(first);
  });

  // -------------------------------------------------------------------------
  // closeAll()
  // -------------------------------------------------------------------------

  it('closeAll() clears all cached connections', async () => {
    const config = createConfig();
    manager = new ConnectionManager(config);

    await manager.connection('local');
    await manager.closeAll();

    // After closeAll, getting a connection again should create a new one.
    // Update name to avoid RxDB "already exists" error.
    config.connections.local!.name = `test-db-closeall-${Date.now()}-${Math.random()}`;
    const fresh = await manager.connection('local');

    expect(fresh).toBeInstanceOf(Connection);
  });
});
