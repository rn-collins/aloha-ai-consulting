import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (file) => JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
const register = read('content/governance/cross-practice-estate-register.json');
const platform = read('content/platform/platform-resources.json');
const practice = platform.find((resource) => resource.id === 'aloha-ai-practice');
const source = JSON.stringify(practice || {});
const findings = [];

if (register.schema !== 'aloha-ai-cross-practice-estate-register/1.0') findings.push('Unsupported cross-practice estate schema.');
if (!register.version || !register.reviewedAt || !register.reviewedBy || !register.scope || !register.boundary) findings.push('Register provenance or boundary is incomplete.');
if (!practice) findings.push('Canonical Practice resource is missing.');

const records = new Map();
for (const record of register.records || []) {
  if (!record.id || !record.publicName || !record.relationship || !record.requiredBoundary) findings.push('Every estate record requires identity, relationship, and boundary.');
  if (records.has(record.id)) findings.push(`Duplicate cross-practice record: ${record.id}.`);
  if (record.metricClaimsAllowed !== false || record.launchClaimsAllowed !== false) findings.push(`Cross-practice record ${record.id} exceeds the current evidence boundary.`);
  if (record.publicDestination && !record.publicDestination.startsWith('/') && !record.publicDestination.startsWith('https://')) findings.push(`Invalid public destination for ${record.id}.`);
  records.set(record.id, record);
}

for (const record of records.values()) if (!source.includes(record.publicName)) findings.push(`Canonical Practice copy does not name registered estate record: ${record.publicName}.`);

const prohibited = [
  [/Twenty-three live builds/i, 'Practice copy cannot publish an unevidenced live-build total.'],
  [/Seven documented positions in 1L year/i, 'Practice copy cannot publish an unevidenced position total.'],
  [/2,862 connections|207 cold replies/i, 'Practice copy cannot publish unversioned account metrics.'],
  [/Launching November 2026|Every Thursday:/i, 'Practice copy cannot promise an unsupported newsletter date or cadence.'],
  [/Unregulated will build the editorial authority/i, 'Retired editorial branding cannot remain a future delivery claim.'],
  [/Full framework at nsag-site\.vercel\.app/i, 'A plain-text hostname cannot masquerade as an inspectable governed destination.']
];
for (const [pattern, message] of prohibited) if (pattern.test(source)) findings.push(message);

const nsag = records.get('nsag');
const checks = {
  registerSchema: register.schema === 'aloha-ai-cross-practice-estate-register/1.0',
  exactEstateCoverage: records.size === 6 && [...records.values()].every((record) => source.includes(record.publicName)),
  uniqueRecords: records.size === (register.records || []).length,
  relationshipBoundaries: [...records.values()].every((record) => record.relationship && record.requiredBoundary),
  metricBoundaries: [...records.values()].every((record) => record.metricClaimsAllowed === false),
  launchBoundaries: [...records.values()].every((record) => record.launchClaimsAllowed === false),
  destinationDisposition: [...records.values()].every((record) => record.publicDestination === null || record.publicDestination.startsWith('/') || record.publicDestination.startsWith('https://')),
  nsagPublicEvidence: nsag?.deployment?.reachablePublicSite === true && nsag?.deployment?.observedHttpStatus === 200 && source.includes('https://nsag-site.vercel.app'),
  boundedCanonicalCopy: prohibited.every(([pattern]) => !pattern.test(source)),
  noFindings: findings.length === 0
};

const report = {
  schema: 'aloha-ai-cross-practice-estate-evaluation/1.0',
  evaluatedAt: '2026-08-02',
  scope: register.scope,
  boundary: register.boundary,
  counts: {
    representedPracticesAndProjects: records.size,
    confirmedRepositories: [...records.values()].filter((record) => record.repository?.confirmed).length,
    confirmedVercelProjects: [...records.values()].filter((record) => record.deployment?.confirmed).length,
    governedPublicDestinations: [...records.values()].filter((record) => record.publicDestination).length,
    reachableExternalDestinations: [...records.values()].filter((record) => record.deployment?.reachablePublicSite).length
  },
  checks,
  findings
};

const output = path.join(root, 'artifacts', 'cross-practice-estate-evaluation.json');
fs.mkdirSync(path.dirname(output), { recursive: true });
fs.writeFileSync(output, `${JSON.stringify(report, null, 2)}\n`);
console.log(`Cross-practice estate: ${Object.values(checks).filter(Boolean).length}/${Object.keys(checks).length} checks; ${records.size} records; ${findings.length} findings.`);
if (findings.length) {
  for (const finding of findings) console.error(`- ${finding}`);
  process.exit(1);
}
