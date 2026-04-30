/**
 * Config Package Configuration
 *
 * Configuration for the @stackra/ts-config package.
 * Defines how environment variables are loaded and accessed
 * through the ConfigFacade and ConfigManager.
 *
 * ## Environment Variables
 *
 * | Variable              | Description                             | Default   |
 * |-----------------------|-----------------------------------------|-----------|
 * | `VITE_CONFIG_DRIVER`  | Default config source driver            | `'env'`   |
 * | `VITE_CONFIG_PREFIX`  | Env prefix stripping mode               | `'auto'`  |
 * | `VITE_APP_NAME`       | Application name (stripped to APP_NAME) | —         |
 * | `VITE_*`              | All VITE_ prefixed vars are auto-stripped | —       |
 *
 * @module config/config
 */

import { defineConfig } from "@stackra/ts-config";

/**
 * Config configuration.
 *
 * Uses the `sources` structure to define named configuration sources.
 * The `default` key selects which source is used by `ConfigFacade.source()`.
 *
 * @example
 * ```typescript
 * // In app.module.ts
 * import configConfig from '@/config/config.config';
 *
 * @Module({
 *   imports: [ConfigModule.forRoot(configConfig)],
 * })
 * export class AppModule {}
 * ```
 */
const configConfig = defineConfig({
  /*
  |--------------------------------------------------------------------------
  | Default Source
  |--------------------------------------------------------------------------
  |
  | The name of the default configuration source. Must match a key
  | in the `sources` object below.
  |
  */
  default: env("VITE_CONFIG_DRIVER", "env"),

  /*
  |--------------------------------------------------------------------------
  | Configuration Sources
  |--------------------------------------------------------------------------
  |
  | Named source configurations. Each source has a `driver` field that
  | determines how configuration values are loaded.
  |
  | Drivers:
  |   - 'env'       : Reads from the Env repository (process.env / import.meta.env)
  |   - 'file'      : Reads from a JSON/YAML file
  |   - 'http'      : Fetches config from a remote endpoint
  |   - 'api'       : Reads from a REST API with auth
  |   - 'firebase'  : Reads from Firebase Remote Config
  |   - 'appconfig' : Reads from AWS AppConfig
  |
  */
  sources: {
    /**
     * Environment variable source.
     *
     * Reads from the Env repository. The `envPrefix` option auto-detects
     * and strips VITE_ or NEXT_PUBLIC_ prefixes so that `VITE_APP_NAME`
     * becomes accessible as `APP_NAME`.
     *
     * @default 'env'
     */
    env: {
      driver: "env",

      /**
       * Auto-detect and strip environment variable prefix.
       * 'auto' detects VITE_ or NEXT_PUBLIC_ and strips it.
       * @default 'auto'
       */
      envPrefix: env("VITE_CONFIG_PREFIX", "auto"),
    },

    // ── Commented-out driver examples ─────────────────────────────
    //
    // file: {
    //   driver: 'file',
    //   path: env('VITE_CONFIG_FILE_PATH', './config/app.json'),
    //   format: 'json',
    // },
    //
    // http: {
    //   driver: 'http',
    //   url: env('VITE_CONFIG_HTTP_URL', 'https://config.example.com/api/config'),
    //   headers: { Authorization: `Bearer ${env('VITE_CONFIG_HTTP_TOKEN', '')}` },
    //   ttl: 300,
    // },
  },
});

export default configConfig;
