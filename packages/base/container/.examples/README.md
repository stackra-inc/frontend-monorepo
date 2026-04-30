<div align="center">
  <img src="../.github/assets/banner.svg" alt="@stackra/ts-container" width="100%" />
</div>

<div align="center">

[![npm version](https://img.shields.io/npm/v/@stackra/ts-container?style=flat-square&color=3178c6)](https://www.npmjs.com/package/@stackra/ts-container)
[![License: MIT](https://img.shields.io/badge/license-MIT-22c55e?style=flat-square)](../LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

</div>

---

# Examples

Runnable examples demonstrating `@stackra/ts-container` features.

| Example                                  | Description                                                                           |
| ---------------------------------------- | ------------------------------------------------------------------------------------- |
| [basic-di](./basic-di)                   | Core DI: decorators, all provider types, lifecycle hooks, scopes                      |
| [dynamic-modules](./dynamic-modules)     | Dynamic modules, `@Global`, `forwardRef`, module composition                          |
| [react-integration](./react-integration) | React bindings: `ContainerProvider`, `useInject`, `useOptionalInject`, `useContainer` |

---

## Running Examples

All examples use `tsx` for zero-config TypeScript execution:

```bash
# Install dependencies from the repo root
pnpm install

# Run any example directly
npx tsx .examples/basic-di/main.ts
npx tsx .examples/dynamic-modules/main.ts
```

> The React integration example is a conceptual app — see its
> [README](./react-integration/README.md) for setup instructions.

---

## License

MIT © [Stackra](https://github.com/stackra-inc)
