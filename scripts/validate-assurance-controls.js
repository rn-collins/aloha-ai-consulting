import fs from 'node:fs';

const registry = read('content/governance/assurance-registry.json');
const methods = read('content/methods/methods.json');
const release = read('content/governance/release-registry.json');
const errors = [];
const requiredControls = ['frame-decision','map-work','source-hierarchy','data-model','decision-logic','assign-mechanism','design-workflow','bounded-prototype','evaluate-revise','activate-gates','document-train','maintain-retire'];
const requiredTools = ['citation-verifier','claims-checker','evidence-explainer','bill-analyzer','controlled-substances-explainer'];
const requiredDomains = ['privacy','security','accessibility','corrections','legal-authority','rights-attribution','institutional-credentials'];
const conformance = registry.methodConformance;
const citationEvaluation = read('api/evaluations/citation-verifier.json');
const claimsEvaluation = read('api/evaluations/claims-checker.json');

for (const field of ['schema','version','effectiveDate','owner','reviewer','nextReviewOrTrigger','policy']) if (!registry[field]) errors.push(`registry: ${field} missing`);
if (methods.version !== conformance.methodVersion || methods.id !== conformance.methodId) errors.push('methods record and conformance version do not match');
if (!methods.owner || !methods.effectiveDate || !methods.lastReviewedOrTested || !methods.nextReviewOrTrigger || !methods.privacyBoundary) errors.push('methods record lacks release metadata');
if (conformance.decision !== 'foundation-approved-not-site-certified') errors.push('methods foundation overstates certification');
if (!Array.isArray(conformance.exceptions) || !Array.isArray(conformance.revisions) || !conformance.revisions.length) errors.push('methods exception or revision ledger missing');

const controls = conformance.controls || [];
if (controls.length !== requiredControls.length || new Set(controls.map((item) => item.id)).size !== requiredControls.length) errors.push(`method control coverage is ${controls.length}/${requiredControls.length}`);
for (const id of requiredControls) if (!controls.some((item) => item.id === id && item.requiredEvidence)) errors.push(`method control ${id} missing`);

const queue = registry.highStakesEvaluationQueue || [];
if (queue.length !== requiredTools.length || new Set(queue.map((item) => item.evaluationId)).size !== requiredTools.length) errors.push(`high-stakes evaluation queue coverage is ${queue.length}/${requiredTools.length}`);
for (const id of requiredTools) {
  const item = queue.find((candidate) => candidate.canonicalId === id);
  if (!item) errors.push(`${id}: missing from evaluation queue`);
  else if (id === 'citation-verifier') {
    if (item.state !== 'passed-limited' || !item.evidenceHref || !item.decision || !item.retestTrigger) errors.push(`${id}: bounded evaluation decision is incomplete`);
    if (citationEvaluation.decision !== 'passed-limited-structural-scope' || citationEvaluation.metrics.totalCases < 20 || citationEvaluation.metrics.failedCases !== 0 || citationEvaluation.metrics.highConsequenceFalsePasses !== 0) errors.push(`${id}: evaluation evidence does not satisfy the bounded threshold`);
    if (citationEvaluation.prohibitedInference !== 'A passing structural result does not establish that an authority exists, remains good law, is quoted accurately, or supports a proposition.') errors.push(`${id}: prohibited inference boundary changed`);
  } else if (id === 'claims-checker') {
    if (item.state !== 'passed-limited' || !item.evidenceHref || !item.decision || !item.retestTrigger) errors.push(`${id}: bounded evaluation decision is incomplete`);
    if (claimsEvaluation.decision !== 'passed-limited-lexical-screening-scope' || claimsEvaluation.metrics.totalCases < 20 || claimsEvaluation.metrics.failedCases !== 0 || claimsEvaluation.metrics.falseClearances !== 0 || claimsEvaluation.metrics.abstentionAccuracy !== 1) errors.push(`${id}: evaluation evidence does not satisfy the bounded threshold`);
    if (!claimsEvaluation.jurisdictionPolicyBoundary || !claimsEvaluation.prohibitedInference) errors.push(`${id}: jurisdiction or prohibited-inference boundary is missing`);
  } else if (item.state !== 'not-evaluated' || !item.requiredNext) errors.push(`${id}: must remain explicitly queued and not evaluated`);
  const object = release.objects.find((candidate) => candidate.canonicalId === id);
  if (!object) errors.push(`${id}: no canonical release object`);
  else if (id === 'citation-verifier' && object.status.evaluation !== 'limited') errors.push(`${id}: release registry must record limited evaluation`);
  else if (id === 'claims-checker' && object.status.evaluation !== 'limited') errors.push(`${id}: release registry must record limited evaluation`);
  else if (!['citation-verifier','claims-checker'].includes(id) && object.status.evaluation !== 'not-evaluated') errors.push(`${id}: release registry claims evaluation before evidence`);
}

const domains = registry.siteAssuranceDomains || [];
if (domains.length !== requiredDomains.length || new Set(domains.map((item) => item.id)).size !== requiredDomains.length) errors.push(`site assurance domain coverage is ${domains.length}/${requiredDomains.length}`);
for (const id of requiredDomains) {
  const item = domains.find((candidate) => candidate.id === id);
  if (!item || item.state !== 'required-not-yet-certified' || !item.requiredEvidence) errors.push(`${id}: assurance domain must fail closed`);
}

const manifest = {
  schema: registry.schema,
  version: registry.version,
  asOf: registry.effectiveDate,
  notice: registry.policy,
  methodConformance: conformance,
  highStakesEvaluationQueue: queue,
  siteAssuranceDomains: domains,
  counts: { methodControls: controls.length, methodExceptions: conformance.exceptions.length, methodRevisions: conformance.revisions.length, highStakesToolsQueued: queue.length, evaluatedHighStakesTools: queue.filter((item) => item.state !== 'not-evaluated').length, assuranceDomainsCertified: domains.filter((item) => item.state === 'certified').length, errors: errors.length },
  errors
};
fs.mkdirSync('api', { recursive: true });
fs.writeFileSync('api/assurance-manifest.json', `${JSON.stringify(manifest, null, 2)}\n`);
if (errors.length) {
  console.error(`Assurance controls failed with ${errors.length} error(s).`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}
console.log(`Assurance controls passed: ${controls.length} method controls; ${queue.filter((item) => item.state !== 'not-evaluated').length}/${queue.length} high-stakes tools evaluated; ${domains.length} site domains fail closed.`);

function read(file) { return JSON.parse(fs.readFileSync(file, 'utf8')); }
