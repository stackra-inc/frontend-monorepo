import type { Options } from 'tsup';

import { preset as basePreset } from './base';

/**
 * React Library Preset Configuration
 *
 * Tsup options configured for React component libraries with JSX support.
 * Extends base preset with React-specific externals and JSX configuration.
 *
 * @type {Options}
 * @constant
 */
export const preset: Options = {
  // Inherit base configuration
  ...basePreset,

  // Mark React as external (consumer provides it)
  // Prevents bundling React multiple times in consumer apps
  external: [
    ...(Array.isArray(basePreset.external) ? basePreset.external : []),
    'react', // Core React library
    'react-dom', // React DOM renderer
    'react/jsx-runtime', // New JSX transform runtime
  ],

  // Configure esbuild for modern JSX
  esbuildOptions(options) {
    // Use automatic JSX transform (React 17+)
    // No need for "import React" in component files
    options.jsx = 'automatic';
  },
};
