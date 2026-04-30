#!/usr/bin/env bash
# ──────────────────────────────────────────────────────────────────────
# cleanup.sh — Universal monorepo cleanup utility
#
# Auto-detects the monorepo type (Node/TS, PHP, React Native, etc.)
# and cleans the appropriate artifacts.
#
# Usage:
#   ./scripts/cleanup.sh          # default: clean build artifacts
#   ./scripts/cleanup.sh build    # remove build outputs (dist, vendor, coverage)
#   ./scripts/cleanup.sh cache    # remove turbo cache, tsbuildinfo, .cache
#   ./scripts/cleanup.sh deps     # remove all dependency dirs + lockfiles
#   ./scripts/cleanup.sh all      # everything: build + cache + deps + tmp
#   ./scripts/cleanup.sh tmp      # remove OS/temp files (.DS_Store, etc.)
# ──────────────────────────────────────────────────────────────────────

set -uo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
MODE="${1:-build}"

# ── Colors ────────────────────────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log()  { echo -e "${GREEN}✔${NC} $1"; }
warn() { echo -e "${YELLOW}⚠${NC} $1"; }
info() { echo -e "${BLUE}ℹ${NC} $1"; }

# ── Auto-detect monorepo type ─────────────────────────────────────────
HAS_NODE=false
HAS_PHP=false
HAS_RN=false
HAS_PYTHON=false

[ -f "$ROOT/package.json" ] && HAS_NODE=true
[ -f "$ROOT/composer.json" ] && HAS_PHP=true
{ [ -f "$ROOT/requirements.txt" ] || [ -f "$ROOT/pyproject.toml" ]; } && HAS_PYTHON=true

if $HAS_NODE; then
  if grep -q '"expo"' "$ROOT/package.json" 2>/dev/null; then
    HAS_RN=true
  elif find "$ROOT/apps" "$ROOT/packages" -name "app.json" -maxdepth 3 2>/dev/null | grep -q . 2>/dev/null; then
    HAS_RN=true
  fi
fi

# ── Helpers ───────────────────────────────────────────────────────────
remove_dirs() {
    local pattern="$1"
    local label="$2"
    local exclude="${3:-node_modules}"
    local count=0

    while IFS= read -r -d '' dir; do
        rm -rf "$dir"
        count=$((count + 1))
    done < <(find "$ROOT" -name "$exclude" -prune -o -name "$pattern" -type d -print0 2>/dev/null || true)

    if [ "$count" -gt 0 ]; then
        log "Removed ${count} ${label} directories"
    fi
}

remove_files() {
    local pattern="$1"
    local label="$2"
    local count=0

    while IFS= read -r -d '' file; do
        rm -f "$file"
        count=$((count + 1))
    done < <(find "$ROOT" \( -name "node_modules" -o -name "vendor" \) -prune -o -name "$pattern" -type f -print0 2>/dev/null || true)

    if [ "$count" -gt 0 ]; then
        log "Removed ${count} ${label} files"
    fi
}

remove_file() {
    local file="$ROOT/$1"
    if [ -f "$file" ]; then
        rm -f "$file"
        log "Removed $1"
    fi
}

# ── Build artifacts ───────────────────────────────────────────────────
clean_build() {
    echo "Cleaning build artifacts..."

    remove_dirs "coverage" "coverage"

    if $HAS_NODE; then
        remove_dirs "dist" "dist"
        remove_dirs ".next" ".next"
        remove_dirs ".output" ".output"
        remove_dirs "release" "release"
        remove_dirs "storybook-static" "storybook-static"
        remove_files "*.tsbuildinfo" "tsbuildinfo"
    fi

    if $HAS_RN; then
        remove_dirs ".expo" ".expo"
        remove_dirs "android/app/build" "android build"
        remove_dirs "ios/build" "ios build"
        remove_dirs "ios/Pods" "CocoaPods"
    fi

    if $HAS_PHP; then
        remove_dirs "public/build" "public/build"
        remove_dirs "bootstrap/cache" "bootstrap/cache" "vendor"
        remove_dirs "storage/framework/cache" "framework cache" "vendor"
        remove_dirs "storage/framework/views" "compiled views" "vendor"
        remove_dirs "storage/framework/sessions" "sessions" "vendor"
    fi

    if $HAS_PYTHON; then
        remove_dirs "__pycache__" "__pycache__"
        remove_dirs ".pytest_cache" ".pytest_cache"
        remove_dirs "*.egg-info" "egg-info"
        remove_files "*.pyc" "pyc"
    fi
}

