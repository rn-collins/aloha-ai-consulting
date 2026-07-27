import assert from 'node:assert/strict';
import test from 'node:test';
import { derivePlatform, generatedOutputs, legacyMigrationInventory, validateCollectionPages, validatePlatform, validateRoutingConfig } from '../lib/site/publishing-engine.js';
import { renderStructuredPage } from '../lib/site/structured-renderer.js';
import { buildMetadata, decodeHtmlText, metadataDescription, metadataTitle } from '../lib/site/metadata.js';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

function resource(id, relationships) {
  return {
    id,
    kind: 'research',
    pathname: `/${id}`,
    title: id,
    summary: `${id} summary`,
    maturity: 'Research',
    evidence: ['Evidence'],
    methodology: ['Method'],
    assumptions: ['Assumption'],
    limitations: ['Limitation'],
    relationships
  };
}

function errorsFor(resources) {
  return validatePlatform(resources, derivePlatform(resources)).errors;
}

test('accepts a connected graph with typed relationships', () => {
  assert.deepEqual(errorsFor([
    resource('alpha', [{ type: 'supports', target: 'beta' }]),
    resource('beta', [{ type: 'depends_on', target: 'alpha' }])
  ]), []);
});

test('rejects legacy relatedIds', () => {
  const alpha = resource('alpha', [{ type: 'supports', target: 'beta' }]);
  alpha.relatedIds = ['beta'];
  assert.ok(errorsFor([alpha, resource('beta', [{ type: 'supports', target: 'alpha' }])])
    .includes('alpha: relatedIds is deprecated; use typed relationships'));
});

test('rejects malformed, duplicate, unresolved, and self relationships', () => {
  const errors = errorsFor([
    resource('alpha', [
      { type: 'supports', target: 'beta' },
      { type: 'supports', target: 'beta' },
      { type: 'unknown', target: 'missing' },
      { type: 'uses', target: 'alpha' },
      null
    ]),
    resource('beta', [{ type: 'supports', target: 'alpha' }])
  ]);
  assert.ok(errors.includes('alpha: duplicate relationship supports:beta'));
  assert.ok(errors.includes('alpha: unsupported relationship unknown'));
  assert.ok(errors.includes('alpha: unresolved relationship target missing'));
  assert.ok(errors.includes('alpha: self relationship'));
  assert.ok(errors.includes('alpha: relationship entries must be objects'));
});

test('rejects dependency cycles and isolated resources', () => {
  const errors = errorsFor([
    resource('alpha', [{ type: 'depends_on', target: 'beta' }]),
    resource('beta', [{ type: 'depends_on', target: 'alpha' }]),
    resource('island', [])
  ]);
  assert.ok(errors.some((error) => error.startsWith('dependency cycle:')));
  assert.ok(errors.includes('island: unreachable orphan resource'));
});

test('does not overwrite canonical resources with generated collection routes', () => {
  const resources = [
    { ...resource('services', [{ type: 'supports', target: 'strategy' }]), kind: 'service', pathname: '/services' },
    { ...resource('strategy', [{ type: 'extends', target: 'services' }]), kind: 'service', pathname: '/strategy' }
  ];
  const platform = derivePlatform(resources);
  assert.equal(generatedOutputs(resources, platform).has('/services'), false);
});

test('accepts terminal slug reuse across distinct canonical namespaces', () => {
  const resources = [
    { ...resource('tool-about', [{ type: 'supports', target: 'university-about' }]), pathname: '/about' },
    { ...resource('university-about', [{ type: 'supports', target: 'tool-about' }]), pathname: '/university/about' }
  ];
  assert.deepEqual(validatePlatform(resources, derivePlatform(resources)).warnings, []);
});

test('renders and indexes structured editorial copy', () => {
  const alpha = {
    ...resource('alpha', [{ type: 'supports', target: 'beta' }]),
    seoTitle: 'Concise search title',
    editorialIntro: ['A retained opening argument.'],
    editorialSections: [{
      title: 'Why this matters',
      blocks: [
        { type: 'paragraph', text: 'A substantive retained paragraph.' },
        { type: 'heading', text: 'A closer look' },
        { type: 'list', items: ['First retained point', 'Second retained point'] },
        { type: 'quote', text: 'A retained quotation.' },
        { type: 'code', text: 'VERIFY(source)' },
        { type: 'table', rows: [{ cells: [{ text: 'Signal', header: true }, { text: 'Owner', header: true }] }, { cells: [{ text: 'Citation' }, { text: 'Human reviewer' }] }] }
      ]
    }]
  };
  const beta = resource('beta', [{ type: 'supports', target: 'alpha' }]);
  const resources = [alpha, beta];
  assert.deepEqual(errorsFor(resources), []);
  const platform = derivePlatform(resources);
  const html = renderStructuredPage({ resource: alpha, registry: platform.registry });
  assert.match(html, /<title>Concise search title \| Aloha AI<\/title>/);
  assert.match(html, /A substantive retained paragraph/);
  assert.match(html, /<pre><code>VERIFY\(source\)<\/code><\/pre>/);
  assert.match(html, /<th>Signal<\/th>/);
  const search = JSON.parse(generatedOutputs(resources, platform).get('/search-index.json'));
  assert.match(search.find((item) => item.id === 'alpha').text, /human reviewer/);
});

test('publishes an accessible plain-language search journey', () => {
  const resources = [
    resource('alpha', [{ type: 'supports', target: 'beta' }]),
    resource('beta', [{ type: 'supports', target: 'alpha' }])
  ];
  const outputs = generatedOutputs(resources, derivePlatform(resources));
  const search = outputs.get('/search');
  assert.match(search, /<form class="search-form" role="search"/);
  assert.match(search, /What do you need help with\?/);
  assert.ok(search.includes("fetch('/search-index.json')"));
  assert.match(search, /Start a conversation/);
  assert.ok(outputs.has('/search-index.json'));
  assert.match(outputs.get('/sitemap.xml'), /<loc>https:\/\/aloha-ai-consulting\.vercel\.app\/search<\/loc>/);
});

