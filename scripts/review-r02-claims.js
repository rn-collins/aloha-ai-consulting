import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const claims = read('content/governance/claim-registry.json').claims;
const release = read('content/governance/release-registry.json');
const exceptions = read('content/governance/editorial-exception-registry.json');
const objectById = new Map(release.objects.map((item) => [item.id, item]));
const exceptionByPromiseAndClass = new Map(exceptions.exceptions.map((item) => [`${item.promiseId}:${item.exceptionClass}`, item]));
const reviewedAt = '2026-07-31';
const reviewedBy = 'Aloha AI remediation program';

const decisions = claims.map((claim) => {
  const objectIds = [...new Set(claim.mappings.filter((item) => item.mappingType === 'canonical-object').map((item) => item.objectId))];
  const exceptionKeys = [...new Set(claim.mappings.filter((item) => item.mappingType === 'editorial-exception').map((item) => `${claim.promiseId}:${item.exceptionClass}`))];
  const objects = objectIds.map((id) => objectById.get(id));
  const contracts = exceptionKeys.map((key) => exceptionByPromiseAndClass.get(key));
  if (objects.some((item) => !item || item.approvalDecision !== 'approved-conservative-local')) throw new Error(`${claim.promiseId}: unapproved canonical object`);
  if (contracts.some((item) => !item || item.approvalDecision !== 'classification-approved')) throw new Error(`${claim.promiseId}: unapproved site-system contract`);
  return {
    promiseId: claim.promiseId,
    governanceDecision: 'approved-governed-mapping',
    reviewedAt,
    reviewedBy,
    mappedObjectIds: objectIds,
    mappedExceptionContractIds: contracts.map((item) => item.id),
    permittedLanguageSources: objects.map((item) => ({ objectId: item.id, permittedPublicLanguage: item.permittedPublicLanguage })),
    decisionBasis: `Every occurrence is assigned to ${objectIds.length} reviewed canonical object(s) and ${contracts.length} approved site-system contract(s). Approval governs ownership and permitted release language; it does not certify the baseline wording or waive remaining fulfillment and QA obligations.`,
    nextReviewOrTrigger: 'On canonical object, occurrence, destination, renderer, or release-state change and before release certification'
  };
});

if (decisions.length !== 4289 || new Set(decisions.map((item) => item.promiseId)).size !== 4289) throw new Error(`Claim decision coverage ${decisions.length}/4289`);
write('content/governance/claim-review-decisions.json', {
  schemaVersion: 1,
  reviewedAt,
  reviewer: reviewedBy,
  policy: 'Claim approval confirms complete governed mapping. Visible release language must come from the reviewed canonical object; site-system classification does not certify behavior.',
  counts: { decisions: decisions.length, approvedGovernedMappings: decisions.length },
  decisions
});
console.log(`Reviewed ${decisions.length} frozen promise records.`);

function read(file) { return JSON.parse(fs.readFileSync(path.join(root, file), 'utf8')); }
function write(file, value) { fs.writeFileSync(path.join(root, file), `${JSON.stringify(value, null, 2)}\n`); }
