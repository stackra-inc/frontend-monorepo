# Multi-Tenancy Configuration

This directory contains example configuration files for the
`@abdokouta/multitenancy` package.

## Quick Start

1. Copy the example configuration to your application:

```bash
cp node_modules/@abdokouta/multitenancy/config/multitenancy.config.example.ts src/config/multitenancy.config.ts
```

2. Customize the configuration for your needs:

```typescript
// src/config/multitenancy.config.ts
import { defineConfig, subdomainPreset } from '@abdokouta/multitenancy';

export const multitenancyConfig = defineConfig({
  ...subdomainPreset,
  baseDomain: 'myapp.com',
  fetchTenants: async () => {
    const response = await fetch('/api/tenants');
    return await response.json();
  },
});
```

3. Use the configuration in your module:

```typescript
// src/app.module.ts
import { Module } from '@abdokouta/container';
import { MultiTenancyModule } from '@abdokouta/multitenancy';
import { multitenancyConfig } from './config/multitenancy.config';

@Module({
  imports: [MultiTenancyModule.forRoot(multitenancyConfig)],
})
export class AppModule {}
```

## Configuration Options

See the example file for all available options and presets:

- `multitenancy.config.example.ts` - Complete example with all options

## Presets

The package includes several presets for common scenarios:

- `defaultPreset` - Simple filter-based with router resolver
- `headerPreset` - Header-based tenant identification
- `subdomainPreset` - Subdomain-based SaaS
- `domainPreset` - Custom domains with dynamic resolution

## Learn More

- [Multi-Tenancy Documentation](../README.md)
- [API Reference](../src/interfaces/multitenancy-options.interface.ts)
