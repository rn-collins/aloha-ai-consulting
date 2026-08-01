import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const releaseFile = path.join(root, 'content/governance/release-registry.json');
const exceptionFile = path.join(root, 'content/governance/editorial-exception-registry.json');
const objectDecisionFile = path.join(root, 'content/governance/release-review-decisions.json');
const exceptionDecisionFile = path.join(root, 'content/governance/editorial-exception-decisions.json');
const reviewDate = '2026-07-31';
const reviewer = 'Aloha AI remediation program';
const contractingIdentity = 'Rayven-Nikkita Collins LLC d/b/a Aloha AI';

const release = readJson(releaseFile);
const exceptionRegistry = readJson(exceptionFile);
const releaseByCanonicalId = new Map(release.objects.map((item) => [item.canonicalId, item]));

const objectDecisions = release.objects.map(reviewObject);
const exceptionDecisions = exceptionRegistry.exceptions.map(reviewException);

validateObjectDecisions(objectDecisions, release.objects);
validateExceptionDecisions(exceptionDecisions, exceptionRegistry.exceptions);

writeJson(objectDecisionFile, {
  schemaVersion: 1,
  reviewedAt: reviewDate,
  reviewer,
  policy: 'Conservative repository-evidence review. Publication and local interaction do not certify integration, production operation, maintenance, evaluation, commercial availability, or external delivery.',
  counts: {
    decisions: objectDecisions.length,
    approved: objectDecisions.filter((item) => item.approvalDecision === 'approved-conservative-local').length
  },
  decisions: objectDecisions
});

writeJson(exceptionDecisionFile, {
  schemaVersion: 1,
  reviewedAt: reviewDate,
  reviewer,
  policy: 'Approval confirms only that the occurrence is owned by a shared site-level contract rather than a canonical product object. It does not certify truth, behavior, accessibility, destination depth, or production operation.',
  counts: { decisions: exceptionDecisions.length, classificationApproved: exceptionDecisions.length },
  decisions: exceptionDecisions
});

console.log(`Reviewed ${objectDecisions.length} canonical objects and ${exceptionDecisions.length} editorial-exception contracts.`);

