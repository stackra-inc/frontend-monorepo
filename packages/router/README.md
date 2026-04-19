<p align="center">
  <img src=".github/assets/banner.svg" alt="@stackra/react-router" width="100%" />
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@stackra/react-router">
    <img src="https://img.shields.io/npm/v/@stackra/react-router?style=flat-square&color=38bdf8&label=npm" alt="npm version" />
  </a>
  <a href="./LICENSE">
    <img src="https://img.shields.io/badge/license-MIT-818cf8?style=flat-square" alt="MIT license" />
  </a>
  <a href="https://www.typescriptlang.org/">
    <img src="https://img.shields.io/badge/TypeScript-5.x-3178c6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript" />
  </a>
</p>

---

# @stackra/react-router

Route auto-registration package with `@Route` decorator and `RouteRegistry` for
`@stackra/react-refine`. Eliminates manual route configuration by discovering
routes at build time.

## Installation

```bash
pnpm add @stackra/react-router
```

## Features

- 🎭 `@Route()` decorator for declarative route definition
- 📋 `RouteRegistry` — injectable registry of all registered routes
- �� Auto-registration with `@stackra/react-refine`
- 💉 DI integration via `@stackra/ts-container`
- 🏗️ `RouterModule.forRoot()` pattern
- 🔒 Route-level auth guards

## Quick Start

```typescript
import { Route, Injectable } from '@stackra/react-router';

@Route({ path: '/users', name: 'users' })
@Injectable()
class UsersPage {
  component = UsersList;
  meta = { title: 'Users' };
}

@Route({ path: '/users/:id', name: 'user-detail', parent: 'users' })
@Injectable()
class UserDetailPage {
  component = UserDetail;
}
```

```typescript
import { Module } from '@stackra/ts-container';
import { RouterModule } from '@stackra/react-router';

@Module({
  imports: [RouterModule.forRoot()],
  providers: [UsersPage, UserDetailPage],
})
export class AppModule {}
```

## License

MIT © [Stackra](https://github.com/stackra-inc)
