# @stackra/vite-config

Unified Vite configuration with sensible defaults and integrated plugin
management for the Stackra ecosystem.

## Install

```bash
pnpm add -D @stackra/vite-config vite
```

## Quick Start

```typescript
// vite.config.ts
import { defineConfig } from '@stackra/vite-config';

export default defineConfig();
```

## Plugins

Toggle built-in plugins via the `plugins` map. Pass `true` for defaults or an
options object for customization.

```typescript
export default defineConfig({
  plugins: {
    env: true,
    typeGen: true,
    decoratorDiscovery: true,
    ngrok: { domain: 'my-app.ngrok.io' },
    qrcode: { small: true },
    react: react({ tsDecorators: true }),
    tsconfigPaths: tsconfigPaths(),
    tailwindcss: tailwindcss(),
  },
});
```

| Plugin               | Description                                                 |
| -------------------- | ----------------------------------------------------------- |
| `env`                | Bridges import.meta.env into @stackra/ts-support Env class  |
| `typeGen`            | Generates EnvKey union type from .env files for autocomplete |
| `decoratorDiscovery` | Build-time decorator scanning and virtual module generation  |
| `ngrok`              | Ngrok tunnel for sharing the dev server                      |
| `qrcode`             | QR code display in terminal for network URLs                 |

## Overrides

`StackraOptions` extends Vite's `UserConfig`, so any standard Vite option can be
passed alongside Stackra-specific ones:

```typescript
export default defineConfig({
  plugins: { qrcode: true },
  server: { port: 4000 },
  build: { sourcemap: true },
});
```

## Exports

```typescript
// Core
import { defineConfig, createDefaults } from '@stackra/vite-config';

// Plugin factories (standalone usage)
import { decoratorDiscovery, ngrok, qrcode, env, typeGen } from '@stackra/vite-config';
```

## License

[MIT](./LICENSE) © Stackra L.L.C
