/**
 * Vite Adapter Entry Point
 *
 * Separate entry point for the tsup Vite plugin, consumed as:
 * `import { tsupPlugin } from '@stackra/tsup-config/vite'`
 *
 * Re-exports the Vite adapter so consumers don't need to reach
 * into internal paths.
 *
 * @module vite
 */

export { tsupPlugin } from './adapters/vite.adapter';
