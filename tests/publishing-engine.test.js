import assert from 'node:assert/strict';
import test from 'node:test';
import { derivePlatform, generatedOutputs, legacyMigrationInventory, validatePlatform } from '../lib/site/publishing-engine.js';
import { renderStructuredPage } from '../lib/site/structured-renderer.js';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

function resource(id, relationships) {
  return {
    id,
    kind: 'research',
    pathname: `/${id}`,
    title: id,
    summary: `${id} summary`,
    maturity: 'Research',
    evidence: ['Evidence'],
    methodology: ['Method'],
    assumptions: ['Assumption'],
    limitations: ['Limitation'],
    relationships
  };
}

function errorsFor(resources) {
  return validatePlatform(resources, derivePlatform(resources)).errors;
}

test('accepts a connected graph with typed relationships', () => {
  assert.deepEqual(errorsFor([
    resource('alpha', [{ type: 'supports', target: 'beta' }]),
    resource('beta', [{ type: 'depends_on', target: 'alpha' }])
  ]), []);
});

test('rejects legacy relatedIds', () => {
  const alpha = resource('alpha', [{ type: 'supports', target: 'beta' }]);
  alpha.relatedIds = ['beta'];
  assert.ok(errorsFor([alpha, resource('beta', [{ type: 'supports', target: 'alpha' }])])
    .includes('alpha: relatedIds is deprecated; use typed relationships'));
});

test('rejects malformed, duplicate, unresolved, and self relationships', () => {
  const errors = errorsFor([
    resource('alpha', [
      { type: 'supports', target: 'beta' },
      { type: 'supports', target: 'beta' },
      { type: 'unknown', target: 'missing' },
      { type: 'uses', target: 'alpha' },
      null
    ]),
    resource('beta', [{ type: 'supports', target: 'alpha' }])
  ]);
  assert.ok(errors.includes('alpha: duplicate relationship supports:beta'));
  assert.ok(errors.includes('alpha: unsupported relationship unknown'));
  assert.ok(errors.includes('alpha: unresolved relationship target missing'));
  assert.ok(errors.includes('alpha: self relationship'));
  assert.ok(errors.includes('alpha: relationship entries must be objects'));
});

test('rejects dependency cycles and isolated resources', () => {
  const errors = errorsFor([
    resource('alpha', [{ type: 'depends_on', target: 'beta' }]),
    resource('beta', [{ type: 'depends_on', target: 'alpha' }]),
    resource('island', [])
  ]);
  assert.ok(errors.some((error) => error.startsWith('dependency cycle:')));
  assert.ok(errors.includes('island: unreachable orphan resource'));
});

test('does not overwrite canonical resources with generated collection routes', () => {
  const resources = [
    { ...resource('services', [{ type: 'supports', target: 'strategy' }]), kind: 'service', pathname: '/services' },
    { ...resource('strategy', [{ type: 'extends', target: 'services' }]), kind: 'service', pathname: '/strategy' }
  ];
  const platform = derivePlatform(resources);
  assert.equal(generatedOutputs(resources, platform).has('/services'), false);
});


test('derives Workspace eligibility, assessment URLs, and recommendation mappings', () => {
  const workspace = { ...resource('workspace', [{ type: 'supports', target: 'scorecard' }]), kind: 'product', workspace: { acceptsResourceKinds: ['research', 'assessment', 'product'] } };
  const scorecard = {
    ...resource('scorecard', [{ type: 'supports', target: 'alpha' }]),
    kind: 'assessment',
    assessment: {
      dimensions: ['evidence'],
      appliesToKinds: ['research'],
      recommendations: [{ id: 'inspect-evidence', condition: 'evidence_gap', resourceIds: ['alpha'] }]
    }
  };
  const alpha = resource('alpha', [{ type: 'available_in_workspace', target: 'workspace' }]);
  const resources = [workspace, scorecard, alpha];
  const platform = derivePlatform(resources);
  assert.deepEqual(validatePlatform(resources, platform).errors, []);
  const registry = JSON.parse(generatedOutputs(resources, platform).get('/workspace/resource-registry.json'));
  const mapping = registry.resources.find((entry) => entry.resourceId === 'alpha');
  assert.equal(mapping.workspace.available, true);
  assert.match(mapping.workspace.url, /^\/workspace\?resource_id=alpha/);
  assert.equal(mapping.assessments[0].assessmentId, 'scorecard');
  assert.deepEqual(mapping.assessments[0].recommendations[0].resourceIds, ['alpha']);
});