test('bounds search metadata without changing visible editorial titles or summaries', () => {
  const longTitle = 'A deliberately long editorial heading that should remain visible while search metadata receives a separate bounded representation';
  const shortDescription = 'Browse Aloha AI by topic.';
  assert.ok(metadataTitle(longTitle, ' | Aloha AI').length <= 70);
  assert.ok(metadataDescription(shortDescription).length >= 70);
  assert.ok(metadataDescription('x '.repeat(120)).length <= 180);
  const metadata = buildMetadata({ title: longTitle, description: shortDescription, pathname: '/example' });
  assert.ok(metadata.title.length <= 70);
  assert.ok(metadata.description.length >= 70 && metadata.description.length <= 180);
  assert.equal(metadata.openGraph.title, metadata.title);
  assert.equal(metadata.twitter.description, metadata.description);
  assert.equal(decodeHtmlText('Luxury Brand Protection &amp; Anti-Counterfeiting'), 'Luxury Brand Protection & Anti-Counterfeiting');
  assert.equal(decodeHtmlText('RN&#039;s evidence'), "RN's evidence");
});

test('private AI risk copy does not claim an unrelated live Federal Register feed', () => {
  const monitorFile = JSON.parse(fs.readFileSync(new URL('../content/monitors/intelligence-monitors.json', import.meta.url), 'utf8'));
  const privateRisk = monitorFile.find((item) => item.id === 'private-ai-risk');
  const editorial = JSON.stringify(privateRisk.editorialSections);
  assert.doesNotMatch(editorial, /queries the Federal Register API|Live · Federal Register/);
  assert.match(editorial, /retention|sub-processors|BAA/i);
});

test('rejects malformed structured editorial copy', () => {
  const alpha = {
    ...resource('alpha', [{ type: 'supports', target: 'beta' }]),
    editorialIntro: [''],
    editorialSections: [{ title: '', blocks: [{ type: 'list', items: [] }, { type: 'unknown', text: 'x' }] }]
  };
  const errors = errorsFor([alpha, resource('beta', [{ type: 'supports', target: 'alpha' }])]);
  assert.ok(errors.includes('alpha: editorialIntro must contain non-empty strings'));
  assert.ok(errors.includes('alpha: editorial section 1 requires a title'));
  assert.ok(errors.includes('alpha: editorial section 1 block 1 list requires non-empty items'));
  assert.ok(errors.includes('alpha: editorial section 1 block 2 has an unsupported type'));
});

test('derives controlled audience groups without fragmenting prose', () => {
  const legal = {
    ...resource('legal-team-tool', [{ type: 'supports', target: 'learning-resource' }]),
    audience: 'Attorneys, counsel, and legal teams who need reviewable evidence.'
  };
  const learning = {
    ...resource('learning-resource', [{ type: 'supports', target: 'legal-team-tool' }]),
    kind: 'lesson',
    audience: 'People beginning a practical learning path.'
  };
  const platform = derivePlatform([legal, learning]);
  assert.deepEqual([...platform.audiences.keys()].sort(), ['educators-and-learners', 'legal-professionals', 'operators-and-teams']);
  assert.equal(platform.audiences.has('counsel'), false);
  assert.equal(platform.audiences.has('and-legal-teams-who-need-reviewable-evidence'), false);
});

test('rejects redirects and rewrites that shadow canonical resource paths', () => {
  const resources = [
    { ...resource('services', [{ type: 'supports', target: 'university-services' }]), pathname: '/services' },
    { ...resource('university-services', [{ type: 'supports', target: 'services' }]), pathname: '/university/services' }
  ];
  const errors = validateRoutingConfig(resources, {
    redirects: [
      { source: '/services.html', destination: '/services' },
      { source: '/university/services', destination: '/services' }
    ],
    rewrites: [{ source: '/services', destination: '/services-v2' }]
  });
  assert.deepEqual(errors, [
    'routing: redirect source /university/services shadows a canonical resource',
    'routing: rewrite source /services shadows a canonical resource'
  ]);
});


test('derives Workspace eligibility, assessment URLs, and recommendation mappings', () => {
  const workspace = { ...resource('workspace', [{ type: 'supports', target: 'scorecard' }]), kind: 'product', workspace: { acceptsResourceKinds: ['research', 'assessment', 'product'] } };
  const scorecard = {
    ...resource('scorecard', [{ type: 'supports', target: 'alpha' }]),
    kind: 'assessment',
    assessment: {
      dimensions: ['evidence'],
      appliesToKinds: ['research'],
      recommendations: [{ id: 'inspect-evidence', condition: 'evidence_gap', resourceIds: ['alpha'] }]
    }
  };
  const alpha = resource('alpha', [{ type: 'available_in_workspace', target: 'workspace' }]);
  const resources = [workspace, scorecard, alpha];
  const platform = derivePlatform(resources);
  assert.deepEqual(validatePlatform(resources, platform).errors, []);
  const registry = JSON.parse(generatedOutputs(resources, platform).get('/workspace/resource-registry.json'));
  const mapping = registry.resources.find((entry) => entry.resourceId === 'alpha');
  assert.equal(mapping.workspace.available, true);
  assert.match(mapping.workspace.url, /^\/workspace\?resource_id=alpha/);
  assert.equal(mapping.assessments[0].assessmentId, 'scorecard');
  assert.deepEqual(mapping.assessments[0].recommendations[0].resourceIds, ['alpha']);
});