function reviewObject(object) {
  const pageFile = routeFile(object.pathname);
  const pageExists = fs.existsSync(pageFile);
  const html = pageExists ? fs.readFileSync(pageFile, 'utf8') : '';
  const interactive = /<(form|button|input|select|textarea)\b|data-(assessment|tool|action|score|question)/i.test(html);
  const deliveryLike = ['assessment', 'course', 'institutional', 'learningHub', 'monitor', 'product', 'service', 'tool'].includes(object.objectType);
  const contentLike = ['lesson', 'playbook', 'policy', 'research', 'template', 'toolGuide', 'useCase'].includes(object.objectType);
  const monitor = object.objectType === 'monitor';
  const maintainedCannabisMonitor = object.canonicalId === 'cannabis-rescheduling'
    && object.version === '1.0.0'
    && object.lastReviewedOrTested === reviewDate
    && object.nextReviewOrTrigger;
  const toolLike = ['assessment', 'tool'].includes(object.objectType);
  const unavailable = object.status.access === 'unavailable' && object.canonicalId !== 'cannabis-rescheduling';
  const evidenceLinks = object.evidenceLinks || [];
  const dependencyObjects = object.dependencies.map((id) => releaseByCanonicalId.get(id)).filter(Boolean);

  const status = {
    publication: pageExists ? 'published' : 'unpublished',
    completeness: contentLike ? 'complete' : deliveryLike ? 'partial' : 'research',
    interaction: toolLike ? (interactive ? 'working' : 'demonstration') : 'read-only',
    integration: 'none',
    access: unavailable ? 'unavailable' : pageExists ? 'public' : 'unavailable',
    commercial: object.objectType === 'service' ? 'scoped' : 'not-applicable',
    maintenance: maintainedCannabisMonitor ? 'maintained' : monitor ? 'dated' : 'not-applicable',
    evaluation: toolLike ? 'not-evaluated' : 'not-applicable',
    evidence: evidenceLinks.length ? 'published' : object.status.evidence === 'described' ? 'described' : 'missing'
  };

  return {
    objectId: object.id,
    approvalDecision: 'approved-conservative-local',
    reviewedAt: reviewDate,
    reviewedBy: reviewer,
    lifecycleState: 'locally-reviewed-not-release-certified',
    status,
    reviewEvidence: {
      sourceFile: object.sourceFile,
      publicRoute: object.pathname,
      generatedPagePresent: pageExists,
      browserLocalInteractionDetected: interactive,
      evidenceLinksRecorded: evidenceLinks.length
    },
    nextReviewOrTrigger: 'Before public renderer enforcement, deployment, material source change, or release certification',
    governanceControls: {
      contradiction: {
        state: 'registry-consistent',
        basis: 'The reviewed dimensional state is the controlling release record; stronger authored maturity labels are not authorized.'
      },
      staleness: {
        state: 'review-current',
        reviewedAt: reviewDate,
        reviewBy: maintainedCannabisMonitor ? '2026-08-07' : '2026-10-31',
        staleAfterDays: maintainedCannabisMonitor ? 8 : 92,
        actionWhenStale: maintainedCannabisMonitor
          ? 'Render the monitor stale, preserve the last verified as-of record, and require direct primary-source review before reliance.'
          : 'Fail release certification and render no stronger claim until re-reviewed.'
      },
      dependency: {
        state: object.dependencies.length ? 'declared-not-release-certified' : 'none-declared',
        declaredCanonicalIds: object.dependencies,
        resolvedObjectIds: dependencyObjects.map((item) => item.id),
        unresolvedCanonicalIds: object.dependencies.filter((id) => !releaseByCanonicalId.has(id)),
        releaseReady: object.dependencies.length === 0,
        action: object.dependencies.length ? 'Resolve each dependency to a governed object or site system before certifying dependent operation.' : 'No canonical dependency was declared in the source record.'
      },
      supersession: {
        state: 'current-no-predecessor-recorded',
        supersedes: [],
        supersededBy: null,
        actionWhenSuperseded: 'Remove from current collections, retain the historical record, and redirect to the successor where appropriate.'
      },
      capacity: {
        state: object.objectType === 'service' ? 'not-certified' : 'not-applicable',
        basis: object.objectType === 'service' ? 'Public scope does not prove scheduling capacity, acceptance, staffing, or delivery availability.' : 'Capacity is not a release dimension for this object type.'
      },
      contractingIdentity: {
        state: object.objectType === 'service' ? 'defined' : 'not-applicable',
        entity: object.objectType === 'service' ? contractingIdentity : null,
        acceptanceInstrument: object.objectType === 'service' ? 'Written agreement signed by the contracting entity and client' : null
      },
      professionalAccountability: {
        state: 'bounded',
        accountablePublisher: 'RN Collins / Aloha AI',
        boundary: 'RN Collins is a JD candidate, not a licensed attorney. The resource does not replace legal, medical, tax, clinical, security, or other licensed professional judgment.',
        escalation: 'A qualified licensed or organizational professional remains responsible for consequential decisions where required.'
      }
    },
    permittedPublicLanguage: languageFor(object, status),
    decisionBasis: basisFor(object, status)
  };
}

function reviewException(exception) {
  return {
    exceptionId: exception.id,
    approvalDecision: 'classification-approved',
    reviewedAt: reviewDate,
    reviewedBy: reviewer,
    exceptionClass: exception.exceptionClass,
    occurrenceCount: exception.occurrenceKeys.length,
    decisionBasis: `${exception.rationale} Classification approval does not waive verification of the underlying ${exception.exceptionClass} contract.`,
    nextReviewOrTrigger: 'On route, target, control, form, or shared interaction-layer change and before release certification'
  };
}

