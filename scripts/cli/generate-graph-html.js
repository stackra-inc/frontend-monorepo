#!/usr/bin/env node
/**
 * Generate an interactive HTML dependency graph from workspace package.json files.
 * Shows production + peer @stackra/* dependencies, grouped by layer.
 *
 * Usage: node scripts/cli/generate-graph-html.js
 * Output: dependency-graph.html
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
  } catch (e) {}
}

const short = (n) => n.replace("@stackra/", "");

// Categorize
const groups = { tools: [], base: [], apps: [] };
for (const name of Object.keys(pkgMap)) {
  const p = pkgMap[name].path;
  if (p.includes("tools/")) groups.tools.push(name);
  else if (p.includes("base/")) groups.base.push(name);
  else if (p.includes("apps/")) groups.apps.push(name);
}

// Build nodes and edges for vis.js
const nodes = [];
const edges = [];
const colors = {
  apps: { bg: "#e94560", border: "#c81e45", font: "#fff" },
  base: { bg: "#0f3460", border: "#16213e", font: "#fff" },
  tools: { bg: "#533483", border: "#3d2066", font: "#fff" },
};

let id = 1;
const idMap = {};

for (const [group, names] of Object.entries(groups)) {
  const c = colors[group];
  for (const name of names.sort()) {
    idMap[name] = id;
    nodes.push({
      id: id++,
      label: short(name),
      group: group,
      color: { background: c.bg, border: c.border },
      font: { color: c.font, size: 14, face: "Inter, system-ui, sans-serif" },
      shape: group === "apps" ? "diamond" : group === "tools" ? "box" : "ellipse",
      size: group === "apps" ? 30 : 20,
    });
  }
}

for (const [name, info] of Object.entries(pkgMap)) {
  for (const dep of info.deps) {
    if (idMap[name] && idMap[dep]) {
      edges.push({
        from: idMap[name],
        to: idMap[dep],
        arrows: "to",
        color: { color: "#555", opacity: 0.6 },
        smooth: { type: "cubicBezier", roundness: 0.4 },
      });
    }
  }
}

const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Stackra Dependency Graph</title>
  <script src="https://unpkg.com/vis-network@9.1.9/standalone/umd/vis-network.min.js"></script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { background: #0a0a0f; color: #e0e0e0; font-family: Inter, system-ui, sans-serif; }
    #header {
      padding: 16px 24px;
      background: #111118;
      border-bottom: 1px solid #222;
      display: flex;
      align-items: center;
      gap: 24px;
    }
    #header h1 { font-size: 18px; font-weight: 600; }
    .legend { display: flex; gap: 16px; font-size: 13px; }
    .legend-item { display: flex; align-items: center; gap: 6px; }
    .legend-dot { width: 12px; height: 12px; border-radius: 3px; }
    #graph { width: 100vw; height: calc(100vh - 56px); }
  </style>
</head>
<body>
  <div id="header">
    <h1>Stackra Dependency Graph</h1>
    <div class="legend">
      <div class="legend-item"><div class="legend-dot" style="background:#e94560"></div> Apps</div>
      <div class="legend-item"><div class="legend-dot" style="background:#0f3460"></div> Base</div>
      <div class="legend-item"><div class="legend-dot" style="background:#533483"></div> Tools</div>
    </div>
    <span style="font-size:12px;color:#666;margin-left:auto">Production deps only &middot; ${Object.keys(pkgMap).length} packages &middot; ${edges.length} edges</span>
  </div>
  <div id="graph"></div>
  <script>
    const nodes = new vis.DataSet(${JSON.stringify(nodes)});
    const edges = new vis.DataSet(${JSON.stringify(edges)});
    const container = document.getElementById('graph');
    const network = new vis.Network(container, { nodes, edges }, {
      layout: {
        hierarchical: {
          enabled: true,
          direction: 'UD',
          sortMethod: 'directed',
          levelSeparation: 120,
          nodeSpacing: 160,
          treeSpacing: 200,
          blockShifting: true,
          edgeMinimization: true,
          parentCentralization: true,
        }
      },
      physics: false,
      interaction: {
        hover: true,
        tooltipDelay: 100,
        zoomView: true,
        dragView: true,
      },
      edges: {
        width: 1.5,
        selectionWidth: 3,
        hoverWidth: 2.5,
      },
      nodes: {
        borderWidth: 2,
        shadow: { enabled: true, color: 'rgba(0,0,0,0.3)', size: 8 },
      },
    });
  </script>
</body>
</html>`;

fs.writeFileSync("dependency-graph.html", html);
console.log("✓ Generated dependency-graph.html");
console.log("  " + Object.keys(pkgMap).length + " packages, " + edges.length + " edges");
