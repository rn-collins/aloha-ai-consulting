import fs from 'node:fs';
import path from 'node:path';
import { expandEducationResources } from '../lib/site/university-model.js';
import { supportedKinds } from '../lib/site/template-registry.js';

const root = process.cwd();
const contentRoot = path.join(root, 'content');
const outFile = path.join(root, 'content', 'governance', 'release-registry.json');
const publicFile = path.join(root, 'api', 'release-manifest.json');
const reviewFile = path.join(root, 'content', 'governance', 'release-review-decisions.json');
const allowed = {
  publication: ['published', 'unpublished'],
  completeness: ['complete', 'partial', 'research'],
  interaction: ['working', 'demonstration', 'read-only', 'none'],
  integration: ['verified', 'planned', 'none'],
  access: ['public', 'closed', 'commissioned', 'unavailable'],
  commercial: ['available', 'scoped', 'unavailable', 'not-applicable'],
  maintenance: ['maintained', 'dated', 'unmaintained', 'not-applicable'],
  evaluation: ['passed', 'limited', 'not-evaluated', 'not-applicable'],
  evidence: ['published', 'internal', 'described', 'missing']
};

const resources = expandEducationResources(loadResources(contentRoot)).filter((item) => supportedKinds.includes(item.kind));
const reviewDecisions = fs.existsSync(reviewFile) ? readJson(reviewFile).decisions : [];
const decisionByObject = new Map(reviewDecisions.map((item) => [item.objectId, item]));
const objects = resources.map(toReleaseObject).map(applyReviewDecision).sort((a, b) => a.id.localeCompare(b.id));
const errors = validate(objects);
if (errors.length) {
  console.error(`Release registry validation failed with ${errors.length} error(s):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

const registry = {
  schemaVersion: 1,
  generatedAt: new Date().toISOString(),
  policy: {
    maturityIsDerived: true,
    unknownStatesFailClosed: true,
    governedTerms: ['Live', 'Production', 'Public beta', 'available', 'maintained', 'current', 'connected', 'operating'],
    statusDimensions: allowed
  },
  counts: { objects: objects.length, byKind: countBy(objects, 'objectType') },
  objects
};
writeJson(outFile, registry);
writeJson(publicFile, {
  schemaVersion: registry.schemaVersion,
  generatedAt: registry.generatedAt,
  notice: 'Machine-readable release state. A published page is not proof of operational, commercial, maintenance, or evaluation status.',
  objects: objects.map(({ sourceFile, supersessionHistory, ...item }) => item)
});
console.log(`Release registry written for ${objects.length} canonical objects.`);

function toReleaseObject(resource) {
  const text = JSON.stringify(resource).toLowerCase();
  const isTool = resource.kind === 'tool';
  const isMonitor = resource.kind === 'monitor';
  const isCourse = ['course', 'lesson', 'learning-path'].includes(resource.kind);
  const demo = Boolean(resource.demo) || /demonstration|prototype|preview/.test(text);
  const explicitlyUnavailable = /unavailable|no public sign-in|no checkout|enrollment is closed|not available/.test(text);
  const limitations = Array.isArray(resource.limitations) ? resource.limitations : [];
  const evidence = Array.isArray(resource.evidence) ? resource.evidence : [];
  const effectiveDate = resource.effectiveDate || resource.updatedAt || null;
  return {
    id: `${resource.kind}:${resource.id}`,
    canonicalId: resource.id,
    objectType: resource.kind,
    pathname: resource.pathname,
    title: resource.title,
    owner: resource.owner || 'RN Collins / Aloha AI',
    version: resource.version || 'unversioned',
    effectiveDate,
    lastReviewedOrTested: resource.lastReviewedOrTested || null,
    nextReviewOrTrigger: resource.nextReviewOrTrigger || null,
    problemFamily: resource.problemFamily || 'unassigned',
    commercialLadder: resource.commercialLadder || (['service', 'engagement'].includes(resource.kind) ? 'Audit' : 'not-applicable'),
    lifecycleState: resource.lifecycleState || 'migration-required',
    status: {
      publication: 'published',
      completeness: demo || isCourse ? 'partial' : 'research',
      interaction: isTool ? (demo ? 'demonstration' : 'working') : 'read-only',
      integration: 'none',
      access: explicitlyUnavailable ? 'unavailable' : 'public',
      commercial: ['service', 'engagement'].includes(resource.kind) ? 'scoped' : 'not-applicable',
      maintenance: isMonitor ? 'unmaintained' : 'not-applicable',
      evaluation: isTool ? 'not-evaluated' : 'not-applicable',
      evidence: evidence.length ? 'described' : 'missing'
    },
    limitations,
    privacyBoundary: resource.privacyBoundary || 'No canonical privacy boundary recorded for this object.',
    evidenceLinks: Array.isArray(resource.evidenceLinks) ? resource.evidenceLinks : [],
    approvalDecision: 'migration-pending-review',
    supersessionHistory: [],
    dependencies: (resource.relationships || []).filter((r) => ['implements', 'requires', 'depends-on'].includes(r.type)).map((r) => r.target),
    permittedPublicLanguage: permittedLanguage({ resource, demo, explicitlyUnavailable, isMonitor }),
    sourceFile: resource.sourceFile,
    releaseReview: resource.releaseReview || null
  };
}

function applyReviewDecision(object) {
  const decision = decisionByObject.get(object.id) || embeddedReviewDecision(object);
  const { releaseReview, ...cleanObject } = object;
  if (!decision) return cleanObject;
  return {
    ...cleanObject,
    lifecycleState: decision.lifecycleState,
    status: decision.status,
    lastReviewedOrTested: decision.reviewedAt,
    nextReviewOrTrigger: decision.nextReviewOrTrigger,
    approvalDecision: decision.approvalDecision,
    permittedPublicLanguage: decision.permittedPublicLanguage,
    reviewEvidence: decision.reviewEvidence,
    governanceControls: decision.governanceControls,
    decisionBasis: decision.decisionBasis
  };
}

function embeddedReviewDecision(object) {
  if (!object.releaseReview) return null;
  const review = object.releaseReview;
  return {
    approvalDecision: 'approved-conservative-local',
    reviewedAt: review.reviewedAt,
    lifecycleState: 'locally-reviewed-not-release-certified',
    status: review.status,
    reviewEvidence: { sourceFile: object.sourceFile, publicRoute: object.pathname, generatedPagePresent: true, browserLocalInteractionDetected: false, evidenceLinksRecorded: object.evidenceLinks.length },
    nextReviewOrTrigger: review.nextReviewOrTrigger,
    governanceControls: {
      contradiction: { state: 'registry-consistent', basis: 'The reviewed dimensional state is the controlling release record; stronger authored maturity labels are not authorized.' },
      staleness: { state: 'review-current', reviewedAt: review.reviewedAt, reviewBy: review.reviewBy, staleAfterDays: review.staleAfterDays, actionWhenStale: 'Fail release certification and render no stronger claim until re-reviewed.' },
      dependency: { state: 'declared-not-release-certified', declaredCanonicalIds: object.dependencies, resolvedObjectIds: [], unresolvedCanonicalIds: object.dependencies, releaseReady: false, action: 'Resolve each dependency to a governed object or site system before certifying dependent operation.' },
      supersession: { state: 'current-no-predecessor-recorded', supersedes: [], supersededBy: null, actionWhenSuperseded: 'Remove from current collections, retain the historical record, and redirect to the successor where appropriate.' },
      capacity: { state: 'not-applicable', basis: 'Capacity is not a release dimension for this object type.' },
      contractingIdentity: { state: 'not-applicable', entity: null, acceptanceInstrument: null },
      professionalAccountability: { state: 'bounded', accountablePublisher: 'RN Collins / Aloha AI', boundary: 'This resource is a bounded public statement, not legal advice, legal compliance, or third-party certification.', escalation: 'Qualified professional review remains required where law, contract, or institutional policy requires it.' }
    },
    permittedPublicLanguage: review.permittedPublicLanguage,
    decisionBasis: review.decisionBasis
  };
}

function permittedLanguage({ resource, demo, explicitlyUnavailable, isMonitor }) {
  if (explicitlyUnavailable) return 'Published description; the represented access or acquisition path is unavailable.';
  if (isMonitor) return 'Published dated monitor record; ongoing maintenance is not certified.';
  if (demo) return 'Published demonstration or preview; production operation and general availability are not certified.';
  if (resource.kind === 'tool') return 'Published browser interface; integration, evaluation, and production operation are not certified.';
  return 'Published research or delivery description; publication does not certify completeness, availability, or operation.';
}

function validate(objects) {
  const errors = [];
  const ids = new Set();
  for (const object of objects) {
    if (ids.has(object.id)) errors.push(`${object.id}: duplicate ID`);
    ids.add(object.id);
    for (const [dimension, values] of Object.entries(allowed)) {
      if (!values.includes(object.status[dimension])) errors.push(`${object.id}: invalid ${dimension} state`);
    }
    if (object.status.maintenance === 'maintained' && (!object.lastReviewedOrTested || !object.nextReviewOrTrigger)) errors.push(`${object.id}: maintained without dated review controls`);
    if (object.status.integration === 'verified' && object.status.evidence === 'missing') errors.push(`${object.id}: verified integration without evidence`);
    if (object.status.commercial === 'available' && object.status.access === 'unavailable') errors.push(`${object.id}: commercially available but inaccessible`);
    if (!object.permittedPublicLanguage) errors.push(`${object.id}: missing permitted language`);
    if (object.approvalDecision === 'approved-conservative-local' && !object.governanceControls) errors.push(`${object.id}: approved without governance controls`);
    if (object.governanceControls?.capacity?.state === 'available') errors.push(`${object.id}: capacity cannot be inferred from publication`);
    if (object.status.commercial === 'scoped' && object.governanceControls?.contractingIdentity?.state !== 'defined') errors.push(`${object.id}: scoped service lacks contracting identity`);
  }
  return errors;
}

function loadResources(directory) {
  const loaded = [];
  for (const file of walk(directory).filter((candidate) => candidate.endsWith('.json') && !candidate.endsWith('release-registry.json'))) {
    const parsed = JSON.parse(fs.readFileSync(file, 'utf8'));
    for (const item of Array.isArray(parsed) ? parsed : [parsed]) {
      if (!item || typeof item !== 'object' || !item.id || !item.kind || !item.pathname) continue;
      loaded.push({ ...item, sourceFile: path.relative(root, file) });
    }
  }
  return loaded;
}

function walk(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}

function countBy(items, key) {
  return items.reduce((counts, item) => ({ ...counts, [item[key]]: (counts[item[key]] || 0) + 1 }), {});
}

function writeJson(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}
