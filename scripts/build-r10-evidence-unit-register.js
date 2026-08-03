import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const ledgerPath = 'program/promise-delivery/ledger.json';
const currentRegistryPath = 'program/promise-delivery/promise-release-registry.json';
const outputPath = 'program/promise-delivery/r10-evidence-unit-register.json';
const ledger = JSON.parse(fs.readFileSync(path.join(root, ledgerPath), 'utf8'));
const currentRegistry = JSON.parse(fs.readFileSync(path.join(root, currentRegistryPath), 'utf8'));
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
    return {
      promiseId: record.id,
      category: record.category,
      currentRegistryState: current
        ? 'present-verbatim'
        : successor
          ? 'confirmed-semantic-successor'
          : 'lineage-unresolved',
      disposition: current
        ? 'direct-survivor'
        : successor
          ? 'rewrite-successor-confirmed'
          : 'requires-lineage-adjudication',
      successorPromiseId: successor?.promiseId || null,
      frozenOccurrenceCount: record.occurrences.length,
      frozenRoutes: [...new Set(record.occurrences.map((occurrence) => occurrence.route))].sort(),
      currentOccurrenceKeyCount: current?.occurrenceKeys?.length || 0,
      evidence: current
        ? [`${currentRegistryPath}#records[promiseId=${record.id}]`]
        : successor
          ? [
              `${ledgerPath}#records[id=${record.id}]`,
              `${currentRegistryPath}#records[promiseId=${successor.promiseId}]`
            ]
        : [`${ledgerPath}#records[id=${record.id}]`, `${currentRegistryPath}#records`],
      remainingDecision: current
        ? 'Substantive delivery and any applicable factual, legal, operational, or production evidence still require independent review.'
        : successor
          ? 'Successor lineage is resolved; substantive delivery and any applicable factual, legal, operational, or production evidence still require independent review.'
          : 'Determine whether the frozen promise was intentionally retired, rewritten into a materially changed successor, or omitted; record successor lineage or a defect decision.'
    };
  });
  const presentVerbatim = promiseReview.filter((record) => record.currentRegistryState === 'present-verbatim').length;
  const confirmedSemanticSuccessors = promiseReview.filter((record) => record.currentRegistryState === 'confirmed-semantic-successor').length;
  const lineageUnresolved = promiseReview.filter((record) => record.currentRegistryState === 'lineage-unresolved').length;
  const notPresentVerbatim = confirmedSemanticSuccessors + lineageUnresolved;
  return {
    id: `R10-REC-${ordinal}`,
    provenance: 'controlled-denominator-reconstruction',
    provenanceGrade: 'reconstructed-not-original',
    terminalState: 'deferred',
    promiseIds: slice.map((record) => record.id),
    promiseCategories: [...new Set(slice.map((record) => record.category))].sort(),
    reAudit: {
      phase: 'current-registry-lineage-reconciliation',
      reviewedPromiseCount: promiseReview.length,
      presentVerbatim,
      notPresentVerbatim,
      confirmedSemanticSuccessors,
      lineageUnresolved,
      promiseReview
    },
    evidence: [
      `${ledgerPath}#records`,
      `${currentRegistryPath}#records`,
      'program/promise-delivery/remediation/r10/R10-denominator-recovery-method.md'
    ],
    dependency: lineageUnresolved
      ? `${lineageUnresolved} frozen promise ID(s) still require retirement, materially changed successor, or omission lineage; ${confirmedSemanticSuccessors} non-verbatim successor lineage decision(s) are confirmed; all ${promiseReview.length} promises still require substantive evidence review.`
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
    reviewedPromiseRecords: records.length,
    presentVerbatim: records.filter((record) => currentById.has(record.id)).length,
    notPresentVerbatim: records.filter((record) => !currentById.has(record.id)).length,
    confirmedSemanticSuccessors: units.reduce((sum, unit) => sum + unit.reAudit.confirmedSemanticSuccessors, 0),
    lineageUnresolved: units.reduce((sum, unit) => sum + unit.reAudit.lineageUnresolved, 0),
    fullyVerbatimSlots: units.filter((unit) => unit.reAudit.notPresentVerbatim === 0).length,
    slotsRequiringDispositionLineage: units.filter((unit) => unit.reAudit.notPresentVerbatim > 0).length,
    boundary: 'Lineage reconciliation is not substantive promise acceptance.'
  },
  counts: { total: totalUnits, passed: 0, blocked: 0, deferred: totalUnits },
  units
};

fs.writeFileSync(path.join(root, outputPath), `${JSON.stringify(register, null, 2)}\n`);
console.log(`Wrote ${units.length} reconstructed evidence slots covering ${cursor} frozen promise records.`);
