/**
 * Advanced Features Example
 *
 * Demonstrates all the advanced features added to the container:
 * 1. Module distance tracking (lifecycle hook ordering)
 * 2. ModuleRef.create() (dynamic instantiation)
 * 3. Entry providers (eager initialization)
 * 4. Application config (global settings)
 * 5. Additional lifecycle hooks (onApplicationBootstrap, beforeApplicationShutdown, onApplicationShutdown)
 *
 * @module examples/advanced-features
 */

import {
  Injectable,
  Module,
  Application,
  type OnModuleInit,
  type OnModuleDestroy,
  type OnApplicationBootstrap,
  type OnApplicationShutdown,
  type BeforeApplicationShutdown,
  Inject,
} from '@stackra/ts-container';

// ============================================================================
// 1. Module Distance Tracking & Lifecycle Hook Ordering
// ============================================================================

/**
 * Root module (distance = 0)
 * Lifecycle hooks run first
 */
@Injectable()
class RootService implements OnModuleInit {
  onModuleInit() {
    console.log('[1] RootService.onModuleInit() — distance 0');
  }
}

/**
 * Child module (distance = 1)
 * Lifecycle hooks run after root
 */
@Injectable()
class ChildService implements OnModuleInit {
  onModuleInit() {
    console.log('[2] ChildService.onModuleInit() — distance 1');
  }
}

/**
 * Grandchild module (distance = 2)
 * Lifecycle hooks run last
 */
@Injectable()
class GrandchildService implements OnModuleInit {
  onModuleInit() {
    console.log('[3] GrandchildService.onModuleInit() — distance 2');
  }
}

@Module({
  providers: [GrandchildService],
  exports: [GrandchildService],
})
class GrandchildModule {}

@Module({
  imports: [GrandchildModule],
  providers: [ChildService],
  exports: [ChildService],
})
class ChildModule {}

@Module({
  imports: [ChildModule],
  providers: [RootService],
})
class RootModule {}

// ============================================================================
// 2. ModuleRef.create() — Dynamic Instantiation
// ============================================================================

/**
 * Service that can be dynamically instantiated with custom arguments
 */
@Injectable()
class DynamicService {
  constructor(
    public readonly id: string,
    public readonly config: any
  ) {}

  greet() {
    return `Hello from DynamicService ${this.id}`;
  }
}

/**
 * Factory service that creates dynamic instances
 */
@Injectable()
class ServiceFactory {
  private counter = 0;

  createService(config: any, moduleRef: any): DynamicService {
    // Use ModuleRef.create() to instantiate with custom args
    return moduleRef.create(DynamicService, [`service-${++this.counter}`, config]);
  }
}

@Module({
  providers: [ServiceFactory, DynamicService],
  exports: [ServiceFactory],
})
class FactoryModule {}

// ============================================================================
// 3. Entry Providers — Eager Initialization
// ============================================================================

/**
 * Analytics service that needs to run on startup
 * Even if not injected anywhere, it will be instantiated
 */
@Injectable()
class AnalyticsService implements OnModuleInit {
  onModuleInit() {
    console.log('[Analytics] Tracking initialized');
    // Start tracking page views, errors, etc.
  }
}

/**
 * Event bus that needs to start listening immediately
 */
@Injectable()
class EventBusService implements OnModuleInit {
  onModuleInit() {
    console.log('[EventBus] Listeners registered');
    // Register global event listeners
  }
}

@Module({
  providers: [AnalyticsService, EventBusService],
  // These will be instantiated immediately on bootstrap
  entryProviders: [AnalyticsService, EventBusService],
})
class MonitoringModule {}

// ============================================================================
// 4. Application Config — Global Settings
// ============================================================================

/**
 * Service that uses global application config
 */
@Injectable()
class ApiService {
  constructor(@Inject('APP_CONFIG') private config: any) {}

  getApiUrl(): string {
    return this.config.apiUrl;
  }

  isFeatureEnabled(feature: string): boolean {
    return this.config.featureFlags?.[feature] ?? false;
  }
}

@Module({
  providers: [ApiService],
  exports: [ApiService],
})
class ApiModule {}

// ============================================================================
// 5. Additional Lifecycle Hooks
// ============================================================================

/**
 * Service demonstrating all lifecycle hooks
 */
