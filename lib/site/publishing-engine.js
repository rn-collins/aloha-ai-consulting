import fs from 'node:fs';
import path from 'node:path';

const BASE_URL = 'https://aloha-ai-consulting.vercel.app';
const KINDS = ['service','product','tool','monitor','research','build','learningHub','course','lesson','assessment'];
const MATURITY = ['Concept','Research','Beta','Production','Archived'];
const RELATIONS = ['uses','supports','teaches','implements','evidences','depends_on','extends','produced_by','available_in_workspace','supersedes','documents','related_to'];

export function derivePlatform(resources) {
  const registry = new Map(resources.map((r) => [r.id, r]));
  const collections = groupBy(resources, (r) => collectionFor(r.kind));
  const topics = taxonomy(resources, 'topics');
  const audiences = taxonomy(resources, 'audiences', (r) => normalizeAudience(r.audience));
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
  const slugs = new Map();

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
    const pathSlug = r.pathname.split('/').filter(Boolean).pop() || 'home';
    if (slugs.has(pathSlug) && slugs.get(pathSlug) !== r.pathname) warnings.push(`duplicate terminal slug: ${pathSlug}`); else slugs.set(pathSlug, r.pathname);

    if (Object.hasOwn(r, 'relatedIds')) errors.push(`${r.id}: relatedIds is deprecated; use typed relationships`);
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
  errors.push(...cycleErrors(resources, platform.registry));
  errors.push(...reachabilityErrors(resources, platform.graph));
  warnings.push(...reciprocityWarnings(resources, platform.registry));
  return { errors, warnings };
}

