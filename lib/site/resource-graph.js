const normalizePath = (value = '/') => {
  const raw = String(value || '/').trim();
  if (!raw || raw === '/') return '/';
  const withoutOrigin = raw.replace(/^https?:\/\/[^/]+/i, '');
  const withoutQuery = withoutOrigin.split(/[?#]/)[0];
  const withSlash = withoutQuery.startsWith('/') ? withoutQuery : `/${withoutQuery}`;
  return withSlash.length > 1 ? withSlash.replace(/\/$/, '') : withSlash;
};

export const RESOURCE_TYPES = Object.freeze([
  'service',
  'product',
  'tool',
  'monitor',
  'research',
  'build',
  'method',
  'lesson',
  'playbook',
  'template',
  'use-case',
  'program',
  'ce',
  'company',
  'platform'
]);

export const createResource = (resource = {}) => {
  const normalized = {
    id: resource.id || normalizePath(resource.path || resource.href || '/').replace(/^\//, '').replaceAll('/', ':'),
    path: normalizePath(resource.path || resource.href || '/'),
    title: String(resource.title || '').trim(),
    summary: String(resource.summary || '').trim(),
    type: String(resource.type || '').trim(),
    topics: Array.isArray(resource.topics) ? [...new Set(resource.topics.map(String))] : [],
    audiences: Array.isArray(resource.audiences) ? [...new Set(resource.audiences.map(String))] : [],
    related: Array.isArray(resource.related) ? [...new Set(resource.related.map(normalizePath))] : [],
    status: resource.status || 'published',
    priority: Number.isFinite(resource.priority) ? resource.priority : 0
  };

  if (!normalized.title) throw new Error(`Resource ${normalized.path} is missing a title.`);
  if (!RESOURCE_TYPES.includes(normalized.type)) throw new Error(`Resource ${normalized.path} has unsupported type: ${normalized.type}`);
  return normalized;
};

const overlapScore = (left = [], right = []) => {
  const rightSet = new Set(right.map((item) => item.toLowerCase()));
  return left.reduce((score, item) => score + (rightSet.has(String(item).toLowerCase()) ? 1 : 0), 0);
};

export class ResourceGraph {
  constructor(resources = []) {
    this.resources = new Map();
    resources.forEach((resource) => this.add(resource));
  }

  add(resource) {
    const normalized = createResource(resource);
    this.resources.set(normalized.path, normalized);
    return normalized;
  }

  get(path) {
    return this.resources.get(normalizePath(path)) || null;
  }

  list({ type, status = 'published' } = {}) {
    return [...this.resources.values()].filter((resource) => {
      if (type && resource.type !== type) return false;
      if (status && resource.status !== status) return false;
      return true;
    });
  }

  recommend(path, options = {}) {
    const source = this.get(path);
    if (!source) return [];

    const limit = Number.isFinite(options.limit) ? options.limit : 6;
    const excludedTypes = new Set(options.excludeTypes || []);
    const requiredTypes = new Set(options.types || []);

    return this.list()
      .filter((candidate) => candidate.path !== source.path)
      .filter((candidate) => !excludedTypes.has(candidate.type))
      .filter((candidate) => requiredTypes.size === 0 || requiredTypes.has(candidate.type))
      .map((candidate) => {
        let score = candidate.priority;
        score += overlapScore(source.topics, candidate.topics) * 4;
        score += overlapScore(source.audiences, candidate.audiences) * 2;
        if (source.related.includes(candidate.path)) score += 12;
        if (candidate.related.includes(source.path)) score += 5;
        if (candidate.type !== source.type) score += 1;
        return { ...candidate, score };
      })
      .filter((candidate) => candidate.score > 0)
      .sort((a, b) => b.score - a.score || a.title.localeCompare(b.title))
      .slice(0, limit);
  }

  validate() {
    const findings = [];
    for (const resource of this.resources.values()) {
      for (const relatedPath of resource.related) {
        if (!this.resources.has(relatedPath)) {
          findings.push({
            severity: 'warning',
            resource: resource.path,
            message: `Related resource does not exist in graph: ${relatedPath}`
          });
        }
      }
      if (resource.topics.length === 0) {
        findings.push({ severity: 'warning', resource: resource.path, message: 'Resource has no topics.' });
      }
      if (resource.audiences.length === 0) {
        findings.push({ severity: 'info', resource: resource.path, message: 'Resource has no audience tags.' });
      }
    }
    return findings;
  }

  toJSON() {
    return [...this.resources.values()];
  }
}

export { normalizePath };
