'use strict';

/**
 * Canonical information architecture for the entire Aloha AI site.
 * Twins are one product estate; they do not define the rest of the site.
 */
const ESTATES = Object.freeze({
  commercial: {
    label: 'Aloha AI',
    purpose: 'Explain the practice, offers, methods, proof, and ways to work together.',
    primaryAudience: ['buyers', 'partners', 'institutions'],
    routes: ['/', '/services', '/strategy', '/intelligence', '/content', '/legal-ai', '/build-your-team', '/ai-native-coo', '/launch-stack', '/builds', '/methods', '/engagements', '/partners', '/about', '/practice']
  },
  trust: {
    label: 'Trust Stack',
    purpose: 'Expose governance, regulatory, verification, and risk products.',
    primaryAudience: ['regulated organizations', 'legal teams', 'risk leaders'],
    prefixes: ['/trust-stack']
  },
  twins: {
    label: 'Trust-Safe Twins',
    purpose: 'Provide governed domain-specific AI workflows and their public product demonstrations.',
    primaryAudience: ['operators', 'reviewers', 'teams'],
    prefixes: ['/twins']
  },
  tools: {
    label: 'Tools and Diagnostics',
    purpose: 'Offer usable assessments, verifiers, scorecards, maps, monitors, and working systems.',
    primaryAudience: ['practitioners', 'prospective clients', 'researchers'],
    prefixes: ['/tools', '/monitors', '/systems', '/teardowns'],
    routes: ['/intelligence/brand-perception']
  },
  university: {
    label: 'Aloha AI University',
    purpose: 'Teach practical and responsible AI through lessons, pathways, playbooks, templates, assessments, and institutional services.',
    primaryAudience: ['learners', 'teams', 'educators', 'institutions'],
    prefixes: ['/university']
  },
  education: {
    label: 'Programs and Continuing Education',
    purpose: 'Present purchasable, licensable, and continuing-education programs distinctly from consulting.',
    primaryAudience: ['professionals', 'institutions', 'licensing buyers'],
    prefixes: ['/ce']
  },
  platform: {
    label: 'Aloha AI Platform',
    purpose: 'Provide authenticated project, evidence, workflow, review, approval, and audit operations.',
    primaryAudience: ['members', 'clients', 'reviewers', 'administrators'],
    prefixes: ['/platform', '/workspace']
  },
  legal: {
    label: 'Legal and Policy',
    purpose: 'State the terms, privacy practices, and operational policies governing the site and platform.',
    primaryAudience: ['all visitors'],
    routes: ['/privacy', '/terms']
  }
});

const PAGE_CONTRACTS = Object.freeze({
  landing: ['clear audience', 'specific promise', 'evidence', 'primary action', 'secondary path', 'related estate links'],
  product: ['problem', 'user', 'method', 'inputs', 'outputs', 'limitations', 'status', 'methodology', 'next action'],
  tool: ['instructions', 'data handling', 'live-or-demo status', 'result meaning', 'limitations', 'methodology', 'related service'],
  learningIndex: ['pathways', 'level', 'time', 'outcomes', 'progression', 'next lesson'],
  learningItem: ['learning objective', 'prerequisites', 'lesson', 'worked example', 'practice', 'verification', 'next step'],
  company: ['specific facts', 'scope', 'proof', 'operating principles', 'contact path'],
  legal: ['effective date', 'scope', 'plain-language summary', 'complete policy', 'contact'],
  application: ['authenticated state', 'loading state', 'empty state', 'error state', 'permissions', 'auditability']
});

function normalizePath(value) {
  if (!value) return '/';
  try {
    const parsed = new URL(value, 'https://aloha-ai.invalid');
    return parsed.pathname.replace(/\/$/, '') || '/';
  } catch {
    const path = String(value).split(/[?#]/)[0];
    return (`/${path}`).replace(/\/{2,}/g, '/').replace(/\/$/, '') || '/';
  }
}

function matchesEstate(path, estate) {
  if (estate.routes?.includes(path)) return true;
  return Boolean(estate.prefixes?.some(prefix => path === prefix || path.startsWith(`${prefix}/`)));
}

function classifyEstate(value) {
  const path = normalizePath(value);
  for (const [key, estate] of Object.entries(ESTATES)) {
    if (matchesEstate(path, estate)) return key;
  }
  return 'unclassified';
}

function inferPageType(value) {
  const path = normalizePath(value);
  if (path === '/') return 'landing';
  if (['/privacy', '/terms'].includes(path)) return 'legal';
  if (path === '/workspace' || path.startsWith('/workspace/') || path === '/platform' || path.startsWith('/platform/')) return 'application';
  if (path.includes('/learn/')) return 'learningItem';
  if (path.includes('/playbooks/') || path.includes('/templates/') || path.includes('/tools/') || path.includes('/use-cases/')) return 'learningItem';
  if (['/university', '/university/start-here', '/university/learn', '/university/playbooks', '/university/templates', '/university/use-cases', '/university/tools'].includes(path)) return 'learningIndex';
  if (path.startsWith('/tools/') || path.startsWith('/monitors/') || path.startsWith('/systems/') || path.startsWith('/teardowns/')) return 'tool';
  if (path.startsWith('/trust-stack/') || path.startsWith('/twins/')) return 'product';
  if (['/about', '/partners', '/methods', '/builds', '/practice'].includes(path)) return 'company';
  return 'landing';
}

function getRouteRecord(value) {
  const path = normalizePath(value);
  const estate = classifyEstate(path);
  const pageType = inferPageType(path);
  return {
    path,
    estate,
    estateLabel: ESTATES[estate]?.label || 'Unclassified',
    pageType,
    requiredContent: PAGE_CONTRACTS[pageType] || PAGE_CONTRACTS.landing
  };
}

module.exports = { ESTATES, PAGE_CONTRACTS, normalizePath, classifyEstate, inferPageType, getRouteRecord };
