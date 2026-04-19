# Stackra POS — Full Project Task Breakdown

## Overview

Complete task breakdown for the Stackra POS platform across three monorepos:
frontend (TypeScript/React/Electron), backend (PHP/Laravel), and mobile
(Flutter). Each top-level task maps to a Jira Epic, sub-items map to
Stories/Tasks, and their children map to Sub-tasks.

## Tasks

- [ ] 1. Project Infrastructure & Environment Setup
  - [ ] 1.1 Initialize frontend monorepo with pnpm workspaces, Turborepo, and
        shared tooling (ESLint, Prettier, TypeScript)
  - [ ] 1.2 Initialize PHP backend monorepo with Composer workspaces, Laravel
        framework module, and shared tooling (PHPStan, Pint, Rector)
  - [ ] 1.3 Initialize Flutter monorepo with Melos, shared analysis options, and
        workspace pubspec
  - [ ] 1.4 Configure CI/CD pipelines for all three monorepos (build, lint,
        test, deploy)
  - [ ] 1.5 Set up shared Git hooks (pre-commit linting, commit message
        validation)
  - [ ] 1.6 Configure Jira project, boards, and sync scripts for all monorepos
  - [ ] 1.7 Set up local development environment documentation (README,
        CONTRIBUTING)

- [ ] 2. Frontend: @stackra-inc/ts-container — IoC Container & DI
  - [ ] 2.1 Implement Container class with bind, singleton, factory, resolve,
        and make methods
  - [ ] 2.2 Implement @Injectable(), @Inject(), @Optional() decorators with
        reflect-metadata
  - [ ] 2.3 Implement @Module() decorator with imports, providers, exports, and
        DynamicModule support
  - [ ] 2.4 Implement forRoot() / forFeature() static module pattern for runtime
        configuration
  - [ ] 2.5 Implement ApplicationContext with module graph resolution,
        dependency ordering, and lifecycle hooks (OnModuleInit)
  - [ ] 2.6 Implement InstanceLoader for recursive module instantiation and hook
        invocation
  - [ ] 2.7 Build and publish package with tsup (ESM + CJS + DTS)

- [ ] 3. Frontend: @stackra-inc/ts-container-react — React DI Integration
  - [ ] 3.1 Implement ContainerProvider React context that accepts
        ApplicationContext
  - [ ] 3.2 Implement useInject() hook for resolving services from the DI
        container
  - [ ] 3.3 Implement useOptionalInject() hook for optional service resolution
  - [ ] 3.4 Build and publish package

- [ ] 4. Frontend: @stackra-inc/ts-application — App Bootstrap
  - [ ] 4.1 Implement bootstrapApp(AppModule) function that creates
        ApplicationContext and resolves all modules
  - [ ] 4.2 Implement module graph traversal and topological sort for dependency
        ordering
  - [ ] 4.3 Implement lifecycle hook invocation (OnModuleInit) after all modules
        are resolved
  - [ ] 4.4 Build and publish package

- [ ] 5. Frontend: @stackra-inc/ts-support — Shared Utilities
  - [ ] 5.1 Implement BaseRegistry abstract class with Map-based storage, get,
        has, getAll, clear
  - [ ] 5.2 Implement MultipleInstanceManager abstract class for named
        driver/store management
  - [ ] 5.3 Implement common utility functions (deep merge, type guards, string
        helpers)
  - [ ] 5.4 Build and publish package

- [ ] 6. Frontend: @stackra-inc/ts-config — Environment Configuration
  - [ ] 6.1 Implement ConfigModule with forRoot() DI registration
  - [ ] 6.2 Implement ConfigService with get, set, has, all methods
  - [ ] 6.3 Implement EnvDriver that reads from import.meta.env (Vite),
        process.env (Node), or window.**APP_CONFIG**
  - [ ] 6.4 Implement auto-prefix stripping (VITE*, NEXT_PUBLIC*, REACT*APP*)
  - [ ] 6.5 Implement environment variable expansion and type coercion
  - [ ] 6.6 Build and publish package