function languageFor(object, status) {
  if (status.publication === 'unpublished') return 'No public page is certified for this object.';
  if (object.canonicalId === 'cannabis-rescheduling' && status.maintenance === 'maintained') return 'Maintained beta · manually reviewed against the defined federal source set each Friday; current only through the stated as-of date.';
  if (status.access === 'unavailable') return 'A public description exists; the represented access or delivery path is unavailable.';
  if (object.objectType === 'monitor') return 'Published dated monitor record; ongoing maintenance and currentness are not certified.';
  if (['assessment', 'tool'].includes(object.objectType)) return `Published browser-local ${object.objectType}; external integration, validated evaluation, and production operation are not certified.`;
  if (object.objectType === 'service') return 'Published scoped service description; capacity, engagement acceptance, and delivery are confirmed only through a written engagement.';
  if (['course', 'institutional', 'learningHub', 'product'].includes(object.objectType)) return 'Published partial delivery resource; completeness, enrollment, external delivery, and commercial availability are not certified.';
  return 'Published content resource; publication does not certify ongoing maintenance, external delivery, or professional suitability.';
}

function basisFor(object, status) {
  const facts = [
    status.publication === 'published' ? 'A generated public route exists.' : 'No generated public route exists.',
    `The canonical source is ${object.sourceFile}.`,
    status.interaction === 'working' ? 'Browser-local controls are present; repository tests remain the only local behavioral evidence.' : 'No operational interaction is certified.',
    'No external integration or production deployment evidence is recorded in the canonical object.',
    status.evaluation === 'not-evaluated' ? 'No published evaluation dataset or performance result is recorded.' : 'No evaluation claim is applicable to this object type.'
  ];
  return facts.join(' ');
}

function validateObjectDecisions(decisions, objects) {
  if (decisions.length !== objects.length) throw new Error(`Object decision coverage ${decisions.length}/${objects.length}`);
  if (new Set(decisions.map((item) => item.objectId)).size !== objects.length) throw new Error('Duplicate object decision ID');
  for (const decision of decisions) {
    if (decision.status.integration !== 'none') throw new Error(`${decision.objectId}: integration exceeds local proof`);
    if (decision.status.maintenance === 'maintained' && decision.objectId !== 'monitor:cannabis-rescheduling') throw new Error(`${decision.objectId}: maintenance exceeds local proof`);
    if (decision.status.evaluation === 'passed') throw new Error(`${decision.objectId}: evaluation exceeds local proof`);
    if (!decision.governanceControls) throw new Error(`${decision.objectId}: governance controls missing`);
    if (decision.governanceControls.capacity.state === 'available') throw new Error(`${decision.objectId}: capacity exceeds local proof`);
    if (decision.governanceControls.dependency.declaredCanonicalIds.length && decision.governanceControls.dependency.releaseReady) throw new Error(`${decision.objectId}: dependency readiness exceeds local proof`);
    if (decision.status.commercial === 'scoped' && decision.governanceControls.contractingIdentity.state !== 'defined') throw new Error(`${decision.objectId}: scoped service lacks contracting identity`);
    if (decision.governanceControls.professionalAccountability.state !== 'bounded') throw new Error(`${decision.objectId}: professional boundary missing`);
  }
}

function validateExceptionDecisions(decisions, exceptions) {
  if (decisions.length !== exceptions.length) throw new Error(`Exception decision coverage ${decisions.length}/${exceptions.length}`);
  if (new Set(decisions.map((item) => item.exceptionId)).size !== exceptions.length) throw new Error('Duplicate exception decision ID');
}

function routeFile(pathname) {
  if (pathname === '/') return path.join(root, 'index.html');
  return path.join(root, `${pathname.replace(/^\//, '').replace(/\/$/, '')}.html`);
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function writeJson(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}
