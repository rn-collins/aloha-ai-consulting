import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (file) => JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
const register = read('content/governance/destination-family-evidence-register.json');
const kinds = ['product', 'service', 'collection', 'institutional', 'learningHub'];
const resources = read('api/resources.json').resources.filter((resource) => kinds.includes(resource.kind));
const allResources = read('api/resources.json').resources;
const records = new Map();
const findings = [];
const supportedModes = new Set([
  'published-product-description', 'unavailable-product-description', 'scoped-service-description',
  'generated-collection-index', 'published-institutional-page', 'published-learning-hub',
  'unavailable-learning-hub-description'
]);
const expectedMode = (resource) => {
  if (resource.kind === 'product') return resource.releaseState?.status?.access === 'unavailable' ? 'unavailable-product-description' : 'published-product-description';
  if (resource.kind === 'service') return 'scoped-service-description';
  if (resource.kind === 'collection') return 'generated-collection-index';
  if (resource.kind === 'institutional') return 'published-institutional-page';
  return resource.releaseState?.status?.access === 'unavailable' ? 'unavailable-learning-hub-description' : 'published-learning-hub';
};
const pageFor = (resource) => path.join(root, resource.pathname === '/' ? 'index.html' : `${resource.pathname.replace(/^\//, '').replace(/\/$/, '')}.html`);
const blocksFor = (resource) => (resource.editorialSections || []).flatMap((section) => section.blocks || []);

if (register.schema !== 'aloha-ai-destination-family-evidence-register/1.0') findings.push('Unsupported destination-family register schema.');
if (!register.version || !register.reviewedAt || !register.reviewedBy || !register.scope || !register.boundary) findings.push('Register provenance or boundary is incomplete.');
for (const record of register.records || []) {
  if (!record.resourceId || !supportedModes.has(record.deliveryMode)) findings.push('Every record requires a resourceId and supported deliveryMode.');
  if (records.has(record.resourceId)) findings.push(`Duplicate destination-family record: ${record.resourceId}.`);
  records.set(record.resourceId, record);
}

const ids = new Set(resources.map((resource) => resource.id));
for (const resource of resources) {
  const record = records.get(resource.id);
  if (!record) { findings.push(`Canonical ${resource.kind} ${resource.id} has no destination-family record.`); continue; }
  if (record.deliveryMode !== expectedMode(resource)) findings.push(`${resource.id} delivery mode contradicts its canonical release state.`);
  const page = pageFor(resource);
  if (!fs.existsSync(page)) { findings.push(`${resource.id} has no generated canonical page.`); continue; }
  const html = fs.readFileSync(page, 'utf8');
  const state = resource.releaseState?.status || {};
  if (!resource.summary || !resource.maturity || !resource.evidence?.length || !resource.methodology?.length || !resource.limitations?.length) findings.push(`${resource.id} lacks substantive metadata.`);
  if (!resource.releaseState?.lastReviewedOrTested || !resource.releaseState?.nextReviewOrTrigger || !resource.releaseState?.permittedPublicLanguage) findings.push(`${resource.id} lacks release review metadata or permitted language.`);
  if (state.publication !== 'published' || state.interaction !== 'read-only') findings.push(`${resource.id} is not accurately represented as a published read-only destination.`);
  if (!html.includes(`data-resource-id="${resource.id}"`) || !html.includes('data-release-state=')) findings.push(`${resource.id} does not visibly render its canonical identity and release boundary.`);
  if (resource.kind === 'product' && (!(resource.architecture || []).length || !resource.implementationStatus || !(resource.documentation || []).length || !(resource.roadmap || []).length || !resource.licensing)) findings.push(`${resource.id} lacks a product architecture, implementation, documentation, roadmap, or licensing contract.`);
  if (resource.kind === 'service' && (!(resource.deliverables || []).length || !resource.timeline || !(resource.fit || []).length || state.commercial !== 'scoped' || !/written engagement/i.test(resource.releaseState?.permittedPublicLanguage || ''))) findings.push(`${resource.id} lacks a scoped service contract or written-engagement boundary.`);
  if (resource.kind === 'collection') {
    const collection = resource.collection || {};
    const members = allResources.filter((candidate) => (collection.kinds || []).includes(candidate.kind) && (!collection.pathPrefix || candidate.pathname.startsWith(collection.pathPrefix)) && candidate.id !== resource.id);
    if (!(collection.kinds || []).length || !collection.heading || !members.length) findings.push(`${resource.id} lacks a resolvable generated collection contract.`);
    if (!members.every((member) => html.includes(`href="${member.pathname}"`))) findings.push(`${resource.id} does not render every canonical collection member.`);
  }
  if (resource.kind === 'institutional' && ((resource.editorialSections || []).length < 4 || blocksFor(resource).length < 20 || state.access !== 'public')) findings.push(`${resource.id} lacks substantive public institutional-page depth.`);
  if (resource.kind === 'learningHub' && (!(resource.learningPaths || []).length || (state.access === 'unavailable' ? !/unavailable/i.test(resource.releaseState?.permittedPublicLanguage || '') : state.access !== 'public'))) findings.push(`${resource.id} lacks a learning path or accurate access boundary.`);
}
for (const id of records.keys()) if (!ids.has(id)) findings.push(`Registered record ${id} is not in the canonical destination-family estate.`);

