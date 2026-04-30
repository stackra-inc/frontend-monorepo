/**
 * Plugins Barrel Export
 *
 * Re-exports all plugin factories and their option types for
 * standalone usage outside of `defineConfig`.
 *
 * @module plugins
 */

export { decoratorDiscovery } from './decorator-discovery';
export type { DecoratorDiscoveryOptions } from './decorator-discovery';

export { ngrok } from './ngrok';
export type { INgrokPluginOptions } from './ngrok';

export { qrcode } from './qrcode';
export type { IQRCodePluginOptions } from './qrcode';

export { env } from './env';
export type { ISupportEnvPluginOptions } from './env';

export { typeGen } from './type-gen';
export type { ITypeGenPluginOptions } from './type-gen';
