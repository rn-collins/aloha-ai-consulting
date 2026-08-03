import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const ledgerPath = 'program/promise-delivery/ledger.json';
const outputPath = 'program/promise-delivery/r10-evidence-unit-register.json';
const ledger = JSON.parse(fs.readFileSync(path.join(root, ledgerPath), 'utf8'));
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
  return {
    id: `R10-REC-${ordinal}`,
    provenance: 'controlled-denominator-reconstruction',
    provenanceGrade: 'reconstructed-not-original',
    terminalState: 'deferred',
    promiseIds: slice.map((record) => record.id),
    promiseCategories: [...new Set(slice.map((record) => record.category))].sort(),
    evidence: [
      `${ledgerPath}#records`,
      'program/promise-delivery/remediation/r10/R10-denominator-recovery-method.md'
    ],
    dependency: 'Original row-level evidence-unit provenance and unit-to-evidence decisions are unavailable; deterministic promise coverage does not substitute for re-audit evidence.',
    reconsiderationTrigger: 'Reattach the original audit ledger with verifiable lineage, or independently re-audit every promise assigned to this reconstructed slot and record observable terminal evidence.'
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
    'No reconstructed unit may pass solely because its assigned promise records are present or because repository-wide technical gates pass.'
  ],
  partition: {
    unitCount: totalUnits,
    basePromiseRecordsPerUnit: baseSize,
    largerUnitCount: remainder,
    largerUnitSize: baseSize + 1,
    ordering: 'lexicographic frozen promise ID'
  },
  counts: { total: totalUnits, passed: 0, blocked: 0, deferred: totalUnits },
  units
};

fs.writeFileSync(path.join(root, outputPath), `${JSON.stringify(register, null, 2)}\n`);
console.log(`Wrote ${units.length} reconstructed evidence slots covering ${cursor} frozen promise records.`);
