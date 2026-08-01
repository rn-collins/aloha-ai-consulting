import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

test('freezes and reconciles the complete promise-delivery baseline', () => {
  const freeze = JSON.parse(fs.readFileSync('program/promise-delivery/freeze.json', 'utf8'));
  const ledger = JSON.parse(fs.readFileSync('program/promise-delivery/ledger.json', 'utf8'));
  assert.equal(freeze.counts.staticHtmlRoutes, freeze.counts.publicRouteSurfaces);
  assert.equal(freeze.routes.length, freeze.counts.publicRouteSurfaces);
  assert.equal(freeze.counts.publicRouteSurfaces, freeze.counts.sitemapRoutes + 1);
  assert.equal(ledger.records.length, ledger.counts.promiseRecords);
  assert.equal(ledger.counts.unclassifiedRecords, 0);
  assert.equal(new Set(ledger.records.map((record) => record.id)).size, ledger.records.length);
  assert.ok(ledger.records.every((record) => record.occurrences.length && record.disposition && record.acceptanceCriteria));
});

test('keeps every audited interactive occurrence in the promise ledger', () => {
  const ledger = JSON.parse(fs.readFileSync('program/promise-delivery/ledger.json', 'utf8'));
  const actionOccurrences = ledger.records
    .filter((record) => record.category === 'public-action')
    .reduce((sum, record) => sum + record.occurrences.length, 0);
  assert.equal(actionOccurrences, ledger.counts.interactiveOccurrences);
});

test('R01 preserves the frozen baseline and blocks known S0 reliance language', () => {
  const ledger = JSON.parse(fs.readFileSync('program/promise-delivery/ledger.json', 'utf8'));
  const manifest = JSON.parse(fs.readFileSync('program/promise-delivery/remediation/r01/s0-occurrence-manifest.json', 'utf8'));
  assert.equal(ledger.counts.promiseRecords, 4289);
  assert.equal(ledger.counts.totalPromiseOccurrences, 9552);
  assert.equal(manifest.sourceLedgerRecords, 4289);
  assert.equal(manifest.sourceLedgerOccurrences, 9552);
  assert.equal(manifest.countsByClass['R01-S0-PURCHASE'], 6);
  assert.ok(manifest.occurrences.every((row) => row.finalBuildObligationPreserved));

  const governedFiles = [
    'content/products/regulatory-intelligence.json',
    'content/platform/platform-resources.json',
    'content/platform/workspace.json',
    'content/research/research-notes.json',
    'content/services/remaining-services.json',
    'content/university/institutional/institutional.json',
    'trust-stack/regulatory-intelligence.html',
    'workspace.html',
    'ce.html',
    'notes/tool-workflow-operating-system.html'
  ];
  const publicText = governedFiles.map((file) => fs.readFileSync(file, 'utf8')).join('\n');
  for (const prohibited of [
    'Checkout is handled by Gumroad',
    'both running, not diagrams',
    'checks each one against a real source',
    'Creator Content System in action',
    'Course content is submission-ready',
    'Join the list to be notified',
    'collins.ra@northeastern.edu',
    'Sign in or create an account'
  ]) {
    assert.equal(publicText.includes(prohibited), false, `R01 prohibited claim remains: ${prohibited}`);
  }
});

