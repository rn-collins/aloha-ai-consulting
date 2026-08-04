import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (file) => JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
const exists = (file) => fs.existsSync(path.join(root, file));
const findings = [];
const checks = [];
const check = (id, pass, detail) => {
  checks.push({ id, pass, detail });
  if (!pass) findings.push(`${id}: ${detail}`);
};

const freeze = read('program/promise-delivery/freeze.json');
const registry = read('program/promise-delivery/promise-release-registry.json');
const site = read('artifacts/site-audit/report.json');
const interactions = read('artifacts/interaction-audit/report.json');
const learning = read('api/learning-completeness-report.json');
const evidenceFile = 'program/promise-delivery/r10-evidence-unit-register.json';
const evidence = exists(evidenceFile) ? read(evidenceFile) : null;
const frozenLedger = read('program/promise-delivery/ledger.json');
const frozenIds = frozenLedger.records.map((record) => record.id).sort();
const registeredIds = evidence?.units?.flatMap((unit) => unit.reAudit?.promiseReview?.map((record) => record.i) || []).sort() || [];

check('R10-01', freeze.baselineCommit === 'deb1073d', 'Immutable baseline commit must remain deb1073d.');
check('R10-02', freeze.counts.promiseRecords === 4289 && freeze.counts.totalPromiseOccurrences === 9552, 'Frozen promise denominator must remain 4,289 records / 9,552 occurrences.');
check('R10-03', registry.counts.routes === 505 && registry.counts.resources === 262, 'Current reviewed registry must cover 505 public surfaces and 262 resources.');
check('R10-04', registry.counts.promiseRecords === 5368 && registry.counts.promiseOccurrences === 12013, 'Current registry must cover 5,368 records / 12,013 occurrences.');
check('R10-05', site.summary?.routes === 504 && site.summary?.found === 504 && site.summary?.missing === 0, 'Clean local inventory must cover 504 sitemap routes with no missing files.');
check('R10-06', interactions.pages === 505 && interactions.interactiveElements === 9782 && interactions.failures?.length === 0, 'Clean local interaction inventory must cover 505 surfaces / 9,782 elements with no failures.');
check('R10-07', learning.frozenAuditEvidenceUnits === 325, 'The frozen evidence-unit denominator must remain 325.');
check('R10-08', Boolean(evidence), 'A checked-in 325-row evidence-unit register is required for reproducible terminal reconciliation.');
check('R10-09', evidence?.units?.length === 325, 'The evidence-unit register must enumerate exactly 325 stable unit IDs.');
check('R10-10', evidence?.units?.every((unit) => unit.id && ['passed', 'blocked', 'deferred'].includes(unit.terminalState)), 'Every evidence unit must have a stable ID and explicit terminal state.');
check('R10-11', evidence?.units?.every((unit) => Array.isArray(unit.evidence) && unit.evidence.length), 'Every evidence unit must point to observable evidence.');
check('R10-12', evidence?.units?.every((unit) => unit.terminalState === 'passed' || (unit.dependency && unit.reconsiderationTrigger)), 'Every non-passing unit must name its dependency and reconsideration trigger.');
check('R10-13', evidence?.units?.every((unit) => Array.isArray(unit.reAudit?.promiseReview) && unit.reAudit.promiseReview.length && unit.reAudit.promiseReview.every((record) => record.i)), 'Every evidence unit must preserve lineage to one or more frozen promise IDs through compact promise-review membership.');
check('R10-14', evidence?.counts?.total === 325 && evidence?.counts?.total === (evidence?.counts?.passed || 0) + (evidence?.counts?.blocked || 0) + (evidence?.counts?.deferred || 0), 'Evidence-unit terminal-state counts must reconcile to 325.');
check('R10-15', registeredIds.length === 4289 && new Set(registeredIds).size === 4289 && JSON.stringify(registeredIds) === JSON.stringify(frozenIds), 'The recovered register must cover every frozen promise ID exactly once.');
check('R10-16', evidence?.units?.every((unit) => unit.provenance && unit.provenanceGrade), 'Every reconstructed unit must disclose its provenance and provenance grade.');
check('R10-17', evidence?.recoveryMethod && Array.isArray(evidence?.limitations) && evidence.limitations.length >= 3, 'Controlled denominator recovery must disclose its method and material limitations.');
check('R10-18', evidence?.counts?.deferred === evidence?.units?.filter((unit) => unit.terminalState === 'deferred').length, 'Declared deferred count must match unit states.');
check('R10-21', evidence?.reAudit?.reviewedPromiseRecords === 4289, 'The current-registry lineage pass must review all 4,289 frozen promise records.');
check('R10-22', evidence?.reAudit?.presentVerbatim === 3210 && evidence?.reAudit?.notPresentVerbatim === 1079, 'Lineage results must reconcile to 3,210 verbatim survivors and 1,079 records requiring disposition lineage.');
check('R10-23', evidence?.reAudit?.fullyVerbatimSlots === 7 && evidence?.reAudit?.slotsRequiringDispositionLineage === 318, 'Slot-level lineage results must reconcile to seven fully verbatim slots and 318 requiring disposition lineage.');
check('R10-24', evidence?.units?.every((unit) => unit.reAudit?.reviewedPromiseCount === unit.reAudit.promiseReview.length), 'Every reconstructed slot must contain a promise-level lineage decision for every assigned frozen promise.');
check('R10-25', evidence?.units?.every((unit) => unit.reAudit?.presentVerbatim + unit.reAudit?.notPresentVerbatim === unit.reAudit?.promiseReview?.length), 'Every slot lineage summary must reconcile to its assigned promise count.');
check('R10-26', evidence?.reAudit?.confirmedSemanticSuccessors > 0 && evidence?.reAudit?.confirmedSemanticSuccessors + evidence?.reAudit?.confirmedRemediationDispositions + evidence?.reAudit?.confirmedRouteTargetSuccessors + evidence?.reAudit?.confirmedResourceFieldSuccessors + evidence?.reAudit?.lineageUnresolved === 1079, 'Every non-verbatim frozen promise must reconcile to a supported lineage class or unresolved lineage decision.');
check('R10-27', evidence?.units?.every((unit) => unit.reAudit?.confirmedSemanticSuccessors + unit.reAudit?.confirmedRemediationDispositions + unit.reAudit?.confirmedRouteTargetSuccessors + unit.reAudit?.confirmedResourceFieldSuccessors + unit.reAudit?.lineageUnresolved === unit.reAudit?.notPresentVerbatim), 'Every slot must reconcile its non-verbatim records by lineage disposition.');
check('R10-28', evidence?.reAudit?.compactRecordSchema?.fields?.i === 'promiseId' && evidence?.units?.every((unit) => unit.reAudit?.promiseReview?.every((record) => record.i && record.d && Object.hasOwn(record, 'x'))), 'Every compact promise review must record a stable ID, lineage disposition, and explicit successor field.');
check('R10-29', evidence?.reAudit?.confirmedRemediationDispositions === 149, 'R01 manifest reconciliation must preserve all 149 unambiguous dispositions through later lineage passes.');
check('R10-30', evidence?.reAudit?.confirmedSemanticSuccessors + evidence?.reAudit?.confirmedRemediationDispositions + evidence?.reAudit?.confirmedRouteTargetSuccessors + evidence?.reAudit?.confirmedResourceFieldSuccessors + evidence?.reAudit?.lineageUnresolved === 1079, 'Every non-verbatim promise must reconcile to one supported lineage class or an unresolved decision.');
check('R10-31', evidence?.reAudit?.compactRecordSchema?.evidenceTemplates?.r?.includes('s0-occurrence-manifest.json') && evidence?.units?.every((unit) => unit.reAudit?.promiseReview?.filter((record) => record.s === 'r').every((record) => record.r && record.e === 'r')), 'Every confirmed remediation disposition must resolve through the explicit R01 manifest evidence template.');
check('R10-32', evidence?.reAudit?.confirmedRouteTargetSuccessors === 667 && evidence?.reAudit?.confirmedResourceFieldSuccessors + evidence?.reAudit?.lineageUnresolved === 173, 'Unique route-target continuity must preserve its 667 successors and the complete 173-record post-Unit-6 boundary.');
check('R10-33', evidence?.reAudit?.confirmedSemanticSuccessors + evidence?.reAudit?.confirmedRemediationDispositions + evidence?.reAudit?.confirmedRouteTargetSuccessors + evidence?.reAudit?.confirmedResourceFieldSuccessors + evidence?.reAudit?.lineageUnresolved === 1079, 'Every non-verbatim promise must reconcile to one supported lineage class or remain unresolved.');
check('R10-34', evidence?.reAudit?.compactRecordSchema?.evidenceTemplates?.t?.includes('interaction-audit/report.json') && evidence?.units?.every((unit) => unit.reAudit?.promiseReview?.filter((record) => record.s === 't').every((record) => record.x && record.e === 't')), 'Every route-target successor must name a current successor and resolve through the interaction-audit evidence template.');
check('R10-35', evidence?.reAudit?.confirmedResourceFieldSuccessors === 62 && evidence?.reAudit?.lineageUnresolved === 111, 'Unique resource-field continuity must confirm exactly 62 successors while preserving 111 unresolved lineage decisions.');
check('R10-36', evidence?.units?.every((unit) => unit.reAudit?.promiseReview?.filter((record) => record.s === 'f').every((record) => record.x && record.e === 'f')), 'Every resource-field successor must name one current successor and use the resource-field evidence code.');
check('R10-37', evidence?.reAudit?.compactRecordSchema?.evidenceTemplates?.f?.includes('api/resources.json') && evidence?.reAudit?.confirmedSemanticSuccessors + evidence?.reAudit?.confirmedRemediationDispositions + evidence?.reAudit?.confirmedRouteTargetSuccessors + evidence?.reAudit?.confirmedResourceFieldSuccessors + evidence?.reAudit?.lineageUnresolved === 1079, 'Resource-field lineage must retain complete reconciliation of all 1,079 non-verbatim promises.');
check('R10-19', evidence?.counts?.deferred === 0, 'Program closure requires every reconstructed unit to reach a supported passed or explicitly blocked terminal decision.');
check('R10-20', findings.length === 0, 'Program closure requires zero R10 findings.');

const report = {
  schema: 'aloha-ai-r10-closure-evaluation/1.0',
  generatedAt: new Date().toISOString(),
  decision: findings.length ? 'closure-blocked' : 'closure-ready-for-production-verification',
  frozenEvidenceUnits: 325,
  checks,
  findings,
  interpretation: evidence
    ? 'The controlled register restores denominator integrity and exhaustive frozen-promise lineage without impersonating the missing original audit rows. R10 remains fail-closed while reconstructed units are deferred.'
    : 'Passing repository and route gates do not substitute for the missing evidence-unit ledger. R10 remains fail-closed until all 325 units are enumerated and reconciled.'
};

fs.writeFileSync(path.join(root, 'artifacts/r10-closure-evaluation.json'), `${JSON.stringify(report, null, 2)}\n`);
console.log(`R10 closure: ${checks.filter((item) => item.pass).length}/${checks.length} checks; ${findings.length} finding(s); ${report.decision}.`);
for (const finding of findings) console.log(`- ${finding}`);
if (process.argv.includes('--require-ready') && findings.length) process.exit(1);
