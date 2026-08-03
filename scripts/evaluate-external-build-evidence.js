import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (file) => JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
const register = read('content/governance/external-build-evidence-register.json');
const platform = read('content/platform/platform-resources.json');
const source = JSON.stringify(platform);
const findings = [];

if (register.schema !== 'aloha-ai-external-build-evidence-register/1.0') findings.push('Unsupported external-build register schema.');
if (!register.version || !register.reviewedAt || !register.reviewedBy || !register.scope || !register.boundary) findings.push('Register provenance or boundary is incomplete.');

const records = new Map();
for (const record of register.records || []) {
  if (!record.id || !record.publicName || !record.representationClass || !record.repository?.name || !record.requiredBoundary) findings.push('Every external-build record requires identity, class, repository evidence, and a boundary.');
  if (records.has(record.id)) findings.push(`Duplicate external-build record: ${record.id}.`);
  if (record.repository?.visibility !== 'private') findings.push(`Named external build ${record.id} is not governed as private.`);
  if (record.clientClaimAllowed !== false || record.continuousOperationClaimAllowed !== false || record.publicDestinationAllowed !== false) findings.push(`Named external build ${record.id} exceeds the current evidence boundary.`);
  records.set(record.id, record);
}

for (const record of records.values()) if (!source.includes(record.publicName)) findings.push(`Canonical Platform copy does not name registered build: ${record.publicName}.`);

const prohibited = [
  [/each of those is SL0\. A client had a specific intelligence need/i, 'Named builds cannot be represented collectively as client commissions.'],
  [/a custom system was designed, built, and deployed\. SL0 builds span/i, 'Named builds cannot be represented collectively as deployed systems.'],
  [/you get a URL\. It runs\. It updates\. It does work/i, 'Named builds cannot imply public access or continuous operation.'],
  [/the builds in the portfolio[\s\S]{0,900}doing real work from day one/i, 'Named portfolio evidence cannot imply continuous production operation.']
];
for (const [pattern, message] of prohibited) if (pattern.test(source)) findings.push(message);

const checks = {
  registerSchema: register.schema === 'aloha-ai-external-build-evidence-register/1.0',
  exactNamedBuildCoverage: records.size === 6 && [...records.values()].every((record) => source.includes(record.publicName)),
  uniqueRecords: records.size === (register.records || []).length,
  repositoryEvidence: [...records.values()].every((record) => record.repository?.confirmed && record.repository?.name),
  privateBoundary: [...records.values()].every((record) => record.repository?.visibility === 'private' && record.publicDestinationAllowed === false),
  relationshipBoundary: [...records.values()].every((record) => record.clientClaimAllowed === false),
  operationBoundary: [...records.values()].every((record) => record.continuousOperationClaimAllowed === false),
  deploymentDisposition: [...records.values()].every((record) => record.deployment && typeof record.deployment.confirmed === 'boolean' && record.deployment.observedState),
  boundedCanonicalCopy: prohibited.every(([pattern]) => !pattern.test(source)),
  noFindings: findings.length === 0
};

const report = {
  schema: 'aloha-ai-external-build-evidence-evaluation/1.0',
  evaluatedAt: '2026-08-02',
  scope: register.scope,
  boundary: register.boundary,
  counts: {
    namedBuilds: records.size,
    confirmedPrivateRepositories: [...records.values()].filter((record) => record.repository?.confirmed).length,
    confirmedVercelProjects: [...records.values()].filter((record) => record.deployment?.confirmed).length,
    publicDestinations: [...records.values()].filter((record) => record.publicDestinationAllowed).length
  },
  checks,
  findings
};

const output = path.join(root, 'artifacts', 'external-build-evidence-evaluation.json');
fs.mkdirSync(path.dirname(output), { recursive: true });
fs.writeFileSync(output, `${JSON.stringify(report, null, 2)}\n`);
console.log(`External build evidence: ${Object.values(checks).filter(Boolean).length}/${Object.keys(checks).length} checks; ${records.size} named builds; ${findings.length} findings.`);
if (findings.length) {
  for (const finding of findings) console.error(`- ${finding}`);
  process.exit(1);
}