test('R02 release registry covers and conservatively decides every canonical resource', () => {
  const registry = JSON.parse(fs.readFileSync('content/governance/release-registry.json', 'utf8'));
  const manifest = JSON.parse(fs.readFileSync('api/release-manifest.json', 'utf8'));
  assert.equal(registry.counts.objects, 257);
  assert.equal(registry.objects.length, 257);
  assert.equal(manifest.objects.length, 257);
  assert.equal(new Set(registry.objects.map((object) => object.id)).size, 257);
  assert.ok(registry.objects.every((object) => object.approvalDecision === 'approved-conservative-local'));
  assert.ok(registry.objects.every((object) => object.lifecycleState === 'locally-reviewed-not-release-certified'));
  assert.ok(registry.objects.every((object) => object.lastReviewedOrTested === '2026-07-31'));
  assert.ok(registry.objects.every((object) => object.permittedPublicLanguage));
  assert.ok(registry.objects.every((object) => object.status.publication === 'published'));
  assert.ok(registry.objects.every((object) => object.status.integration !== 'verified'));
  const maintainedMonitors = registry.objects.filter((object) => object.status.maintenance === 'maintained');
  assert.deepEqual(maintainedMonitors.map((object) => object.id), ['monitor:cannabis-rescheduling', 'monitor:psychedelic-radar']);
  assert.ok(registry.objects.every((object) => object.governanceControls?.contradiction?.state === 'registry-consistent'));
  assert.ok(registry.objects.filter((object) => !['monitor:cannabis-rescheduling', 'monitor:psychedelic-radar'].includes(object.id)).every((object) => object.governanceControls?.staleness?.reviewBy === '2026-10-31'));
  assert.ok(maintainedMonitors.every((object) => object.governanceControls.staleness.reviewBy === '2026-08-07'));
  assert.ok(registry.objects.filter((object) => object.objectType === 'service').every((object) => object.governanceControls.capacity.state === 'not-certified'));
  assert.ok(registry.objects.filter((object) => object.objectType === 'service').every((object) => object.governanceControls.contractingIdentity.entity === 'Rayven-Nikkita Collins LLC d/b/a Aloha AI'));
  assert.ok(registry.objects.every((object) => object.governanceControls?.professionalAccountability?.state === 'bounded'));
  assert.ok(registry.objects.filter((object) => object.dependencies.length).every((object) => object.governanceControls.dependency.releaseReady === false));
});

test('R02 claim registry reconciles every frozen record and governs every site-level exception', () => {
  const ledger = JSON.parse(fs.readFileSync('program/promise-delivery/ledger.json', 'utf8'));
  const registry = JSON.parse(fs.readFileSync('content/governance/claim-registry.json', 'utf8'));
  const exceptions = JSON.parse(fs.readFileSync('content/governance/editorial-exception-registry.json', 'utf8'));
  const mappings = registry.claims.flatMap((claim) => claim.mappings);

  assert.equal(registry.claims.length, ledger.counts.promiseRecords);
  assert.equal(mappings.length, ledger.counts.totalPromiseOccurrences);
  assert.equal(new Set(registry.claims.map((claim) => claim.promiseId)).size, ledger.counts.promiseRecords);
  assert.equal(new Set(mappings.map((mapping) => mapping.occurrenceKey)).size, ledger.counts.totalPromiseOccurrences);
  assert.ok(mappings.every((mapping) => ['canonical-object', 'editorial-exception'].includes(mapping.mappingType)));
  assert.equal(exceptions.exceptions.length, registry.counts.editorialExceptionContracts);
  assert.equal(exceptions.exceptions.reduce((sum, exception) => sum + exception.occurrenceKeys.length, 0), registry.counts.editorialExceptionOccurrences);
  assert.equal(exceptions.counts.pendingReview, 0);
  assert.equal(exceptions.counts.approved, 287);
  assert.ok(exceptions.exceptions.every((exception) => exception.approvalDecision === 'classification-approved'));
  assert.ok(exceptions.exceptions.every((exception) => exception.approvedBy && exception.approvedAt && exception.decisionBasis));
  assert.ok(registry.claims.every((claim) => claim.governanceDecision === 'approved-governed-mapping'));
  assert.ok(registry.claims.every((claim) => claim.reviewedBy && claim.reviewedAt && claim.decisionBasis));
});

test('R07 assurance foundation fails closed without overstating evaluation or certification', () => {
  const assurance = JSON.parse(fs.readFileSync('content/governance/assurance-registry.json', 'utf8'));
  const manifest = JSON.parse(fs.readFileSync('api/assurance-manifest.json', 'utf8'));
  assert.equal(assurance.methodConformance.controls.length, 12);
  assert.equal(assurance.methodConformance.exceptions.length, 0);
  assert.equal(assurance.methodConformance.decision, 'foundation-approved-not-site-certified');
  assert.equal(assurance.highStakesEvaluationQueue.length, 5);
  assert.ok(assurance.highStakesEvaluationQueue.every((item) => item.state === 'not-evaluated' && item.requiredNext));
  assert.equal(assurance.siteAssuranceDomains.length, 7);
  assert.ok(assurance.siteAssuranceDomains.every((item) => item.state === 'required-not-yet-certified' && item.requiredEvidence));
  assert.equal(manifest.counts.methodControls, 12);
  assert.equal(manifest.counts.evaluatedHighStakesTools, 0);
  assert.equal(manifest.counts.assuranceDomainsCertified, 0);
  assert.equal(manifest.counts.errors, 0);
});