const counts = Object.fromEntries(kinds.map((kind) => [kind === 'learningHub' ? 'learningHubs' : `${kind}s`, resources.filter((resource) => resource.kind === kind).length]));
const checks = {
  registerSchema: register.schema === 'aloha-ai-destination-family-evidence-register/1.0',
  exactCanonicalCoverage: resources.length === 40 && resources.length === records.size,
  uniqueRecords: records.size === (register.records || []).length,
  canonicalPages: resources.every((resource) => fs.existsSync(pageFor(resource))),
  substantiveMetadata: resources.every((resource) => resource.summary && resource.maturity && resource.evidence?.length && resource.methodology?.length && resource.limitations?.length),
  releaseMetadata: resources.every((resource) => resource.releaseState?.lastReviewedOrTested && resource.releaseState?.nextReviewOrTrigger && resource.releaseState?.permittedPublicLanguage),
  renderedBoundaries: resources.every((resource) => { const html = fs.readFileSync(pageFor(resource), 'utf8'); return html.includes(`data-resource-id="${resource.id}"`) && html.includes('data-release-state='); }),
  productContracts: resources.filter((resource) => resource.kind === 'product').every((resource) => resource.architecture?.length && resource.implementationStatus && resource.documentation?.length && resource.roadmap?.length && resource.licensing),
  serviceContracts: resources.filter((resource) => resource.kind === 'service').every((resource) => resource.deliverables?.length && resource.timeline && resource.fit?.length && resource.releaseState?.status?.commercial === 'scoped'),
  collectionContracts: resources.filter((resource) => resource.kind === 'collection').every((resource) => resource.collection?.kinds?.length && resource.collection?.heading),
  institutionalLearningContracts: resources.filter((resource) => resource.kind === 'institutional').every((resource) => (resource.editorialSections || []).length >= 4 && blocksFor(resource).length >= 20) && resources.filter((resource) => resource.kind === 'learningHub').every((resource) => resource.learningPaths?.length),
  noFindings: findings.length === 0
};
const report = {
  schema: 'aloha-ai-destination-family-evidence-evaluation/1.0', evaluatedAt: '2026-08-03',
  scope: register.scope, boundary: register.boundary,
  counts: { canonicalResources: resources.length, ...counts, unavailableProducts: resources.filter((r) => r.kind === 'product' && r.releaseState?.status?.access === 'unavailable').length, unavailableLearningHubs: resources.filter((r) => r.kind === 'learningHub' && r.releaseState?.status?.access === 'unavailable').length },
  checks, findings
};
for (const output of ['artifacts/destination-family-evidence-evaluation.json', 'api/destination-family-evidence-register.json']) {
  const target = path.join(root, output); fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, `${JSON.stringify(output.startsWith('api/') ? register : report, null, 2)}\n`);
}
console.log(`Destination-family evidence: ${Object.values(checks).filter(Boolean).length}/${Object.keys(checks).length} checks; ${resources.length} resources; ${counts.products} products; ${counts.services} services; ${counts.collections} collections; ${counts.institutionals} institutional; ${counts.learningHubs} learning hubs; ${findings.length} findings.`);
if (findings.length) { for (const finding of findings) console.error(`- ${finding}`); process.exit(1); }
