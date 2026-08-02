import fs from 'node:fs';
import path from 'node:path';
import { buildMetadata, metadataDescription, metadataTitle, renderMetadata } from './metadata.js';
import { validateUniversitySystem } from './university-model.js';

const BASE_URL = 'https://aloha-ai-consulting.vercel.app';
const KINDS = ['service','product','tool','monitor','research','build','learningHub','course','lesson','playbook','template','toolGuide','useCase','collection','assessment','institutional','policy'];
const MATURITY = ['Concept','Research','Beta','Production','Archived'];
const RELATIONS = ['uses','supports','teaches','implements','evidences','depends_on','extends','produced_by','available_in_workspace','supersedes','documents','related_to'];
const AUDIENCE_RULES = [
  ['Legal professionals', /\b(attorneys?|counsel|law firms?|legal (?:teams?|professionals?|departments?|operations?))\b/i],
  ['Researchers and experts', /\b(researchers?|research labs?|research organizations?|scholars?|scientists?|subject-matter experts?|experts?)\b/i],
  ['Educators and learners', /\b(educators?|learners?|students?|teachers?|learning teams?|training)\b/i],
  ['Founders and small businesses', /\b(founders?|startups?|small businesses?|business owners?|service businesses?)\b/i],
  ['Brands and creators', /\b(brands?|creators?|publishers?|writers?|creative directors?|marketing teams?|content teams?|communications teams?)\b/i],
  ['Health and life sciences', /\b(healthcare|health\b|clinicians?|biopharma|clinical|psychedelics?|wellness)\b/i],
  ['Policy and regulatory teams', /\b(policy|regulatory|regulators?|government|advocacy|compliance teams?)\b/i],
  ['Institutions and nonprofits', /\b(institutions?|nonprofits?|museums?|galleries?|coalitions?)\b/i],
  ['Funders and investors', /\b(funders?|investors?|sponsors?|licensees?)\b/i],
  ['Leaders and decision-makers', /\b(leaders?|executives?|directors?|managers?|boards?|cmos?|decision-makers?)\b/i],
  ['Operators and teams', /\b(operators?|operations teams?|teams?|practitioners?|professionals?)\b/i]
];

export function derivePlatform(resources) {
  const registry = new Map(resources.map((r) => [r.id, r]));
  const collections = groupBy(resources, (r) => collectionFor(r.kind));
  const topics = taxonomy(resources, 'topics');
  // Lessons remain discoverable through their course, search, topics, and sitemap.
  // Repeating every lesson in broad audience shelves inflates those pages while
  // adding no useful choice beyond the parent course.
  const audiences = taxonomy(resources.filter((r) => r.kind !== 'lesson'), 'audiences', (r) => normalizeAudience(r.audience, r));
  const industries = taxonomy(resources, 'industries');
  const maturity = groupBy(resources, (r) => slug(r.maturity));
  const graph = buildGraph(resources);
  const workspaceBridge = buildWorkspaceBridge(resources, registry);
  return { registry, collections, topics, audiences, industries, maturity, graph, workspaceBridge };
}

export function validatePlatform(resources, platform) {
  const errors = [];
  const warnings = [];
  const ids = new Set();
  const paths = new Set();
  const titles = new Map();

  for (const r of resources) {
    for (const field of ['id','kind','pathname','title','summary','maturity','evidence','methodology','assumptions','limitations']) {
      if (r[field] == null || r[field] === '' || (Array.isArray(r[field]) && !r[field].length)) errors.push(`${r.id || 'unknown'}: missing ${field}`);
    }
    if (!KINDS.includes(r.kind)) errors.push(`${r.id}: unsupported kind ${r.kind}`);
    if (!MATURITY.includes(r.maturity)) errors.push(`${r.id}: unsupported maturity ${r.maturity}`);
    errors.push(...validateCourseDelivery(r));
    if (!/^[-a-z0-9]+$/.test(r.id)) errors.push(`${r.id}: canonical id must be lowercase kebab-case`);
    if (!r.pathname?.startsWith('/')) errors.push(`${r.id}: pathname must start with /`);
    if (ids.has(r.id)) errors.push(`duplicate id: ${r.id}`); else ids.add(r.id);
    if (paths.has(r.pathname)) errors.push(`duplicate pathname: ${r.pathname}`); else paths.add(r.pathname);
    const titleKey = r.title.trim().toLowerCase();
    if (titles.has(titleKey)) warnings.push(`duplicate title: ${r.title} (${titles.get(titleKey)}, ${r.id})`); else titles.set(titleKey, r.id);
    if (Object.hasOwn(r, 'relatedIds')) errors.push(`${r.id}: relatedIds is deprecated; use typed relationships`);
    errors.push(...validateEditorialContent(r));
    if (!Array.isArray(r.relationships)) errors.push(`${r.id}: relationships must be an array`);
    const rels = relationships(r);
    const edgeKeys = new Set();
    for (const rel of rels) {
      if (!rel || typeof rel !== 'object' || Array.isArray(rel)) {
        errors.push(`${r.id}: relationship entries must be objects`);
        continue;
      }
      if (typeof rel.type !== 'string' || !rel.type) errors.push(`${r.id}: relationship type must be a non-empty string`);
      if (typeof rel.target !== 'string' || !rel.target) errors.push(`${r.id}: relationship target must be a non-empty string`);
      if (!RELATIONS.includes(rel.type)) errors.push(`${r.id}: unsupported relationship ${rel.type}`);
      if (!platform.registry.has(rel.target)) errors.push(`${r.id}: unresolved relationship target ${rel.target}`);
      if (rel.target === r.id) errors.push(`${r.id}: self relationship`);
      const edgeKey = `${rel.type}:${rel.target}`;
      if (edgeKeys.has(edgeKey)) errors.push(`${r.id}: duplicate relationship ${edgeKey}`); else edgeKeys.add(edgeKey);
    }
  }

  errors.push(...validateWorkspaceBridge(resources, platform.registry, platform.workspaceBridge));
  errors.push(...validateUniversitySystem(resources));
  errors.push(...validateCollectionContracts(resources, platform.registry));
  errors.push(...cycleErrors(resources, platform.registry));
  errors.push(...reachabilityErrors(resources, platform.graph));
  warnings.push(...reciprocityWarnings(resources, platform.registry));
  return { errors, warnings };
}

function validateCourseDelivery(resource) {
  if (resource.kind !== 'course') return [];
  const errors = [];
  const delivery = resource.delivery;
  const statuses = new Set(['curriculum-preview', 'enrollment-open', 'enrollment-closed', 'archived']);
  const componentStatuses = new Set(['available', 'planned', 'not-available']);
  if (!delivery || typeof delivery !== 'object' || Array.isArray(delivery)) {
    return [`${resource.id}: course requires a delivery contract`];
  }
  if (!statuses.has(delivery.status)) errors.push(`${resource.id}: unsupported course delivery status ${delivery.status}`);
  if (typeof delivery.enrollmentOpen !== 'boolean') errors.push(`${resource.id}: course delivery requires enrollmentOpen boolean`);
  for (const field of ['lessons', 'tutor', 'progressTracking', 'credential']) {
    if (!componentStatuses.has(delivery[field])) errors.push(`${resource.id}: unsupported ${field} status ${delivery[field]}`);
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(delivery.lastReviewed || '')) {
    errors.push(`${resource.id}: course delivery requires YYYY-MM-DD lastReviewed`);
  }
  if (delivery.status === 'curriculum-preview' && delivery.enrollmentOpen) {
    errors.push(`${resource.id}: curriculum preview cannot have open enrollment`);
  }
  if (delivery.tutor !== 'available' && /built-in (governed )?AI tutor|every Aloha AI course ships with a governed AI tutor|live governed tutor/i.test(JSON.stringify(resource))) {
    errors.push(`${resource.id}: course copy advertises a tutor that is not available`);
  }
  if (!delivery.enrollmentOpen && /\basync, lifetime access\b/i.test(JSON.stringify(resource))) {
    errors.push(`${resource.id}: course copy advertises access while enrollment is closed`);
  }
  return errors;
}