- [ ] 7. Frontend: @stackra-inc/ts-logger — Structured Logging
  - [ ] 7.1 Implement LoggerModule with forRoot() DI registration
  - [ ] 7.2 Implement LoggerManager extending MultipleInstanceManager for named
        channels
  - [ ] 7.3 Implement LoggerService with debug, info, warn, error, fatal methods
        and context support
  - [ ] 7.4 Implement ConsoleTransporter, StorageTransporter, and
        NullTransporter drivers
  - [ ] 7.5 Implement log level filtering, channel routing, and combined channel
        support
  - [ ] 7.6 Implement useLogger() React hook
  - [ ] 7.7 Build and publish package

- [ ] 8. Frontend: @stackra-inc/ts-redis — Upstash Redis Client
  - [ ] 8.1 Implement RedisModule with forRoot() DI registration
  - [ ] 8.2 Implement RedisManager extending MultipleInstanceManager for named
        connections
  - [ ] 8.3 Implement UpstashConnector for browser-compatible Redis via REST API
  - [ ] 8.4 Implement RedisService wrapper with get, set, del, keys, expire,
        ttl, pipeline methods
  - [ ] 8.5 Implement graceful startup when no credentials are configured (no
        crash)
  - [ ] 8.6 Implement useRedis() React hook
  - [ ] 8.7 Build and publish package

- [ ] 9. Frontend: @stackra-inc/ts-cache — Multi-Driver Cache
  - [ ] 9.1 Implement CacheModule with forRoot() DI registration
  - [ ] 9.2 Implement CacheManager extending MultipleInstanceManager for named
        stores
  - [ ] 9.3 Implement MemoryCacheDriver with TTL, max size, and LRU eviction
  - [ ] 9.4 Implement RedisCacheDriver using RedisService for distributed
        caching
  - [ ] 9.5 Implement SessionStorageCacheDriver for browser session storage
  - [ ] 9.6 Implement NullCacheDriver for testing
  - [ ] 9.7 Implement CacheService with get, set, has, forget, flush, remember,
        tags methods
  - [ ] 9.8 Implement useCache() React hook
  - [ ] 9.9 Build and publish package

- [ ] 10. Frontend: @stackra-inc/ts-events — Event Dispatcher
  - [ ] 10.1 Implement EventsModule with forRoot() DI registration
  - [ ] 10.2 Implement EventManager extending MultipleInstanceManager for named
        dispatchers
  - [ ] 10.3 Implement MemoryDispatcher with wildcard support, priority
        ordering, and once listeners
  - [ ] 10.4 Implement RedisDispatcher for cross-process event pub/sub
  - [ ] 10.5 Implement NullDispatcher for testing
  - [ ] 10.6 Implement EventService with dispatch, listen, subscribe, forget
        methods
  - [ ] 10.7 Implement @Subscriber() and @OnEvent() decorators for declarative
        event handling
  - [ ] 10.8 Implement useEvents() and useEvent() React hooks
  - [ ] 10.9 Build and publish package

- [ ] 11. Frontend: @stackra-inc/ts-settings — Settings Management
  - [ ] 11.1 Implement SettingsModule with forRoot() DI registration
  - [ ] 11.2 Implement SettingsManager extending MultipleInstanceManager for
        named stores
  - [ ] 11.3 Implement MemorySettingsDriver for in-memory settings
  - [ ] 11.4 Implement LocalStorageSettingsDriver for persistent browser
        settings
  - [ ] 11.5 Implement SettingsService with get, set, has, forget, all methods
  - [ ] 11.6 Implement useSettings() React hook
  - [ ] 11.7 Build and publish package

