import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { renderStructuredPage } from '../lib/site/structured-renderer.js';

const root = process.cwd();
const contentFile = path.join(root, 'content/site/cornerstones.json');
const mode = process.argv.includes('--validate') ? 'validate' : process.argv.includes('--check') ? 'check' : 'build';

const resources = JSON.parse(fs.readFileSync(contentFile, 'utf8'));
const registry = new Map(resources.map((resource) => [resource.id, resource]));
const errors = validate(resources, registry);

if (errors.length) {
  console.error(`Site content validation failed with ${errors.length} error(s):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

if (mode === 'validate') {
  console.log(`Validated ${resources.length} structured resources.`);
  process.exit(0);
}

let changed = 0;
for (const resource of resources) {
  const outputPath = path.join(root, outputFile(resource.pathname));
  const html = renderStructuredPage({ resource, registry });
  const existing = fs.existsSync(outputPath) ? fs.readFileSync(outputPath, 'utf8') : null;

  if (existing !== html) {
    changed += 1;
    if (mode === 'build') {
      fs.mkdirSync(path.dirname(outputPath), { recursive: true });
      fs.writeFileSync(outputPath, html);
      console.log(`Generated ${path.relative(root, outputPath)}`);
    } else {
      console.error(`Out of date: ${path.relative(root, outputPath)}`);
    }
  }
}

if (mode === 'check' && changed) process.exit(1);
console.log(mode === 'check' ? `Generated pages are current (${resources.length} checked).` : `Build complete: ${resources.length} pages, ${changed} written.`);

function outputFile(pathname) {
  if (pathname === '/') return 'index.html';
  return `${pathname.replace(/^\//, '')}.html`;
}

function validate(items, index) {
  const allowedKinds = new Set(['service', 'product', 'learningHub', 'lesson', 'tool', 'monitor', 'research', 'build']);
  const allowedMaturity = new Set(['Concept', 'Research', 'Beta', 'Production', 'Archived']);
  const required = ['id', 'kind', 'pathname', 'title', 'summary', 'maturity', 'evidence', 'methodology', 'assumptions', 'limitations'];
  const errors = [];
  const ids = new Set();
  const paths = new Set();

  for (const item of items) {
    for (const field of required) if (item[field] == null || item[field] === '') errors.push(`${item.id || 'unknown'} is missing ${field}`);
    if (!allowedKinds.has(item.kind)) errors.push(`${item.id}: unsupported kind ${item.kind}`);
    if (!allowedMaturity.has(item.maturity)) errors.push(`${item.id}: unsupported maturity ${item.maturity}`);
    if (ids.has(item.id)) errors.push(`duplicate id: ${item.id}`);
    if (paths.has(item.pathname)) errors.push(`duplicate pathname: ${item.pathname}`);
    ids.add(item.id);
    paths.add(item.pathname);
    for (const relation of item.relatedIds || []) if (!index.has(relation) && !isExternalRegistryId(relation)) errors.push(`${item.id}: unresolved relation ${relation}`);
  }
  return errors;
}

function isExternalRegistryId(id) {
  return [
    'services', 'methods', 'build-your-team', 'ai-readiness-scorecard', 'citation-verifier',
    'cannabis-rescheduling', 'leak-check', 'regulatory-intelligence'
  ].includes(id);
}
