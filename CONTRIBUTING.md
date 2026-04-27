# Contributing to Frontend Template

Thank you for your interest in contributing! This document provides guidelines
and instructions for contributing to this project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Testing](#testing)
- [Documentation](#documentation)

## Code of Conduct

This project adheres to a code of conduct. By participating, you are expected to
uphold this code. Please report unacceptable behavior to the project
maintainers.

## Getting Started

### Prerequisites

- Node.js 18.20.0 or higher
- pnpm 9.0.0 or higher
- Git

### Setup

1. Fork the repository
2. Clone your fork:

   ```bash
   git clone https://github.com/your-username/frontend-template.git
   cd frontend-template
   ```

3. Install dependencies:

   ```bash
   pnpm install
   ```

4. Create a branch for your changes:
   ```bash
   git checkout -b feature/your-feature-name
   ```

## Development Workflow

### Running the Project

```bash
# Run all apps in development mode
pnpm dev

# Run specific app
pnpm dev:web
pnpm dev:docs

# Build all packages and apps
pnpm build

# Run linter
pnpm lint

# Fix linting issues
pnpm lint:fix

# Check types
pnpm check-types

# Format code
pnpm format
```

### Project Structure

```
frontend-template/
├── apps/
│   ├── web/          # Main Next.js application
│   └── docs/         # Documentation site
├── packages/
│   ├── ui/           # Shared UI components (HeroUI v3)
│   ├── logger/       # Logging utilities
│   ├── tenant/       # Multi-tenancy support
│   ├── eslint-config/
│   └── typescript-config/
└── .github/          # CI/CD workflows
```

## Coding Standards

### TypeScript

- Use TypeScript for all new code
- Provide proper type annotations
- Avoid using `any` type
- Use interfaces for object shapes
- Use type aliases for unions and primitives

### React Components

- Use functional components with hooks
- Follow the component template in `.kiro/steering/heroui-guidelines.md`
- Add comprehensive JSDoc documentation
- Use semantic prop names (isDisabled, onPress, etc.)
- Implement proper error boundaries

### Styling

- Use Tailwind CSS v4 utilities
- Follow HeroUI v3 design patterns
- Use the `cn()` utility for conditional classes
- Avoid inline styles unless necessary

### File Naming

- Use kebab-case for files: `my-component.tsx`
- Use PascalCase for components: `MyComponent`
- Use camelCase for functions and variables: `myFunction`

### Import Order

1. External dependencies
2. Internal packages (@repo/\*)
3. Relative imports
4. Types
5. Styles

```tsx
// External
import { useState } from "react";
import { Button } from "@heroui/react";

// Internal packages
import { cn } from "@repo/ui";

// Relative
import { MyComponent } from "./my-component";

// Types
import type { MyType } from "./types";

// Styles
import "./styles.css";
```

## Commit Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/):

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `build`: Build system changes
- `ci`: CI/CD changes
- `chore`: Other changes (dependencies, etc.)
- `revert`: Revert a previous commit

### Examples

```bash
feat(ui): add new Button variant
fix(web): resolve navigation issue on mobile
docs: update README with new examples
chore(deps): upgrade dependencies
```

### Commit Message Rules

- Use present tense ("add feature" not "added feature")
- Use imperative mood ("move cursor to..." not "moves cursor to...")
- Limit first line to 72 characters
- Reference issues and pull requests when applicable

## Pull Request Process

### Before Submitting

1. Ensure all tests pass:

   ```bash
   pnpm test
   ```

2. Run linter and fix issues:

   ```bash
   pnpm lint:fix
   ```

3. Check types:

   ```bash
   pnpm check-types
   ```

4. Format code:

   ```bash
   pnpm format
   ```

5. Build successfully:
   ```bash
   pnpm build
   ```

### Submitting a Pull Request

1. Push your changes to your fork
2. Create a pull request from your branch to `main`
3. Fill out the pull request template completely
4. Link related issues
5. Request review from maintainers
6. Address review feedback

### Pull Request Requirements

- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] No new warnings or errors
- [ ] Tests added/updated
- [ ] All tests pass
- [ ] Commit messages follow conventions

## Testing

### Writing Tests

- Write tests for all new features
- Update tests for bug fixes
- Aim for high code coverage
- Test edge cases and error conditions

### Running Tests

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:coverage
```

## Documentation

### Code Documentation

- Add JSDoc comments to all public APIs
- Include usage examples in documentation
- Document complex algorithms and logic
- Keep documentation up to date

### README Updates

- Update README.md for new features
- Add usage examples
- Update installation instructions if needed
- Keep feature list current

## Questions?

If you have questions or need help:

1. Check existing documentation
2. Search existing issues
3. Create a new issue with the "question" label
4. Reach out to maintainers

## License

By contributing, you agree that your contributions will be licensed under the
project's MIT License.
