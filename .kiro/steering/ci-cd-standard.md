---
inclusion: always
---

# CI/CD Standard

Every package in the monorepo follows the same CI/CD structure. The source of
truth is `packages/support/.github/`.

## Structure

```
{package}/
└── .github/
    ├── actions/setup/action.yml    ← Composite action (pnpm + Node + install)
    ├── assets/
    │   ├── banner.svg              ← Package banner (editable)
    │   └── banner.png              ← Auto-generated from SVG
    └── workflows/
        ├── ci.yml                  ← CI pipeline
        └── publish.yml             ← Publish pipeline
```

## CI Pipeline (`ci.yml`)

Triggered on push to `main`/`develop` and PRs. Jobs run in parallel:

| Job           | Purpose                            |
| ------------- | ---------------------------------- |
| 🔷 Type Check | `pnpm typecheck`                   |
| 🔨 Build      | `pnpm build` (Node 20 + 22 matrix) |
| 🧪 Test       | `pnpm test` (waits for build)      |
| 🎨 Format     | `pnpm format:check`                |
| 🔍 Lint       | `pnpm lint`                        |

Features:

- Concurrency groups (cancels stale runs)
- Artifact upload for dist/
- `FORCE_JAVASCRIPT_ACTIONS_TO_NODE24: true` env var

## Publish Pipeline (`publish.yml`)

Triggered by semver tags (`v1.2.3`) or manual dispatch:

```
validate ──► quality ──► publish ──► release ──► notify
```

| Job             | Purpose                                 |
| --------------- | --------------------------------------- |
| ✅ Validate     | Tag matches package.json version        |
| 🔬 Quality Gate | typecheck + build + test                |
| 🚀 Publish      | npm publish with provenance             |
| 🎉 Release      | GitHub Release from CHANGELOG.md        |
| 💬 Notify       | Slack Block Kit notification (optional) |

Features:

- Dry-run support via manual dispatch
- npm provenance for supply-chain transparency
- Slack success/failure notifications with Block Kit
- Pre-release detection (tags with hyphens)

## Setup Action (`action.yml`)

Shared composite action used by all jobs:

- pnpm 10.33.0 setup
- Node.js setup with pnpm cache
- `pnpm install --no-frozen-lockfile`

## Action Versions

| Action                         | Version |
| ------------------------------ | ------- |
| `actions/checkout`             | v5      |
| `actions/setup-node`           | v5      |
| `actions/upload-artifact`      | v6      |
| `actions/download-artifact`    | v6      |
| `pnpm/action-setup`            | v5      |
| `softprops/action-gh-release`  | v2      |
| `slackapi/slack-github-action` | v2      |

## Required Secrets

| Secret                      | Required | Purpose                |
| --------------------------- | -------- | ---------------------- |
| `STACKRA_NPM_TOKEN`         | Yes      | npm automation token   |
| `STACKRA_SLACK_WEBHOOK_URL` | No       | Slack incoming webhook |

## Standardization Script

To re-apply the standard to all packages:

```bash
node scripts/standardize-ci-kiro.mjs
node scripts/standardize-ci-kiro.mjs --dry-run  # preview
```

The script reads templates from `packages/support/.github/` and replaces the
package name, slug, and GitHub repo URL for each package.

## Releasing a Package

```bash
# 1. Bump version in package.json
# 2. Update CHANGELOG.md
# 3. Commit
git commit -m "chore(package): bump to v1.2.3"

# 4. Tag and push
git tag v1.2.3
git push origin main --tags
```

The publish workflow triggers automatically on the tag push.
