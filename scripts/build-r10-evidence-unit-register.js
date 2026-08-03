import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const ledgerPath = 'program/promise-delivery/ledger.json';
const currentRegistryPath = 'program/promise-delivery/promise-release-registry.json';
const r01DispositionPath = 'program/promise-delivery/remediation/r01/s0-occurrence-manifest.json';
const outputPath = 'program/promise-delivery/r10-evidence-unit-register.json';
const ledger = JSON.parse(fs.readFileSync(path.join(root, ledgerPath), 'utf8'));
const currentRegistry = JSON.parse(fs.readFileSync(path.join(root, currentRegistryPath), 'utf8'));
const r01DispositionManifest = JSON.parse(fs.readFileSync(path.join(root, r01DispositionPath), 'utf8'));
const currentById = new Map(currentRegistry.records.map((record) => [record.promiseId, record]));
const semanticKey = (value) => value
  .replace(/^\s*\d+\s*·\s*/, '')
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, ' ')
  .trim();
const successorsBySemanticKey = new Map();
for (const record of currentRegistry.records) {
  const key = `${record.category}|${semanticKey(record.exactPromise)}`;
  const matches = successorsBySemanticKey.get(key) || [];
  matches.push(record);
  successorsBySemanticKey.set(key, matches);
}
const r01DispositionByPromiseId = new Map();
for (const occurrence of r01DispositionManifest.occurrences) {
  const records = r01DispositionByPromiseId.get(occurrence.promiseId) || [];
  records.push(occurrence);
  r01DispositionByPromiseId.set(occurrence.promiseId, records);
}
const totalUnits = 325;
const records = [...ledger.records].sort((a, b) => a.id.localeCompare(b.id));

if (records.length !== 4289) throw new Error(`Expected 4,289 frozen promise records; found ${records.length}.`);
if (new Set(records.map((record) => record.id)).size !== records.length) throw new Error('Frozen promise IDs are not unique.');

const baseSize = Math.floor(records.length / totalUnits);
const remainder = records.length % totalUnits;
let cursor = 0;
const units = Array.from({ length: totalUnits }, (_, index) => {
  const size = baseSize + (index < remainder ? 1 : 0);
  const slice = records.slice(cursor, cursor + size);
  cursor += size;
  const ordinal = String(index + 1).padStart(3, '0');
  const promiseReview = slice.map((record) => {
    const current = currentById.get(record.id);
    const semanticMatches = current
      ? []
      : successorsBySemanticKey.get(`${record.category}|${semanticKey(record.exactPromise)}`) || [];
    const successor = semanticMatches.length === 1 ? semanticMatches[0] : null;
    const priorDispositionRecords = current || successor ? [] : r01DispositionByPromiseId.get(record.id) || [];
    const priorDispositions = [...new Set(priorDispositionRecords.map((item) => item.disposition))].sort();
    const confirmedPriorDisposition = priorDispositions.length === 1 ? priorDispositions[0] : null;
    return {
      i: record.id,
      s: current
        ? 'present-verbatim'
        : successor
          ? 'confirmed-semantic-successor'
          : confirmedPriorDisposition
            ? 'confirmed-remediation-disposition'
          : 'lineage-unresolved',
      d: current
        ? 'direct-survivor'
        : successor
          ? 'rewrite-successor-confirmed'
          : confirmedPriorDisposition
            ? `remediation-${confirmedPriorDisposition}-confirmed`
          : 'requires-lineage-adjudication',
      x: successor?.promiseId || null,
      r: confirmedPriorDisposition,
      e: current
        ? 'current-registry-direct'
        : successor
          ? 'ledger-plus-current-successor'
          : confirmedPriorDisposition
            ? 'ledger-plus-r01-disposition'
            : 'ledger-plus-current-registry-search',
      q: current || successor
        ? 'substantive-review-required'
        : confirmedPriorDisposition
          ? 'remediation-state-verification-required'
          : 'lineage-adjudication-required'
    };
  });
  const presentVerbatim = promiseReview.filter((record) => record.s === 'present-verbatim').length;
  const confirmedSemanticSuccessors = promiseReview.filter((record) => record.s === 'confirmed-semantic-successor').length;
  const confirmedRemediationDispositions = promiseReview.filter((record) => record.s === 'confirmed-remediation-disposition').length;
  const lineageUnresolved = promiseReview.filter((record) => record.s === 'lineage-unresolved').length;
  const notPresentVerbatim = confirmedSemanticSuccessors + confirmedRemediationDispositions + lineageUnresolved;
  return {
    id: `R10-REC-${ordinal}`,
    provenance: 'controlled-denominator-reconstruction',
    provenanceGrade: 'reconstructed-not-original',
    terminalState: 'deferred',
    reAudit: {
      phase: 'current-registry-lineage-reconciliation',
      reviewedPromiseCount: promiseReview.length,
      presentVerbatim,
      notPresentVerbatim,
      confirmedSemanticSuccessors,
      confirmedRemediationDispositions,
      lineageUnresolved,
      promiseReview
    },
    evidence: [
      `${ledgerPath}#records`,
      `${currentRegistryPath}#records`,
      'program/promise-delivery/remediation/r10/R10-denominator-recovery-method.md'
    ],
    dependency: lineageUnresolved
      ? `${lineageUnresolved} frozen promise ID(s) still require retirement, materially changed successor, or omission lineage; ${confirmedSemanticSuccessors} successor and ${confirmedRemediationDispositions} remediation disposition lineage decision(s) are confirmed; all ${promiseReview.length} promises still require substantive evidence review.`
      : `All ${promiseReview.length} frozen promise IDs have direct or confirmed-successor lineage, but substantive evidence review remains incomplete.`,
    reconsiderationTrigger: 'Resolve every promise-level remainingDecision, attach observable evidence, and record a supported terminal decision for the complete slot.'
  };
});

