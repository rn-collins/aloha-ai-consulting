import { sectionDescriptors } from './template-registry.js';
import { metadataDescription, metadataTitle } from './metadata.js';

const BASE_URL = 'https://aloha-ai-consulting.vercel.app';
const NAMED_RESOURCE_LINKS = Object.freeze({
  'Cannabis Rescheduling Monitor': '/monitors/cannabis-rescheduling',
  'Psychedelic Reg Radar': '/monitors/psychedelic-radar',
  'Legal AI Workflow Teardown': '/teardowns/legal-ai-workflow',
  'Citation Verifier': '/tools/citation-verifier',
  'Brand-Perception Intelligence': '/intelligence/brand-perception',
  'Agentic Brand Management': '/monitors/agentic-brand-management',
  'AI Creative Production Intelligence': '/monitors/ai-creative-production',
  'Biophilic Design Intelligence': '/monitors/biophilic-neuroarch',
  'Content Suppression Audit': '/monitors/suppression-audit',
  'Luxury Brand Protection': '/monitors/luxury-ip',
  'AI-Readiness Scorecard': '/tools/ai-readiness-scorecard',
  'Biopharma Regulatory Intelligence': '/monitors/biopharma-regulatory-intelligence',
  'Market & Competitive Intelligence': '/monitors/market-intel',
  'Arts & Cultural Intelligence': '/monitors/arts-culture',
  'Creator Content System': '/systems/creator-content',
  'Private-AI & Data-Retention Risk': '/monitors/private-ai-risk',
  'AI Practice-Readiness Scorecard': '/tools/practice-readiness',
  'Is Your AI Twin Legally Exposed?': '/twins/exposure-check',
  'Trust-Safe Twins': '/twins',
  'The Regulated Trust Stack': '/trust-stack',
  'Where Is Your Trust Stack Leaking?': '/trust-stack/leak-check',
  'Aloha AI University': '/university'
});
const EXTERNAL_TOOL_LINKS = Object.freeze({
  'Microsoft 365 Copilot': 'https://www.microsoft.com/microsoft-365-copilot',
  'Google Workspace with Gemini': 'https://workspace.google.com/solutions/ai/',
  'Gemini in Google Workspace': 'https://workspace.google.com/solutions/ai/',
  'Claude for Work': 'https://www.anthropic.com/enterprise',
  'ChatGPT Business': 'https://openai.com/business/chatgpt-pricing/',
  'ChatGPT Enterprise': 'https://openai.com/chatgpt/enterprise/',
  'ChatGPT Team': 'https://openai.com/business/chatgpt-pricing/',
  'NotebookLM Enterprise': 'https://workspace.google.com/products/notebooklm/',
  'QuickBooks AI': 'https://quickbooks.intuit.com/ai-accounting/',
  'Repurpose.io': 'https://repurpose.io/',
  'Opus Clip': 'https://www.opus.pro/',
  'Make instead of Zapier': 'https://www.make.com/',
  'Zapier or Make': 'https://www.make.com/',
  'Zapier, Make': 'https://www.make.com/',
  'Google Sheets': 'https://workspace.google.com/products/sheets/',
  'Google Docs': 'https://workspace.google.com/products/docs/',
  'Notion AI': 'https://www.notion.com/product/ai',
  'Claude Pro': 'https://www.anthropic.com/pricing',
  'ChatGPT Plus': 'https://openai.com/chatgpt/pricing/',
  'Claude Team': 'https://www.anthropic.com/pricing',
  'Elicit': 'https://elicit.com/',
  'Consensus': 'https://consensus.app/',
  'Perplexity': 'https://www.perplexity.ai/',
  'ChatGPT': 'https://chatgpt.com/',
  'Claude': 'https://claude.ai/',
  'Gemini': 'https://gemini.google.com/',
  'Copilot': 'https://copilot.microsoft.com/',
  'Descript': 'https://www.descript.com/',
  'Fireflies': 'https://fireflies.ai/',
  'Fathom': 'https://fathom.video/',
  'Granola': 'https://www.granola.ai/',
  'Otter': 'https://otter.ai/',
  'Zapier': 'https://zapier.com/',
  'Airtable': 'https://www.airtable.com/',
  'Notion': 'https://www.notion.com/',
  'Loom': 'https://www.loom.com/',
  'Scribe': 'https://scribehow.com/',
  'Tango': 'https://www.tango.us/',
  'Canva': 'https://www.canva.com/',
  'Slack': 'https://slack.com/',
  'Westlaw': 'https://legal.thomsonreuters.com/en/products/westlaw',
  'LexisNexis': 'https://www.lexisnexis.com/'
});

