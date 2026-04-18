#!/usr/bin/env bash
# =============================================================================
# sync-workflows.sh
#
# Syncs the production-tested GitHub Actions workflows from
# packages/abcd/container to every other package in the monorepo.
#
# What it does:
#   1. Reads the source workflows from container/.github/
#   2. For each target package:
#      a. Creates .github/actions/setup/ and .github/workflows/
#      b. Copies the composite setup action (unchanged — it's generic)
#      c. Generates a package-specific ci.yml (replaces package name)
#      d. Generates a package-specific publish.yml (replaces package name)
#
# Usage:
#   bash scripts/sync-workflows.sh
#
# Dry run (preview only, no writes):
#   DRY_RUN=1 bash scripts/sync-workflows.sh
#
# Single package:
#   ONLY=packages/abcd/cache bash scripts/sync-workflows.sh
# =============================================================================

set -euo pipefail

MONOREPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../../.." && pwd)"
CONTAINER_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SOURCE_DIR="$CONTAINER_DIR/.github"
DRY_RUN="${DRY_RUN:-0}"
ONLY="${ONLY:-}"

# ── Package list: "relative/path|@scope/name" ────────────────────────────────
PACKAGES="
packages/abcd/cache|@stakra/ts-cache
packages/abcd/redis|@stakra/ts-redis
packages/abcd/i18n|@stakra/react-i18n
packages/abcd/config|@stakra/ts-config
packages/auth|@stakra/react-auth
packages/desktop|@stakra/ts-desktop
packages/events|@stakra/ts-events
packages/http|@stakra/ts-http
packages/kbd|@stakra/kbd
packages/logger|@stakra/ts-logger
packages/multitenancy|@stakra/react-multitenancy
packages/pwa|@stakra/ts-pwa
packages/refine|@stakra/react-refine
packages/router|@stakra/react-router
packages/rxdb-eloquent|@stakra/ts-eloquent
packages/sdui|@stakra/react-sdui
packages/settings|@stakra/ts-settings
packages/support|@stakra/ts-support
packages/theming|@stakra/react-theming
packages/ui|@stakra/ts-ui
"

# ── Helpers ───────────────────────────────────────────────────────────────────

log()  { echo "  $*"; }
ok()   { echo "  ✅ $*"; }
skip() { echo "  ⏭️  $*"; }
info() { echo ""; echo "📦 $*"; }

write_file() {
  local path="$1"
  local content="$2"
  if [[ "$DRY_RUN" == "1" ]]; then
    echo "  [DRY RUN] would write: $path"
  else
    mkdir -p "$(dirname "$path")"
    printf '%s\n' "$content" > "$path"
  fi
}

copy_file() {
  local src="$1"
  local dst="$2"
  if [[ "$DRY_RUN" == "1" ]]; then
    echo "  [DRY RUN] would copy: $(basename $src) → $dst"
  else
    mkdir -p "$(dirname "$dst")"
    cp "$src" "$dst"
  fi
}

# ── Validate source ───────────────────────────────────────────────────────────

SOURCE_SETUP="$SOURCE_DIR/actions/setup/action.yml"
SOURCE_CI="$SOURCE_DIR/workflows/ci.yml"
SOURCE_PUBLISH="$SOURCE_DIR/workflows/publish.yml"

if [[ ! -f "$SOURCE_SETUP" || ! -f "$SOURCE_CI" || ! -f "$SOURCE_PUBLISH" ]]; then
  echo "❌ Source workflows not found in $SOURCE_DIR"
  echo "   Expected:"
  echo "     $SOURCE_SETUP"
  echo "     $SOURCE_CI"
  echo "     $SOURCE_PUBLISH"
  exit 1
fi

echo ""
echo "🔄 Syncing GitHub Actions workflows"
echo "   Source:   $SOURCE_DIR"
echo "   Dry run:  $DRY_RUN"
[[ -n "$ONLY" ]] && echo "   Filter:   $ONLY"
echo ""

SYNCED=0
SKIPPED=0

# ── Process each package ──────────────────────────────────────────────────────

while IFS='|' read -r PKG_PATH PKG_NAME; do
  # Skip blank lines
  [[ -z "$PKG_PATH" ]] && continue

  # Filter to single package if ONLY is set
  if [[ -n "$ONLY" && "$PKG_PATH" != "$ONLY" ]]; then
    continue
  fi

  PKG_DIR="$MONOREPO_ROOT/$PKG_PATH"

  # Skip if package directory doesn't exist
  if [[ ! -d "$PKG_DIR" ]]; then
    skip "$PKG_NAME — directory not found"
    SKIPPED=$((SKIPPED + 1))
    continue
  fi

  info "$PKG_NAME  ($PKG_PATH)"

  # Read actual package name from package.json
  ACTUAL_NAME=$(node -e "try{process.stdout.write(require('$PKG_DIR/package.json').name)}catch(e){process.stdout.write('$PKG_NAME')}" 2>/dev/null || echo "$PKG_NAME")
  PKG_SLUG=$(basename "$PKG_PATH")

  # ── 1. Copy composite setup action (generic, no substitution needed) ────
  copy_file "$SOURCE_SETUP" "$PKG_DIR/.github/actions/setup/action.yml"
  log "Copied  .github/actions/setup/action.yml"

  # ── 2. Generate ci.yml ──────────────────────────────────────────────────
  CI_CONTENT=$(sed "s|@stakra/ts-container|$ACTUAL_NAME|g" "$SOURCE_CI")
  write_file "$PKG_DIR/.github/workflows/ci.yml" "$CI_CONTENT"
  log "Written .github/workflows/ci.yml"

  # ── 3. Generate publish.yml ─────────────────────────────────────────────
  PUBLISH_CONTENT=$(sed \
    -e "s|@stakra/ts-container|$ACTUAL_NAME|g" \
    -e "s|stakraco/ts-container|stakraco/$PKG_SLUG|g" \
    "$SOURCE_PUBLISH")
  write_file "$PKG_DIR/.github/workflows/publish.yml" "$PUBLISH_CONTENT"
  log "Written .github/workflows/publish.yml"

  ok "Done"
  SYNCED=$((SYNCED + 1))

done <<< "$PACKAGES"

# ── Summary ───────────────────────────────────────────────────────────────────

echo ""
echo "─────────────────────────────────────────────────────────"
echo "✅ Synced:  $SYNCED packages"
echo "⏭️  Skipped: $SKIPPED packages"
echo ""
echo "Next steps:"
echo "  1. Review generated workflows in each package's .github/"
echo "  2. Ensure each package has a pnpm-lock.yaml:"
echo "       bash scripts/gen-lockfiles.sh"
echo "  3. Add NPM_TOKEN secret to each package's GitHub repo"
echo "  4. Commit and push each package"
echo ""
