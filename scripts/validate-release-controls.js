import fs from 'node:fs';

const registry = read('content/governance/release-registry.json');
const claims = read('content/governance/claim-review-decisions.json');
const exceptions = read('content/governance/editorial-exception-registry.json');
const objects = registry.objects;
const errors = [];
const warnings = [];
const dependencyBlockers = [];
const frozenCanonicalObjectBaseline = 157;
const canonicalIds = new Set(objects.map((item) => item.canonicalId));
const objectIds = new Set(objects.map((item) => item.id));

for (const object of objects) {
  const controls = object.governanceControls;
  if (!controls) {
    errors.push(`${object.id}: missing governanceControls`);
    continue;
  }
  if (controls.contradiction?.state !== 'registry-consistent') errors.push(`${object.id}: contradiction control is not closed`);
  if (!controls.staleness?.reviewedAt || !controls.staleness?.reviewBy || !controls.staleness?.actionWhenStale) errors.push(`${object.id}: incomplete staleness control`);
  if (Date.parse(controls.staleness.reviewBy) < Date.parse(controls.staleness.reviewedAt)) errors.push(`${object.id}: review-by date precedes review date`);
  if (!['none-declared', 'declared-not-release-certified'].includes(controls.dependency?.state)) errors.push(`${object.id}: invalid dependency control`);
  for (const dependency of controls.dependency?.declaredCanonicalIds || []) {
    if (!canonicalIds.has(dependency)) warnings.push(`${object.id}: dependency ${dependency} is governed as a site-system/cornerstone dependency, not a canonical release object`);
  }
  if ((controls.dependency?.declaredCanonicalIds || []).length) {
    if (controls.dependency.releaseReady !== false) errors.push(`${object.id}: declared dependencies must remain not release-ready until separately certified`);
    dependencyBlockers.push({ objectId: object.id, dependencies: controls.dependency.declaredCanonicalIds, resolvedObjectIds: controls.dependency.resolvedObjectIds || [], unresolvedCanonicalIds: controls.dependency.unresolvedCanonicalIds || [] });
  }
  if (controls.supersession?.state !== 'current-no-predecessor-recorded') errors.push(`${object.id}: unresolved supersession state`);
  if (object.objectType === 'service') {
    if (controls.capacity?.state !== 'not-certified') errors.push(`${object.id}: service capacity must remain not-certified`);
    if (controls.contractingIdentity?.state !== 'defined' || !controls.contractingIdentity.entity || !controls.contractingIdentity.acceptanceInstrument) errors.push(`${object.id}: incomplete contracting identity`);
  }
  if (controls.professionalAccountability?.state !== 'bounded' || !controls.professionalAccountability.boundary || !controls.professionalAccountability.escalation) errors.push(`${object.id}: incomplete professional-accountability boundary`);
  if (object.status.integration === 'verified' && object.status.evidence !== 'published') errors.push(`${object.id}: verified integration lacks published evidence`);
  if (object.status.maintenance === 'maintained' && controls.staleness.state !== 'review-current') errors.push(`${object.id}: maintained object lacks current review`);
}

if (objects.length < frozenCanonicalObjectBaseline || objectIds.size !== objects.length) {
  errors.push(`canonical object coverage is ${objects.length}/${objectIds.size}; frozen baseline ${frozenCanonicalObjectBaseline} must remain covered and all current IDs must be unique`);
}
if (claims.decisions.length !== 4289) errors.push(`claim decision coverage is ${claims.decisions.length}/4289`);
if (exceptions.exceptions.length !== 287) errors.push(`exception coverage is ${exceptions.exceptions.length}/287`);

const report = {
  schemaVersion: 1,
  generatedAt: new Date().toISOString(),
  policy: 'A passed control means the limitation and release behavior are explicit. It does not certify capacity, integration, evaluation, maintenance, or production operation.',
  counts: {
    objects: objects.length,
    frozenCanonicalObjectBaseline,
    postBaselineObjects: objects.length - frozenCanonicalObjectBaseline,
    claims: claims.decisions.length,
    exceptionContracts: exceptions.exceptions.length,
    servicesCapacityNotCertified: objects.filter((item) => item.governanceControls?.capacity?.state === 'not-certified').length,
    dependenciesDeclared: dependencyBlockers.length,
    dependencyReleaseBlockers: dependencyBlockers.length,
    externalDependencyWarnings: warnings.length,
    errors: errors.length
  },
  gates: {
    contradiction: errors.some((item) => item.includes('contradiction')) ? 'fail' : 'pass',
    staleness: errors.some((item) => item.includes('staleness') || item.includes('review-by')) ? 'fail' : 'pass',
    dependency: errors.some((item) => item.includes('dependenc')) ? 'fail' : dependencyBlockers.length ? 'pass-control-blocking-release' : 'pass',
    supersession: errors.some((item) => item.includes('supersession')) ? 'fail' : 'pass',
    capacity: errors.some((item) => item.includes('capacity')) ? 'fail' : 'pass-not-certified',
    contractingIdentity: errors.some((item) => item.includes('contracting')) ? 'fail' : 'pass',
    professionalAccountability: errors.some((item) => item.includes('professional')) ? 'fail' : 'pass'
  },
  warnings,
  dependencyBlockers,
  errors
};

fs.writeFileSync('api/release-control-report.json', `${JSON.stringify(report, null, 2)}\n`);
if (errors.length) {
  console.error(`Release controls failed with ${errors.length} error(s).`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}
console.log(`Release controls passed for ${objects.length} objects, ${claims.decisions.length} claims, and ${exceptions.exceptions.length} site-system contracts.`);
console.log(`${dependencyBlockers.length} canonical objects have declared dependencies that remain release blockers.`);

function read(file) { return JSON.parse(fs.readFileSync(file, 'utf8')); }