export function renderStructuredPage({ resource, registry }) {
  const related = resolveRelated(resource, registry);
  const isStacksIndex = resource.pathname === '/stacks';
  const isEditorialDetail = resource.pathname.startsWith('/notes/') || resource.pathname.startsWith('/monitors/');
  const isMethodsDetail = resource.pathname === '/methods';
  const isInteractiveDetail = ['tool', 'assessment'].includes(resource.kind);
  const isServiceDetail = resource.kind === 'service' && resource.pathname !== '/services';
  const isResearchDetail = resource.kind === 'research' && resource.pathname !== '/research' && !isEditorialDetail;
  const isProductGovernanceDetail = !['/', '/about'].includes(resource.pathname) && ['product', 'institutional', 'policy'].includes(resource.kind);
  const isUniversityDetail = ['lesson', 'course', 'playbook', 'template', 'toolGuide', 'useCase'].includes(resource.kind);
  const isUniversityServiceDetail = resource.kind === 'service' && resource.pathname.startsWith('/university/services/');
  const isConsultingServiceDetail = isServiceDetail && !resource.demo && !resource.assessment;
  const isUniversityInstitutional = ['/university/about', '/university/start-here', '/university/services'].includes(resource.pathname);
  const isResourceDetail = isEditorialDetail || isMethodsDetail || isInteractiveDetail || isConsultingServiceDetail || isProductGovernanceDetail || isUniversityDetail || isUniversityServiceDetail || isUniversityInstitutional;
  const usesDetailHero = isResourceDetail || isServiceDetail || isResearchDetail || resource.pathname === '/about';
  const schema = JSON.stringify(buildSchema(resource));
  const searchTitle = metadataTitle(resource.seoTitle || resource.title, ' | Aloha AI');
  const searchDescription = metadataDescription(resource.metaDescription || resource.summary);
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(searchTitle)}</title>
<meta name="description" content="${escapeHtml(searchDescription)}">
<link rel="canonical" href="${BASE_URL}${resource.pathname}">
<meta name="theme-color" content="#0A0A0B">
<meta property="og:type" content="website">
<meta property="og:title" content="${escapeHtml(searchTitle)}">
<meta property="og:description" content="${escapeHtml(searchDescription)}">
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
<body class="${resource.pathname === '/' ? 'is-home' : resource.pathname === '/services' ? 'is-services' : resource.pathname === '/builds' ? 'is-builds' : resource.pathname === '/university' ? 'is-university' : resource.pathname === '/university/contact' ? 'is-contact' : isStacksIndex ? 'is-stacks-index' : usesDetailHero ? `is-resource-detail is-${resource.kind}-detail` : ''}" data-resource-id="${escapeHtml(resource.id)}" data-resource-kind="${escapeHtml(resource.kind)}" data-maturity="${escapeHtml(resource.maturity)}">
<a class="skip" href="#main">Skip to content</a>
<header class="nav"></header>
<main id="main">
${isStacksIndex ? '' : hero(resource)}
${isStacksIndex ? stacksIndexExperience(resource, registry) : ''}
${isEditorialDetail || isMethodsDetail ? resourceDetailExperience(resource, related, registry) : ''}
${isInteractiveDetail ? interactiveDetailExperience(resource, related, registry) : ''}
${isProductGovernanceDetail ? productGovernanceDetailExperience(resource, related, registry) : ''}
${isUniversityDetail ? universityDetailExperience(resource, related, registry) : ''}
${engagementPortfolio(resource)}
${isConsultingServiceDetail ? universityServiceDetailExperience(resource, related, registry) : ''}
${isUniversityInstitutional ? universityInstitutionalExperience(resource, related, registry) : ''}
${servicesExperience(resource)}
${buildsExperience(resource, registry)}
${universityExperience(resource)}
${contactExperience(resource)}
${['/builds', '/university', '/stacks'].includes(resource.pathname) ? '' : priorityCollection(resource, registry)}
${isResourceDetail || ['/', '/services', '/builds', '/university', '/university/contact', '/methods', '/about', '/stacks'].includes(resource.pathname) ? '' : identity(resource)}
${isResourceDetail || isStacksIndex ? '' : prioritySections(resource)}
${isResourceDetail || isStacksIndex ? '' : resource.pathname === '/services' ? servicesDepth(resource) : resource.pathname === '/builds' ? buildsDepth(resource) : resource.pathname === '/university' ? universityDepth(resource) : resource.pathname === '/university/contact' ? '' : editorial(resource)}
${isResourceDetail || ['/', '/university/contact', '/stacks'].includes(resource.pathname) ? '' : kindSections(resource, registry)}
${isResourceDetail || ['/', '/university/contact', '/stacks'].includes(resource.pathname) ? '' : evidence(resource)}
${isResourceDetail || ['/', '/university/contact', '/stacks'].includes(resource.pathname) ? '' : method(resource)}
${isResourceDetail || ['/', '/university/contact', '/stacks'].includes(resource.pathname) ? '' : governance(resource)}
${isResourceDetail || ['/', '/builds', '/university', '/university/contact', '/stacks'].includes(resource.pathname) ? '' : relatedSections(related)}
${isConsultingServiceDetail || ['/', '/university/contact', '/stacks'].includes(resource.pathname) ? '' : cta(resource)}
</main>
<footer class="footer"></footer>
<script defer src="/_vercel/speed-insights/script.js"></script>
<script src="/site-shell.js" defer></script>
</body>
</html>`;
}

function stacksIndexExperience(r, registry) {
  const contract = r.collection || {};
  const prefix = contract.pathPrefix || '/stacks/';
  const kinds = new Set(contract.kinds || ['useCase']);
  const items = [...registry.values()]
    .filter((item) => item.id !== r.id && item.pathname.startsWith(prefix) && (!kinds.size || kinds.has(item.kind)))
    .sort((a, b) => a.title.localeCompare(b.title));
  const cards = items.map((item, index) => `<a class="stack-path stack-path--${(index % 5) + 1}" href="${escapeHtml(item.pathname)}">
