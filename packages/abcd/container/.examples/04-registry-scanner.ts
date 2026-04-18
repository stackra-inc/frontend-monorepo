/**
 * Example: Using RegistryScanner with Decorator Discovery Plugin
 *
 * This example shows how to use the compile-time RegistryScanner instead of
 * the runtime DependenciesScanner for zero-overhead module scanning.
 *
 * ## Benefits:
 * - Zero runtime overhead (no reflect-metadata)
 * - Faster bootstrap (~50-200ms faster for large apps)
 * - Smaller bundle size (no reflection polyfill ~50KB)
 * - Static validation at build time
 *
 * ## Requirements:
 * 1. @stackra/vite-decorator-discovery plugin enabled in vite.config.ts
 * 2. Type reference added to vite-env.d.ts
 * 3. Use RegistryScanner instead of DependenciesScanner
 */

import { Application } from '@stackra/ts-container';
import { Module, Injectable } from '@stackra/ts-container';
import { ModuleContainer, RegistryScanner, InstanceLoader } from '@stackra/ts-container';

// ============================================================================
// Example Modules and Providers
// ============================================================================

@Injectable()
class ConfigService {
  getConfig() {
    return { apiUrl: 'https://api.example.com' };
  }
}

@Injectable()
class UserService {
  constructor(private config: ConfigService) {}

  getUsers() {
    console.log('Fetching users from:', this.config.getConfig().apiUrl);
    return ['Alice', 'Bob', 'Charlie'];
  }
}

@Module({
  providers: [ConfigService],
  exports: [ConfigService],
})
class ConfigModule {}

@Module({
  imports: [ConfigModule],
  providers: [UserService],
  exports: [UserService],
})
class UserModule {}

@Module({
  imports: [UserModule],
})
class AppModule {}

// ============================================================================
// Option 1: Using Application.create() (Recommended)
// ============================================================================

async function bootstrapWithApplication() {
  console.log('=== Bootstrap with Application.create() ===\n');

  // Application.create() automatically uses RegistryScanner if virtual modules are available
  const app = await Application.create(AppModule);

  // Get a provider instance
  const userService = app.get(UserService);
  const users = userService.getUsers();

  console.log('Users:', users);
}

// ============================================================================
// Option 2: Manual Bootstrap with RegistryScanner
// ============================================================================

async function bootstrapManually() {
  console.log('\n=== Manual Bootstrap with RegistryScanner ===\n');

  // Step 1: Create container
  const container = new ModuleContainer();

  // Step 2: Use RegistryScanner instead of DependenciesScanner
  const scanner = new RegistryScanner(container);

  try {
    // Step 3: Scan the module tree (uses virtual registries)
    await scanner.scan(AppModule);
    console.log('✓ Module tree scanned from registry');

    // Step 4: Create instances
    const loader = new InstanceLoader(container);
    await loader.createInstances();
    console.log('✓ Provider instances created');

    // Step 5: Get the root module
    const appModuleRef = container.getModules().get('AppModule');
    if (!appModuleRef) {
      throw new Error('AppModule not found');
    }

    // Step 6: Get a provider instance
    const userServiceWrapper = appModuleRef.providers.get('UserService');
    if (!userServiceWrapper) {
      throw new Error('UserService not found');
    }

    const userService = userServiceWrapper.instance as UserService;
    const users = userService.getUsers();

    console.log('Users:', users);
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.includes('Virtual decorator registries not found')
    ) {
      console.error('\n❌ Error: Decorator discovery plugin not enabled');
      console.error('\nTo fix this:');
      console.error('1. Add @stackra/vite-decorator-discovery to vite.config.ts');
      console.error('2. Add type reference to vite-env.d.ts');
      console.error('3. Restart the dev server\n');
    } else {
      throw error;
    }
  }
}

// ============================================================================
// Option 3: Fallback Pattern (Runtime → Compile-time)
// ============================================================================

async function bootstrapWithFallback() {
  console.log('\n=== Bootstrap with Fallback ===\n');

  const container = new ModuleContainer();

  try {
    // Try RegistryScanner first (compile-time)
    console.log('Attempting to use RegistryScanner...');
    const scanner = new RegistryScanner(container);
    await scanner.scan(AppModule);
    console.log('✓ Using compile-time registry (zero overhead)');
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.includes('Virtual decorator registries not found')
    ) {
      // Fallback to DependenciesScanner (runtime reflection)
      console.warn('⚠ Virtual registries not found, falling back to runtime reflection');
      const { DependenciesScanner } = await import('@stackra/ts-container');
      const scanner = new DependenciesScanner(container);
      await scanner.scan(AppModule);
      console.log('✓ Using runtime reflection (reflect-metadata)');
    } else {
      throw error;
    }
  }

  // Create instances
  const loader = new InstanceLoader(container);
  await loader.createInstances();

  // Get provider
  const appModuleRef = container.getModules().get('AppModule');
  const userServiceWrapper = appModuleRef?.providers.get('UserService');
  const userService = userServiceWrapper?.instance as UserService;
  const users = userService.getUsers();

  console.log('Users:', users);
}

// ============================================================================
// Performance Comparison
// ============================================================================

async function comparePerformance() {
  console.log('\n=== Performance Comparison ===\n');

  // Measure RegistryScanner
  const registryStart = performance.now();
  try {
    const container1 = new ModuleContainer();
    const scanner1 = new RegistryScanner(container1);
    await scanner1.scan(AppModule);
    const loader1 = new InstanceLoader(container1);
    await loader1.createInstances();
    const registryEnd = performance.now();
    console.log(`RegistryScanner: ${(registryEnd - registryStart).toFixed(2)}ms`);
  } catch (error) {
    console.log('RegistryScanner: Not available (plugin not enabled)');
  }

  // Measure DependenciesScanner
  const reflectionStart = performance.now();
  const { DependenciesScanner } = await import('@stackra/ts-container');
  const container2 = new ModuleContainer();
  const scanner2 = new DependenciesScanner(container2);
  await scanner2.scan(AppModule);
  const loader2 = new InstanceLoader(container2);
  await loader2.createInstances();
  const reflectionEnd = performance.now();
  console.log(`DependenciesScanner: ${(reflectionEnd - reflectionStart).toFixed(2)}ms`);

  console.log('\nNote: Performance difference is more noticeable in larger applications');
}

// ============================================================================
// Run Examples
// ============================================================================

async function main() {
  await bootstrapWithApplication();
  await bootstrapManually();
  await bootstrapWithFallback();
  await comparePerformance();
}

main().catch(console.error);
