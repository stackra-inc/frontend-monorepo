<p align="center">
  <img src=".github/assets/banner.svg" alt="@stackra/vite-decorator-discovery" width="100%" />
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@stackra/vite-decorator-discovery">
    <img src="https://img.shields.io/npm/v/@stackra/vite-decorator-discovery?style=flat-square&color=38bdf8&label=npm" alt="npm version" />
  </a>
  <a href="./LICENSE">
    <img src="https://img.shields.io/badge/license-MIT-818cf8?style=flat-square" alt="MIT license" />
  </a>
  <a href="https://www.typescriptlang.org/">
    <img src="https://img.shields.io/badge/TypeScript-5.x-3178c6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript" />
  </a>
</p>

---

# @stackra/vite-decorator-discovery

> Build-time decorator discovery and virtual module generation for TypeScript
> decorators. Inspired by NestJS's DiscoveryService.

## Features

- ✅ **Zero runtime overhead** — All scanning happens at build time
- ✅ **Virtual modules** — Access registries via `virtual:decorator-registry/*`
- ✅ **HMR support** — Automatic regeneration on decorator changes
- ✅ **TypeScript AST** — Uses TypeScript Compiler API for accurate parsing
- ✅ **Monorepo-friendly** — Scans all packages in one pass
- ✅ **Extensible** — Support for custom decorators

## Installation

```bash
pnpm add -D @stackra/vite-decorator-discovery
```

## Usage

### 1. Add to Vite config

```typescript
// vite.config.ts
import { defineConfig } from "vite";
import { decoratorDiscoveryPlugin } from "@stackra/vite-decorator-discovery";

export default defineConfig({
  plugins: [
    decoratorDiscoveryPlugin({
      debug: true,
      customDecorators: ["MyCustomDecorator"],
    }),
  ],
});
```

### 2. Add type declarations

Add this to your `vite-env.d.ts` or `env.d.ts`:

```typescript
/// <reference types="vite/client" />
/// <reference types="@stackra/vite-decorator-discovery/virtual-modules" />
```

Or add to your `tsconfig.json`:

```json
{
  "compilerOptions": {
    "types": ["@stackra/vite-decorator-discovery/virtual-modules"]
  }
}
```

### 3. Import virtual modules

```typescript
// Import specific registries
import {
  MODULE_REGISTRY,
  getAllModules,
} from "virtual:decorator-registry/modules";
import {
  PROVIDER_REGISTRY,
  getAllProviders,
} from "virtual:decorator-registry/providers";
import {
  SUBSCRIBER_REGISTRY,
  getAllSubscribers,
} from "virtual:decorator-registry/subscribers";

// Or import the combined registry
import {
  DECORATOR_REGISTRY,
  getAllDecorators,
} from "virtual:decorator-registry/all";

// Use the registries
console.log("All modules:", getAllModules());
console.log("All providers:", getAllProviders());
console.log("All subscribers:", getAllSubscribers());
```

### 4. Update container to use registry

```typescript
// packages/abcd/container/src/injector/scanner.ts
import { MODULE_REGISTRY } from "virtual:decorator-registry/modules";

export class DependenciesScanner {
  public async scan(rootModule: Type<any>): Promise<void> {
    // Read from compiled registry instead of reflect-metadata
    const moduleMetadata = MODULE_REGISTRY.find(
      (m) => m.className === rootModule.name,
    );

    if (!moduleMetadata) {
      throw new Error(
        `Module ${rootModule.name} not found in registry. ` +
          `Make sure the decorator discovery plugin is enabled.`,
      );
    }

    // Use pre-compiled metadata
    await this.scanFromRegistry(moduleMetadata);
  }
}
```

## Virtual Modules

The plugin exposes four virtual modules:

### `virtual:decorator-registry/modules`

All `@Module` decorators discovered in your codebase.

```typescript
export interface ModuleMetadata {
  name: string;
  className: string;
  filePath: string;
  args: any[];
}

export const MODULE_REGISTRY: ModuleMetadata[];
export function getModuleByClassName(
  className: string,
): ModuleMetadata | undefined;
export function getAllModules(): ModuleMetadata[];
```

### `virtual:decorator-registry/providers`

