export const pageKinds = Object.freeze({
  commercial: {
    required: ['eyebrow', 'title', 'summary', 'primaryAction', 'proof', 'related'],
    optional: ['secondaryAction', 'audience', 'process', 'faq', 'pricing']
  },
  product: {
    required: ['eyebrow', 'title', 'summary', 'status', 'howItWorks', 'methodology', 'limitations', 'primaryAction', 'related'],
    optional: ['sampleOutput', 'sources', 'faq', 'pricing']
  },
  learning: {
    required: ['eyebrow', 'title', 'summary', 'learningObjectives', 'body', 'nextResource', 'related'],
    optional: ['duration', 'level', 'assessment', 'download', 'sources']
  },
  proof: {
    required: ['eyebrow', 'title', 'summary', 'problem', 'work', 'result', 'evidence', 'related'],
    optional: ['client', 'date', 'methods', 'limitations']
  },
  legal: {
    required: ['title', 'effectiveDate', 'body'],
    optional: ['lastReviewed', 'contact']
  },
  app: {
    required: ['title', 'workspaceSection'],
    optional: ['emptyState', 'help', 'permissions']
  }
});

export const siteEstates = Object.freeze({
  consulting: {
    label: 'Consulting',
    description: 'Strategy, implementation, intelligence, legal AI, content adoption, and team design.',
    roots: ['/services', '/strategy', '/intelligence', '/content', '/legal-ai', '/build-your-team', '/ai-native-coo', '/launch-stack']
  },
  products: {
    label: 'Products',
    description: 'Trust Stack, tools, monitors, systems, teardowns, and Trust-Safe Twins.',
    roots: ['/trust-stack', '/tools', '/monitors', '/systems', '/teardowns', '/twins']
  },
  university: {
    label: 'University',
    description: 'Lessons, playbooks, templates, use cases, assessments, programs, and continuing education.',
    roots: ['/university', '/ce']
  },
  proof: {
    label: 'Research and proof',
    description: 'Builds, methods, engagements, partnerships, and practice evidence.',
    roots: ['/builds', '/methods', '/engagements', '/partners', '/practice']
  },
  company: {
    label: 'Company',
    description: 'About, contact, privacy, terms, and institutional information.',
    roots: ['/about', '/privacy', '/terms']
  },
  platform: {
    label: 'Platform',
    description: 'Authenticated projects, evidence, runs, reviews, knowledge, integrations, and administration.',
    roots: ['/platform', '/workspace']
  }
});

export function validatePage(kind, page) {
  const schema = pageKinds[kind];
  if (!schema) throw new Error(`Unknown page kind: ${kind}`);
  const missing = schema.required.filter((field) => page[field] == null || page[field] === '');
  return { valid: missing.length === 0, missing };
}

export function classifyEstate(pathname = '/') {
  const entries = Object.entries(siteEstates);
  for (const [key, estate] of entries) {
    if (estate.roots.some((root) => pathname === root || pathname.startsWith(`${root}/`))) return key;
  }
  return pathname === '/' ? 'consulting' : 'company';
}
