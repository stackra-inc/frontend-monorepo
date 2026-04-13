/**
 * @file lib/app.module.ts
 * @description Root DI module for the Vite application.
 *
 * Wires together the three core packages:
 *   - @abdokouta/ts-config  — environment-aware configuration
 *   - @abdokouta/ts-logger  — structured logging with channels
 *   - @abdokouta/ts-container      — NestJS-style dependency injection
 */

import "reflect-metadata";

import { Module } from "@abdokouta/ts-container";
import { ConfigModule } from "@abdokouta/ts-config";
import { LoggerModule } from "@abdokouta/ts-logger";

/**
 * AppModule — root module of the Vite application.
 *
 * Imports:
 *   - ConfigModule.forRoot()  — loads import.meta.env vars, exposes ConfigService globally
 *   - LoggerModule.forRoot()  — configures logging channels, exposes LoggerService
 */
@Module({
  imports: [
    /**
     * ConfigModule — environment-aware configuration.
     *
     * Uses the EnvDriver which reads from import.meta.env in Vite.
     * isGlobal: true — ConfigService is available in every module.
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
     *   json    — JSON-formatted output (production)
     *   silent  — discards all output (testing)
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
  ],
  providers: [],
  exports: [],
})
export class AppModule {}
