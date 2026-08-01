import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const ledgerFile = path.join(root, 'program', 'promise-delivery', 'ledger.json');
const releaseFile = path.join(root, 'content', 'governance', 'release-registry.json');
const outFile = path.join(root, 'content', 'governance', 'claim-registry.json');
const exceptionFile = path.join(root, 'content', 'governance', 'editorial-exception-registry.json');
const publicFile = path.join(root, 'api', 'claim-manifest.json');
const exceptionDecisionFile = path.join(root, 'content', 'governance', 'editorial-exception-decisions.json');
const claimDecisionFile = path.join(root, 'content', 'governance', 'claim-review-decisions.json');

const ledger = readJson(ledgerFile);
const release = readJson(releaseFile);
const objectByCanonicalId = new Map(release.objects.map((object) => [object.canonicalId, object]));
const objectByPath = new Map(release.objects.map((object) => [normalizePath(object.pathname), object]));

const claimDecisions = fs.existsSync(claimDecisionFile) ? readJson(claimDecisionFile).decisions : [];
const decisionByClaim = new Map(claimDecisions.map((item) => [item.promiseId, item]));
const claims = ledger.records.map(mapRecord).map(applyClaimDecision);
const exceptionOccurrences = claims
  .flatMap((claim) => claim.mappings.map((mapping) => ({ claim, mapping })))
  .filter(({ mapping }) => mapping.mappingType === 'editorial-exception')
  .map(({ claim, mapping }) => ({
    id: mapping.exceptionId,
    promiseId: claim.promiseId,
    occurrenceKey: mapping.occurrenceKey,
    route: mapping.route,
    element: mapping.element,
    target: mapping.target,
    exceptionClass: mapping.exceptionClass,
    rationale: mapping.rationale,
    owner: 'RN Collins / Aloha AI',
    approvalDecision: 'pending-review',
    approvedBy: null,
    approvedAt: null,
    nextReviewOrTrigger: 'Before R02 closure or any governed-language release',
    retiredAt: null
  }));
const exceptionDecisions = fs.existsSync(exceptionDecisionFile) ? readJson(exceptionDecisionFile).decisions : [];
const decisionByException = new Map(exceptionDecisions.map((item) => [item.exceptionId, item]));
const exceptions = groupExceptionContracts(exceptionOccurrences).map(applyExceptionDecision);

