## Description

<!-- Provide a brief description of the changes in this PR. -->

## Type of Change

<!-- Mark the relevant option with an "x" -->

- [ ] 🐛 Bug fix (non-breaking change which fixes an issue)
- [ ] ✨ New feature (non-breaking change which adds functionality)
- [ ] 💥 Breaking change (fix or feature that would cause existing functionality
      to not work as expected)
- [ ] 📝 Documentation update
- [ ] ♻️ Code refactoring (no functional changes)
- [ ] ⚡ Performance improvement
- [ ] ✅ Test update
- [ ] 🔧 Build / tooling configuration change
- [ ] 📦 New package
- [ ] 🔒 Security update

## Affected Packages

<!-- Mark the affected workspace(s) with an "x" -->

- [ ] `apps/vite`
- [ ] `apps/desktop`
- [ ] `packages/container`
- [ ] `packages/config`
- [ ] `packages/logger`
- [ ] `packages/redis`
- [ ] `packages/cache`
- [ ] `packages/events`
- [ ] `packages/settings`
- [ ] `packages/support`
- [ ] `packages/desktop`
- [ ] `packages/kbd`
- [ ] `packages/theming`
- [ ] `packages/ui`
- [ ] `packages/pwa`
- [ ] `packages/multitenancy`
- [ ] `packages/refine`
- [ ] `packages/rxdb-eloquent`
- [ ] Root / tooling

## Related Issues

<!-- Link to related issues using #issue_number -->

Closes #

## Changes Made

<!-- List the main changes made in this PR -->

-
-
-

## Testing

- [ ] Unit tests pass (`pnpm test`)
- [ ] Type checking passes (`pnpm check-types`)
- [ ] Build succeeds (`pnpm build`)
- [ ] Manual testing completed
- [ ] No new warnings or errors

## Checklist

- [ ] Code follows the project's style guidelines (docblocks, `|---|` headers)
- [ ] All imports use `@/` path aliases (no `../` relative imports)
- [ ] New services are `@Injectable()` and registered in the module's
      `forRoot()`
- [ ] New interfaces are in `interfaces/*.interface.ts`
- [ ] New types are in `types/*.type.ts`
- [ ] DI tokens are Symbols in `constants/tokens.constant.ts`
- [ ] Config files match the unified template (`pnpm sync-configs`)
- [ ] `@stackra-inc/*` deps use `workspace:*` (`pnpm fix-deps`)
- [ ] CHANGELOG updated (if applicable)

## Breaking Changes

<!-- If this PR introduces breaking changes, describe them here. -->

## Deployment Notes

<!-- Any notes about deployment, environment variables, or configuration changes. -->
