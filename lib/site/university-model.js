const ID = /^[-a-z0-9]+$/;
const DATE = /^\d{4}-\d{2}-\d{2}$/;

export const UNIVERSITY_SCHEMA_VERSION = '1.0.0';
export const UNIVERSITY_RECORD_TYPES = Object.freeze([
  'course',
  'module',
  'lesson',
  'assessment',
  'source',
  'link',
  'tool',
  'project',
  'rubric',
  'credential',
  'outcome'
]);

const REQUIRED = Object.freeze({
  course: ['id', 'type', 'title', 'status', 'moduleIds', 'outcomeIds', 'assessmentIds', 'projectIds', 'sourceIds', 'toolIds'],
  module: ['id', 'type', 'title', 'courseId', 'position', 'lessonIds', 'outcomeIds'],
  lesson: ['id', 'type', 'title', 'moduleId', 'position', 'outcomeIds', 'sourceIds', 'activityIds'],
  assessment: ['id', 'type', 'title', 'courseId', 'assessmentType', 'outcomeIds', 'rubricId', 'passingRule'],
  source: ['id', 'type', 'title', 'url', 'authority', 'publisher', 'publishedOrUpdated', 'lastVerified'],
  link: ['id', 'type', 'label', 'href', 'destinationType', 'lastVerified'],
  tool: ['id', 'type', 'title', 'capabilityLevel', 'implementationStatus', 'dataPath', 'limitations', 'lastTested'],
  project: ['id', 'type', 'title', 'courseId', 'brief', 'deliverableIds', 'rubricId', 'evidenceRequirements'],
  rubric: ['id', 'type', 'title', 'criteria', 'scoringMethod', 'passingScore'],
  credential: ['id', 'type', 'title', 'courseId', 'issuanceStatus', 'requirements', 'verificationMethod'],
  outcome: ['id', 'type', 'statement', 'level']
});

const ENUMS = Object.freeze({
  'course.status': ['design', 'curriculum-preview', 'enrollment-open', 'enrollment-closed', 'archived'],
  'assessment.assessmentType': ['diagnostic', 'knowledge-check', 'scenario', 'lab', 'project', 'capstone'],
  'source.authority': ['primary', 'official', 'peer-reviewed', 'authoritative-secondary', 'supplemental'],
  'link.destinationType': ['internal-resource', 'external-primary-source', 'external-reference', 'download', 'action'],
  'tool.capabilityLevel': ['local-instrument', 'connected-research-tool', 'governed-ai-workflow', 'institutional-system'],
  'tool.implementationStatus': ['planned', 'prototype', 'public-beta', 'production', 'archived'],
  'credential.issuanceStatus': ['planned', 'manual', 'verifiable'],
  'outcome.level': ['understand', 'apply', 'analyze', 'evaluate', 'create']
});

export function validateUniversitySystem(resources) {
  const errors = [];
  const records = resources.flatMap((resource) => resource.education?.records || []);
  const registry = new Map();

  for (const record of records) {
    if (!record || typeof record !== 'object' || Array.isArray(record)) {
      errors.push('university: education records must be objects');
      continue;
    }
    const prefix = record.id || 'unknown-education-record';
    if (!UNIVERSITY_RECORD_TYPES.includes(record.type)) {
      errors.push(`${prefix}: unsupported education record type ${record.type}`);
      continue;
    }
    for (const field of REQUIRED[record.type]) {
      if (empty(record[field])) errors.push(`${prefix}: ${record.type} record requires ${field}`);
    }
    if (!ID.test(record.id || '')) errors.push(`${prefix}: education id must be lowercase kebab-case`);
    if (registry.has(record.id)) errors.push(`duplicate education id: ${record.id}`);
    else registry.set(record.id, record);
    errors.push(...validateEnums(record));
    errors.push(...validateDates(record));
    errors.push(...validateNumbers(record));
  }

  for (const record of records.filter((item) => item && typeof item === 'object')) {
    for (const [field, ids] of Object.entries(record)) {
      if (!field.endsWith('Id') && !field.endsWith('Ids')) continue;
      const values = field.endsWith('Ids') ? ids : [ids];
      if (!Array.isArray(values)) {
        errors.push(`${record.id}: ${field} must be ${field.endsWith('Ids') ? 'an array' : 'a string'}`);
        continue;
      }
      for (const id of values) {
        if (typeof id !== 'string' || !id) errors.push(`${record.id}: ${field} contains an invalid id`);
        else if (!registry.has(id)) errors.push(`${record.id}: ${field} references missing education record ${id}`);
      }
    }
  }

  for (const resource of resources.filter((item) => item.kind === 'course')) {
    if (resource.delivery?.status === 'enrollment-open' && !resource.education?.records?.length) {
      errors.push(`${resource.id}: enrollment-open course requires validated education records`);
    }
    if (resource.education && resource.education.schemaVersion !== UNIVERSITY_SCHEMA_VERSION) {
      errors.push(`${resource.id}: education schemaVersion must be ${UNIVERSITY_SCHEMA_VERSION}`);
    }
  }
  return errors;
}

function validateEnums(record) {
  const errors = [];
  for (const [key, values] of Object.entries(ENUMS)) {
    const [type, field] = key.split('.');
    if (record.type === type && !empty(record[field]) && !values.includes(record[field])) {
      errors.push(`${record.id}: unsupported ${field} ${record[field]}`);
    }
  }
  return errors;
}

function validateDates(record) {
  return ['publishedOrUpdated', 'lastVerified', 'lastTested']
    .filter((field) => !empty(record[field]) && !DATE.test(record[field]))
    .map((field) => `${record.id}: ${field} must use YYYY-MM-DD`);
}

function validateNumbers(record) {
  const errors = [];
  if (!empty(record.position) && (!Number.isInteger(record.position) || record.position < 1)) {
    errors.push(`${record.id}: position must be a positive integer`);
  }
  if (!empty(record.passingScore) && (typeof record.passingScore !== 'number' || record.passingScore < 0 || record.passingScore > 100)) {
    errors.push(`${record.id}: passingScore must be between 0 and 100`);
  }
  return errors;
}

function empty(value) {
  return value == null || value === '' || (Array.isArray(value) && value.length === 0);
}