@Injectable()
class LifecycleService
  implements
    OnModuleInit,
    OnApplicationBootstrap,
    BeforeApplicationShutdown,
    OnApplicationShutdown,
    OnModuleDestroy
{
  onModuleInit() {
    console.log('[Lifecycle] 1. onModuleInit() — module initialized');
  }

  onApplicationBootstrap() {
    console.log('[Lifecycle] 2. onApplicationBootstrap() — app fully bootstrapped');
  }

  beforeApplicationShutdown(signal?: string) {
    console.log(`[Lifecycle] 3. beforeApplicationShutdown(${signal}) — preparing for shutdown`);
  }

  onApplicationShutdown(signal?: string) {
    console.log(`[Lifecycle] 4. onApplicationShutdown(${signal}) — shutting down`);
  }

  onModuleDestroy() {
    console.log('[Lifecycle] 5. onModuleDestroy() — final cleanup');
  }
}

@Module({
  providers: [LifecycleService],
})
class LifecycleModule {}

// ============================================================================
// Main Application Module
// ============================================================================

@Module({
  imports: [RootModule, FactoryModule, MonitoringModule, ApiModule, LifecycleModule],
})
class AppModule {}

// ============================================================================
// Example Usage
// ============================================================================

async function demonstrateAdvancedFeatures() {
  console.log('=== Advanced Features Demo ===\n');

  // Create application with config
  const app = await Application.create(AppModule, {
    debug: true,
    config: {
      apiUrl: 'https://api.example.com',
      featureFlags: {
        newUI: true,
        betaFeatures: false,
      },
      environment: 'production',
    },
    onReady: () => {
      console.log('\n[App] Bootstrap complete!\n');
    },
  });

  // 1. Module distance tracking — lifecycle hooks run in breadth-first order
  console.log('\n--- Module Distance Tracking ---');
  console.log('Lifecycle hooks already ran during bootstrap (see output above)');

  // 2. ModuleRef.create() — dynamic instantiation
  console.log('\n--- ModuleRef.create() ---');
  const factoryModuleRef = app.getModuleRef(FactoryModule);
  const factory = app.get(ServiceFactory);

  const service1 = factory.createService({ timeout: 5000 }, factoryModuleRef);
  const service2 = factory.createService({ timeout: 10000 }, factoryModuleRef);

  console.log(service1.greet()); // "Hello from DynamicService service-1"
  console.log(service2.greet()); // "Hello from DynamicService service-2"

  // 3. Entry providers — already instantiated
  console.log('\n--- Entry Providers ---');
  console.log('AnalyticsService and EventBusService were instantiated on bootstrap');
  console.log('(see onModuleInit output above)');

  // 4. Application config — global settings
  console.log('\n--- Application Config ---');
  const apiService = app.get(ApiService);
  console.log('API URL:', apiService.getApiUrl());
  console.log('New UI enabled:', apiService.isFeatureEnabled('newUI'));
  console.log('Beta features enabled:', apiService.isFeatureEnabled('betaFeatures'));

  // 5. Additional lifecycle hooks
  console.log('\n--- Lifecycle Hooks ---');
  console.log('All lifecycle hooks already ran (see output above)');

  // Graceful shutdown
  console.log('\n--- Graceful Shutdown ---');
  await app.close('SIGTERM');

  console.log('\n=== Demo Complete ===');
}

// Run the demo
demonstrateAdvancedFeatures().catch(console.error);

/**
 * Expected output:
 *
 * === Advanced Features Demo ===
 *
 * [Analytics] Tracking initialized
 * [EventBus] Listeners registered
 * [1] RootService.onModuleInit() — distance 0
 * [2] ChildService.onModuleInit() — distance 1
 * [3] GrandchildService.onModuleInit() — distance 2
 * [Lifecycle] 1. onModuleInit() — module initialized
 * [Lifecycle] 2. onApplicationBootstrap() — app fully bootstrapped
 *
 * [App] Bootstrap complete!
 *
 * --- Module Distance Tracking ---
 * Lifecycle hooks already ran during bootstrap (see output above)
 *
 * --- ModuleRef.create() ---
 * Hello from DynamicService service-1
 * Hello from DynamicService service-2
 *
 * --- Entry Providers ---
 * AnalyticsService and EventBusService were instantiated on bootstrap
 * (see onModuleInit output above)
 *
 * --- Application Config ---
 * API URL: https://api.example.com
 * New UI enabled: true
 * Beta features enabled: false
 *
 * --- Lifecycle Hooks ---
 * All lifecycle hooks already ran (see output above)
 *
 * --- Graceful Shutdown ---
 * [Lifecycle] 3. beforeApplicationShutdown(SIGTERM) — preparing for shutdown
 * [Lifecycle] 4. onApplicationShutdown(SIGTERM) — shutting down
 * [Lifecycle] 5. onModuleDestroy() — final cleanup
 *
 * === Demo Complete ===
 */
