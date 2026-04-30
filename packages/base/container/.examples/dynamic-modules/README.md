<div align="center">
  <img src="../../.github/assets/banner.svg" alt="@stackra/ts-container" width="100%" />
</div>

<div align="center">

[![npm version](https://img.shields.io/npm/v/@stackra/ts-container?style=flat-square&color=3178c6)](https://www.npmjs.com/package/@stackra/ts-container)
[![License: MIT](https://img.shields.io/badge/license-MIT-22c55e?style=flat-square)](../../LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

</div>

---

# Dynamic Modules, Global Scope & Forward References

Demonstrates advanced module patterns: `DynamicModule` with
`forRoot()`/`forFeature()`, `@Global()` modules, `forwardRef()` for circular
dependencies, and module composition.

## What's Covered

- Dynamic modules with `forRoot()` and `forFeature()` patterns
- `@Global()` decorator for globally available providers
- `forwardRef()` to resolve circular module imports
- Multi-module composition with imports and exports
- `select()` to resolve providers from a specific module

## Run

```bash
npx tsx .examples/dynamic-modules/main.ts
```

---

## Related Examples

- [Basic DI](../basic-di) — decorators, provider types, lifecycle hooks
- [React Integration](../react-integration) — `ContainerProvider`, `useInject`

---

## License

MIT © [Stackra](https://github.com/stackra-inc)
