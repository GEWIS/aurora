// Dev-only visualization script: walks `src`, derives a per-module import graph, and
// renders it as Mermaid (or dumps raw edges with --out=) to spot dependency cycles ahead
// of splitting `modules/*` into a plugin-style DAG. Edge counts are a coupling signal for
// that refactor, not a build-time correctness check, so `IMPORT_RE` matching type-only
// imports as edges is an accepted overstatement here.
import { readFileSync, readdirSync, statSync, writeFileSync } from 'fs';
import path from 'path';

const ROOT = path.resolve(__dirname, '..', 'src');

interface Edge {
  from: string;
  to: string;
  weight: number;
}

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const full = path.join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) walk(full, out);
    else if (/\.ts$/.test(entry) && !entry.endsWith('.spec.ts') && !entry.endsWith('.test.ts'))
      out.push(full);
  }
  return out;
}

function moduleOf(file: string): string {
  const rel = path.relative(ROOT, file);
  const parts = rel.split(path.sep);
  if (parts[0] === 'modules' && parts[1]) return `modules/${parts[1]}`;
  if (parts.length > 1) return parts[0];
  return path.basename(rel, '.ts');
}

const IMPORT_RE =
  /(?:import|export)\s+(?:[^'"]*from\s+)?['"]([^'"]+)['"]|require\(\s*['"]([^'"]+)['"]\s*\)/g;

function resolveImport(fromFile: string, spec: string): string | undefined {
  if (!spec.startsWith('.')) return undefined;
  const resolvedBase = path.resolve(path.dirname(fromFile), spec);
  const candidates = [resolvedBase + '.ts', path.join(resolvedBase, 'index.ts'), resolvedBase];
  const target = candidates.find((c) => {
    try {
      return statSync(c).isFile();
    } catch {
      return false;
    }
  });
  if (!target || !target.startsWith(ROOT)) return undefined;
  return target;
}

function computeEdges(): Edge[] {
  const files = walk(ROOT);
  const weights = new Map<string, number>();

  for (const file of files) {
    const content = readFileSync(file, 'utf8');
    const fromModule = moduleOf(file);
    let match: RegExpExecArray | null;
    while ((match = IMPORT_RE.exec(content))) {
      const spec = match[1] || match[2];
      const target = resolveImport(file, spec);
      if (!target) continue;
      const toModule = moduleOf(target);
      if (toModule === fromModule) continue;
      const key = `${fromModule}->${toModule}`;
      weights.set(key, (weights.get(key) ?? 0) + 1);
    }
  }

  return [...weights.entries()]
    .map(([key, weight]) => {
      const [from, to] = key.split('->');
      return { from, to, weight };
    })
    .sort((a, b) => b.weight - a.weight);
}

function idOf(m: string): string {
  return m.replace('modules/', '').replace(/-/g, '_');
}

function labelOf(m: string): string {
  return m.replace('modules/', '');
}

function toMermaid(edges: Edge[]): string {
  const mods = [...new Set(edges.flatMap((e) => [e.from, e.to]))].sort();
  const edgeSet = new Set(edges.map((e) => `${e.from}->${e.to}`));
  const core = new Set<string>();
  for (const e of edges) {
    if (edgeSet.has(`${e.to}->${e.from}`)) {
      core.add(e.from);
      core.add(e.to);
    }
  }

  const lines = ['flowchart TD'];
  for (const m of mods) lines.push(`  ${idOf(m)}["${labelOf(m)}"]`);
  for (const e of [...edges].sort(
    (a, b) => a.from.localeCompare(b.from) || a.to.localeCompare(b.to),
  )) {
    const label = e.weight > 1 ? `|${e.weight}|` : '';
    lines.push(`  ${idOf(e.from)} -->${label} ${idOf(e.to)}`);
  }
  lines.push('');
  lines.push('  classDef core fill:#f4a261,stroke:#b1440e,color:#1a1a1a,stroke-width:2px');
  lines.push('  classDef leaf fill:#8ecae6,stroke:#1b6a93,color:#1a1a1a,stroke-width:1px');
  const leaf = mods.filter((m) => !core.has(m));
  if (core.size) lines.push(`  class ${[...core].map(idOf).join(',')} core`);
  if (leaf.length) lines.push(`  class ${leaf.map(idOf).join(',')} leaf`);
  return lines.join('\n') + '\n';
}

function main() {
  const modulesOnly = process.argv.includes('--modules-only');
  const outPath = process.argv.find((a) => a.startsWith('--out='))?.slice('--out='.length);

  const allEdges = computeEdges();
  const edges = modulesOnly
    ? allEdges.filter((e) => e.from.startsWith('modules/') && e.to.startsWith('modules/'))
    : allEdges;

  if (outPath) {
    writeFileSync(outPath, JSON.stringify(edges, null, 2));
    console.error(`Wrote ${edges.length} edges to ${outPath}`);
  } else {
    console.log(toMermaid(edges));
  }
}

main();
