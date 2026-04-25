<p align="center">
  <img src=".github/assets/banner.svg" alt="@stackra/ts-http" width="100%" />
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@stackra/ts-http">
    <img src="https://img.shields.io/npm/v/@stackra/ts-http?style=flat-square&color=38bdf8&label=npm" alt="npm version" />
  </a>
  <a href="./LICENSE">
    <img src="https://img.shields.io/badge/license-MIT-818cf8?style=flat-square" alt="MIT license" />
  </a>
  <a href="https://www.typescriptlang.org/">
    <img src="https://img.shields.io/badge/TypeScript-5.x-3178c6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript" />
  </a>
</p>

---

# @stackra/ts-http

Middleware-driven HTTP client for TypeScript — axios underneath, decorator-based
middleware registration, and DI integration via `@stackra/ts-container`.

## Installation

```bash
pnpm add @stackra/ts-http
```

## Features

- 🔗 Axios-based HTTP client
- 🎭 `@Middleware()` decorator for declarative middleware registration
- 💉 DI integration — inject `HttpService` anywhere
- 🔄 Request/response interceptor pipeline
- 🏗️ `HttpModule.forRoot()` / `forFeature()` pattern
- 🔧 Per-service middleware overrides

## Quick Start

```typescript
import { Module } from '@stackra/ts-container';
import { HttpModule } from '@stackra/ts-http';

@Module({
  imports: [
    HttpModule.forRoot({
      baseURL: 'https://api.example.com',
      middleware: [AuthMiddleware, LoggingMiddleware],
    }),
  ],
})
export class AppModule {}
```

```typescript
import { Middleware, Injectable } from '@stackra/ts-container';
import { HttpService } from '@stackra/ts-http';

@Middleware(AuthMiddleware)
@Injectable()
class UserService {
  constructor(private http: HttpService) {}

  async getUsers() {
    return this.http.get('/users');
  }
}
```

## License

MIT © [Stackra](https://github.com/stackra-inc)
