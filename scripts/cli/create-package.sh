#!/usr/bin/env bash
set -euo pipefail

# =============================================================================
# Create Package
#
# Scaffolds a new shared package in packages/ using the sync-configs templates.
# Creates the directory structure, applies templates, and initializes
# package.json with the correct name, scripts, and dependencies.
#
# Usage:
#   ./scripts/sync-configs/create-package.sh my-utils
#   ./scripts/sync-configs/create-package.sh my-utils --scope @repo
#   ./scripts/sync-configs/create-package.sh my-utils --dry-run
#
# Creates:
#   packages/my-utils/
#   ├── src/
#   │   └── index.ts
#   ├── __tests__/
#   │   └── .gitkeep
#   ├── package.json
#   ├── tsconfig.json
#   ├── tsup.config.ts
#   ├── jest.config.ts
#   ├── eslint.config.ts
#   ├── .prettierrc.mjs
#   └── .gitignore
# =============================================================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"
TEMPLATE_DIR="$SCRIPT_DIR/templates"

# ── Colors ───────────────────────────────────────────────────────────────────
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

# ── Defaults ─────────────────────────────────────────────────────────────────
SCOPE="@repo"
DRY_RUN=false
PKG_NAME=""

# ── Parse Arguments ──────────────────────────────────────────────────────────
for arg in "$@"; do
  case "$arg" in
    --dry-run) DRY_RUN=true ;;
    --scope)   shift; SCOPE="$1" ;;
    --scope=*) SCOPE="${arg#*=}" ;;
    -*)        echo -e "${RED}Unknown flag: $arg${NC}"; exit 1 ;;
    *)         PKG_NAME="$arg" ;;
  esac
done

if [ -z "$PKG_NAME" ]; then
  echo -e "${RED}Usage: create-package.sh <name> [--scope @repo] [--dry-run]${NC}"
  echo ""
  echo "Examples:"
  echo "  ./scripts/sync-configs/create-package.sh my-utils"
  echo "  ./scripts/sync-configs/create-package.sh my-utils --scope @stackra"
  echo "  ./scripts/sync-configs/create-package.sh my-utils --dry-run"
  exit 1
fi

# ── Derived Values ───────────────────────────────────────────────────────────
FULL_NAME="${SCOPE}/${PKG_NAME}"
PKG_DIR="$ROOT_DIR/packages/$PKG_NAME"

echo ""
echo -e "${CYAN}╭──────────────────────────────────────────╮${NC}"
echo -e "${CYAN}│  Create Package: ${FULL_NAME}${NC}"
echo -e "${CYAN}│  Location: packages/${PKG_NAME}/${NC}"
echo -e "${CYAN}╰──────────────────────────────────────────╯${NC}"
echo ""

# ── Check if package already exists ──────────────────────────────────────────
if [ -d "$PKG_DIR" ]; then
  echo -e "${RED}Error: packages/${PKG_NAME} already exists.${NC}"
  exit 1
fi

if $DRY_RUN; then
  echo -e "${YELLOW}DRY RUN — no files will be created${NC}"
  echo ""
fi

# ── Helper: write file ───────────────────────────────────────────────────────
write_file() {
  local path="$1"
  local content="$2"

  if $DRY_RUN; then
    echo -e "  ${CYAN}[DRY]${NC} Would create: $path"
    return
  fi

  mkdir -p "$(dirname "$path")"
  echo "$content" > "$path"
  echo -e "  ${GREEN}[OK]${NC} $path"
}

# ── Helper: apply template with placeholder replacement ──────────────────────
apply_template() {
  local template="$1"
  local target="$2"

  if [ ! -f "$TEMPLATE_DIR/$template" ]; then
    echo -e "  ${YELLOW}[SKIP]${NC} Template not found: $template"
    return
  fi

  local content
  content=$(sed "s|{{PACKAGE_NAME}}|$FULL_NAME|g" "$TEMPLATE_DIR/$template")

  write_file "$PKG_DIR/$target" "$content"
}