<span class="stack-path__number">${String(index + 1).padStart(2, '0')}</span>
<span class="stack-path__status">${escapeHtml(maturityLabel(item.maturity))}</span>
<strong>${escapeHtml(item.title)}</strong>
<p>${escapeHtml(item.summary)}</p>
<span class="stack-path__action">Open the complete stack <i aria-hidden="true">↗</i></span>
</a>`).join('');
  return `<section class="stacks-cover"><div class="wrap wrap--wide stacks-cover__grid">
<div><p class="eyebrow">Discovery lens · Applied systems</p><p class="stacks-cover__count">${String(items.length).padStart(2, '0')} complete blueprints</p><h1>See how the layers work together.</h1><p class="lead">${escapeHtml(r.summary)}</p><a class="btn btn--primary" href="#stack-index">Choose your kind of work <span aria-hidden="true">↓</span></a></div>
<aside><span>A STACK IS NOT A SHOPPING LIST</span><p>It separates six jobs: find facts, hold knowledge, produce work, verify outputs, govern decisions, and run the system. Each blueprint names the human gates and links the real Aloha AI resources it uses.</p></aside>
</div></section>
<section class="stack-index" id="stack-index"><div class="wrap wrap--wide"><div class="stack-index__head"><div><p class="eyebrow">Applied AI stacks</p><h2>Start with the work.<br>Then inspect every layer.</h2></div><p>Choose the closest operating context. These are blueprints, not promises that one fixed configuration fits every organization.</p></div><div class="stack-paths">${cards}</div></div></section>
<section class="stack-method"><div class="wrap wrap--wide"><div><p class="eyebrow">The six jobs</p><h2>One system.<br>Different responsibilities.</h2></div><ol><li><span>01</span>Find the facts</li><li><span>02</span>Hold the knowledge</li><li><span>03</span>Do the work</li><li><span>04</span>Check the output</li><li><span>05</span>Govern decisions</li><li><span>06</span>Run it every day</li></ol></div></section>
<section class="discovery-switch"><div class="wrap wrap--wide"><p><strong>Need a different way in?</strong><span>Browse by subject, audience, industry, or readiness instead.</span></p><nav aria-label="Other discovery lenses"><a href="/topics">Topics <i aria-hidden="true">↗</i></a><a href="/audiences">Audiences <i aria-hidden="true">↗</i></a><a href="/industries">Industries <i aria-hidden="true">↗</i></a><a href="/maturity">Maturity <i aria-hidden="true">↗</i></a><span aria-current="page">Stacks</span></nav></div></section>`;
}

function universityExperience(r) {
  const experience = r.universityExperience;
  if (r.pathname !== '/university' || !experience) return '';
  const goals = (experience.goals || []).map((item, index) => `<a class="university-goal university-goal--${(index % 6) + 1}" href="${escapeHtml(item.href)}">
