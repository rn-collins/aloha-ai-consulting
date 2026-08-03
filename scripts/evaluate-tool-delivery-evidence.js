import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (file) => JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
const register = read('content/governance/tool-delivery-evidence-register.json');
const resources = read('api/resources.json').resources.filter((resource) => ['tool', 'assessment'].includes(resource.kind));
const findings = [];
const records = new Map();

if (register.schema !== 'aloha-ai-tool-delivery-evidence-register/1.0') findings.push('Unsupported tool-delivery register schema.');
if (!register.version || !register.reviewedAt || !register.reviewedBy || !register.scope || !register.boundary) findings.push('Register provenance or boundary is incomplete.');
for (const record of register.records || []) {
  if (!record.resourceId || !['browser-local', 'demonstration-only', 'reference-only'].includes(record.deliveryMode)) findings.push('Every record requires a resourceId and supported deliveryMode.');
  if (records.has(record.resourceId)) findings.push(`Duplicate tool-delivery record: ${record.resourceId}.`);
  records.set(record.resourceId, record);
}

const ids = new Set(resources.map((resource) => resource.id));
for (const resource of resources) {
  const record = records.get(resource.id);
  if (!record) { findings.push(`Canonical ${resource.kind} ${resource.id} has no delivery record.`); continue; }
  const htmlPath = path.join(root, `${resource.pathname.replace(/^\//, '') || 'index'}.html`);
  if (!fs.existsSync(htmlPath)) { findings.push(`${resource.id} has no generated canonical page.`); continue; }
  const html = fs.readFileSync(htmlPath, 'utf8');
  const state = resource.releaseState?.status || {};
  if (!resource.summary || !resource.maturity || !resource.implementationStatus) findings.push(`${resource.id} lacks summary, maturity, or implementation status.`);
  if (!resource.evidence?.length || !resource.methodology?.length || !resource.limitations?.length) findings.push(`${resource.id} lacks evidence, methodology, or limitations.`);
  if (!resource.releaseState?.lastReviewedOrTested || !resource.releaseState?.nextReviewOrTrigger || !resource.releaseState?.permittedPublicLanguage) findings.push(`${resource.id} lacks release review metadata or permitted language.`);
  if (!html.includes(`data-resource-id="${resource.id}"`)) findings.push(`${resource.id} canonical page does not identify its resource record.`);
  if (!html.includes('data-release-state=')) findings.push(`${resource.id} canonical page does not render its release boundary.`);
  if (record.deliveryMode === 'browser-local') {
    if (state.interaction !== 'working' || state.access !== 'public') findings.push(`${resource.id} is registered browser-local without working/public release state.`);
    if (!/<form\b/.test(html) && !/<button\b/.test(html)) findings.push(`${resource.id} lacks a checked-in primary form or button contract.`);
    if (!resource.demo && !resource.assessment) findings.push(`${resource.id} lacks an input/output, demo, or scoring contract.`);
    if (!/browser-local|browser-only/i.test(resource.releaseState.permittedPublicLanguage)) findings.push(`${resource.id} permitted language does not preserve the browser-local boundary.`);
  } else if (record.deliveryMode === 'demonstration-only') {
    if (state.interaction !== 'demonstration' || state.access !== 'public') findings.push(`${resource.id} demonstration-only state is not accurately bounded.`);
    if (/<form\b/.test(html) || /<button\b/.test(html)) findings.push(`${resource.id} demonstration-only page unexpectedly exposes an interactive control.`);
    if (!/browser-local tool/i.test(resource.releaseState.permittedPublicLanguage)) findings.push(`${resource.id} permitted language does not preserve the local demonstration boundary.`);
  } else {
    if (state.access !== 'unavailable' || state.interaction === 'working') findings.push(`${resource.id} reference-only state implies present interactive access.`);
    if (/<form\b/.test(html)) findings.push(`${resource.id} reference-only page unexpectedly exposes a form.`);
    if (!/access or delivery path is unavailable/i.test(resource.releaseState.permittedPublicLanguage)) findings.push(`${resource.id} does not state that interactive delivery is unavailable.`);
  }
}
for (const id of records.keys()) if (!ids.has(id)) findings.push(`Registered tool-delivery record ${id} is not a canonical tool or assessment.`);

