# Basic Dependency Injection

Demonstrates core DI features: `@Injectable`, `@Inject`, `@Optional`, `@Module`,
all provider types (class, value, factory, existing), and lifecycle hooks.

## What's covered

- Marking classes with `@Injectable()`
- Constructor injection (auto-resolved and explicit `@Inject()`)
- Optional dependencies with `@Optional()`
- Module definition with `@Module()`
- All four provider types: class, value, factory, existing (alias)
- Lifecycle hooks: `OnModuleInit` and `OnModuleDestroy`
- Application bootstrap and provider resolution

## Run

```bash
npx tsx .examples/basic-di/main.ts
```
