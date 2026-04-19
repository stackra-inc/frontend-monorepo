/**
 * Decorator Discovery Vite Plugin
 *
 * Build-time decorator scanning and virtual module generation for TypeScript decorators.
 * Inspired by NestJS's DiscoveryService but implemented as a Vite plugin.
 *
 * ## Usage
 *
 * 1. Add the plugin to your vite.config.ts
 * 2. Add type reference to your vite-env.d.ts or env.d.ts:
 *    ```typescript
 *    /// <reference types="@stackra-inc/vite-decorator-discovery/virtual-modules" />
 *    ```
 * 3. Import virtual modules in your code:
 *    ```typescript
 *    import { MODULE_REGISTRY } from 'virtual:decorator-registry/modules';
 *    ```
 *
 * @module @stackra-inc/vite-decorator-discovery
 */

export {
  decoratorDiscoveryPlugin,
  DecoratorScanner,
  RegistryCodeGenerator,
  type DecoratorMetadata,
  type DecoratorRegistry,
  type DecoratorDiscoveryOptions,
} from './plugin';
