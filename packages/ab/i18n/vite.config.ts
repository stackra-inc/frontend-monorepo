import { defineConfig } from "vite";
import typescript from "vite/dist/node/constants.mjs";

/**
 * Vite configuration for @stackra/react-i18n package development
 * Used for local development and testing
 */
export default defineConfig({
  build: {
    lib: {
      entry: "src/index.ts",
      name: "@stackra/react-i18n",
      fileName: (format) => `index.${format === "es" ? "mjs" : "js"}`,
    },
    rollupOptions: {
      external: ["vite", "i18next", "react-i18next", "fast-glob"],
      output: {
        globals: {
          vite: "vite",
          i18next: "i18next",
          "react-i18next": "reactI18next",
          "fast-glob": "fastGlob",
        },
      },
    },
  },
});
