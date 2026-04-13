/**
 * @file app.module.ts
 * @description Root DI module for the Next.js application.
 *
 * Wires together the core packages:
 *   - @abdokouta/ts-config  — environment-aware configuration
 *   - @abdokouta/ts-logger  — structured logging with channels
 *   - @abdokouta/ts-redis   — Upstash Redis HTTP client
 *   - @abdokouta/ts-events        — Laravel-style event dispatcher
 *   - @abdokouta/ts-container      — NestJS-style dependency injection
 *
 * This module is bootstrapped once in the ContainerProvider and made
 * available to all React components via the useInject() hook.
 */

import "reflect-metadata";

import { Module } from "@abdokouta/ts-container";
import { ConfigModule } from "@abdokouta/ts-config";
import { LoggerModule } from "@abdokouta/ts-logger";
import { EventsModule } from "@abdokouta/ts-events";
import { RedisModule } from "@abdokouta/ts-redis";

/**
 * AppModule — root module of the application.
 *
 * Imports:
 *   - ConfigModule.forRoot()  — loads env vars, exposes ConfigService globally
 *   - LoggerModule.forRoot()  — configures logging channels, exposes LoggerService
 */
@Module({
  imports: [
    /**
     * ConfigModule — environment-aware configuration.
     *
     * Uses the EnvDriver by default which reads from process.env /
     * import.meta.env (Vite) or Next.js runtime env.
     *
     * isGlobal: true — ConfigService is available in every module
     * without re-importing ConfigModule.
     */
    ConfigModule.forRoot({
      driver: "env",
      isGlobal: true,
    }),

    /**
     * LoggerModule — structured logging with pluggable transporters.
     *
     * Channels:
     *   app     — pretty-printed console output (development)
     *   json    — JSON-formatted output (production / log aggregators)
     *   silent  — discards all output (testing)
     *
     * The active channel is selected by the LOG_CHANNEL env var,
     * defaulting to "app".
     */
    LoggerModule.forRoot({
      default: "app",
      channels: {
        app: {
          level: "debug",
          transporters: [
            {
              type: "console",
              format: "pretty",
            },
          ],
        },
        json: {
          level: "info",
          transporters: [
            {
              type: "console",
              format: "json",
            },
          ],
        },
        silent: {
          level: "debug",
          transporters: [{ type: "silent" }],
        },
      },
    }),

    /**
     * RedisModule — Upstash Redis HTTP client.
     *
     * Provides RedisService for browser-compatible Redis operations.
     * Used by the events package for the Redis dispatcher (cross-tab/cross-process).
     *
     * Connections:
     *   default — general-purpose Redis (cache, pub/sub, etc.)
     *   events  — dedicated connection for the event dispatcher
     *
     * Reads Upstash credentials from NEXT_PUBLIC_ env vars so they're
     * available in the browser bundle. These are safe to expose — Upstash
     * REST tokens are scoped and rate-limited.
     */
    RedisModule.forRoot({
      default: "default",
      connections: {
        default: {
          url: process.env.NEXT_PUBLIC_UPSTASH_REDIS_REST_URL ?? "",
          token: process.env.NEXT_PUBLIC_UPSTASH_REDIS_REST_TOKEN ?? "",
        },
        events: {
          url: process.env.NEXT_PUBLIC_UPSTASH_REDIS_REST_URL ?? "",
          token: process.env.NEXT_PUBLIC_UPSTASH_REDIS_REST_TOKEN ?? "",
        },
      },
    }),

    /**
     * EventsModule — Laravel-style event dispatcher.
     *
     * Registers EventService globally with named dispatchers:
     *   memory — in-memory (default, fast, local-only)
     *   redis  — cross-process via Upstash Redis pub/sub
     *   test   — null dispatcher (silences all dispatch)
     *
     * RedisService is injected automatically from RedisModule above.
     */
    EventsModule.forRoot({
      default: "memory",
      wildcards: true,
      dispatchers: {
        memory: {
          driver: "memory",
          wildcards: true,
        },
        redis: {
          driver: "redis",
          connection: "events",
          prefix: "pixielity:events:",
          wildcards: true,
          pollingInterval: 2000,
        },
        test: {
          driver: "null",
        },
      },
    }),
  ],
  providers: [],
  exports: [],
})
export class AppModule {}
