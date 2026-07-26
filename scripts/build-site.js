import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { renderStructuredPage } from '../lib/site/structured-renderer.js';
import { supportedKinds, validateTemplateContract } from '../lib/site/template-registry.js';

const root = process.cwd();
const contentRoot = path.join(root, 'content');
const mode = process.argv.includes('--validate') ? 'validate' : process.argv.includes('--check') ? 'check' : 'build';
const resources = loadResources(contentRoot);
const registry = new Map(resources.map((resource) => [resource.id, resource]));
const errors = validate(resources, registry);

if (errors.length) {
  console.error(`Site content validation failed with ${errors.length} error(s):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

if (mode === 'validate') {
  console.log(`Validated ${resources.length} structured resources across ${countCollections(resources)} collections.`);
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
    } else console.error(`Out of date: ${path.relative(root, outputPath)}`);
  }
}

if (mode === 'check' && changed) process.exit(1);
console.log(mode === 'check' ? `Generated pages are current (${resources.length} checked).` : `Build complete: ${resources.length} pages, ${changed} written.`);

function loadResources(directory) {
  const files = walk(directory).filter((file) => file.endsWith('.json'));
  const loaded = [];
  for (const file of files) {
    const parsed = JSON.parse(fs.readFileSync(file, 'utf8'));
    const items = Array.isArray(parsed) ? parsed : [parsed];
    for (const item of items) loaded.push({ ...item, sourceFile: path.relative(root, file) });
  }
  return loaded;
}

function walk(directory) {
  if (!fs.existsSync(directory)) return [];
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}

function outputFile(pathname) {
  if (pathname === '/') return 'index.html';
  return `${pathname.replace(/^\//, '')}.html`;
}

function validate(items, index) {
  const allowedMaturity = new Set(['Concept', 'Research', 'Beta', 'Production', 'Archived']);
  const required = ['id', 'kind', 'pathname', 'title', 'summary', 'maturity', 'evidence', 'methodology', 'assumptions', 'limitations'];
  const errors = [];
  const ids = new Set();
  const paths = new Set();
  for (const item of items) {
    for (const field of required) if (item[field] == null || item[field] === '') errors.push(`${item.id || 'unknown'} is missing ${field}`);
    if (!supportedKinds.includes(item.kind)) errors.push(`${item.id}: unsupported kind ${item.kind}`);
    if (!allowedMaturity.has(item.maturity)) errors.push(`${item.id}: unsupported maturity ${item.maturity}`);
    if (ids.has(item.id)) errors.push(`duplicate id: ${item.id}`);
    if (paths.has(item.pathname)) errors.push(`duplicate pathname: ${item.pathname}`);
    ids.add(item.id);
    paths.add(item.pathname);
    errors.push(...validateTemplateContract(item));
    for (const relation of normalizedRelationships(item)) if (!index.has(relation.target)) errors.push(`${item.id}: unresolved relation ${relation.target}`);
  }
  errors.push(...graphErrors(items, index));
  return errors;
}

function normalizedRelationships(item) {
  return item.relationships || (item.relatedIds || []).map((target) => ({ type: 'related_to', target }));
}

function graphErrors(items, index) {
  const errors = [];
  for (const item of items) {
    const relations = normalizedRelationships(item);
    if (!relations.length) errors.push(`${item.id}: orphaned resource has no relationships`);
    for (const relation of relations) {
      if (!['uses','supports','teaches','implements','evidences','depends_on','replaces','extends','produced_by','available_in_workspace','related_to'].includes(relation.type)) errors.push(`${item.id}: unsupported relationship type ${relation.type}`);
      if (relation.target === item.id) errors.push(`${item.id}: self relationship is not allowed`);
      if (index.has(relation.target) && ['replaces','extends','depends_on'].includes(relation.type)) {
        const target = index.get(relation.target);
        if (!normalizedRelationships(target).some((candidate) => candidate.target === item.id)) errors.push(`${item.id}: ${relation.type} ${relation.target} should have a reciprocal relationship`);
      }
    }
  }
  return errors;
}

function countCollections(items) {
  return new Set(items.map((item) => item.sourceFile.split(path.sep).slice(0, 2).join('/'))).size;
}