export function validateRoutingConfig(resources, config = {}) {
  const errors = [];
  const canonicalPaths = new Set(resources.map((resource) => normalizeRoute(resource.pathname)));
  const rules = [
    ...(config.redirects || []).map((rule) => ({ ...rule, type: 'redirect' })),
    ...(config.rewrites || []).map((rule) => ({ ...rule, type: 'rewrite' }))
  ];
  const sources = new Set();

  for (const rule of rules) {
    if (!rule || typeof rule.source !== 'string' || typeof rule.destination !== 'string') {
      errors.push('routing: every redirect and rewrite must define string source and destination values');
      continue;
    }
    if (sources.has(rule.source)) errors.push(`routing: duplicate source ${rule.source}`);
    else sources.add(rule.source);
    if (canonicalPaths.has(normalizeRoute(rule.source)) && rule.source === normalizeRoute(rule.source)) {
      errors.push(`routing: ${rule.type} source ${rule.source} shadows a canonical resource`);
    }
    if (rule.type === 'redirect' && rule.source === rule.destination) {
      errors.push(`routing: redirect ${rule.source} points to itself`);
    }
  }
  return errors;
}

export function generatedOutputs(resources, platform, collectionPages = {}) {
  const outputs = new Map();
  const resourcePaths = new Set(resources.map((resource) => resource.pathname));
  for (const [name, items] of platform.collections) {
    const collectionPath = `/${name}`;
    if (!resourcePaths.has(collectionPath)) {
      const metadata = collectionPages[collectionPath];
      outputs.set(collectionPath, renderCollection(name, items, metadata?.title || `${label(name)} resources`, collectionPath, metadata));
    }
  }
  for (const [key, items] of platform.topics) outputs.set(`/topics/${key}`, renderCollection(`topic-${key}`, items, `Topic: ${humanize(key)}`, `/topics/${key}`));
  for (const [key, items] of platform.audiences) outputs.set(`/audiences/${key}`, renderCollection(`audience-${key}`, items, `For ${humanize(key)}`, `/audiences/${key}`));
  for (const [key, items] of platform.industries) outputs.set(`/industries/${key}`, renderCollection(`industry-${key}`, items, `Industry: ${humanize(key)}`, `/industries/${key}`));
  for (const [key, items] of platform.maturity) outputs.set(`/maturity/${key}`, renderCollection(`maturity-${key}`, items, `${humanize(key)} resources`, `/maturity/${key}`));
  outputs.set('/topics', renderDirectory('Topics', platform.topics, '/topics/', '/topics'));
  outputs.set('/audiences', renderDirectory('Audiences', platform.audiences, '/audiences/', '/audiences'));
  outputs.set('/industries', renderDirectory('Industries', platform.industries, '/industries/', '/industries'));
  outputs.set('/maturity', renderDirectory('Maturity', platform.maturity, '/maturity/', '/maturity'));
  outputs.set('/api/resources.json', JSON.stringify(apiPayload(resources, platform.workspaceBridge), null, 2));
  outputs.set('/api/collections.json', JSON.stringify({ version: 1, count: Object.keys(collectionPages).length, collections: Object.values(collectionPages) }, null, 2));
  outputs.set('/api/graph.json', JSON.stringify(platform.graph, null, 2));
  outputs.set('/search-index.json', JSON.stringify(searchIndex(resources, collectionPages), null, 2));
  outputs.set('/search', renderSearch(resources.length));
  outputs.set('/404', renderNotFound());
  outputs.set('/workspace/resource-registry.json', JSON.stringify(platform.workspaceBridge, null, 2));
  outputs.set('/sitemap.xml', sitemap(resources, outputs));
  outputs.set('/feed.xml', rss(resources));
  outputs.set('/robots.txt', `User-agent: *\nAllow: /\nSitemap: ${BASE_URL}/sitemap.xml\n`);
  return outputs;
}

export function legacyMigrationInventory(root, resources, outputs) {
  const generatedRoutes = new Set([
    ...resources.map((resource) => normalizeRoute(resource.pathname)),
    ...[...outputs.keys()].map(normalizeRoute)
  ]);
  const generatedFiles = new Set([
    ...resources.map((resource) => outputFile(resource.pathname)),
    ...[...outputs.keys()].map(outputFile)
  ]);
  const routes = walk(root)
    .filter((file) => file.endsWith('.html') && !file.includes(`${path.sep}.git${path.sep}`))
    .map((file) => path.relative(root, file))
    .filter((file) => !generatedFiles.has(file))
    .sort()
    .map((file) => {
      const pathname = htmlRoute(file);
      const family = migrationFamily(pathname);
      return {
        pathname,
        sourceFile: file,
        family,
        targetDirectory: `content/${family}`,
        status: generatedRoutes.has(normalizeRoute(pathname)) ? 'shadowing' : 'handwritten'
      };
    });
  const byFamily = Object.fromEntries(
    [...groupBy(routes, (route) => route.family)]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([family, items]) => [family, items.length])
  );
  return { version: 1, count: routes.length, byFamily, routes };
}

export function writeOutputs(root, outputs, mode = 'build') {
  let changed = 0;
  for (const [urlPath, body] of outputs) {
    const output = path.join(root, outputFile(urlPath));
    const existing = fs.existsSync(output) ? fs.readFileSync(output, 'utf8') : null;
    if (existing === body) continue;
    changed += 1;
    if (mode === 'build') {
      fs.mkdirSync(path.dirname(output), { recursive: true });
      fs.writeFileSync(output, body);
      console.log(`Generated ${path.relative(root, output)}`);
    } else console.error(`Out of date: ${path.relative(root, output)}`);
  }
  return changed;
}

