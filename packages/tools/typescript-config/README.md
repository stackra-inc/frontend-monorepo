# @stackra/typescript-config

Shared TypeScript configuration presets for all Stackra packages.

## Install

```bash
pnpm add -D @stackra/typescript-config
```

## Presets

| Preset               | Import                                        | Use Case                                              |
| -------------------- | --------------------------------------------- | ----------------------------------------------------- |
| **base**             | `@stackra/typescript-config/base`             | Foundation — all options, extended by other presets   |
| **bundler**          | `@stackra/typescript-config/bundler`          | Config packages built with tsup (sets outDir/rootDir) |
| **react-lib**        | `@stackra/typescript-config/react-lib`        | React component libraries                             |
| **nest-lib**         | `@stackra/typescript-config/nest-lib`         | NestJS libraries (NodeNext resolution)                |
| **nest-app**         | `@stackra/typescript-config/nest-app`         | NestJS applications                                   |
| **next**             | `@stackra/typescript-config/next`             | Next.js applications                                  |
| **react-native-lib** | `@stackra/typescript-config/react-native-lib` | React Native libraries                                |
| **react-native-app** | `@stackra/typescript-config/react-native-app` | React Native apps (extends expo)                      |

## Usage

### Library package (container, http, redis, support)

```jsonc
// tsconfig.json
{
  "extends": "@stackra/typescript-config/base",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": ".",
    "paths": { "@/*": ["./src/*"] },
  },
  "include": ["src/**/*", "__tests__/**/*"],
  "exclude": ["node_modules", "dist"],
}
```

### Config package (eslint-config, prettier-config, tsup-config)

```jsonc
// tsconfig.json
{
  "extends": "@stackra/typescript-config/bundler",
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"],
}
```

## Base Preset Reference

Every option in `base.json` explained:

### Output Target

| Option   | Value    | Why                                                                                 |
| -------- | -------- | ----------------------------------------------------------------------------------- |
| `target` | `ES2022` | Top-level await, private fields, Array.at() — all @stackra packages target Node 22+ |

### Module System

| Option             | Value     | Why                                                           |
| ------------------ | --------- | ------------------------------------------------------------- |
| `module`           | `ESNext`  | ESM-first output, optimized for tsup/vite/esbuild             |
| `moduleResolution` | `bundler` | Understands package.json `exports`, no file extensions needed |
| `moduleDetection`  | `force`   | Every file is a module — prevents global scope pollution      |

### Runtime Libraries

| Option  | Value                       | Why                                                                                  |
| ------- | --------------------------- | ------------------------------------------------------------------------------------ |
| `lib`   | `ES2022, DOM, DOM.Iterable` | ES2022 APIs + DOM for React hooks and jsdom tests                                    |
| `types` | `["node"]`                  | Node.js globals (process, Buffer, etc.) — without this: "Cannot find name 'process'" |

### Strict Type Checking

| Option                       | Value  | Why                                                      |
| ---------------------------- | ------ | -------------------------------------------------------- |
| `strict`                     | `true` | All strict checks: strictNullChecks, noImplicitAny, etc. |
| `noUncheckedIndexedAccess`   | `true` | Array/object access returns `T \| undefined`             |
| `noUnusedLocals`             | `true` | Flag unused variables (prefix with `_` to ignore)        |
| `noUnusedParameters`         | `true` | Flag unused params (prefix with `_` to ignore)           |
| `noImplicitReturns`          | `true` | Catch missing return statements                          |
| `noFallthroughCasesInSwitch` | `true` | Catch fall-through in switch                             |

### Declaration Output

| Option           | Value  | Why                                              |
| ---------------- | ------ | ------------------------------------------------ |
| `declaration`    | `true` | Generate .d.ts for consumers                     |
| `declarationMap` | `true` | .d.ts.map for IDE "Go to Definition" into source |
| `sourceMap`      | `true` | .js.map for debugging                            |

### Interop

| Option                             | Value  | Why                                                         |
| ---------------------------------- | ------ | ----------------------------------------------------------- |
| `esModuleInterop`                  | `true` | Default imports from CJS modules                            |
| `allowSyntheticDefaultImports`     | `true` | `import x from 'cjs-module'` works                          |
| `isolatedModules`                  | `true` | Each file compiled independently (required by tsup/esbuild) |
| `resolveJsonModule`                | `true` | `import pkg from './package.json'` works                    |
| `skipLibCheck`                     | `true` | Skip type-checking node_modules — massive speed boost       |
| `forceConsistentCasingInFileNames` | `true` | Catches path casing bugs on macOS/Windows                   |

### Decorators

| Option                   | Value  | Why                                     |
| ------------------------ | ------ | --------------------------------------- |
| `experimentalDecorators` | `true` | @Injectable, @Inject, NestJS decorators |
| `emitDecoratorMetadata`  | `true` | Runtime reflection for DI container     |

### JSX

| Option | Value       | Why                                                            |
| ------ | ----------- | -------------------------------------------------------------- |
| `jsx`  | `react-jsx` | Automatic JSX transform (React 17+) — no `import React` needed |

### Deprecation Handling

| Option               | Value | Why                                                                                  |
| -------------------- | ----- | ------------------------------------------------------------------------------------ |
| `ignoreDeprecations` | `6.0` | Silences `baseUrl`/`paths` deprecation warning in TS 6+ (still needed for @ aliases) |

## License

MIT © [Stackra L.L.C](https://github.com/stackra-inc)
