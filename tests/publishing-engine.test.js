import assert from 'node:assert/strict';
import test from 'node:test';
import { derivePlatform, generatedOutputs, validatePlatform } from '../lib/site/publishing-engine.js';

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
