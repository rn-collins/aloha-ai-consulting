#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const baseline = process.argv[2] || 'b0a1b3c';
const outputDirectory = path.join(root, 'artifacts', 'migration-parity');
const sitemap = fs.readFileSync(path.join(root, 'sitemap.xml'), 'utf8');
const routing = JSON.parse(fs.readFileSync(path.join(root, 'vercel.json'), 'utf8'));
const liveRoutes = new Set([...sitemap.matchAll(/<loc>https?:\/\/[^/]+([^<]*)<\/loc>/g)].map((match) => match[1] || '/'));
const redirects = new Map((routing.redirects || []).map((rule) => [rule.source, rule.destination]));
const deletedFiles = git(['diff', '--name-only', '--diff-filter=D', `${baseline}..HEAD`, '--', '*.html'])
  .trim()
  .split(/\n/)
  .filter(Boolean);

const pages = deletedFiles.map((sourceFile) => inspectPage(sourceFile));
const missing = pages.filter((page) => !page.routePreserved);
const sortedOverlap = pages.map((page) => page.distinctiveWordOverlap).sort((a, b) => a - b);
const summary = {
  baseline,
  deletedHandwrittenPages: pages.length,
  routesPreserved: pages.length - missing.length,
  missingRoutes: missing.length,
  exactH1Matches: pages.filter((page) => page.exactH1Match).length,
  medianDistinctiveWordOverlap: sortedOverlap[Math.floor(sortedOverlap.length / 2)] || 0
};
const report = { summary, pages };

fs.mkdirSync(outputDirectory, { recursive: true });
fs.writeFileSync(path.join(outputDirectory, 'report.json'), `${JSON.stringify(report, null, 2)}\n`);
fs.writeFileSync(path.join(outputDirectory, 'report.md'), markdown(report));
process.stdout.write(markdown(report));
if (missing.length) process.exitCode = 1;

function inspectPage(sourceFile) {
  const original = git(['show', `${baseline}:${sourceFile}`]);
  const originalRoute = routeForFile(sourceFile);
  const currentRoute = redirects.get(originalRoute) || originalRoute;
  const currentFile = outputFile(currentRoute);
  const routePreserved = liveRoutes.has(originalRoute) || redirects.has(originalRoute);
  const current = fs.existsSync(currentFile) ? fs.readFileSync(currentFile, 'utf8') : '';
  const originalH1 = extractH1(original);
  const currentH1 = extractH1(current);
  const originalWords = distinctiveWords(original);
  const currentWords = distinctiveWords(current);
  const overlap = originalWords.size
    ? [...originalWords].filter((word) => currentWords.has(word)).length / originalWords.size
    : 1;
  return {
    sourceFile,
    originalRoute,
    currentRoute,
    routePreserved,
    originalH1,
    currentH1,
    exactH1Match: Boolean(originalH1 && originalH1 === currentH1),
    distinctiveWordOverlap: Math.round(overlap * 100)
  };
}

function markdown(report) {
  const weakest = [...report.pages].sort((a, b) => a.distinctiveWordOverlap - b.distinctiveWordOverlap).slice(0, 25);
  return `# Post-migration content parity audit

Baseline: \`${report.summary.baseline}\`

- Deleted handwritten pages examined: ${report.summary.deletedHandwrittenPages}
- Routes preserved directly or by permanent redirect: ${report.summary.routesPreserved}
- Missing routes: ${report.summary.missingRoutes}
- Exact H1 matches: ${report.summary.exactH1Matches}
- Median distinctive-word overlap: ${report.summary.medianDistinctiveWordOverlap}%

Route preservation is a blocking migration requirement. H1 and distinctive-word overlap are editorial review signals, not pass/fail measures: structured migration intentionally changes templates and may rephrase copy while preserving the resource contract.

## Lowest editorial-retention signals

| Original route | Current route | Original H1 | Current H1 | Word overlap |
|---|---|---|---|---:|
${weakest.map((page) => `| \`${page.originalRoute}\` | \`${page.currentRoute}\` | ${cell(page.originalH1)} | ${cell(page.currentH1)} | ${page.distinctiveWordOverlap}% |`).join('\n')}
`;
}

function git(args) {
  return execFileSync('git', args, { cwd: root, encoding: 'utf8', maxBuffer: 10_000_000 });
}

function routeForFile(file) {
  const clean = file.replace(/\/index\.html$/, '').replace(/\.html$/, '');
  return clean === 'index' ? '/' : `/${clean}`;
}

function outputFile(route) {
  return path.join(root, route === '/' ? 'index.html' : `${route.replace(/^\//, '')}.html`);
}

function extractH1(html) {
  return visibleText(html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i)?.[1] || '');
}

function distinctiveWords(html) {
  return new Set(visibleText(html)
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((word) => word.length >= 7));
}

function visibleText(html) {
  return String(html)
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z#0-9]+;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function cell(value) {
  return (value || '—').replace(/\|/g, '\\|');
}
