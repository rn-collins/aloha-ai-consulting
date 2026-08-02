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
const evidenceEvaluation = read('api/evaluations/evidence-explainer.json');
const billEvaluation = read('api/evaluations/bill-analyzer.json');
const controlledSubstancesEvaluation = read('api/evaluations/controlled-substances-explainer.json');
const privacyEvaluation = read('api/evaluations/privacy.json');
const securityEvaluation = read('api/evaluations/security.json');
const accessibilityEvaluation = read('api/evaluations/accessibility.json');
const correctionsEvaluation = read('api/evaluations/corrections.json');
const legalAuthorityEvaluation = read('api/evaluations/legal-authority.json');
const rightsAttributionEvaluation = read('api/evaluations/rights-attribution.json');

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
  } else if (id === 'evidence-explainer') {
    if (item.state !== 'passed-limited' || !item.evidenceHref || !item.decision || !item.retestTrigger) errors.push(`${id}: bounded evaluation decision is incomplete`);
    if (evidenceEvaluation.decision !== 'passed-limited-claim-language-triage-scope' || evidenceEvaluation.metrics.totalCases < 20 || evidenceEvaluation.metrics.failedCases !== 0 || evidenceEvaluation.metrics.falseClearances !== 0 || evidenceEvaluation.metrics.abstentionAccuracy !== 1 || evidenceEvaluation.metrics.unsupportedInferenceRejections !== 1) errors.push(`${id}: evaluation evidence does not satisfy the bounded threshold`);
    if (!evidenceEvaluation.prohibitedInference) errors.push(`${id}: prohibited-inference boundary is missing`);
  } else if (id === 'bill-analyzer') {
    if (item.state !== 'passed-limited' || !item.evidenceHref || !item.decision || !item.retestTrigger) errors.push(`${id}: bounded evaluation decision is incomplete`);
    if (billEvaluation.decision !== 'passed-limited-regulatory-language-triage-scope' || billEvaluation.metrics.totalCases < 20 || billEvaluation.metrics.failedCases !== 0 || billEvaluation.metrics.falseClearances !== 0 || billEvaluation.metrics.abstentionAccuracy !== 1 || billEvaluation.metrics.unsupportedInferenceRejections !== 1) errors.push(`${id}: evaluation evidence does not satisfy the bounded threshold`);
    if (!billEvaluation.jurisdictionPolicyBoundary || !billEvaluation.prohibitedInference) errors.push(`${id}: jurisdiction or prohibited-inference boundary is missing`);
  } else if (id === 'controlled-substances-explainer') {
    if (item.state !== 'passed-limited' || !item.evidenceHref || !item.decision || !item.retestTrigger) errors.push(`${id}: bounded evaluation decision is incomplete`);
    if (controlledSubstancesEvaluation.decision !== 'passed-limited-federal-authority-routing-scope' || controlledSubstancesEvaluation.metrics.totalCases < 20 || controlledSubstancesEvaluation.metrics.failedCases !== 0 || controlledSubstancesEvaluation.metrics.falseClearances !== 0 || controlledSubstancesEvaluation.metrics.abstentionAccuracy !== 1 || controlledSubstancesEvaluation.metrics.unsupportedInferenceRejections !== 1) errors.push(`${id}: evaluation evidence does not satisfy the bounded threshold`);
    if (!controlledSubstancesEvaluation.jurisdictionPolicyBoundary || !controlledSubstancesEvaluation.prohibitedInference) errors.push(`${id}: jurisdiction or prohibited-inference boundary is missing`);
  } else if (item.state !== 'not-evaluated' || !item.requiredNext) errors.push(`${id}: must remain explicitly queued and not evaluated`);
  const object = release.objects.find((candidate) => candidate.canonicalId === id);
  if (!object) errors.push(`${id}: no canonical release object`);
  else if (id === 'citation-verifier' && object.status.evaluation !== 'limited') errors.push(`${id}: release registry must record limited evaluation`);
  else if (id === 'claims-checker' && object.status.evaluation !== 'limited') errors.push(`${id}: release registry must record limited evaluation`);
  else if (id === 'evidence-explainer' && object.status.evaluation !== 'limited') errors.push(`${id}: release registry must record limited evaluation`);
  else if (id === 'bill-analyzer' && object.status.evaluation !== 'limited') errors.push(`${id}: release registry must record limited evaluation`);
  else if (id === 'controlled-substances-explainer' && object.status.evaluation !== 'limited') errors.push(`${id}: release registry must record limited evaluation`);
  else if (!['citation-verifier','claims-checker','evidence-explainer','bill-analyzer','controlled-substances-explainer'].includes(id) && object.status.evaluation !== 'not-evaluated') errors.push(`${id}: release registry claims evaluation before evidence`);
}

