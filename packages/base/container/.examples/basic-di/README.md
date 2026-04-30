<div align="center">
  <img src="../../.github/assets/banner.svg" alt="@stackra/ts-container" width="100%" />
</div>

<div align="center">

[![npm version](https://img.shields.io/npm/v/@stackra/ts-container?style=flat-square&color=3178c6)](https://www.npmjs.com/package/@stackra/ts-container)
[![License: MIT](https://img.shields.io/badge/license-MIT-22c55e?style=flat-square)](../../LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

</div>

---

# Basic Dependency Injection

Demonstrates core DI features: `@Injectable`, `@Inject`, `@Optional`, `@Module`,
all provider types (class, value, factory, existing), and lifecycle hooks.

## What's Covered

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

---

## Related Examples

- [Dynamic Modules](../dynamic-modules) — `forRoot()`, `@Global`, `forwardRef`
- [React Integration](../react-integration) — `ContainerProvider`, `useInject`

---

## License

MIT © [Stackra](https://github.com/stackra-inc)
