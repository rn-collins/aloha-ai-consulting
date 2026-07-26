const contracts = {
  service: ['deliverables', 'timeline', 'fit'],
  product: ['architecture', 'implementationStatus', 'documentation', 'roadmap', 'changelog', 'licensing'],
  tool: ['implementationStatus', 'documentation'],
  monitor: ['implementationStatus', 'documentation'],
  research: [],
  build: ['implementationStatus'],
  learningHub: ['learningPaths'],
  course: ['learningPaths'],
  lesson: [],
  assessment: ['implementationStatus']
};

export function templateContract(kind) {
  return contracts[kind] || [];
}

export function validateTemplateContract(resource) {
  return templateContract(resource.kind)
    .filter((field) => resource[field] == null || resource[field] === '' || (Array.isArray(resource[field]) && resource[field].length === 0))
    .map((field) => `${resource.id}: ${resource.kind} template requires ${field}`);
}

export function sectionDescriptors(resource) {
  const descriptors = [];
  const add = (field, title, eyebrow, mode = 'list') => {
    if (resource[field] != null && (!Array.isArray(resource[field]) || resource[field].length)) descriptors.push({ field, title, eyebrow, mode });
  };
  add('deliverables', 'What the engagement produces', 'Deliverables');
  add('timeline', 'Engagement timeline', 'Sequence', 'text');
  add('fit', 'When this is the right starting point', 'Fit');
  add('architecture', 'Product architecture', 'Architecture');
  add('implementationStatus', 'Implementation status', 'Status', 'text');
  add('documentation', 'Documentation contract', 'Documentation');
  add('roadmap', 'Roadmap', 'Planned work');
  add('changelog', 'Changelog', 'Version history');
  add('licensing', 'Licensing', 'Commercial use', 'text');
  add('learningPaths', 'Learning paths', 'Curriculum');
  return descriptors;
}

export const supportedKinds = Object.freeze(Object.keys(contracts));