- [ ] 12. Frontend: @stackra-inc/kbd — Keyboard Shortcut Management
  - [ ] 12.1 Implement ShortcutRegistry extending BaseRegistry with platform
        detection, conflict detection, and group management
  - [ ] 12.2 Implement KbdModule with forRoot() / forFeature() DI registration
  - [ ] 12.3 Implement built-in shortcuts (navigation, search, editing, view,
        help, modal)
  - [ ] 12.4 Implement RefineKbd component for displaying keyboard shortcuts
        with HeroUI Kbd
  - [ ] 12.5 Implement ShortcutList, ShortcutHelp, ShortcutHint display
        components
  - [ ] 12.6 Implement useKeyboardShortcut(), useShortcut(),
        useShortcutRegistry() React hooks
  - [ ] 12.7 Implement KbdVisibilityProvider context for toggling shortcut hint
        visibility
  - [ ] 12.8 Build and publish package

- [ ] 13. Frontend: @stackra-inc/ts-desktop — Electron Desktop Integration
      (Core)
  - [ ] 13.1 Implement DesktopModule with forRoot() / forFeature() DI
        registration
  - [ ] 13.2 Implement DesktopManager with platform detection (Electron vs
        browser) and bridge auto-selection
  - [ ] 13.3 Implement DesktopBridge interface with invoke, send, on generic IPC
        methods
  - [ ] 13.4 Implement ElectronBridge using window.electronAPI (preload-exposed)
  - [ ] 13.5 Implement BrowserBridge with graceful fallbacks (window.print,
        Notification API, etc.)
  - [ ] 13.6 Implement MenuRegistry for collecting @Menu/@MenuItem decorated
        classes
  - [ ] 13.7 Implement @Menu(), @MenuItem(), @OnIpc() decorators
  - [ ] 13.8 Implement useDesktop() and useMenuAction() React hooks
  - [ ] 13.9 Integrate with kbd package — inject ShortcutRegistry via DI,
        register menu shortcuts automatically
  - [ ] 13.10 Build and publish package

- [ ] 14. Frontend: @stackra-inc/ts-desktop — Enhanced Services (23 services)
  - [ ] 14.1 Implement error types: DesktopServiceError, HardwareTimeoutError,
        HardwareNotConfiguredError
  - [ ] 14.2 Add 21 DI tokens for all new services
  - [ ] 14.3 Create shared type interfaces for all 7 service domains (hardware,
        offline, window, security, system, diagnostics, update)
  - [ ] 14.4 Extend DesktopModuleOptions with printer, cashDrawer, scanner,
        scale, display, offline, sync, lock, crashReporter, protocol,
        trayOptions, notificationDelay config fields
  - [ ] 14.5 Implement EscPosFormatter injectable service for receipt formatting
  - [ ] 14.6 Implement PrinterService — ESC/POS thermal receipt printing with
        browser fallback
  - [ ] 14.7 Implement CashDrawerService — serial/printer-kick drawer control
        with 5s timeout
  - [ ] 14.8 Implement ScannerService — HID barcode scanner detection via DOM
        keydown events
  - [ ] 14.9 Implement ScaleService — serial weight scale reading with 3s
        timeout
  - [ ] 14.10 Implement DisplayService — pole display and second screen
        management
  - [ ] 14.11 Implement PermissionService — USB, Bluetooth, Serial, Camera,
        Microphone permission management
  - [ ] 14.12 Implement OfflineService — online/offline detection, operation
        queuing to localStorage
  - [ ] 14.13 Implement SyncService — FIFO queue processing with retry backoff,
        auto-sync on reconnect
  - [ ] 14.14 Implement WindowService — multi-window management, fullscreen,
        kiosk mode
  - [ ] 14.15 Implement TrayService — system tray icon and context menu
  - [ ] 14.16 Implement DockService — macOS dock badge and bounce
  - [ ] 14.17 Implement AutoUpdateService — electron-updater integration with
        lifecycle events
  - [ ] 14.18 Implement AuthNativeService — Touch ID / Windows Hello biometric
        authentication
  - [ ] 14.19 Implement KeychainService — OS keychain credential storage with
        safeStorage
  - [ ] 14.20 Implement LockService — idle timeout detection and screen lock
        events
  - [ ] 14.21 Implement ClipboardService — system clipboard read/write with
        browser fallback
  - [ ] 14.22 Implement FileSystemService — native file dialogs and
        drag-and-drop with browser fallback
  - [ ] 14.23 Implement ProtocolService — custom URL protocol registration and
        deep linking
  - [ ] 14.24 Implement PowerService — sleep prevention with Wake Lock API
        fallback
  - [ ] 14.25 Implement NotificationService — rich OS notifications with action
        buttons and queuing
  - [ ] 14.26 Implement CrashReporterService — Electron crashReporter + Sentry
        integration
  - [ ] 14.27 Implement DiagnosticsService — system info, memory, GPU, network
        status
  - [ ] 14.28 Register all 23 services in DesktopModule.forRoot() with exports
  - [ ] 14.29 Update barrel exports in index.ts with all services, interfaces,
        tokens, and errors

