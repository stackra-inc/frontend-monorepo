/**
 * @stackra/eslint-config
 *
 * Shared ESLint configuration presets for TypeScript monorepos.
 * Includes base, NestJS, Next.js, React, and Vite configurations.
 *
 * @packageDocumentation
 */
export { config as baseConfig } from './presets/base';
export { config as viteConfig } from './presets/vite';
export { config as reactConfig } from './presets/react';
export { config as nextJsConfig } from './presets/next';
export { config as nestjsConfig } from './presets/nest';