const domains = registry.siteAssuranceDomains || [];
if (domains.length !== requiredDomains.length || new Set(domains.map((item) => item.id)).size !== requiredDomains.length) errors.push(`site assurance domain coverage is ${domains.length}/${requiredDomains.length}`);
for (const id of requiredDomains) {
  const item = domains.find((candidate) => candidate.id === id);
  if (!item || !item.requiredEvidence) errors.push(`${id}: assurance domain record is incomplete`);
  else if (id === 'privacy') {
    if (item.state !== 'passed-limited' || !item.evidenceHref || !item.decision || !item.retestTrigger) errors.push('privacy: bounded assurance decision is incomplete');
    if (privacyEvaluation.decision !== 'passed-limited-public-site-boundary' || privacyEvaluation.metrics.failedChecks !== 0 || privacyEvaluation.metrics.passedChecks !== privacyEvaluation.metrics.totalChecks) errors.push('privacy: evidence does not satisfy the bounded threshold');
    if (!privacyEvaluation.dataFlows?.length || !privacyEvaluation.deployedNetworkAndScriptInventory || !privacyEvaluation.requestProcess || !privacyEvaluation.owner || !privacyEvaluation.review?.lastReviewed || !privacyEvaluation.incidentPath) errors.push('privacy: required evidence is incomplete');
    if (!privacyEvaluation.prohibitedInference) errors.push('privacy: prohibited-inference boundary is missing');
  } else if (id === 'security') {
    if (item.state !== 'passed-limited' || !item.evidenceHref || !item.decision || !item.retestTrigger) errors.push('security: bounded assurance decision is incomplete');
    if (securityEvaluation.decision !== 'passed-limited-repository-and-public-deployment-boundary' || securityEvaluation.metrics.failedChecks !== 0 || securityEvaluation.metrics.passedChecks !== securityEvaluation.metrics.totalChecks) errors.push('security: evidence does not satisfy the bounded threshold');
    if (!securityEvaluation.permissionsBoundary || !securityEvaluation.secretsAndLoggingControls || !securityEvaluation.incidentPath || !securityEvaluation.owner || !securityEvaluation.review?.lastReviewed) errors.push('security: required evidence is incomplete');
    if (!securityEvaluation.prohibitedInference) errors.push('security: prohibited-inference boundary is missing');
  } else if (id === 'accessibility') {
    if (item.state !== 'passed-limited' || !item.evidenceHref || !item.decision || !item.retestTrigger) errors.push('accessibility: bounded assurance decision is incomplete');
    if (accessibilityEvaluation.decision !== 'passed-limited-static-structure-and-interaction-contract-scope' || accessibilityEvaluation.metrics.failedChecks !== 0 || accessibilityEvaluation.metrics.structuralFindings !== 0 || accessibilityEvaluation.metrics.passedChecks !== accessibilityEvaluation.metrics.totalChecks) errors.push('accessibility: evidence does not satisfy the bounded threshold');
    if (!accessibilityEvaluation.assistiveTechnologyEvidence || accessibilityEvaluation.assistiveTechnologyEvidence.notPerformed.length < 4 || !accessibilityEvaluation.owner || !accessibilityEvaluation.review?.lastReviewed) errors.push('accessibility: required evidence is incomplete');
    if (!accessibilityEvaluation.prohibitedInference) errors.push('accessibility: prohibited-inference boundary is missing');
  } else if (id === 'corrections') {
    if (item.state !== 'passed-limited' || !item.evidenceHref || !item.decision || !item.retestTrigger) errors.push('corrections: bounded assurance decision is incomplete');
    if (correctionsEvaluation.decision !== 'passed-limited-public-correction-process-and-ledger-integrity-scope' || correctionsEvaluation.metrics.failedChecks !== 0 || correctionsEvaluation.metrics.passedChecks !== correctionsEvaluation.metrics.totalChecks) errors.push('corrections: evidence does not satisfy the bounded threshold');
    if (!correctionsEvaluation.correctionRoute?.pathname || !correctionsEvaluation.revisionLedger?.entries || !correctionsEvaluation.affectedOutputAnalysis?.required || !correctionsEvaluation.owner || !correctionsEvaluation.responseStates?.length || !correctionsEvaluation.closureEvidence?.requiredForClosedEntries) errors.push('corrections: required evidence is incomplete');
    if (!correctionsEvaluation.prohibitedInference) errors.push('corrections: prohibited-inference boundary is missing');
  } else if (id === 'legal-authority') {
    if (item.state !== 'passed-limited' || !item.evidenceHref || !item.decision || !item.retestTrigger) errors.push('legal-authority: bounded assurance decision is incomplete');
    if (legalAuthorityEvaluation.decision !== 'passed-limited-selected-authority-control-scope' || legalAuthorityEvaluation.metrics.failedChecks !== 0 || legalAuthorityEvaluation.metrics.passedChecks !== legalAuthorityEvaluation.metrics.totalChecks) errors.push('legal-authority: evidence does not satisfy the bounded threshold');
    if (!legalAuthorityEvaluation.sourceRegister?.records || !legalAuthorityEvaluation.professionalBoundary || !legalAuthorityEvaluation.conflictRule || !legalAuthorityEvaluation.owner || !legalAuthorityEvaluation.review?.lastReviewed) errors.push('legal-authority: required evidence is incomplete');
    if (!legalAuthorityEvaluation.prohibitedInference) errors.push('legal-authority: prohibited-inference boundary is missing');
  } else if (id === 'rights-attribution') {
    if (item.state !== 'passed-limited' || !item.evidenceHref || !item.decision || !item.retestTrigger) errors.push('rights-attribution: bounded assurance decision is incomplete');
    if (rightsAttributionEvaluation.decision !== 'passed-limited-checked-in-public-asset-and-rights-process-scope' || rightsAttributionEvaluation.metrics.failedChecks !== 0 || rightsAttributionEvaluation.metrics.recordFindings !== 0 || rightsAttributionEvaluation.metrics.passedChecks !== rightsAttributionEvaluation.metrics.totalChecks) errors.push('rights-attribution: evidence does not satisfy the bounded threshold');
    if (!rightsAttributionEvaluation.rightsRegister?.assets || !rightsAttributionEvaluation.assetIntegrity?.files || !rightsAttributionEvaluation.reportingRoute?.pathname || !rightsAttributionEvaluation.owner || !rightsAttributionEvaluation.review?.lastReviewed) errors.push('rights-attribution: required evidence is incomplete');
    if (!rightsAttributionEvaluation.prohibitedInference) errors.push('rights-attribution: prohibited-inference boundary is missing');
  } else if (item.state !== 'required-not-yet-certified') errors.push(`${id}: assurance domain must fail closed`);
}