const errors = validate(claims, exceptions);
if (errors.length) {
  console.error(`Claim registry validation failed with ${errors.length} error(s):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

const counts = summarize(claims, exceptions);
writeJson(outFile, {
  schemaVersion: 1,
  generatedAt: new Date().toISOString(),
  baseline: {
    commit: ledger.baselineCommit,
    promiseRecords: ledger.counts.promiseRecords,
    promiseOccurrences: ledger.counts.totalPromiseOccurrences
  },
  policy: {
    completeCoverageRequired: true,
    unknownMappingsFailClosed: true,
    generatedOutputIsNotSource: true,
    editorialExceptionsRequireApproval: true,
    mappingPrecedence: ['resource-id', 'canonical-target', 'canonical-source-route', 'editorial-exception']
  },
  counts,
  claims
});
writeJson(exceptionFile, {
  schemaVersion: 1,
  generatedAt: new Date().toISOString(),
  policy: 'An exception excludes a promise from object-specific generation only after explicit approval; it does not waive truth, accessibility, interaction, destination, or release obligations.',
  counts: {
    contracts: exceptions.length,
    occurrences: exceptionOccurrences.length,
    pendingReview: exceptions.filter((item) => item.approvalDecision === 'pending-review').length,
    approved: exceptions.filter((item) => item.approvalDecision === 'classification-approved').length
  },
  exceptions
});
writeJson(publicFile, {
  schemaVersion: 1,
  generatedAt: new Date().toISOString(),
  notice: 'Public claim-to-object map. Editorial exceptions remain governed claims and are not evidence of fulfillment.',
  baseline: { promiseRecords: counts.promiseRecords, promiseOccurrences: counts.promiseOccurrences },
  counts,
  claims: claims.map(({ exactPromise, ...claim }) => ({ ...claim, promise: exactPromise }))
});

console.log(`Claim registry written for ${counts.promiseRecords} records and ${counts.promiseOccurrences} occurrences.`);
console.log(`${counts.objectMappedOccurrences} occurrences map to canonical objects; ${counts.editorialExceptionOccurrences} map to ${counts.editorialExceptionContracts} governed site-level exception contracts.`);

function mapRecord(record) {
  return {
    promiseId: record.id,
    category: record.category,
    exactPromise: record.exactPromise,
    priority: record.priority,
    baselineDisposition: record.disposition,
    baselineDefect: record.defect,
    governanceDecision: 'migration-pending-review',
    mappings: record.occurrences.map((occurrence, index) => mapOccurrence(record, occurrence, index))
  };
}

function applyClaimDecision(claim) {
  const decision = decisionByClaim.get(claim.promiseId);
  if (!decision) return claim;
  return {
    ...claim,
    governanceDecision: decision.governanceDecision,
    reviewedAt: decision.reviewedAt,
    reviewedBy: decision.reviewedBy,
    decisionBasis: decision.decisionBasis,
    permittedLanguageSources: decision.permittedLanguageSources,
    nextReviewOrTrigger: decision.nextReviewOrTrigger
  };
}

function mapOccurrence(record, occurrence, index) {
  const occurrenceKey = `${record.id}:${String(index + 1).padStart(3, '0')}`;
  const base = {
    occurrenceKey,
    route: occurrence.route,
    element: occurrence.element || null,
    target: occurrence.target || null,
    resourceId: occurrence.resourceId || null,
    field: occurrence.field || null,
    auditOrdinal: occurrence.auditOrdinal || null
  };
  if (record.category === 'resource-claim') {
    const object = objectByCanonicalId.get(occurrence.resourceId);
    return objectMapping(base, object, 'resource-id', 'The frozen resource claim names this canonical resource ID.');
  }
  const targetObject = objectByPath.get(normalizeTarget(occurrence.target));
  if (targetObject) return objectMapping(base, targetObject, 'canonical-target', 'The action opens this canonical object.');
  const sourceObject = objectByPath.get(normalizePath(occurrence.route));
  if (sourceObject) return objectMapping(base, sourceObject, 'canonical-source-route', 'The action is rendered inside this canonical object.');
  const exceptionClass = classifyException(occurrence);
  return {
    ...base,
    mappingType: 'editorial-exception',
    objectId: null,
    mappingBasis: 'editorial-exception',
    exceptionId: `EX-${stableHash(occurrenceKey)}`,
    exceptionClass,
    rationale: exceptionRationale(exceptionClass)
  };
}

function objectMapping(base, object, mappingBasis, rationale) {
  if (!object) throw new Error(`Missing canonical object for ${base.occurrenceKey}`);
  return {
    ...base,
    mappingType: 'canonical-object',
    objectId: object.id,
    mappingBasis,
    exceptionId: null,
    exceptionClass: null,
    rationale
  };
}

function classifyException(occurrence) {
  if (occurrence.element === 'form') return 'site-form';
  if (occurrence.element === 'disclosure') return 'browser-local-disclosure';
  if (occurrence.target === 'same-page state') return 'browser-local-control';
  if (typeof occurrence.target === 'string' && occurrence.target.startsWith('#')) return 'same-page-anchor';
  if (typeof occurrence.target === 'string' && /^(mailto:|https?:\/\/)/.test(occurrence.target)) return 'external-destination';
  if (occurrence.element === 'link') return 'site-navigation';
  if (occurrence.element === 'button') return 'site-action';
  return 'site-editorial';
}

function exceptionRationale(exceptionClass) {
  const rationales = {
    'site-form': 'Site-level form contract; no canonical product object owns the submission behavior.',
    'browser-local-disclosure': 'Browser-local disclosure state; governed by the shared interaction layer.',
    'browser-local-control': 'Browser-local control state; governed by the shared interaction layer.',
    'same-page-anchor': 'Same-page navigation contract; governed by route structure and destination depth.',
    'external-destination': 'External transition contract; governed by destination, ownership, and transition disclosure controls.',
    'site-navigation': 'Index or editorial navigation contract outside the canonical object set.',
    'site-action': 'Shared site action outside the canonical object set.',
    'site-editorial': 'Editorial site contract outside the canonical object set.'
  };
  return rationales[exceptionClass];
}

function validate(claims, exceptions) {
  const errors = [];
  if (claims.length !== ledger.counts.promiseRecords) errors.push(`record coverage ${claims.length}/${ledger.counts.promiseRecords}`);
  const mappings = claims.flatMap((claim) => claim.mappings);
  if (mappings.length !== ledger.counts.totalPromiseOccurrences) errors.push(`occurrence coverage ${mappings.length}/${ledger.counts.totalPromiseOccurrences}`);
  if (new Set(claims.map((claim) => claim.promiseId)).size !== claims.length) errors.push('duplicate promise IDs');
  if (new Set(mappings.map((mapping) => mapping.occurrenceKey)).size !== mappings.length) errors.push('duplicate occurrence keys');
  for (const claim of claims) {
    if (!claim.mappings.length) errors.push(`${claim.promiseId}: no occurrence mappings`);
    if (claim.governanceDecision !== 'approved-governed-mapping') errors.push(`${claim.promiseId}: claim decision is not approved`);
    for (const mapping of claim.mappings) {
      if (mapping.mappingType === 'canonical-object' && !release.objects.some((object) => object.id === mapping.objectId)) errors.push(`${mapping.occurrenceKey}: unknown object ${mapping.objectId}`);
      if (mapping.mappingType === 'editorial-exception' && !mapping.exceptionId) errors.push(`${mapping.occurrenceKey}: exception ID missing`);
      if (!['canonical-object', 'editorial-exception'].includes(mapping.mappingType)) errors.push(`${mapping.occurrenceKey}: unknown mapping type`);
    }
  }
  const exceptionOccurrenceCount = exceptions.reduce((sum, item) => sum + item.occurrenceKeys.length, 0);
  const mappedExceptionCount = mappings.filter((item) => item.mappingType === 'editorial-exception').length;
  if (exceptionOccurrenceCount !== mappedExceptionCount) errors.push(`exception occurrence coverage ${exceptionOccurrenceCount}/${mappedExceptionCount}`);
  if (exceptions.some((item) => item.approvalDecision === 'classification-approved' && (!item.approvedBy || !item.approvedAt))) errors.push('approved exception lacks approval evidence');
  return errors;
}

function summarize(claims, exceptions) {
  const mappings = claims.flatMap((claim) => claim.mappings);
  const byBasis = countBy(mappings, 'mappingBasis');
  const byExceptionClass = countBy(exceptions, 'exceptionClass');
  return {
    promiseRecords: claims.length,
    promiseOccurrences: mappings.length,
    canonicalObjects: release.objects.length,
    objectMappedOccurrences: mappings.filter((item) => item.mappingType === 'canonical-object').length,
    editorialExceptionContracts: exceptions.length,
    editorialExceptionOccurrences: exceptions.reduce((sum, item) => sum + item.occurrenceKeys.length, 0),
    approvedEditorialExceptions: exceptions.filter((item) => item.approvalDecision === 'classification-approved').length,
    pendingEditorialExceptions: exceptions.filter((item) => item.approvalDecision === 'pending-review').length,
    byMappingBasis: byBasis,
    byExceptionClass
  };
}

function groupExceptionContracts(occurrences) {
  const grouped = new Map();
  for (const item of occurrences) {
    const key = `${item.promiseId}:${item.exceptionClass}`;
    if (!grouped.has(key)) {
      grouped.set(key, {
        id: `EXC-${stableHash(key)}`,
        promiseId: item.promiseId,
        exactPromise: item.claim?.exactPromise || claims.find((claim) => claim.promiseId === item.promiseId)?.exactPromise,
        exceptionClass: item.exceptionClass,
        rationale: item.rationale,
        occurrenceKeys: [],
        routes: [],
        owner: item.owner,
        approvalDecision: item.approvalDecision,
        approvedBy: null,
        approvedAt: null,
        nextReviewOrTrigger: item.nextReviewOrTrigger,
        retiredAt: null
      });
    }
    const contract = grouped.get(key);
    contract.occurrenceKeys.push(item.occurrenceKey);
    if (!contract.routes.includes(item.route)) contract.routes.push(item.route);
  }
  return [...grouped.values()].sort((a, b) => a.id.localeCompare(b.id));
}

function applyExceptionDecision(exception) {
  const decision = decisionByException.get(exception.id);
  if (!decision) return exception;
  return {
    ...exception,
    approvalDecision: decision.approvalDecision,
    approvedBy: decision.reviewedBy,
    approvedAt: decision.reviewedAt,
    nextReviewOrTrigger: decision.nextReviewOrTrigger,
    decisionBasis: decision.decisionBasis
  };
}

function normalizeTarget(target) {
  if (typeof target !== 'string' || !target.startsWith('/')) return null;
  return normalizePath(target.split(/[?#]/)[0]);
}

function normalizePath(value) {
  if (typeof value !== 'string') return null;
  const normalized = value.split(/[?#]/)[0].replace(/\/index\.html$/, '').replace(/\.html$/, '').replace(/\/$/, '');
  return normalized || '/';
}

function stableHash(value) {
  return crypto.createHash('sha256').update(value).digest('hex').slice(0, 12).toUpperCase();
}

function countBy(items, key) {
  return items.reduce((counts, item) => ({ ...counts, [item[key]]: (counts[item[key]] || 0) + 1 }), {});
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function writeJson(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}
