/**
 * @fileoverview Mono CLI configuration for the frontend monorepo.
 *
 * Registers custom commands available as `mono frontend-monorepo:<command>`.
 * These extend the built-in CLI commands with repo-specific operations.
 *
 * @see https://github.com/stackra-inc/mono-cli
 */



export default ({
  name: "frontend",
  description: "Frontend monorepo — React/Vite apps and shared TS packages",
  commands: [
    {
      name: "graph:html",
      description: "Generate interactive HTML dependency graph",
      emoji: "🕸️",
      action: "node scripts/cli/generate-graph-html.js",
    },
    {
      name: "graph:mermaid",
      description: "Generate Mermaid dependency diagram",
      emoji: "📊",
      action: "node scripts/cli/generate-mermaid-graph.js",
    },
    {
      name: "fix-deps",
      description: "Scan source imports and add missing production deps",
      emoji: "🔧",
      action: "node scripts/cli/fix-missing-deps.js",
    },
    {
      name: "changeset",
      description: "Create a new changeset for versioning",
      emoji: "📝",
      action: "pnpm changeset",
    },
    {
      name: "changeset:version",
      description: "Apply changeset versions",
      emoji: "🏷️",
      action: "pnpm changeset version",
    },
    {
      name: "release",
      description: "Build packages and publish via changesets",
      emoji: "🚀",
      action: "pnpm turbo run build --filter='./packages/**' && pnpm changeset publish",
    },
    {
      name: "validate",
      description: "Run lint, typecheck, and build",
      emoji: "✅",
      action: "pnpm lint && pnpm check-types && pnpm build",
    },
    {
      name: "audit",
      description: "Run npm security audit",
      emoji: "🔒",
      action: "npm audit",
    },
  ],
});