All `@Injectable` decorators discovered in your codebase.

```typescript
export interface ProviderMetadata {
  name: string;
  className: string;
  filePath: string;
  args: any[];
}

export const PROVIDER_REGISTRY: ProviderMetadata[];
export function getProviderByClassName(
  className: string,
): ProviderMetadata | undefined;
export function getAllProviders(): ProviderMetadata[];
```

### `virtual:decorator-registry/subscribers`

All `@Subscribe` and `@AsSubscriber` decorators discovered in your codebase.

```typescript
export interface SubscriberMetadata {
  name: string;
  className: string;
  filePath: string;
  args: any[];
  methodName?: string;
}

export const SUBSCRIBER_REGISTRY: SubscriberMetadata[];
export function getSubscribersByClassName(
  className: string,
): SubscriberMetadata[];
export function getSubscribersByTopic(topic: string): SubscriberMetadata[];
export function getAllSubscribers(): SubscriberMetadata[];
```

### `virtual:decorator-registry/all`

Combined registry with all decorators.

```typescript
export interface DecoratorRegistry {
  modules: DecoratorMetadata[];
  providers: DecoratorMetadata[];
  subscribers: DecoratorMetadata[];
  custom: Map<string, DecoratorMetadata[]>;
}

export const DECORATOR_REGISTRY: DecoratorRegistry;
export function getDecoratorsByName(name: string): DecoratorMetadata[];
export function getAllDecorators(): DecoratorMetadata[];
```

## Configuration

```typescript
export interface DecoratorDiscoveryOptions {
  /** Root directory to scan (default: process.cwd()) */
  root?: string;

  /** Glob patterns to include (default: ['packages/*/src/**\/*.ts', 'apps/*/src/**\/*.ts']) */
  include?: string[];

  /** Glob patterns to exclude (default: ['**\/*.spec.ts', '**\/*.test.ts', '**\/node_modules/**']) */
  exclude?: string[];

  /** Enable debug logging */
  debug?: boolean;

  /** Custom decorator names to discover (in addition to built-ins) */
  customDecorators?: string[];
}
```

## Built-in Decorators

The plugin automatically discovers these decorators:

- `@Module` — NestJS-style module declarations
- `@Injectable` — Dependency injection providers
- `@Subscribe` — Event subscribers (method-level)
- `@AsSubscriber` — Event subscriber classes (class-level)
- `@Global` — Global module marker
- `@Inject` — Explicit dependency injection
- `@Optional` — Optional dependency injection

## Custom Decorators

You can discover custom decorators by adding them to the `customDecorators`
option:

```typescript
decoratorDiscoveryPlugin({
  customDecorators: ["MyDecorator", "AnotherDecorator"],
});
```

Custom decorators will be added to the `custom` map in the registry:

```typescript
import { DECORATOR_REGISTRY } from "virtual:decorator-registry/all";

const myDecorators = DECORATOR_REGISTRY.custom.get("MyDecorator");
```

## How It Works

1. **Build Start**: Plugin scans all TypeScript files matching the include
   patterns
2. **AST Parsing**: Uses TypeScript Compiler API to parse decorators
3. **Registry Generation**: Creates virtual modules with decorator metadata
4. **Virtual Modules**: Vite resolves `virtual:decorator-registry/*` imports
5. **HMR**: Watches for decorator changes and regenerates on the fly

## Comparison with Runtime Discovery

| Feature               | Runtime (reflect-metadata) | Build-time (this plugin) |
| --------------------- | -------------------------- | ------------------------ |
| Runtime overhead      | ❌ High (~50-200ms)        | ✅ Zero                  |
| Bundle size           | ❌ +50KB                   | ✅ Minimal               |
| HMR support           | ✅ Seamless                | ✅ Seamless              |
| Static validation     | ❌ No                      | ✅ Yes                   |
| Tree-shaking          | ❌ No                      | ✅ Yes                   |
| Production cold start | ❌ Slow                    | ✅ Fast                  |

## Inspired By

- [NestJS DiscoveryService](https://docs.nestjs.com/fundamentals/discovery-service)
- [@golevelup/nestjs-discovery](https://github.com/golevelup/nestjs/tree/master/packages/discovery)

## License

MIT © Stackra
