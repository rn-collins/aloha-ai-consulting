import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { renderStructuredPage } from '../lib/site/structured-renderer.js';
import { supportedKinds, validateTemplateContract } from '../lib/site/template-registry.js';
import { derivePlatform, generatedOutputs, legacyMigrationInventory, validateGeneratedSite, validatePlatform, validateRoutingConfig, writeOutputs } from '../lib/site/publishing-engine.js';

const root = process.cwd();
const contentRoot = path.join(root, 'content');
const mode = process.argv.includes('--validate') ? 'validate' : process.argv.includes('--check') ? 'check' : 'build';
const resources = loadResources(contentRoot);
const platform = derivePlatform(resources);
const templateErrors = resources.flatMap((resource) => validateTemplateContract(resource));
const { errors: platformErrors, warnings: platformWarnings } = validatePlatform(resources, platform);
const routingConfig = JSON.parse(fs.readFileSync(path.join(root, 'vercel.json'), 'utf8'));
const routingErrors = validateRoutingConfig(resources, routingConfig);
const errors = [...templateErrors, ...platformErrors, ...routingErrors];

for (const warning of platformWarnings) console.warn(`Warning: ${warning}`);
if (errors.length) {
  console.error(`Site platform validation failed with ${errors.length} error(s):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

const derived = generatedOutputs(resources, platform);
derived.set('/api/migration-inventory.json', JSON.stringify(legacyMigrationInventory(root, resources, derived), null, 2));
if (mode === 'validate') {
  console.log(`Validated ${resources.length} canonical resources across ${platform.collections.size} generated collections.`);
  console.log(`Derived ${platform.topics.size} topics, ${platform.audiences.size} audiences, ${platform.industries.size} industries, and ${platform.graph.edges.length} graph edges.`);
  process.exit(0);
}

let changed = 0;
for (const resource of resources) {
  const outputPath = path.join(root, outputFile(resource.pathname));
  const html = renderStructuredPage({ resource, registry: platform.registry });
  const existing = fs.existsSync(outputPath) ? fs.readFileSync(outputPath, 'utf8') : null;
  if (existing === html) continue;
  changed += 1;
  if (mode === 'build') {
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, html);
    console.log(`Generated ${path.relative(root, outputPath)}`);
  } else console.error(`Out of date: ${path.relative(root, outputPath)}`);
}
changed += writeOutputs(root, derived, mode);

if (mode === 'build') {
  const { generatedErrors, legacyWarnings } = validateGeneratedSite(root, resources, derived);
  if (legacyWarnings.length) {
    console.warn(`Legacy HTML findings (${legacyWarnings.length}, non-blocking):`);
    for (const warning of legacyWarnings.slice(0, 100)) console.warn(`- ${warning}`);
  }
  if (generatedErrors.length) {
    console.error(`Generated HTML validation failed with ${generatedErrors.length} error(s):`);
    for (const error of generatedErrors) console.error(`- ${error}`);
    process.exit(1);
  }
  fs.mkdirSync(path.join(root, 'reports'), { recursive: true });
  fs.writeFileSync(path.join(root, 'reports', 'legacy-html-findings.json'), JSON.stringify({ generatedAt: new Date().toISOString(), findings: legacyWarnings }, null, 2));
}

if (mode === 'check' && changed) process.exit(1);
console.log(mode === 'check' ? `All generated outputs are current (${resources.length} resources).` : `Phase 3A build complete: ${resources.length} resource pages plus ${derived.size} derived outputs; ${changed} files written.`);

function loadResources(directory) {
  const loaded = [];
  for (const file of walk(directory).filter((candidate) => candidate.endsWith('.json'))) {
    let parsed;
    try { parsed = JSON.parse(fs.readFileSync(file, 'utf8')); }
    catch (error) { console.error(`Invalid JSON in ${path.relative(root, file)}: ${error.message}`); process.exit(1); }
    for (const item of Array.isArray(parsed) ? parsed : [parsed]) {
      if (!item || typeof item !== 'object' || !item.id) continue;
      loaded.push({ ...item, sourceFile: path.relative(root, file) });
    }
  }
  return loaded.filter((item) => supportedKinds.includes(item.kind));
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