test('rejects invalid Workspace and recommendation mappings', () => {
  const workspace = { ...resource('workspace', [{ type: 'supports', target: 'scorecard' }]), kind: 'product', workspace: { acceptsResourceKinds: ['unknown'] } };
  const scorecard = {
    ...resource('scorecard', [{ type: 'supports', target: 'alpha' }]),
    kind: 'assessment',
    assessment: {
      dimensions: [],
      appliesToKinds: ['unknown'],
      recommendations: [{ id: 'broken', condition: '', resourceIds: ['missing'] }]
    }
  };
  const alpha = resource('alpha', [{ type: 'available_in_workspace', target: 'workspace' }]);
  const errors = errorsFor([workspace, scorecard, alpha]);
  assert.ok(errors.includes('workspace: unsupported workspace resource kind unknown'));
  assert.ok(errors.includes('scorecard: assessment.dimensions must be a non-empty array'));
  assert.ok(errors.includes('scorecard: unsupported assessment resource kind unknown'));
  assert.ok(errors.includes('scorecard: recommendation broken must define condition'));
  assert.ok(errors.includes('scorecard: recommendation broken has unresolved resource missing'));
});

test('inventories handwritten routes and alternate-file shadows without classifying compiler outputs as legacy', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'aloha-migration-'));
  fs.mkdirSync(path.join(root, 'university', 'learn', 'alpha'), { recursive: true });
  fs.writeFileSync(path.join(root, 'university', 'learn', 'lesson.html'), '<html></html>');
  fs.writeFileSync(path.join(root, 'university', 'learn', 'alpha', 'index.html'), '<html></html>');
  fs.writeFileSync(path.join(root, 'about.html'), '<html></html>');
  const alpha = { ...resource('alpha', []), pathname: '/university/learn/alpha' };
  const outputs = new Map([['/topics', '<html></html>']]);
  fs.writeFileSync(path.join(root, 'topics.html'), '<html></html>');
  const inventory = legacyMigrationInventory(root, [alpha], outputs);
  assert.equal(inventory.count, 3);
  assert.deepEqual(inventory.byFamily, { governance: 1, university: 2 });
  assert.deepEqual(inventory.routes.map((route) => route.pathname), ['/about', '/university/learn/alpha', '/university/learn/lesson']);
  assert.equal(inventory.routes.find((route) => route.pathname === '/university/learn/alpha').status, 'shadowing');
  fs.rmSync(root, { recursive: true, force: true });
});

test('renders collection membership from canonical registry metadata', () => {
  const lesson = { ...resource('lesson-one', [{ type: 'depends_on', target: 'lesson-index' }]), kind: 'lesson', pathname: '/university/learn/lesson-one' };
  const collection = {
    ...resource('lesson-index', [{ type: 'teaches', target: 'lesson-one' }]),
    kind: 'collection',
    pathname: '/university/learn',
    collection: { kinds: ['lesson'], pathPrefix: '/university/learn/', heading: 'Choose a lesson' }
  };
  const registry = new Map([[lesson.id, lesson], [collection.id, collection]]);
  const html = renderStructuredPage({ resource: collection, registry });
  assert.match(html, /Choose a lesson/);
  assert.match(html, /href="\/university\/learn\/lesson-one"/);
});

test('renders and indexes editorial metadata for a derived collection', () => {
  const tool = { ...resource('alpha-tool', []), kind: 'tool', pathname: '/tools/alpha' };
  const platform = derivePlatform([tool]);
  const metadata = {
    '/tools': {
      id: 'tools-collection',
      pathname: '/tools',
      title: 'Free tools',
      summary: 'A source-grounded collection.',
      editorialIntro: ['Retained collection introduction.'],
      editorialSections: [{ title: 'How to choose', blocks: [{ type: 'paragraph', text: 'Choose by risk.' }] }]
    }
  };
  assert.deepEqual(validateCollectionPages(metadata, [tool], platform), []);
  const outputs = generatedOutputs([tool], platform, metadata);
  assert.match(outputs.get('/tools'), /Retained collection introduction/);
  assert.match(outputs.get('/tools'), /Choose by risk/);
  assert.match(outputs.get('/search-index.json'), /retained collection introduction/);
  assert.match(outputs.get('/api/collections.json'), /tools-collection/);
});

test('renders generated collection front doors as plain-language editorial indexes', () => {
  const alpha = { ...resource('alpha', [{ type: 'supports', target: 'beta' }]), kind: 'monitor', maturity: 'Beta' };
  const beta = { ...resource('beta', [{ type: 'supports', target: 'alpha' }]), kind: 'monitor', maturity: 'Research' };
  const html = generatedOutputs([alpha, beta], derivePlatform([alpha, beta])).get('/monitors');
  assert.match(html, /class="is-editorial-collection is-collection-monitors"/);
  assert.match(html, /Watch what changes\. Understand why it matters\./);
  assert.match(html, /Every entry tells you what it is and how far along it is/);
  assert.match(html, /Public beta/);
  assert.match(html, /Open the monitor/);
  assert.doesNotMatch(html, />Discovery</);
});

test('renders taxonomy directories as navigable indexes with a search escape hatch', () => {
  const legal = { ...resource('legal', [{ type: 'supports', target: 'health' }]), industries: ['legal'] };
  const health = { ...resource('health', [{ type: 'supports', target: 'legal' }]), industries: ['health'] };
  const html = generatedOutputs([legal, health], derivePlatform([legal, health])).get('/industries');
  assert.match(html, /class="is-directory"/);
  assert.match(html, /Another way into Aloha AI/);
  assert.match(html, /describe your question instead/);
  assert.match(html, /2 paths/);
});

