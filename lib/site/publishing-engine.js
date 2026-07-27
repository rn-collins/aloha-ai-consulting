import fs from 'node:fs';
import path from 'node:path';
import { metadataDescription, metadataTitle } from './metadata.js';

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
  const audiences = taxonomy(resources, 'audiences', (r) => normalizeAudience(r.audience, r));
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
  errors.push(...validateCollectionContracts(resources, platform.registry));
  errors.push(...cycleErrors(resources, platform.registry));
  errors.push(...reachabilityErrors(resources, platform.graph));
  warnings.push(...reciprocityWarnings(resources, platform.registry));
  return { errors, warnings };
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
  outputs.set('/search', renderSearch());
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
  const groups = groupBy(resources, (r) => label(collectionFor(r.kind)));
  const summary = metadata?.summary || `Browse ${resources.length} structured Aloha AI resources.`;
  const editorial = renderCollectionEditorial(metadata);
  return page(title, summary, `<section class="page-hero section--ink"><div class="wrap"><p class="eyebrow">${esc(metadata?.eyebrow || 'Discovery')}</p><h1 class="display">${esc(title)}</h1><p class="lead">${esc(summary)}</p></div></section>${editorial}${[...groups].map(([group, items]) => `<section class="section"><div class="wrap"><p class="eyebrow">${esc(group)}</p><div class="grid grid-3">${items.sort(byTitle).map(card).join('')}</div></div></section>`).join('')}`, id, canonicalPath);
}

function renderCollectionEditorial(metadata) {
  if (!metadata) return '';
  const intro = (metadata.editorialIntro || []).map((text) => `<p class="lead">${esc(text)}</p>`).join('');
  const sections = (metadata.editorialSections || []).map((section, index) => `<section class="section${index % 2 ? ' section--paper' : ''}"><div class="wrap prose">${section.eyebrow ? `<p class="eyebrow">${esc(section.eyebrow)}</p>` : ''}<h2 class="h2">${esc(section.title)}</h2>${(section.blocks || []).map(renderCollectionBlock).join('')}</div></section>`).join('');
  return intro ? `<section class="section section--paper"><div class="wrap prose"><p class="eyebrow">In depth</p>${intro}</div></section>${sections}` : sections;
}

function renderCollectionBlock(block) {
  if (block.type === 'paragraph') return `<p>${esc(block.text)}</p>`;
  if (block.type === 'heading') return `<h3>${esc(block.text)}</h3>`;
  if (block.type === 'list') {
    const tag = block.ordered ? 'ol' : 'ul';
    return `<${tag}>${(block.items || []).map((item) => `<li>${esc(item)}</li>`).join('')}</${tag}>`;
  }
  if (block.type === 'quote') return `<blockquote>${esc(block.text)}</blockquote>`;
  if (block.type === 'code') return `<pre><code>${esc(block.text)}</code></pre>`;
  if (block.type === 'table') return `<div style="overflow-x:auto"><table><tbody>${(block.rows || []).map((row, rowIndex) => `<tr>${(row.cells || []).map((cell) => `<${cell.header || rowIndex === 0 ? 'th' : 'td'}>${esc(cell.text)}</${cell.header || rowIndex === 0 ? 'th' : 'td'}>`).join('')}</tr>`).join('')}</tbody></table></div>`;
  return '';
}

function renderDirectory(title, index, prefix, canonicalPath) {
  return page(title, `Browse Aloha AI by ${title.toLowerCase()}.`, `<section class="page-hero section--ink"><div class="wrap"><p class="eyebrow">Directory</p><h1 class="display">${esc(title)}</h1></div></section><section class="section"><div class="wrap"><div class="grid grid-3">${[...index].sort(([a],[b]) => a.localeCompare(b)).map(([key, items]) => `<a class="card card--hover" href="${prefix}${key}"><h2>${esc(humanize(key))}</h2><p>${items.length} resource${items.length === 1 ? '' : 's'}</p></a>`).join('')}</div></div></section>`, `directory-${slug(title)}`, canonicalPath);
}

function page(title, description, body, id, canonicalPath) {
  const searchTitle = metadataTitle(title, ' | Aloha AI');
  const searchDescription = metadataDescription(description);
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(searchTitle)}</title><meta name="description" content="${esc(searchDescription)}"><link rel="canonical" href="${BASE_URL}${canonicalPath}"><link rel="stylesheet" href="/aloha-ds.css"><link rel="stylesheet" href="/site-shell.css"><link rel="stylesheet" href="/page-system.css"><link rel="stylesheet" href="/universal-sections.css"></head><body data-generated-collection="${esc(id)}"><a class="skip" href="#main">Skip to content</a><header class="nav"></header><main id="main">${body}</main><footer class="footer"></footer><script src="/site-shell.js" defer></script></body></html>`;
}

function card(r) { return `<a class="card card--hover" href="${esc(r.pathname)}"><p class="mini">${esc(label(r.kind))} · ${esc(r.maturity)}</p><h2>${esc(r.title)}</h2><p>${esc(r.summary)}</p><span class="mini">Open →</span></a>`; }
function renderSearch() {
  const suggestions = [
    'I need help using AI safely',
    'legal research and citation checking',
    'regulatory intelligence',
    'training for my team'
  ];
  const body = `<section class="page-hero section--ink"><div class="wrap"><p class="eyebrow">Discovery</p><h1 class="display">What do you need help with?</h1><p class="lead">Describe the problem in your own words. Search covers Aloha AI services, tools, research, monitoring, and University resources.</p></div></section>
