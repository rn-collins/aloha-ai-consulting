import { sectionDescriptors } from './template-registry.js';

const BASE_URL = 'https://aloha-ai-consulting.vercel.app';

export function renderStructuredPage({ resource, registry }) {
  const related = resolveRelated(resource, registry);
  const schema = JSON.stringify(buildSchema(resource));
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(resource.title)} | Aloha AI</title>
<meta name="description" content="${escapeHtml(resource.summary)}">
<link rel="canonical" href="${BASE_URL}${resource.pathname}">
<meta name="theme-color" content="#14201C">
<meta property="og:type" content="website">
<meta property="og:title" content="${escapeHtml(resource.title)}">
<meta property="og:description" content="${escapeHtml(resource.summary)}">
<meta property="og:url" content="${BASE_URL}${resource.pathname}">
<meta property="og:image" content="${BASE_URL}/og-image.png">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="stylesheet" href="/aloha-ds.css">
<link rel="stylesheet" href="/site-shell.css">
<link rel="stylesheet" href="/page-system.css">
<link rel="stylesheet" href="/universal-sections.css">
<script type="application/ld+json">${schema}</script>
</head>
<body data-resource-id="${escapeHtml(resource.id)}" data-resource-kind="${escapeHtml(resource.kind)}" data-maturity="${escapeHtml(resource.maturity)}">
<a class="skip" href="#main">Skip to content</a>
<header class="nav"></header>
<main id="main">
${hero(resource)}
${identity(resource)}
${kindSections(resource)}
${evidence(resource)}
${method(resource)}
${governance(resource)}
${relatedSections(related)}
${cta(resource)}
</main>
<footer class="footer"></footer>
<script src="/site-shell.js" defer></script>
</body>
</html>`;
}

function hero(r) {
  return `<section class="page-hero section--ink"><div class="wrap page-hero__inner">
<p class="eyebrow">${escapeHtml(r.eyebrow || label(r.kind))}</p>
<div class="resource-status"><span>${escapeHtml(label(r.kind))}</span><span>${escapeHtml(r.maturity)}</span></div>
<h1 class="display">${escapeHtml(r.title)}</h1>
<p class="lead">${escapeHtml(r.summary)}</p>
${r.audience ? `<p class="page-hero__audience"><strong>For:</strong> ${escapeHtml(r.audience)}</p>` : ''}
<div class="page-actions"><a class="btn btn--primary" href="#details">Inspect the system</a><a class="btn btn--ghost" href="/engagements">Choose an engagement</a></div>
</div></section>`;
}

function identity(r) {
  return `<section class="section section--paper" id="details"><div class="wrap"><div class="grid grid-3">
<div class="card"><p class="eyebrow">Resource type</p><h2>${escapeHtml(label(r.kind))}</h2><p class="muted">Canonical ID: <code>${escapeHtml(r.id)}</code></p></div>
<div class="card"><p class="eyebrow">Current maturity</p><h2>${escapeHtml(r.maturity)}</h2><p class="muted">Status describes this public resource, not a guarantee that every component or integration has the same maturity.</p></div>
<div class="card"><p class="eyebrow">Topics</p><h2>Connected knowledge</h2><p class="muted">${(r.topics || []).map(escapeHtml).join(' · ')}</p></div>
</div></div></section>`;
}

function kindSections(r) {
  return sectionDescriptors(r).map((section) => section.mode === 'text'
    ? textSection(section.title, r[section.field], section.eyebrow)
    : listSection(section.title, r[section.field], section.eyebrow)).join('\n');
}

function evidence(r) { return listSection('Evidence this resource depends on', r.evidence, 'Evidence', 'paper'); }

function method(r) {
  return `<section class="section"><div class="wrap"><p class="eyebrow">Method</p><h2 class="h2">How the work moves from inputs to accountable output.</h2><ol class="method-steps">${r.methodology.map((item, i) => `<li class="card"><span class="method-step__number">${String(i + 1).padStart(2, '0')}</span><p>${escapeHtml(item)}</p></li>`).join('')}</ol></div></section>`;
}

function governance(r) {
  return `<section class="section section--ink"><div class="wrap"><div class="grid grid-2">
