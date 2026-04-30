# @stackra/eslint-config

Shared ESLint configuration presets for Stackra packages.

## Installation

```bash
pnpm add -D @stackra/eslint-config eslint typescript
```

## Usage

Create an `eslint.config.ts` (or `eslint.config.mjs`) in your project root:

### Base (TypeScript)

```typescript
import { baseConfig } from '@stackra/eslint-config';

export default baseConfig;
```

### Vite

```typescript
import { viteConfig } from '@stackra/eslint-config';

export default viteConfig;
```

### React

```typescript
import { reactConfig } from '@stackra/eslint-config';

export default reactConfig;
```

### Next.js

```typescript
import { nextJsConfig } from '@stackra/eslint-config';

export default nextJsConfig;
```

### NestJS

```typescript
import { nestjsConfig } from '@stackra/eslint-config';

export default nestjsConfig;
```

## Available Presets

| Export         | Description                                   |
| -------------- | --------------------------------------------- |
| `baseConfig`   | TypeScript base rules with strict type checks |
| `viteConfig`   | Vite project configuration                    |
| `reactConfig`  | React with hooks and JSX rules                |
| `nextJsConfig` | Next.js with `@next/eslint-plugin-next`       |
| `nestjsConfig` | NestJS with decorator and DI rules            |

## Peer Dependencies

- `eslint` >= 9.0.0
- `typescript` >= 5.0.0

## License

MIT