test('tools collection is a question-led shelf with visible privacy and status boundaries', () => {
  const tools = [
    { ...resource('citation-verifier', []), kind: 'tool', pathname: '/tools/citation-verifier', maturity: 'Beta' },
    { ...resource('workflow-audit', []), kind: 'assessment', pathname: '/tools/workflow-audit', maturity: 'Beta' }
  ];
  const platform = derivePlatform(tools);
  const metadata = {
    '/tools': {
      id: 'tools-collection',
      pathname: '/tools',
      title: 'Pick a question',
      summary: 'Leave with a next move.',
      eyebrow: 'Tools',
      editorialIntro: ['Useful demonstration.'],
      editorialSections: [{ eyebrow: 'Boundary', title: 'Read this', blocks: [{ type: 'paragraph', text: 'Not a deployment.' }] }],
      toolsExperience: {
        intro: 'Start with the question.',
        privacy: 'Nothing leaves the browser.',
        items: [
          { resourceId: 'citation-verifier', family: 'check', familyLabel: 'Check a claim', title: 'Does it support the claim?', plain: 'Compare claim and source.', action: 'Check it' },
          { resourceId: 'workflow-audit', family: 'workflow', familyLabel: 'Fix a workflow', title: 'Is it dependable?', plain: 'Check the workflow.', action: 'Audit it' }
        ]
      }
    }
  };
  const html = generatedOutputs(tools, platform, metadata).get('/tools');
  assert.match(html, /class="is-tools"/);
  assert.match(html, /id="tool-shelf"/);
  assert.match(html, /data-tool-filter="check"/);
  assert.match(html, /data-tool-family="workflow"/);
  assert.match(html, /Nothing leaves the browser/);
  assert.equal((html.match(/Public beta/g) || []).length, 2);
  assert.doesNotMatch(html, /Canonical ID/);
});

test('rejects derived collection metadata for a canonical resource route', () => {
  const collection = { ...resource('tools-collection', []), kind: 'collection', pathname: '/tools', collection: { kinds: ['tool'] } };
  const platform = derivePlatform([collection]);
  const metadata = { '/tools': { id: 'duplicate', pathname: '/tools', title: 'Tools', summary: 'Duplicate route.' } };
  assert.ok(validateCollectionPages(metadata, [collection], platform).includes('collection pages: /tools is not a derived collection route'));
});

test('renders a service collection without dropping service deliverables', () => {
  const alpha = { ...resource('alpha', [{ type: 'supports', target: 'services' }]), kind: 'service' };
  const services = {
    ...resource('services', [{ type: 'supports', target: 'alpha' }]),
    kind: 'service',
    deliverables: ['Decision map'],
    timeline: 'Two weeks',
    fit: ['A bounded problem'],
    collection: { kinds: ['service'], heading: 'Choose a service' }
  };
  const registry = new Map([[alpha.id, alpha], [services.id, services]]);
  const html = renderStructuredPage({ resource: services, registry });
  assert.match(html, /Choose a service/);
  assert.match(html, /Decision map/);
});

test('renders explicitly selected portfolio resources and rejects unresolved selections', () => {
  const alpha = { ...resource('alpha', [{ type: 'supports', target: 'portfolio' }]), kind: 'tool' };
  const beta = { ...resource('beta', [{ type: 'supports', target: 'portfolio' }]), kind: 'research' };
  const portfolio = {
    ...resource('portfolio', [{ type: 'documents', target: 'alpha' }, { type: 'documents', target: 'beta' }]),
    kind: 'build',
    pathname: '/builds',
    implementationStatus: 'Public',
    collection: { resourceIds: ['beta'], heading: 'Representative systems' }
  };
  const registry = new Map([[alpha.id, alpha], [beta.id, beta], [portfolio.id, portfolio]]);
  const html = renderStructuredPage({ resource: portfolio, registry });
  const portfolioSection = html.match(/Representative systems[\s\S]*?<\/section>/)[0];
  assert.match(portfolioSection, /href="\/beta"/);
  assert.doesNotMatch(portfolioSection, /href="\/alpha"/);
  portfolio.collection.resourceIds.push('missing');
  assert.ok(errorsFor([alpha, beta, portfolio]).includes('portfolio: unresolved collection resource missing'));
});

test('renders builds as a plain-language filterable proof wall before deeper records', () => {
  const builds = JSON.parse(fs.readFileSync(new URL('../content/site/home-and-builds.json', import.meta.url))).find((item) => item.id === 'builds');
  const selected = builds.buildsExperience.items.map((entry) => ({
    ...resource(entry.resourceId, []),
    id: entry.resourceId,
    pathname: `/${entry.resourceId}`,
    maturity: entry.resourceId === 'aloha-ai-ce' ? 'Research' : 'Beta'
  }));
  const registry = new Map([[builds.id, builds], ...selected.map((item) => [item.id, item])]);
  const html = renderStructuredPage({ resource: builds, registry });

  assert.match(html, /class="builds-cover"/);
  assert.match(html, /id="build-wall"/);
  assert.match(html, /data-build-filter="track"/);
  assert.match(html, /data-build-family="learn"/);
  assert.match(html, /Built does not always mean finished\./);
  assert.match(html, /Citation Verifier/);
  assert.match(html, /Try the verifier/);
  assert.doesNotMatch(html, /before it reaches the court/);
  assert.doesNotMatch(html, /Canonical ID: <code>builds/);
  assert.equal((html.match(/data-priority-collection=/g) || []).length, 0);
  assert.ok(html.indexOf('id="build-wall"') < html.indexOf('Behind the wall'));
});

test('renders University as a goal-led free learning journey before institutional detail', () => {
  const university = JSON.parse(fs.readFileSync(new URL('../content/site/cornerstones.json', import.meta.url))).find((item) => item.id === 'university');
  const html = renderStructuredPage({ resource: university, registry: new Map([[university.id, university]]) });

  assert.match(html, /class="is-university"/);
  assert.match(html, /class="university-cover"/);
  assert.match(html, /id="choose-a-path"/);
  assert.match(html, /Start with a goal\.<br>Not a syllabus\./);
  assert.match(html, /Your first 30 minutes\./);
  assert.match(html, /\$0 · no signup · no email gate/);
  assert.match(html, /href="\/university\/learn\/how-to-verify-ai-outputs"/);
  assert.match(html, /href="\/university\/playbooks"/);
  assert.match(html, /href="\/university\/templates"/);
  assert.match(html, /Browse your way\./);
  assert.doesNotMatch(html, /Canonical ID: <code>university/);
  assert.ok(html.indexOf('id="choose-a-path"') < html.indexOf('How the school works'));
});