# ── Caches ────────────────────────────────────────────────────────────
clean_cache() {
    echo "Cleaning caches..."

    if [ -d "$ROOT/.turbo" ]; then
        rm -rf "$ROOT/.turbo"
        log "Removed root .turbo"
    fi
    remove_dirs ".turbo" ".turbo"

    if command -v turbo &>/dev/null; then
        turbo clean 2>/dev/null && log "Turbo daemon cache cleared" || true
    fi

    if $HAS_NODE; then
        remove_dirs ".cache" ".cache"
        remove_dirs ".eslintcache" ".eslintcache"
        remove_files "*.tsbuildinfo" "tsbuildinfo"
        remove_files ".eslintcache" "eslintcache"
    fi

    if $HAS_PHP; then
        remove_dirs "bootstrap/cache" "bootstrap cache" "vendor"
        if command -v php &>/dev/null && [ -f "$ROOT/artisan" ]; then
            php "$ROOT/artisan" cache:clear 2>/dev/null && log "Laravel cache cleared" || true
        fi
    fi
}

# ── Dependencies ──────────────────────────────────────────────────────
clean_deps() {
    echo "Cleaning dependencies..."

    if $HAS_NODE; then
        local count=0
        while IFS= read -r -d '' dir; do
            rm -rf "$dir"
            count=$((count + 1))
        done < <(find "$ROOT" -name "node_modules" -type d -prune -print0 2>/dev/null || true)
        if [ "$count" -gt 0 ]; then
            log "Removed ${count} node_modules directories"
        fi
    fi

    if $HAS_PHP; then
        local count=0
        while IFS= read -r -d '' dir; do
            rm -rf "$dir"
            count=$((count + 1))
        done < <(find "$ROOT" -name "vendor" -type d -prune -print0 2>/dev/null || true)
        if [ "$count" -gt 0 ]; then
            log "Removed ${count} vendor directories"
        fi
    fi

    if $HAS_PYTHON; then
        for venv in "venv" ".venv"; do
            if [ -d "$ROOT/$venv" ]; then
                rm -rf "$ROOT/$venv"
                log "Removed $venv"
            fi
        done
    fi

    for lockfile in \
        "pnpm-lock.yaml" "package-lock.json" "yarn.lock" "bun.lockb" "bun.lock" \
        "composer.lock" \
        "poetry.lock" "Pipfile.lock"; do
        remove_file "$lockfile"
    done
}

# ── Temp / OS files ───────────────────────────────────────────────────
clean_tmp() {
    echo "Cleaning temp files..."
    remove_files ".DS_Store" ".DS_Store"
    remove_files "Thumbs.db" "Thumbs.db"
    remove_dirs ".tmp" ".tmp"
    remove_dirs "tmp" "tmp"
}

# ── Execute ───────────────────────────────────────────────────────────
DETECTED=""
$HAS_NODE && DETECTED="${DETECTED} node"
$HAS_PHP && DETECTED="${DETECTED} php"
$HAS_RN && DETECTED="${DETECTED} react-native"
$HAS_PYTHON && DETECTED="${DETECTED} python"

echo ""
echo "🧹 Monorepo Cleanup (mode: ${MODE})"
echo "   Detected:${DETECTED:-" unknown"}"
echo "─────────────────────────────────────"

case "$MODE" in
    build)   clean_build ;;
    cache)   clean_cache ;;
    deps)    clean_deps ;;
    tmp)     clean_tmp ;;
    all)
        clean_build
        clean_cache
        clean_tmp
        clean_deps
        ;;
    *)
        echo -e "${RED}Unknown mode: ${MODE}${NC}"
        echo "Usage: cleanup.sh [build|cache|deps|tmp|all]"
        exit 1
        ;;
esac

echo ""
echo -e "${GREEN}Done.${NC}"