export function generatedOutputs(resources, platform) {
  const outputs = new Map();
  const resourcePaths = new Set(resources.map((resource) => resource.pathname));
  for (const [name, items] of platform.collections) {
    const collectionPath = `/${name}`;
    if (!resourcePaths.has(collectionPath)) outputs.set(collectionPath, renderCollection(name, items, `${label(name)} resources`, collectionPath));
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
  outputs.set('/api/graph.json', JSON.stringify(platform.graph, null, 2));
  outputs.set('/search-index.json', JSON.stringify(searchIndex(resources), null, 2));
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
  const routes = walk(root)
    .filter((file) => file.endsWith('.html') && !file.includes(`${path.sep}.git${path.sep}`))
    .map((file) => path.relative(root, file))
    .filter((file) => !generatedRoutes.has(normalizeRoute(htmlRoute(file))))
    .sort()
    .map((file) => {
      const pathname = htmlRoute(file);
      const family = migrationFamily(pathname);
      return {
        pathname,
        sourceFile: file,
        family,
        targetDirectory: `content/${family}`,
        status: 'handwritten'
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

function renderCollection(id, resources, title, canonicalPath) {
  const groups = groupBy(resources, (r) => label(collectionFor(r.kind)));
  return page(title, `Browse ${resources.length} structured Aloha AI resources.`, `<section class="page-hero section--ink"><div class="wrap"><p class="eyebrow">Discovery</p><h1 class="display">${esc(title)}</h1><p class="lead">Filterable, registry-generated discovery across the same canonical resources used by the public site and Workspace.</p></div></section>${[...groups].map(([group, items]) => `<section class="section"><div class="wrap"><p class="eyebrow">${esc(group)}</p><div class="grid grid-3">${items.sort(byTitle).map(card).join('')}</div></div></section>`).join('')}`, id, canonicalPath);
}

function renderDirectory(title, index, prefix, canonicalPath) {
  return page(title, `Browse Aloha AI by ${title.toLowerCase()}.`, `<section class="page-hero section--ink"><div class="wrap"><p class="eyebrow">Directory</p><h1 class="display">${esc(title)}</h1></div></section><section class="section"><div class="wrap"><div class="grid grid-3">${[...index].sort(([a],[b]) => a.localeCompare(b)).map(([key, items]) => `<a class="card card--hover" href="${prefix}${key}"><h2>${esc(humanize(key))}</h2><p>${items.length} resource${items.length === 1 ? '' : 's'}</p></a>`).join('')}</div></div></section>`, `directory-${slug(title)}`, canonicalPath);
}

function page(title, description, body, id, canonicalPath) {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)} | Aloha AI</title><meta name="description" content="${esc(description)}"><link rel="canonical" href="${BASE_URL}${canonicalPath}"><link rel="stylesheet" href="/aloha-ds.css"><link rel="stylesheet" href="/site-shell.css"><link rel="stylesheet" href="/page-system.css"><link rel="stylesheet" href="/universal-sections.css"></head><body data-generated-collection="${esc(id)}"><a class="skip" href="#main">Skip to content</a><header class="nav"></header><main id="main">${body}</main><footer class="footer"></footer><script src="/site-shell.js" defer></script></body></html>`;
}

function card(r) { return `<a class="card card--hover" href="${esc(r.pathname)}"><p class="mini">${esc(label(r.kind))} · ${esc(r.maturity)}</p><h2>${esc(r.title)}</h2><p>${esc(r.summary)}</p><span class="mini">Open →</span></a>`; }
function apiPayload(resources, bridge) { const mappings=new Map(bridge.resources.map((entry)=>[entry.resourceId,entry])); return { version: 1, generatedAt: deterministicTimestamp(resources), count: resources.length, resources: resources.map((r)=>publicResource(r,mappings.get(r.id))) }; }
function deterministicTimestamp(resources) { const values=resources.map((r)=>r.updated||r.publishedAt||r.date).filter(Boolean).sort(); return values.at(-1)||null; }
function publicResource(r, mapping) { const { sourceFile, ...publicFields } = r; return { ...publicFields, workspaceUrl:mapping?.workspace.url||null, assessmentUrls:(mapping?.assessments||[]).map((item)=>item.url) }; }
function searchIndex(resources) { return resources.map((r) => ({ id:r.id, title:r.title, summary:r.summary, pathname:r.pathname, kind:r.kind, maturity:r.maturity, topics:r.topics||[], audiences:audienceTerms(r), industries:r.industries||[], keywords:[...(r.keywords||[]),...(r.synonyms||[])], text:[r.title,r.summary,...(r.topics||[]),...audienceTerms(r),...(r.industries||[]),...(r.keywords||[]),...(r.synonyms||[])].join(' ').toLowerCase() })); }
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
function workspaceUrl(r, workspace) { return `${workspace.pathname}?resource_id=${encodeURIComponent(r.id)}&source_path=${encodeURIComponent(r.pathname)}`; }
function assessmentUrl(r, assessment) { return `${assessment.pathname}?resource_id=${encodeURIComponent(r.id)}&source_path=${encodeURIComponent(r.pathname)}`; }
function sitemap(resources, outputs) { const routes = new Set([...resources.map((r)=>r.pathname), ...[...outputs.keys()].filter((p)=>!p.endsWith('.json')&&!p.endsWith('.txt')&&!p.endsWith('.xml'))]); return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${[...routes].sort().map((r)=>`  <url><loc>${BASE_URL}${r}</loc></url>`).join('\n')}\n</urlset>\n`; }
function rss(resources) { const items = resources.filter((r)=>r.maturity!=='Archived').sort((a,b)=>(b.updated||'').localeCompare(a.updated||'')).slice(0,50); return `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>Aloha AI resources</title><link>${BASE_URL}</link><description>Structured services, products, tools, research, builds, and learning resources.</description>${items.map((r)=>`<item><guid>${escXml(r.id)}</guid><title>${escXml(r.title)}</title><link>${BASE_URL}${r.pathname}</link><description>${escXml(r.summary)}</description></item>`).join('')}</channel></rss>`; }
function buildGraph(resources) { return { nodes:resources.map((r)=>({id:r.id,kind:r.kind,pathname:r.pathname,title:r.title,maturity:r.maturity})), edges:resources.flatMap((r)=>relationships(r).map((rel)=>({source:r.id,...rel}))) }; }
function relationships(r) { return Array.isArray(r.relationships) ? r.relationships : []; }
function collectionFor(kind) { return ({service:'services',product:'products',tool:'tools',assessment:'tools',monitor:'monitors',research:'research',build:'builds',learningHub:'university',course:'university',lesson:'university'})[kind] || 'resources'; }
function taxonomy(resources, field, fallback) { const map = new Map(); for (const r of resources) { const vals = r[field] || (fallback ? fallback(r) : []); for (const value of vals || []) { const key=slug(value); if(!key) continue; if(!map.has(key)) map.set(key,[]); map.get(key).push(r); } } return map; }
function normalizeAudience(value) { if (!value) return []; if (Array.isArray(value)) return value; return value.split(/,|;|\band\b/i).map((v)=>v.trim()).filter((v)=>v.length>2); }
function audienceTerms(r) { return r.audiences || normalizeAudience(r.audience); }
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
