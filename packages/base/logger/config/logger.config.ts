/**
 * Logger Configuration
 *
 * Unified logger configuration following Laravel and NestJS patterns.
 * All logging channels and settings are defined in a single config object.
 *
 * ## Environment Variables
 *
 * | Variable                     | Description                    | Default        |
 * |------------------------------|--------------------------------|----------------|
 * | `VITE_LOG_CHANNEL`           | Default log channel            | `'console'`    |
 * | `VITE_LOG_LEVEL`             | Minimum log level              | `'debug'`      |
 * | `VITE_APP_NAME`              | Application name for context   | `'stackra-app'`|
 * | `VITE_LOG_STORAGE_MAX`       | Max entries in storage channel | `500`          |
 * | `VITE_LOG_STORAGE_KEY`       | localStorage key for logs      | `'app-logs'`   |
 * | `VITE_LOG_ERROR_STORAGE_KEY` | localStorage key for errors    | `'error-logs'` |
 * | `VITE_LOG_AUDIT_STORAGE_KEY` | localStorage key for audit     | `'audit-logs'` |
 *
 * @module config/logger
 *
 * @example
 * ```typescript
 * import loggerConfig from '@/config/logger.config';
 *
 * LoggerModule.forRoot(loggerConfig);
 * ```
 */

import {
  defineConfig,
  LogLevel,
  SilentTransporter,
  ConsoleTransporter,
  StorageTransporter,
} from '@stackra/ts-logger';

/**
 * Logger configuration.
 *
 * Single unified configuration object that automatically adapts to your
 * environment via `env()`. Similar to Laravel's `config/logging.php`.
 */
const loggerConfig = defineConfig({
  /*
  |--------------------------------------------------------------------------
  | Default Log Channel
  |--------------------------------------------------------------------------
  |
  | This option defines the default log channel that will be used to write
  | messages to the logs. The name specified in this option should match
  | one of the channels defined in the "channels" configuration array.
  |
  */
  default: env('VITE_LOG_CHANNEL', 'console'),

  /*
  |--------------------------------------------------------------------------
  | Log Channels
  |--------------------------------------------------------------------------
  |
  | Here you may configure the log channels for your application. Each
  | channel can have multiple transporters for different outputs.
  |
  */
  channels: {
    /**
     * Console Channel
     *
     * Logs to the console/terminal. Good for development.
     */
    console: {
      transporters: [
        new ConsoleTransporter({
          level: (env('VITE_LOG_LEVEL', 'debug') as unknown as LogLevel) || LogLevel.Debug,
        }),
      ],
      context: {
        app: env('VITE_APP_NAME', 'stackra-app'),
        env: env('NODE_ENV', 'development'),
      },
    },

    /**
     * Storage Channel
     *
     * Persists logs to storage (localStorage/sessionStorage in browser).
     * Good for debugging and audit trails.
     */
    storage: {
      transporters: [
        new StorageTransporter({
          key: env('VITE_LOG_STORAGE_KEY', 'app-logs'),
          maxEntries: env('VITE_LOG_STORAGE_MAX', 500),
        }),
      ],
      context: {
        app: env('VITE_APP_NAME', 'stackra-app'),
      },
    },

    /**
     * Combined Channel
     *
     * Logs to both console and storage.
     * Good for production environments.
     */
    combined: {
      transporters: [
        new ConsoleTransporter({
          level: LogLevel.Info,
        }),
        new StorageTransporter({
          key: env('VITE_LOG_STORAGE_KEY', 'app-logs'),
          maxEntries: 1000,
        }),
      ],
      context: {
        app: env('VITE_APP_NAME', 'stackra-app'),
        env: env('NODE_ENV', 'production'),
      },
    },

    /**
     * Error Channel
     *
     * Only logs errors and critical messages.
     * Useful for error monitoring and alerting.
     */
    errors: {
      transporters: [
        new ConsoleTransporter({
          level: LogLevel.Error,
        }),
        new StorageTransporter({
          key: env('VITE_LOG_ERROR_STORAGE_KEY', 'error-logs'),
          maxEntries: 200,
        }),
      ],
      context: {
        app: env('VITE_APP_NAME', 'stackra-app'),
        channel: 'errors',
      },
    },

    /**
     * Audit Channel
     *
     * For audit trails and compliance logging.
     * Stores all logs without console output.
     */
    audit: {
      transporters: [
        new StorageTransporter({
          key: env('VITE_LOG_AUDIT_STORAGE_KEY', 'audit-logs'),
          maxEntries: 1000,
        }),
      ],
      context: {
        app: env('VITE_APP_NAME', 'stackra-app'),
        channel: 'audit',
      },
    },

    /**
     * Silent Channel
     *
     * Disables all logging. Useful for testing.
     */
    silent: {
      transporters: [new SilentTransporter()],
    },
  },
});

export default loggerConfig;
