# React Integration

Demonstrates React bindings: `ContainerProvider`, `useInject`,
`useOptionalInject`, and `useContainer` hooks for accessing DI services inside
React components.

## What's covered

- Bootstrapping the DI container and passing it to React via
  `<ContainerProvider>`
- `useInject()` to resolve services in components
- `useOptionalInject()` for optional/missing providers
- `useContainer()` for direct container access (`has()`, `get()`)
- Composing multiple services in a component tree

## Run

This example is a conceptual React app. To run it, integrate the files into a
React project (Vite, Next.js, CRA, etc.) with these dependencies:

```bash
pnpm add react react-dom @stackra/ts-container
```

Then use `main.tsx` as your entry point.