test('rejects invalid Workspace and recommendation mappings', () => {
  const workspace = { ...resource('workspace', [{ type: 'supports', target: 'scorecard' }]), kind: 'product', workspace: { acceptsResourceKinds: ['unknown'] } };
  const scorecard = {
    ...resource('scorecard', [{ type: 'supports', target: 'alpha' }]),
    kind: 'assessment',
    assessment: {
      dimensions: [],
      appliesToKinds: ['unknown'],
      recommendations: [{ id: 'broken', condition: '', resourceIds: ['missing'] }]
    }
  };
  const alpha = resource('alpha', [{ type: 'available_in_workspace', target: 'workspace' }]);
  const errors = errorsFor([workspace, scorecard, alpha]);
  assert.ok(errors.includes('workspace: unsupported workspace resource kind unknown'));
  assert.ok(errors.includes('scorecard: assessment.dimensions must be a non-empty array'));
  assert.ok(errors.includes('scorecard: unsupported assessment resource kind unknown'));
  assert.ok(errors.includes('scorecard: recommendation broken must define condition'));
  assert.ok(errors.includes('scorecard: recommendation broken has unresolved resource missing'));
});

test('inventories handwritten routes without classifying compiler outputs as legacy', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'aloha-migration-'));
  fs.mkdirSync(path.join(root, 'university', 'learn', 'alpha'), { recursive: true });
  fs.writeFileSync(path.join(root, 'university', 'learn', 'lesson.html'), '<html></html>');
  fs.writeFileSync(path.join(root, 'university', 'learn', 'alpha', 'index.html'), '<html></html>');
  fs.writeFileSync(path.join(root, 'about.html'), '<html></html>');
  const alpha = { ...resource('alpha', []), pathname: '/university/learn/alpha' };
  const outputs = new Map([['/topics', '<html></html>']]);
  fs.writeFileSync(path.join(root, 'topics.html'), '<html></html>');
  const inventory = legacyMigrationInventory(root, [alpha], outputs);
  assert.equal(inventory.count, 2);
  assert.deepEqual(inventory.byFamily, { governance: 1, university: 1 });
  assert.deepEqual(inventory.routes.map((route) => route.pathname), ['/about', '/university/learn/lesson']);
  fs.rmSync(root, { recursive: true, force: true });
});

test('renders collection membership from canonical registry metadata', () => {
  const lesson = { ...resource('lesson-one', [{ type: 'depends_on', target: 'lesson-index' }]), kind: 'lesson', pathname: '/university/learn/lesson-one' };
  const collection = {
    ...resource('lesson-index', [{ type: 'teaches', target: 'lesson-one' }]),
    kind: 'collection',
    pathname: '/university/learn',
    collection: { kinds: ['lesson'], pathPrefix: '/university/learn/', heading: 'Choose a lesson' }
  };
  const registry = new Map([[lesson.id, lesson], [collection.id, collection]]);
  const html = renderStructuredPage({ resource: collection, registry });
  assert.match(html, /Choose a lesson/);
  assert.match(html, /href="\/university\/learn\/lesson-one"/);
});