test('renders selected engagements before generic service mechanics with explicit relationship status', () => {
  const engagements = JSON.parse(fs.readFileSync(new URL('../content/services/engagements.json', import.meta.url)));
  const html = renderStructuredPage({ resource: engagements, registry: new Map([[engagements.id, engagements]]) });
  const commissioned = html.indexOf('data-engagement-status="commissioned"');
  const independent = html.indexOf('data-engagement-status="independent"');
  const identity = html.indexOf('Canonical ID:');

  assert.ok(commissioned > 0);
  assert.ok(independent > commissioned);
  assert.ok(identity > independent);
  assert.match(html, /Legal-AI workflow development on the Harvey platform/);
  assert.match(html, /RN’s role:/);
  assert.match(html, /Commissioned · active/);
  assert.match(html, /Independent pre-engagement work · no client engagement claimed/);
  assert.match(html, /Evidence standard:/);
  assert.equal((html.match(/Legal-AI workflow development on the Harvey platform/g) || []).length, 1);
});

test('renders canonical homepage actions and linked institutional cards', () => {
  const home = {
    ...resource('home', [{ type: 'supports', target: 'alpha' }]),
    kind: 'institutional',
    pathname: '/',
    actions: [{ label: 'Explore services', href: '/alpha' }],
    institutionalSections: [{ title: 'Start here', items: [{ title: 'Services', text: 'Choose a path.', href: '/alpha' }] }]
  };
  const alpha = resource('alpha', [{ type: 'supports', target: 'home' }]);
  const registry = new Map([[home.id, home], [alpha.id, alpha]]);
  const html = renderStructuredPage({ resource: home, registry });
  assert.match(html, /Explore services/);
  assert.match(html, /class="card card--hover" href="\/alpha"/);
  assert.match(html, /_vercel\/insights\/script\.js/);
  assert.match(html, /href="\/university\/contact">Start a conversation/);
  assert.doesNotMatch(html, /href="\/#start">Start a conversation/);
});

test('prioritizes homepage visitor pathways before editorial depth and hides registry identity', () => {
  const home = {
    ...resource('home', [{ type: 'supports', target: 'alpha' }]),
    kind: 'institutional',
    pathname: '/',
    editorialSections: [{ title: 'How the system works', blocks: [{ type: 'paragraph', text: 'Technical depth.' }] }],
    institutionalSections: [
      { title: 'Background', items: [{ title: 'Formation', text: 'Practice context.' }] },
      { priority: true, title: 'Start with your problem', items: [{ title: 'Choose a service', text: 'Find the right path.', href: '/alpha' }] }
    ]
  };
  const alpha = resource('alpha', [{ type: 'supports', target: 'home' }]);
  const registry = new Map([[home.id, home], [alpha.id, alpha]]);
  const html = renderStructuredPage({ resource: home, registry });
  assert.ok(html.indexOf('Start with your problem') < html.indexOf('How the system works'));
  assert.ok(html.indexOf('How the system works') < html.indexOf('Background'));
  assert.doesNotMatch(html, /Canonical ID: <code>home<\/code>/);
  assert.doesNotMatch(html, /<p class="eyebrow">Resource type<\/p>/);
});

test('places linked proof directly after homepage problem pathways', () => {
  const home = {
    ...resource('home', [{ type: 'supports', target: 'alpha' }]),
    kind: 'institutional',
    pathname: '/',
    editorialSections: [{ title: 'Practice narrative', blocks: [{ type: 'paragraph', text: 'Long-form context.' }] }],
    institutionalSections: [
      { priority: true, title: 'Start with your problem', items: [{ title: 'Choose a service', text: 'Find the right path.', href: '/alpha' }] },
      { priority: true, title: 'See the work', items: [{ title: 'Working systems', text: 'Inspect the evidence.', href: '/builds' }] }
    ]
  };
  const alpha = resource('alpha', [{ type: 'supports', target: 'home' }]);
  const builds = resource('builds', [{ type: 'supports', target: 'home' }]);
  builds.pathname = '/builds';
  const registry = new Map([[home.id, home], [alpha.id, alpha], [builds.id, builds]]);
  const html = renderStructuredPage({ resource: home, registry });
  assert.ok(html.indexOf('Start with your problem') < html.indexOf('See the work'));
  assert.ok(html.indexOf('See the work') < html.indexOf('Practice narrative'));
  assert.match(html, /href="\/builds"[\s\S]*Working systems/);
});

test('composes homepage priority sections as the Direction 2 visitor journey', () => {
  const home = {
    ...resource('home', [{ type: 'supports', target: 'alpha' }]),
    kind: 'institutional',
    pathname: '/',
    summary: 'Clear AI systems people can check and use.',
    institutionalSections: [
      { priority: true, title: 'What is making work harder?', items: [{ title: 'We need a plan', text: 'Choose what to build.', href: '/alpha' }] },
      { priority: true, title: 'Do not take our word for it', items: [{ title: 'Inspect the work', text: 'Open the evidence.', href: '/builds' }] }
    ]
  };
  const alpha = resource('alpha', [{ type: 'supports', target: 'home' }]);
  const builds = resource('builds', [{ type: 'supports', target: 'home' }]);
  builds.pathname = '/builds';
  const html = renderStructuredPage({ resource: home, registry: new Map([[home.id, home], [alpha.id, alpha], [builds.id, builds]]) });

  assert.match(html, /class="home-cover"/);
  assert.match(html, /institutional-section home-gateway/);
  assert.match(html, /institutional-section home-proof/);
  assert.ok(html.indexOf('home-gateway') < html.indexOf('home-proof'));
  assert.match(html, /Clear AI systems people can check and use/);
});

