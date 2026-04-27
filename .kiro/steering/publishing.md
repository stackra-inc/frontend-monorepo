---
inclusion: manual
---

# Publishing & CI/CD

Standard process for publishing `@stackra/*` npm packages from GitHub.

## Repository Setup

Every `@stackra/*` package lives in its own repo under `stackra-inc/`:

```
github.com/stackra-inc/<package-name>
```

### Required Files

```
.github/
├── actions/setup/action.yml   — Composite: pnpm + Node.js + install
├── assets/
│   ├── banner.svg             — Package banner (source)
│   └── banner.png             — Generated from SVG (for Slack)
└── workflows/
    ├── ci.yml                 — Runs on push to main/develop + PRs
    └── publish.yml            — Runs on semver tag push (v1.2.3)
```

### Setup Action (`.github/actions/setup/action.yml`)

Shared composite action used by all CI/Publish jobs:

- pnpm 10.33.x via `pnpm/action-setup@v5`
- Node.js (default 22) via `actions/setup-node@v5` with pnpm cache
- `pnpm install --no-frozen-lockfile`

## CI Workflow

Triggers: push to `main`/`develop`, PRs targeting those branches.

Jobs (run in parallel where possible):

| Job           | Command             | Notes                     |
| ------------- | ------------------- | ------------------------- |
| 🔷 Type Check | `pnpm typecheck`    | `tsc --noEmit`            |
| 🔨 Build      | `pnpm build`        | Matrix: Node 20 + 22      |
| 🧪 Test       | `pnpm test`         | Waits for build           |
| 🎨 Format     | `pnpm format:check` | Prettier                  |
| 🔍 Lint       | `pnpm lint`         | ESLint `--max-warnings 0` |

For JSON-only packages (e.g. `typescript-config`), skip typecheck/test/lint —
only build + format.

## Publish Workflow

Triggers: pushing a semver tag (`v1.2.3` or `v1.2.3-beta.0`).

### Flow

```
validate → quality → publish → release → notify
```

1. **Validate** — confirms tag matches `package.json` version
2. **Quality Gate** — typecheck + build + test (uploads dist artifact)
3. **Publish** — `pnpm publish --access public --no-git-checks --provenance`
4. **GitHub Release** — extracts notes from `CHANGELOG.md`
5. **Slack Notification** — optional, requires `STACKRA_SLACK_WEBHOOK_URL`
   secret

### Required Secrets

| Secret                      | Purpose                                    |
| --------------------------- | ------------------------------------------ |
| `STACKRA_NPM_TOKEN`         | npm automation token (read+write packages) |
| `STACKRA_SLACK_WEBHOOK_URL` | Slack webhook (optional)                   |

### npm Environment

The publish job uses a GitHub Environment named `npm` for deployment protection.

## Release Process

### Step-by-step

```bash
# 1. Ensure all checks pass locally
pnpm typecheck && pnpm build && pnpm test && pnpm lint && pnpm format:check

# 2. Bump version in package.json
# Update version field manually or via pnpm version

# 3. Update CHANGELOG.md
# Add a new ## X.Y.Z section with changes

# 4. Commit
git add -A
git commit -m "release: vX.Y.Z"

# 5. Push
git push origin main

# 6. Wait for CI to pass, then tag
git tag vX.Y.Z
git push origin vX.Y.Z

# 7. Verify
gh run list --repo stackra-inc/<package> --limit 5
gh run view <run-id> --repo stackra-inc/<package>
```

### Version Conventions

- `0.x.y` — pre-stable, breaking changes allowed in minor
- `1.0.0+` — stable, follow semver strictly
- Tags with hyphens (`v1.0.0-beta.1`) are marked as pre-release

## CHANGELOG Format

```markdown
## X.Y.Z

### Added

- New features

### Changed

- Changes to existing features

### Fixed

- Bug fixes
```

The publish workflow extracts the section matching the version for GitHub
Release notes.

## Known Constraints

### ESLint Version

`@stackra/eslint-config@1.0.5` bundles `@typescript-eslint@8.48.1` built against
ESLint 9. **All packages using `@stackra/eslint-config` must pin ESLint to 9.x**
(`"eslint": "9.28.0"`).

ESLint 10 causes:
`TypeError: Class extends value undefined is not a constructor or null`

This will be resolved when `@stackra/eslint-config` is published with updated
`@typescript-eslint`.

### Banner PNG

The Slack notification references `banner.png`. Generate it from the SVG:

```bash
npx -y sharp-cli --input .github/assets/banner.svg --output .github/assets/banner.png
```

A Kiro hook (`svg-to-png.kiro.hook`) automates this on SVG file save.

## Shared Config Packages

| Package                      | Repo                            | Purpose                                    |
| ---------------------------- | ------------------------------- | ------------------------------------------ |
| `@stackra/typescript-config` | `stackra-inc/typescript-config` | tsconfig presets                           |
| `@stackra/tsup-config`       | —                               | tsup build presets (migrating to @stackra) |
| `@stackra/eslint-config`     | —                               | ESLint flat config (migrating to @stackra) |
| `@stackra/prettier-config`   | —                               | Prettier config (migrating to @stackra)    |
