import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (file) => JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
const register = read('content/governance/build-evidence-register.json');
const resources = read('api/resources.json').resources;
const builds = read('content/site/home-and-builds.json').find((item) => item.id === 'builds');
const items = builds?.buildsExperience?.items || [];
const findings = [];

if (register.schema !== 'aloha-ai-build-evidence-register/1.0') findings.push('Unsupported build-evidence register schema.');
if (!register.version || !register.reviewedAt || !register.reviewedBy || !register.scope || !register.boundary) findings.push('Register provenance or boundary is incomplete.');
if (!items.length) findings.push('The public Builds experience has no registered items.');

const records = new Map();
for (const record of register.records || []) {
  if (!record.resourceId || !record.evidenceClass || !record.requiredBoundary) findings.push('Every build-evidence record requires resourceId, evidenceClass, and requiredBoundary.');
  if (records.has(record.resourceId)) findings.push(`Duplicate build-evidence record: ${record.resourceId}.`);
  records.set(record.resourceId, record);
}

const itemIds = items.map((item) => item.resourceId);
for (const item of items) {
  const resource = resources.find((candidate) => candidate.id === item.resourceId);
  if (!resource) findings.push(`Build item ${item.resourceId} has no canonical resource.`);
  if (!records.has(item.resourceId)) findings.push(`Build item ${item.resourceId} has no evidence record.`);
  if (!item.title || !item.plain || !item.result || !item.action) findings.push(`Build item ${item.resourceId} has incomplete public copy.`);
  if (!resource?.pathname?.startsWith('/')) findings.push(`Build item ${item.resourceId} lacks a canonical internal destination.`);
  if (!resource?.maturity) findings.push(`Build item ${item.resourceId} lacks governed maturity.`);
  if (!Array.isArray(resource?.evidence) || !resource.evidence.length) findings.push(`Build item ${item.resourceId} lacks canonical evidence.`);
  if (!Array.isArray(resource?.limitations) || !resource.limitations.length) findings.push(`Build item ${item.resourceId} lacks canonical limitations.`);
}
for (const resourceId of records.keys()) if (!itemIds.includes(resourceId)) findings.push(`Evidence record ${resourceId} is not represented in the Builds experience.`);
if (new Set(itemIds).size !== itemIds.length) findings.push('The Builds experience contains duplicate resource IDs.');

const serializedBuildCopy = JSON.stringify({ items, editorialSections: builds?.editorialSections || [] });
const prohibited = [
  [/see whether a source exists/i, 'Citation Verifier cannot claim to determine source existence.'],
  [/citation-existence and source-checking workflows/i, 'Citation Verifier portfolio copy cannot imply source retrieval or verification.'],
  [/workspace integration (is )?(live|available|working)/i, 'Workspace integration is not available.'],
  [/(accredited|credit-bearing) continuing education/i, 'Continuing Education is not accredited or credit-bearing.']
];
for (const [pattern, message] of prohibited) if (pattern.test(serializedBuildCopy)) findings.push(message);

const checks = {
  registerSchema: register.schema === 'aloha-ai-build-evidence-register/1.0',
  exactCardCoverage: items.length > 0 && items.length === records.size,
  uniqueCards: new Set(itemIds).size === itemIds.length,
  canonicalResources: items.every((item) => resources.some((resource) => resource.id === item.resourceId)),
  canonicalDestinations: items.every((item) => resources.find((resource) => resource.id === item.resourceId)?.pathname?.startsWith('/')),
  maturityPresent: items.every((item) => resources.find((resource) => resource.id === item.resourceId)?.maturity),
  evidencePresent: items.every((item) => resources.find((resource) => resource.id === item.resourceId)?.evidence?.length),
  limitationsPresent: items.every((item) => resources.find((resource) => resource.id === item.resourceId)?.limitations?.length),
  boundedCopy: prohibited.every(([pattern]) => !pattern.test(serializedBuildCopy)),
  noFindings: findings.length === 0
};

const report = {
  schema: 'aloha-ai-build-evidence-evaluation/1.0',
  evaluatedAt: '2026-08-02',
  scope: register.scope,
  boundary: register.boundary,
  counts: { portfolioEntries: items.length, registeredRecords: records.size, canonicalDestinations: items.filter((item) => resources.find((resource) => resource.id === item.resourceId)?.pathname?.startsWith('/')).length },
  checks,
  findings
};
const output = path.join(root, 'artifacts', 'build-evidence-evaluation.json');
fs.mkdirSync(path.dirname(output), { recursive: true });
fs.writeFileSync(output, `${JSON.stringify(report, null, 2)}\n`);
console.log(`Build evidence: ${Object.values(checks).filter(Boolean).length}/${Object.keys(checks).length} checks; ${items.length} portfolio entries; ${findings.length} findings.`);
if (findings.length) {
  for (const finding of findings) console.error(`- ${finding}`);
  process.exit(1);
}
