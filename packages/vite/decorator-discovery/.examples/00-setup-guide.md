# Setup Guide: Decorator Discovery Plugin

This guide shows how to set up the decorator discovery plugin in your Vite
project.

## Step 1: Install the Package

```bash
pnpm add -D @stackra/vite-decorator-discovery
```

## Step 2: Add Plugin to Vite Config

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { decoratorDiscoveryPlugin } from '@stackra/vite-decorator-discovery';

export default defineConfig({
  plugins: [
    decoratorDiscoveryPlugin({
      debug: true, // Enable debug logging
      customDecorators: ['MyCustomDecorator'], // Optional: track custom decorators
    }),
    react(),
  ],
});
```

## Step 3: Add Type Declarations

You need to tell TypeScript about the virtual modules. There are two ways to do
this:

### Option A: Using Triple-Slash Reference (Recommended)

Create or update your `vite-env.d.ts` or `env.d.ts` file:

```typescript
// vite-env.d.ts or env.d.ts
/// <reference types="vite/client" />
/// <reference types="@stackra/vite-decorator-discovery/virtual-modules" />
```

### Option B: Using tsconfig.json

Add to your `tsconfig.json`:

```json
{
  "compilerOptions": {
    "types": [
      "vite/client",
      "@stackra/vite-decorator-discovery/virtual-modules"
    ]
  }
}
```

## Step 4: Import Virtual Modules

Now you can import the virtual modules in your code:

```typescript
// Import specific registries
import {
  MODULE_REGISTRY,
  getAllModules,
} from 'virtual:decorator-registry/modules';
import {
  PROVIDER_REGISTRY,
  getAllProviders,
} from 'virtual:decorator-registry/providers';
import {
  SUBSCRIBER_REGISTRY,
  getAllSubscribers,
} from 'virtual:decorator-registry/subscribers';

// Or import the combined registry
import {
  DECORATOR_REGISTRY,
  getAllDecorators,
} from 'virtual:decorator-registry/all';

// Use the registries
console.log('All modules:', getAllModules());
console.log('All providers:', getAllProviders());
console.log('All subscribers:', getAllSubscribers());
```

## Step 5: Update Container to Use Registry (Optional)

If you're using `@stackra/ts-container`, update the scanner to use the compiled
registry:

```typescript
// packages/abcd/container/src/injector/scanner.ts
import { MODULE_REGISTRY } from 'virtual:decorator-registry/modules';

export class DependenciesScanner {
  public async scan(rootModule: Type<any>): Promise<void> {
    // Try compiled registry first
    const moduleMetadata = MODULE_REGISTRY.find(
      (m) => m.className === rootModule.name
    );

    if (!moduleMetadata) {
      throw new Error(
        `Module ${rootModule.name} not found in registry. ` +
          `Make sure the decorator discovery plugin is enabled.`
      );
    }

    // Use pre-compiled metadata
    await this.scanFromRegistry(moduleMetadata);
  }
}
```

## Step 6: Run Your App

```bash
pnpm dev
```

You should see in the console:

```
🔍 [DecoratorDiscovery] Scanning decorators...
[DecoratorDiscovery] Scanning 127 files...
[DecoratorDiscovery] Found:
  - 15 @Module decorators
  - 42 @Injectable decorators
  - 23 @Subscribe decorators
✓ [DecoratorDiscovery] Registry generated
```

## Troubleshooting

### TypeScript Can't Find Virtual Modules

**Problem:** TypeScript shows error:
`Cannot find module 'virtual:decorator-registry/modules'`

**Solution:** Make sure you added the type reference in step 3. If using option
A, ensure the file is included in your `tsconfig.json`:

```json
{
  "include": ["src", "vite-env.d.ts"]
}
```

### Plugin Not Scanning Files

**Problem:** Registry is empty or missing decorators

**Solution:** Check the `include` patterns in plugin options:

```typescript
decoratorDiscoveryPlugin({
  include: [
    'packages/*/src/**/*.ts',
    'packages/*/src/**/*.tsx',
    'apps/*/src/**/*.ts',
    'apps/*/src/**/*.tsx',
  ],
  exclude: ['**/*.spec.ts', '**/*.test.ts', '**/node_modules/**'],
});
```

### HMR Not Working

**Problem:** Changes to decorators don't trigger updates

**Solution:** The plugin watches for changes to `.ts` and `.tsx` files that
contain `@` symbols. Make sure your files match the include patterns and contain
decorators.

### Build Errors

**Problem:** Build fails with TypeScript errors

**Solution:** Run type checking separately:

```bash
pnpm typecheck
```

If there are errors in the generated virtual modules, enable debug mode to see
what's being generated:

```typescript
decoratorDiscoveryPlugin({ debug: true });
```

## Next Steps

- See [01-basic-usage.ts](./01-basic-usage.ts) for examples of querying the
  registries
- See [02-discovery-service.ts](./02-discovery-service.ts) for a NestJS-style
  DiscoveryService implementation
- Read the [README.md](../README.md) for full API documentation