test('renders methods as inspectable proof before internal or promotional detail', () => {
  const methods = {
    ...resource('methods', [{ type: 'supports', target: 'alpha' }]),
    kind: 'research',
    pathname: '/methods',
    title: 'The visible interface is the end of the method, not the beginning.',
    actions: [{ label: 'Claims and limits', href: '#claims' }],
    editorialSections: [
      {
        title: 'A useful system must answer eight questions.',
        blocks: [{ type: 'paragraph', text: 'Who remains accountable?' }]
      },
      {
        id: 'claims',
        title: 'Confidence must not outrun the evidence.',
        blocks: [{ type: 'paragraph', text: 'Activation rule: consequential automation remains inactive until approval.' }]
      }
    ],
    methodology: ['Frame the decision', 'Maintain or retire'],
    limitations: ['AI does not replace accountable human judgment.']
  };
  const alpha = resource('alpha', [{ type: 'supports', target: 'methods' }]);
  const registry = new Map([[methods.id, methods], [alpha.id, alpha]]);
  const html = renderStructuredPage({ resource: methods, registry });

  assert.doesNotMatch(html, /Canonical ID: <code>methods<\/code>/);
  assert.match(html, /id="claims"/);
  assert.ok(html.indexOf('A useful system must answer eight questions.') < html.indexOf('Related Research'));
  assert.ok(html.indexOf('Confidence must not outrun the evidence.') < html.indexOf('Related Research'));
  assert.match(html, /Maintain or retire/);
  assert.match(html, /AI does not replace accountable human judgment/);
});

test('renders priority proof collections before registry detail in explicit order', () => {
  const proof = {
    ...resource('proof', []),
    kind: 'build',
    pathname: '/proof',
    collection: {
      priority: true,
      heading: 'Proof set',
      resourceIds: ['beta-item', 'production-item']
    }
  };
  const production = {
    ...resource('production-item', []),
    kind: 'tool',
    title: 'A production item',
    maturity: 'Production'
  };
  const beta = {
    ...resource('beta-item', []),
    kind: 'tool',
    title: 'Z beta item',
    maturity: 'Beta'
  };
  const registry = new Map([
    [proof.id, proof],
    [production.id, production],
    [beta.id, beta]
  ]);

  const html = renderStructuredPage({ resource: proof, registry });

  assert.ok(html.indexOf('data-priority-collection="true"') < html.indexOf('Canonical ID:'));
  assert.ok(html.indexOf('Z beta item') < html.indexOf('A production item'));
  assert.match(html, /Tool · Public beta/);
  assert.match(html, /Tool · Production/);
  assert.equal(html.match(/data-priority-collection="true"/g)?.length, 1);
});

test('routes commercial conversion to a real contact endpoint and renders direct contact actions', () => {
  const service = {
    ...resource('service', [{ type: 'supports', target: 'contact' }]),
    kind: 'service'
  };
  const contact = {
    ...resource('contact', [{ type: 'supports', target: 'service' }]),
    kind: 'learningHub',
    pathname: '/university/contact',
    actions: [
      { label: 'Book a call', href: 'https://example.com/book' },
      { label: 'Email RN', href: 'mailto:rn@example.com' }
    ]
  };
  const registry = new Map([[service.id, service], [contact.id, contact]]);
  const serviceHtml = renderStructuredPage({ resource: service, registry });
  const contactHtml = renderStructuredPage({ resource: contact, registry });
  assert.match(serviceHtml, /href="\/university\/contact">Start a conversation/);
  assert.doesNotMatch(serviceHtml, /href="\/#start">Start a conversation/);
  assert.match(contactHtml, /href="https:\/\/example\.com\/book"><span>Book a call/);
  assert.match(contactHtml, /href="mailto:rn@example\.com"><span>Email RN/);
});