<span class="university-goal__top"><span>${String(index + 1).padStart(2, '0')}</span><span>${escapeHtml(item.time)}</span></span>
<strong>${escapeHtml(item.title)}</strong>
<span class="university-goal__plain">${escapeHtml(item.plain)}</span>
<span class="university-goal__action">${escapeHtml(item.action)} <i aria-hidden="true">↗</i></span>
</a>`).join('');
  const steps = (experience.firstPath || []).map((item, index) => `<a class="university-step" href="${escapeHtml(item.href)}">
<span class="university-step__number">${String(index + 1).padStart(2, '0')}</span>
<span><small>${escapeHtml(item.time)} · ${escapeHtml(item.level)}</small><strong>${escapeHtml(item.title)}</strong><span>${escapeHtml(item.plain)}</span></span>
<i aria-hidden="true">↗</i>
</a>`).join('');
  const shelves = (experience.shelves || []).map((item, index) => `<a class="university-shelf university-shelf--${(index % 5) + 1}" href="${escapeHtml(item.href)}">
<span>${escapeHtml(item.label)}</span><strong>${escapeHtml(item.title)}</strong><p>${escapeHtml(item.plain)}</p><b>${escapeHtml(item.action)} ↗</b>
</a>`).join('');
  return `<section class="university-goals" id="choose-a-path"><div class="wrap wrap--wide">
<div class="university-goals__head"><div><p class="eyebrow">Choose what you want to do</p><h2>Start with a goal.<br>Not a syllabus.</h2></div><p>${escapeHtml(experience.intro)}</p></div>
<div class="university-goals__grid">${goals}</div>
</div></section>
<section class="university-first"><div class="wrap wrap--wide">
<div class="university-first__head"><div><p class="eyebrow">New here?</p><h2>Your first 30 minutes.</h2></div><p>${escapeHtml(experience.firstPathIntro)}</p></div>
<div class="university-first__steps">${steps}</div>
<p class="university-first__promise"><b>$0 · no signup · no email gate</b><span>Open a lesson and begin. Your curiosity is enough.</span></p>
</div></section>
<section class="university-library"><div class="wrap wrap--wide">
<div class="university-library__head"><div><p class="eyebrow">The whole library</p><h2>Browse your way.</h2></div><p>Lessons explain. Playbooks walk beside you. Templates give you a head start. Courses help you build something complete.</p></div>
<div class="university-library__grid">${shelves}</div>
</div></section>`;
}

function contactExperience(r) {
  const experience = r.contactExperience;
  if (r.pathname !== '/university/contact' || !experience) return '';
  const paths = (experience.paths || []).map((item, index) => `<a class="contact-path contact-path--${index + 1}" href="${escapeHtml(item.href)}">
<span class="contact-path__top"><span>${String(index + 1).padStart(2, '0')}</span><span>${escapeHtml(item.label)}</span></span>
<strong>${escapeHtml(item.title)}</strong>
<span class="contact-path__plain">${escapeHtml(item.plain)}</span>
<span class="contact-path__action">${escapeHtml(item.action)} <i aria-hidden="true">↗</i></span>
<small>${escapeHtml(item.note)}</small>
</a>`).join('');
  const prompts = (experience.prompts || []).map((item, index) => `<article class="contact-prompt">
<span>${String(index + 1).padStart(2, '0')}</span><div><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.plain)}</p></div>
</article>`).join('');
  const nextSteps = (experience.nextSteps || []).map((item, index) => `<article class="contact-next__step">
<span>${String(index + 1).padStart(2, '0')}</span><div><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.plain)}</p></div>
</article>`).join('');
  return `<section class="contact-choose" id="choose-contact"><div class="wrap wrap--wide">
