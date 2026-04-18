<p align="center">
  <img src=".github/assets/banner.svg" alt="@stackra/react-sdui" width="100%" />
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@stackra/react-sdui">
    <img src="https://img.shields.io/npm/v/@stackra/react-sdui?style=flat-square&color=38bdf8&label=npm" alt="npm version" />
  </a>
  <a href="./LICENSE">
    <img src="https://img.shields.io/badge/license-MIT-818cf8?style=flat-square" alt="MIT license" />
  </a>
  <a href="https://www.typescriptlang.org/">
    <img src="https://img.shields.io/badge/TypeScript-5.x-3178c6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript" />
  </a>
</p>

---

# @stackra/react-sdui

Server-Driven UI package for `@stackra/react-refine` — fetches page definitions
from a backend Pages API and auto-registers routes and services.

## Installation

```bash
pnpm add @stackra/react-sdui
```

## Features

- 🌐 Fetch page definitions from a backend Pages API
- 🗺️ Auto-register routes from server config
- 💉 Auto-register DI services per page
- 🔄 Dynamic component resolution
- 🏗️ `SduiModule.forRoot()` pattern
- ⚡ Works with `@stackra/react-refine` and `@stackra/react-router`

## Quick Start

```typescript
import { Module } from '@stackra/ts-container';
import { SduiModule } from '@stackra/react-sdui';

@Module({
  imports: [
    SduiModule.forRoot({
      pagesApiUrl: '/api/pages',
      componentRegistry: {
        DashboardPage: () => import('./pages/Dashboard'),
        UsersPage: () => import('./pages/Users'),
      },
    }),
  ],
})
export class AppModule {}
```

The backend returns page definitions:

```json
[
  {
    "path": "/dashboard",
    "component": "DashboardPage",
    "services": ["StatsService", "ChartService"],
    "meta": { "title": "Dashboard" }
  }
]
```

## License

MIT © [Stackra](https://github.com/stackra-co)
