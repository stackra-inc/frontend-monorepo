/**
 * Services for the React integration example.
 *
 * Defines injectable services, modules, and tokens used by the React components.
 */

import 'reflect-metadata';
import {
  Injectable,
  Inject,
  Module,
  Global,
  Scope,
  type DynamicModule,
  type OnModuleInit,
  type OnModuleDestroy,
} from '@stackra/ts-container';

// ── Tokens ─────────────────────────────────────────────────────────────────

export const API_BASE_URL = Symbol('API_BASE_URL');
export const THEME_CONFIG = Symbol('THEME_CONFIG');

// ── Types ──────────────────────────────────────────────────────────────────

export interface ThemeConfig {
  primary: string;
  mode: 'light' | 'dark';
}

export interface User {
  id: string;
  name: string;
  email: string;
}

// ── Services ───────────────────────────────────────────────────────────────

@Injectable()
export class LoggerService {
  info(msg: string) {
    console.log(`[INFO] ${msg}`);
  }
}

@Injectable()
export class AuthService implements OnModuleInit, OnModuleDestroy {
  private currentUser: User | null = null;

  constructor(private logger: LoggerService) {}

  onModuleInit() {
    this.logger.info('AuthService initialized');
    this.currentUser = { id: '1', name: 'Alice', email: 'alice@example.com' };
  }

  onModuleDestroy() {
    this.logger.info('AuthService destroyed');
  }

  getUser(): User | null {
    return this.currentUser;
  }

  isAuthenticated(): boolean {
    return this.currentUser !== null;
  }
}

@Injectable()
export class UserService {
  constructor(
    private auth: AuthService,
    private logger: LoggerService,
    @Inject(API_BASE_URL) private apiUrl: string
  ) {}

  getCurrentUser(): User | null {
    this.logger.info(`Fetching user from ${this.apiUrl}`);
    return this.auth.getUser();
  }

  getUsers(): User[] {
    return [
      { id: '1', name: 'Alice', email: 'alice@example.com' },
      { id: '2', name: 'Bob', email: 'bob@example.com' },
      { id: '3', name: 'Charlie', email: 'charlie@example.com' },
    ];
  }
}

/**
 * Optional service — may or may not be provided.
 * Components use useOptionalInject() to safely access it.
 */
@Injectable()
export class AnalyticsService {
  track(event: string) {
    console.log(`[Analytics] ${event}`);
  }
}

/**
 * Transient service — new instance per injection.
 */
@Injectable({ scope: Scope.TRANSIENT })
export class NotificationService {
  private readonly instanceId = Math.random().toString(36).slice(2, 6);

  notify(message: string) {
    console.log(`[Notification:${this.instanceId}] ${message}`);
  }

  getId() {
    return this.instanceId;
  }
}

// ── Modules ────────────────────────────────────────────────────────────────

@Global()
@Module({})
export class CoreModule {
  static forRoot(apiUrl: string): DynamicModule {
    return {
      module: CoreModule,
      global: true,
      providers: [LoggerService, { provide: API_BASE_URL, useValue: apiUrl }],
      exports: [LoggerService],
    };
  }
}

@Module({
  providers: [AuthService, UserService, NotificationService],
  exports: [AuthService, UserService, NotificationService],
})
export class UserModule {}

/**
 * This module is intentionally NOT imported in AppModule,
 * so AnalyticsService won't be available — demonstrating useOptionalInject().
 */
@Module({
  providers: [AnalyticsService],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}

@Module({
  imports: [
    CoreModule.forRoot('https://api.example.com'),
    UserModule,
    // AnalyticsModule is NOT imported — AnalyticsService will be undefined
  ],
  providers: [
    { provide: THEME_CONFIG, useValue: { primary: '#3b82f6', mode: 'light' } as ThemeConfig },
  ],
})
export class AppModule {}
