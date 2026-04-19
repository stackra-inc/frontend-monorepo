/**
 * App Module
 *
 * |--------------------------------------------------------------------------
 * | Root DI module for the Vite application.
 * |--------------------------------------------------------------------------
 * |
 * | Imports all package modules and passes their config files.
 * | Each config file lives in @/config/*.config.ts following
 * | the Laravel config pattern.
 * |
 * | Module load order matters — dependencies must be imported first:
 * |   1. ConfigModule  — env vars (no dependencies)
 * |   2. LoggerModule  — logging (depends on config via env)
 * |   3. RedisModule   — Redis connections (no DI dependencies)
 * |   4. CacheModule   — cache stores (depends on Redis for redis driver)
 * |   5. EventsModule  — event dispatchers (depends on Redis for redis driver)
 * |   6. SettingsModule — settings stores (depends on Cache)
 * |   7. DesktopModule — desktop bridge (no dependencies)
 * |
 */

import 'reflect-metadata';

import { Module } from '@stackra/ts-container';
import { ConfigModule } from '@stackra/ts-config';
import { LoggerModule } from '@stackra/ts-logger';
import { RedisModule } from '@stackra/ts-redis';
import { CacheModule } from '@stackra/ts-cache';
import { EventsModule } from '@stackra/ts-events';
import { SettingsModule } from '@stackra/ts-settings';
import { DesktopModule } from '@stackra/ts-desktop';
import { KbdModule } from '@stackra/kbd';
import { PwaModule } from '@stackra/ts-pwa';

import { configConfig } from '@/config/config.config';
import loggerConfig from '@/config/logger.config';
import redisConfig from '@/config/redis.config';
import cacheConfig from '@/config/cache.config';
import { defaultEventsConfig } from '@/config/events.config';
import { defaultSettingsConfig } from '@/config/settings.config';
import { desktopConfig } from '@/config/desktop.config';
import pwaConfig from '@/config/pwa.config';
import { FileMenu, EditMenu, ViewMenu } from '@/menus';

/**
 * AppModule — root module of the Vite application.
 *
 * All packages are imported here with their config files.
 * The DI container resolves dependencies automatically.
 */
@Module({
  imports: [
    /*
    |--------------------------------------------------------------------------
    | Config — environment-aware configuration
    |--------------------------------------------------------------------------
    |
    | Reads from import.meta.env (Vite) or import.meta.env (Node.js).
    | Auto-strips VITE_ / NEXT_PUBLIC_ prefix.
    | Global — available to all modules without re-importing.
    |
    */
    ConfigModule.forRoot(configConfig),

    /*
    |--------------------------------------------------------------------------
    | Logger — structured logging with channels
    |--------------------------------------------------------------------------
    |
    | Channels: console, storage, combined, errors, audit, silent.
    | Each channel has its own transporters and log level.
    |
    */
    LoggerModule.forRoot(loggerConfig),

    /*
    |--------------------------------------------------------------------------
    | Redis — Upstash Redis HTTP client
    |--------------------------------------------------------------------------
    |
    | Named connections: main, cache, session.
    | Browser-compatible via Upstash REST API.
    | Used by CacheModule and EventsModule for their redis drivers.
    |
    */
    RedisModule.forRoot(redisConfig),

    /*
    |--------------------------------------------------------------------------
    | Cache — multi-driver cache system
    |--------------------------------------------------------------------------
    |
    | Stores: memory (default), redis, session, null.
    | CacheManager resolves stores lazily on first access.
    | Redis store uses the 'cache' connection from RedisModule.
    |
    */
    CacheModule.forRoot(cacheConfig),

    /*
    |--------------------------------------------------------------------------
    | Events — Laravel-style event dispatcher
    |--------------------------------------------------------------------------
    |
    | Dispatchers: memory (default), redis (cross-process), null (testing).
    | Wildcards, priority, @Subscriber/@OnEvent decorators, RxJS streaming.
    |
    */
    EventsModule.forRoot(defaultEventsConfig),

    /*
    |--------------------------------------------------------------------------
    | Settings — registry-based settings with persistence
    |--------------------------------------------------------------------------
    |
    | Stores: memory (default), localStorage, API.
    | SettingsManager resolves stores lazily.
    |
    */
    SettingsModule.forRoot(defaultSettingsConfig),

    /*
    |--------------------------------------------------------------------------
    | Kbd — keyboard shortcut management
    |--------------------------------------------------------------------------
    |
    | Registers the ShortcutRegistry as a global DI singleton.
    | Built-in shortcuts (navigation, search, editing, etc.) are registered.
    | DesktopModule injects ShortcutRegistry to register menu shortcuts.
    |
    */
    KbdModule.forRoot({ registerBuiltIn: true }),

    /*
    |--------------------------------------------------------------------------
    | Desktop — Electron integration
    |--------------------------------------------------------------------------
    |
    | Auto-detects Electron vs browser.
    | ElectronBridge (real IPC) or BrowserBridge (fallbacks).
    | Provides useDesktop() hook for platform-agnostic desktop features.
    |
    */
    DesktopModule.forRoot(desktopConfig.module),

    /*
    |--------------------------------------------------------------------------
    | Desktop Menus — registered via forFeature
    |--------------------------------------------------------------------------
    |
    | Each @Menu class defines a menu section (File, Edit, View, etc.).
    | @MenuItem methods become menu items with accelerators and handlers.
    | The MenuRegistry collects them and sends to the Electron main process.
    |
    */
    DesktopModule.forFeature([FileMenu, EditMenu, ViewMenu]),

    /*
    |--------------------------------------------------------------------------
    | PWA — Progressive Web App features
    |--------------------------------------------------------------------------
    |
    | Install prompt, update prompt, offline indicator, splash screen,
    | pull-to-refresh, onboarding. Config drives both build-time
    | (vite-plugin-pwa) and runtime (React components).
    |
    */
    PwaModule.forRoot(pwaConfig),
  ],
  providers: [],
  exports: [],
})
export class AppModule {}
