/**
 * Events Configuration
 *
 * Configuration for the @stackra/ts-events package.
 * Defines event dispatchers, drivers, and wildcard settings.
 * Override these values when calling EventsModule.forRoot().
 *
 * ## Environment Variables
 *
 * | Variable                       | Description                     | Default    |
 * |--------------------------------|---------------------------------|------------|
 * | `VITE_EVENTS_DEFAULT`          | Default dispatcher name         | `'memory'` |
 * | `VITE_EVENTS_WILDCARDS`        | Enable wildcard listeners       | `true`     |
 * | `VITE_EVENTS_REDIS_CONNECTION` | Redis connection for events     | `'events'` |
 * | `VITE_EVENTS_REDIS_PREFIX`     | Redis key prefix for events     | `'events:'`|
 * | `VITE_EVENTS_POLLING_INTERVAL` | Redis polling interval (ms)     | `1000`     |
 *
 * @example
 * ```typescript
 * // In app.module.ts
 * import eventsConfig from '@/config/events.config';
 *
 * @Module({
 *   imports: [EventsModule.forRoot(eventsConfig)],
 * })
 * export class AppModule {}
 * ```
 *
 * @module config/events
 */

import type { EventModuleOptions } from "@stackra/ts-events";

/**
 * Events configuration.
 *
 * @example
 * ```typescript
 * import { EventFacade } from '@stackra/ts-events';
 *
 * const events = EventFacade.dispatcher();
 * events.listen('user.*', (data) => console.log(data));
 * events.dispatch('user.created', { id: 1 });
 * ```
 */
const eventsConfig: EventModuleOptions = {
  /*
  |--------------------------------------------------------------------------
  | Default Dispatcher
  |--------------------------------------------------------------------------
  |
  | The name of the default dispatcher. Must match a key in `dispatchers`.
  |
  */
  default: env("VITE_EVENTS_DEFAULT", "memory"),

  /*
  |--------------------------------------------------------------------------
  | Dispatchers
  |--------------------------------------------------------------------------
  |
  | Named dispatcher configurations. Each has a `driver` field.
  |
  | Drivers:
  |   - 'memory': In-memory (Map + RxJS Subject). Default.
  |   - 'redis':  Redis-backed via @stackra/ts-redis.
  |   - 'null':   No-op for testing.
  |
  */
  dispatchers: {
    /**
     * In-memory dispatcher using Map + RxJS Subject.
     * Supports wildcard patterns (e.g. `user.*`).
     */
    memory: {
      driver: "memory",

      /**
       * Enable wildcard pattern matching for event names.
       * @default true
       */
      wildcards: env("VITE_EVENTS_WILDCARDS", true),
    },

    // redis: {
    //   driver: 'redis',
    //   connection: env('VITE_EVENTS_REDIS_CONNECTION', 'events'),
    //   prefix: env('VITE_EVENTS_REDIS_PREFIX', 'events:'),
    //   wildcards: env('VITE_EVENTS_WILDCARDS', true),
    //   pollingInterval: env('VITE_EVENTS_POLLING_INTERVAL', 1000),
    // },

    // test: {
    //   driver: 'null',
    // },
  },

  /*
  |--------------------------------------------------------------------------
  | Wildcards
  |--------------------------------------------------------------------------
  |
  | Global default for wildcard support. Individual dispatchers
  | can override this setting.
  |
  */
  wildcards: env("VITE_EVENTS_WILDCARDS", true),
};

export default eventsConfig;
