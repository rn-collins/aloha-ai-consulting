import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (file) => JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
const register = read('content/governance/monitor-research-evidence-register.json');
const resources = read('api/resources.json').resources.filter((resource) => ['monitor', 'research'].includes(resource.kind));
const monitorOperations = read('api/monitor-operations.json');
const findings = [];
const records = new Map();
const modes = new Set(['maintained-manual', 'dated-demonstration', 'research-publication']);

if (register.schema !== 'aloha-ai-monitor-research-evidence-register/1.0') findings.push('Unsupported monitor/research register schema.');
if (!register.version || !register.reviewedAt || !register.reviewedBy || !register.scope || !register.boundary) findings.push('Register provenance or boundary is incomplete.');
for (const record of register.records || []) {
  if (!record.resourceId || !modes.has(record.deliveryMode)) findings.push('Every record requires a resourceId and supported deliveryMode.');
  if (records.has(record.resourceId)) findings.push(`Duplicate monitor/research record: ${record.resourceId}.`);
  records.set(record.resourceId, record);
}

const canonicalIds = new Set(resources.map((resource) => resource.id));
const operationsById = new Map((monitorOperations.maintained || []).map((record) => [record.id, record]));
for (const resource of resources) {
  const record = records.get(resource.id);
  if (!record) { findings.push(`Canonical ${resource.kind} ${resource.id} has no evidence record.`); continue; }
  const htmlPath = path.join(root, `${resource.pathname.replace(/^\//, '') || 'index'}.html`);
  if (!fs.existsSync(htmlPath)) { findings.push(`${resource.id} has no generated canonical page.`); continue; }
  const html = fs.readFileSync(htmlPath, 'utf8');
  const state = resource.releaseState?.status || {};
  if (!resource.summary || !resource.maturity || !resource.evidence?.length || !resource.methodology?.length || !resource.limitations?.length) findings.push(`${resource.id} lacks substantive evidence metadata.`);
  if (!resource.releaseState?.lastReviewedOrTested || !resource.releaseState?.nextReviewOrTrigger || !resource.releaseState?.permittedPublicLanguage) findings.push(`${resource.id} lacks release review metadata or permitted language.`);
  if (!html.includes(`data-resource-id="${resource.id}"`) || !html.includes('data-release-state=')) findings.push(`${resource.id} does not render its canonical release boundary.`);

  if (record.deliveryMode === 'maintained-manual') {
    const operations = operationsById.get(resource.id);
    if (resource.kind !== 'monitor' || state.maintenance !== 'maintained') findings.push(`${resource.id} is registered maintained-manual without maintained monitor state.`);
    if (!operations || !operations.owner || !operations.reviewer || !operations.cadence || !operations.lastSuccessfulReview || !operations.nextScheduledReview || !operations.staleAfter || !operations.requiredSources?.length || !operations.runs?.length) findings.push(`${resource.id} lacks a complete manual operating record.`);
    if (!/manually reviewed/i.test(resource.releaseState.permittedPublicLanguage) || !/stated as-of date|coverage boundary/i.test(resource.releaseState.permittedPublicLanguage)) findings.push(`${resource.id} permitted language lacks manual-review and freshness boundaries.`);
  } else if (record.deliveryMode === 'dated-demonstration') {
    if (resource.kind !== 'monitor' || state.maintenance !== 'dated' || operationsById.has(resource.id)) findings.push(`${resource.id} is not bounded as a dated, unmaintained demonstration.`);
    if (!/ongoing maintenance and currentness are not certified|access or delivery path is unavailable/i.test(resource.releaseState.permittedPublicLanguage)) findings.push(`${resource.id} does not disclaim currentness or present delivery.`);
  } else {
    if (resource.kind !== 'research' || state.maintenance !== 'not-applicable' || state.interaction !== 'read-only') findings.push(`${resource.id} is not bounded as a read-only research publication.`);
    if (!/publication does not certify ongoing maintenance/i.test(resource.releaseState.permittedPublicLanguage)) findings.push(`${resource.id} does not preserve the publication-versus-maintenance boundary.`);
  }
}
for (const id of records.keys()) if (!canonicalIds.has(id)) findings.push(`Registered monitor/research record ${id} is not canonical in this family.`);

const maintained = resources.filter((resource) => records.get(resource.id)?.deliveryMode === 'maintained-manual');
const demonstrations = resources.filter((resource) => records.get(resource.id)?.deliveryMode === 'dated-demonstration');
const research = resources.filter((resource) => records.get(resource.id)?.deliveryMode === 'research-publication');
const checks = {
  registerSchema: register.schema === 'aloha-ai-monitor-research-evidence-register/1.0',
  exactCanonicalCoverage: resources.length > 0 && resources.length === records.size,
  uniqueRecords: records.size === (register.records || []).length,
  canonicalPages: resources.every((resource) => fs.existsSync(path.join(root, `${resource.pathname.replace(/^\//, '') || 'index'}.html`))),
  substantiveMetadata: resources.every((resource) => resource.summary && resource.maturity && resource.evidence?.length && resource.methodology?.length && resource.limitations?.length),
  releaseMetadata: resources.every((resource) => resource.releaseState?.lastReviewedOrTested && resource.releaseState?.nextReviewOrTrigger && resource.releaseState?.permittedPublicLanguage),
  maintainedOperatingContracts: maintained.every((resource) => { const operation = operationsById.get(resource.id); return resource.releaseState.status.maintenance === 'maintained' && operation?.requiredSources?.length && operation?.runs?.length && operation.owner && operation.reviewer && operation.cadence && operation.staleAfter; }),
  demonstrationBoundaries: demonstrations.every((resource) => resource.releaseState.status.maintenance === 'dated' && !operationsById.has(resource.id) && /ongoing maintenance and currentness are not certified|access or delivery path is unavailable/i.test(resource.releaseState.permittedPublicLanguage)),
  researchPublicationBoundaries: research.every((resource) => resource.kind === 'research' && resource.releaseState.status.maintenance === 'not-applicable' && resource.releaseState.status.interaction === 'read-only' && /publication does not certify ongoing maintenance/i.test(resource.releaseState.permittedPublicLanguage)),
  renderedBoundaries: resources.every((resource) => fs.readFileSync(path.join(root, `${resource.pathname.replace(/^\//, '') || 'index'}.html`), 'utf8').includes('data-release-state=')),
  noFindings: findings.length === 0
};

const report = {
  schema: 'aloha-ai-monitor-research-evidence-evaluation/1.0',
  evaluatedAt: '2026-08-02',
  scope: register.scope,
  boundary: register.boundary,
  counts: { canonicalResources: resources.length, monitors: resources.filter((resource) => resource.kind === 'monitor').length, researchPublications: resources.filter((resource) => resource.kind === 'research').length, maintainedManual: maintained.length, datedDemonstrations: demonstrations.length, readOnlyResearch: research.length },
  checks,
  findings
};
for (const output of ['artifacts/monitor-research-evidence-evaluation.json', 'api/monitor-research-evidence-register.json']) {
  const target = path.join(root, output); fs.mkdirSync(path.dirname(target), { recursive: true }); fs.writeFileSync(target, `${JSON.stringify(output.startsWith('api/') ? register : report, null, 2)}\n`);
}
console.log(`Monitor/research evidence: ${Object.values(checks).filter(Boolean).length}/${Object.keys(checks).length} checks; ${resources.length} resources; ${maintained.length} maintained manual; ${demonstrations.length} dated demonstrations; ${research.length} research publications; ${findings.length} findings.`);
if (findings.length) { for (const finding of findings) console.error(`- ${finding}`); process.exit(1); }
