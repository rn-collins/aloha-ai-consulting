import fs from 'node:fs';

const registerPath = 'content/governance/satellite-system-evidence-register.json';
const patchPath = 'patch-github-pages.js';
const register = JSON.parse(fs.readFileSync(registerPath, 'utf8'));
const patch = fs.readFileSync(patchPath, 'utf8');
const findings = [];
const expectedIds = new Set([
  'platform-suppression-monitor-legacy',
  'dea-scheduling-monitor-legacy',
  'ai-governance-tracker-legacy'
]);

if (!register.boundary || !register.reviewedAt || !register.owner) findings.push('Register governance fields are incomplete.');
if (register.records.length !== expectedIds.size) findings.push(`Record count is ${register.records.length}/${expectedIds.size}.`);
if (new Set(register.records.map(({ id }) => id)).size !== register.records.length) findings.push('Record IDs are not unique.');

for (const record of register.records) {
  if (!expectedIds.delete(record.id)) findings.push(`Unexpected or duplicate record: ${record.id}`);
  if (!record.name || !record.historicalHostname || !record.evidence?.includes(patchPath)) findings.push(`${record.id}: historical evidence is incomplete.`);
  if (record.currentProjectConfirmed !== false || record.currentDeploymentConfirmed !== false) findings.push(`${record.id}: current project/deployment must remain unconfirmed.`);
  if (record.publicDestinationAllowed !== false || record.operatingClaimsAllowed !== false) findings.push(`${record.id}: access or operating claims exceed evidence.`);
  if (record.disposition !== 'historical-reference-only') findings.push(`${record.id}: disposition is not historical-reference-only.`);
}
if (expectedIds.size) findings.push(`Missing records: ${[...expectedIds].join(', ')}`);

const prohibited = [
  [/Live automated system tracking/i, 'legacy live-automation claim'],
  [/deployed infrastructure, not a prototype/i, 'legacy deployed-infrastructure claim'],
  [/automated primary-source intelligence, not a prototype/i, 'legacy automated-intelligence claim'],
  [/execSync\(['"]git (?:add|commit|push)/i, 'self-publishing git command']
];
for (const [pattern, label] of prohibited) if (pattern.test(patch)) findings.push(`Patch utility retains ${label}.`);

const checks = {
  exactRecordCoverage: register.records.length === 3 && expectedIds.size === 0,
  uniqueIds: new Set(register.records.map(({ id }) => id)).size === 3,
  governedBoundary: Boolean(register.boundary && register.reviewedAt && register.owner),
  historicalEvidence: register.records.every((record) => record.evidence?.includes(patchPath)),
  projectBoundary: register.records.every((record) => record.currentProjectConfirmed === false),
  deploymentBoundary: register.records.every((record) => record.currentDeploymentConfirmed === false),
  destinationBoundary: register.records.every((record) => record.publicDestinationAllowed === false),
  operatingBoundary: register.records.every((record) => record.operatingClaimsAllowed === false),
  prohibitedClaimsAbsent: prohibited.slice(0, 3).every(([pattern]) => !pattern.test(patch)),
  noSelfPublishing: !prohibited[3][0].test(patch)
};

const evaluation = {
  schema: 'aloha-ai-satellite-system-evaluation/1.0',
  evaluatedAt: new Date().toISOString(),
  boundary: register.boundary,
  counts: {
    records: register.records.length,
    confirmedProjects: register.records.filter(({ currentProjectConfirmed }) => currentProjectConfirmed).length,
    confirmedDeployments: register.records.filter(({ currentDeploymentConfirmed }) => currentDeploymentConfirmed).length,
    checksPassed: Object.values(checks).filter(Boolean).length,
    checksTotal: Object.keys(checks).length,
    findings: findings.length
  },
  checks,
  findings
};

fs.mkdirSync('artifacts', { recursive: true });
fs.writeFileSync('artifacts/satellite-system-evidence-evaluation.json', `${JSON.stringify(evaluation, null, 2)}\n`);
if (findings.length || Object.values(checks).some((value) => !value)) {
  console.error(`Satellite-system evidence failed with ${findings.length} finding(s).`);
  for (const finding of findings) console.error(`- ${finding}`);
  process.exit(1);
}
console.log(`Satellite-system evidence passed ${evaluation.counts.checksPassed}/${evaluation.counts.checksTotal} checks across ${evaluation.counts.records} records.`);
