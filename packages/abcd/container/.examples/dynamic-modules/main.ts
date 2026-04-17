/**
 * Dynamic Modules Example
 *
 * Demonstrates advanced module patterns:
 * - DynamicModule with forRoot() / forFeature()
 * - @Global() for globally available providers
 * - forwardRef() for circular module dependencies
 * - Multi-module composition
 * - select() for module-scoped resolution
 */

import 'reflect-metadata';
import {
  Injectable,
  Inject,
  Module,
  Global,
  Application,
  forwardRef,
  type DynamicModule,
  type OnModuleInit,
} from '@abdokouta/ts-container';

// ── Tokens ─────────────────────────────────────────────────────────────────

const CONFIG_OPTIONS = Symbol('CONFIG_OPTIONS');
const CACHE_OPTIONS = Symbol('CACHE_OPTIONS');
const FEATURE_FLAG = Symbol('FEATURE_FLAG');

// ── Config Module (Global + DynamicModule) ─────────────────────────────────

interface AppConfig {
  appName: string;
  debug: boolean;
}

@Injectable()
class ConfigService implements OnModuleInit {
  constructor(@Inject(CONFIG_OPTIONS) private config: AppConfig) {}

  onModuleInit() {
    console.log(`[ConfigService] loaded config for "${this.config.appName}"`);
  }

  get<K extends keyof AppConfig>(key: K): AppConfig[K] {
    return this.config[key];
  }
}

/**
 * Global dynamic module — its exports are available everywhere
 * without explicit imports.
 */
@Global()
@Module({})
class ConfigModule {
  static forRoot(config: AppConfig): DynamicModule {
    return {
      module: ConfigModule,
      global: true,
      providers: [{ provide: CONFIG_OPTIONS, useValue: config }, ConfigService],
      exports: [ConfigService],
    };
  }
}

// ── Cache Module (DynamicModule with forRoot + forFeature) ──────────────────

interface CacheConfig {
  store: string;
  ttl: number;
}

@Injectable()
class CacheManager implements OnModuleInit {
  constructor(
    @Inject(CACHE_OPTIONS) private options: CacheConfig,
    private config: ConfigService // available globally from ConfigModule
  ) {}

  onModuleInit() {
    const appName = this.config.get('appName');
    console.log(
      `[CacheManager] ${appName} — store: ${this.options.store}, ttl: ${this.options.ttl}s`
    );
  }

  get(key: string): string {
    return `cached:${key}`;
  }
}

@Module({})
class CacheModule {
  static forRoot(options: CacheConfig): DynamicModule {
    return {
      module: CacheModule,
      providers: [{ provide: CACHE_OPTIONS, useValue: options }, CacheManager],
      exports: [CacheManager],
    };
  }

  static forFeature(overrides: Partial<CacheConfig>): DynamicModule {
    const defaults: CacheConfig = { store: 'memory', ttl: 60 };
    return {
      module: CacheModule,
      providers: [
        { provide: CACHE_OPTIONS, useValue: { ...defaults, ...overrides } },
        CacheManager,
      ],
      exports: [CacheManager],
    };
  }
}

// ── Circular dependency with forwardRef ────────────────────────────────────

@Injectable()
class CatService implements OnModuleInit {
  constructor(@Inject(forwardRef(() => DogService)) private dogService: any) {}

  onModuleInit() {
    console.log('[CatService] initialized, knows about DogService:', !!this.dogService);
  }

  getCats() {
    return ['Whiskers', 'Mittens'];
  }
}

@Injectable()
class DogService implements OnModuleInit {
  constructor(private catService: CatService) {}

  onModuleInit() {
    console.log('[DogService] initialized, cats:', this.catService.getCats());
  }

  getDogs() {
    return ['Rex', 'Buddy'];
  }
}

@Module({
  providers: [CatService, DogService],
  exports: [CatService, DogService],
})
class PetModule {}

// ── Feature Module ─────────────────────────────────────────────────────────

@Injectable()
class UserService implements OnModuleInit {
  constructor(
    private config: ConfigService, // global — no import needed
    private cache: CacheManager
  ) {}

  onModuleInit() {
    const debug = this.config.get('debug');
    console.log(`[UserService] debug=${debug}, cache test: ${this.cache.get('user:1')}`);
  }

  getUser(id: string) {
    return { id, name: 'Alice', cached: this.cache.get(`user:${id}`) };
  }
}

@Module({
  imports: [CacheModule.forRoot({ store: 'redis', ttl: 300 }), PetModule],
  providers: [UserService, { provide: FEATURE_FLAG, useValue: true }],
  exports: [UserService],
})
class UserModule {}

// ── Root Module ────────────────────────────────────────────────────────────

@Module({
  imports: [ConfigModule.forRoot({ appName: 'MyApp', debug: true }), UserModule],
})
class AppModule {}

// ── Bootstrap ──────────────────────────────────────────────────────────────

async function main() {
  console.log('=== Dynamic Modules Example ===\n');

  const app = await Application.create(AppModule);

  // Global provider — accessible without explicit import
  const config = app.get(ConfigService);
  console.log(`\nApp: ${config.get('appName')}, debug: ${config.get('debug')}`);

  // Provider from imported module
  const user = app.get(UserService).getUser('42');
  console.log('User:', user);

  // Circular dependency resolved via forwardRef
  const cats = app.get(CatService).getCats();
  const dogs = app.get(DogService).getDogs();
  console.log('Pets:', { cats, dogs });

  // select() — resolve from a specific module
  const featureFlag = app.select(UserModule, FEATURE_FLAG);
  console.log('Feature flag:', featureFlag);

  await app.close();
  console.log('\nDone.');
}

main().catch(console.error);