const manifest = {
  schema: registry.schema,
  version: registry.version,
  asOf: registry.effectiveDate,
  notice: registry.policy,
  methodConformance: conformance,
  highStakesEvaluationQueue: queue,
  siteAssuranceDomains: domains,
  counts: { methodControls: controls.length, methodExceptions: conformance.exceptions.length, methodRevisions: conformance.revisions.length, highStakesToolsQueued: queue.length, evaluatedHighStakesTools: queue.filter((item) => item.state !== 'not-evaluated').length, evaluatedAssuranceDomains: domains.filter((item) => item.state !== 'required-not-yet-certified').length, assuranceDomainsCertified: domains.filter((item) => item.state === 'certified').length, errors: errors.length },
  errors
};
fs.mkdirSync('api', { recursive: true });
fs.writeFileSync('api/assurance-manifest.json', `${JSON.stringify(manifest, null, 2)}\n`);
if (errors.length) {
  console.error(`Assurance controls failed with ${errors.length} error(s).`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}
console.log(`Assurance controls passed: ${controls.length} method controls; ${queue.filter((item) => item.state !== 'not-evaluated').length}/${queue.length} high-stakes tools evaluated; ${domains.filter((item) => item.state === 'passed-limited').length}/${domains.length} site domains passed within bounded scope.`);

function read(file) { return JSON.parse(fs.readFileSync(file, 'utf8')); }