- [ ] 15. Frontend: Electron App — Main Process & Preload
  - [ ] 15.1 Implement production-ready main process with single instance lock
  - [ ] 15.2 Implement window state persistence (save/restore size, position,
        maximized state)
  - [ ] 15.3 Implement show:false + ready-to-show pattern to prevent white flash
        on startup
  - [ ] 15.4 Implement security hardening: sandbox, contextIsolation,
        webSecurity, no nodeIntegration
  - [ ] 15.5 Implement CSP headers (strict in production, relaxed for dev HMR)
  - [ ] 15.6 Implement permission request handler with allowlist
  - [ ] 15.7 Implement navigation blocking (prevent renderer from navigating to
        external URLs)
  - [ ] 15.8 Implement external link handler (open in default browser)
  - [ ] 15.9 Implement uncaught exception and unhandled rejection handlers
  - [ ] 15.10 Implement preload script with channel allowlists for invoke, send,
        and on
  - [ ] 15.11 Implement handler map pattern — one file per domain (17 handler
        files)
  - [ ] 15.12 Implement printer.handler.ts — ESC/POS print, list printers,
        configure
  - [ ] 15.13 Implement cash-drawer.handler.ts — open drawer, read status
  - [ ] 15.14 Implement scale.handler.ts — read weight, subscribe/unsubscribe
        continuous updates
  - [ ] 15.15 Implement display.handler.ts — pole display, secondary screen
        window, clear, list displays
  - [ ] 15.16 Implement window.handler.ts — create/close child windows,
        fullscreen, kiosk, list windows
  - [ ] 15.17 Implement tray.handler.ts — create tray, context menu, badge,
        destroy
  - [ ] 15.18 Implement dock.handler.ts — macOS dock badge and bounce
  - [ ] 15.19 Implement security.handler.ts — Touch ID, keychain set/get/delete
        with safeStorage
  - [ ] 15.20 Implement power.handler.ts — powerSaveBlocker start/stop, power
        state
  - [ ] 15.21 Implement protocol.handler.ts — register custom URL scheme,
        forward protocol URLs
  - [ ] 15.22 Implement permission.handler.ts — camera/mic permission via
        systemPreferences
  - [ ] 15.23 Implement update.handler.ts — electron-updater
        check/download/install with event forwarding
  - [ ] 15.24 Implement diagnostics.handler.ts — system info, GPU info, memory
        usage
  - [ ] 15.25 Implement crash-reporter.handler.ts — start Electron crashReporter
  - [ ] 15.26 Implement clipboard.handler.ts — read/write system clipboard
  - [ ] 15.27 Implement file-system.handler.ts — native open/save file dialogs
  - [ ] 15.28 Implement notification.handler.ts — OS notifications with action
        forwarding
  - [ ] 15.29 Implement registerAllHandlers barrel that wires all 17 handler
        files
  - [ ] 15.30 Configure electron-builder for macOS (dmg, universal), Windows
        (NSIS), Linux (AppImage, deb)
  - [ ] 15.31 Create macOS entitlements plist for hardened runtime, camera, USB,
        serial, Bluetooth, keychain
  - [ ] 15.32 Configure dev script with concurrently (Vite dev server +
        Electron)

