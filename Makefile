# =============================================================================
# Makefile — Stackra Frontend Monorepo
# =============================================================================
#
# Convenient shortcuts for common development tasks.
# Run `make help` to see all available commands.
#
# Prerequisites:
#   - Node.js >= 18
#   - pnpm >= 10
#   - Docker (for container commands)
#   - Python 3 (for sync-configs and fix-deps)
#
# =============================================================================

.PHONY: help install dev build clean test lint format check deploy

# Default target — show help when running `make` with no arguments
.DEFAULT_GOAL := help

# ── Colors for terminal output ───────────────────────────────────────────────
BLUE   := \033[0;34m
GREEN  := \033[0;32m
YELLOW := \033[0;33m
RED    := \033[0;31m
NC     := \033[0m

# =============================================================================
# Help
# =============================================================================

## help: Display this help message
help:
	@echo "$(BLUE)Stackra Frontend Monorepo — Available Commands$(NC)"
	@echo ""
	@grep -E '^## [a-zA-Z_-]+:.*$$' $(MAKEFILE_LIST) | \
		awk 'BEGIN {FS = "## |:"}; {printf "  $(GREEN)%-20s$(NC) %s\n", $$2, $$3}'

# =============================================================================
# Setup & Install
# =============================================================================

## install: Install all dependencies via pnpm
install:
	@echo "$(BLUE)Installing dependencies...$(NC)"
	pnpm install

## reset: Clean everything and reinstall from scratch
reset: clean-all install
	@echo "$(GREEN)Reset complete!$(NC)"

## setup-domains: Set up wildcard subdomains for local multi-tenancy dev
setup-domains:
	@echo "$(BLUE)Setting up local wildcard domains...$(NC)"
	./scripts/wildcard-domain/setup-local-domains.sh

# =============================================================================
# Development
# =============================================================================

## dev: Start development servers for all apps
dev:
	@echo "$(BLUE)Starting development servers...$(NC)"
	pnpm dev

## dev-vite: Start the Vite app only
dev-vite:
	@echo "$(BLUE)Starting Vite app...$(NC)"
	pnpm --filter @stackra/vite dev

## dev-desktop: Start the Electron desktop app (Vite + Electron)
dev-desktop:
	@echo "$(BLUE)Starting Electron desktop app...$(NC)"
	pnpm --filter @stackra/desktop dev

# =============================================================================
# Build
# =============================================================================

## build: Build all packages and apps (respects dependency order)
build:
	@echo "$(BLUE)Building all packages and apps...$(NC)"
	pnpm build

## build-packages: Build only library packages
build-packages:
	@echo "$(BLUE)Building packages...$(NC)"
	pnpm build:packages

## build-apps: Build only deployable apps
build-apps:
	@echo "$(BLUE)Building apps...$(NC)"
	pnpm build:apps

# =============================================================================
# Testing
# =============================================================================

## test: Run all tests once (CI mode)
test:
	@echo "$(BLUE)Running tests...$(NC)"
	pnpm test

## test-watch: Run tests in watch mode (development)
test-watch:
	@echo "$(BLUE)Running tests in watch mode...$(NC)"
	pnpm test:watch

## test-coverage: Run tests with v8 coverage reports
test-coverage:
	@echo "$(BLUE)Running tests with coverage...$(NC)"
	pnpm test:coverage

# =============================================================================
# Code Quality
# =============================================================================

## lint: Run ESLint on all packages
lint:
	@echo "$(BLUE)Running linter...$(NC)"
	pnpm lint

## lint-fix: Run ESLint with auto-fix
lint-fix:
	@echo "$(BLUE)Running linter with auto-fix...$(NC)"
	pnpm lint:fix

## format: Format all code with Prettier
format:
	@echo "$(BLUE)Formatting code...$(NC)"
	pnpm format

## format-check: Check code formatting without modifying files
format-check:
	@echo "$(BLUE)Checking code formatting...$(NC)"
	pnpm format:check

## check-types: Run TypeScript type checking across all packages
check-types:
	@echo "$(BLUE)Checking types...$(NC)"
	pnpm check-types

## check: Run all quality checks (lint + format + types)
check: lint format-check check-types
	@echo "$(GREEN)All checks passed!$(NC)"

## validate: Full validation pipeline (lint + types + build)
validate:
	@echo "$(BLUE)Running full validation...$(NC)"
	pnpm validate

## ci: Simulate CI pipeline locally (lint + types + build + test)
ci: lint check-types build test
	@echo "$(GREEN)CI checks passed!$(NC)"

# =============================================================================
# Cleanup
# =============================================================================

## clean: Clean all build artifacts and turbo cache
clean:
	@echo "$(YELLOW)Cleaning build artifacts...$(NC)"
	pnpm clean

## clean-all: Nuclear clean — removes node_modules, dist, .turbo
clean-all:
	@echo "$(RED)Cleaning everything...$(NC)"
	pnpm clean:deps
	rm -rf .turbo

# =============================================================================
# Dependency Management
# =============================================================================

## update: Update all dependencies to latest versions (pnpm update -r --latest)
update:
	@echo "$(BLUE)Updating dependencies...$(NC)"
	pnpm update -r --latest

## update-interactive: Interactively update dependencies
update-interactive:
	@echo "$(BLUE)Interactive dependency update...$(NC)"
	pnpm update -r --latest --interactive

## audit: Run security audit on all dependencies
audit:
	@echo "$(BLUE)Running security audit...$(NC)"
	pnpm audit --audit-level=moderate

## audit-fix: Attempt to fix security vulnerabilities
audit-fix:
	@echo "$(BLUE)Fixing security vulnerabilities...$(NC)"
	pnpm audit --fix

## sync-configs: Apply unified config templates to all packages
sync-configs:
	@echo "$(BLUE)Syncing config files across all packages...$(NC)"
	pnpm sync-configs

## fix-deps: Fix all @stackra/* deps to use workspace:*
fix-deps:
	@echo "$(BLUE)Fixing workspace dependencies...$(NC)"
	pnpm fix-deps

# =============================================================================
# Release & Publishing
# =============================================================================

## changeset: Create a new changeset for versioning
changeset:
	@echo "$(BLUE)Creating changeset...$(NC)"
	pnpm changeset

## version: Apply changesets and bump package versions
version:
	@echo "$(BLUE)Versioning packages...$(NC)"
	pnpm changeset:version

## release: Build all packages and publish to npm
release:
	@echo "$(BLUE)Releasing packages...$(NC)"
	pnpm release

# =============================================================================
# Utilities
# =============================================================================

## graph: Generate and open the turbo dependency graph
graph:
	@echo "$(BLUE)Generating dependency graph...$(NC)"
	pnpm graph
	@echo "$(GREEN)Graph saved to dependency-graph.html$(NC)"

## info: Display project and environment information
info:
	@echo "$(BLUE)Project Information:$(NC)"
	@echo "  Node:  $$(node --version)"
	@echo "  pnpm:  $$(pnpm --version)"
	@echo "  Turbo: $$(pnpm turbo --version 2>/dev/null || echo 'not installed')"
	@echo ""
	@echo "$(BLUE)Workspace Packages:$(NC)"
	@pnpm list -r --depth 0 2>/dev/null | head -40