<div class="contact-choose__head"><div><p class="eyebrow">Choose what feels easiest</p><h2>Talk. Write.<br>Or look around first.</h2></div><p>${escapeHtml(experience.intro)}</p></div>
<div class="contact-paths">${paths}</div>
</div></section>
<section class="contact-note"><div class="wrap wrap--wide">
<div class="contact-note__head"><div><p class="eyebrow">What should I say?</p><h2>Three rough answers.<br>That is enough.</h2></div><p>No proposal. No jargon. No long intake form. Put these answers in the booking note or email.</p></div>
<div class="contact-prompts">${prompts}</div>
<a class="contact-note__email" href="${escapeHtml(r.actions?.[1]?.href || 'mailto:collins.ra@northeastern.edu')}"><span>Copy the three questions into an email</span><span aria-hidden="true">↗</span></a>
</div></section>
<section class="contact-next"><div class="wrap wrap--wide">
<div class="contact-next__head"><div><p class="eyebrow">What happens next?</p><h2>No mystery.<br>No sales maze.</h2></div><p>The first exchange is a fit check, not a commitment.</p></div>
<div class="contact-next__steps">${nextSteps}</div>
<div class="contact-boundary"><p><b>Your information</b><span>Contact details are used to reply to you—not added to a marketing list. Booking information is handled through Microsoft Bookings.</span></p><p><b>Professional boundary</b><span>RN Collins is a JD candidate, not a licensed attorney. Contact does not create an attorney–client or other professional-client relationship.</span></p></div>
</div></section>`;
}

function buildsExperience(r, registry) {
  const experience = r.buildsExperience;
  if (r.pathname !== '/builds' || !experience) return '';
  const filters = [
    ['all', 'Everything'],
    ['check', 'Check & decide'],
    ['track', 'Track change'],
    ['learn', 'Learn & train'],
    ['run', 'Run the work']
  ];
  const cards = (experience.items || []).map((entry, index) => {
    const item = registry.get(entry.resourceId);
    if (!item) return '';
    return `<a class="build-card build-card--${(index % 5) + 1}" href="${escapeHtml(item.pathname)}" data-build-family="${escapeHtml(entry.family)}">
<span class="build-card__top"><span class="build-card__number">${String(index + 1).padStart(2, '0')}</span><span class="build-card__status build-card__status--${escapeHtml(item.maturity.toLowerCase())}">${escapeHtml(maturityLabel(item.maturity))}</span></span>
<span class="build-card__family">${escapeHtml(entry.familyLabel)}</span>
<strong>${escapeHtml(entry.title)}</strong>
<span class="build-card__plain">${escapeHtml(entry.plain)}</span>
<span class="build-card__result"><b>What you can do</b>${escapeHtml(entry.result)}</span>
<span class="build-card__action">${escapeHtml(entry.action || 'Open it')} <i aria-hidden="true">↗</i></span>
</a>`;
  }).join('');
  return `<section class="build-wall" id="build-wall"><div class="wrap wrap--wide">
<div class="build-wall__head"><div><p class="eyebrow">The proof wall</p><h2>Pick one.<br>Try the thinking.</h2></div><p>${escapeHtml(experience.intro)}</p></div>
<div class="build-filters" aria-label="Filter the proof wall">${filters.map(([value, label], index) => `<button class="build-filter${index === 0 ? ' is-active' : ''}" type="button" data-build-filter="${value}" aria-pressed="${index === 0 ? 'true' : 'false'}">${label}</button>`).join('')}</div>
<div class="build-grid">${cards}</div>
<p class="build-wall__empty" hidden>No builds match this view yet.</p>
</div></section>
<section class="build-status-key"><div class="wrap wrap--wide"><div><p class="eyebrow">Read the label first</p><h2>Built does not always mean finished.</h2></div><div class="build-status-key__items"><p><b>Production</b><span>The public resource performs its stated job now.</span></p><p><b>Public beta</b><span>You can inspect or use it now; parts may still change.</span></p><p><b>Research-stage</b><span>It shows the method or direction, not a finished product.</span></p></div></div></section>
<script>(function(){var buttons=[].slice.call(document.querySelectorAll('[data-build-filter]')),cards=[].slice.call(document.querySelectorAll('[data-build-family]')),empty=document.querySelector('.build-wall__empty');if(!buttons.length||!cards.length)return;buttons.forEach(function(button){button.addEventListener('click',function(){var filter=button.getAttribute('data-build-filter'),visible=0;buttons.forEach(function(item){var on=item===button;item.classList.toggle('is-active',on);item.setAttribute('aria-pressed',on?'true':'false');});cards.forEach(function(card){var show=filter==='all'||card.getAttribute('data-build-family')===filter;card.hidden=!show;if(show)visible++;});if(empty)empty.hidden=visible!==0;});});})();</script>`;
}

function servicesExperience(r) {
  const experience = r.servicesExperience;
  if (r.pathname !== '/services' || !experience) return '';
  const problems = (experience.problems || []).map((item, index) => `<a class="service-problem service-problem--${(index % 6) + 1}" href="${escapeHtml(item.href)}">
