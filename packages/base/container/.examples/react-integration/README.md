<div align="center">
  <img src="../../.github/assets/banner.svg" alt="@stackra/ts-container" width="100%" />
</div>

<div align="center">

[![npm version](https://img.shields.io/npm/v/@stackra/ts-container?style=flat-square&color=3178c6)](https://www.npmjs.com/package/@stackra/ts-container)
[![License: MIT](https://img.shields.io/badge/license-MIT-22c55e?style=flat-square)](../../LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18%2B%20%7C%2019%2B-61dafb?style=flat-square&logo=react&logoColor=white)](https://react.dev/)

</div>

---

# React Integration

Demonstrates React bindings: `ContainerProvider`, `useInject`,
`useOptionalInject`, and `useContainer` hooks for accessing DI services inside
React components.

## What's Covered

- Bootstrapping the DI container and passing it to React via
  `<ContainerProvider>`
- `useInject()` to resolve services in components
- `useOptionalInject()` for optional/missing providers
- `useContainer()` for direct container access (`has()`, `get()`)
- Composing multiple services in a component tree

## Setup

This example is a conceptual React app. To run it, integrate the files into a
React project (Vite, Next.js, CRA, etc.) with these dependencies:

```bash
pnpm add react react-dom @stackra/ts-container reflect-metadata
```

Then use `main.tsx` as your entry point.

## Files

| File             | Description                                                |
| ---------------- | ---------------------------------------------------------- |
| `main.tsx`       | App entry — bootstraps DI and mounts React                 |
| `services.ts`    | DI services and module definition                          |
| `components.tsx` | React components using `useInject` and `useOptionalInject` |

---

## Related Examples

- [Basic DI](../basic-di) — decorators, provider types, lifecycle hooks
- [Dynamic Modules](../dynamic-modules) — `forRoot()`, `@Global`, `forwardRef`

---

## License

MIT © [Stackra](https://github.com/stackra-inc)
