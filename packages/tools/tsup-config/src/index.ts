/**
 * @stackra/tsup-config
 *
 * Shared tsup build configuration presets for TypeScript libraries.
 * Includes presets for base, NestJS, React, and CLI tools.
 *
 * @packageDocumentation
 */

// Configuration presets
export { preset as basePreset } from './presets/base';
export { preset as cliLibPreset } from './presets/cli-lib';
export { preset as nestLibPreset } from './presets/nest-lib';
export { preset as nestAppPreset } from './presets/nest-app';
export { preset as reactLibPreset } from './presets/react-lib';

// Utilities
export { buildBanner } from './utils/build-banner';
export { loadPackageJson } from './utils/load-package-json';
export { computeExternals } from './utils/compute-externals';

export * from './utils';
export * from './interfaces';