const canonicalIds = records.map((record) => record.id);
const lineageHash = crypto.createHash('sha256').update(JSON.stringify(canonicalIds)).digest('hex');
const register = {
  schema: 'aloha-ai-r10-evidence-unit-register/1.0',
  recoveryMethod: 'deterministic-contiguous-partition-of-frozen-promise-ledger',
  source: {
    file: ledgerPath,
    baselineCommit: ledger.baselineCommit,
    promiseRecords: records.length,
    promiseOccurrences: ledger.counts.totalPromiseOccurrences,
    canonicalPromiseIdSha256: lineageHash
  },
  limitations: [
    'The original 325-row evidence-unit ledger is not present in the repository, available Git history, preserved workspace control packages, or R01-R09 reports.',
    'These 325 records recover the frozen denominator and exhaustive promise lineage only; they are not representations of the missing original audit rows.',
    'No reconstructed unit may pass solely because its assigned promise records are present or because repository-wide technical gates pass.',
    'Current-registry presence establishes verbatim lineage only; absence may reflect intentional remediation and presence does not establish substantive truth or production delivery.'
  ],
  partition: {
    unitCount: totalUnits,
    basePromiseRecordsPerUnit: baseSize,
    largerUnitCount: remainder,
    largerUnitSize: baseSize + 1,
    ordering: 'lexicographic frozen promise ID'
  },
  reAudit: {
    phase: 'current-registry-lineage-reconciliation',
    compactRecordSchema: {
      sourceDetail: 'Category, exact promise, occurrences, routes, and baseline classification remain canonical in program/promise-delivery/ledger.json.',
      fields: {
        i: 'promiseId',
        s: 'currentRegistryState',
        d: 'disposition',
        x: 'successorPromiseId',
        r: 'remediationDisposition',
        e: 'evidenceCode',
        q: 'remainingDecisionCode'
      },
      unitMembership: 'Each unit\'s promiseReview.i values are its authoritative frozen promise-ID membership; category and route detail resolve through the immutable ledger.',
      evidenceTemplates: {
        'current-registry-direct': `${currentRegistryPath}#records[promiseId={promiseId}]`,
        'ledger-plus-current-successor': `${ledgerPath}#records[id={promiseId}] + ${currentRegistryPath}#records[promiseId={successorPromiseId}]`,
        'ledger-plus-r01-disposition': `${ledgerPath}#records[id={promiseId}] + ${r01DispositionPath}#occurrences[promiseId={promiseId}]`,
        'ledger-plus-current-registry-search': `${ledgerPath}#records[id={promiseId}] + ${currentRegistryPath}#records`
      },
      remainingDecisionTemplates: {
        'substantive-review-required': 'Substantive delivery and applicable factual, legal, operational, or production evidence require independent review.',
        'remediation-state-verification-required': 'Historical remediation lineage is resolved; current implementation state still requires independent verification.',
        'lineage-adjudication-required': 'Determine whether the frozen promise was retired, rewritten into a materially changed successor, or omitted.'
      }
    },
    reviewedPromiseRecords: records.length,
    presentVerbatim: records.filter((record) => currentById.has(record.id)).length,
    notPresentVerbatim: records.filter((record) => !currentById.has(record.id)).length,
    confirmedSemanticSuccessors: units.reduce((sum, unit) => sum + unit.reAudit.confirmedSemanticSuccessors, 0),
    confirmedRemediationDispositions: units.reduce((sum, unit) => sum + unit.reAudit.confirmedRemediationDispositions, 0),
    lineageUnresolved: units.reduce((sum, unit) => sum + unit.reAudit.lineageUnresolved, 0),
    fullyVerbatimSlots: units.filter((unit) => unit.reAudit.notPresentVerbatim === 0).length,
    slotsRequiringDispositionLineage: units.filter((unit) => unit.reAudit.notPresentVerbatim > 0).length,
    boundary: 'Lineage reconciliation is not substantive promise acceptance.'
  },
  counts: { total: totalUnits, passed: 0, blocked: 0, deferred: totalUnits },
  units
};

fs.writeFileSync(path.join(root, outputPath), `${JSON.stringify(register)}\n`);
console.log(`Wrote ${units.length} reconstructed evidence slots covering ${cursor} frozen promise records.`);
