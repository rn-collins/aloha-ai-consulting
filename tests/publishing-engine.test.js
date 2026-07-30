import assert from 'node:assert/strict';
import test from 'node:test';
import { derivePlatform, generatedOutputs, legacyMigrationInventory, validateCollectionPages, validatePlatform, validateRoutingConfig } from '../lib/site/publishing-engine.js';
import { renderStructuredPage } from '../lib/site/structured-renderer.js';
import { buildMetadata, decodeHtmlText, metadataDescription, metadataTitle } from '../lib/site/metadata.js';
import { UNIVERSITY_RECORD_TYPES, UNIVERSITY_SCHEMA_VERSION, expandEducationResources, validateUniversitySystem } from '../lib/site/university-model.js';
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
  assert.match(html, /og-image\.png\?v=20260729b/);
  assert.match(html, /Complex work, made usable/);
  assert.match(html, /A substantive retained paragraph/);
  assert.match(html, /<pre><code>VERIFY\(source\)<\/code><\/pre>/);
  assert.match(html, /<th>Signal<\/th>/);
  const search = JSON.parse(generatedOutputs(resources, platform).get('/search-index.json'));
  assert.match(search.find((item) => item.id === 'alpha').text, /human reviewer/);
});

test('keeps an authored homepage brand title from repeating the brand suffix', () => {
  const home = {
    ...resource('home', [{ type: 'supports', target: 'beta' }]),
    pathname: '/',
    seoTitle: 'Aloha AI | Complex work, made usable'
  };
  const beta = resource('beta', [{ type: 'supports', target: 'home' }]);
  const platform = derivePlatform([home, beta]);
  const html = renderStructuredPage({ resource: home, registry: platform.registry });
  assert.match(html, /<title>Aloha AI \| Complex work, made usable<\/title>/);
  assert.doesNotMatch(html, /Aloha AI \| Complex work, made usable \| Aloha AI/);
});

test('publishes an accessible plain-language search journey', () => {
  const resources = [
    resource('alpha', [{ type: 'supports', target: 'beta' }]),
    resource('beta', [{ type: 'supports', target: 'alpha' }])
  ];
  const outputs = generatedOutputs(resources, derivePlatform(resources));
  const search = outputs.get('/search');
  assert.match(search, /<form class="search-form" role="search"/);
  assert.match(search, /What are you trying/);
  assert.match(search, /aria-label="What are you trying to do\?"/);
  assert.match(search, /<b>2<br><small>canonical resources<\/small><\/b>/);
  assert.match(search, /Loading the resource index/);
  assert.match(search, /aria-busy="true"/);
  assert.match(search, /Search needs JavaScript, but the site does not/);
  assert.match(search, /The index did not load/);
  assert.ok(search.includes("fetch('/search-index.json')"));
  assert.match(search, /Start a conversation/);
  assert.ok(outputs.has('/search-index.json'));
  assert.match(outputs.get('/sitemap.xml'), /<loc>https:\/\/aloha-ai-consulting\.vercel\.app\/search<\/loc>/);
});

test('publishes an authored recovery journey for unknown routes', () => {
  const resources = [
    resource('alpha', [{ type: 'supports', target: 'beta' }]),
    resource('beta', [{ type: 'supports', target: 'alpha' }])
  ];
  const outputs = generatedOutputs(resources, derivePlatform(resources));
  const notFound = outputs.get('/404');
  assert.match(notFound, /class="is-not-found"/);
  assert.match(notFound, /This route does not exist/);
  assert.match(notFound, /action="\/search"/);
  assert.match(notFound, /href="\/tools"/);
  assert.match(notFound, /href="\/methods"/);
  assert.equal(notFound.match(/name="robots"/g)?.length, 1);
  assert.match(notFound, /content="noindex, follow"/);
  assert.doesNotMatch(outputs.get('/sitemap.xml'), /\/404<\/loc>/);
});

