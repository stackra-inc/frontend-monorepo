#!/usr/bin/env node
/**
 * Generate a Mermaid dependency graph from workspace package.json files.
 * Shows only production @stackra/* dependencies, grouped by layer.
 *
 * Usage: node scripts/cli/generate-mermaid-graph.js
 * Output: dependency-graph.mmd
 */

const fs = require("fs");
const cp = require("child_process");

const files = cp
  .execSync('find packages apps -name package.json -not -path "*/node_modules/*" -maxdepth 4', {
    encoding: "utf8",
  })
  .trim()
  .split("\n");

const pkgMap = {};
for (const f of files) {
  try {
    const pkg = JSON.parse(fs.readFileSync(f, "utf8"));
    const deps = { ...(pkg.dependencies || {}), ...(pkg.peerDependencies || {}) };
    const stackraDeps = Object.keys(deps).filter((k) => k.startsWith("@stackra/"));
    pkgMap[pkg.name] = { deps: stackraDeps, path: f };
  } catch (e) {
    /* skip */
  }
}

const tools = [],
  base = [],
  apps = [];
for (const name of Object.keys(pkgMap)) {
  const p = pkgMap[name].path;
  if (p.includes("tools/")) tools.push(name);
  else if (p.includes("base/")) base.push(name);
  else if (p.includes("apps/")) apps.push(name);
}

const short = (n) => n.replace("@stackra/", "");

let mmd = "graph TD\n\n";

if (apps.length) {
  mmd += '  subgraph Apps["🚀 Apps"]\n';
  apps.sort().forEach((n) => (mmd += "    " + short(n) + '["' + short(n) + '"]\n'));
  mmd += "  end\n\n";
}

if (base.length) {
  mmd += '  subgraph Base["📦 Base Packages"]\n';
  base.sort().forEach((n) => (mmd += "    " + short(n) + '["' + short(n) + '"]\n'));
  mmd += "  end\n\n";
}

if (tools.length) {
  mmd += '  subgraph Tools["🔧 Tools"]\n';
  tools.sort().forEach((n) => (mmd += "    " + short(n) + '["' + short(n) + '"]\n'));
  mmd += "  end\n\n";
}

mmd += "  %% Production + peer dependencies\n";
for (const [name, info] of Object.entries(pkgMap)) {
  for (const dep of info.deps) {
    if (pkgMap[dep]) {
      mmd += "  " + short(name) + " --> " + short(dep) + "\n";
    }
  }
}

mmd += "\n  %% Styling\n";
mmd += "  style Apps fill:#1a1a2e,stroke:#e94560,color:#fff\n";
mmd += "  style Base fill:#16213e,stroke:#0f3460,color:#fff\n";
mmd += "  style Tools fill:#1a1a2e,stroke:#533483,color:#fff\n";

fs.writeFileSync("dependency-graph.mmd", mmd);
console.log("✓ Generated dependency-graph.mmd");