<div><p class="eyebrow">Assumptions</p><h2 class="h2">What must be true for the resource to work as intended.</h2><ul>${r.assumptions.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul></div>
<div><p class="eyebrow">Limitations</p><h2 class="h2">Where human judgment and additional authority remain necessary.</h2><ul>${r.limitations.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul></div>
</div></div></section>`;
}

function relatedSections(groups) {
  return Object.entries(groups).filter(([, items]) => items.length).map(([group, items]) => `<section class="section section--paper"><div class="wrap"><p class="eyebrow">${escapeHtml(group)}</p><h2 class="h2">${escapeHtml(group)}</h2><div class="grid grid-3">${items.map((item) => `<a class="card card--hover" href="${escapeHtml(item.pathname)}"><p class="mini">${escapeHtml(label(item.kind))} · ${escapeHtml(item.maturity || 'Published')}</p><h3>${escapeHtml(item.title)}</h3><p class="muted">${escapeHtml(item.summary)}</p><span class="mini">Open →</span></a>`).join('')}</div></div></section>`).join('\n');
}

function cta(r) {
  const product = r.kind === 'product';
  const learning = ['learningHub', 'course', 'lesson', 'playbook', 'template', 'toolGuide', 'useCase'].includes(r.kind);
  return `<section class="section page-cta"><div class="wrap page-cta__inner"><div><p class="eyebrow">Next step</p><h2 class="h2">${product ? 'Inspect the product before adopting it.' : learning ? 'Choose the next learning or implementation path.' : 'Start with the workflow, decision, or evidence problem.'}</h2></div><div class="page-actions"><a class="btn btn--primary" href="${learning ? `${r.pathname}#details` : '/#start'}">${learning ? 'Start learning' : 'Start a conversation'}</a><a class="btn btn--outline" href="/methods">Inspect the methods</a></div></div></section>`;
}

function listSection(title, items, eyebrow, surface = '') {
  return `<section class="section ${surface ? `section--${surface}` : ''}"><div class="wrap"><p class="eyebrow">${escapeHtml(eyebrow)}</p><h2 class="h2">${escapeHtml(title)}</h2><div class="grid grid-3">${items.map((item) => `<div class="card"><p>${escapeHtml(item)}</p></div>`).join('')}</div></div></section>`;
}

function textSection(title, text, eyebrow) {
  return `<section class="section"><div class="wrap"><p class="eyebrow">${escapeHtml(eyebrow)}</p><h2 class="h2">${escapeHtml(title)}</h2><p class="lead">${escapeHtml(text)}</p></div></section>`;
}

function resolveRelated(resource, registry) {
  const relationships = resource.relationships || [];
  const items = relationships.map((relationship) => ({ relationship, resource: registry.get(relationship.target) })).filter((entry) => entry.resource);
  const groups = { 'Related Services': [], 'Related Tools': [], 'Related Research': [], 'Related University Lessons': [], 'Related Builds': [], 'Related Products': [] };
  for (const { resource: item } of items) {
    if (item.kind === 'service') groups['Related Services'].push(item);
    else if (['tool', 'monitor', 'assessment'].includes(item.kind)) groups['Related Tools'].push(item);
    else if (item.kind === 'research') groups['Related Research'].push(item);
    else if (['learningHub', 'course', 'lesson', 'playbook', 'template', 'toolGuide', 'useCase'].includes(item.kind)) groups['Related University Lessons'].push(item);
    else if (item.kind === 'build') groups['Related Builds'].push(item);
    else if (item.kind === 'product') groups['Related Products'].push(item);
  }
  return groups;
}

function label(kind) { return ({ service: 'Service', product: 'Product', learningHub: 'Learning hub', course: 'Course', lesson: 'Lesson', playbook: 'Playbook', template: 'Template', toolGuide: 'Tool guide', useCase: 'Use case', assessment: 'Assessment', tool: 'Tool', monitor: 'Monitor', research: 'Research', build: 'Build' })[kind] || 'Resource'; }
function buildSchema(r) { return { '@context': 'https://schema.org', '@type': r.kind === 'service' ? 'Service' : ['learningHub','course','lesson','playbook','template','toolGuide','useCase'].includes(r.kind) ? 'LearningResource' : 'CreativeWork', name: r.title, description: r.summary, url: `${BASE_URL}${r.pathname}`, provider: { '@type': 'Organization', name: 'Aloha AI' } }; }
function escapeHtml(value) { return String(value ?? '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#039;'); }
