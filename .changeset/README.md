# Changesets

This directory contains changeset files for version management and changelog
generation.

## What are changesets?

Changesets are a way to manage versions and changelogs with a focus on
monorepos. They help you:

- Version packages based on changes
- Generate changelogs automatically
- Publish packages to npm

## Creating a changeset

When you make changes to packages, create a changeset:

```bash
pnpm changeset
```

This will prompt you to:

1. Select which packages have changed
2. Choose the type of change (major, minor, patch)
3. Write a summary of the changes

## Versioning packages

To update package versions based on changesets:

```bash
pnpm changeset:version
```

This will:

- Update package.json versions
- Update dependencies
- Generate CHANGELOG.md files
- Delete consumed changeset files

## Publishing packages

To publish packages to npm:

```bash
pnpm changeset:publish
```

Or use the combined release command:

```bash
pnpm release
```

This will build packages and publish them to npm.

## CI/CD Integration

For automated releases in CI:

```bash
# Version packages
pnpm ci:version

# Publish packages
pnpm ci:publish
```

## Learn More

- [Changesets Documentation](https://github.com/changesets/changesets)
- [Changesets with pnpm](https://pnpm.io/using-changesets)