test('keeps Direction 2 collection covers free of legacy shell treatments', () => {
  const resources = [
    resource('alpha', [{ type: 'supports', target: 'beta' }]),
    resource('beta', [{ type: 'supports', target: 'alpha' }])
  ];
  const outputs = generatedOutputs(resources, derivePlatform(resources));
  const research = outputs.get('/research');
  const shellCss = fs.readFileSync(new URL('../site-shell.css', import.meta.url), 'utf8');
  const homeCss = fs.readFileSync(new URL('../aloha-ds.css', import.meta.url), 'utf8');
  const pageCss = fs.readFileSync(new URL('../page-system.css', import.meta.url), 'utf8');
  assert.match(research, /class="collection-cover collection-cover--violet"/);
  assert.match(shellCss, /body \.nav\{[^}]*background:rgba\(10,10,11,.97\)!important/);
  assert.match(shellCss, /body \.nav__brand,body \.site-nav__trigger,body \.site-nav__search\{color:#ffffff!important\}/);
  assert.match(shellCss, /\.site-nav__burger\{[^}]*color:var\(--shell-paper\)!important[^}]*border:1px solid rgba\(245,234,216,.62\)!important/);
  assert.doesNotMatch(homeCss, /\.is-home \.nav\{[^}]*background:/);
  assert.match(homeCss, /\.js \.motion-ready\{opacity:1;transform:none\}/);
  assert.doesNotMatch(shellCss, /\.site-nav__trigger\{[^}]*border-radius:8px/);
  assert.match(pageCss, /\.collection-cover \.btn--primary\{[^}]*border-radius:0/);
  assert.doesNotMatch(pageCss, /\.collection-cover__poster\{[^}]*box-shadow:16px 18px 0 #fff/);
  assert.match(pageCss, /\.collection-cover__poster\{[^}]*overflow:hidden/);
  assert.match(pageCss, /\.collection-cover__poster i\{[^}]*max-width:calc\(100% - 3rem\)/);
  assert.match(pageCss, /\.collection-cover__copy h1\{font-size:clamp\(2\.8rem,13\.5vw,4\.6rem\)/);
  assert.match(research, /See how the thinking becomes something you can use\./);
  assert.match(research, /ALOHA AI · INDEX 02/);
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

test('requires courses to publish an honest delivery contract', () => {
  const course = {
    ...resource('course-alpha', [{ type: 'supports', target: 'beta' }]),
    kind: 'course',
    delivery: {
      status: 'curriculum-preview',
      enrollmentOpen: false,
      lessons: 'planned',
      tutor: 'planned',
      progressTracking: 'not-available',
      credential: 'not-available',
      lastReviewed: '2026-07-29'
    }
  };
  const beta = resource('beta', [{ type: 'supports', target: 'course-alpha' }]);
  assert.deepEqual(errorsFor([course, beta]), []);

  const overstated = {
    ...course,
    editorialIntro: ['Async, lifetime access · Built-in governed AI tutor']
  };
  const errors = errorsFor([overstated, beta]);
  assert.ok(errors.includes('course-alpha: course copy advertises a tutor that is not available'));
  assert.ok(errors.includes('course-alpha: course copy advertises access while enrollment is closed'));
});

test('renders course delivery status instead of treating catalog maturity as availability', () => {
  const course = {
    ...resource('course-alpha', [{ type: 'supports', target: 'beta' }]),
    kind: 'course',
    delivery: {
      status: 'curriculum-preview',
      enrollmentOpen: false,
      lessons: 'planned',
      tutor: 'planned',
      progressTracking: 'not-available',
      credential: 'not-available',
      lastReviewed: '2026-07-29'
    }
  };
  const beta = resource('beta', [{ type: 'supports', target: 'course-alpha' }]);
  const html = renderStructuredPage({ resource: course, registry: derivePlatform([course, beta]).registry });
  assert.match(html, /Curriculum preview/);
  assert.match(html, /Curriculum preview · enrollment closed/);
});

test('defines and validates the complete University educational record system', () => {
  assert.equal(UNIVERSITY_SCHEMA_VERSION, '1.0.0');
  assert.deepEqual(UNIVERSITY_RECORD_TYPES, [
    'course', 'module', 'lesson', 'assessment', 'source',
    'link', 'tool', 'project', 'rubric', 'credential', 'outcome'
  ]);
  const records = [
    { id: 'course-one', type: 'course', title: 'Course', status: 'curriculum-preview', moduleIds: ['module-one'], outcomeIds: ['outcome-one'], assessmentIds: ['assessment-one'], projectIds: ['project-one'], sourceIds: ['source-one'], toolIds: ['tool-one'], credentialId: 'credential-one' },
    { id: 'module-one', type: 'module', title: 'Module', courseId: 'course-one', position: 1, lessonIds: ['lesson-one'], outcomeIds: ['outcome-one'] },
    { id: 'lesson-one', type: 'lesson', title: 'Lesson', moduleId: 'module-one', position: 1, outcomeIds: ['outcome-one'], sourceIds: ['source-one'], activityIds: ['assessment-one'] },
    { id: 'assessment-one', type: 'assessment', title: 'Assessment', courseId: 'course-one', assessmentType: 'knowledge-check', outcomeIds: ['outcome-one'], rubricId: 'rubric-one', passingRule: 'Earn at least 80 percent.' },
    { id: 'source-one', type: 'source', title: 'Source', url: 'https://example.com/source', authority: 'primary', publisher: 'Publisher', publishedOrUpdated: '2026-07-29', lastVerified: '2026-07-29' },
    { id: 'link-one', type: 'link', label: 'Open source', href: 'https://example.com/source', destinationType: 'external-primary-source', lastVerified: '2026-07-29' },
    { id: 'tool-one', type: 'tool', title: 'Tool', capabilityLevel: 'local-instrument', implementationStatus: 'public-beta', dataPath: 'Input remains in the browser.', limitations: ['Does not verify source existence.'], lastTested: '2026-07-29' },
    { id: 'project-one', type: 'project', title: 'Project', courseId: 'course-one', brief: 'Build and document the system.', deliverableIds: ['link-one'], rubricId: 'rubric-one', evidenceRequirements: ['Test results'] },
    { id: 'rubric-one', type: 'rubric', title: 'Rubric', criteria: [{ id: 'criterion-one', weight: 100 }], scoringMethod: 'Weighted criteria', passingScore: 80 },
    { id: 'credential-one', type: 'credential', title: 'Credential', courseId: 'course-one', issuanceStatus: 'planned', requirements: ['Pass the capstone.'], verificationMethod: 'No credential is issued while status is planned.' },
    { id: 'outcome-one', type: 'outcome', statement: 'Apply the verification method.', level: 'apply' }
  ];
  const course = {
    ...resource('course-resource', [{ type: 'supports', target: 'beta' }]),
    kind: 'course',
    delivery: { status: 'curriculum-preview', enrollmentOpen: false, lessons: 'planned', tutor: 'planned', progressTracking: 'not-available', credential: 'not-available', lastReviewed: '2026-07-29' },
    education: { schemaVersion: UNIVERSITY_SCHEMA_VERSION, records }
  };
  assert.deepEqual(validateUniversitySystem([course]), []);
});

test('renders the flagship citation course as complete open materials without claiming delivery systems', () => {
  const courses = JSON.parse(fs.readFileSync(new URL('../content/university/courses/build-courses.json', import.meta.url)));
  const course = courses.find((item) => item.id === 'citation-verifier-course');
  const tool = JSON.parse(fs.readFileSync(new URL('../content/tools/citation-verifier.json', import.meta.url)));
  const html = renderStructuredPage({ resource: course, registry: new Map([[course.id, course], [tool.id, tool]]) });
  assert.equal(course.delivery.lessons, 'available');
  assert.equal(course.delivery.enrollmentOpen, false);
  assert.equal(course.education.records.filter((item) => item.type === 'module').length, 9);
  assert.equal(course.education.records.filter((item) => item.type === 'lesson').length, 18);
  assert.match(html, /id="course-materials"/);
  assert.match(html, /9 modules\. 18 lessons\./);
  assert.match(html, /The five different citation failures/);
  assert.match(html, /Open materials · enrollment closed/);
  assert.match(html, /href="https:\/\/www\.americanbar\.org\/content\/dam\/aba\//);
  assert.match(html, /href="\/tools\/citation-verifier"/);
  assert.match(html, /does not currently accept or grade submissions/i);
  assert.match(html, /Private progress on this device/);
  assert.match(html, /account-synced progress/i);
  assert.doesNotMatch(html, /saved progress/i);
  assert.match(html, /Executable knowledge check/);
  assert.match(html, /\/university\/templates\/citation-verifier-lab-kit/);
  assert.match(html, /\/university\/courses\/citation-verifier\/lessons\/failure/);
});

test('publishes the citation lab kit as a canonical page with a browser-local download', () => {
  const kit = JSON.parse(fs.readFileSync(new URL('../content/university/templates/citation-verifier-lab-kit.json', import.meta.url)));
  const html = renderStructuredPage({ resource: kit, registry: new Map([[kit.id, kit]]) });
  assert.match(html, /id="template-download"/);
  assert.match(html, /Download Markdown template/);
  assert.match(html, /not a submission portal/i);
  assert.match(html, /citation-verifier-lab-and-submission-kit\.md/);
});

test('derives eighteen dedicated flagship lesson routes from the canonical course records', () => {
  const courses = JSON.parse(fs.readFileSync(new URL('../content/university/courses/build-courses.json', import.meta.url)));
  const course = courses.find((item) => item.id === 'citation-verifier-course');
  const expanded = expandEducationResources([course]);
  const lessons = expanded.filter((item) => item.kind === 'lesson');
  assert.equal(lessons.length, 18);
  assert.equal(new Set(lessons.map((item) => item.pathname)).size, 18);
  assert.equal(lessons[0].pathname, '/university/courses/citation-verifier/lessons/failure');
  const html = renderStructuredPage({ resource: lessons[0], registry: new Map(expanded.map((item) => [item.id, item])) });
  assert.match(html, /id="lesson-delivery"/);
  assert.match(html, /Mark lesson complete/);
  assert.match(html, /not independently verified/i);
  assert.match(html, /href="https:\/\/www\.americanbar\.org\/content\/dam\/aba\//);
  assert.match(html, /href="https:\/\/www\.uscourts\.gov\/forms-rules\//);
  assert.doesNotMatch(html, /&lt;a href=/);
  assert.match(html, /Course overview/);
});

test('blocks an enrollment-open course without a complete educational system', () => {
  const course = {
    ...resource('course-alpha', []),
    kind: 'course',
    delivery: { status: 'enrollment-open', enrollmentOpen: true, lessons: 'available', tutor: 'planned', progressTracking: 'available', credential: 'planned', lastReviewed: '2026-07-29' }
  };
  assert.ok(validateUniversitySystem([course]).includes('course-alpha: enrollment-open course requires validated education records'));
});

test('requires named homepage tools and products to link to their canonical pages', () => {
  const linked = {
    ...resource('linked-tools'),
    editorialSections: [{
      title: 'Live intelligence tools',
      blocks: [{ type: 'heading', text: 'Citation Verifier', href: '/tools/citation-verifier' }]
    }]
  };
  const unlinked = {
    ...linked,
    editorialSections: [{
      title: 'Live intelligence tools',
      blocks: [{ type: 'heading', text: 'Citation Verifier' }]
    }]
  };
  assert.doesNotMatch(validatePlatform([linked], derivePlatform([linked])).errors.join('\n'), /does not link/);
  assert.match(validatePlatform([unlinked], derivePlatform([unlinked])).errors.join('\n'), /names a resource but does not link it/);
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
  assert.match(html, /Every entry tells you what it is and whether it is ready to use/);
  assert.match(html, /Public beta/);
  assert.match(html, /Open the monitor/);
  assert.doesNotMatch(html, />Discovery</);
});

test('renders taxonomy directories as navigable indexes with a search escape hatch', () => {
  const legal = { ...resource('legal', [{ type: 'supports', target: 'health' }]), industries: ['legal'] };
  const health = { ...resource('health', [{ type: 'supports', target: 'legal' }]), industries: ['health'] };
  const html = generatedOutputs([legal, health], derivePlatform([legal, health])).get('/industries');
  assert.match(html, /class="is-directory is-discovery-directory/);
  assert.match(html, /Discovery lens · Field or market/);
  assert.match(html, /describe your question in Search/);
  assert.match(html, /2 paths/);
});

test('renders taxonomy paths as filterable Direction 2 discovery records', () => {
  const legal = { ...resource('legal-research', []), kind: 'researchNote', pathname: '/notes/legal-research', topics: ['legal-ai'], industries: ['legal'], maturity: 'Research' };
  const tool = { ...resource('citation-tool', []), kind: 'tool', pathname: '/tools/citation-tool', topics: ['legal-ai'], industries: ['legal'], maturity: 'Beta' };
  const platform = derivePlatform([legal, tool]);
  const outputs = generatedOutputs([legal, tool], platform);
  const directory = outputs.get('/topics');
  const detail = outputs.get('/topics/legal-ai');
  assert.match(directory, /is-discovery-directory/);
  assert.match(directory, /Filter these paths/);
  assert.match(directory, /class="discovery-empty" hidden/);
  assert.match(detail, /is-discovery-collection/);
  assert.match(detail, /data-resource-filter="all"/);
  assert.match(detail, /href="\/tools\/citation-tool"/);
  assert.match(detail, /Open the canonical page/);
  assert.doesNotMatch(detail, /class="page-hero section--ink"/);
});

test('renders the stacks front door as a linked applied-systems index', () => {
  const index = { ...resource('applied-ai-stacks', []), kind: 'collection', pathname: '/stacks', collection: { kinds: ['useCase'], pathPrefix: '/stacks/' } };
  const stack = { ...resource('law-firm-stack', []), kind: 'useCase', pathname: '/stacks/law-firm', title: 'Law Firm AI Stack', maturity: 'Production' };
  const registry = new Map([[index.id, index], [stack.id, stack]]);
  const html = renderStructuredPage({ resource: index, registry });
  assert.match(html, /class="is-stacks-index"/);
  assert.match(html, /See how the layers work together/);
  assert.match(html, /href="\/stacks\/law-firm"/);
  assert.match(html, /Open the complete stack/);
  assert.doesNotMatch(html, /Canonical ID:/);
  assert.doesNotMatch(html, /class="page-hero section--ink"/);
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
  assert.match(html, /Paste a passage, run the browser-local structural check/);
  assert.match(html, /Inspect the team-design service/);
  assert.doesNotMatch(html, />Design the team <i/);
  assert.doesNotMatch(html, /before it reaches the court/);
  assert.doesNotMatch(html, /Canonical ID: <code>builds/);
  assert.equal((html.match(/data-priority-collection=/g) || []).length, 0);
  assert.ok(html.indexOf('id="build-wall"') < html.indexOf('Behind the wall'));
});

test('proof-wall action promises match runnable destination capabilities', () => {
  const builds = JSON.parse(fs.readFileSync(new URL('../content/site/home-and-builds.json', import.meta.url))).find((item) => item.id === 'builds');
  const citation = JSON.parse(fs.readFileSync(new URL('../content/tools/citation-verifier.json', import.meta.url)));
  const readiness = JSON.parse(fs.readFileSync(new URL('../content/tools/ai-readiness-scorecard.json', import.meta.url)));
  const registry = new Map([[citation.id, citation], [readiness.id, readiness]]);
  const citationHtml = renderStructuredPage({ resource: citation, registry });
  const readinessHtml = renderStructuredPage({ resource: readiness, registry });
  const citationCard = builds.buildsExperience.items.find((item) => item.resourceId === citation.id);
  const readinessCard = builds.buildsExperience.items.find((item) => item.resourceId === readiness.id);

  assert.equal(citationCard.action, 'Try the verifier');
  assert.match(citationHtml, /id="citation-verifier-form"/);
  assert.match(citationHtml, /id="citation-draft"/);
  assert.match(citationHtml, />Verify citations<\/button>/);
  assert.equal(readinessCard.action, 'Take the scorecard');
  assert.match(readinessHtml, /id="structured-assessment"/);
  assert.equal((readinessHtml.match(/<fieldset class="card">/g) || []).length, 6);
  assert.match(readinessHtml, />Show my roadmap<\/button>/);
});

test('deep-section controls use explicit open and close labels, not symbol-only states', () => {
  const builds = JSON.parse(fs.readFileSync(new URL('../content/site/home-and-builds.json', import.meta.url))).find((item) => item.id === 'builds');
  const selected = builds.buildsExperience.items.map((entry) => ({
    ...resource(entry.resourceId, []),
    id: entry.resourceId,
    pathname: `/${entry.resourceId}`,
    maturity: 'Beta'
  }));
  const html = renderStructuredPage({ resource: builds, registry: new Map([[builds.id, builds], ...selected.map((item) => [item.id, item])]) });
  assert.match(html, /class="depth-open">Open</);
  assert.match(html, /class="depth-close">Close</);
  assert.doesNotMatch(html, /aria-hidden="true">\+<\/i>/);
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
  assert.match(html, /href="\/university\/playbooks\/lead-generation">Lead Generation/);
  assert.match(html, /href="\/university\/playbooks\/client-intake-onboarding">Client Intake &amp; Onboarding/);
  assert.match(html, /href="\/university\/playbooks\/content-repurposing">Content Repurposing/);
  assert.match(html, /href="\/university\/templates\/ai-implementation-roadmap">AI Implementation Roadmap/);
  assert.match(html, /href="\/university\/templates\/ai-policy-starter-kit">AI Policy Starter Kit/);
  assert.match(html, /href="\/university\/templates\/content-repurposing-workflow">Content Repurposing Workflow/);
  assert.match(html, /Browse your way\./);
  assert.doesNotMatch(html, /Canonical ID: <code>university/);
  assert.ok(html.indexOf('id="choose-a-path"') < html.indexOf('Featured paths and teaching standards.'));
});

test('renders every University learning kind as a linked complete learning record', () => {
  for (const kind of ['lesson', 'course', 'playbook', 'template', 'toolGuide', 'useCase']) {
    const item = {
      ...resource(`university-${kind}`, []),
      kind,
      pathname: `/university/${kind}s/example`,
      title: `${kind} example`,
      audience: 'Curious operators',
      editorialIntro: ['Begin with the real job.'],
      editorialSections: [{ title: 'First move', blocks: [{ type: 'paragraph', text: 'Use the Claims Checker and compare ChatGPT with Claude before deciding.' }] }]
    };
    const checker = { ...resource('claims-checker', []), kind: 'tool', title: 'Claims Checker', pathname: '/tools/claims-checker' };
    const html = renderStructuredPage({ resource: item, registry: new Map([[item.id, item], [checker.id, checker]]) });

    assert.match(html, /class="[^"]*is-resource-detail[^"]*"/);
    assert.match(html, /id="learning-record"/);
    assert.match(html, /Who this is for/);
    assert.match(html, /href="\/tools\/claims-checker"/);
    assert.match(html, /href="https:\/\/chatgpt\.com\/">ChatGPT<\/a>/);
    assert.match(html, /href="https:\/\/claude\.ai\/">Claude<\/a>/);
    assert.match(html, /\$0 · no signup/);
    assert.doesNotMatch(html, /Canonical ID:/);
    if (kind === 'useCase') {
      assert.match(html, /UNIVERSITY USE CASE/);
      assert.match(html, /The model drafts\. A person checks and decides\./);
      assert.match(html, /href="\/university\/use-cases"/);
    }
  }
});

test('renders selected engagements before generic service mechanics with explicit relationship status', () => {
  const engagements = JSON.parse(fs.readFileSync(new URL('../content/services/engagements.json', import.meta.url)));
  const html = renderStructuredPage({ resource: engagements, registry: new Map([[engagements.id, engagements]]) });
  const commissioned = html.indexOf('data-engagement-status="commissioned"');
  const independent = html.indexOf('data-engagement-status="independent"');
  const serviceJourney = html.indexOf('class="service-brief"');

  assert.ok(commissioned > 0);
  assert.ok(independent > commissioned);
  assert.ok(serviceJourney > independent);
  assert.doesNotMatch(html, /Canonical ID:/);
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
    institutionalSections: [{ priority: true, title: 'Start here', items: [{ title: 'Services', text: 'Choose a path.', href: '/alpha' }] }]
  };
  const alpha = resource('alpha', [{ type: 'supports', target: 'home' }]);
  const registry = new Map([[home.id, home], [alpha.id, alpha]]);
  const html = renderStructuredPage({ resource: home, registry });
  assert.match(html, /Explore services/);
  assert.match(html, /class="card card--hover" href="\/alpha"/);
  assert.doesNotMatch(html, /_vercel\/insights\/script\.js/);
  assert.match(html, /_vercel\/speed-insights\/script\.js/);
  assert.doesNotMatch(html, /Evidence this resource depends on/);
  assert.doesNotMatch(html, /href="\/#start">Start a conversation/);
});

test('prioritizes homepage visitor pathways and does not append the legacy institutional sequence', () => {
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
  assert.ok(html.indexOf('Start with your problem') < html.indexOf('Choose the next move'));
  assert.doesNotMatch(html, /How the system works/);
  assert.doesNotMatch(html, /Background/);
  assert.doesNotMatch(html, /home-story/);
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
  assert.ok(html.indexOf('See the work') < html.indexOf('Choose the next move'));
  assert.doesNotMatch(html, /Practice narrative/);
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

test('renders University institutional pages as complete linked orientation records', () => {
  const guide = {
    ...resource('university-start-here', [{ type: 'supports', target: 'alpha' }]),
    kind: 'learningHub',
    pathname: '/university/start-here',
    title: 'Choose your first practical path',
    audience: 'New learners choosing where to begin.',
    editorialIntro: ['Start with the work you need to do.'],
    editorialSections: [{
      title: 'Choose by need',
      blocks: [{ type: 'heading', text: 'Open alpha' }, { type: 'paragraph', text: 'Use alpha as the next step.' }]
    }],
    learningPaths: ['Orient', 'Choose', 'Begin']
  };
  const alpha = { ...resource('alpha', [{ type: 'supports', target: 'university-start-here' }]), title: 'alpha' };
  const registry = new Map([[guide.id, guide], [alpha.id, alpha]]);
  const html = renderStructuredPage({ resource: guide, registry });

  assert.match(html, /is-resource-detail is-learningHub-detail/);
  assert.match(html, /UNIVERSITY GUIDE/);
  assert.match(html, /id="institutional-record"/);
  assert.match(html, /href="\/alpha"/);
  assert.match(html, /Evidence, method, assumptions, and limits stay visible/);
  assert.doesNotMatch(html, /Canonical ID:/);
});

test('renders detailed consulting services beneath the canonical Services parent', () => {
  const registry = new Map();
  const service = { ...resource('university-ai-strategy-sprint', []),
    kind: 'service',
    pathname: '/services/ai-strategy-sprint',
    audience: 'Operators deciding where AI belongs.',
    timeline: 'Two weeks',
    fit: ['A decision-maker is available'],
    deliverables: ['Prioritized roadmap'],
    methodology: ['Map the workflows'],
    evidence: ['Workflow interviews'],
    assumptions: ['Representative examples are available'],
    limitations: ['Not legal advice'],
    editorialIntro: ['Replace scattered experiments with a sequenced plan.'],
    editorialSections: [{ eyebrow: 'Scope', title: 'What is included', blocks: [{ type: 'paragraph', text: 'A complete working record.' }] }]
  };
  registry.set(service.id, service);
  const html = renderStructuredPage({ resource: service, registry });
  assert.match(html, /is-resource-detail is-service-detail/);
  assert.match(html, /class="service-brief"/);
  assert.match(html, /class="service-outcomes"/);
  assert.match(html, /class="service-process"/);
  assert.match(html, /class="service-record"/);
  assert.match(html, /class="service-boundary"/);
  assert.match(html, /href="\/services">Compare all services/);
  assert.doesNotMatch(html, /href="\/university\/services"/);
  assert.match(html, /class="service-close"/);
  assert.doesNotMatch(html, /Canonical ID/);
  assert.doesNotMatch(html, /class="section section--ink"/);
  assert.doesNotMatch(html, /class="method-steps"/);
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
  assert.doesNotMatch(html, /class="resource-status"/);
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

test('presents five direct visitor doors instead of nested internal navigation', () => {
  const shell = fs.readFileSync(new URL('../site-shell.js', import.meta.url), 'utf8');
  assert.match(shell, /\['\/services','What We Build'\]/);
  assert.match(shell, /\['\/builds','See the Work'\]/);
  assert.match(shell, /\['\/methods','How It Works'\]/);
  assert.match(shell, /\['\/university','Learn'\]/);
  assert.match(shell, /\['\/about','About'\]/);
  assert.doesNotMatch(shell, /NAV_GROUPS/);
  assert.doesNotMatch(shell, /site-nav__panel/);
});

test('uses the current coral spark favicon and neutral browser chrome', () => {
  const icon = fs.readFileSync(new URL('../favicon.svg', import.meta.url), 'utf8');
  const pageRenderer = fs.readFileSync(new URL('../lib/site/page-renderer.js', import.meta.url), 'utf8');
  const structuredRenderer = fs.readFileSync(new URL('../lib/site/structured-renderer.js', import.meta.url), 'utf8');
  const publishingEngine = fs.readFileSync(new URL('../lib/site/publishing-engine.js', import.meta.url), 'utf8');
  assert.match(icon, /#FF684C/);
  assert.match(icon, /#0A0A0B/);
  for (const source of [pageRenderer, structuredRenderer, publishingEngine]) {
    assert.match(source, /theme-color" content="#0A0A0B"/);
    assert.match(source, /rel="icon" href="\/favicon\.svg"/);
  }
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
  assert.match(html, /class="services-ticker"/);
  assert.match(html, /Find the/);
  assert.match(html, /People<br><b>\+<\/b> AI/);
  assert.match(html, /What keeps getting stuck\?/);
  assert.match(html, /Does this sound familiar\?/);
  assert.match(html, /What changes/);
  assert.match(html, /Our research is scattered\./);
  assert.match(html, /id="engagement-paths"/);
  assert.match(html, /Systems Audit/);
  assert.match(html, /Inspect the scope, deliverables, and boundaries\./);
  assert.match(html, /<details class="service-depth__item">/);
  assert.equal(html.match(/In-depth service detail/g)?.length, 1);
  assert.doesNotMatch(html, /Canonical ID: <code>services/);
  assert.ok(html.indexOf('What keeps getting stuck?') < html.indexOf('In-depth service detail'));
  assert.match(html, /href="\/university\/contact"/);
});

test('renders collection front doors with the bright editorial hero instead of the legacy fallback', () => {
  const collection = {
    ...resource('university-lessons', []),
    kind: 'collection',
    pathname: '/university/learn',
    title: 'University lessons',
    summary: 'Choose a practical lesson.',
    audience: 'People learning to use AI.',
    eyebrow: 'Free lessons'
  };
  const html = renderStructuredPage({ resource: collection, registry: [collection] });
  assert.match(html, /page-hero--collection/);
  assert.doesNotMatch(html, /<section class="page-hero">/);
});

test('renders service and research records with the bright detail hero instead of the legacy fallback', () => {
  for (const item of [
    { ...resource('strategy', []), kind: 'service', pathname: '/strategy' },
    { ...resource('workflow-teardown', []), kind: 'research', pathname: '/teardowns/legal-ai-workflow' }
  ]) {
    const html = renderStructuredPage({ resource: item, registry: [item] });
    assert.match(html, /page-hero--detail/);
    assert.doesNotMatch(html, /<section class="page-hero">/);
  }
});

test('renders every consulting service as a complete contemporary service journey', () => {
  const services = [
    {
      ...resource('strategy', []),
      kind: 'service',
      pathname: '/strategy',
      audience: 'Leaders deciding where AI belongs.',
      deliverables: ['Decision map'],
      methodology: ['Map the work'],
      fit: ['Ownership is unclear']
    },
    {
      ...resource('strategy-sprint', []),
      kind: 'service',
      pathname: '/services/ai-strategy-sprint',
      audience: 'Small teams.',
      deliverables: ['Roadmap'],
      methodology: ['Prioritize'],
      fit: ['The first move is unclear']
    }
  ];
  const registry = new Map(services.map((item) => [item.id, item]));

  for (const service of services) {
    const html = renderStructuredPage({ resource: service, registry });
    assert.match(html, /class="service-brief"/);
    assert.match(html, /class="service-outcomes"/);
    assert.match(html, /class="service-process"/);
    assert.match(html, /class="service-fit"/);
    assert.match(html, /class="service-boundary"/);
    assert.match(html, /class="service-close"/);
    assert.doesNotMatch(html, /class="resource-identity"/);
  }
});

test('contains long code samples without widening the page', () => {
  const css = fs.readFileSync(new URL('../page-system.css', import.meta.url), 'utf8');
  assert.match(css, /pre\{max-width:100%;overflow-x:auto\}/);
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
  assert.match(html, /is-resource-detail is-assessment-detail/);
  assert.match(html, /id="interactive-workspace"/);
  assert.match(html, /Do not skip this part/);
  assert.doesNotMatch(html, /Canonical ID:/);
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
  assert.match(html, /is-resource-detail is-tool-detail/);
  assert.match(html, /Try it here/);
  assert.match(html, /Output and boundary belong together/);
  assert.doesNotMatch(html, /Canonical ID:/);
});

test('does not present a documentation-only tool as publicly interactive', () => {
  const tool = {
    ...resource('documented-concept', [{ type: 'supports', target: 'alpha' }]),
    kind: 'tool',
    maturity: 'Research'
  };
  const alpha = resource('alpha', [{ type: 'supports', target: 'documented-concept' }]);
  const html = renderStructuredPage({ resource: tool, registry: new Map([[tool.id, tool], [alpha.id, alpha]]) });
  assert.match(html, /currently exposes the documented research-stage record, not interactive controls/);
  assert.match(html, /Documentation only/);
  assert.doesNotMatch(html, /id="interactive-workspace"/);
  assert.doesNotMatch(html, /Try it here/);
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

test('renders product and governance resources as complete Direction 2 detail records', () => {
  const product = {
    ...resource('regulatory-intelligence', [{ type: 'implements', target: 'terms' }]),
    kind: 'product',
    pathname: '/trust-stack/regulatory-intelligence',
    maturity: 'Research',
    implementationStatus: 'Architecture exists; generalized packaging remains in research.',
    architecture: ['Authority registry', 'Change detection'],
    documentation: ['Verification rules'],
    roadmap: ['Publish implementation package'],
    changelog: ['2026-07: product contract added'],
    licensing: 'Planned for defined institutional implementations.',
    editorialSections: [{ title: 'What is inside', blocks: [{ type: 'paragraph', text: 'Use Citation Verifier and Novel Review Instrument before relying on a generated citation.' }] }]
  };
  const policy = {
    ...resource('terms', [{ type: 'documents', target: 'regulatory-intelligence' }]),
    kind: 'policy',
    pathname: '/terms',
    effectiveDate: '2026-07-04',
    policySections: [{ order: 1, title: 'Informational use', paragraphs: ['Citation Verifier does not replace professional review.'] }]
  };
  const citation = {
    ...resource('citation-verifier', []),
    kind: 'tool',
    pathname: '/tools/citation-verifier',
    title: 'Citation Verifier'
  };
  const novel = {
    ...resource('novel-review-instrument', []),
    kind: 'tool',
    pathname: '/tools/novel-review-instrument',
    title: 'Novel Review Instrument'
  };
  const registry = new Map([[product.id, product], [policy.id, policy], [citation.id, citation], [novel.id, novel]]);
  const productHtml = renderStructuredPage({ resource: product, registry });
  const policyHtml = renderStructuredPage({ resource: policy, registry });

  assert.match(productHtml, /is-resource-detail is-product-detail/);
  assert.match(productHtml, /class="page-hero page-hero--detail"/);
  assert.doesNotMatch(productHtml, /class="page-hero section--ink page-hero--detail"/);
  assert.match(productHtml, /PRODUCT SYSTEM/);
  assert.match(productHtml, /Architecture, status, and evidence in one place/);
  assert.match(productHtml, /Architecture exists; generalized packaging remains in research/);
  assert.match(productHtml, /href="\/tools\/citation-verifier">Citation Verifier<\/a>/);
  assert.match(productHtml, /href="\/tools\/novel-review-instrument">Novel Review Instrument<\/a>/);
  assert.doesNotMatch(productHtml, /Canonical ID:/);
  assert.equal(productHtml.match(/Evidence, method, assumptions, and limits\./g)?.length, 1);
  assert.match(policyHtml, /is-resource-detail is-policy-detail/);
  assert.match(policyHtml, /POLICY RECORD/);
  assert.match(policyHtml, /Effective 2026-07-04/);
  assert.match(policyHtml, /href="\/tools\/citation-verifier">Citation Verifier<\/a>/);
  assert.doesNotMatch(policyHtml, /style="margin-top:1rem"/);
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

  assert.match(html, /class="is-resource-detail is-institutional-detail"/);
  assert.match(html, /class="page-hero page-hero--detail"/);
  assert.match(html, /class="detail-cover detail-cover--institutional"/);
  assert.doesNotMatch(html, /Canonical ID: <code>about<\/code>/);
  assert.doesNotMatch(html, /Duplicated long-form formation/);
  assert.equal(html.match(/What the record supports\./g)?.length, 1);
  assert.match(html, /Named role/);
  assert.match(html, /Record basis: research experience/);
  assert.match(html, /links show application, not independent verification/);
  assert.match(html, />Inspect the applied method →<\/a>/);
  assert.match(html, /<div class="governance-record__items"><article><span>01<\/span><div><h3>Research rigor<\/h3>[\s\S]*?<a href="\/methods">Inspect the applied method →<\/a><\/div><\/article><\/div>/);
  assert.doesNotMatch(html, /<a class="card card--hover" href="\/methods"><h3>Research rigor<\/h3>/);
  assert.ok(html.indexOf('One interdisciplinary through-line.') < html.indexOf('What the record supports.'));
  assert.match(html, /class="primary-door-close"/);
  assert.doesNotMatch(html, /About the practice<\/a>/);
  assert.match(html, /href="\/methods"/);
});

test('renders research notes and monitor pages as complete Direction 2 detail records', () => {
  const citation = {
    ...resource('citation-verifier', [{ type: 'supports', target: 'note' }]),
    kind: 'tool',
    pathname: '/tools/citation-verifier',
    title: 'Citation Verifier',
    maturity: 'Beta'
  };
  const note = {
    ...resource('note', [{ type: 'uses', target: 'citation-verifier' }]),
    pathname: '/notes/note',
    title: 'A research question',
    editorialIntro: ['This note is anchored to the Citation Verifier.'],
    editorialSections: [{
      title: 'The argument',
      blocks: [{ type: 'paragraph', text: 'Open the Citation Verifier before relying on the output.' }]
    }]
  };
  const monitor = {
    ...resource('signal-watch', [{ type: 'supports', target: 'note' }]),
    kind: 'monitor',
    pathname: '/monitors/signal-watch',
    monitor: {
      updated: '2026-07-27',
      filters: ['Policy'],
      signals: [{ date: '2026-07-27', category: 'Policy', confidence: 'High', title: 'A signal', status: 'Review', source: 'Primary source' }],
      checks: ['Primary source preserved']
    },
    editorialSections: []
  };
  const registry = new Map([[citation.id, citation], [note.id, note], [monitor.id, monitor]]);
  const noteHtml = renderStructuredPage({ resource: note, registry });
  const monitorHtml = renderStructuredPage({ resource: monitor, registry });

  assert.match(noteHtml, /is-resource-detail is-research-detail/);
  assert.match(noteHtml, /detail-dossier__item/);
  assert.match(noteHtml, /href="\/tools\/citation-verifier">Citation Verifier<\/a>/);
  assert.doesNotMatch(noteHtml, /Canonical ID:/);
  assert.equal(noteHtml.match(/The argument/g)?.length, 1);
  assert.match(monitorHtml, /is-resource-detail is-monitor-detail/);
  assert.match(monitorHtml, /class="monitor-workspace"/);
  assert.match(monitorHtml, /nothing is sent or monitored externally/);
  assert.match(monitorHtml, /id="monitor-signals"/);
  assert.match(monitorHtml, /id="monitor-coverage"/);
});

test('does not render the unavailable Vercel Web Analytics script', () => {
  const home = resource('home');
  home.pathname = '/';
  const html = renderStructuredPage({ resource: home, registry: new Map([[home.id, home]]) });

  assert.doesNotMatch(html, /\/_vercel\/insights\/script\.js/);
  assert.match(html, /\/_vercel\/speed-insights\/script\.js/);
});

test('allows long discovery-card titles to wrap within narrow mobile viewports', () => {
  const css = fs.readFileSync(path.join(process.cwd(), 'page-system.css'), 'utf8');

  assert.match(
    css,
    /\.discovery-resource>strong\{[^}]*min-width:0[^}]*overflow-wrap:anywhere[^}]*\}/
  );
});

test('keeps University specific, audience-inclusive, and free of duplicate depth navigation', () => {
  const university = JSON.parse(
    fs.readFileSync(path.join(process.cwd(), 'content/site/cornerstones.json'), 'utf8')
  ).find((entry) => entry.id === 'university');
  const registry = new Map([[university.id, university]]);
  const html = renderStructuredPage({ resource: university, registry });

  assert.match(html, /Learn what AI does\. Then put it to work\./);
  assert.match(html, /People, teams, and institutions/);
  assert.doesNotMatch(html, /Free Generative AI University for Modern Businesses/);
  assert.match(html, /Featured paths and teaching standards\./);
  assert.equal(html.match(/class="university-depth__item"/g)?.length, 7);
  assert.doesNotMatch(html, /<strong>Start here\. We route you the rest of the way\.<\/strong>/);
});

test('renders incomplete editorial tables without shifting confidence into the date column', () => {
  const item = resource('evidence-ledger');
  item.editorialSections = [{
    title: 'Evidence',
    blocks: [{
      type: 'table',
      rows: [
        { cells: [{ text: 'Claim', header: true }, { text: 'Source', header: true }, { text: 'Retrieved', header: true }, { text: 'Confidence', header: true }] },
        { cells: [{ text: 'Missing date' }, { text: 'Primary source' }, { text: 'Med · interpretive' }] },
        { cells: [{ text: 'Missing both' }, { text: 'Second source' }] }
      ]
    }]
  }];
  const html = renderStructuredPage({ resource: item, registry: new Map([[item.id, item]]) });

  assert.match(html, /Missing date<\/td><td>Primary source<\/td><td>Not recorded<\/td><td>Med · interpretive/);
  assert.match(html, /Missing both<\/td><td>Second source<\/td><td>Not recorded<\/td><td>Not recorded/);
});

test('does not publish the false claim that marijuana rescheduling took effect on April 28, 2026', () => {
  const cannabis = fs.readFileSync(path.join(process.cwd(), 'content/monitors/cannabis-rescheduling.json'), 'utf8');

  assert.doesNotMatch(cannabis, /Partial rescheduling to Schedule III effective Apr 28, 2026/);
  assert.doesNotMatch(cannabis, /Only a partial move has taken effect/);
  assert.match(cannabis, /No broad move to Schedule III has taken effect/);
});

test('keeps time-sensitive AI law and monitor status claims procedurally exact', () => {
  const contentRoot = path.join(process.cwd(), 'content');
  const files = [];
  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const target = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(target);
      else if (entry.name.endsWith('.json')) files.push(target);
    }
  };
  walk(contentRoot);
  const corpus = files.map((file) => fs.readFileSync(file, 'utf8')).join('\n');

  assert.doesNotMatch(corpus, /full application Aug 2, 2026/);
  assert.doesNotMatch(corpus, /wider body of deployed work/);
  assert.doesNotMatch(corpus, /tracks the federal rescheduling process this tool describes, as it moves/);
  assert.match(corpus, /AI Omnibus moved major high-risk-system obligations to December 2, 2027/);
  assert.match(corpus, /public demonstrations remain dated snapshots/);
});

test('keeps public credential language exact and free of superseded claims', () => {
  const contentRoot = path.join(process.cwd(), 'content');
  const files = [];
  const collect = (directory) => {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const absolute = path.join(directory, entry.name);
      if (entry.isDirectory()) collect(absolute);
      else if (entry.name.endsWith('.json')) files.push(absolute);
    }
  };
  collect(contentRoot);
  const corpus = files.map((file) => fs.readFileSync(file, 'utf8')).join('\n');

  assert.doesNotMatch(corpus, /Am Law firm/i);
  assert.doesNotMatch(corpus, /systemsTailored/i);
  assert.doesNotMatch(corpus, /seven active legal positions/i);
  assert.doesNotMatch(corpus, /40\+ deployed AI tools/i);
  assert.doesNotMatch(corpus, /35\+ builds shipped/i);
  assert.doesNotMatch(corpus, /40\+ articles/i);
  assert.doesNotMatch(corpus, /4 articles in the Journal of Biophilic Design/i);
  assert.doesNotMatch(corpus, /practicing law student/i);
});

test('does not represent dated demonstrations as continuously connected or overstate browser-local privacy', () => {
  const contentRoot = path.join(process.cwd(), 'content');
  const files = [];
  const collect = (directory) => {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const absolute = path.join(directory, entry.name);
      if (entry.isDirectory()) collect(absolute);
      else if (entry.name.endsWith('.json')) files.push(absolute);
    }
  };
  collect(contentRoot);
  const corpus = files.map((file) => fs.readFileSync(file, 'utf8')).join('\n');

  assert.doesNotMatch(corpus, /a live monitor runs it daily/i);
  assert.doesNotMatch(corpus, /interactive tools run entirely in your browser and send nothing anywhere/i);
  assert.doesNotMatch(corpus, /nothing there identifies you/i);
  assert.match(corpus, /public records do not run a continuous daily feed/i);
  assert.match(corpus, /optional external connection is identified on its page/i);
});

test('citation verifier does not claim unimplemented live checks or misattribute Rule 11 duties', () => {
  const citation = JSON.parse(fs.readFileSync(new URL('../content/tools/citation-verifier.json', import.meta.url)));
  const operational = JSON.parse(fs.readFileSync(new URL('../content/tools/operational-tools.json', import.meta.url)));
  const regulatory = JSON.parse(fs.readFileSync(new URL('../content/products/regulatory-intelligence.json', import.meta.url)));
  const corpus = JSON.stringify([citation, operational, regulatory]);

  assert.doesNotMatch(corpus, /live existence check.*one click away/i);
  assert.doesNotMatch(corpus, /optional live check queries CourtListener/i);
  assert.doesNotMatch(corpus, /download the machine-readable audit record this tool emits/i);
  assert.doesNotMatch(corpus, /ABA(?:-512| Formal Opinion 512).*duty to verify.*non-delegable/i);
  assert.doesNotMatch(corpus, /more than 1,590 cases|roughly ten a day/i);
  assert.match(corpus, /Rule 11.*reasonable (?:pre-filing )?inquiry/i);
  assert.match(corpus, /public page does not query CourtListener/i);
});

test('privacy lesson does not publish false universal vendor-retention rules', () => {
  const foundations = JSON.parse(fs.readFileSync(new URL('../content/university/lessons/foundations.json', import.meta.url)));
  const privacy = foundations.find((resource) => resource.id === 'privacy-and-confidentiality-lesson');
  const corpus = JSON.stringify(privacy);

  assert.doesNotMatch(corpus, /Paid tiers reduce risk/i);
  assert.doesNotMatch(corpus, /Retention also drops as you move up/i);
  assert.doesNotMatch(corpus, /Admin controls retention; deleted conversations removed within ~30 days/i);
  assert.doesNotMatch(corpus, /30 days when training is off; up to 5 years when on/i);
  assert.match(corpus, /It does not support one universal retention number for an entire vendor/i);
  assert.match(corpus, /Microsoft 365 Copilot.*Purview retention and eDiscovery/i);
  assert.match(corpus, /Gemini in Google Workspace.*administrator-selected retention/i);
});

test('keeps one current commercial pricing architecture and avoids volatile vendor prices', () => {
  const contentRoot = path.join(process.cwd(), 'content');
  const files = [];
  const collect = (directory) => {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const absolute = path.join(directory, entry.name);
      if (entry.isDirectory()) collect(absolute);
      else if (entry.name.endsWith('.json')) files.push(absolute);
    }
  };
  collect(contentRoot);
  const corpus = files.map((file) => fs.readFileSync(file, 'utf8')).join('\n');

  assert.doesNotMatch(corpus, /\$1,000 per workflow|\$200\/hr/i);
  assert.doesNotMatch(corpus, /\$500[–-]1,500\/mo|\$1,500\/mo/i);
  assert.doesNotMatch(corpus, /\$(?:79|97|127|149|197|297)(?!\d)/);
  assert.doesNotMatch(corpus, /(?:ChatGPT|Claude|Gemini|Notion|Zapier|Fathom|Otter|Fireflies|Perplexity|Elicit|Apollo|Sales Navigator)[^"\n]{0,160}\$\d/i);
  assert.match(corpus, /Systems Audit at \$1,500–\$2,500/);
  assert.match(corpus, /Working System from \$5,000/);
  assert.match(corpus, /ongoing leadership from \$4,000 per month/);
});