test('R02 production generation renders reviewed release state instead of authored maturity labels', () => {
  const htmlFiles = fs.readdirSync('tools').filter((file) => file.endsWith('.html')).map((file) => fs.readFileSync(`tools/${file}`, 'utf8'));
  assert.ok(htmlFiles.length > 0);
  assert.ok(htmlFiles.every((html) => /data-release-state="(?:Browser-local|Demonstration|Description only)/.test(html)));
  assert.ok(htmlFiles.every((html) => !/class="resource-status"[^>]*><span>Tool<\/span><span>(?:Production|Public beta|Research-stage)<\/span>/.test(html)));
});

test('R04 centralizes clipboard, export, and storage behavior in the shared action runtime', () => {
  const runtime = fs.readFileSync('browser-actions.js', 'utf8');
  const contact = fs.readFileSync('contact-intake.js', 'utf8');
  const renderer = fs.readFileSync('lib/site/structured-renderer.js', 'utf8');
  assert.match(runtime, /copyText/);
  assert.match(runtime, /permission-denied-or-unavailable/);
  assert.match(runtime, /download/);
  assert.match(runtime, /storage-unavailable/);
  assert.match(runtime, /aria-live/);
  assert.doesNotMatch(contact, /navigator\.clipboard|URL\.createObjectURL|document\.execCommand\(['"]copy/);
  assert.doesNotMatch(renderer, /navigator\.clipboard|URL\.createObjectURL|document\.execCommand\(['"]copy/);
  assert.match(contact, /window\.AlohaActions\.copyText/);
  assert.match(contact, /window\.AlohaActions\.download/);
});

test('R04 Unit 2 renders the shared state shell and audited repairs on five named tools', () => {
  const state = fs.readFileSync('browser-state.js', 'utf8');
  const agent = fs.readFileSync('agent-role-contract.html', 'utf8');
  const brand = fs.readFileSync('intelligence/brand-perception.html', 'utf8');
  const bill = fs.readFileSync('tools/bill-analyzer.html', 'utf8');
  const policy = fs.readFileSync('tools/policy-generator.html', 'utf8');
  const kb = fs.readFileSync('tools/kb-readiness.html', 'utf8');
  assert.match(state, /function create\(options\)/);
  assert.match(state, /function invalid\(messages\)/);
  assert.match(state, /function complete\(html, message\)/);
  assert.match(state, /function reset\(\)/);
  for (const html of [agent, brand, bill, policy, kb]) {
    assert.match(html, /browser-state\.js/);
    assert.match(html, /role="alert"/);
    assert.match(html, /role="status"/);
    assert.match(html, /<noscript>/);
    assert.match(html, /Rule version|rule version/);
  }
  assert.match(agent, /Fields marked \* are required/);
  assert.match(agent, /"requiredFields":\["role","scope","data","prohibited"/);
  assert.match(agent, /name="owner"[^>]*type="text"/);
  assert.match(brand, /need rule/);
  assert.match(brand, /Why this appeared/);
  assert.match(bill, /Download JSON/);
  assert.match(bill, /Copy result/);
  assert.match(policy, /Print review copy/);
  assert.match(policy, /Download Markdown/);
  assert.match(kb, /Answer every question/);
  assert.match(kb, /Unknown or not yet verified/);
  assert.doesNotMatch(kb, /Answer eleven questions/);
});

test('R05 fail-closes course completion independently from enrollment, persistence, and credentials', () => {
  const report = JSON.parse(fs.readFileSync('api/learning-completeness-report.json', 'utf8'));
  assert.equal(report.schema, 'aloha-ai-learning-completeness/1.0');
  assert.equal(report.frozenAuditEvidenceUnits, 325);
  assert.equal(report.courseCount, 7);
  assert.equal(report.openMaterialsCompleteCount, 7);
  assert.equal(report.incompleteCourseCount, 0);
  assert.deepEqual(report.schemaErrors, []);
  const citation = report.courses.find((course) => course.resourceId === 'citation-verifier-course');
  assert.equal(citation.openMaterialsComplete, true);
  assert.equal(citation.enrollmentAvailable, false);
  assert.equal(citation.accountSyncedProgressAvailable, false);
  assert.equal(citation.credentialIssuanceAvailable, false);
  const claims = report.courses.find((course) => course.resourceId === 'claims-checker-course');
  assert.equal(claims.openMaterialsComplete, true);
  assert.deepEqual(claims.recordCounts, {
    course: 1, module: 9, lesson: 18, assessment: 6, source: 5,
    project: 1, rubric: 2, credential: 1, outcome: 8
  });
  assert.equal(claims.enrollmentAvailable, false);
  assert.equal(claims.accountSyncedProgressAvailable, false);
  assert.equal(claims.credentialIssuanceAvailable, false);
  const team = report.courses.find((course) => course.resourceId === 'first-ai-team-course');
  assert.equal(team.openMaterialsComplete, true);
  assert.deepEqual(team.recordCounts, {
    course: 1, module: 4, lesson: 8, assessment: 9, source: 5,
    project: 1, rubric: 2, credential: 1, outcome: 8
  });
  assert.equal(team.enrollmentAvailable, false);
  assert.equal(team.accountSyncedProgressAvailable, false);
  assert.equal(team.credentialIssuanceAvailable, false);
  const operator = report.courses.find((course) => course.resourceId === 'governed-operator-course');
  assert.equal(operator.openMaterialsComplete, true);
  assert.deepEqual(operator.recordCounts, {
    course: 1, module: 10, lesson: 20, assessment: 11, source: 5,
    project: 1, rubric: 2, credential: 1, outcome: 10
  });
  assert.equal(operator.enrollmentAvailable, false);
  assert.equal(operator.accountSyncedProgressAvailable, false);
  assert.equal(operator.credentialIssuanceAvailable, false);
  const knowledge = report.courses.find((course) => course.resourceId === 'kb-readiness-course');
  assert.equal(knowledge.openMaterialsComplete, true);
  assert.deepEqual(knowledge.recordCounts, {
    course: 1, module: 9, lesson: 18, assessment: 10, source: 5,
    project: 1, rubric: 2, credential: 1, outcome: 9
  });
  assert.equal(knowledge.enrollmentAvailable, false);
  assert.equal(knowledge.accountSyncedProgressAvailable, false);
  assert.equal(knowledge.credentialIssuanceAvailable, false);
  const tracker = report.courses.find((course) => course.resourceId === 'reg-tracker-course');
  assert.equal(tracker.openMaterialsComplete, true);
  assert.deepEqual(tracker.recordCounts, {
    course: 1, module: 9, lesson: 18, assessment: 10, source: 5,
    project: 1, rubric: 2, credential: 1, outcome: 9
  });
  assert.equal(tracker.enrollmentAvailable, false);
  assert.equal(tracker.accountSyncedProgressAvailable, false);
  assert.equal(tracker.credentialIssuanceAvailable, false);
  const audit = report.courses.find((course) => course.resourceId === 'workflow-audit-course');
  assert.equal(audit.openMaterialsComplete, true);
  assert.deepEqual(audit.recordCounts, {
    course: 1, module: 9, lesson: 18, assessment: 10, source: 5,
    project: 1, rubric: 2, credential: 1, outcome: 9
  });
  assert.equal(audit.enrollmentAvailable, false);
  assert.equal(audit.accountSyncedProgressAvailable, false);
  assert.equal(audit.credentialIssuanceAvailable, false);
});

test('R06 separates the immutable baseline from the reviewed current release inventory', () => {
  const frozen = JSON.parse(fs.readFileSync('program/promise-delivery/freeze.json', 'utf8'));
  const release = JSON.parse(fs.readFileSync('program/promise-delivery/promise-release-registry.json', 'utf8'));
  const workflow = fs.readFileSync('.github/workflows/site-content.yml', 'utf8');
  const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));

  assert.equal(frozen.counts.promiseRecords, 4289);
  assert.equal(frozen.counts.totalPromiseOccurrences, 9552);
  assert.equal(release.schema, 'aloha-ai-promise-release-registry/1.0');
  assert.equal(release.frozenBaseline.promiseRecords, 4289);
  assert.equal(release.frozenBaseline.promiseOccurrences, 9552);
  assert.equal(release.decision, 'approved-current-structural-inventory');
  assert.equal(release.records.length, release.counts.promiseRecords);
  assert.equal(new Set(release.records.map((record) => record.promiseId)).size, release.records.length);
  assert.ok(release.records.every((record) => record.exactPromise && record.occurrenceKeys.length));
  assert.match(pkg.scripts['site:ci'], /promise:release-check/);
  assert.doesNotMatch(pkg.scripts['site:ci'], /promise:check(?:\s|$)/);
  assert.doesNotMatch(workflow, /\n\s+paths:/);
});

test('R06 Unit 3 bounds and operates the Psychedelic Radar maintained beta', () => {
  const monitors = JSON.parse(fs.readFileSync('content/monitors/intelligence-monitors.json', 'utf8'));
  const radar = monitors.find((item) => item.id === 'psychedelic-radar');
  assert.equal(radar.version, '1.0.0');
  assert.equal(radar.lifecycleState, 'maintained-beta-manual-review');
  assert.equal(radar.monitorOperations.owner, 'RN Collins');
  assert.equal(radar.monitorOperations.reviewer, 'RN Collins');
  assert.equal(radar.monitorOperations.lastSuccessfulReview, '2026-07-31');
  assert.equal(radar.monitorOperations.nextScheduledReview, '2026-08-07');
  assert.equal(radar.monitorOperations.sourceAuthorities.length, 6);
  assert.ok(radar.monitorOperations.sourceAuthorities.every((source) => source.required && source.url.startsWith('https://')));
  assert.ok(radar.monitorOperations.runHistory.length >= 1);
  assert.match(radar.monitorOperations.scope, /No other state, local, professional-board/);

  const publicCopy = JSON.stringify(radar);
  for (const prohibited of [
    'across every state',
    'pulled live',
    'queries the Federal Register API from your browser',
    'so it never goes stale',
    'Change-alerts when a state program or federal rule moves',
    'This page is a dated Regulatory Intelligence demonstration'
  ]) {
    assert.equal(publicCopy.includes(prohibited), false, `Psychedelic Radar overclaim remains: ${prohibited}`);
  }
});

test('R06 closeout fails stale monitors closed and keeps every other monitor a demonstration', () => {
  const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const operationsScript = fs.readFileSync('scripts/validate-monitor-operations.js', 'utf8');
  const cannabis = JSON.parse(fs.readFileSync('content/monitors/cannabis-rescheduling.json', 'utf8'));
  const intelligence = JSON.parse(fs.readFileSync('content/monitors/intelligence-monitors.json', 'utf8'));
  const maintained = [cannabis, ...intelligence].filter((record) => record.lifecycleState === 'maintained-beta-manual-review');
  const demonstrations = intelligence.filter((record) => record.id !== 'psychedelic-radar');

  assert.deepEqual(maintained.map((record) => record.id), ['cannabis-rescheduling', 'psychedelic-radar']);
  assert.equal(demonstrations.length, 9);
  assert.ok(demonstrations.every((record) => !record.monitorOperations));
  assert.ok(demonstrations.every((record) => !/maintained|current/i.test(record.lifecycleState || '')));
  assert.match(pkg.scripts['site:ci'], /monitors:check/);
  assert.match(operationsScript, /now > stale/);
  assert.match(operationsScript, /record a new successful review before release/);
  assert.match(operationsScript, /required source authority is incomplete/);
  assert.match(operationsScript, /last successful review lacks a matching evidenced run/);
});
