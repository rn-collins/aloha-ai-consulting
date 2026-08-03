import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (file) => JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
const exists = (file) => fs.existsSync(path.join(root, file));
const findings = [];

const canonical = read('api/resources.json').resources;
const canonicalIds = new Set(canonical.map((resource) => resource.id));
const destinationRegisters = [
  'tool-delivery-evidence-register',
  'monitor-research-evidence-register',
  'practical-guidance-evidence-register',
  'use-case-learning-evidence-register',
  'destination-family-evidence-register'
];
const overlayEvaluations = [
  'build-evidence-evaluation',
  'external-build-evidence-evaluation',
  'cross-practice-estate-evaluation',
  'satellite-system-evidence-evaluation',
  'public-download-evidence-evaluation'
];
const destinationEvaluations = [
  'tool-delivery-evidence-evaluation',
  'monitor-research-evidence-evaluation',
  'practical-guidance-evidence-evaluation',
  'use-case-learning-evidence-evaluation',
  'destination-family-evidence-evaluation'
];

const destinationOwners = new Map();
for (const name of destinationRegisters) {
  const register = read(`content/governance/${name}.json`);
  for (const record of register.records || []) {
    if (!record.resourceId) findings.push(`${name} contains a record without resourceId.`);
    if (destinationOwners.has(record.resourceId)) findings.push(`${record.resourceId} is assigned to both ${destinationOwners.get(record.resourceId)} and ${name}.`);
    destinationOwners.set(record.resourceId, name);
  }
}

const r08Kinds = new Set(['tool', 'assessment', 'monitor', 'research', 'playbook', 'template', 'toolGuide', 'useCase', 'product', 'service', 'collection', 'institutional', 'learningHub']);
const standaloneLessons = canonical.filter((resource) => resource.kind === 'lesson' && resource.pathname.startsWith('/university/learn/'));
const expectedR08 = canonical.filter((resource) => r08Kinds.has(resource.kind) || standaloneLessons.some((lesson) => lesson.id === resource.id));
const expectedR08Ids = new Set(expectedR08.map((resource) => resource.id));
const missingR08 = expectedR08.filter((resource) => !destinationOwners.has(resource.id));
const unexpectedR08 = [...destinationOwners.keys()].filter((id) => !expectedR08Ids.has(id));
for (const resource of missingR08) findings.push(`R08 canonical destination is unassigned: ${resource.id}.`);
for (const id of unexpectedR08) findings.push(`R08 register owns an out-of-scope canonical destination: ${id}.`);
for (const id of destinationOwners.keys()) if (!canonicalIds.has(id)) findings.push(`R08 register owns a noncanonical destination: ${id}.`);

const courseEstate = canonical.filter((resource) => resource.kind === 'course' || (resource.kind === 'lesson' && !resource.pathname.startsWith('/university/learn/')));
const policyEstate = canonical.filter((resource) => resource.kind === 'policy');
const buildIndex = canonical.filter((resource) => resource.kind === 'build');
const excluded = [...courseEstate, ...policyEstate, ...buildIndex];
const partition = new Set([...destinationOwners.keys(), ...excluded.map((resource) => resource.id)]);
if (partition.size !== canonical.length) findings.push(`Canonical partition covers ${partition.size} of ${canonical.length} resources.`);

const evaluationNames = [...overlayEvaluations, ...destinationEvaluations];
for (const name of evaluationNames) {
  const file = `artifacts/${name}.json`;
  if (!exists(file)) { findings.push(`Missing R08 evaluation artifact: ${file}.`); continue; }
  const evaluation = read(file);
  const checks = Array.isArray(evaluation.checks) ? evaluation.checks.map((check) => check.pass) : Object.values(evaluation.checks || {});
  if (!checks.length || checks.some((pass) => pass !== true)) findings.push(`${name} has a failing or missing check.`);
  if ((evaluation.findings || []).length) findings.push(`${name} has unresolved findings.`);
}

for (let unit = 1; unit <= 10; unit += 1) {
  const number = String(unit).padStart(2, '0');
  const file = `program/promise-delivery/remediation/r08/R08-progress-${number}.md`;
  if (!exists(file)) { findings.push(`Missing R08 unit report ${number}.`); continue; }
  const report = fs.readFileSync(path.join(root, file), 'utf8');
  if (!new RegExp(`Unit ${unit} (?:is )?(?:production-)?closed`, 'i').test(report)) findings.push(`R08 unit report ${number} does not record a closed unit.`);
}

const deferredLanguage = [
  ...fs.readFileSync(path.join(root, 'program/promise-delivery/remediation/r08/R08-progress-08.md'), 'utf8').matchAll(/five deferred (?:commercial|paid) artifacts/gi),
  ...fs.readFileSync(path.join(root, 'program/promise-delivery/remediation/r08/R08-progress-10.md'), 'utf8').matchAll(/Workspace access/gi)
];
if (deferredLanguage.length < 2) findings.push('R09 paid-artifact and Workspace exclusions are not preserved in R08 records.');

const counts = {
  canonicalResources: canonical.length,
  r08CanonicalDestinations: destinationOwners.size,
  r05CourseAndCourseLessonExclusions: courseEstate.length,
  r07PolicyExclusions: policyEstate.length,
  unit1BuildIndexExclusions: buildIndex.length,
  overlayEvaluations: overlayEvaluations.length,
  destinationEvaluations: destinationEvaluations.length,
  unitReports: 10
};
const checks = {
  exactR08DestinationCoverage: destinationOwners.size === 129 && missingR08.length === 0 && unexpectedR08.length === 0,
  uniqueDestinationOwnership: destinationOwners.size === [...destinationOwners.keys()].length,
  exactCanonicalPartition: partition.size === 262 && partition.size === canonical.length,
  r05CourseBoundary: courseEstate.length === 125,
  r07PolicyBoundary: policyEstate.length === 7,
  unit1BuildIndexBoundary: buildIndex.length === 1,
  overlayEvaluationsPassed: overlayEvaluations.every((name) => !findings.some((finding) => finding.startsWith(name))),
  destinationEvaluationsPassed: destinationEvaluations.every((name) => !findings.some((finding) => finding.startsWith(name))),
  allUnitsClosed: !findings.some((finding) => /unit report/i.test(finding)),
  r09ExclusionsPreserved: deferredLanguage.length >= 2,
  noFindings: findings.length === 0
};

const report = {
  schema: 'aloha-ai-r08-acceptance-evaluation/1.0',
  evaluatedAt: '2026-08-03',
  scope: 'Formal R08 tranche-wide reconciliation of Units 1–10, canonical destination ownership, overlay controls, and cross-tranche exclusions.',
  boundary: 'This evaluation verifies checked-in coverage, evidence controls, and honest delivery states. It does not import the paid-artifact or Workspace access work assigned to R09 or independently certify external operation, commercial capacity, professional correctness, credentials, visual design, or browser behavior beyond governed contracts.',
  counts,
  checks,
  findings
};

for (const output of ['artifacts/r08-acceptance-evaluation.json', 'api/r08-acceptance-evaluation.json']) {
  const target = path.join(root, output);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, `${JSON.stringify(report, null, 2)}\n`);
}

console.log(`R08 acceptance: ${Object.values(checks).filter(Boolean).length}/${Object.keys(checks).length} checks; ${destinationOwners.size} R08 destinations; ${canonical.length} canonical resources partitioned; ${findings.length} findings.`);
if (findings.length) {
  for (const finding of findings) console.error(`- ${finding}`);
  process.exit(1);
}
