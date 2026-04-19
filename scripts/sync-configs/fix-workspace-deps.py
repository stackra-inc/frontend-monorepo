#!/usr/bin/env python3
"""
Fix Workspace Dependencies

Scans all package.json files in the monorepo and replaces any
@stackra/* dependency version with "workspace:*".

This ensures all internal packages reference each other via
the pnpm workspace protocol instead of hardcoded npm versions.

Usage:
    python3 scripts/sync-configs/fix-workspace-deps.py
    python3 scripts/sync-configs/fix-workspace-deps.py --dry-run
"""

import json
import glob
import sys
import os

DRY_RUN = "--dry-run" in sys.argv
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Find all package.json files in packages/ and apps/
patterns = [
    os.path.join(ROOT, "packages", "*", "package.json"),
    os.path.join(ROOT, "packages", "container", "*", "package.json"),
    os.path.join(ROOT, "packages", "new", "*", "package.json"),
    os.path.join(ROOT, "apps", "*", "package.json"),
]

files = []
for pattern in patterns:
    files.extend(glob.glob(pattern))

# Build the set of actual workspace package names
workspace_names = set()
for f in files:
    with open(f) as fh:
        workspace_names.add(json.load(fh).get("name", ""))

total_fixed = 0

for pkg_path in sorted(files):
    with open(pkg_path) as f:
        pkg = json.load(f)

    pkg_name = pkg.get("name", "unknown")
    changed = False

    # Fix all dependency sections
    for section in ["dependencies", "peerDependencies", "devDependencies"]:
        deps = pkg.get(section, {})
        for dep_name, dep_version in list(deps.items()):
            # Only convert if the dep is an actual workspace package
            if dep_name.startswith("@stackra/") and dep_version != "workspace:*" and dep_name in workspace_names:
                if DRY_RUN:
                    print(f"  [DRY] {pkg_name} → {section}.{dep_name}: {dep_version} → workspace:*")
                else:
                    deps[dep_name] = "workspace:*"
                changed = True
                total_fixed += 1

    if changed and not DRY_RUN:
        with open(pkg_path, "w") as f:
            json.dump(pkg, f, indent=2)
            f.write("\n")
        print(f"  ✅ {pkg_name}: fixed")
    elif changed:
        print(f"  🔍 {pkg_name}: would fix")
    # else: already correct, skip silently

print(f"\nTotal: {total_fixed} dependencies {'would be ' if DRY_RUN else ''}fixed")
