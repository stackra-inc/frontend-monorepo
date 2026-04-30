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

import { configConfig } from "@/config/config.config";
import cacheConfig from "@/config/cache.config";
import { defaultEventsConfig } from "@/config/events.config";
import redisConfig from "@/config/redis.config";
import loggerConfig from "@/config/logger.config";
import { i18nConfig } from "@/config/i18n.config";
import { realtimeConfig } from "@/config/realtime.config";

@Module({
  imports: [
    ConfigModule.forRoot(configConfig),
    RedisModule.forRoot(redisConfig),
    CacheModule.forRoot(cacheConfig),
    EventsModule.forRoot(defaultEventsConfig),
    HttpModule.forRoot(),
    LoggerModule.forRoot(loggerConfig),
    I18nModule.forRoot(i18nConfig),
    RealtimeModule.forRoot(realtimeConfig),
  ],
})
export class AppModule {}
