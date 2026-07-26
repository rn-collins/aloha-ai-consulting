'use strict';

const crypto = require('crypto');

const REQUIRED_STAGES = Object.freeze([
  'source', 'retrieve', 'generate', 'guardrail', 'review', 'audit', 'deliver'
]);

function stableHash(value) {
  return crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex');
}

function defineTwin(definition = {}) {
  const twin = {
    id: String(definition.id || '').trim(),
    name: String(definition.name || '').trim(),
    type: String(definition.type || '').trim(),
    policyVersion: String(definition.policyVersion || 'v1'),
    stages: Array.isArray(definition.stages) ? definition.stages : [],
    capabilities: Array.isArray(definition.capabilities) ? definition.capabilities : [],
    externalActions: Array.isArray(definition.externalActions) ? definition.externalActions : [],
    configuration: definition.configuration && typeof definition.configuration === 'object' ? definition.configuration : {}
  };

  const errors = [];
  if (!twin.id) errors.push('id is required');
  if (!twin.name) errors.push('name is required');
  if (!twin.type) errors.push('type is required');
  const stageKeys = new Set(twin.stages.map(stage => stage.key));
  for (const key of REQUIRED_STAGES) if (!stageKeys.has(key)) errors.push(`missing required stage: ${key}`);
  for (const action of twin.externalActions) {
    if (!action.requiresApproval) errors.push(`external action ${action.key || 'unknown'} must require approval`);
    if (!action.idempotencyRequired) errors.push(`external action ${action.key || 'unknown'} must require idempotency`);
  }
  if (errors.length) {
    const error = new Error(`Invalid Twin definition: ${errors.join('; ')}`);
    error.code = 'invalid_twin_definition'; error.details = errors; throw error;
  }

  return Object.freeze({ ...twin, definitionHash: stableHash(twin) });
}

function createRunEnvelope({ twin, organizationId, projectId, actorId, input }) {
  if (!twin || !twin.definitionHash) throw new Error('A validated Twin definition is required');
  return Object.freeze({
    runId: crypto.randomUUID(), organizationId, projectId, actorId,
    twinId: twin.id, twinDefinitionHash: twin.definitionHash,
    policyVersion: twin.policyVersion, inputHash: stableHash(input),
    input, state: 'created', createdAt: new Date().toISOString()
  });
}

module.exports = { REQUIRED_STAGES, stableHash, defineTwin, createRunEnvelope };
