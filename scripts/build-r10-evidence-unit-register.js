import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const ledgerPath = 'program/promise-delivery/ledger.json';
const currentRegistryPath = 'program/promise-delivery/promise-release-registry.json';
const r01DispositionPath = 'program/promise-delivery/remediation/r01/s0-occurrence-manifest.json';
const interactionAuditPath = 'artifacts/interaction-audit/report.json';
const resourcesPath = 'api/resources.json';
const outputPath = 'program/promise-delivery/r10-evidence-unit-register.json';
const ledger = JSON.parse(fs.readFileSync(path.join(root, ledgerPath), 'utf8'));
const currentRegistry = JSON.parse(fs.readFileSync(path.join(root, currentRegistryPath), 'utf8'));
const r01DispositionManifest = JSON.parse(fs.readFileSync(path.join(root, r01DispositionPath), 'utf8'));
const interactionAudit = JSON.parse(fs.readFileSync(path.join(root, interactionAuditPath), 'utf8'));
const resources = JSON.parse(fs.readFileSync(path.join(root, resourcesPath), 'utf8')).resources;
const currentById = new Map(currentRegistry.records.map((record) => [record.promiseId, record]));
const currentByExactPromise = new Map(currentRegistry.records.map((record) => [record.exactPromise, record]));
const resourceById = new Map(resources.map((resource) => [resource.id, resource]));
const valueAtFieldPath = (object, fieldPath) => fieldPath
  .replace(/\[(\d+)\]/g, '.$1')
  .split('.')
  .reduce((value, key) => value?.[key], object);
