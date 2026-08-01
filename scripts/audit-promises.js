import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const outDir = path.join(root, 'program', 'promise-delivery');
const write = process.argv.includes('--write');
const check = process.argv.includes('--check');
const reviewRelease = process.argv.includes('--review-release');
const releaseCheck = process.argv.includes('--release-check');
if (![write, check, reviewRelease, releaseCheck].some(Boolean)) {
  throw new Error('Use --write, --check, --review-release, or --release-check.');
}
if ([write, check, reviewRelease, releaseCheck].filter(Boolean).length !== 1) {
  throw new Error('Select exactly one promise-audit mode.');
}

const resourcesPayload = readJson('api/resources.json');
const interactions = readJson('artifacts/interaction-audit/report.json');
const resources = resourcesPayload.resources;
const sitemapRoutes = [...fs.readFileSync(path.join(root, 'sitemap.xml'), 'utf8').matchAll(/<loc>https?:\/\/[^/]+([^<]*)<\/loc>/g)]
  .map((match) => normalizeRoute(match[1]));
const htmlFiles = walk(root).filter((file) => file.endsWith('.html') && !file.includes(`${path.sep}node_modules${path.sep}`) && !file.includes(`${path.sep}artifacts${path.sep}`));
const staticRoutes = htmlFiles.map(routeFor).sort();

