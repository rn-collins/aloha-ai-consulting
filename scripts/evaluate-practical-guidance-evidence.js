import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (file) => JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
const register = read('content/governance/practical-guidance-evidence-register.json');
const governedKinds = ['playbook', 'template', 'toolGuide'];
const resources = read('api/resources.json').resources.filter((resource) => governedKinds.includes(resource.kind));
const findings = [];
const records = new Map();

if (register.schema !== 'aloha-ai-practical-guidance-evidence-register/1.0') findings.push('Unsupported practical-guidance register schema.');
if (!register.version || !register.reviewedAt || !register.reviewedBy || !register.scope || !register.boundary) findings.push('Register provenance or boundary is incomplete.');
for (const record of register.records || []) {
  if (!record.resourceId || !['read-only-playbook', 'read-only-template', 'read-only-tool-guide', 'browser-local-template'].includes(record.deliveryMode)) findings.push('Every record requires a resourceId and supported deliveryMode.');
  if (records.has(record.resourceId)) findings.push(`Duplicate practical-guidance record: ${record.resourceId}.`);
  records.set(record.resourceId, record);
}

const ids = new Set(resources.map((resource) => resource.id));
const pageFor = (resource) => path.join(root, `${resource.pathname.replace(/^\//, '') || 'index'}.html`);
const blocksFor = (resource) => (resource.editorialSections || []).flatMap((section) => section.blocks || []);
for (const resource of resources) {
  const record = records.get(resource.id);
  if (!record) { findings.push(`Canonical ${resource.kind} ${resource.id} has no practical-guidance record.`); continue; }
  const expectedMode = resource.id === 'citation-verifier-lab-kit' ? 'browser-local-template' : `read-only-${resource.kind === 'toolGuide' ? 'tool-guide' : resource.kind}`;
  if (record.deliveryMode !== expectedMode) findings.push(`${resource.id} delivery mode does not match its canonical kind and delivery contract.`);
  if (!fs.existsSync(pageFor(resource))) { findings.push(`${resource.id} has no generated canonical page.`); continue; }
  const html = fs.readFileSync(pageFor(resource), 'utf8');
  const state = resource.releaseState?.status || {};
  const blocks = blocksFor(resource);
  if (!resource.summary || !resource.maturity || !resource.audience) findings.push(`${resource.id} lacks summary, maturity, or audience metadata.`);
  if (!resource.evidence?.length || !resource.methodology?.length || !resource.limitations?.length) findings.push(`${resource.id} lacks evidence, methodology, or limitations.`);
  if ((resource.editorialSections || []).length < 3 || (resource.downloadTemplate ? !resource.downloadTemplate.content : blocks.length < 5)) findings.push(`${resource.id} lacks substantive checked-in guidance depth.`);
  if (!resource.releaseState?.lastReviewedOrTested || !resource.releaseState?.nextReviewOrTrigger || !resource.releaseState?.permittedPublicLanguage) findings.push(`${resource.id} lacks release review metadata or permitted language.`);
  if (state.publication !== 'published' || state.access !== 'public' || (resource.downloadTemplate ? state.interaction !== 'working' : state.interaction !== 'read-only')) findings.push(`${resource.id} is not accurately released for its public delivery mode.`);
  const languagePattern = resource.downloadTemplate ? /browser-local downloadable template.*not submitted, graded, or credentialed/i : /publication does not certify ongoing maintenance, external delivery, or professional suitability/i;
  if (!languagePattern.test(resource.releaseState?.permittedPublicLanguage || '')) findings.push(`${resource.id} permitted language does not preserve the publication boundary.`);
  if (!html.includes(`data-resource-id="${resource.id}"`) || !html.includes('data-release-state=')) findings.push(`${resource.id} does not render its canonical identity and release boundary.`);
  if (resource.kind === 'template' && !resource.downloadTemplate?.content && !blocks.some((block) => ['code', 'table'].includes(block.type))) findings.push(`${resource.id} does not include a usable template, worksheet, prompt, or structured table block.`);
  if (resource.kind === 'playbook' && !(resource.learningPaths || []).length) findings.push(`${resource.id} does not include an ordered practical path.`);
  if (resource.kind === 'toolGuide' && !/confirm|recheck|change|current|pricing|features/i.test([...(resource.limitations || []), ...(resource.editorialIntro || [])].join(' '))) findings.push(`${resource.id} does not disclose the time-sensitive vendor-information boundary.`);
}
for (const id of records.keys()) if (!ids.has(id)) findings.push(`Registered practical-guidance record ${id} is not a canonical playbook, template, or tool guide.`);

const checks = {
  registerSchema: register.schema === 'aloha-ai-practical-guidance-evidence-register/1.0',
  exactCanonicalCoverage: resources.length > 0 && resources.length === records.size,
  uniqueRecords: records.size === (register.records || []).length,
  canonicalPages: resources.every((resource) => fs.existsSync(pageFor(resource))),
  substantiveMetadata: resources.every((resource) => resource.summary && resource.maturity && resource.audience && resource.evidence?.length && resource.methodology?.length && resource.limitations?.length),
  guidanceDepth: resources.every((resource) => (resource.editorialSections || []).length >= 3 && (resource.downloadTemplate ? Boolean(resource.downloadTemplate.content) : blocksFor(resource).length >= 5)),
  releaseMetadata: resources.every((resource) => resource.releaseState?.lastReviewedOrTested && resource.releaseState?.nextReviewOrTrigger && resource.releaseState?.permittedPublicLanguage),
  deliveryBoundaries: resources.every((resource) => resource.releaseState?.status?.publication === 'published' && resource.releaseState?.status?.access === 'public' && (resource.downloadTemplate ? resource.releaseState?.status?.interaction === 'working' : resource.releaseState?.status?.interaction === 'read-only')),
  familyContracts: resources.every((resource) => resource.kind !== 'template' || resource.downloadTemplate?.content || blocksFor(resource).some((block) => ['code', 'table'].includes(block.type))) && resources.every((resource) => resource.kind !== 'playbook' || resource.learningPaths?.length),
  renderedBoundaries: resources.every((resource) => { const html = fs.readFileSync(pageFor(resource), 'utf8'); return html.includes(`data-resource-id="${resource.id}"`) && html.includes('data-release-state='); }),
  noFindings: findings.length === 0
};

const report = {
  schema: 'aloha-ai-practical-guidance-evidence-evaluation/1.0',
  evaluatedAt: '2026-08-02',
  scope: register.scope,
  boundary: register.boundary,
  counts: { canonicalResources: resources.length, playbooks: resources.filter((resource) => resource.kind === 'playbook').length, templates: resources.filter((resource) => resource.kind === 'template').length, toolGuides: resources.filter((resource) => resource.kind === 'toolGuide').length },
  checks,
  findings
};
for (const output of ['artifacts/practical-guidance-evidence-evaluation.json', 'api/practical-guidance-evidence-register.json']) {
  const target = path.join(root, output);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, `${JSON.stringify(output.startsWith('api/') ? register : report, null, 2)}\n`);
}
console.log(`Practical guidance evidence: ${Object.values(checks).filter(Boolean).length}/${Object.keys(checks).length} checks; ${resources.length} resources; ${report.counts.playbooks} playbooks; ${report.counts.templates} templates; ${report.counts.toolGuides} tool guides; ${findings.length} findings.`);
if (findings.length) { for (const finding of findings) console.error(`- ${finding}`); process.exit(1); }