<span class="service-problem__top"><span class="service-problem__number">${String(index + 1).padStart(2, '0')}</span><span class="service-problem__signal">${escapeHtml(item.signal)}</span></span>
<span class="service-problem__content"><span class="mini">Does this sound familiar?</span><strong>${escapeHtml(item.title)}</strong><span class="service-problem__outcome"><b>What changes</b>${escapeHtml(item.outcome)}</span></span>
<span class="service-problem__action">${escapeHtml(item.linkLabel)} <i aria-hidden="true">↗</i></span>
</a>`).join('');
  const engagements = (experience.engagements || []).map((item, index) => `<article class="engagement-path engagement-path--${index + 1}">
<span class="engagement-path__step">${escapeHtml(item.step)}</span>
<div><p class="mini">Your next useful step</p><h3>${escapeHtml(item.title)}</h3><p><strong>Choose this when:</strong> ${escapeHtml(item.fit)}</p><p class="muted"><strong>What RN does:</strong> ${escapeHtml(item.detail)}</p></div>
<p class="engagement-path__investment">${escapeHtml(item.investment)}</p>
</article>`).join('');
  return `<section class="service-finder" id="choose-problem"><div class="wrap wrap--wide">
<div class="service-finder__head"><div><p class="eyebrow">Pick your problem</p><h2>What keeps getting stuck?</h2></div><p>${escapeHtml(experience.intro)}</p></div>
<div class="service-problems">${problems}</div>
</div></section>
<section class="engagement-paths" id="engagement-paths"><div class="wrap wrap--wide">
<div class="engagement-paths__head"><p class="eyebrow">Choose your starting point</p><h2>Start small. Build only what proves useful.</h2><p>You do not have to buy a giant transformation. Begin with the next useful step, see what the work reveals, and expand only when it makes sense.</p></div>
<div class="engagement-paths__list">${engagements}</div>
<div class="engagement-paths__action"><a class="btn btn--primary" href="/university/contact"><span>Tell RN what is stuck</span><span aria-hidden="true">↗</span></a><a class="btn btn--outline" href="/engagements">See how engagements work</a></div>
</div></section>`;
}

function hero(r) {
  const isCollection = r.kind === 'collection';
  const isHome = r.pathname === '/';
  const isServices = r.pathname === '/services';
  const isBuilds = r.pathname === '/builds';
  const isUniversity = r.pathname === '/university';
  const isContact = r.pathname === '/university/contact';
  const isAbout = r.pathname === '/about';
  const isEditorialDetail = r.pathname.startsWith('/notes/') || r.pathname.startsWith('/monitors/');
  const isMethodsDetail = r.pathname === '/methods';
  const isInteractiveDetail = ['tool', 'assessment'].includes(r.kind);
  const isServiceDetail = r.kind === 'service' && r.pathname !== '/services';
  const isResearchDetail = r.kind === 'research' && r.pathname !== '/research' && !isEditorialDetail;
  const isProductGovernanceDetail = !['/', '/about'].includes(r.pathname) && ['product', 'institutional', 'policy'].includes(r.kind);
  const isUniversityDetail = ['lesson', 'course', 'playbook', 'template', 'toolGuide', 'useCase'].includes(r.kind);
  const isUniversityServiceDetail = r.kind === 'service' && r.pathname.startsWith('/university/services/');
  const isUniversityInstitutional = ['/university/about', '/university/start-here', '/university/services'].includes(r.pathname);
  const isResourceDetail = isAbout || isEditorialDetail || isMethodsDetail || isInteractiveDetail || isServiceDetail || isResearchDetail || isProductGovernanceDetail || isUniversityDetail || isUniversityServiceDetail || isUniversityInstitutional;
  const hasInteractiveWorkspace = r.kind === 'assessment' ? Boolean(r.assessment) : Boolean(r.demo);
  const actions = Array.isArray(r.actions) && r.actions.length
    ? r.actions.map((action, index) => `<a class="btn ${index === 0 ? 'btn--primary' : 'btn--ghost'}" href="${escapeHtml(action.href)}"><span>${escapeHtml(action.label)}</span><span aria-hidden="true">↗</span></a>`).join('')
    : isInteractiveDetail && hasInteractiveWorkspace
      ? `<a class="btn btn--primary" href="#interactive-workspace">${r.kind === 'assessment' ? 'Start the assessment' : 'Open the tool'}</a><a class="btn btn--ghost" href="#detail-record">Read its boundaries</a>`
      : isInteractiveDetail
        ? '<a class="btn btn--primary" href="#detail-record">Inspect the public record</a><a class="btn btn--ghost" href="/tools">Browse usable tools</a>'
      : isServiceDetail && !r.demo && !r.assessment
        ? `<a class="btn btn--primary" href="#service-brief">See the engagement</a><a class="btn btn--ghost" href="${r.pathname.startsWith('/university/services/') ? '/university/services' : '/services'}">Compare services</a>`
      : isResearchDetail
        ? '<a class="btn btn--primary" href="#details">Read the research record</a><a class="btn btn--ghost" href="/research">Browse the collection</a>'
      : isEditorialDetail || isMethodsDetail
      ? `<a class="btn btn--primary" href="#detail-record">${r.kind === 'monitor' ? 'Open the signal record' : isMethodsDetail ? 'Inspect the method' : 'Read the research record'}</a><a class="btn btn--ghost" href="${r.kind === 'monitor' ? '/monitors' : isMethodsDetail ? '/governance' : '/research'}">${isMethodsDetail ? 'Browse governance' : 'Browse the collection'}</a>`
      : isProductGovernanceDetail
        ? `<a class="btn btn--primary" href="#detail-record">${r.kind === 'product' ? 'Inspect the system' : r.kind === 'policy' ? 'Read the policy' : 'Open the record'}</a><a class="btn btn--ghost" href="${r.kind === 'product' ? '/products' : '/governance'}">Browse ${r.kind === 'product' ? 'products' : 'governance'}</a>`
      : isUniversityDetail
        ? `<a class="btn btn--primary" href="#learning-record">${r.kind === 'lesson' ? 'Start the lesson' : r.kind === 'course' ? 'Open the course' : r.kind === 'playbook' ? 'Open the playbook' : r.kind === 'template' ? 'Open the template' : r.kind === 'useCase' ? 'Open the workflow' : 'Open the guide'}</a><a class="btn btn--ghost" href="${r.kind === 'lesson' ? '/university/learn' : r.kind === 'course' ? '/university/courses' : r.kind === 'playbook' ? '/university/playbooks' : r.kind === 'template' ? '/university/templates' : r.kind === 'useCase' ? '/university/use-cases' : '/university/tools'}">Browse ${r.kind === 'toolGuide' ? 'tool guides' : r.kind === 'useCase' ? 'use cases' : `${r.kind}s`}</a>`
      : isUniversityServiceDetail
        ? '<a class="btn btn--primary" href="#service-brief">See the engagement</a><a class="btn btn--ghost" href="/university/services">Compare services</a>'
      : isUniversityInstitutional
        ? '<a class="btn btn--primary" href="#institutional-record">Open the guide</a><a class="btn btn--ghost" href="/university">Back to University</a>'
      : isAbout
        ? '<a class="btn btn--primary" href="#about-record">Inspect the record</a><a class="btn btn--ghost" href="/engagements">Choose an engagement</a>'
        : '<a class="btn btn--primary" href="#details">Inspect the system</a><a class="btn btn--ghost" href="/engagements">Choose an engagement</a>';
  const visual = isHome ? `<div class="home-cover" aria-hidden="true">
