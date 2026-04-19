/**
 * @fileoverview Vitest configuration for @stackra/react-router package.
 * @module @stackra/react-router
 * @category Configuration
 */
import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./__tests__/vitest.setup.ts'],
    include: ['__tests__/**/*.{test,spec}.{ts,tsx}'],
    passWithNoTests: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'dist/', '**/*.test.ts', '**/*.config.ts'],
    },
  },
  resolve: { alias: { '@': path.resolve(__dirname, './src') } },
});