export function validateGeneratedSite(root, resources, outputs) {
  const generatedErrors = [];
  const legacyWarnings = [];
  const known = new Set([...resources.map((r) => normalizeRoute(r.pathname)), ...[...outputs.keys()].map(normalizeRoute), '/']);
  const generatedFiles = new Set([...resources.map((r) => outputFile(r.pathname)), ...[...outputs.keys()].map(outputFile)]);
  const htmlFiles = walk(root).filter((f) => f.endsWith('.html') && !f.includes(`${path.sep}.git${path.sep}`));

  for (const file of htmlFiles) {
    const rel = path.relative(root, file);
    const html = fs.readFileSync(file, 'utf8');
    const bucket = generatedFiles.has(rel) ? generatedErrors : legacyWarnings;
    const prefix = generatedFiles.has(rel) ? 'generated' : 'legacy';
    if (!/<title>[^<]+<\/title>/i.test(html)) bucket.push(`${prefix} ${rel}: missing title`);
    if (!/<meta\s+name=["']description["'][^>]+content=["'][^"']+/i.test(html)) bucket.push(`${prefix} ${rel}: missing description`);
    if (!/<link\s+rel=["']canonical["']/i.test(html)) bucket.push(`${prefix} ${rel}: missing canonical`);
    if (!/<main\b/i.test(html)) bucket.push(`${prefix} ${rel}: missing main landmark`);
    if (!/<h1\b/i.test(html)) bucket.push(`${prefix} ${rel}: missing h1`);
    const ids = [...html.matchAll(/\sid=["']([^"']+)["']/gi)].map((m) => m[1]);
    for (const id of ids.filter((id, i) => ids.indexOf(id) !== i)) bucket.push(`${prefix} ${rel}: duplicate id #${id}`);
    for (const href of [...html.matchAll(/href=["']([^"']+)["']/gi)].map((m) => m[1])) {
      if (!href.startsWith('/') || href.startsWith('//')) continue;
      const route = normalizeRoute(href.split('#')[0].split('?')[0]);
      if (route && !known.has(route) && !staticAsset(route)) bucket.push(`${prefix} ${rel}: unresolved internal link ${href}`);
    }
  }
  return { generatedErrors, legacyWarnings };
}

function renderCollection(id, resources, title, canonicalPath, metadata = null) {
  if (canonicalPath === '/tools' && metadata?.toolsExperience) {
    return renderToolsCollection(id, resources, title, canonicalPath, metadata);
  }
  if (/^\/(topics|audiences|industries|maturity)\//.test(canonicalPath)) {
    return renderDiscoveryCollection(id, resources, title, canonicalPath);
  }
  if (COLLECTION_EXPERIENCES[id]) {
    return renderEditorialCollection(id, resources, canonicalPath, COLLECTION_EXPERIENCES[id]);
  }
  const groups = groupBy(resources, (r) => label(collectionFor(r.kind)));
  const summary = metadata?.summary || `Browse ${resources.length} structured Aloha AI resources.`;
  const editorial = renderCollectionEditorial(metadata);
  return page(title, summary, `<section class="page-hero"><div class="wrap"><p class="eyebrow">${esc(metadata?.eyebrow || 'Discovery')}</p><h1 class="display">${esc(title)}</h1><p class="lead">${esc(summary)}</p></div></section>${editorial}${[...groups].map(([group, items]) => `<section class="section"><div class="wrap"><p class="eyebrow">${esc(group)}</p><div class="grid grid-3">${items.sort(byTitle).map(card).join('')}</div></div></section>`).join('')}`, id, canonicalPath);
}

const COLLECTION_EXPERIENCES = Object.freeze({
  governance: {
    issue: 'Rules & boundaries',
    title: 'Make the rules visible before the AI gets powerful.',
    summary: 'Policies, controls, and decision boundaries for teams that need to know what AI may do, what it may never do, and who remains responsible.',
    prompt: 'Start here if the question is: “How do we use AI without losing control?”',
    action: 'Inspect the rule',
    accent: 'lime'
  },
  research: {
    issue: 'Evidence & ideas',
    title: 'See how the thinking becomes something you can use.',
    summary: 'These notes show where AI systems go wrong, how trust breaks, and the design choices that make important work easier to check.',
    prompt: 'Choose the question closest to the problem you are trying to solve.',
    action: 'Read the note',
    accent: 'violet'
  },
  monitors: {
    issue: 'Signals & change',
    title: 'Watch what changes. Understand why it matters.',
    summary: 'Focused monitors that turn noisy updates into sourced signals, visible uncertainty, and a next question for the human responsible for the decision.',
    prompt: 'Choose the world you need to keep up with.',
    action: 'Open the monitor',
    accent: 'coral'
  },
  products: {
    issue: 'Systems you can inspect',
    title: 'See the machinery—not just the promise.',
    summary: 'Working systems and product architectures for evidence, governance, monitoring, learning, and safer AI operations.',
    prompt: 'Pick the system whose job sounds closest to yours.',
    action: 'Inspect the system',
    accent: 'yellow'
  }
});

function renderEditorialCollection(id, resources, canonicalPath, experience) {
  const ordered = [...resources].sort(byTitle);
  const cards = ordered.map((resource, index) => editorialCollectionCard(resource, index, experience.action)).join('');
  const body = `<section class="collection-cover collection-cover--${esc(experience.accent)}"><div class="wrap wrap--wide collection-cover__inner">
<div class="collection-cover__copy"><p class="eyebrow">Aloha AI · ${esc(experience.issue)}</p><p class="collection-cover__issue">Index ${String(ordered.length).padStart(2, '0')} · ${esc(id)}</p><h1>${esc(experience.title)}</h1><p class="lead">${esc(experience.summary)}</p><a class="btn btn--primary" href="#collection-index"><span>Choose where to start</span><span aria-hidden="true">↓</span></a></div>
<div class="collection-cover__poster" aria-hidden="true"><span>${esc(id)}</span><strong>${String(ordered.length).padStart(2, '0')}</strong><p>things to<br>open, question<br>& inspect</p><i>ALOHA AI · INDEX ${String(ordered.length).padStart(2, '0')}</i></div>
</div></section>
<section class="collection-index" id="collection-index"><div class="wrap wrap--wide">
<div class="collection-index__head"><div><p class="eyebrow">${esc(experience.issue)}</p><h2>Choose a question.<br>See where it leads.</h2></div><p>${esc(experience.prompt)} Every entry tells you what it is and whether it is ready to use before you open it.</p></div>
<div class="collection-index__grid">${cards}</div>
</div></section>
<section class="collection-key"><div class="wrap wrap--wide"><p><b>Working status, in plain language</b><span><strong>Live</strong> means ready to use or inspect now. <strong>Public beta</strong> means useful now and still improving. <strong>Research</strong> means the reasoning or architecture is published, but it is not presented as a finished deployment.</span></p><a href="/search">Not sure? Describe what you need in Search <span aria-hidden="true">↗</span></a></div></section>`;
  return page(experience.title, experience.summary, body, `collection-${id}`, canonicalPath, `is-editorial-collection is-collection-${id}`);
}

function editorialCollectionCard(resource, index, action) {
  const maturity = maturityLabel(resource.maturity);
  const kind = label(resource.kind);
  const kindLine = maturity.toLowerCase() === kind.toLowerCase()
    ? ''
    : `<span class="collection-entry__kind">${esc(kind)}</span>`;
  return `<a class="collection-entry collection-entry--${(index % 6) + 1}" href="${esc(resource.pathname)}">
<span class="collection-entry__top"><span>${String(index + 1).padStart(2, '0')}</span><span>${esc(maturity)}</span></span>
${kindLine}
<strong>${esc(resource.title)}</strong>
<p>${esc(resource.summary)}</p>
<span class="collection-entry__action">${esc(action)} <i aria-hidden="true">↗</i></span>
</a>`;
}

function maturityLabel(maturity) {
  return ({
    Production: 'Live',
    Beta: 'Public beta',
    Research: 'Research',
    Concept: 'Concept',
    Archived: 'Archived'
  })[maturity] || maturity;
}

function renderToolsCollection(id, resources, title, canonicalPath, metadata) {
  const registry = new Map(resources.map((resource) => [resource.id, resource]));
  const experience = metadata.toolsExperience;
  const filters = [
    ['all', 'All tools'],
    ['check', 'Check a claim'],
    ['rules', 'Set safer rules'],
    ['workflow', 'Fix a workflow'],
    ['choose', 'Choose what comes next']
  ];
  const cards = (experience.items || []).map((entry, index) => {
    const resource = registry.get(entry.resourceId);
    if (!resource) return '';
    return `<a class="tool-card tool-card--${(index % 6) + 1}" href="${esc(resource.pathname)}" data-tool-family="${esc(entry.family)}">
<span class="tool-card__top"><span class="tool-card__number">${String(index + 1).padStart(2, '0')}</span><span class="tool-card__status">Public beta</span></span>
<span class="tool-card__family">${esc(entry.familyLabel)}</span>
<strong>${esc(entry.title)}</strong>
<span class="tool-card__plain">${esc(entry.plain)}</span>
<span class="tool-card__action">${esc(entry.action)} <i aria-hidden="true">↗</i></span>
</a>`;
  }).join('');
  const body = `<section class="tools-hero section--ink"><div class="wrap wrap--wide tools-hero__inner">
<div class="tools-hero__copy"><p class="eyebrow">${esc(metadata.eyebrow)}</p><p class="tools-hero__issue">Issue 03 · Tools</p><h1 class="display">${esc(title)}</h1><p class="lead">${esc(metadata.summary)}</p><div class="page-actions"><a class="btn btn--primary" href="#tool-shelf"><span>Choose a tool</span><span aria-hidden="true">↓</span></a><a class="btn btn--ghost" href="/university/contact">Bring RN a question</a></div></div>
<div class="tools-cover" aria-hidden="true"><span class="tools-cover__ask">ASK</span><span class="tools-cover__try">TRY</span><span class="tools-cover__see">SEE</span><p>One question.<br><strong>One useful next move.</strong></p><i>13 free ways in ↗</i></div>
</div></section>
<section class="tool-shelf" id="tool-shelf"><div class="wrap wrap--wide">
<div class="tool-shelf__head"><div><p class="eyebrow">Start with your question</p><h2>What are you trying to figure out?</h2></div><p>${esc(experience.intro)}</p></div>
<div class="tool-filters" aria-label="Filter tools by question">${filters.map(([value, label], index) => `<button class="tool-filter${index === 0 ? ' is-active' : ''}" type="button" data-tool-filter="${value}" aria-pressed="${index === 0 ? 'true' : 'false'}">${esc(label)}</button>`).join('')}</div>
<div class="tool-grid">${cards}</div><p class="tool-shelf__empty" hidden>No tools match this view yet.</p>
</div></section>
<section class="tool-trust"><div class="wrap wrap--wide"><div><p class="eyebrow">Before you type</p><h2>Your work stays on your device.</h2><p>${esc(experience.privacy)}</p></div><div class="tool-trust__note"><span>PUBLIC BETA</span><p>Useful now. Still improving. Open a tool’s evidence and limitations before relying on its output.</p></div></div></section>
${renderToolsDepth(metadata)}
<script>(function(){var buttons=[].slice.call(document.querySelectorAll('[data-tool-filter]')),cards=[].slice.call(document.querySelectorAll('[data-tool-family]')),empty=document.querySelector('.tool-shelf__empty');if(!buttons.length||!cards.length)return;buttons.forEach(function(button){button.addEventListener('click',function(){var filter=button.getAttribute('data-tool-filter'),visible=0;buttons.forEach(function(item){var on=item===button;item.classList.toggle('is-active',on);item.setAttribute('aria-pressed',on?'true':'false');});cards.forEach(function(card){var show=filter==='all'||card.getAttribute('data-tool-family')===filter;card.hidden=!show;if(show)visible++;});if(empty)empty.hidden=visible!==0;});});})();</script>`;
  return page(title, metadata.summary, body, id, canonicalPath, 'is-tools');
}

function renderToolsDepth(metadata) {
  const intro = metadata.editorialIntro || [];
  const sections = metadata.editorialSections || [];
  return `<section class="tools-depth"><div class="wrap wrap--wide"><div class="tools-depth__head"><div><p class="eyebrow">How to read the shelf</p><h2>Useful demonstration. Honest boundary.</h2></div><p>The quick path is above. Open these notes when you want to understand what the tools prove, what they do not prove, or how a public beta can become a private system.</p></div>
${intro.length ? `<div class="tools-depth__intro">${intro.map((text) => `<p>${esc(text)}</p>`).join('')}</div>` : ''}
<div class="tools-depth__sections">${sections.map((section, index) => `<details class="tools-depth__item"><summary><span>${String(index + 1).padStart(2, '0')}</span><strong>${esc(section.title)}</strong><i aria-hidden="true">+</i></summary><div class="tools-depth__body">${section.eyebrow ? `<p class="eyebrow">${esc(section.eyebrow)}</p>` : ''}${(section.blocks || []).map(renderCollectionBlock).join('')}</div></details>`).join('')}</div>
</div></section>`;
}

function renderCollectionEditorial(metadata) {
  if (!metadata) return '';
  const intro = (metadata.editorialIntro || []).map((text) => `<p class="lead">${esc(text)}</p>`).join('');
  const sections = (metadata.editorialSections || []).map((section, index) => `<section class="section${index % 2 ? ' section--paper' : ''}"><div class="wrap prose">${section.eyebrow ? `<p class="eyebrow">${esc(section.eyebrow)}</p>` : ''}<h2 class="h2">${esc(section.title)}</h2>${(section.blocks || []).map(renderCollectionBlock).join('')}</div></section>`).join('');
  return intro ? `<section class="section section--paper"><div class="wrap prose"><p class="eyebrow">In depth</p>${intro}</div></section>${sections}` : sections;
}

function renderCollectionBlock(block) {
  if (block.type === 'paragraph') return `<p>${esc(block.text)}</p>`;
  if (block.type === 'heading') return `<h3>${block.href ? `<a href="${esc(block.href)}">${esc(block.text)} <span aria-hidden="true">↗</span></a>` : esc(block.text)}</h3>`;
  if (block.type === 'links') return `<nav class="editorial-links">${(block.items || []).map((item) => `<a href="${esc(item.href)}">${esc(item.label)} <span aria-hidden="true">↗</span></a>`).join('')}</nav>`;
  if (block.type === 'list') {
    const tag = block.ordered ? 'ol' : 'ul';
    return `<${tag}>${(block.items || []).map((item) => `<li>${esc(item)}</li>`).join('')}</${tag}>`;
  }
  if (block.type === 'quote') return `<blockquote>${esc(block.text)}</blockquote>`;
  if (block.type === 'code') return `<pre><code>${esc(block.text)}</code></pre>`;
  if (block.type === 'table') {
    const rows = block.rows || [];
    const width = Math.max(0, ...rows.map((row) => (row.cells || []).length));
    const headers = (rows[0]?.cells || []).map((cell) => cell.text.toLowerCase());
    const datedConfidence = width === 4
      && /(retrieved|reviewed|cadence)/.test(headers[2] || '')
      && /confidence/.test(headers[3] || '');
    const normalized = rows.map((row, rowIndex) => {
      const cells = [...(row.cells || [])];
      if (rowIndex > 0 && datedConfidence && cells.length === 3 && /^(high|med|medium|low)/i.test(cells[2]?.text || '')) {
        cells.splice(2, 0, { text: 'Not recorded' });
      }
      while (cells.length < width) cells.push({ text: 'Not recorded' });
      return cells;
    });
    const caption = `${normalized[0]?.map((cell) => cell.text).filter(Boolean).join(', ') || 'Structured comparison'} table`;
    const head = normalized[0] || [];
    return `<div style="overflow-x:auto"><table><caption class="visually-hidden">${esc(caption)}</caption><thead><tr>${head.map((cell) => `<th scope="col">${esc(cell.text)}</th>`).join('')}</tr></thead><tbody>${normalized.slice(1).map((cells) => `<tr>${cells.map((cell) => cell.header ? `<th scope="row">${esc(cell.text)}</th>` : `<td>${esc(cell.text)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
  }
  return '';
}

function renderDirectory(title, index, prefix, canonicalPath) {
  const entries = [...index].sort(([a],[b]) => a.localeCompare(b));
  const contract = discoveryContract(canonicalPath);
  const cards = entries.map(([key, items], index) => `<a class="discovery-path discovery-path--${(index % 6) + 1}" href="${prefix}${key}" data-discovery-path data-search="${esc(humanize(key).toLowerCase())}">
<span class="discovery-path__number">${String(index + 1).padStart(2, '0')}</span>
<strong>${esc(humanize(key))}</strong>
<small>${items.length} resource${items.length === 1 ? '' : 's'}</small>
<i aria-hidden="true">↗</i>
</a>`).join('');
  const body = `<section class="discovery-cover discovery-cover--${esc(contract.accent)}"><div class="wrap wrap--wide discovery-cover__grid">
<div><p class="eyebrow">Discovery lens · ${esc(contract.label)}</p><p class="discovery-cover__count">${entries.length} paths</p><h1>${esc(contract.heading)}</h1><p class="lead">${esc(contract.purpose)}</p><a class="btn btn--primary" href="#discovery-index">Choose a path <span aria-hidden="true">↓</span></a></div>
<aside class="discovery-cover__note"><span>HOW TO USE THIS LENS</span><p>${esc(contract.instruction)}</p><a href="/search">Or describe your question in Search <span aria-hidden="true">↗</span></a></aside>
</div></section>
<section class="discovery-index" id="discovery-index"><div class="wrap wrap--wide">
<div class="discovery-index__head"><div><p class="eyebrow">${esc(contract.label)} index</p><h2>Pick the closest fit.<br>Then inspect the work.</h2></div><label for="discovery-filter-${esc(slug(title))}"><span>Filter these paths</span><input id="discovery-filter-${esc(slug(title))}" type="search" placeholder="Type a word…" autocomplete="off"></label></div>
<div class="discovery-paths">${cards}</div>
<div class="discovery-empty" hidden><strong>No paths match that wording.</strong><p>Clear the filter or <a href="/search">search the whole platform</a> in your own words.</p></div>
</div></section>
<section class="discovery-switch"><div class="wrap wrap--wide"><p><strong>This is one lens, not the whole platform.</strong><span>The same resource can appear under several lenses because subject, audience, industry, and readiness answer different questions.</span></p>${discoveryLensLinks(canonicalPath)}</div></section>
<script>${directoryFilterScript()}</script>`;
  return page(title, `Browse Aloha AI by ${title.toLowerCase()}.`, body, `directory-${slug(title)}`, canonicalPath, `is-directory is-discovery-directory is-discovery-${esc(contract.key)}`);
}

function discoveryContract(canonicalPath) {
  const key = canonicalPath.split('/').filter(Boolean)[0] || 'topics';
  return ({
    topics: {
      key, label: 'Subject', accent: 'violet',
      heading: 'Start with the question you care about.',
      purpose: 'Topics gather work around an idea or problem, even when it crosses products, research, tools, and learning.',
      instruction: 'Choose this lens when you can name the subject but do not yet know what kind of resource you need.'
    },
    audiences: {
      key, label: 'Who it helps', accent: 'coral',
      heading: 'Start with the person doing the work.',
      purpose: 'Audience paths gather resources made for a particular role, team, or learning need.',
      instruction: 'Choose this lens when the user or decision-maker matters more than the sector.'
    },
    industries: {
      key, label: 'Field or market', accent: 'lime',
      heading: 'Start with the world you work in.',
      purpose: 'Industry paths gather work shaped by a field’s language, authority, risks, and operating constraints.',
      instruction: 'Choose this lens when sector context changes what a responsible answer looks like.'
    },
    maturity: {
      key, label: 'Readiness', accent: 'yellow',
      heading: 'Start with what is ready now.',
      purpose: 'Maturity paths separate live work, public betas, research records, concepts, and archived material.',
      instruction: 'Choose this lens when availability and evidence status matter more than subject.'
    }
  })[key];
}

function renderDiscoveryCollection(id, resources, title, canonicalPath) {
  const contract = discoveryContract(canonicalPath);
  const term = title.replace(/^(Topic:|Industry:|For)\s*/i, '').replace(/\s+resources$/i, '');
  const ordered = [...resources].sort(byTitle);
  const kinds = [...new Set(ordered.map((resource) => label(resource.kind)))].sort();
  const filterButtons = [['all', 'All'], ...kinds.map((kind) => [slug(kind), kind])]
    .map(([value, text], index) => `<button type="button" class="discovery-filter${index === 0 ? ' is-active' : ''}" data-resource-filter="${esc(value)}" aria-pressed="${index === 0 ? 'true' : 'false'}">${esc(text)}</button>`).join('');
  const cards = ordered.map((resource, index) => `<a class="discovery-resource discovery-resource--${(index % 6) + 1}" href="${esc(resource.pathname)}" data-resource-kind="${esc(slug(label(resource.kind)))}">
<span class="discovery-resource__top"><span>${String(index + 1).padStart(2, '0')} · ${esc(label(resource.kind))}</span><span>${esc(maturityLabel(resource.maturity))}</span></span>
<strong>${esc(resource.title)}</strong>
<p>${esc(resource.summary)}</p>
<span class="discovery-resource__action">Open the canonical page <i aria-hidden="true">↗</i></span>
</a>`).join('');
  const body = `<section class="discovery-detail-cover discovery-detail-cover--${esc(contract.accent)}"><div class="wrap wrap--wide">
<nav aria-label="Discovery breadcrumb"><a href="/${esc(contract.key)}">${esc(contract.label)} index</a><span aria-hidden="true">/</span><span>${esc(term)}</span></nav>
<p class="eyebrow">${esc(contract.label)} path · ${String(ordered.length).padStart(2, '0')} resources</p>
<h1>${esc(term)}</h1>
<p class="lead">This page gathers every canonical Aloha AI resource currently connected to <strong>${esc(term)}</strong>. Status describes the public resource—not a guarantee about every underlying component.</p>
<a class="btn btn--primary" href="#resource-list">Inspect the resources <span aria-hidden="true">↓</span></a>
</div></section>
<section class="discovery-results" id="resource-list"><div class="wrap wrap--wide">
<div class="discovery-results__head"><div><p class="eyebrow">${esc(contract.label)} · ${esc(term)}</p><h2>Choose the resource that matches the job.</h2></div><div class="discovery-filters" aria-label="Filter resources by type">${filterButtons}</div></div>
<div class="discovery-resources">${cards}</div>
<div class="discovery-empty" hidden><strong>No resources match this type.</strong><p>Choose “All” or return to the <a href="/${esc(contract.key)}">${esc(contract.label.toLowerCase())} index</a>.</p></div>
</div></section>
<section class="discovery-switch"><div class="wrap wrap--wide"><p><strong>Need a different way in?</strong><span>Change lenses without losing access to the same canonical work.</span></p>${discoveryLensLinks(canonicalPath)}</div></section>
<script>${resourceFilterScript()}</script>`;
  return page(title, `Browse ${ordered.length} Aloha AI resources connected to ${term}.`, body, id, canonicalPath, `is-discovery-collection is-discovery-${esc(contract.key)}`);
}

function discoveryLensLinks(currentPath) {
  return `<nav aria-label="Other discovery lenses">${[
    ['/topics', 'Topics'],
    ['/audiences', 'Audiences'],
    ['/industries', 'Industries'],
    ['/maturity', 'Maturity'],
    ['/stacks', 'Stacks']
  ].map(([href, text]) => href === currentPath ? `<span aria-current="page">${text}</span>` : `<a href="${href}">${text} <i aria-hidden="true">↗</i></a>`).join('')}</nav>`;
}

function directoryFilterScript() {
  return `(function(){var input=document.querySelector('[id^="discovery-filter-"]'),items=[].slice.call(document.querySelectorAll('[data-discovery-path]')),empty=document.querySelector('.discovery-empty');if(!input||!items.length)return;function update(){var q=input.value.trim().toLowerCase(),visible=0;items.forEach(function(item){var show=!q||item.getAttribute('data-search').indexOf(q)!==-1;item.hidden=!show;if(show)visible++;});if(empty)empty.hidden=visible!==0;}input.addEventListener('input',update);})();`;
}

function resourceFilterScript() {
  return `(function(){var buttons=[].slice.call(document.querySelectorAll('[data-resource-filter]')),items=[].slice.call(document.querySelectorAll('[data-resource-kind]')),empty=document.querySelector('.discovery-empty');if(!buttons.length||!items.length)return;buttons.forEach(function(button){button.addEventListener('click',function(){var filter=button.getAttribute('data-resource-filter'),visible=0;buttons.forEach(function(item){var active=item===button;item.classList.toggle('is-active',active);item.setAttribute('aria-pressed',active?'true':'false');});items.forEach(function(item){var show=filter==='all'||item.getAttribute('data-resource-kind')===filter;item.hidden=!show;if(show)visible++;});if(empty)empty.hidden=visible!==0;});});})();`;
}

function page(title, description, body, id, canonicalPath, bodyClass = '', robots = 'index, follow') {
  const metadata = buildMetadata({
    title: metadataTitle(title, ' | Aloha AI'),
    description,
    pathname: canonicalPath,
    robots
  });
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">${renderMetadata(metadata)}<meta name="theme-color" content="#0A0A0B"><link rel="icon" href="/favicon.svg" type="image/svg+xml"><link rel="stylesheet" href="/aloha-ds.css"><link rel="stylesheet" href="/site-shell.css"><link rel="stylesheet" href="/page-system.css"><link rel="stylesheet" href="/universal-sections.css"></head><body class="${esc(bodyClass)}" data-generated-collection="${esc(id)}"><a class="skip" href="#main">Skip to content</a><header class="nav"></header><main id="main">${body}</main><footer class="footer"></footer><script src="/browser-actions.js" defer></script><script src="/browser-state.js" defer></script><script src="/site-shell.js" defer></script></body></html>`;
}

function card(r) { return `<a class="card card--hover" href="${esc(r.pathname)}"><p class="mini">${esc(label(r.kind))} · ${esc(r.maturity)}</p><h2>${esc(r.title)}</h2><p>${esc(r.summary)}</p><span class="mini">Open →</span></a>`; }
function renderSearch(resourceCount) {
  const suggestions = [
    'I need help using AI safely',
    'legal research and citation checking',
    'regulatory intelligence',
    'training for my team'
  ];
  const body = `<section class="search-cover"><div class="wrap wrap--wide"><div><p class="eyebrow">Search the whole system</p><h1 aria-label="What are you trying to do?">What are you trying<br>to <em>do?</em></h1><p>Use ordinary language. Search covers services, tools, research, monitors, products, and every University resource.</p></div><aside aria-hidden="true"><span>ASK</span><span>SCAN</span><span>OPEN</span><b>${resourceCount}<br><small>canonical resources</small></b></aside></div></section>
<section class="search-workspace"><div class="wrap search-page">
  <form class="search-form" role="search" id="site-search" data-ev-contract="EV-ACT-001" novalidate>
    <label for="search-query">Describe the work, question, industry, or tool</label>
    <div class="search-form__controls"><input id="search-query" name="q" type="search" autocomplete="off" placeholder="For example: help my legal team verify AI citations"><button class="btn btn--primary" type="submit">Search</button></div>
  </form>
  <div class="search-suggestions" aria-label="Example searches"><span class="mini">Try:</span>${suggestions.map((item) => `<a href="/search?q=${encodeURIComponent(item)}">${esc(item)}</a>`).join('')}</div>
  <p class="search-status is-loading" id="search-status" role="status" aria-live="polite">Loading the resource index…</p>
  <div id="search-errors" class="search-state search-state--error" role="alert" tabindex="-1" hidden></div>
  <div class="search-results" id="search-results" aria-busy="true"></div>
  <noscript><div class="search-state search-state--error"><p class="eyebrow">JavaScript is off</p><h2>Search needs JavaScript, but the site does not.</h2><p>Browse by <a href="/topics">topic</a>, <a href="/industries">industry</a>, <a href="/audiences">audience</a>, or <a href="/university">learning goal</a>.</p></div></noscript>
</div></section>`;
  return page('Search Aloha AI', 'Search Aloha AI services, tools, research, monitoring, and learning resources using plain-language questions.', body, 'search', '/search')
    .replace('</body>', `<script>${searchClientScript()}</script></body>`);
}

function searchClientScript() {
  return `(function(){
  'use strict';
  var form=document.getElementById('site-search');
  var input=document.getElementById('search-query');
  var status=document.getElementById('search-status');
  var results=document.getElementById('search-results');
  var records=[];
  var ready=false;
  var loadFailed=false;
  function words(value){return String(value||'').toLowerCase().normalize('NFKD').replace(/[\\u0300-\\u036f]/g,'').replace(/[^a-z0-9]+/g,' ').trim().split(/\\s+/).filter(function(word){return word.length>1;});}
  function text(value){return String(value||'').toLowerCase();}
  function score(record,query){
    var phrase=text(query).trim();
    var tokens=words(query);
    if(!tokens.length)return 0;
    var title=text(record.title),summary=text(record.summary),keywords=text((record.keywords||[]).join(' '));
    var facets=text([record.kind,record.maturity,(record.topics||[]).join(' '),(record.audiences||[]).join(' '),(record.industries||[]).join(' ')].join(' '));
    var corpus=text(record.text);
    var total=0;
    if(title===phrase)total+=160;
    else if(title.indexOf(phrase)===0)total+=100;
    else if(title.indexOf(phrase)>-1)total+=70;
    if(keywords.indexOf(phrase)>-1)total+=55;
    if(summary.indexOf(phrase)>-1)total+=35;
    tokens.forEach(function(token){
      if(title.indexOf(token)>-1)total+=22;
      if(keywords.indexOf(token)>-1)total+=16;
      if(facets.indexOf(token)>-1)total+=10;
      if(summary.indexOf(token)>-1)total+=7;
      if(corpus.indexOf(token)>-1)total+=2;
    });
    if(tokens.every(function(token){return corpus.indexOf(token)>-1;}))total+=20;
    return total;
  }
  function add(tag,className,value){
    var node=document.createElement(tag);
    if(className)node.className=className;
    if(value)node.textContent=value;
    return node;
  }
  function render(query){
    input.value=query;
    results.replaceChildren();
    status.className='search-status';
    results.setAttribute('aria-busy','false');
    if(!words(query).length){status.textContent='Enter a need, topic, industry, or resource name.';return;}
    var ranked=records.map(function(record){return {record:record,score:score(record,query)};})
      .filter(function(item){return item.score>0;})
      .sort(function(a,b){return b.score-a.score||a.record.title.localeCompare(b.record.title);})
      .slice(0,24);
    status.textContent=ranked.length ? ranked.length+' most relevant result'+(ranked.length===1?'':'s')+' for “'+query+'”.' : 'No close matches for “'+query+'”. Try fewer words or contact RN for help.';
    if(!ranked.length){
      var empty=add('div','search-state search-state--empty search-empty');
      empty.append(add('p','eyebrow','No close match'));
      empty.append(add('h2','','Not sure what to call it?'));
      empty.append(add('p','','You do not need to translate the problem into Aloha AI terminology.'));
      var browse=add('a','btn btn--outline','Browse topics');
      browse.href='/topics';
      empty.append(browse);
      var contact=add('a','btn btn--primary','Start a conversation');
      contact.href='/university/contact';
      empty.append(contact);
      results.append(empty);
      return;
    }
    ranked.forEach(function(item,itemIndex){
      var record=item.record;
      var link=add('a','search-result search-result--'+String((itemIndex%6)+1));
      link.href=record.pathname;
      link.append(add('p','mini',String(record.kind||'resource').replace(/([a-z])([A-Z])/g,'$1 $2')+' · '+record.maturity));
      link.append(add('h2','',record.title));
      link.append(add('p','',record.summary));
      link.append(add('span','mini','Open →'));
      results.append(link);
    });
  }
  function run(query,push){
    if(push)history.pushState({},'',query?'/search?q='+encodeURIComponent(query):'/search');
    if(!words(query).length){var errors=document.getElementById('search-errors');errors.hidden=false;errors.innerHTML='<h2>Search needs a query.</h2><p>Enter at least one word describing the work, question, industry, or tool.</p>';status.textContent='Search not run.';input.focus();return;}
    document.getElementById('search-errors').hidden=true;
    if(loadFailed){status.textContent='Search is unavailable until the index is reloaded.';return;}
    if(!ready){status.textContent='The index is still loading. Your query remains in the field; submit it again when loading completes.';return;}
    render(query);
  }
  form.addEventListener('submit',function(event){event.preventDefault();run(input.value.trim(),true);});
  window.addEventListener('popstate',function(){run(new URLSearchParams(location.search).get('q')||'',false);});
  fetch('/search-index.json').then(function(response){if(!response.ok)throw new Error('Search index unavailable');return response.json();})
    .then(function(data){records=Array.isArray(data)?data:[];ready=true;run(new URLSearchParams(location.search).get('q')||'',false);})
    .catch(function(){loadFailed=true;status.className='search-status is-error';status.textContent='Search is temporarily unavailable.';results.setAttribute('aria-busy','false');var error=add('div','search-state search-state--error');error.append(add('h2','','The index did not load. The rest of the site still works.'));var retry=add('button','btn btn--primary','Reload search index');retry.type='button';retry.onclick=function(){location.reload();};error.append(retry);var browse=add('a','btn btn--outline','Browse topics');browse.href='/topics';error.append(browse);var contact=add('a','btn btn--primary','Start a conversation');contact.href='/university/contact?source=%2Fsearch&offer=site-search&inquiry=not-sure';error.append(contact);results.append(error);});
})();`;
}

function renderNotFound() {
  const body = `<section class="not-found"><div class="wrap wrap--wide">
<div class="not-found__code" aria-hidden="true"><span>4</span><b>?</b><span>4</span></div>
<div class="not-found__copy"><p class="eyebrow">This route does not exist</p><h1>The page moved—or the path never belonged here.</h1><p>Nothing is hidden behind this error. Search the complete resource system, return home, or choose a reliable front door.</p><form class="not-found__search" action="/search" method="get" role="search"><label for="not-found-query">Search Aloha AI</label><div><input id="not-found-query" name="q" type="search" placeholder="What were you looking for?"><button class="btn btn--primary" type="submit">Search</button></div></form><nav aria-label="Useful destinations"><a href="/">Home</a><a href="/services">Services</a><a href="/tools">Tools</a><a href="/university">University</a><a href="/methods">Methods</a></nav></div>
</div></section>`;
  return page('Page not found', 'The requested Aloha AI page does not exist. Search the platform or choose a reliable destination.', body, 'not-found', '/404', 'is-not-found', 'noindex, follow');
}
function apiPayload(resources, bridge) { const mappings=new Map(bridge.resources.map((entry)=>[entry.resourceId,entry])); return { version: 1, generatedAt: deterministicTimestamp(resources), count: resources.length, resources: resources.map((r)=>publicResource(r,mappings.get(r.id))) }; }
function deterministicTimestamp(resources) { const values=resources.map((r)=>r.updated||r.publishedAt||r.date).filter(Boolean).sort(); return values.at(-1)||null; }
function publicResource(r, mapping) { const { sourceFile, ...publicFields } = r; return { ...publicFields, workspaceUrl:mapping?.workspace.url||null, assessmentUrls:(mapping?.assessments||[]).map((item)=>item.url) }; }
function searchIndex(resources, collectionPages = {}) {
  const resourceEntries = resources.map((r) => ({ id:r.id, title:r.title, summary:r.summary, pathname:r.pathname, kind:r.kind, maturity:r.maturity, topics:r.topics||[], audience:r.audience||null, audiences:audienceTerms(r), industries:r.industries||[], keywords:[...(r.keywords||[]),...(r.synonyms||[])], text:[r.title,r.summary,r.audience||'',...(r.topics||[]),...audienceTerms(r),...(r.industries||[]),...(r.keywords||[]),...(r.synonyms||[]),editorialText(r)].join(' ').toLowerCase() }));
  const collectionEntries = Object.values(collectionPages).map((r) => ({ id:r.id, title:r.title, summary:r.summary, pathname:r.pathname, kind:'derivedCollection', maturity:'Production', topics:r.topics||[], audience:r.audience||null, audiences:[], industries:r.industries||[], keywords:r.keywords||[], text:[r.title,r.summary,r.audience||'',...(r.topics||[]),...(r.industries||[]),...(r.keywords||[]),editorialText(r)].join(' ').toLowerCase() }));
  return [...resourceEntries, ...collectionEntries];
}

export function validateCollectionPages(collectionPages, resources, platform) {
  const errors = [];
  if (!collectionPages || typeof collectionPages !== 'object' || Array.isArray(collectionPages)) return ['collection pages: metadata must be an object keyed by pathname'];
  const resourcePaths = new Set(resources.map((resource) => resource.pathname));
  const derivedPaths = new Set([...platform.collections.keys()].map((name) => `/${name}`).filter((pathname) => !resourcePaths.has(pathname)));
  for (const [pathname, page] of Object.entries(collectionPages)) {
    if (!derivedPaths.has(pathname)) errors.push(`collection pages: ${pathname} is not a derived collection route`);
    if (!page || typeof page !== 'object' || Array.isArray(page)) { errors.push(`collection pages: ${pathname} must be an object`); continue; }
    for (const field of ['id','pathname','title','summary']) if (typeof page[field] !== 'string' || !page[field].trim()) errors.push(`collection pages: ${pathname} requires ${field}`);
    if (page.pathname !== pathname) errors.push(`collection pages: ${pathname} pathname does not match its key`);
    errors.push(...validateEditorialContent(page));
  }
  return errors;
}

function validateEditorialContent(resource) {
  const errors = [];
  if (resource.seoTitle != null && (typeof resource.seoTitle !== 'string' || !resource.seoTitle.trim())) {
    errors.push(`${resource.id}: seoTitle must be a non-empty string`);
  }
  if (resource.editorialIntro != null && (!Array.isArray(resource.editorialIntro) || resource.editorialIntro.some((item) => typeof item !== 'string' || !item.trim()))) {
    errors.push(`${resource.id}: editorialIntro must contain non-empty strings`);
  }
  if (resource.editorialSections == null) return errors;
  if (!Array.isArray(resource.editorialSections) || !resource.editorialSections.length) {
    errors.push(`${resource.id}: editorialSections must be a non-empty array`);
    return errors;
  }
  const allowed = new Set(['paragraph','heading','links','list','quote','code','table']);
  for (const [sectionIndex, section] of resource.editorialSections.entries()) {
    if (!section || typeof section !== 'object' || Array.isArray(section)) {
      errors.push(`${resource.id}: editorial section ${sectionIndex + 1} must be an object`);
      continue;
    }
    if (typeof section.title !== 'string' || !section.title.trim()) errors.push(`${resource.id}: editorial section ${sectionIndex + 1} requires a title`);
    if (!Array.isArray(section.blocks) || !section.blocks.length) {
      errors.push(`${resource.id}: editorial section ${sectionIndex + 1} requires blocks`);
      continue;
    }
    const linkedResourceSection = ['Live intelligence tools', 'The Regulated Trust Stack'].includes(section.title);
    for (const [blockIndex, block] of section.blocks.entries()) {
      const prefix = `${resource.id}: editorial section ${sectionIndex + 1} block ${blockIndex + 1}`;
      if (!block || typeof block !== 'object' || Array.isArray(block) || !allowed.has(block.type)) {
        errors.push(`${prefix} has an unsupported type`);
      } else if (block.type === 'list' && (!Array.isArray(block.items) || !block.items.length || block.items.some((item) => typeof item !== 'string' || !item.trim()))) {
        errors.push(`${prefix} list requires non-empty items`);
      } else if (block.type === 'links' && (!Array.isArray(block.items) || !block.items.length || block.items.some((item) => typeof item.label !== 'string' || !item.label.trim() || typeof item.href !== 'string' || !item.href.startsWith('/')))) {
        errors.push(`${prefix} links require labels and internal hrefs`);
      } else if (block.type === 'table' && (!Array.isArray(block.rows) || !block.rows.length || block.rows.some((row) => !Array.isArray(row.cells) || !row.cells.length || row.cells.some((cell) => typeof cell.text !== 'string' || !cell.text.trim())))) {
        errors.push(`${prefix} table requires rows with non-empty cells`);
      } else if (!['list','links','table'].includes(block.type) && (typeof block.text !== 'string' || !block.text.trim())) {
        errors.push(`${prefix} requires text`);
      } else if (block.type === 'heading' && block.href != null && (typeof block.href !== 'string' || !block.href.startsWith('/'))) {
        errors.push(`${prefix} heading href must be an internal path`);
      } else if (linkedResourceSection && block.type === 'heading' && !block.href) {
        errors.push(`${prefix} names a resource but does not link it`);
      }
    }
  }
  return errors;
}

function editorialText(resource) {
  return [
    ...(resource.editorialIntro || []),
    ...(resource.editorialSections || []).flatMap((section) => [
      section.title || '',
      ...(section.blocks || []).flatMap((block) => block.type === 'list'
        ? block.items || []
        : block.type === 'links'
          ? (block.items || []).map((item) => item.label)
        : block.type === 'table'
          ? (block.rows || []).flatMap((row) => (row.cells || []).map((cell) => cell.text))
          : [block.text || ''])
    ])
  ].join(' ');
}
function buildWorkspaceBridge(resources, registry) {
  const workspace = resources.find((r)=>r.workspace && typeof r.workspace==='object' && !Array.isArray(r.workspace));
  const acceptedKinds = new Set(workspace?.workspace?.acceptsResourceKinds||[]);
  const assessments = resources.filter((r)=>r.kind==='assessment' && r.assessment && typeof r.assessment==='object' && !Array.isArray(r.assessment));
  return {
    version: 1,
    workspaceResourceId: workspace?.id||null,
    resources: resources.map((r)=>{
      const available = Boolean(workspace && acceptedKinds.has(r.kind) && r.maturity!=='Archived');
      const mapped = assessments.filter((assessment)=>(assessment.assessment.appliesToKinds||[]).includes(r.kind));
      return {
        resourceId:r.id,
        pathname:r.pathname,
        kind:r.kind,
        maturity:r.maturity,
        relationships:relationships(r),
        workspace:{ available, url:available?workspaceUrl(r,workspace):null },
        assessments:mapped.map((assessment)=>({
          assessmentId:assessment.id,
          url:assessmentUrl(r,assessment),
          recommendations:(assessment.assessment.recommendations||[]).map((rule)=>({ id:rule.id, condition:rule.condition, resourceIds:rule.resourceIds }))
        }))
      };
    })
  };
}
function validateWorkspaceBridge(resources, registry, bridge) {
  const errors=[];
  const workspaces=resources.filter((r)=>r.workspace!=null);
  const workspaceRequired=workspaces.length>0||resources.some((r)=>r.kind==='assessment');
  if(workspaceRequired&&workspaces.length!==1) errors.push(`workspace bridge: expected exactly one workspace configuration, found ${workspaces.length}`);
  for(const workspace of workspaces){
    if(!workspace.workspace||typeof workspace.workspace!=='object'||Array.isArray(workspace.workspace)){errors.push(`${workspace.id}: workspace must be an object`);continue;}
    const kinds=workspace.workspace.acceptsResourceKinds;
    if(!Array.isArray(kinds)||!kinds.length) errors.push(`${workspace.id}: workspace.acceptsResourceKinds must be a non-empty array`);
    else for(const kind of kinds) if(!KINDS.includes(kind)) errors.push(`${workspace.id}: unsupported workspace resource kind ${kind}`);
  }
  const ruleIds=new Set();
  for(const assessment of resources.filter((r)=>r.kind==='assessment')){
    const contract=assessment.assessment;
    if(!contract||typeof contract!=='object'||Array.isArray(contract)){errors.push(`${assessment.id}: assessment contract must be an object`);continue;}
    if(!Array.isArray(contract.dimensions)||!contract.dimensions.length) errors.push(`${assessment.id}: assessment.dimensions must be a non-empty array`);
    if(!Array.isArray(contract.appliesToKinds)||!contract.appliesToKinds.length) errors.push(`${assessment.id}: assessment.appliesToKinds must be a non-empty array`);
    else for(const kind of contract.appliesToKinds) if(!KINDS.includes(kind)) errors.push(`${assessment.id}: unsupported assessment resource kind ${kind}`);
    if(!Array.isArray(contract.recommendations)||!contract.recommendations.length) errors.push(`${assessment.id}: assessment.recommendations must be a non-empty array`);
    for(const rule of contract.recommendations||[]){
      if(!rule||typeof rule!=='object'||Array.isArray(rule)){errors.push(`${assessment.id}: recommendation entries must be objects`);continue;}
      const key=`${assessment.id}:${rule.id}`;
      if(typeof rule.id!=='string'||!rule.id) errors.push(`${assessment.id}: recommendation id must be a non-empty string`);
      else if(ruleIds.has(key)) errors.push(`${assessment.id}: duplicate recommendation id ${rule.id}`); else ruleIds.add(key);
      if(typeof rule.condition!=='string'||!rule.condition) errors.push(`${assessment.id}: recommendation ${rule.id||'unknown'} must define condition`);
      if(!Array.isArray(rule.resourceIds)||!rule.resourceIds.length) errors.push(`${assessment.id}: recommendation ${rule.id||'unknown'} must map resourceIds`);
      else for(const id of rule.resourceIds) if(!registry.has(id)) errors.push(`${assessment.id}: recommendation ${rule.id||'unknown'} has unresolved resource ${id}`);
    }
  }
  if(!bridge||!Array.isArray(bridge.resources)||bridge.resources.length!==resources.length) errors.push('workspace bridge: registry does not cover every resource');
  return errors;
}
function validateCollectionContracts(resources, registry) {
  const errors=[];
  for(const resource of resources.filter((item)=>item.collection)){
    const contract=resource.collection;
    if(typeof contract!=='object'||Array.isArray(contract)){errors.push(`${resource.id}: collection must be an object`);continue;}
    if(contract.resourceIds!=null){
      if(!Array.isArray(contract.resourceIds)||!contract.resourceIds.length) errors.push(`${resource.id}: collection.resourceIds must be a non-empty array`);
      else {
        const seen=new Set();
        for(const id of contract.resourceIds){
          if(seen.has(id)) errors.push(`${resource.id}: duplicate collection resource ${id}`); else seen.add(id);
          if(!registry.has(id)) errors.push(`${resource.id}: unresolved collection resource ${id}`);
          if(id===resource.id) errors.push(`${resource.id}: collection cannot include itself`);
        }
      }
    }
  }
  return errors;
}
function workspaceUrl(r, workspace) { return `${workspace.pathname}?resource_id=${encodeURIComponent(r.id)}&source_path=${encodeURIComponent(r.pathname)}`; }
function assessmentUrl(r, assessment) { return `${assessment.pathname}?resource_id=${encodeURIComponent(r.id)}&source_path=${encodeURIComponent(r.pathname)}`; }
function sitemap(resources, outputs) { const routes = new Set([...resources.map((r)=>r.pathname), ...[...outputs.keys()].filter((p)=>p!=='/404'&&!p.endsWith('.json')&&!p.endsWith('.txt')&&!p.endsWith('.xml'))]); return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${[...routes].sort().map((r)=>`  <url><loc>${BASE_URL}${r}</loc></url>`).join('\n')}\n</urlset>\n`; }
function rss(resources) { const items = resources.filter((r)=>r.maturity!=='Archived').sort((a,b)=>(b.updated||'').localeCompare(a.updated||'')).slice(0,50); return `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>Aloha AI resources</title><link>${BASE_URL}</link><description>Structured services, products, tools, research, builds, and learning resources.</description>${items.map((r)=>`<item><guid>${escXml(r.id)}</guid><title>${escXml(r.title)}</title><link>${BASE_URL}${r.pathname}</link><description>${escXml(r.summary)}</description></item>`).join('')}</channel></rss>`; }
function buildGraph(resources) { return { nodes:resources.map((r)=>({id:r.id,kind:r.kind,pathname:r.pathname,title:r.title,maturity:r.maturity})), edges:resources.flatMap((r)=>relationships(r).map((rel)=>({source:r.id,...rel}))) }; }
function relationships(r) { return Array.isArray(r.relationships) ? r.relationships : []; }
function collectionFor(kind) { return ({service:'services',product:'products',tool:'tools',assessment:'tools',monitor:'monitors',research:'research',build:'builds',learningHub:'university',course:'university',lesson:'university',playbook:'university',template:'university',toolGuide:'university',useCase:'university',collection:'university',institutional:'governance',policy:'governance'})[kind] || 'resources'; }
function taxonomy(resources, field, fallback) { const map = new Map(); for (const r of resources) { const vals = r[field] || (fallback ? fallback(r) : []); for (const value of vals || []) { const key=slug(value); if(!key) continue; if(!map.has(key)) map.set(key,[]); map.get(key).push(r); } } return map; }
function normalizeAudience(value, resource = {}) {
  if (!value) return [];
  if (Array.isArray(value)) return [...new Set(value.map(String).map((item) => item.trim()).filter(Boolean))];
  const matched = AUDIENCE_RULES.filter(([, expression]) => expression.test(value)).map(([label]) => label);
  if (matched.length) return matched;
  if (['learningHub','course','lesson','playbook','template','toolGuide','useCase','collection'].includes(resource.kind)) return ['Educators and learners'];
  return ['Operators and teams'];
}
function audienceTerms(r) { return r.audiences || normalizeAudience(r.audience, r); }
function groupBy(items, fn) { const map=new Map(); for(const item of items){const key=fn(item); if(!map.has(key)) map.set(key,[]); map.get(key).push(item);} return map; }
function cycleErrors(resources, registry) { const errors=[]; const visiting=new Set(), visited=new Set(); const dfs=(id,trail=[])=>{if(visiting.has(id)){errors.push(`dependency cycle: ${[...trail,id].join(' -> ')}`);return;} if(visited.has(id))return; visiting.add(id); const r=registry.get(id); for(const rel of relationships(r||{}).filter((x)=>x?.type==='depends_on')) if(registry.has(rel.target)) dfs(rel.target,[...trail,id]); visiting.delete(id); visited.add(id);}; for(const r of resources) dfs(r.id); return [...new Set(errors)]; }
function reciprocityWarnings(resources, registry) { const out=[]; for(const r of resources) for(const rel of relationships(r)) if(rel&&['supersedes','extends'].includes(rel.type)&&registry.has(rel.target)&&!relationships(registry.get(rel.target)).some((x)=>x?.target===r.id)) out.push(`${r.id}: ${rel.type} ${rel.target} has no reciprocal edge`); return out; }
function reachabilityErrors(resources, graph) { const connected=new Set(); for(const e of graph.edges) { connected.add(e.source); connected.add(e.target); } return resources.filter((r)=>!connected.has(r.id)).map((r)=>`${r.id}: unreachable orphan resource`); }
function walk(dir) { if(!fs.existsSync(dir)) return []; return fs.readdirSync(dir,{withFileTypes:true}).flatMap((e)=>{const f=path.join(dir,e.name); return e.isDirectory()?walk(f):[f];}); }
function outputFile(p) { if(p==='/') return 'index.html'; const clean=p.replace(/^\//,''); if(/\.[a-z0-9]+$/i.test(clean)) return clean; return `${clean}.html`; }
function htmlRoute(file) { const normalized=file.split(path.sep).join('/').replace(/\/index\.html$/,'').replace(/\.html$/,''); return normalized==='index' ? '/' : `/${normalized}`; }
function migrationFamily(pathname) {
  const first=pathname.split('/').filter(Boolean)[0];
  if(['monitors','research','tools','builds','methods','university'].includes(first)) return first;
  if(['trust-stack','platform','stacks','systems','twins','practice'].includes(first)) return 'platform';
  if(['notes','teardowns'].includes(first)) return 'research';
  if(['privacy','terms','about','partners'].includes(first)) return 'governance';
  if(pathname==='/'||pathname.startsWith('/homepage-')) return 'site';
  return 'services';
}
function normalizeRoute(p) { if(!p) return ''; const clean=p.split('?')[0].split('#')[0].replace(/\.html$/,'').replace(/\/$/,''); return clean || '/'; }
function staticAsset(route) { return /\.(css|js|png|jpe?g|svg|webp|ico|pdf|xml|json|txt|woff2?)$/i.test(route); }
function slug(v) { return String(v||'').toLowerCase().trim().replace(/&/g,' and ').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,''); }
function humanize(v) { return String(v).split('-').map((x)=>x.charAt(0).toUpperCase()+x.slice(1)).join(' '); }
function label(v) { return humanize(v === 'learningHub' ? 'learning hub' : v); }
function byTitle(a,b) { return a.title.localeCompare(b.title); }
function esc(v) { return String(v??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#039;'); }
function escXml(v) { return esc(v); }