<div class="home-cover__stamp">Built for<br><strong>real life</strong></div>
<p class="home-cover__kicker">The system beneath the answer</p>
<div class="home-cover__headline"><span>Research</span><span>Rules</span><span>People</span><span>AI</span></div>
<div class="home-cover__mix"><span>01 · Find the signal</span><span>02 · Make the logic visible</span><span>03 · Build something usable</span></div>
<div class="home-cover__sticker">Human stays<br>accountable ↗</div>
</div>` : isServices ? `<div class="service-hero-map" aria-label="Aloha AI turns stuck work into a clear system">
<p class="service-hero-map__issue">Issue 01 · Services</p>
<div class="service-hero-map__headline"><span>Find the</span><strong>STUCK</strong><span>part.</span></div>
<div cl…19904 tokens truncated…onversation';
  const secondaryHref = isContact ? r.actions?.[1]?.href || '/methods' : '/methods';
  const secondaryLabel = isContact ? r.actions?.[1]?.label || 'Inspect the methods' : 'Inspect the methods';
  return `<section class="section page-cta"><div class="wrap page-cta__inner"><div><p class="eyebrow">Next step</p><h2 class="h2">${title}</h2></div><div class="page-actions"><a class="btn btn--primary" href="${escapeHtml(primaryHref)}">${escapeHtml(primaryLabel)}</a><a class="btn btn--outline" href="${escapeHtml(secondaryHref)}">${escapeHtml(secondaryLabel)}</a></div></div></section>`;
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
  const groups = { 'Related Services': [], 'Related Tools': [], 'Related Research': [], 'Related University Lessons': [], 'Related Builds': [], 'Related Products': [], 'Related Governance': [] };
  for (const { resource: item } of items) {
    if (item.kind === 'service') groups['Related Services'].push(item);
    else if (['tool', 'monitor', 'assessment'].includes(item.kind)) groups['Related Tools'].push(item);
    else if (item.kind === 'research') groups['Related Research'].push(item);
    else if (['learningHub', 'course', 'lesson', 'playbook', 'template', 'toolGuide', 'useCase', 'collection'].includes(item.kind)) groups['Related University Lessons'].push(item);
    else if (item.kind === 'build') groups['Related Builds'].push(item);
    else if (item.kind === 'product') groups['Related Products'].push(item);
    else if (['institutional', 'policy'].includes(item.kind)) groups['Related Governance'].push(item);
  }
  return groups;
}