- [ ] 16. Frontend: Vite App — Integration & UI
  - [ ] 16.1 Configure Vite app with @vitejs/plugin-react-swc for decorator
        support
  - [ ] 16.2 Implement AppModule root DI module importing all package modules
        with config files
  - [ ] 16.3 Implement bootstrapApp(AppModule) in main.tsx with
        ContainerProvider
  - [ ] 16.4 Implement Provider app shell with Navbar, content area, and footer
  - [ ] 16.5 Implement GlobalShortcuts component for activating all registered
        keyboard shortcuts
  - [ ] 16.6 Create config files for each package (config, logger, redis, cache,
        events, settings, desktop)
  - [ ] 16.7 Implement @Menu classes (FileMenu, EditMenu, ViewMenu) with
        @MenuItem decorators
  - [ ] 16.8 Implement theme switcher with dark mode support and Electron CSS
        integration
  - [ ] 16.9 Implement is-electron CSS class for traffic light padding and drag
        region
  - [ ] 16.10 Implement demo pages for each package (Config, Logger, Container)
  - [ ] 16.11 Configure dependency graph — all @stackra-inc/_ packages as
        workspace:_ dependencies

- [ ] 17. Frontend: Package Standardization
  - [ ] 17.1 Standardize tsup.config.ts across all packages (ESM + CJS + DTS,
        es2020 target)
  - [ ] 17.2 Standardize tsconfig.json across all packages (paths, decorators,
        strict mode)
  - [ ] 17.3 Standardize vitest.config.ts across all packages
  - [ ] 17.4 Standardize eslint.config.ts across all packages
  - [ ] 17.5 Standardize .prettierrc.mjs and .prettierignore across all packages
  - [ ] 17.6 Standardize .gitignore, LICENSE, CHANGELOG.md across all packages
  - [ ] 17.7 Add detailed docblocks in Laravel |---| style to all config files
  - [ ] 17.8 Verify all packages build successfully (pnpm -r build)
  - [ ] 17.9 Verify dependency graph — workspace packages use workspace:\*,
        framework deps are peerDependencies

- [ ] 18. Backend: Project Infrastructure & Monorepo Setup
  - [ ] 18.1 Initialize PHP monorepo with Composer workspaces (modules/ and
        applications/ directories)
  - [ ] 18.2 Configure Turborepo (turbo.json) for parallel builds, linting, and
        testing across modules
  - [ ] 18.3 Configure PHPStan (phpstan.neon) for static analysis across all
        modules
  - [ ] 18.4 Configure Laravel Pint (pint.json) for code style enforcement
  - [ ] 18.5 Configure Rector (rector.php) for automated code upgrades and
        refactoring
  - [ ] 18.6 Set up pnpm-workspace.yaml for Node.js tooling (Prettier, scripts)
  - [ ] 18.7 Set up Jira sync script for backend monorepo
  - [ ] 18.8 Create README.md, CONTRIBUTING.md, and CHANGELOG.md

