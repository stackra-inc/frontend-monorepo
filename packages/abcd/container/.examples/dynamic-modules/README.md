# Dynamic Modules, Global Scope & Forward References

Demonstrates advanced module patterns: `DynamicModule` with
`forRoot()`/`forFeature()`, `@Global()` modules, `forwardRef()` for circular
dependencies, and module composition.

## What's covered

- Dynamic modules with `forRoot()` and `forFeature()` patterns
- `@Global()` decorator for globally available providers
- `forwardRef()` to resolve circular module imports
- Multi-module composition with imports and exports
- `select()` to resolve providers from a specific module

## Run

```bash
npx tsx .examples/dynamic-modules/main.ts
```
