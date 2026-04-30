/**
 * Basic DI Example
 *
 * Demonstrates core dependency injection features:
 * - @Injectable, @Inject, @Optional decorators
 * - @Module for grouping providers
 * - All provider types: class, value, factory, existing (alias)
 * - Lifecycle hooks: OnModuleInit, OnModuleDestroy
 */

import 'reflect-metadata';
import {
  Injectable,
  Inject,
  Optional,
  Module,
  Application,
  Scope,
  type OnModuleInit,
  type OnModuleDestroy,
} from '@stackra/ts-container';

// ── Injection tokens ───────────────────────────────────────────────────────

const API_URL = 'API_URL';
const APP_VERSION = Symbol('APP_VERSION');

// ── Services ───────────────────────────────────────────────────────────────

/**
 * Simple singleton service — auto-resolved by the container.
 */
@Injectable()
class LoggerService implements OnModuleInit, OnModuleDestroy {
  onModuleInit() {
    console.log('[LoggerService] initialized');
  }

  onModuleDestroy() {
    console.log('[LoggerService] destroyed');
  }

  info(message: string) {
    console.log(`[INFO] ${message}`);
  }

  warn(message: string) {
    console.warn(`[WARN] ${message}`);
  }
}

/**
 * Service with explicit @Inject for string/symbol tokens
 * and @Optional for a dependency that may not exist.
 */
@Injectable()
class ApiService implements OnModuleInit {
  constructor(
    private logger: LoggerService,
    @Inject(API_URL) private apiUrl: string,
    @Inject(APP_VERSION) private version: symbol,
    @Optional() private analytics?: unknown
  ) {}

  onModuleInit() {
    this.logger.info(`ApiService ready — ${this.apiUrl} (v${String(this.version)})`);
    this.logger.info(`Analytics available: ${this.analytics !== undefined}`);
  }

  fetchUsers() {
    this.logger.info(`GET ${this.apiUrl}/users`);
    return [
      { id: 1, name: 'Alice' },
      { id: 2, name: 'Bob' },
    ];
  }
}

/**
 * Transient service — new instance per injection.
 */
@Injectable({ scope: Scope.TRANSIENT })
class RequestIdService {
  public readonly id = Math.random().toString(36).slice(2, 8);
}

// ── Module ─────────────────────────────────────────────────────────────────

@Module({
  providers: [
    // Class providers (shorthand and explicit)
    LoggerService,
    { provide: ApiService, useClass: ApiService },

    // Value providers
    { provide: API_URL, useValue: 'https://api.example.com' },
    { provide: APP_VERSION, useValue: '1.0.0' },

    // Factory provider — receives injected dependencies
    {
      provide: 'GREETING',
      useFactory: (logger: LoggerService) => {
        logger.info('Factory: creating greeting');
        return 'Hello from the factory!';
      },
      inject: [LoggerService],
    },

    // Existing (alias) provider — resolves to the same instance
    { provide: 'LOGGER_ALIAS', useExisting: LoggerService },

    // Transient provider
    RequestIdService,
  ],
  exports: [LoggerService, ApiService],
})
class AppModule {}

// ── Bootstrap ──────────────────────────────────────────────────────────────

async function main() {
  console.log('=== Basic DI Example ===\n');

  const app = await Application.create(AppModule);

  // Resolve providers
  const api = app.get(ApiService);
  const users = api.fetchUsers();
  console.log('\nUsers:', users);

  // Value provider
  const greeting = app.get<string>('GREETING');
  console.log('Greeting:', greeting);

  // Alias provider — same instance as LoggerService
  const alias = app.get<LoggerService>('LOGGER_ALIAS');
  const logger = app.get(LoggerService);
  console.log('Alias is same instance:', alias === logger);

  // Transient provider — different instance each time
  const req1 = app.get(RequestIdService);
  const req2 = app.get(RequestIdService);
  console.log(`Request IDs: ${req1.id}, ${req2.id} (same: ${req1.id === req2.id})`);

  // has() check
  console.log('Has ApiService:', app.has(ApiService));
  console.log('Has unknown:', app.has('UNKNOWN_TOKEN' as any));

  // getOptional() — returns undefined for missing providers
  const missing = app.getOptional('NON_EXISTENT' as any);
  console.log('Optional missing:', missing);

  // Graceful shutdown — triggers OnModuleDestroy
  console.log('');
  await app.close();
  console.log('\nDone.');
}

main().catch(console.error);