- [ ] 19. Backend: stackra-inc/laravel-foundation — Core Foundation Module
  - [ ] 19.1 Implement custom Application class extending Laravel Application
        with module-aware bootstrapping
  - [ ] 19.2 Implement ApplicationBuilder with HasDirectories, HasEnvironments,
        HasServiceProviders, HasExecutableCommands concerns
  - [ ] 19.3 Implement FoundationServiceProvider with config publishing, view
        registration, and i18n loading
  - [ ] 19.4 Implement ApplicationInterface and DataObjectInterface contracts
  - [ ] 19.5 Implement 30+ shared Enums (HttpStatusCode, Status, OrderStatus,
        UserType, UserStatus, DeviceType, CacheDriver, DatabaseDriver,
        SessionDriver, QueueDriver, MailDriver, FilesystemDriver, LogDriver,
        Theme, Direction, SortOrder, Position, Orientation, Color, Emoji,
        GoogleFont, FileExtension, ContentType, Characterset, CronExpression,
        Duration, DataType, CastType, Environment, EventType, ExecutableType,
        ContainerToken, PolicyAbility, HttpMethod, Locale)
  - [ ] 19.6 Implement 20+ Exception classes (NotFoundException,
        ForbiddenException, BadRequestException, ConflictException,
        UnprocessableEntityException, InternalServerException,
        AuthenticationException, PaymentRequiredException,
        TooManyRequestsException, ServiceUnavailableException,
        GatewayTimeoutException, TimeoutException, PermissionDeniedException,
        UserLockedException, AlreadyExistsException, CouldNotSaveException,
        CouldNotDeleteException, NoSuchEntityException, InputException,
        SystemException, RuntimeException, LogicException,
        BadMethodCallException, InvalidArgumentException, MailException,
        NodeNotFoundException)
  - [ ] 19.7 Implement Exception Handler with RenderCustomErrorViews for branded
        error pages
  - [ ] 19.8 Implement error Blade views for all HTTP status codes (400, 401,
        402, 403, 404, 405, 408, 419, 422, 429, 500, 502, 503, 504)
  - [ ] 19.9 Implement app layout Blade views with theme scripts and styles
        partials
  - [ ] 19.10 Implement i18n error messages (English and Arabic)
  - [ ] 19.11 Implement AiSolution and AiSolutionProvider with
        @AsSolutionProvider attribute for AI-powered error solutions
  - [ ] 19.12 Implement SolutionInterface contract for pluggable error solutions
  - [ ] 19.13 Implement BaseEmail abstract class for standardized email
        templates
  - [ ] 19.14 Implement BaseEvent abstract class for standardized event
        dispatching
  - [ ] 19.15 Implement BaseCommand and GeneratorCommand for CLI scaffolding
  - [ ] 19.16 Implement CacheCleanCommand and CacheFlushCommand Artisan commands
  - [ ] 19.17 Implement RootController for health check and root API endpoint
  - [ ] 19.18 Implement Binaryable trait for binary data handling

- [ ] 20. Backend: stackra-inc/laravel-framework — Framework Utilities Module
  - [ ] 20.1 Implement attribute-based routing system (@Get, @Post, @Put,
        @Patch, @Delete, @Options, @Route, @Resource, @ApiResource)
  - [ ] 20.2 Implement route attribute modifiers (@Group, @Prefix, @Domain,
        @DomainFromConfig, @Middleware, @ScopeBindings, @WithTrashed, @Where,
        @WhereAlpha, @WhereAlphaNumeric, @WhereNumber, @WhereUuid, @WhereUlid,
        @WhereIn, @Fallback)
  - [ ] 20.3 Implement RouteRegistrar and ClassRouteAttributes for scanning and
        registering attribute-based routes
  - [ ] 20.4 Implement RoutingServiceProvider for automatic route discovery from
        controller attributes
  - [ ] 20.5 Implement @AsController and @AsMiddleware attributes for
        auto-registration
  - [ ] 20.6 Implement @Bind, @Defaults, @Any, @Tagged, @Description, @Label,
        @Meta attributes
  - [ ] 20.7 Implement base Controller class with InteractsWithAuth,
        InteractsWithRequest, InteractsWithResponse, InteractsWithResources,
        InteractsWithPagination, InteractsWithBulkOperations,
        InteractsWithServices concerns
  - [ ] 20.8 Implement DataObject base class with DataObject trait for
        structured data transfer
  - [ ] 20.9 Implement Serializer service with SerializerInterface contract and
        Serializer facade
  - [ ] 20.10 Implement Json utility class with JsonInterface contract and Json
        facade
  - [ ] 20.11 Implement Str, Arr, Path, Collection utility classes extending
        Laravel helpers
  - [ ] 20.12 Implement CaseConverter for snake_case, camelCase, PascalCase,
        kebab-case conversions
  - [ ] 20.13 Implement EmailValidator with DisposableEmail facade for
        disposable email detection
  - [ ] 20.14 Implement Password utility for password generation and validation
  - [ ] 20.15 Implement Enum base class with CallableCases, Comparable,
        Nameable, Valuable, Optionable, Translatable, Metable concerns
  - [ ] 20.16 Implement Reflection and Meta utilities for runtime class/property
        inspection
  - [ ] 20.17 Implement HasDiscovery concern for automatic class discovery in
        directories
  - [ ] 20.18 Implement HasLaravelPaths concern for resolving Laravel directory
        paths
  - [ ] 20.19 Implement SetLocale and TimezoneMiddleware for i18n and timezone
        handling
  - [ ] 20.20 Implement LocalizationServiceProvider with config publishing
  - [ ] 20.21 Implement ContainerServiceProvider for custom container bindings
  - [ ] 20.22 Implement Emitter trait for event emission from any class
  - [ ] 20.23 Implement Singleton trait for singleton pattern enforcement
  - [ ] 20.24 Implement Polyfills and Support helpers

