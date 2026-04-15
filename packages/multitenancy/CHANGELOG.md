# @abdokouta/multitenancy

## 1.0.0

### Major Features

- **Multi-tenancy Core**: Complete multi-tenancy support with tenant context
  management
- **Dynamic Domain Resolution**: Automatic tenant detection from subdomains and
  custom domains
- **Tenant Switching**: Seamless tenant switching with navigation support
- **React Hooks**: Comprehensive hooks for tenant management (`useTenant`,
  `useTenantSwitch`, `useTenantContext`)
- **HeroUI v3 Components**: Pre-built UI components for tenant selection and
  management
  - `TenantSelect`: Dropdown component for tenant selection
  - `TenantCard`: Card component for displaying tenant information
  - `TenantBadge`: Badge component for showing current tenant
  - `TenantSwitcher`: Modal-based tenant switcher with search
- **Dependency Injection**: NestJS-style DI using `@abdokouta/container`
- **Type Safety**: Full TypeScript support with comprehensive type definitions
- **Flexible Configuration**: Support for subdomain and custom domain strategies

### Components

All components are built with HeroUI v3 and support:

- Loading states
- Error handling
- Custom rendering
- Accessibility features
- Responsive design

### Hooks

- `useTenant()`: Access current tenant and tenant list
- `useTenantSwitch()`: Switch between tenants with callbacks
- `useTenantContext()`: Low-level context access

### Configuration

Supports multiple tenant resolution strategies:

- Subdomain-based (e.g., `tenant1.app.com`)
- Custom domain-based (e.g., `tenant1.com`)
- Mixed strategies

### Dependencies

- `@abdokouta/core`: ^5.0.0
- `@abdokouta/container`: workspace:\*
- `@abdokouta/react-cache`: ^1.0.0
- `@heroui/react`: ^3.0.0 (optional peer dependency)
