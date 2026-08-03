import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (file) => JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
const register = read('content/governance/use-case-learning-evidence-register.json');
const allResources = read('api/resources.json').resources;
const resources = allResources.filter((resource) =>
  resource.kind === 'useCase' ||
  (resource.kind === 'lesson' && resource.pathname.startsWith('/university/learn/'))
);
const findings = [];
const records = new Map();
const supportedModes = ['read-only-applied-stack', 'read-only-university-use-case', 'read-only-standalone-lesson'];

if (register.schema !== 'aloha-ai-use-case-learning-evidence-register/1.0') findings.push('Unsupported use-case and learning register schema.');
if (!register.version || !register.reviewedAt || !register.reviewedBy || !register.scope || !register.boundary) findings.push('Register provenance or boundary is incomplete.');
for (const record of register.records || []) {
  if (!record.resourceId || !supportedModes.includes(record.deliveryMode)) findings.push('Every record requires a resourceId and supported deliveryMode.');
  if (records.has(record.resourceId)) findings.push(`Duplicate use-case or learning record: ${record.resourceId}.`);
  records.set(record.resourceId, record);
}

const ids = new Set(resources.map((resource) => resource.id));
const pageFor = (resource) => path.join(root, `${resource.pathname.replace(/^\//, '') || 'index'}.html`);
const blocksFor = (resource) => (resource.editorialSections || []).flatMap((section) => section.blocks || []);
const expectedModeFor = (resource) => {
  if (resource.kind === 'lesson') return 'read-only-standalone-lesson';
  if (resource.pathname.startsWith('/stacks/')) return 'read-only-applied-stack';
  return 'read-only-university-use-case';
};

for (const resource of resources) {
  const record = records.get(resource.id);
  if (!record) { findings.push(`Canonical ${resource.kind} ${resource.id} has no use-case or learning record.`); continue; }
  if (record.deliveryMode !== expectedModeFor(resource)) findings.push(`${resource.id} delivery mode does not match its canonical family.`);
  if (!fs.existsSync(pageFor(resource))) { findings.push(`${resource.id} has no generated canonical page.`); continue; }
  const html = fs.readFileSync(pageFor(resource), 'utf8');
  const state = resource.releaseState?.status || {};
  const blocks = blocksFor(resource);
  if (!resource.summary || !resource.maturity || !resource.audience) findings.push(`${resource.id} lacks summary, maturity, or audience metadata.`);
  if (!resource.evidence?.length || !resource.methodology?.length || !resource.limitations?.length) findings.push(`${resource.id} lacks evidence, methodology, or limitations.`);
  if ((resource.editorialSections || []).length < 4 || blocks.length < 20) findings.push(`${resource.id} lacks substantive checked-in guidance depth.`);
  if (!resource.releaseState?.lastReviewedOrTested || !resource.releaseState?.nextReviewOrTrigger || !resource.releaseState?.permittedPublicLanguage) findings.push(`${resource.id} lacks release review metadata or permitted language.`);
  if (state.publication !== 'published' || state.access !== 'public' || state.interaction !== 'read-only') findings.push(`${resource.id} is not accurately released as a public read-only resource.`);
  if (!/publication does not certify ongoing maintenance, external delivery, or professional suitability/i.test(resource.releaseState?.permittedPublicLanguage || '')) findings.push(`${resource.id} permitted language does not preserve the publication boundary.`);
  if (!html.includes(`data-resource-id="${resource.id}"`) || !html.includes('data-release-state=')) findings.push(`${resource.id} does not render its canonical identity and release boundary.`);
  if (resource.kind === 'useCase' && !(resource.learningPaths || []).length) findings.push(`${resource.id} does not include an ordered use-case path.`);
  if (resource.kind === 'lesson' && !blocks.some((block) => ['list', 'table', 'code'].includes(block.type))) findings.push(`${resource.id} does not include a usable example, checklist, table, or prompt.`);
}
for (const id of records.keys()) if (!ids.has(id)) findings.push(`Registered record ${id} is not a canonical use case or standalone /university/learn lesson.`);

const useCases = resources.filter((resource) => resource.kind === 'useCase');
const lessons = resources.filter((resource) => resource.kind === 'lesson');
const checks = {
  registerSchema: register.schema === 'aloha-ai-use-case-learning-evidence-register/1.0',
  exactCanonicalCoverage: resources.length === 29 && resources.length === records.size,
  uniqueRecords: records.size === (register.records || []).length,
  canonicalPages: resources.every((resource) => fs.existsSync(pageFor(resource))),
  substantiveMetadata: resources.every((resource) => resource.summary && resource.maturity && resource.audience && resource.evidence?.length && resource.methodology?.length && resource.limitations?.length),
  contentDepth: resources.every((resource) => (resource.editorialSections || []).length >= 4 && blocksFor(resource).length >= 20),
  releaseMetadata: resources.every((resource) => resource.releaseState?.lastReviewedOrTested && resource.releaseState?.nextReviewOrTrigger && resource.releaseState?.permittedPublicLanguage),
  readOnlyBoundaries: resources.every((resource) => resource.releaseState?.status?.publication === 'published' && resource.releaseState?.status?.access === 'public' && resource.releaseState?.status?.interaction === 'read-only'),
  familyContracts: useCases.every((resource) => resource.learningPaths?.length) && lessons.every((resource) => blocksFor(resource).some((block) => ['list', 'table', 'code'].includes(block.type))),
  renderedBoundaries: resources.every((resource) => { const html = fs.readFileSync(pageFor(resource), 'utf8'); return html.includes(`data-resource-id="${resource.id}"`) && html.includes('data-release-state='); }),
  noFindings: findings.length === 0
};

const report = {
  schema: 'aloha-ai-use-case-learning-evidence-evaluation/1.0',
  evaluatedAt: '2026-08-02',
  scope: register.scope,
  boundary: register.boundary,
  counts: {
    canonicalResources: resources.length,
    useCases: useCases.length,
    appliedStacks: useCases.filter((resource) => resource.pathname.startsWith('/stacks/')).length,
    universityUseCases: useCases.filter((resource) => resource.pathname.startsWith('/university/use-cases/')).length,
    standaloneLessons: lessons.length,
    excludedCourseLessons: allResources.filter((resource) => resource.kind === 'lesson' && !resource.pathname.startsWith('/university/learn/')).length
  },
  checks,
  findings
};
for (const output of ['artifacts/use-case-learning-evidence-evaluation.json', 'api/use-case-learning-evidence-register.json']) {
  const target = path.join(root, output);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, `${JSON.stringify(output.startsWith('api/') ? register : report, null, 2)}\n`);
}
console.log(`Use-case and learning evidence: ${Object.values(checks).filter(Boolean).length}/${Object.keys(checks).length} checks; ${resources.length} resources; ${useCases.length} use cases; ${lessons.length} standalone lessons; ${findings.length} findings.`);
if (findings.length) { for (const finding of findings) console.error(`- ${finding}`); process.exit(1); }
