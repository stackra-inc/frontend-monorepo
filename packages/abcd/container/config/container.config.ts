/**
 * Container Configuration
 *
 * Application bootstrap options for `Application.create()`.
 * Uses the `defineConfig` helper for type-safe configuration with
 * full IDE autocomplete.
 *
 * This file is the single place to configure:
 * - Debug mode and global window exposure
 * - Global application config (injected as `'APP_CONFIG'` everywhere)
 * - The `onReady` callback for post-bootstrap logic
 *
 * ## Usage
 *
 * ```typescript
 * // main.ts
 * import 'reflect-metadata';
 * import { Application } from '@stakra/ts-container';
 * import containerConfig from './config/container.config';
 * import { AppModule } from './app.module';
 *
 * const app = await Application.create(AppModule, containerConfig);
 * ```
 *
 * ## Environment Variables
 *
 * | Variable                  | Description                              | Default        |
 * |---------------------------|------------------------------------------|----------------|
 * | `VITE_API_URL`            | Base URL for API requests                | `''`           |
 * | `VITE_APP_ENV`            | Application environment                  | `'development'`|
 * | `VITE_FF_NEW_CHECKOUT`    | Feature flag — new checkout flow         | `'false'`      |
 * | `VITE_FF_NEW_UI`          | Feature flag — new UI components         | `'false'`      |
 * | `VITE_APP_GLOBAL_NAME`    | Window property name for debug access    | `'__APP__'`    |
 *
 * @module config/container
 */

import { defineConfig } from '@stakra/ts-container';

/**
 * Application container configuration.
 *
 * Passed directly to `Application.create(AppModule, containerConfig)`.
 * All fields are optional — sensible defaults are applied automatically.
 */
const containerConfig = defineConfig({
  /**
   * Expose the application instance on `window` for browser devtools.
   *
   * When `true`, `window[globalName]` is set after bootstrap so you can
   * inspect the container from the browser console:
   *   `window.__APP__.get(UserService)`
   *
   * Auto-detected from `import.meta.env.DEV` — enabled in development,
   * disabled in production builds automatically.
   */
  debug: import.meta.env.DEV,

  /**
   * The global window property name for debug access.
   *
   * Only used when `debug` is `true`.
   *
   * @default '__APP__'
   */
  globalName: (import.meta.env.VITE_APP_GLOBAL_NAME as string) || '__APP__',

  /**
   * Global application configuration.
   *
   * Automatically registered as a value provider under the `'APP_CONFIG'`
   * token and made available to all modules without explicit imports.
   *
   * Inject in any service:
   * ```typescript
   * @Injectable()
   * class ApiService {
   *   constructor(@Inject('APP_CONFIG') private config: AppConfig) {}
   * }
   * ```
   */
  config: {
    /**
     * Base URL for all API requests.
     * Injected into HTTP services via `APP_CONFIG`.
     */
    apiUrl: (import.meta.env.VITE_API_URL as string) || '',

    /**
     * Current application environment.
     * Used for environment-specific behaviour in services.
     */
    environment: (import.meta.env.VITE_APP_ENV as string) || 'development',

    /**
     * Feature flags — enable/disable features without a deploy.
     * Add new flags here and inject via `APP_CONFIG`.
     */
    featureFlags: {
      /** Enable the new checkout flow */
      newCheckout: import.meta.env.VITE_FF_NEW_CHECKOUT === 'true',

      /** Enable the new UI component set */
      newUI: import.meta.env.VITE_FF_NEW_UI === 'true',
    },
  },

  /**
   * Called after the application is fully bootstrapped.
   *
   * All providers are resolved and all `onModuleInit()` hooks have
   * completed by the time this runs. Use for:
   * - Startup logging
   * - Analytics tracking
   * - Feature flag evaluation
   * - Any async setup that needs the full DI graph
   *
   * @param app - The bootstrapped Application instance
   */
  onReady: async (app) => {
    if (import.meta.env.DEV) {
      console.log('[Container] Application bootstrapped ✅');
    }
  },
});

export default containerConfig;