test('renders contact as a clear three-path human conversion journey', () => {
  const contact = {
    ...resource('contact'),
    pathname: '/university/contact',
    actions: [
      { label: 'Book a call', href: 'https://example.com/book' },
      { label: 'Email RN', href: 'mailto:rn@example.com' }
    ],
    contactExperience: {
      intro: 'Start with the situation.',
      paths: [
        { label: 'Talk it through', title: 'Book a conversation', plain: 'Speak with RN.', action: 'Choose a time', href: 'https://example.com/book', note: 'Opens booking' },
        { label: 'Write first', title: 'Send RN an email', plain: 'Write to RN.', action: 'Open an email', href: 'mailto:rn@example.com', note: 'A human replies' },
        { label: 'Not ready yet', title: 'Keep exploring for free', plain: 'Learn first.', action: 'Visit the University', href: '/university', note: '$0' }
      ],
      prompts: [
        { title: 'What are you trying to do?', plain: 'Name the goal.' },
        { title: 'Where does it get stuck?', plain: 'Name the problem.' },
        { title: 'What have you tried?', plain: 'Name prior work.' }
      ],
      nextSteps: [
        { title: 'RN reads the context', plain: 'A person reads it.' },
        { title: 'You test the fit', plain: 'Decide together.' },
        { title: 'The next step becomes clear', plain: 'Choose what follows.' }
      ]
    }
  };
  const html = renderStructuredPage({ resource: contact, registry: new Map([[contact.id, contact]]) });
  assert.match(html, /class="page-hero section--ink page-hero--contact"/);
  assert.match(html, /Talk\. Write\.<br>Or look around first\./);
  assert.equal((html.match(/class="contact-path /g) || []).length, 3);
  assert.equal((html.match(/class="contact-prompt"/g) || []).length, 3);
  assert.equal((html.match(/class="contact-next__step"/g) || []).length, 3);
  assert.match(html, /No mystery\.<br>No sales maze\./);
  assert.match(html, /Contact details are used to reply to you/);
  assert.doesNotMatch(html, /How the work moves from inputs to accountable output/);
  assert.doesNotMatch(html, /Choose the easiest way to reach RN/);
});

test('routes the global navigation conversion action to the canonical contact endpoint', () => {
  const shell = fs.readFileSync(new URL('../site-shell.js', import.meta.url), 'utf8');
  assert.match(shell, /link\('\/university\/contact','Let’s build'/);
  assert.doesNotMatch(shell, /link\('\/#start','Work with us'/);
});

test('renders services as a guided decision experience before registry and editorial depth', () => {
  const services = {
    ...resource('services'),
    pathname: '/services',
    actions: [{ label: 'Show me where to start', href: '#choose-problem' }],
    servicesExperience: {
      intro: 'Start with the sentence that sounds like your situation.',
      problems: [{
        signal: 'Evidence',
        title: 'Our research is scattered.',
        outcome: 'Build a maintained intelligence system.',
        href: '/intelligence',
        linkLabel: 'Explore intelligence'
      }],
      engagements: [{
        step: '01',
        title: 'Systems Audit',
        fit: 'The intervention is not yet clear.',
        detail: 'Map the current system.',
        investment: '$1,500–$2,500'
      }]
    },
    editorialSections: [{
      title: 'In-depth service detail',
      blocks: [{ type: 'paragraph', text: 'Long-form service explanation.' }]
    }],
    collection: { kinds: ['service'], heading: 'Explore every service' }
  };
  const intelligence = { ...resource('intelligence'), pathname: '/intelligence', kind: 'service' };
  const html = renderStructuredPage({ resource: services, registry: new Map([[services.id, services], [intelligence.id, intelligence]]) });
  assert.match(html, /id="choose-problem"/);
  assert.match(html, /class="service-hero-map"/);
  assert.match(html, /Find the/);
  assert.match(html, /People<br><b>\+<\/b> AI/);
  assert.match(html, /What keeps getting stuck\?/);
  assert.match(html, /Does this sound familiar\?/);
  assert.match(html, /What changes/);
  assert.match(html, /Our research is scattered\./);
  assert.match(html, /id="engagement-paths"/);
  assert.match(html, /Systems Audit/);
  assert.match(html, /Want to see exactly how the work is designed\?/);
  assert.match(html, /<details class="service-depth__item">/);
  assert.equal(html.match(/In-depth service detail/g)?.length, 1);
  assert.doesNotMatch(html, /Canonical ID: <code>services/);
  assert.ok(html.indexOf('What keeps getting stuck?') < html.indexOf('In-depth service detail'));
  assert.match(html, /href="\/university\/contact"/);
});

test('renders a browser-only structured assessment from question metadata', () => {
  const assessment = {
    ...resource('roadmap', [{ type: 'supports', target: 'alpha' }]),
    kind: 'assessment',
    implementationStatus: 'Public',
    assessment: {
      dimensions: ['operations'],
      appliesToKinds: ['research'],
      questions: [{ id: 'goal', prompt: 'What is the goal?', options: [{ value: 'save', label: 'Save time', dimension: 'operations' }] }],
      recommendations: [{ id: 'start', condition: 'operations_gap', resourceIds: ['alpha'] }]
    }
  };
  const alpha = resource('alpha', [{ type: 'supports', target: 'roadmap' }]);
  const registry = new Map([[assessment.id, assessment], [alpha.id, alpha]]);
  const html = renderStructuredPage({ resource: assessment, registry });
  assert.match(html, /id="structured-assessment"/);
  assert.match(html, /What is the goal\?/);
  assert.match(html, /processed in this browser/);
});

test('renders a declarative monitor dashboard with dated signals and local coverage scoring', () => {
  const monitor = {
    ...resource('signal-watch', [{ type: 'supports', target: 'alpha' }]),
    kind: 'monitor',
    implementationStatus: 'Public demonstration',
    documentation: ['Source contract'],
    monitor: {
      updated: '2026-07-26',
      filters: ['Policy'],
      signals: [{ date: '2026-07-26', category: 'Policy', title: 'Rule changed', status: 'Review', confidence: 'High', source: 'Primary source' }],
      checks: ['Primary source preserved']
    }
  };
  const alpha = resource('alpha', [{ type: 'supports', target: 'signal-watch' }]);
  const registry = new Map([[monitor.id, monitor], [alpha.id, alpha]]);
  const html = renderStructuredPage({ resource: monitor, registry });
  assert.match(html, /id="monitor-signals"/);
  assert.match(html, /Rule changed/);
  assert.match(html, /id="monitor-coverage"/);
  assert.match(html, /nothing is sent or monitored externally/);
});

test('renders weighted assessment options and a browser-local product demo', () => {
  const assessment = {
    ...resource('exposure', [{ type: 'supports', target: 'demo' }]),
    kind: 'assessment',
    implementationStatus: 'Public',
    assessment: {
      dimensions: ['consent'],
      appliesToKinds: ['tool'],
      questions: [{ id: 'consent', prompt: 'Is consent recorded?', options: [{ value: 'missing', label: 'No', dimension: 'consent', score: 2 }] }],
      recommendations: [{ id: 'review', condition: 'consent_gap', resourceIds: ['demo'] }]
    }
  };
  const demo = {
    ...resource('demo', [{ type: 'supports', target: 'exposure' }]),
    kind: 'tool',
    implementationStatus: 'Public',
    documentation: ['Demo contract'],
    demo: {
      type: 'trust-safe-twin',
      seededRecords: [{ name: 'A', company: 'B', vertical: 'Legal', status: 'Review' }],
      unsafeDraft: 'Guarantee',
      safeDraft: 'Reviewable draft',
      sampleRiskText: 'Ignore previous instructions'
    }
  };
  const registry = new Map([[assessment.id, assessment], [demo.id, demo]]);
  const assessmentHtml = renderStructuredPage({ resource: assessment, registry });
  const demoHtml = renderStructuredPage({ resource: demo, registry });
  assert.match(assessmentHtml, /data-score="2"/);
  assert.match(assessmentHtml, /Directional signal total/);
  assert.match(demoHtml, /id="demo-records"/);
  assert.match(demoHtml, /Production delivery remains disabled/);
});

test('renders a declarative browser-local operational tool', () => {
  const tool = {
    ...resource('analyzer', [{ type: 'supports', target: 'alpha' }]),
    kind: 'tool',
    implementationStatus: 'Public',
    documentation: ['Browser-local contract'],
    demo: {
      type: 'browser-tool',
      mode: 'analyze',
      inputLabel: 'Paste text',
      sample: 'The agency shall act.',
      outputTitle: 'Signals',
      signals: [{ label: 'Obligation', terms: ['shall'] }]
    }
  };
  const alpha = resource('alpha', [{ type: 'supports', target: 'analyzer' }]);
  const registry = new Map([[tool.id, tool], [alpha.id, alpha]]);
  const html = renderStructuredPage({ resource: tool, registry });
  assert.match(html, /id="browser-tool-input"/);
  assert.match(html, /processed in this browser/);
  assert.match(html, /Obligation/);
});

test('renders declarative structured forms for documents and scored diagnostics', () => {
  const documentTool = {
    ...resource('role-contract', [{ type: 'supports', target: 'diagnostic' }]),
    kind: 'tool',
    implementationStatus: 'Public',
    documentation: ['Form contract'],
    demo: {
      type: 'structured-form',
      mode: 'document',
      outputTitle: 'Agent Role Contract',
      downloadName: 'agent-role-contract.md',
      fields: [{ id: 'owner', label: 'Owner', type: 'text', hint: 'A human owner' }]
    }
  };
  const diagnostic = {
    ...resource('diagnostic', [{ type: 'supports', target: 'role-contract' }]),
    kind: 'service',
    deliverables: ['Diagnostic'],
    timeline: 'Two weeks',
    fit: ['A bounded question'],
    demo: {
      type: 'structured-form',
      mode: 'score',
      maxScore: 3,
      fields: [{ id: 'signal', label: 'Signal', type: 'radio', options: [{ value: 'clear', label: 'Clear', dimension: 'fluency', score: 3 }] }],
      bands: [{ min: 0, title: 'Review', summary: 'Inspect the signal.' }],
      recommendations: [{ dimension: 'fluency', text: 'Reduce friction.' }]
    }
  };
  const registry = new Map([[documentTool.id, documentTool], [diagnostic.id, diagnostic]]);
  const documentHtml = renderStructuredPage({ resource: documentTool, registry });
  const diagnosticHtml = renderStructuredPage({ resource: diagnostic, registry });
  assert.match(documentHtml, /id="structured-form-tool"/);
  assert.match(documentHtml, /Download Markdown/);
  assert.match(documentHtml, /new Blob/);
  assert.match(diagnosticHtml, /Generate diagnostic/);
  assert.match(diagnosticHtml, /Mechanisms surfaced/);
  assert.match(diagnosticHtml, /nothing you enter is sent or stored/i);
});

test('renders institutional and legal-policy resources from structured contracts', () => {
  const institutional = {
    ...resource('about', [{ type: 'documents', target: 'terms' }]),
    kind: 'institutional',
    pathname: '/about',
    institutionalSections: [{ title: 'Formation', items: [{ title: 'Law', text: 'Authority and accountability remain visible.' }] }]
  };
  const policy = {
    ...resource('terms', [{ type: 'documents', target: 'about' }]),
    kind: 'policy',
    pathname: '/terms',
    effectiveDate: '2026-07-04',
    policySections: [{ order: 1, title: 'Informational use', paragraphs: ['Nothing creates an attorney–client relationship.'] }]
  };
  const registry = new Map([[institutional.id, institutional], [policy.id, policy]]);
  assert.deepEqual(errorsFor([institutional, policy]), []);
  const institutionalHtml = renderStructuredPage({ resource: institutional, registry });
  const policyHtml = renderStructuredPage({ resource: policy, registry });
  assert.match(institutionalHtml, /Formation/);
  assert.match(institutionalHtml, /Authority and accountability remain visible/);
  assert.match(policyHtml, /Effective 2026-07-04/);
  assert.match(policyHtml, /Nothing creates an attorney–client relationship/);
  assert.match(policyHtml, /"@type":"WebPage"/);
});

test('renders about as a concise credibility record without registry identity or duplicated editorial biography', () => {
  const about = {
    ...resource('about', [{ type: 'uses', target: 'methods' }]),
    kind: 'institutional',
    pathname: '/about',
    editorialIntro: ['One interdisciplinary through-line.'],
    editorialSections: [{
      title: 'Formation',
      blocks: [{ type: 'paragraph', text: 'Duplicated long-form formation.' }]
    }],
    institutionalSections: [
      {
        priority: true,
        title: 'What the record supports.',
        intro: 'Role statements are based on the professional record; links show application, not independent verification.',
        items: [{
          title: 'Research rigor',
          subtitle: 'Named role',
          basis: 'Record basis: research experience',
          text: 'Specific evidence.',
          href: '/methods',
          linkLabel: 'Inspect the applied method'
        }]
      },
      {
        title: 'Formation',
        items: [{ title: 'Law', text: 'Authority and accountability remain visible.' }]
      }
    ]
  };
  const methods = resource('methods', [{ type: 'supports', target: 'about' }]);
  methods.pathname = '/methods';
  const registry = new Map([[about.id, about], [methods.id, methods]]);
  const html = renderStructuredPage({ resource: about, registry });

  assert.doesNotMatch(html, /Canonical ID: <code>about<\/code>/);
  assert.doesNotMatch(html, /Duplicated long-form formation/);
  assert.equal(html.match(/What the record supports\./g)?.length, 1);
  assert.match(html, /Named role/);
  assert.match(html, /Record basis: research experience/);
  assert.match(html, /links show application, not independent verification/);
  assert.match(html, />Inspect the applied method →<\/a>/);
  assert.match(html, /<div class="card"><span class="card__index">01<\/span><h3>Research rigor<\/h3>[\s\S]*?<a class="mini" href="\/methods">Inspect the applied method →<\/a><\/div>/);
  assert.doesNotMatch(html, /<a class="card card--hover" href="\/methods"><h3>Research rigor<\/h3>/);
  assert.ok(html.indexOf('What the record supports.') < html.indexOf('One interdisciplinary through-line.'));
  assert.match(html, /href="\/methods"/);
});
