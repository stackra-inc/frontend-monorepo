---
title: Coding Standards
inclusion: auto
---

# Coding Standards

## Docblock Format

All files, classes, functions, and exported symbols MUST have docblocks in the
Laravel `|---|` style:

```typescript
/**
 * Service Name
 *
 * |--------------------------------------------------------------------------
 * | Brief description of what this does.
 * |--------------------------------------------------------------------------
 * |
 * | Detailed explanation of behavior, patterns, and usage.
 * |
 * @module @stackra/package-name
 */
```

Section headers within files use the same pattern:

```typescript
/*
|--------------------------------------------------------------------------
| Section Name
|--------------------------------------------------------------------------
|
| Description of this section.
|
*/
```

## Naming Conventions

- Files: lowercase kebab-case with suffix (`.service.ts`, `.interface.ts`,
  `.hook.ts`)
- Classes: PascalCase (`PrinterService`, `CacheManager`)
- Interfaces: PascalCase, no `I` prefix (`DesktopBridge`, not `IDesktopBridge`)
- Types: PascalCase (`PowerState`, `DeviceType`)
- Constants: UPPER_SNAKE_CASE (`DESKTOP_CONFIG`, `CACHE_MANAGER`)
- DI Tokens: UPPER_SNAKE_CASE Symbols (`Symbol.for("PRINTER_SERVICE")`)
- Functions/variables: camelCase (`getAppVersion`, `isDesktop`)
- Enums: PascalCase name, UPPER_SNAKE_CASE values

## @Injectable Rules

- Use `@Injectable()` on any class that needs DI injection
- Use `@Inject(TOKEN)` for constructor parameter injection
- Use `@Optional()` for optional dependencies
- Never use singletons — use the IoC container
- Services are registered in the module's `forRoot()` providers array

## Comment Requirements

- Every file MUST have a top-level docblock with `@module` tag
- Every exported class/function MUST have a JSDoc comment
- Every method in a service MUST have a `|---|` section header
- Complex logic MUST have inline comments explaining the "why"
- No TODO comments in production code — use Jira tickets instead
