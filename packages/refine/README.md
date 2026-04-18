<p align="center">
  <img src=".github/assets/banner.svg" alt="@stackra/react-refine" width="100%" />
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@stackra/react-refine">
    <img src="https://img.shields.io/npm/v/@stackra/react-refine?style=flat-square&color=38bdf8&label=npm" alt="npm version" />
  </a>
  <a href="./LICENSE">
    <img src="https://img.shields.io/badge/license-MIT-818cf8?style=flat-square" alt="MIT license" />
  </a>
  <a href="https://www.typescriptlang.org/">
    <img src="https://img.shields.io/badge/TypeScript-5.x-3178c6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript" />
  </a>
  <a href="https://react.dev/">
    <img src="https://img.shields.io/badge/React-18%2B%20%7C%2019%2B-61dafb?style=flat-square&logo=react&logoColor=white" alt="React" />
  </a>
</p>

---

# @stackra/react-refine

[Refine](https://refine.dev) Framework integration with dependency injection for
React applications. Bridges the `@stackra/ts-container` DI system with Refine's
data, auth, and routing providers.

## Installation

```bash
pnpm add @stackra/react-refine
```

## Features

- 🔌 Refine data provider via DI
- 🔐 Auth provider via DI
- 🗺️ Router integration
- 💉 Full `@stackra/ts-container` DI support
- 🏗️ `RefineModule.forRoot()` pattern
- ⚛️ React hooks for Refine context

## Quick Start

```typescript
import { Module } from '@stackra/ts-container';
import { RefineModule } from '@stackra/react-refine';

@Module({
  imports: [
    RefineModule.forRoot({
      dataProvider: myDataProvider,
      authProvider: myAuthProvider,
    }),
  ],
})
export class AppModule {}
```

## License

MIT © [Stackra](https://github.com/stackra-co)