function label(kind) { return ({ service: 'Service', product: 'Product', learningHub: 'Learning hub', course: 'Course', lesson: 'Lesson', playbook: 'Playbook', template: 'Template', toolGuide: 'Tool guide', useCase: 'Use case', collection: 'Collection', assessment: 'Assessment', tool: 'Tool', monitor: 'Monitor', research: 'Research', build: 'Build', institutional: 'Institutional', policy: 'Policy' })[kind] || 'Resource'; }
function buildSchema(r) { return { '@context': 'https://schema.org', '@type': r.kind === 'service' ? 'Service' : ['learningHub','course','lesson','playbook','template','toolGuide','useCase','collection'].includes(r.kind) ? 'LearningResource' : r.kind === 'policy' ? 'WebPage' : r.kind === 'institutional' && r.pathname === '/about' ? 'AboutPage' : r.kind === 'institutional' ? 'WebPage' : 'CreativeWork', name: r.title, description: r.summary, url: `${BASE_URL}${r.pathname}`, provider: { '@type': 'Organization', name: 'Aloha AI' } }; }
function escapeHtml(value) { return String(value ?? '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#039;'); }
function linkKnownResources(value) {
  const links = Object.entries({ ...NAMED_RESOURCE_LINKS, ...EXTERNAL_TOOL_LINKS }).sort(([a], [b]) => b.length - a.length);
  const byName = new Map(links);
  const pattern = new RegExp(links.map(([name]) => name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|'), 'g');
  return escapeHtml(value).replace(pattern, (name) => `<a href="${escapeHtml(byName.get(name))}">${escapeHtml(name)}</a>`);
}

function resourceLinker(registry, currentId) {
  const linkableKinds = new Set(['tool', 'assessment', 'monitor', 'product', 'course', 'lesson', 'playbook', 'template', 'toolGuide', 'build']);
  const entries = [...registry.values()]
    .filter((item) => item.id !== currentId && linkableKinds.has(item.kind) && item.title?.length >= 5)
    .map((item) => [item.title, item.pathname])
    .sort(([a], [b]) => b.length - a.length);
  return (value) => {
    let html = linkKnownResources(value);
    for (const [name, href] of entries) {
      const escaped = escapeHtml(name);
      if (html.includes(`>${escaped}</a>`)) continue;
      html = html.split(escaped).join(`<a href="${escapeHtml(href)}">${escaped}</a>`);
    }
    return html;
  };
}
