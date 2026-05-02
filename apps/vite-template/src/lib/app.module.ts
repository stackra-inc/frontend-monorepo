/**
 * Application Root Module
 *
 * Bootstraps all @stackra packages into the DI container.
 * Each package is imported via its `forRoot()` static method,
 * which registers the package's services globally.
 *
 * @module lib/app
 */

import { Module } from "@stackra/ts-container";
import { ConfigModule } from "@stackra/ts-config";
import { CacheModule } from "@stackra/ts-cache";
import { EventsModule } from "@stackra/ts-events";
import { HttpModule } from "@stackra/ts-http";
import { RedisModule } from "@stackra/ts-redis";
import { LoggerModule } from "@stackra/ts-logger";
import { I18nModule } from "@stackra/react-i18n";
import { RealtimeModule } from "@stackra/ts-realtime";
import { RouterModule } from "@stackra/react-router";
import { TrackingModule, RouterTrackingMiddleware } from "@stackra/react-tracking";

import configConfig from "@/config/config.config";
import cacheConfig from "@/config/cache.config";
import eventsConfig from "@/config/events.config";
import redisConfig from "@/config/redis.config";
import loggerConfig from "@/config/logger.config";
import i18nConfig from "@/config/i18n.config";
import realtimeConfig from "@/config/realtime.config";
import trackingConfig from "@/config/tracking.config";

// Translation resources — imported here (not in config) because Vite
// handles JSON imports in the transform pipeline, while the config plugin
// loads files at the Node.js level where JSON import attributes are required.
import commonEn from "@/i18n/common.en.json";
import commonAr from "@/i18n/common.ar.json";
import commonEs from "@/i18n/common.es.json";
import commonFr from "@/i18n/common.fr.json";
import commonDe from "@/i18n/common.de.json";

// Import all routes to ensure @Route decorators are executed
import "@/pages";

@Module({
  imports: [
    ConfigModule.forRoot(configConfig),
    CacheModule.forRoot(cacheConfig),
    EventsModule.forRoot(eventsConfig),
    HttpModule.forRoot(),
    LoggerModule.forRoot(loggerConfig),
    I18nModule.forRoot({
      ...i18nConfig,
      i18nextOptions: {
        ...i18nConfig.i18nextOptions,
        resources: {
          en: { common: commonEn },
          ar: { common: commonAr },
          es: { common: commonEs },
          fr: { common: commonFr },
          de: { common: commonDe },
        },
        ns: ["common"],
        defaultNS: "common",
      },
    }),
    TrackingModule.forRoot(trackingConfig),
    RouterModule.forRoot({
      middleware: [RouterTrackingMiddleware],
    }),
    // Conditional modules — filter out null when credentials aren't configured
    RedisModule.forRootAsync({
      useFactory: () => {
        // Check credentials at runtime when env() is available
        const url = env("VITE_UPSTASH_REDIS_REST_URL");
        const token = env("VITE_UPSTASH_REDIS_REST_TOKEN");

        if (!url || !token) {
          console.warn("[RedisModule] Skipping: credentials not configured");
          // Return a valid but empty config that RedisManager can handle gracefully
          return {
            default: "main",
            connections: {},
          };
        }

        return redisConfig;
      },
    }),
    RealtimeModule.forRoot(realtimeConfig),
  ].filter(Boolean),
})
export class AppModule {}