const interactive = resources.filter((resource) => records.get(resource.id)?.deliveryMode === 'browser-local');
const demonstrations = resources.filter((resource) => records.get(resource.id)?.deliveryMode === 'demonstration-only');
const reference = resources.filter((resource) => records.get(resource.id)?.deliveryMode === 'reference-only');
const checks = {
  registerSchema: register.schema === 'aloha-ai-tool-delivery-evidence-register/1.0',
  exactCanonicalCoverage: resources.length > 0 && resources.length === records.size,
  uniqueRecords: records.size === (register.records || []).length,
  canonicalPages: resources.every((resource) => fs.existsSync(path.join(root, `${resource.pathname.replace(/^\//, '') || 'index'}.html`))),
  substantiveMetadata: resources.every((resource) => resource.summary && resource.maturity && resource.implementationStatus && resource.evidence?.length && resource.methodology?.length && resource.limitations?.length),
  releaseMetadata: resources.every((resource) => resource.releaseState?.lastReviewedOrTested && resource.releaseState?.nextReviewOrTrigger && resource.releaseState?.permittedPublicLanguage),
  interactiveContracts: interactive.every((resource) => { const html = fs.readFileSync(path.join(root, `${resource.pathname.replace(/^\//, '')}.html`), 'utf8'); return resource.releaseState.status.interaction === 'working' && resource.releaseState.status.access === 'public' && (/<form\b/.test(html) || /<button\b/.test(html)) && (resource.demo || resource.assessment); }),
  demonstrationBoundaries: demonstrations.every((resource) => { const html = fs.readFileSync(path.join(root, `${resource.pathname.replace(/^\//, '')}.html`), 'utf8'); return resource.releaseState.status.interaction === 'demonstration' && resource.releaseState.status.access === 'public' && !/<form\b/.test(html) && !/<button\b/.test(html); }),
  referenceBoundaries: reference.every((resource) => { const html = fs.readFileSync(path.join(root, `${resource.pathname.replace(/^\//, '')}.html`), 'utf8'); return resource.releaseState.status.access === 'unavailable' && resource.releaseState.status.interaction !== 'working' && !/<form\b/.test(html); }),
  renderedBoundaries: resources.every((resource) => fs.readFileSync(path.join(root, `${resource.pathname.replace(/^\//, '')}.html`), 'utf8').includes('data-release-state=')),
  noFindings: findings.length === 0
};

const report = {
  schema: 'aloha-ai-tool-delivery-evidence-evaluation/1.0',
  evaluatedAt: '2026-08-02',
  scope: register.scope,
  boundary: register.boundary,
  counts: { canonicalResources: resources.length, tools: resources.filter((resource) => resource.kind === 'tool').length, assessments: resources.filter((resource) => resource.kind === 'assessment').length, browserLocal: interactive.length, demonstrationOnly: demonstrations.length, referenceOnly: reference.length },
  checks,
  findings
};
for (const output of ['artifacts/tool-delivery-evidence-evaluation.json', 'api/tool-delivery-evidence-register.json']) {
  const target = path.join(root, output); fs.mkdirSync(path.dirname(target), { recursive: true }); fs.writeFileSync(target, `${JSON.stringify(output.startsWith('api/') ? register : report, null, 2)}\n`);
}
console.log(`Tool delivery evidence: ${Object.values(checks).filter(Boolean).length}/${Object.keys(checks).length} checks; ${resources.length} resources; ${interactive.length} browser-local; ${demonstrations.length} demonstration-only; ${reference.length} reference-only; ${findings.length} findings.`);
if (findings.length) { for (const finding of findings) console.error(`- ${finding}`); process.exit(1); }