const claimFields = new Set([
  'title', 'summary', 'actions', 'deliverables', 'delivery', 'demo', 'documentation',
  'downloadTemplate', 'implementationStatus', 'limitations', 'licensing', 'monitor',
  'roadmap', 'workspace', 'workspaceUrl', 'assessmentUrls', 'buildsExperience',
  'contactExperience', 'servicesExperience', 'universityExperience'
]);
const claimOccurrences = [];
for (const resource of resources) {
  for (const [field, value] of Object.entries(resource)) {
    if (!claimFields.has(field)) continue;
    collectStrings(value, `${field}`, (text, fieldPath) => {
      if (text.length < 3 || /^https?:\/\//.test(text) || text.startsWith('/')) return;
      claimOccurrences.push({
        signature: `claim|${text}`,
        exactPromise: text,
        category: 'resource-claim',
        occurrence: {
          route: resource.pathname,
          resourceId: resource.id,
          sourceFile: resource.sourceFile,
          field: fieldPath
        },
        context: { field: fieldPath, resource }
      });
    });
  }
}

const actionOccurrences = interactions.inventory.map((item, index) => ({
  signature: `action|${item.type}|${item.label}|${item.target}`,
  exactPromise: item.label || `${item.type} control`,
  category: 'public-action',
  occurrence: { route: item.route, element: item.type, target: item.target, auditOrdinal: index + 1 },
  context: item
}));

const grouped = new Map();
for (const item of [...claimOccurrences, ...actionOccurrences]) {
  if (!grouped.has(item.signature)) grouped.set(item.signature, { ...item, occurrences: [] });
  grouped.get(item.signature).occurrences.push(item.occurrence);
}
const records = [...grouped.values()].map(classify).sort((a, b) => a.id.localeCompare(b.id));
const destinationMap = new Map();
for (const [index, item] of interactions.inventory.entries()) {
  const target = item.target || '';
  if (!destinationMap.has(target)) destinationMap.set(target, []);
  destinationMap.get(target).push({ route: item.route, label: item.label, element: item.type, auditOrdinal: index + 1 });
}
const destinationInventory = [...destinationMap.entries()].map(([target, occurrences]) => ({
  id: `DEST-${hash(target).slice(0, 12).toUpperCase()}`,
  target,
  type: /^(https?:\/\/)/i.test(target) ? 'external'
    : /^(mailto:|tel:)/i.test(target) ? 'contact'
    : target.startsWith('/') ? 'internal'
    : target === 'browser-local' || target === 'same-page state' || ['button', 'submit', 'reset'].includes(target) ? 'state'
    : 'other',
  representedBuild: /(github\.com|vercel\.app|vercel\.com)/i.test(target),
  occurrences
})).sort((a, b) => a.id.localeCompare(b.id));
const duplicateIds = records.length - new Set(records.map((record) => record.id)).size;
const unknownRecords = records.filter((record) => record.maturity === 'unknown');
const unclassified = records.filter((record) => !record.disposition || !record.acceptanceCriteria);

const publicRoutes = [...new Set([...sitemapRoutes, ...staticRoutes])].sort();
const routeInventory = publicRoutes.map((route) => {
  const resource = resources.find((item) => normalizeRoute(item.pathname) === route);
  const occurrenceCount = interactions.inventory.filter((item) => item.route === route).length;
  const promiseCount = records.filter((record) => record.occurrences.some((occurrence) => occurrence.route === route)).length;
  return {
    route,
    file: route === '/' ? 'index.html' : `${route.slice(1)}.html`,
    canonicalResourceId: resource?.id || null,
    canonicalKind: resource?.kind || null,
    interactiveOccurrences: occurrenceCount,
    promiseRecords: promiseCount
  };
});
const counts = {
  sitemapRoutes: new Set(sitemapRoutes).size,
  staticHtmlRoutes: new Set(staticRoutes).size,
  publicRouteSurfaces: publicRoutes.length,
  canonicalResources: resources.length,
  interactivePages: interactions.pages,
  interactiveOccurrences: interactions.interactiveElements,
  uniqueDestinations: interactions.uniqueDestinations,
  destinationRecords: destinationInventory.length,
  representedBuildDestinations: destinationInventory.filter((item) => item.representedBuild).length,
  promiseRecords: records.length,
  resourceClaimRecords: records.filter((record) => record.category === 'resource-claim').length,
  publicActionRecords: records.filter((record) => record.category === 'public-action').length,
  totalPromiseOccurrences: records.reduce((sum, record) => sum + record.occurrences.length, 0),
  unknownRecords: unknownRecords.length,
  unclassifiedRecords: unclassified.length
};
const errors = [];
for (const route of sitemapRoutes) if (!staticRoutes.includes(route)) errors.push(`Missing static route: ${route}`);
for (const route of staticRoutes) if (!sitemapRoutes.includes(route) && route !== '/404') errors.push(`Unaccounted HTML route outside sitemap: ${route}`);
if (interactions.failures.length) errors.push(`Interaction audit has ${interactions.failures.length} failure(s).`);
if (duplicateIds) errors.push(`${duplicateIds} duplicate promise ID(s).`);
if (unclassified.length) errors.push(`${unclassified.length} record(s) lack a disposition or acceptance criterion.`);
if (!records.length) errors.push('No promise records were generated.');

const ledger = { version: 1, baselineCommit: 'deb1073d', baselineDate: '2026-07-29', counts, records };
const freeze = {
  version: 1,
  baselineCommit: 'deb1073d',
  baselineDate: '2026-07-29',
  counts,
  coverage: {
    routesInventoried: `${routeInventory.length}/${counts.publicRouteSurfaces}`,
    canonicalResourcesInventoried: `${resources.length}/${counts.canonicalResources}`,
    interactiveOccurrencesInventoried: `${records.filter(r => r.category === 'public-action').reduce((n, r) => n + r.occurrences.length, 0)}/${counts.interactiveOccurrences}`,
    promiseRecordsClassified: `${records.length - unclassified.length}/${records.length}`
  },
  hashes: {
    routes: hash(routeInventory),
    ledger: hash(ledger)
  },
  routes: routeInventory,
  errors
};
const dashboard = renderDashboard(freeze, records);
const outputs = {
  'ledger.json': `${JSON.stringify(ledger)}\n`,
  'freeze.json': `${JSON.stringify(freeze)}\n`,
  'destination-inventory.json': `${JSON.stringify({ version: 1, baselineCommit: 'deb1073d', counts: { records: destinationInventory.length, representedBuilds: counts.representedBuildDestinations }, destinations: destinationInventory })}\n`,
  'dashboard.md': dashboard
};

const releaseRegistryPath = path.join(outDir, 'promise-release-registry.json');
const releaseRegistry = {
  schema: 'aloha-ai-promise-release-registry/1.0',
  frozenBaseline: {
    commit: 'deb1073d',
    date: '2026-07-29',
    promiseRecords: 4289,
    promiseOccurrences: 9552
  },
  reviewBoundary: 'Repository-local structural promise inventory. This review does not certify responsive rendering, deployment, live production behavior, factual accuracy, legal sufficiency, maintained monitoring, enrollment, grading, credentials, external integrations, or service capacity.',
  reviewedAt: '2026-07-31',
  reviewedBy: 'Aloha AI promise-delivery remediation R06',
  decision: 'approved-current-structural-inventory',
  counts: {
    routes: counts.publicRouteSurfaces,
    resources: counts.canonicalResources,
    interactiveOccurrences: counts.interactiveOccurrences,
    promiseRecords: counts.promiseRecords,
    promiseOccurrences: counts.totalPromiseOccurrences
  },
  hashes: {
    routes: hash(routeInventory),
    records: hash(records.map(releaseRecord))
  },
  records: records.map(releaseRecord)
};

if (write) {
  fs.mkdirSync(outDir, { recursive: true });
  for (const [name, content] of Object.entries(outputs)) fs.writeFileSync(path.join(outDir, name), content);
}
if (reviewRelease) {
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(releaseRegistryPath, `${JSON.stringify(releaseRegistry)}\n`);
}
if (check) {
  for (const [name, content] of Object.entries(outputs)) {
    const file = path.join(outDir, name);
    if (!fs.existsSync(file) || fs.readFileSync(file, 'utf8') !== content) errors.push(`${name} is missing or out of date.`);
  }
}
if (releaseCheck) {
  if (!fs.existsSync(releaseRegistryPath)) {
    errors.push('promise-release-registry.json is missing; an explicit R06 review is required.');
  } else {
    const reviewed = JSON.parse(fs.readFileSync(releaseRegistryPath, 'utf8'));
    if (reviewed.schema !== releaseRegistry.schema) errors.push('Promise release registry schema is unsupported.');
    if (reviewed.decision !== 'approved-current-structural-inventory') errors.push('Promise release registry lacks an approved review decision.');
    if (!reviewed.reviewedAt || !reviewed.reviewedBy || !reviewed.reviewBoundary) errors.push('Promise release registry lacks review provenance or boundary.');
    if (reviewed.frozenBaseline?.promiseRecords !== 4289 || reviewed.frozenBaseline?.promiseOccurrences !== 9552) {
      errors.push('Promise release registry does not preserve the frozen 4,289/9,552 baseline.');
    }
    const reviewedRecords = new Map((reviewed.records || []).map((record) => [record.promiseId, record]));
    const currentRecords = new Map(releaseRegistry.records.map((record) => [record.promiseId, record]));
    const added = [...currentRecords.keys()].filter((id) => !reviewedRecords.has(id));
    const removed = [...reviewedRecords.keys()].filter((id) => !currentRecords.has(id));
    const changed = [...currentRecords.keys()].filter((id) => reviewedRecords.has(id) && JSON.stringify(currentRecords.get(id)) !== JSON.stringify(reviewedRecords.get(id)));
    if (added.length) errors.push(`${added.length} unrecorded promise signature(s): ${added.slice(0, 10).join(', ')}${added.length > 10 ? ', …' : ''}`);
    if (removed.length) errors.push(`${removed.length} reviewed promise signature(s) disappeared: ${removed.slice(0, 10).join(', ')}${removed.length > 10 ? ', …' : ''}`);
    if (changed.length) errors.push(`${changed.length} reviewed promise occurrence set(s) changed: ${changed.slice(0, 10).join(', ')}${changed.length > 10 ? ', …' : ''}`);
    if (JSON.stringify(reviewed.counts) !== JSON.stringify(releaseRegistry.counts)) errors.push('Promise release registry counts differ from the current estate.');
    if (reviewed.hashes?.routes !== releaseRegistry.hashes.routes) errors.push('Public route inventory differs from the reviewed release registry.');
    if (reviewed.hashes?.records !== releaseRegistry.hashes.records) errors.push('Promise record inventory differs from the reviewed release registry.');
  }
}
console.log(`Promise inventory: ${counts.publicRouteSurfaces} public route surfaces (${counts.sitemapRoutes} sitemap + recovery); ${counts.canonicalResources} resources; ${counts.interactiveOccurrences} interactive occurrences; ${counts.promiseRecords} grouped promise records; ${counts.totalPromiseOccurrences} total occurrences.`);
if (unknownRecords.length) console.warn(`${unknownRecords.length} records retain unknown maturity and require substantive verification.`);
if (errors.length) {
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}
console.log(write
  ? 'Frozen control package written.'
  : reviewRelease
    ? 'Current promise release registry reviewed and written; frozen controls were not changed.'
    : releaseCheck
      ? 'Current promise inventory exactly matches the reviewed release registry.'
      : 'Frozen control package is current and internally reconciled.');

function releaseRecord(record) {
  return {
    promiseId: record.id,
    category: record.category,
    exactPromise: record.exactPromise,
    occurrenceKeys: record.occurrences.map((occurrence) => hash(occurrence)).sort()
  };
}

function classify(item) {
  const text = item.exactPromise;
  const lower = text.toLowerCase();
  const route = item.occurrence.route;
  const field = item.context.field || '';
  const resource = item.context.resource;
  const risk = /(credential|certif|enroll|access|account|save|submit|download|privacy|legal|monitor|live|current|real-time|payment|purchase)/i.test(`${text} ${route}`);
  const future = /roadmap|coming soon|planned|future|not yet|forthcoming/i.test(`${field} ${text}`);
  const limitation = /^limitations/.test(field) || /does not|cannot|not available|not a substitute|no account/i.test(lower);
  let maturity = 'unknown';
  let defect = 'requires-review';
  let disposition = 'deepen';
  let presentReality = 'The exact statement is published in a canonical resource, but substantive fulfillment has not yet been independently verified by this baseline.';
  let acceptanceCriteria = 'Inspect the public experience, supporting content/code, and production behavior; then record exact evidence or correct the claim.';
  let dependencies = ['Substantive product/content verification'];
  if (item.category === 'public-action') {
    maturity = 'functional-beta';
    defect = 'none';
    disposition = 'verify-maintain';
    presentReality = 'The existing interaction audit found a named control with a resolvable target or declared browser-local state; destination depth remains separately reviewable.';
    acceptanceCriteria = 'Control resolves or changes the declared state in production, and its destination fulfills the surrounding visitor expectation.';
    dependencies = ['Production browser verification', 'Destination-depth review'];
  } else if (future) {
    maturity = 'placeholder';
    defect = 'status-language';
    disposition = 'mark-forthcoming';
    presentReality = 'The statement is explicitly future-facing or roadmap-scoped.';
    acceptanceCriteria = 'Keep the capability visibly forthcoming with a named dependency, or implement and production-verify it before changing status.';
    dependencies = ['Named roadmap dependency'];
  } else if (limitation) {
    maturity = 'guardrail';
    defect = 'none';
    disposition = 'verify-maintain';
    presentReality = 'The statement constrains or qualifies another public promise.';
    acceptanceCriteria = 'Confirm the limitation remains visible, precise, and consistent everywhere the related capability appears.';
    dependencies = [];
  } else if (resource?.maturity === 'Production') {
    maturity = 'production';
    defect = risk ? 'evidence' : 'requires-review';
    disposition = risk ? 'reframe' : 'verify-maintain';
  } else if (resource?.maturity === 'Beta') {
    maturity = 'functional-beta';
    defect = 'content-depth';
    disposition = 'complete';
  } else if (resource?.maturity === 'Research') {
    maturity = 'thin-prototype';
    defect = 'content-depth';
    disposition = 'deepen';
  }
  const priority = risk ? 'P0' : route.startsWith('/university') || route.startsWith('/tools') || route === '/builds' || route === '/workspace' ? 'P1' : item.category === 'public-action' ? 'P3' : 'P2';
  return {
    id: `PD-${hash(item.signature).slice(0, 12).toUpperCase()}`,
    category: item.category,
    exactPromise: text,
    occurrences: item.occurrences,
    visitorExpectation: item.category === 'public-action'
      ? `Activating “${text}” performs the named action or opens the stated destination.`
      : `A reasonable visitor may rely on this statement as a description of the current ${resource?.kind || 'site'} experience unless it is visibly qualified.`,
    presentReality,
    maturity,
    defect,
    disposition,
    dependencies,
    acceptanceCriteria,
    priority,
    status: 'classified'
  };
}

function renderDashboard(freeze, records) {
  const by = (key) => Object.entries(records.reduce((acc, record) => {
    acc[record[key]] = (acc[record[key]] || 0) + 1;
    return acc;
  }, {})).sort((a, b) => a[0].localeCompare(b[0]));
  const table = (rows) => rows.map(([name, count]) => `| ${name} | ${count} |`).join('\n');
  const p0 = records.filter((record) => record.priority === 'P0').slice(0, 30);
  return `# Promise–Delivery baseline dashboard

Frozen against production commit \`${freeze.baselineCommit}\` on ${freeze.baselineDate}.

## Coverage

| Measure | Result |
|---|---:|
| Sitemap routes inventoried | ${freeze.coverage.routesInventoried} |
| Canonical resources inventoried | ${freeze.coverage.canonicalResourcesInventoried} |
| Interactive occurrences inventoried | ${freeze.coverage.interactiveOccurrencesInventoried} |
| Promise records classified | ${freeze.coverage.promiseRecordsClassified} |
| Unique destinations | ${freeze.counts.uniqueDestinations} |
| Destination records | ${freeze.counts.destinationRecords} |
| Represented GitHub/Vercel build destinations | ${freeze.counts.representedBuildDestinations} |
| Total promise occurrences | ${freeze.counts.totalPromiseOccurrences} |

Structural resolution does not equal substantive fulfillment. This baseline classifies exposure; the roadmap supplies verification and buildout.

## Maturity

| State | Records |
|---|---:|
${table(by('maturity'))}

## Disposition

| Disposition | Records |
|---|---:|
${table(by('disposition'))}

## Priority

| Priority | Records |
|---|---:|
${table(by('priority'))}

## First P0 review queue

| Promise ID | Route | Exact promise |
|---|---|---|
${p0.map((record) => `| ${record.id} | ${record.occurrences[0].route} | ${record.exactPromise.replaceAll('|', '\\|').slice(0, 180)} |`).join('\n')}

The complete enumerated record and every occurrence are in \`ledger.json\`; the complete route register and hashes are in \`freeze.json\`.
`;
}

function collectStrings(value, field, emit) {
  if (typeof value === 'string') return emit(value.trim(), field);
  if (Array.isArray(value)) return value.forEach((item, index) => collectStrings(item, `${field}[${index}]`, emit));
  if (value && typeof value === 'object') for (const [key, item] of Object.entries(value)) collectStrings(item, `${field}.${key}`, emit);
}
function readJson(relative) { return JSON.parse(fs.readFileSync(path.join(root, relative), 'utf8')); }
function walk(dir) { return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => entry.name === '.git' ? [] : entry.isDirectory() ? walk(path.join(dir, entry.name)) : [path.join(dir, entry.name)]); }
function routeFor(file) { const rel = path.relative(root, file).replaceAll(path.sep, '/').replace(/\.html$/, ''); return rel === 'index' ? '/' : `/${rel}`; }
function normalizeRoute(value) { const clean = value.replace(/\/$/, ''); return clean || '/'; }
function hash(value) { return crypto.createHash('sha256').update(typeof value === 'string' ? value : JSON.stringify(value)).digest('hex'); }