<section class="section"><div class="wrap search-page">
  <form class="search-form" role="search" id="site-search">
    <label for="search-query">Search the platform</label>
    <div class="search-form__controls"><input id="search-query" name="q" type="search" autocomplete="off" placeholder="For example: help my legal team verify AI citations"><button class="btn btn--primary" type="submit">Search</button></div>
  </form>
  <div class="search-suggestions" aria-label="Example searches"><span class="mini">Try:</span>${suggestions.map((item) => `<a href="/search?q=${encodeURIComponent(item)}">${esc(item)}</a>`).join('')}</div>
  <p class="search-status" id="search-status" role="status" aria-live="polite">Enter a need, topic, industry, or resource name.</p>
  <div class="search-results" id="search-results"></div>
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
    if(!words(query).length){status.textContent='Enter a need, topic, industry, or resource name.';return;}
    var ranked=records.map(function(record){return {record:record,score:score(record,query)};})
      .filter(function(item){return item.score>0;})
      .sort(function(a,b){return b.score-a.score||a.record.title.localeCompare(b.record.title);})
      .slice(0,24);
    status.textContent=ranked.length ? ranked.length+' most relevant result'+(ranked.length===1?'':'s')+' for “'+query+'”.' : 'No close matches for “'+query+'”. Try fewer words or contact RN for help.';
    if(!ranked.length){
      var empty=add('div','card search-empty');
      empty.append(add('h2','','Not sure what to call it?'));
      empty.append(add('p','','You do not need to translate the problem into Aloha AI terminology.'));
      var contact=add('a','btn btn--primary','Start a conversation');
      contact.href='/university/contact';
      empty.append(contact);
      results.append(empty);
      return;
    }
    ranked.forEach(function(item){
      var record=item.record;
      var link=add('a','card card--hover search-result');
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
    render(query);
  }
  form.addEventListener('submit',function(event){event.preventDefault();run(input.value.trim(),true);});
  window.addEventListener('popstate',function(){run(new URLSearchParams(location.search).get('q')||'',false);});
  fetch('/search-index.json').then(function(response){if(!response.ok)throw new Error('Search index unavailable');return response.json();})
    .then(function(data){records=Array.isArray(data)?data:[];run(new URLSearchParams(location.search).get('q')||'',false);})
    .catch(function(){status.textContent='Search is temporarily unavailable. You can still contact RN directly.';var contact=add('a','btn btn--primary','Start a conversation');contact.href='/university/contact';results.append(contact);});
})();`;
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
  const allowed = new Set(['paragraph','heading','list','quote','code','table']);
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
    for (const [blockIndex, block] of section.blocks.entries()) {
      const prefix = `${resource.id}: editorial section ${sectionIndex + 1} block ${blockIndex + 1}`;
      if (!block || typeof block !== 'object' || Array.isArray(block) || !allowed.has(block.type)) {
        errors.push(`${prefix} has an unsupported type`);
      } else if (block.type === 'list' && (!Array.isArray(block.items) || !block.items.length || block.items.some((item) => typeof item !== 'string' || !item.trim()))) {
        errors.push(`${prefix} list requires non-empty items`);
      } else if (block.type === 'table' && (!Array.isArray(block.rows) || !block.rows.length || block.rows.some((row) => !Array.isArray(row.cells) || !row.cells.length || row.cells.some((cell) => typeof cell.text !== 'string' || !cell.text.trim())))) {
        errors.push(`${prefix} table requires rows with non-empty cells`);
      } else if (!['list','table'].includes(block.type) && (typeof block.text !== 'string' || !block.text.trim())) {
        errors.push(`${prefix} requires text`);
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
function sitemap(resources, outputs) { const routes = new Set([...resources.map((r)=>r.pathname), ...[...outputs.keys()].filter((p)=>!p.endsWith('.json')&&!p.endsWith('.txt')&&!p.endsWith('.xml'))]); return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${[...routes].sort().map((r)=>`  <url><loc>${BASE_URL}${r}</loc></url>`).join('\n')}\n</urlset>\n`; }
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