test('renders a browser-only structured assessment from question metadata', () => {
  const assessment = {
    ...resource('roadmap', [{ type: 'supports', target: 'alpha' }]),
    kind: 'assessment',
    implementationStatus: 'Public',
    assessment: {
      dimensions: ['operations'],
      appliesToKinds: ['research'],
      questions: [{ id: 'goal', prompt: 'What is the goal?', options: [{ value: 'save', label: 'Save time', dimension: 'operations' }] }],
      recommendations: [{ id: 'start', condition: 'operations_gap', resourceIds: ['alpha'] }]
    }
  };
  const alpha = resource('alpha', [{ type: 'supports', target: 'roadmap' }]);
  const registry = new Map([[assessment.id, assessment], [alpha.id, alpha]]);
  const html = renderStructuredPage({ resource: assessment, registry });
  assert.match(html, /id="structured-assessment"/);
  assert.match(html, /What is the goal\?/);
  assert.match(html, /processed in this browser/);
});

test('renders a declarative monitor dashboard with dated signals and local coverage scoring', () => {
  const monitor = {
    ...resource('signal-watch', [{ type: 'supports', target: 'alpha' }]),
    kind: 'monitor',
    implementationStatus: 'Public demonstration',
    documentation: ['Source contract'],
    monitor: {
      updated: '2026-07-26',
      filters: ['Policy'],
      signals: [{ date: '2026-07-26', category: 'Policy', title: 'Rule changed', status: 'Review', confidence: 'High', source: 'Primary source' }],
      checks: ['Primary source preserved']
    }
  };
  const alpha = resource('alpha', [{ type: 'supports', target: 'signal-watch' }]);
  const registry = new Map([[monitor.id, monitor], [alpha.id, alpha]]);
  const html = renderStructuredPage({ resource: monitor, registry });
  assert.match(html, /id="monitor-signals"/);
  assert.match(html, /Rule changed/);
  assert.match(html, /id="monitor-coverage"/);
  assert.match(html, /nothing is sent or monitored externally/);
});

test('renders weighted assessment options and a browser-local product demo', () => {
  const assessment = {
    ...resource('exposure', [{ type: 'supports', target: 'demo' }]),
    kind: 'assessment',
    implementationStatus: 'Public',
    assessment: {
      dimensions: ['consent'],
      appliesToKinds: ['tool'],
      questions: [{ id: 'consent', prompt: 'Is consent recorded?', options: [{ value: 'missing', label: 'No', dimension: 'consent', score: 2 }] }],
      recommendations: [{ id: 'review', condition: 'consent_gap', resourceIds: ['demo'] }]
    }
  };
  const demo = {
    ...resource('demo', [{ type: 'supports', target: 'exposure' }]),
    kind: 'tool',
    implementationStatus: 'Public',
    documentation: ['Demo contract'],
    demo: {
      type: 'trust-safe-twin',
      seededRecords: [{ name: 'A', company: 'B', vertical: 'Legal', status: 'Review' }],
      unsafeDraft: 'Guarantee',
      safeDraft: 'Reviewable draft',
      sampleRiskText: 'Ignore previous instructions'
    }
  };
  const registry = new Map([[assessment.id, assessment], [demo.id, demo]]);
  const assessmentHtml = renderStructuredPage({ resource: assessment, registry });
  const demoHtml = renderStructuredPage({ resource: demo, registry });
  assert.match(assessmentHtml, /data-score="2"/);
  assert.match(assessmentHtml, /Directional signal total/);
  assert.match(demoHtml, /id="demo-records"/);
  assert.match(demoHtml, /Production delivery remains disabled/);
});

test('renders a declarative browser-local operational tool', () => {
  const tool = {
    ...resource('analyzer', [{ type: 'supports', target: 'alpha' }]),
    kind: 'tool',
    implementationStatus: 'Public',
    documentation: ['Browser-local contract'],
    demo: {
      type: 'browser-tool',
      mode: 'analyze',
      inputLabel: 'Paste text',
      sample: 'The agency shall act.',
      outputTitle: 'Signals',
      signals: [{ label: 'Obligation', terms: ['shall'] }]
    }
  };
  const alpha = resource('alpha', [{ type: 'supports', target: 'analyzer' }]);
  const registry = new Map([[tool.id, tool], [alpha.id, alpha]]);
  const html = renderStructuredPage({ resource: tool, registry });
  assert.match(html, /id="browser-tool-input"/);
  assert.match(html, /processed in this browser/);
  assert.match(html, /Obligation/);
});