const currentActionIdByExactPromise = new Map(
  currentRegistry.records
    .filter((record) => record.category === 'public-action')
    .map((record) => [record.exactPromise, record.promiseId])
);
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
const currentActionsByRouteTarget = new Map();
for (const occurrence of interactionAudit.inventory) {
  const key = `${occurrence.route}|${occurrence.target}`;
  const records = currentActionsByRouteTarget.get(key) || [];
  const promiseId = currentActionIdByExactPromise.get(occurrence.label) || null;
  records.push({ ...occurrence, promiseId });
  currentActionsByRouteTarget.set(key, records);
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
    const routeTargetMatches = current || successor || confirmedPriorDisposition || record.category !== 'public-action'
      ? []
      : record.occurrences.map((occurrence) => currentActionsByRouteTarget.get(`${occurrence.route}|${occurrence.target}`) || []);
    const routeTargetSuccessorIds = routeTargetMatches.length && routeTargetMatches.every((matches) => matches.length === 1)
      ? [...new Set(routeTargetMatches.flat().map((match) => match.promiseId))]
      : [];
    const routeTargetSuccessorId = routeTargetSuccessorIds.length === 1 && currentById.has(routeTargetSuccessorIds[0])
      ? routeTargetSuccessorIds[0]
      : null;
    const resourceFieldMatches = current || successor || confirmedPriorDisposition || routeTargetSuccessorId || record.category !== 'resource-claim'
      ? []
      : record.occurrences.map((occurrence) => {
          const value = valueAtFieldPath(resourceById.get(occurrence.resourceId), occurrence.field);
          return typeof value === 'string' ? currentByExactPromise.get(value) || null : null;
        });
    const resourceFieldSuccessorIds = resourceFieldMatches.length && resourceFieldMatches.every(Boolean)
      ? [...new Set(resourceFieldMatches.map((match) => match.promiseId))]
      : [];
    const resourceFieldSuccessorId = resourceFieldSuccessorIds.length === 1 && currentById.has(resourceFieldSuccessorIds[0])
      ? resourceFieldSuccessorIds[0]
      : null;
    return {
      i: record.id,
      s: current
        ? 'v'
        : successor
          ? 's'
          : confirmedPriorDisposition
            ? 'r'
            : routeTargetSuccessorId
              ? 't'
              : resourceFieldSuccessorId
                ? 'f'
          : 'u',
      d: current
        ? 'v'
        : successor
          ? 's'
          : confirmedPriorDisposition
            ? 'r'
            : routeTargetSuccessorId
              ? 't'
              : resourceFieldSuccessorId
                ? 'f'
          : 'u',
      x: successor?.promiseId || routeTargetSuccessorId || resourceFieldSuccessorId,
      r: confirmedPriorDisposition,
      e: current
        ? 'v'
        : successor
          ? 's'
          : confirmedPriorDisposition
            ? 'r'
            : routeTargetSuccessorId
              ? 't'
              : resourceFieldSuccessorId
                ? 'f'
            : 'u',
      q: current || successor || routeTargetSuccessorId || resourceFieldSuccessorId
        ? 's'
        : confirmedPriorDisposition
          ? 'r'
          : 'l'
    };
  });
  const presentVerbatim = promiseReview.filter((record) => record.s === 'v').length;
  const confirmedSemanticSuccessors = promiseReview.filter((record) => record.s === 's').length;
  const confirmedRemediationDispositions = promiseReview.filter((record) => record.s === 'r').length;
  const confirmedRouteTargetSuccessors = promiseReview.filter((record) => record.s === 't').length;
  const confirmedResourceFieldSuccessors = promiseReview.filter((record) => record.s === 'f').length;
  const lineageUnresolved = promiseReview.filter((record) => record.s === 'u').length;
  const notPresentVerbatim = confirmedSemanticSuccessors + confirmedRemediationDispositions + confirmedRouteTargetSuccessors + confirmedResourceFieldSuccessors + lineageUnresolved;
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
      confirmedRouteTargetSuccessors,
      confirmedResourceFieldSuccessors,
      lineageUnresolved,
      promiseReview
    },
    evidence: [
      `${ledgerPath}#records`,
      `${currentRegistryPath}#records`,
      'program/promise-delivery/remediation/r10/R10-denominator-recovery-method.md'
    ],
    dependency: lineageUnresolved
      ? `${lineageUnresolved} frozen promise ID(s) still require lineage adjudication; ${confirmedSemanticSuccessors} semantic successor, ${confirmedRemediationDispositions} remediation disposition, ${confirmedRouteTargetSuccessors} route-target successor, and ${confirmedResourceFieldSuccessors} resource-field successor decision(s) are confirmed; all ${promiseReview.length} promises still require substantive evidence review.`
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
        s: 'state: v=verbatim, s=semantic-successor, r=remediation-disposition, t=route-target-successor, f=resource-field-successor, u=unresolved',
        d: 'disposition code using the same v/s/r/t/f/u legend',
        x: 'successorPromiseId',
        r: 'remediationDisposition',
        e: 'evidence: v=registry, s=semantic, r=R01, t=route-target, f=resource-field, u=search',
        q: 'remaining decision: s=substantive, r=remediation verification, l=lineage'
      },
      unitMembership: 'Each unit\'s promiseReview.i values are its authoritative frozen promise-ID membership; category and route detail resolve through the immutable ledger.',
      evidenceTemplates: {
        v: `${currentRegistryPath}#records[promiseId={promiseId}]`,
        s: `${ledgerPath}#records[id={promiseId}] + ${currentRegistryPath}#records[promiseId={successorPromiseId}]`,
        r: `${ledgerPath}#records[id={promiseId}] + ${r01DispositionPath}#occurrences[promiseId={promiseId}]`,
        t: `${ledgerPath}#records[id={promiseId}].occurrences[route,target] + ${interactionAuditPath}#inventory[route,target] + ${currentRegistryPath}#records[promiseId={successorPromiseId}]`,
        f: `${ledgerPath}#records[id={promiseId}].occurrences[resourceId,field] + ${resourcesPath}#resources[id={resourceId}][field] + ${currentRegistryPath}#records[promiseId={successorPromiseId}]`,
        u: `${ledgerPath}#records[id={promiseId}] + ${currentRegistryPath}#records`
      },
      remainingDecisionTemplates: {
        s: 'Substantive delivery and applicable factual, legal, operational, or production evidence require independent review.',
        r: 'Historical remediation lineage is resolved; current implementation state still requires independent verification.',
        l: 'Determine whether the frozen promise was retired, rewritten into a materially changed successor, or omitted.'
      }
    },
    reviewedPromiseRecords: records.length,
    presentVerbatim: records.filter((record) => currentById.has(record.id)).length,
    notPresentVerbatim: records.filter((record) => !currentById.has(record.id)).length,
    confirmedSemanticSuccessors: units.reduce((sum, unit) => sum + unit.reAudit.confirmedSemanticSuccessors, 0),
    confirmedRemediationDispositions: units.reduce((sum, unit) => sum + unit.reAudit.confirmedRemediationDispositions, 0),
    confirmedRouteTargetSuccessors: units.reduce((sum, unit) => sum + unit.reAudit.confirmedRouteTargetSuccessors, 0),
    confirmedResourceFieldSuccessors: units.reduce((sum, unit) => sum + unit.reAudit.confirmedResourceFieldSuccessors, 0),
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
