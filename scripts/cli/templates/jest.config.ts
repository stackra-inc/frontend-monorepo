/**
 * Jest Configuration — {{PACKAGE_NAME}}
 *
 * Testing configuration using the `jest-expo` preset for React Native
 * component and service testing. Provides:
 * - Babel transforms for TypeScript and JSX (via jest-expo)
 * - React Native module mocking (Animated, NativeModules, etc.)
 * - Platform-specific file resolution (.ios.ts, .android.ts, .native.ts)
 * - Path alias support (@/ → ./src/)
 *
 * ## Test File Conventions
 *
 * Tests can be placed in two locations:
 * - `__tests__/` directory (any nesting level)
 * - Colocated with source files as `*.test.ts` or `*.test.tsx`
 *
 * ## Running Tests
 *
 * ```bash
 * pnpm test              # single run
 * pnpm test:watch        # watch mode
 * pnpm test:coverage     # with coverage report
 * ```
 *
 * @see https://docs.expo.dev/develop/unit-testing/
 * @see https://callstack.github.io/react-native-testing-library/
 *
 * @module {{PACKAGE_NAME}}
 * @category Configuration
 */

import type { Config } from 'jest';

const config: Config = {
  /**
   * Use jest-expo preset for React Native compatibility.
   * Handles Babel transforms, native module mocks, and platform resolution.
   */
  preset: 'jest-expo',

  /**
   * Test file discovery patterns.
   * Matches files ending in .test.ts or .test.tsx in any directory.
   */
  testMatch: ['**/__tests__/**/*.test.{ts,tsx}', '**/*.test.{ts,tsx}'],

  /**
   * Path alias mapping — mirrors tsconfig.json paths.
   * Allows tests to import from `@/components/button` instead of
   * relative paths like `../../src/components/button`.
   */
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },

  /**
   * Transform ignore patterns for node_modules.
   *
   * By default, Jest does not transform node_modules. React Native and
   * Expo packages ship untranspiled ESM, so they must be included in
   * the transform pipeline. This regex excludes everything in
   * node_modules EXCEPT the listed packages.
   *
   * Add new packages here if you see "SyntaxError: Unexpected token"
   * errors from a dependency during test runs.
   */
  transformIgnorePatterns: [
    'node_modules/(?!(' +
      '(jest-)?react-native' +
      '|@react-native(-community)?' +
      '|expo(nent)?' +
      '|@expo(nent)?/.*' +
      '|@expo-google-fonts/.*' +
      '|react-navigation' +
      '|@react-navigation/.*' +
      '|native-base' +
      '|react-native-svg' +
      '|heroui-native' +
      '|uniwind' +
      '|tailwind-variants' +
      '|tailwind-merge' +
      '))',
  ],

  /**
   * Coverage collection sources.
   * Includes all TypeScript files in src/, excluding:
   * - Type declaration files (*.d.ts)
   * - Barrel export files (index.ts/tsx) — no logic to test
   */
  collectCoverageFrom: ['src/**/*.{ts,tsx}', '!src/**/*.d.ts', '!src/**/index.{ts,tsx}'],

  /**
   * Don't fail the test suite if no test files are found.
   * Useful during initial development before tests are written.
   */
  passWithNoTests: true,
};

export default config;
