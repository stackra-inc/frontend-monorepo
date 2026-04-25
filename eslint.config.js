/**
 * eslint.config.js — react-native-monorepo
 *
 * Root ESLint flat config for ESLint 10+. Provides baseline JS and TS
 * linting for the entire monorepo. Individual workspaces can extend or
 * override by adding their own eslint.config.js.
 *
 * @see https://eslint.org/docs/latest/use/configure/configuration-files
 * @module eslint.config
 */

import js from "@eslint/js";
import tseslint from "typescript-eslint";
import globals from "globals";

/** @type {import("eslint").Linter.Config[]} */
export default [
  // ── Ignores (must be first) ───────────────────────────────────────────
  {
    ignores: [
      "**/node_modules/",
      "**/dist/",
      "**/build/",
      "**/.next/",
      "**/.turbo/",
      "**/coverage/",
      "**/ios/",
      "**/android/",
      "**/Pods/",
      "**/.expo/",
      "**/.docs/",
      "pnpm-lock.yaml",
    ],
  },

  // ── Base JS rules ─────────────────────────────────────────────────────
  js.configs.recommended,

  // ── TypeScript rules ──────────────────────────────────────────────────
  ...tseslint.configs.recommended,

  // ── Global settings ───────────────────────────────────────────────────
  {
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.node,
        ...globals.es2025,
      },
    },
    rules: {
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-require-imports": "off",
      "no-console": "warn",
    },
  },
];
