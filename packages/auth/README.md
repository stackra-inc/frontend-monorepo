<p align="center">
  <img src=".github/assets/banner.svg" alt="@stackra-inc/react-auth" width="100%" />
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@stackra-inc/react-auth">
    <img src="https://img.shields.io/npm/v/@stackra-inc/react-auth?style=flat-square&color=38bdf8&label=npm" alt="npm version" />
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

# @stackra-inc/react-auth

Authentication, session management, and security for React applications. Built
on top of `@stackra-inc/ts-container` for seamless DI integration.

## Installation

```bash
pnpm add @stackra-inc/react-auth
```

## Features

- 🔐 Auth guards and protected routes
- 🎫 JWT token management
- 🔄 Session handling with auto-refresh
- 🪝 `useAuth()` hook for component-level access
- 💉 DI integration via `@stackra-inc/ts-container`
- 🔌 Pluggable auth providers

## Quick Start

```typescript
import { Module } from '@stackra-inc/ts-container';
import { AuthModule } from '@stackra-inc/react-auth';

@Module({
  imports: [
    AuthModule.forRoot({
      provider: 'jwt',
      tokenKey: 'auth_token',
    }),
  ],
})
export class AppModule {}
```

```tsx
import { useAuth } from '@stackra-inc/react-auth';

function Profile() {
  const { user, isAuthenticated, signIn, signOut } = useAuth();

  if (!isAuthenticated) return <LoginForm onSubmit={signIn} />;
  return <div>Welcome, {user.name}</div>;
}
```

## License

MIT © [Stackra](https://github.com/stackra-inc)