- [ ] 21. Backend: stackra-inc/laravel-database — Database Module
  - [ ] 21.1 Implement DatabaseServiceProvider with migration path registration
        and config publishing
  - [ ] 21.2 Implement migration management for modular migration loading from
        each module
  - [ ] 21.3 Implement seeder infrastructure for modular database seeding

- [ ] 22. Backend: stackra-inc/laravel-user — User Domain Module
  - [ ] 22.1 Implement User model with factory, fillable attributes, and casts
  - [ ] 22.2 Implement UserFactory for testing and seeding
  - [ ] 22.3 Implement create_users_table migration
  - [ ] 22.4 Implement UserServiceProvider with migration and factory
        registration

- [ ] 23. Backend: stackra-inc/laravel-octane — High-Performance Server Module
  - [ ] 23.1 Implement OctaneServiceProvider with command registration
  - [ ] 23.2 Implement StartAppCommand — production-ready RoadRunner server
        start with auto-optimization (config, route, view, event caching),
        configurable host/port/workers, file watching for dev, and log levels
  - [ ] 23.3 Implement RestartAppCommand — graceful server restart
  - [ ] 23.4 Implement StopAppCommand — graceful server shutdown

- [ ] 24. Backend: stackra-inc/laravel-docker — Docker Infrastructure Module
  - [ ] 24.1 Implement DockerScripts Composer plugin for container lifecycle
        management
  - [ ] 24.2 Implement Docker Compose configuration for development (PHP-FPM,
        MySQL, Redis, Nginx)
  - [ ] 24.3 Implement production Dockerfile with multi-stage build and
        Octane/RoadRunner

- [ ] 25. Backend: API Application (applications/api)
  - [ ] 25.1 Scaffold Laravel API application with modular bootstrap
        (bootstrap/app.php)
  - [ ] 26.2 Configure module auto-discovery via config/modules.php
  - [ ] 26.3 Configure application services (app, auth, cache, database,
        filesystems, logging, mail, queue, services, session)
  - [ ] 27.4 Implement base Controller extending framework Controller
  - [ ] 26.5 Implement API routing with attribute-based route registration
  - [ ] 26.6 Implement DatabaseSeeder for initial data
  - [ ] 26.7 Configure Rector for API-specific code quality rules

- [ ] 26. Flutter: Core Packages
  - [ ] 27.1 Implement stackra-inc_container — IoC container with service
        locator pattern
  - [ ] 27.2 Implement stackra-inc_config — environment-aware configuration
  - [ ] 27.3 Implement stackra-inc_logger — structured logging with channels
  - [ ] 27.4 Implement stackra-inc_cache — multi-driver caching (memory,
        shared_preferences, Hive)
  - [ ] 26.5 Implement stackra-inc_database — database abstraction with
        Drift/Isar
  - [ ] 26.6 Implement stackra-inc_localization — i18n with ARB files and locale
        switching
  - [ ] 26.7 Implement stackra-inc_support — shared utilities and base classes

- [ ] 27. Flutter: UI Package & Example App
  - [ ] 27.1 Implement stackra-inc_ui — design system widgets (buttons, cards,
        inputs, modals)
  - [ ] 27.2 Implement AppOnboarding widget with PageView navigation and dot
        indicators
  - [ ] 27.3 Implement stackra-inc_refine — data provider and CRUD framework
  - [ ] 27.4 Implement example_app with all packages integrated and demo pages