# ── Create Directory Structure ───────────────────────────────────────────────
echo "Creating directory structure..."

if ! $DRY_RUN; then
  mkdir -p "$PKG_DIR/src"
  mkdir -p "$PKG_DIR/__tests__"
fi

# ── Create package.json ──────────────────────────────────────────────────────
echo "Creating package.json..."

PACKAGE_JSON=$(cat <<EOF
{
  "name": "${FULL_NAME}",
  "version": "0.1.0",
  "description": "",
  "private": true,
  "main": "./dist/index.js",
  "module": "./dist/index.mjs",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/index.mjs",
      "require": "./dist/index.js",
      "types": "./dist/index.d.ts"
    }
  },
  "files": ["dist"],
  "sideEffects": false,
  "license": "MIT",
  "author": {
    "name": "Stackra L.L.C",
    "email": "dev@stackra.com",
    "url": "https://stackra.com"
  },
  "repository": {
    "type": "git",
    "url": "git+https://github.com/stackra-inc/react-native-monorepo.git",
    "directory": "packages/${PKG_NAME}"
  },
  "scripts": {
    "build": "tsup",
    "dev": "tsup --watch",
    "clean": "rm -rf dist coverage",
    "lint": "eslint .",
    "lint:fix": "eslint . --fix",
    "check-types": "tsc --noEmit",
    "test": "jest --passWithNoTests",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  },
  "dependencies": {},
  "devDependencies": {
    "@stackra/typescript-config": "^1.0.4",
    "@stackra/tsup-config": "^1.0.3",
    "@types/jest": "^30.0.0",
    "jest": "^30.3.0",
    "jest-expo": "^55.0.16",
    "tsup": "^8.5.1",
    "typescript": "^6.0.3"
  },
  "engines": {
    "node": ">=22.22.2",
    "pnpm": ">=10"
  }
}
EOF
)

write_file "$PKG_DIR/package.json" "$PACKAGE_JSON"

# ── Create src/index.ts ─────────────────────────────────────────────────────
echo "Creating source files..."

INDEX_TS=$(cat <<EOF
/**
 * ${FULL_NAME}
 *
 * Package entry point.
 *
 * @module ${FULL_NAME}
 */

export {};
EOF
)

write_file "$PKG_DIR/src/index.ts" "$INDEX_TS"

# ── Apply Config Templates ──────────────────────────────────────────────────
echo "Applying config templates..."

apply_template "tsconfig.json"     "tsconfig.json"
apply_template "tsup.config.ts"    "tsup.config.ts"
apply_template "jest.config.ts"    "jest.config.ts"
apply_template "eslint.config.ts"  "eslint.config.ts"
apply_template ".prettierrc.mjs"   ".prettierrc.mjs"
apply_template ".gitignore"        ".gitignore"

# ── Create __tests__/.gitkeep ────────────────────────────────────────────────
if ! $DRY_RUN; then
  touch "$PKG_DIR/__tests__/.gitkeep"
  echo -e "  ${GREEN}[OK]${NC} __tests__/.gitkeep"
fi

# ── Done ─────────────────────────────────────────────────────────────────────
echo ""
echo -e "${GREEN}╭──────────────────────────────────────────╮${NC}"
echo -e "${GREEN}│  Package created successfully!            ${NC}"
echo -e "${GREEN}│                                           ${NC}"
echo -e "${GREEN}│  Next steps:                              ${NC}"
echo -e "${GREEN}│  1. pnpm install                          ${NC}"
echo -e "${GREEN}│  2. Edit packages/${PKG_NAME}/src/index.ts${NC}"
echo -e "${GREEN}│  3. pnpm build --filter ${FULL_NAME}      ${NC}"
echo -e "${GREEN}╰──────────────────────────────────────────╯${NC}"
