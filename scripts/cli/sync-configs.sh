#!/usr/bin/env bash
set -euo pipefail

# =============================================================================
# Sync Config Files
#
# Applies the unified config templates to all packages in the monorepo.
# Replaces {{PACKAGE_NAME}} with the actual package name from package.json.
#
# Usage:
#   ./scripts/sync-configs/sync-configs.sh              # all packages
#   ./scripts/sync-configs/sync-configs.sh cache         # single package
#   ./scripts/sync-configs/sync-configs.sh --dry-run     # preview only
# =============================================================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"
TEMPLATE_DIR="$SCRIPT_DIR/templates"

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

DRY_RUN=false
TARGET_PKG=""

# Parse args
for arg in "$@"; do
  case "$arg" in
    --dry-run) DRY_RUN=true ;;
    *) TARGET_PKG="$arg" ;;
  esac
done

# Find all package directories
find_packages() {
  local dirs=()
  for d in "$ROOT_DIR"/packages/*/; do
    [ -f "$d/package.json" ] && dirs+=("$d")
  done
  # Sub-packages (container/*)
  for d in "$ROOT_DIR"/packages/container/*/; do
    [ -f "$d/package.json" ] && dirs+=("$d")
  done
  # New packages
  for d in "$ROOT_DIR"/packages/new/*/; do
    [ -f "$d/package.json" ] && dirs+=("$d")
  done
  echo "${dirs[@]}"
}

# Get package name from package.json
get_pkg_name() {
  python3 -c "import json; print(json.load(open('$1/package.json'))['name'])" 2>/dev/null || echo "unknown"
}

# Apply a template file to a package
apply_template() {
  local pkg_dir="$1"
  local template="$2"
  local target="$3"
  local pkg_name="$4"

  local target_path="$pkg_dir/$target"
  local template_path="$TEMPLATE_DIR/$template"

  if [ ! -f "$template_path" ]; then
    echo -e "  ${YELLOW}[SKIP]${NC} Template not found: $template"
    return
  fi

  # Replace {{PACKAGE_NAME}} placeholder
  local content
  content=$(sed "s|{{PACKAGE_NAME}}|$pkg_name|g" "$template_path")

  if $DRY_RUN; then
    echo -e "  ${CYAN}[DRY]${NC} Would write: $target"
    return
  fi

  # Create directory if needed
  mkdir -p "$(dirname "$target_path")"

  echo "$content" > "$target_path"
  echo -e "  ${GREEN}[OK]${NC} $target"
}

# Process a single package
process_package() {
  local pkg_dir="$1"
  local pkg_name
  pkg_name=$(get_pkg_name "$pkg_dir")
  local short_name
  short_name=$(basename "$pkg_dir")

  echo ""
  echo -e "${CYAN}=== $pkg_name ($short_name) ===${NC}"

  # Config files that get replaced entirely
  apply_template "$pkg_dir" "tsconfig.json"              "tsconfig.json"              "$pkg_name"
  apply_template "$pkg_dir" "tsup.config.ts"             "tsup.config.ts"             "$pkg_name"
  apply_template "$pkg_dir" ".prettierrc.mjs"            ".prettierrc.mjs"            "$pkg_name"
  apply_template "$pkg_dir" "eslint.config.ts"           "eslint.config.ts"           "$pkg_name"
  apply_template "$pkg_dir" "jest.config.ts"              "jest.config.ts"             "$pkg_name"
  apply_template "$pkg_dir" ".gitignore"                 ".gitignore"                 "$pkg_name"

  # Clean up old config file formats
  rm -f "$pkg_dir/.prettierrc.js" 2>/dev/null
  rm -f "$pkg_dir/eslint.config.js" 2>/dev/null
  rm -f "$pkg_dir/.prettierrc" 2>/dev/null

  # Inject missing package.json fields
  if ! $DRY_RUN; then
    python3 -c "
import json, sys

pkg_path = '$pkg_dir/package.json'
with open(pkg_path) as f:
    pkg = json.load(f)

changed = False

# Add missing scripts
scripts = pkg.setdefault('scripts', {})
for key, val in {
    'build': 'tsup',
    'dev': 'tsup --watch',
    'clean': 'rm -rf dist node_modules/.cache',
    'typecheck': 'tsc --noEmit',
    'lint': 'eslint . --max-warnings 0',
    'lint:fix': 'eslint . --fix',
    'format': 'prettier --write .',
    'format:check': 'prettier --check .',
    'test': 'vitest run --passWithNoTests',
    'test:watch': 'vitest',
    'test:coverage': 'vitest run --coverage',
    'prepublishOnly': 'pnpm run build',
    'release': 'pnpm publish --access public --no-git-checks',
}.items():
    if key not in scripts:
        scripts[key] = val
        changed = True

# Add sideEffects
if 'sideEffects' not in pkg:
    pkg['sideEffects'] = False
    changed = True

# Add engines
if 'engines' not in pkg:
    pkg['engines'] = {'node': '>=18.0.0', 'pnpm': '>=9.0.0'}
    changed = True

# Add publishConfig
if 'publishConfig' not in pkg:
    pkg['publishConfig'] = {'access': 'public', 'registry': 'https://registry.npmjs.org/'}
    changed = True

# Enforce devDependency versions
REQUIRED_DEV_DEPS = {
    'typescript': '^6.0.2',
    'tsup': '^8.5.1',
    'vitest': '^4.1.2',
    'eslint': '10.2.0',
    'prettier': '^3.8.1',
    '@stackra/typescript-config': '^1.0.4',
    '@stackra/tsup-config': '^1.0.3',
    '@stackra/eslint-config': '^1.0.5',
    '@stackra/prettier-config': '^1.0.3',
    '@vitest/ui': '^4.1.2',
    'jsdom': '^29.0.1',
    'typescript-eslint': '^8.58.0',
}
dev_deps = pkg.setdefault('devDependencies', {})
for dep, ver in REQUIRED_DEV_DEPS.items():
    if dep in dev_deps and dev_deps[dep] != ver:
        dev_deps[dep] = ver
        changed = True
    elif dep not in dev_deps:
        dev_deps[dep] = ver
        changed = True

if changed:
    with open(pkg_path, 'w') as f:
        json.dump(pkg, f, indent=2)
        f.write('\n')
    print('  \033[0;32m[OK]\033[0m package.json updated')
else:
    print('  \033[0;32m[OK]\033[0m package.json already up to date')
" 2>&1
  fi
}

# Main
echo "============================================"
echo "  Config Sync — Monorepo Packages"
echo "============================================"

if $DRY_RUN; then
  echo -e "${YELLOW}DRY RUN — no files will be modified${NC}"
fi

if [ -n "$TARGET_PKG" ] && [ "$TARGET_PKG" != "--dry-run" ]; then
  # Single package mode
  pkg_dir=""
  for d in "$ROOT_DIR/packages/$TARGET_PKG" "$ROOT_DIR/packages/container/$TARGET_PKG" "$ROOT_DIR/packages/new/$TARGET_PKG"; do
    [ -f "$d/package.json" ] && pkg_dir="$d" && break
  done
  if [ -z "$pkg_dir" ]; then
    echo "Error: Package '$TARGET_PKG' not found."
    exit 1
  fi
  process_package "$pkg_dir"
else
  # All packages
  for pkg_dir in $(find_packages); do
    process_package "$pkg_dir"
  done
fi

echo ""
echo "============================================"
echo "  Done!"
echo "============================================"
