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
  const isPrimaryDoor = (
    (resource.pathname === '/services' && resource.servicesExperience)
    || (resource.pathname === '/builds' && resource.buildsExperience)
    || (resource.pathname === '/methods' && Array.isArray(resource.editorialSections))
    || (resource.pathname === '/university' && resource.universityExperience)
    || (resource.pathname === '/about' && Array.isArray(resource.institutionalSections))
  );
  const isStacksIndex = resource.pathname === '/stacks';
  const isEditorialDetail = resource.pathname.startsWith('/notes/') || resource.pathname.startsWith('/monitors/');
  const isMethodsDetail = resource.pathname === '/methods';
  const isInteractiveDetail = ['tool', 'assessment'].includes(resource.kind);
  const isServiceDetail = resource.kind === 'service' && resource.pathname !== '/services';
  const isResearchDetail = resource.kind === 'research' && resource.pathname !== '/research' && !isEditorialDetail;
  const isProductGovernanceDetail = resource.pathname !== '/' && ['product', 'institutional', 'policy'].includes(resource.kind);
  const isUniversityDetail = ['lesson', 'course', 'playbook', 'template', 'toolGuide', 'useCase'].includes(resource.kind);
  const isConsultingServiceDetail = isServiceDetail && !resource.demo && !resource.assessment;
  const isUniversityInstitutional = ['/university/about', '/university/start-here'].includes(resource.pathname);
  const isResourceDetail = isEditorialDetail || isMethodsDetail || isInteractiveDetail || isConsultingServiceDetail || isProductGovernanceDetail || isUniversityDetail || isUniversityInstitutional;
  const usesDetailHero = isResourceDetail || isServiceDetail || isResearchDetail || resource.pathname === '/about';
  const schema = JSON.stringify(buildSchema(resource));
  const searchTitle = metadataTitle(
    resource.seoTitle || resource.title,
    resource.pathname === '/' && resource.seoTitle?.startsWith('Aloha AI') ? '' : ' | Aloha AI'
  );
  const searchDescription = metadataDescription(resource.metaDescription || resource.summary);
  const page = `<!doctype html>
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
<meta property="og:image" content="${BASE_URL}/og-image.png?v=20260729b">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="Aloha AI — Complex work, made usable. An interdisciplinary AI practice by RN Collins.">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${escapeHtml(searchTitle)}">
<meta name="twitter:description" content="${escapeHtml(searchDescription)}">
<meta name="twitter:image" content="${BASE_URL}/og-image.png?v=20260729b">
<meta name="twitter:image:alt" content="Aloha AI — Complex work, made usable. An interdisciplinary AI practice by RN Collins.">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="stylesheet" href="/aloha-ds.css">
<link rel="stylesheet" href="/site-shell.css">
<link rel="stylesheet" href="/page-system.css">
<link rel="stylesheet" href="/universal-sections.css">
<script type="application/ld+json">${schema}</script>
</head>
<body class="${resource.pathname === '/' ? 'is-home' : resource.pathname === '/services' ? 'is-services' : resource.pathname === '/builds' ? 'is-builds' : resource.pathname === '/university' ? 'is-university' : resource.pathname === '/university/contact' ? 'is-contact' : isStacksIndex ? 'is-stacks-index' : usesDetailHero ? `is-resource-detail is-${resource.kind}-detail` : ''}" data-resource-id="${escapeHtml(resource.id)}" data-resource-kind="${escapeHtml(resource.kind)}" data-release-state="${escapeHtml(governedStatusLabel(resource))}">
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
${isResourceDetail || isPrimaryDoor || ['/', '/university/contact', '/stacks'].includes(resource.pathname) ? '' : kindSections(resource, registry)}
${isResourceDetail || isPrimaryDoor || ['/', '/university/contact', '/stacks'].includes(resource.pathname) ? '' : evidence(resource)}
${isResourceDetail || isPrimaryDoor || ['/', '/university/contact', '/stacks'].includes(resource.pathname) ? '' : method(resource)}
${isResourceDetail || isPrimaryDoor || ['/', '/university/contact', '/stacks'].includes(resource.pathname) ? '' : governance(resource)}
${isResourceDetail || isPrimaryDoor || ['/', '/builds', '/university', '/university/contact', '/stacks'].includes(resource.pathname) ? '' : relatedSections(related)}
${isPrimaryDoor ? primaryDoorClose(resource) : ''}
${isConsultingServiceDetail || isPrimaryDoor || ['/', '/university/contact', '/stacks'].includes(resource.pathname) ? '' : cta(resource)}
</main>
<footer class="footer"></footer>
<script defer src="/_vercel/speed-insights/script.js"></script>
<script src="/browser-actions.js" defer></script>
<script src="/browser-state.js" defer></script>
<script src="/site-shell.js" defer></script>
</body>
</html>`;
  if (resource.pathname === '/university/contact') return page;
  const governedContact = escapeHtml(conversionHref(resource, resource.kind === 'service' ? serviceBranch(resource) : 'not-sure'));
  return page.replaceAll('href="/university/contact"', `href="${governedContact}"`);
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
<span class="stack-path__status">${escapeHtml(governedStatusLabel(item))}</span>
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
  return `<section class="contact-context" aria-labelledby="contact-context-title"><div class="wrap wrap--wide"><p class="eyebrow">Your starting point</p><h2 id="contact-context-title" data-intake-context-title>I am not sure yet.</h2><p data-intake-context-summary>That is fine. Choose the closest inquiry type below; you can change it in the intake.</p></div></section>
<section class="contact-choose" id="choose-contact"><div class="wrap wrap--wide">
<div class="contact-choose__head"><div><p class="eyebrow">Choose what feels easiest</p><h2>Talk. Write.<br>Or look around first.</h2></div><p>${escapeHtml(experience.intro)}</p></div>
<div class="contact-paths">${paths}</div>
</div></section>
<section class="contact-note"><div class="wrap wrap--wide">
<div class="contact-note__head"><div><p class="eyebrow">What should I say?</p><h2>Three rough answers.<br>That is enough.</h2></div><p>No proposal. No jargon. No long intake form. Put these answers in the booking note or email.</p></div>
<div class="contact-prompts">${prompts}</div>
<a class="contact-note__email" href="#contextual-intake"><span>Answer the scoping questions</span><span aria-hidden="true">↓</span></a>
</div></section>
${contextualIntake(r)}
<section class="contact-next"><div class="wrap wrap--wide">
<div class="contact-next__head"><div><p class="eyebrow">What happens next?</p><h2>No mystery.<br>No sales maze.</h2></div><p>The first exchange is a fit check, not a commitment.</p></div>
<div class="contact-next__steps">${nextSteps}</div>
<div class="contact-boundary"><p><b>Your information</b><span>This first intake stays in your browser until you deliberately copy or download it. Do not include client, confidential, privileged, health, security, or other sensitive material. Booking information is handled by Microsoft Bookings.</span></p><p><b>Professional boundary</b><span>RN Collins is a JD candidate, not a licensed attorney. Contact does not create an attorney–client or other professional-client relationship.</span></p></div>
</div></section><script src="/contact-intake.js" defer></script>`;
}

function contextualIntake(r) {
  const branches = [
    ['not-sure', 'I am not sure'], ['audit', 'Systems audit'], ['architecture', 'Architecture'],
    ['build', 'Build or implementation'], ['governance', 'Governance'], ['training', 'Training'],
    ['advisory', 'Advisory or fractional leadership'], ['intelligence', 'Intelligence'],
    ['content-adoption', 'Content or adoption'], ['legal-ai', 'Legal AI'],
    ['partnership', 'Partnership, licensing, or sponsorship']
  ];
  const options = branches.map(([value, label]) => `<option value="${value}">${label}</option>`).join('');
  return `<section class="contextual-intake" id="contextual-intake" aria-labelledby="intake-title"><div class="wrap wrap--wide">
<div class="contextual-intake__head"><div><p class="eyebrow">Context-preserving intake</p><h2 id="intake-title">Make a scoping record.</h2></div><p>This creates a reviewable record in your browser. It is not submitted automatically and does not reserve capacity.</p></div>
<form class="intake-form" data-contextual-intake novalidate>
<input type="hidden" name="source_route"><input type="hidden" name="offer_id"><input type="hidden" name="audience"><input type="hidden" name="industry">
<fieldset><legend>1 · Choose the closest path</legend><label>Inquiry type<select name="inquiry_type" required>${options}</select></label><label>Selected offer or resource<input name="offer_label" readonly value="I am not sure yet"></label></fieldset>
<fieldset><legend>2 · Describe the decision</legend><label class="intake-form__wide">What is the problem?<textarea name="problem" required rows="4" placeholder="Describe the stuck, slow, risky, repetitive, or unclear part. Do not paste sensitive material."></textarea></label><label class="intake-form__wide">What should be different?<textarea name="desired_change" required rows="3" placeholder="Describe the result or decision you need."></textarea></label><label>Organization<input name="organization" autocomplete="organization"></label><label>Accountable decision-maker<input name="decision_maker" placeholder="Role or name"></label></fieldset>
<fieldset><legend>3 · Define the operating context</legend><label>Urgency<select name="urgency"><option value="exploring">Exploring</option><option value="this-quarter">This quarter</option><option value="this-month">This month</option><option value="urgent">Time-sensitive</option></select></label><label>Decision date<input name="decision_date" type="date"></label><label>Relevant systems<input name="systems" placeholder="Names only; no credentials or secrets"></label><label>Data classification<select name="data_classification"><option value="public-or-nonsensitive">Public or nonsensitive only</option><option value="sensitive-exists-not-shared">Sensitive data exists; none shared here</option><option value="unknown">Not sure</option></select></label><label>Jurisdiction<input name="jurisdiction" placeholder="If legal or regulatory context matters"></label><label>Authority to discuss<select name="authority"><option value="authorized">I am authorized</option><option value="confirming">I need to confirm</option><option value="not-sure">Not sure</option></select></label><label>Budget or procurement reality<input name="budget" placeholder="Range, process, grant, or unknown"></label><label>Maintenance need<select name="maintenance"><option value="unknown">Not sure</option><option value="handoff">Handoff after build</option><option value="ongoing">Ongoing ownership needed</option><option value="none">No ongoing maintenance expected</option></select></label></fieldset>
<fieldset><legend>4 · Choose the next step</legend><label>Preferred next step<select name="preferred_next_step"><option value="written-fit-check">Written fit check</option><option value="book-conversation">Book a conversation</option><option value="proposal-after-fit">Proposal after fit is established</option><option value="resource-or-referral">Resource or referral</option></select></label><label>Timing notes<input name="timing" placeholder="Any deadline or procurement timing"></label></fieldset>
<div class="intake-safety" role="note"><strong>Do not upload or paste sensitive documents.</strong><span>First contact is for scope and routing only. Confidential discovery, a proposal, a contract, and a client workspace are separate later stages.</span></div>
<div class="intake-form__actions"><button class="btn btn--primary" type="submit">Review my scoping record</button><button class="btn btn--ghost" type="reset">Reset</button></div>
<p class="intake-form__status" data-intake-status role="status" aria-live="polite"></p>
</form>
<section class="intake-review" data-intake-review hidden tabindex="-1"><p class="eyebrow">Visitor confirmation · not submitted</p><h3>Review your scoping record.</h3><pre data-intake-record></pre><div><button class="btn btn--primary" type="button" data-copy-record="copy-record">Copy full record</button><button class="btn btn--ghost" type="button" data-download-record="download-record">Download JSON</button><button class="btn btn--ghost" type="button" data-copy-booking-summary="booking-summary">Copy booking-safe summary</button><a class="btn btn--ghost" data-contextual-booking href="${escapeHtml(r.actions?.[0]?.href || '/university/contact')}">Continue to booking</a></div><p><strong>Transmission remains unavailable:</strong> Aloha AI’s brand-owned receiving endpoint is not active. The current Microsoft Bookings destination uses a Northeastern account and does not receive this scoping record automatically. Paste only the booking-safe summary if you want that context in the booking note.</p><p><button class="text-link" type="button" data-clear-attribution="clear-attribution">Clear local source context</button> · <a href="/privacy">Read the privacy and retention boundary</a></p></section>
</div></section>`;
}

function conversionHref(r, branch = '') {
  const params = new URLSearchParams({ source: r.pathname, offer: r.id });
  if (r.title) params.set('label', r.title);
  if (r.audience) params.set('audience', r.audience);
  const industries = Array.isArray(r.industries) ? r.industries.join(',') : r.industries;
  if (industries) params.set('industry', industries);
  if (branch) params.set('branch', branch);
  return `/university/contact?${params.toString()}`;
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
<span class="build-card__top"><span class="build-card__number">${String(index + 1).padStart(2, '0')}</span><span class="build-card__status build-card__status--${escapeHtml(item.maturity.toLowerCase())}">${escapeHtml(governedStatusLabel(item))}</span></span>
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
<div class="engagement-paths__action"><a class="btn btn--primary" href="${escapeHtml(conversionHref(r, 'not-sure'))}"><span>Tell RN what is stuck</span><span aria-hidden="true">↗</span></a><a class="btn btn--outline" href="/engagements">See how engagements work</a></div>
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
  const isUniversityInstitutional = ['/university/about', '/university/start-here'].includes(r.pathname);
  const isResourceDetail = isAbout || isEditorialDetail || isMethodsDetail || isInteractiveDetail || isServiceDetail || isResearchDetail || isProductGovernanceDetail || isUniversityDetail || isUniversityInstitutional;
  const hasInteractiveWorkspace = r.kind === 'assessment' ? Boolean(r.assessment) : Boolean(r.demo);
  const actions = Array.isArray(r.actions) && r.actions.length
    ? r.actions.map((action, index) => `<a class="btn ${index === 0 ? 'btn--primary' : 'btn--ghost'}" href="${escapeHtml(action.href)}"><span>${escapeHtml(action.label)}</span><span aria-hidden="true">↗</span></a>`).join('')
    : isInteractiveDetail && hasInteractiveWorkspace
      ? `<a class="btn btn--primary" href="#interactive-workspace">${r.kind === 'assessment' ? 'Start the assessment' : 'Open the tool'}</a><a class="btn btn--ghost" href="#detail-record">Read its boundaries</a>`
      : isInteractiveDetail
        ? '<a class="btn btn--primary" href="#detail-record">Inspect the public record</a><a class="btn btn--ghost" href="/tools">Browse usable tools</a>'
      : isServiceDetail && !r.demo && !r.assessment
        ? '<a class="btn btn--primary" href="#service-brief">See the engagement</a><a class="btn btn--ghost" href="/services">Compare services</a>'
      : isResearchDetail
        ? '<a class="btn btn--primary" href="#details">Read the research record</a><a class="btn btn--ghost" href="/research">Browse the collection</a>'
      : isEditorialDetail || isMethodsDetail
      ? `<a class="btn btn--primary" href="#detail-record">${r.kind === 'monitor' ? 'Open the signal record' : isMethodsDetail ? 'Inspect the method' : 'Read the research record'}</a><a class="btn btn--ghost" href="${r.kind === 'monitor' ? '/monitors' : isMethodsDetail ? '/governance' : '/research'}">${isMethodsDetail ? 'Browse governance' : 'Browse the collection'}</a>`
      : isProductGovernanceDetail
        ? `<a class="btn btn--primary" href="#detail-record">${r.kind === 'product' ? 'Inspect the system' : r.kind === 'policy' ? 'Read the policy' : 'Open the record'}</a><a class="btn btn--ghost" href="${r.kind === 'product' ? '/products' : '/governance'}">Browse ${r.kind === 'product' ? 'products' : 'governance'}</a>`
      : isUniversityDetail
        ? `<a class="btn btn--primary" href="#learning-record">${r.kind === 'lesson' ? 'Start the lesson' : r.kind === 'course' ? 'Open the course' : r.kind === 'playbook' ? 'Open the playbook' : r.kind === 'template' ? 'Open the template' : r.kind === 'useCase' ? 'Open the workflow' : 'Open the guide'}</a><a class="btn btn--ghost" href="${r.kind === 'lesson' ? '/university/learn' : r.kind === 'course' ? '/university/courses' : r.kind === 'playbook' ? '/university/playbooks' : r.kind === 'template' ? '/university/templates' : r.kind === 'useCase' ? '/university/use-cases' : '/university/tools'}">Browse ${r.kind === 'toolGuide' ? 'tool guides' : r.kind === 'useCase' ? 'use cases' : `${r.kind}s`}</a>`
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
<div class="service-hero-map__cut"><span>Research everywhere</span><span>No clear owner</span><span>Same work, again</span></div>
<div class="service-hero-map__turn"><span>Then build</span><strong>ONE SYSTEM</strong><span>people can actually use.</span></div>
<div class="service-hero-map__stamp">People<br><b>+</b> AI<br><small>clear roles</small></div>
</div>` : isBuilds ? `<div class="builds-cover" aria-hidden="true">
<p class="builds-cover__issue">Issue 02 · Builds</p>
<div class="builds-cover__stack"><span>CHECK</span><span>TRACK</span><span>LEARN</span><span>RUN</span></div>
<div class="builds-cover__note">Not mockups.<br><strong>Open the work ↗</strong></div>
<div class="builds-cover__count">11<small>ways in</small></div>
</div>` : isUniversity ? `<div class="university-cover" aria-hidden="true">
<p class="university-cover__issue">Issue 04 · University</p>
<div class="university-cover__headline"><span>LEARN</span><span>TRY</span><span>CHECK</span><span>BUILD</span></div>
<div class="university-cover__free">$0<small>forever</small></div>
<div class="university-cover__note">No gate.<br><strong>Just start ↗</strong></div>
</div>` : isContact ? `<div class="contact-cover" aria-hidden="true">
<p class="contact-cover__issue">Issue 05 · Contact</p>
<div class="contact-cover__headline"><span>MESSY</span><span>IS A</span><span>START.</span></div>
<div class="contact-cover__note">You bring<br>the stuck part.</div>
<div class="contact-cover__reply">RN reads it.<br><strong>A human replies. ↗</strong></div>
</div>` : isResourceDetail ? `<div class="detail-cover detail-cover--${escapeHtml(isMethodsDetail ? 'methods' : isUniversityInstitutional ? 'universityInstitutional' : r.kind)}" aria-hidden="true">
<p class="detail-cover__issue">${isMethodsDetail ? 'METHODS STANDARD' : isServiceDetail ? 'SERVICE ENGAGEMENT' : isUniversityInstitutional ? 'UNIVERSITY GUIDE' : r.kind === 'monitor' ? 'LIVE SIGNAL DESK' : r.kind === 'tool' ? 'TOOL RECORD' : r.kind === 'assessment' ? 'ASSESSMENT RECORD' : r.kind === 'product' ? 'PRODUCT SYSTEM' : r.kind === 'policy' ? 'POLICY RECORD' : r.pathname === '/partners' ? 'PARTNERSHIP RECORD' : r.kind === 'institutional' ? 'PRACTICE RECORD' : r.kind === 'lesson' ? 'UNIVERSITY LESSON' : r.kind === 'course' ? 'UNIVERSITY COURSE' : r.kind === 'playbook' ? 'UNIVERSITY PLAYBOOK' : r.kind === 'template' ? 'UNIVERSITY TEMPLATE' : r.kind === 'toolGuide' ? 'UNIVERSITY TOOL GUIDE' : r.kind === 'useCase' ? 'UNIVERSITY USE CASE' : 'RESEARCH FILE'} · ${escapeHtml(governedStatusLabel(r))}</p>
<div class="detail-cover__type">${isMethodsDetail ? '<span>DEFINE</span><span>TEST</span><span>MAINTAIN</span>' : isServiceDetail ? '<span>FIND</span><span>RANK</span><span>MOVE</span>' : isUniversityInstitutional ? '<span>ORIENT</span><span>CHOOSE</span><span>BEGIN</span>' : r.kind === 'monitor' ? '<span>WATCH</span><span>VERIFY</span><span>ACT</span>' : r.kind === 'assessment' ? '<span>ANSWER</span><span>SEE</span><span>DECIDE</span>' : r.kind === 'tool' ? '<span>INPUT</span><span>RUN</span><span>CHECK</span>' : r.kind === 'product' ? '<span>GROUND</span><span>BUILD</span><span>MAINTAIN</span>' : r.kind === 'policy' ? '<span>READ</span><span>KNOW</span><span>RETURN</span>' : r.pathname === '/partners' ? '<span>RIGHTS</span><span>ROLES</span><span>PATH</span>' : r.kind === 'institutional' ? '<span>RECORD</span><span>ROLE</span><span>LIMIT</span>' : r.kind === 'lesson' ? '<span>LEARN</span><span>TRY</span><span>CHECK</span>' : r.kind === 'course' ? '<span>PLAN</span><span>BUILD</span><span>TEST</span>' : r.kind === 'playbook' ? '<span>FOLLOW</span><span>MAKE</span><span>RUN</span>' : r.kind === 'template' ? '<span>COPY</span><span>ADAPT</span><span>OWN</span>' : r.kind === 'toolGuide' ? '<span>COMPARE</span><span>TEST</span><span>CHOOSE</span>' : r.kind === 'useCase' ? '<span>CHOOSE</span><span>DRAFT</span><span>REVIEW</span>' : '<span>QUESTION</span><span>EVIDENCE</span><span>METHOD</span>'}</div>
<div class="detail-cover__stamp">${r.kind === 'monitor' ? 'DATED<br><strong>NOT FINAL</strong>' : isInteractiveDetail && hasInteractiveWorkspace ? 'LOCAL<br><strong>BY DESIGN</strong>' : r.kind === 'product' ? 'STATUS<br><strong>MATTERS</strong>' : r.kind === 'policy' ? 'PLAIN<br><strong>LANGUAGE</strong>' : 'READ<br><strong>THE RECORD</strong>'}</div>
<p class="detail-cover__note">${r.kind === 'monitor' ? 'Signals change. Sources stay visible.' : isServiceDetail ? 'A bounded engagement. A usable result. No mystery in between.' : isInteractiveDetail && hasInteractiveWorkspace ? 'Try the public version. Keep human judgment in the loop.' : isInteractiveDetail ? 'Inspect the method and maturity before treating this as usable.' : r.kind === 'product' ? 'Architecture can exist before packaging is finished. Read the status.' : r.kind === 'policy' ? 'The boundary should be understandable before you rely on it.' : r.kind === 'institutional' ? 'Claims, roles, and professional limits belong in the same record.' : r.kind === 'useCase' ? 'The model drafts. A person checks and decides.' : isUniversityDetail ? 'Free to read. Built to use. Keep judgment in the loop.' : 'An argument you can inspect, not a claim you must trust.'}</p>
</div>` : '';
  return `<section class="page-hero${isHome || isServices || isContact ? ' section--ink' : ''}${isHome ? ' page-hero--home' : isServices ? ' page-hero--services' : isBuilds ? ' page-hero--builds' : isUniversity ? ' page-hero--university' : isContact ? ' page-hero--contact' : isResourceDetail ? ' page-hero--detail' : isCollection ? ' page-hero--collection' : ''}"><div class="wrap page-hero__inner">
<div class="page-hero__copy">
<p class="eyebrow">${escapeHtml(r.eyebrow || label(r.kind))}</p>
${isContact ? '' : `<div class="resource-status"><span>${escapeHtml(label(r.kind))}</span><span>${escapeHtml(governedStatusLabel(r))}</span></div>`}
<h1 class="display">${isUniversityDetail ? linkKnownResources(r.title) : escapeHtml(r.title)}</h1>
<p class="lead">${isUniversityDetail ? linkKnownResources(r.summary) : escapeHtml(r.summary)}</p>
${r.audience ? `<p class="page-hero__audience"><strong>For:</strong> ${isUniversityDetail ? linkKnownResources(r.audience) : escapeHtml(r.audience)}</p>` : ''}
<div class="page-actions">${actions}</div>
</div>${visual}
</div>${isServices ? `<div class="services-ticker" aria-label="Services">
<div class="services-ticker__track" aria-hidden="true"><span>SERVICES · SERVICES · SERVICES · SERVICES · SERVICES ·</span><span>SERVICES · SERVICES · SERVICES · SERVICES · SERVICES ·</span></div>
</div>` : ''}${isHome ? '<a class="hero-scroll" href="#home-start"><span>Start here</span><span aria-hidden="true">↓</span></a>' : ''}</section>`;
}

function universityDepth(r) {
  const sections = Array.isArray(r.editorialSections) ? r.editorialSections : [];
  if (!sections.length) return '';
  const proofSections = sections.filter((section, index) =>
    index === 0 ||
    [
      'Featured learning tracks',
      'Featured playbooks',
      'Free templates',
      'What Aloha AI can build with you',
      'Grounded, honest, and on your side',
      'Built to be checked, not just believed'
    ].includes(section.title)
  );
  return `<section class="university-depth"><div class="wrap wrap--wide">
<div class="university-depth__head"><div><p class="eyebrow">Go further</p><h2>Featured paths and teaching standards.</h2></div><p>Open a featured learning path or inspect what stays free, how claims are checked, and where education ends and paid implementation begins.</p></div>
<div class="university-depth__sections">${proofSections.map((section, index) => `<details class="university-depth__item">
<summary><span>${String(index + 1).padStart(2, '0')}</span><strong>${escapeHtml(section.title)}</strong><i aria-hidden="true"><span class="depth-open">Open</span><span class="depth-close">Close</span></i></summary>
<div class="university-depth__body">${section.eyebrow ? `<p class="eyebrow">${escapeHtml(section.eyebrow)}</p>` : ''}${renderEditorialBlocks(section.blocks || [])}</div>
</details>`).join('')}</div>
</div></section>`;
}

function buildsDepth(r) {
  const intro = Array.isArray(r.editorialIntro) ? r.editorialIntro : [];
  const sections = Array.isArray(r.editorialSections) ? r.editorialSections : [];
  if (!intro.length && !sections.length) return '';
  return `<section class="build-depth"><div class="wrap wrap--wide">
<div class="build-depth__head"><div><p class="eyebrow">Behind the wall</p><h2>How to read the work without overreading it.</h2></div><p>The proof wall is the quick way in. Open the notes below when you want the taxonomy, evidence rules, private-work boundaries, or ways a build can become a paid engagement.</p></div>
${intro.length ? `<div class="build-depth__intro">${intro.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join('')}</div>` : ''}
<div class="build-depth__sections">${sections.map((section, index) => `<details class="build-depth__item">
<summary><span>${String(index + 1).padStart(2, '0')}</span><strong>${escapeHtml(section.title)}</strong><i aria-hidden="true"><span class="depth-open">Open</span><span class="depth-close">Close</span></i></summary>
<div class="build-depth__body">${section.eyebrow ? `<p class="eyebrow">${escapeHtml(section.eyebrow)}</p>` : ''}${renderEditorialBlocks(section.blocks || [])}</div>
</details>`).join('')}</div>
</div></section>`;
}

function identity(r) {
  return `<section class="section section--paper" id="details"><div class="wrap"><div class="grid grid-3">
<div class="card"><p class="eyebrow">Resource type</p><h2>${escapeHtml(label(r.kind))}</h2><p class="muted">Canonical ID: <code>${escapeHtml(r.id)}</code></p></div>
<div class="card"><p class="eyebrow">Governed release state</p><h2>${escapeHtml(governedStatusLabel(r))}</h2><p class="muted">This label is derived from the reviewed release registry. Publication does not certify integration, evaluation, maintenance, access, or commercial availability.</p></div>
<div class="card"><p class="eyebrow">Topics</p><h2>Connected knowledge</h2><p class="muted">${(r.topics || []).map(escapeHtml).join(' · ')}</p></div>
</div></div></section>`;
}

function prioritySections(r) {
  if (r.kind !== 'institutional') return '';
  return institutionalSection(r, (section) => section.priority === true);
}

function priorityCollection(r, registry) {
  return r.collection?.priority === true ? collectionSection(r, registry) : '';
}

function engagementPortfolio(r) {
  const portfolio = r.engagementPortfolio;
  if (!portfolio || !Array.isArray(portfolio.sections)) return '';
  const sections = portfolio.sections.map((section, sectionIndex) => `<section class="section${sectionIndex % 2 ? ' section--paper' : ''}" data-engagement-status="${sectionIndex === 0 ? 'commissioned' : 'independent'}"><div class="wrap">
<p class="eyebrow">${escapeHtml(section.eyebrow)}</p>
<h2 class="h2">${escapeHtml(section.title)}</h2>
${sectionIndex === 0 && portfolio.intro ? `<p class="lead">${escapeHtml(portfolio.intro)}</p>` : ''}
<div class="grid grid-3">${(section.items || []).map((item) => `<article class="card">
<p class="mini">${escapeHtml(item.sector)} · ${escapeHtml(item.status)}</p>
<h3>${escapeHtml(item.title)}</h3>
<p>${escapeHtml(item.problem)}</p>
<p class="mini"><strong>RN’s role:</strong> ${escapeHtml(item.role)}</p>
<p class="mini"><strong>Delivered:</strong></p>
<ul>${(item.deliverables || []).map((deliverable) => `<li>${escapeHtml(deliverable)}</li>`).join('')}</ul>
</article>`).join('')}</div>
${sectionIndex === portfolio.sections.length - 1 && portfolio.evidenceStandard ? `<div class="card" style="margin-top:var(--s6)"><p><strong>Evidence standard:</strong> ${escapeHtml(portfolio.evidenceStandard)}</p></div>` : ''}
</div></section>`).join('\n');
  return sections;
}

function editorial(r) {
  const intro = Array.isArray(r.editorialIntro) ? r.editorialIntro : [];
  const sections = r.pathname === '/about'
    ? []
    : Array.isArray(r.editorialSections) ? r.editorialSections : [];
  if (!intro.length && !sections.length) return '';
  if (r.pathname === '/') return homeEditorial(intro, sections);
  const introHtml = intro.length
    ? `<section class="section section--paper"><div class="wrap prose"><p class="eyebrow">In depth</p>${intro.map((paragraph) => `<p class="lead">${escapeHtml(paragraph)}</p>`).join('')}</div></section>`
    : '';
  return introHtml + sections.map((section, index) => {
    const blocks = renderEditorialBlocks(section.blocks || []);
    return `<section class="section${index % 2 ? ' section--paper' : ''}"${section.id ? ` id="${escapeHtml(section.id)}"` : ''}><div class="wrap prose">${section.eyebrow ? `<p class="eyebrow">${escapeHtml(section.eyebrow)}</p>` : ''}<h2 class="h2">${escapeHtml(section.title)}</h2>${blocks}</div></section>`;
  }).join('\n');
}

function resourceDetailExperience(r, related) {
  const isMonitor = r.kind === 'monitor';
  const intro = Array.isArray(r.editorialIntro) ? r.editorialIntro : [];
  const sections = Array.isArray(r.editorialSections) ? r.editorialSections : [];
  const updated = r.monitor?.updated || '';
  const facts = [
    ['Status', governedStatusLabel(r)],
    ...(updated ? [['Updated', updated]] : []),
    ['Record', isMonitor ? 'Dated signals + source boundary' : 'Research + inspectable method'],
    ['Use', isMonitor ? 'Orient, verify, then decide' : 'Read, test, and challenge']
  ];
  const dossier = sections.map((section, index) => `<details class="detail-dossier__item"${section.id ? ` id="${escapeHtml(section.id)}"` : ''}${index === 0 ? ' open' : ''}>
<summary><span>${String(index + 1).padStart(2, '0')}</span><strong>${escapeHtml(section.title)}</strong><i aria-hidden="true">+</i></summary>
<div class="detail-dossier__body">${section.eyebrow ? `<p class="eyebrow">${escapeHtml(section.eyebrow)}</p>` : ''}${renderEditorialBlocks(section.blocks || [])}</div>
</details>`).join('');
  const relatedItems = Object.values(related).flat().slice(0, 6);
  const relatedHtml = relatedItems.length ? `<section class="detail-related"><div class="wrap wrap--wide">
<div class="detail-section-head"><div><p class="eyebrow">${r.pathname === '/methods' ? 'Related Research' : 'Continue through the system'}</p><h2>Follow the evidence outward.</h2></div><p>Every named destination is a direct link to its canonical page.</p></div>
<div class="detail-related__grid">${relatedItems.map((item, index) => `<a href="${escapeHtml(item.pathname)}"><span>${String(index + 1).padStart(2, '0')} · ${escapeHtml(label(item.kind))}</span><strong>${escapeHtml(item.title)}</strong><small>${escapeHtml(governedStatusLabel(item))} ↗</small></a>`).join('')}</div>
</div></section>` : '';
  const monitorWorkspace = isMonitor && r.monitor ? monitorDashboardSection(r, true) : '';
  return `<section class="detail-orientation"><div class="wrap wrap--wide">
<div class="detail-orientation__intro"><p class="eyebrow">${isMonitor ? 'Read this before the signal' : 'Read this before the argument'}</p>${intro.length ? intro.map((paragraph) => `<p>${linkKnownResources(paragraph)}</p>`).join('') : `<p>${linkKnownResources(r.summary)}</p>`}</div>
<dl class="detail-facts">${facts.map(([term, value]) => `<div><dt>${escapeHtml(term)}</dt><dd>${escapeHtml(value)}</dd></div>`).join('')}</dl>
</div></section>
${monitorWorkspace}
<section class="detail-dossier" id="detail-record"><div class="wrap wrap--wide">
<div class="detail-section-head"><div><p class="eyebrow">${isMonitor ? 'The maintained record' : 'The research record'}</p><h2>${isMonitor ? 'Open the part you need.' : 'Read the reasoning in order—or inspect one part.'}</h2></div><p>${sections.length} documented section${sections.length === 1 ? '' : 's'}. Headings, tools, and named resources link directly whenever a canonical destination exists.</p></div>
<div class="detail-dossier__list">${dossier || '<p>No extended record has been published yet.</p>'}</div>
</div></section>
<section class="detail-accountability"><div class="wrap wrap--wide">
<div class="detail-section-head"><div><p class="eyebrow">How to rely on this</p><h2>Evidence, method, and boundary—together.</h2></div><p>Do not separate the conclusion from the conditions that make it trustworthy.</p></div>
<div class="detail-accountability__grid">
${detailList('Evidence', r.evidence)}
${detailList('Method', r.methodology, true)}
${detailList('Assumptions', r.assumptions)}
${detailList('Limitations', r.limitations)}
</div></div></section>
${relatedHtml}`;
}

function detailList(title, items, ordered = false) {
  const tag = ordered ? 'ol' : 'ul';
  return `<article><p class="eyebrow">${escapeHtml(title)}</p><${tag}>${(items || []).map((item) => `<li>${linkKnownResources(item)}</li>`).join('')}</${tag}></article>`;
}

function interactiveDetailExperience(r, related, registry) {
  const isAssessment = r.kind === 'assessment';
  const hasInteractiveWorkspace = isAssessment ? Boolean(r.assessment) : Boolean(r.demo);
  const intro = Array.isArray(r.editorialIntro) ? r.editorialIntro : [];
  const sections = Array.isArray(r.editorialSections) ? r.editorialSections : [];
  const facts = [
    ['Status', governedStatusLabel(r)],
    ['Surface', hasInteractiveWorkspace ? 'Runs in this browser' : 'Documentation only'],
    ['Input', hasInteractiveWorkspace ? 'Nothing is sent' : 'No input collected'],
    ['Use', hasInteractiveWorkspace ? isAssessment ? 'Orient, then verify' : 'Generate, inspect, then verify' : 'Inspect, then verify']
  ];
  const workspace = isAssessment
    ? assessmentSection(r, registry)
    : demoSection(r);
  const dossier = sections.map((section, index) => `<details class="detail-dossier__item"${index === 0 ? ' open' : ''}>
<summary><span>${String(index + 1).padStart(2, '0')}</span><strong>${escapeHtml(section.title)}</strong><i aria-hidden="true">+</i></summary>
<div class="detail-dossier__body">${section.eyebrow ? `<p class="eyebrow">${escapeHtml(section.eyebrow)}</p>` : ''}${renderEditorialBlocks(section.blocks || [])}</div>
</details>`).join('');
  const relatedItems = Object.values(related).flat().slice(0, 6);
  return `<section class="detail-orientation"><div class="wrap wrap--wide">
<div class="detail-orientation__intro"><p class="eyebrow">${hasInteractiveWorkspace ? 'Before you use it' : 'Before you rely on it'}</p>${intro.length ? intro.map((paragraph) => `<p>${linkKnownResources(paragraph)}</p>`).join('') : `<p>${linkKnownResources(r.summary)}</p>`}<p class="interactive-boundary">${hasInteractiveWorkspace ? `This public ${isAssessment ? 'assessment' : 'tool'} creates a structured starting point. It does not make the decision for you or replace current authority, complete records, or qualified human review.` : `This page currently exposes the documented ${governedStatusLabel(r).toLowerCase()} record, not interactive controls. Inspect the method and limitations here; use only a separately linked or deployed surface that is explicitly available.`}</p></div>
<dl class="detail-facts">${facts.map(([term, value]) => `<div><dt>${escapeHtml(term)}</dt><dd>${escapeHtml(value)}</dd></div>`).join('')}</dl>
</div></section>
${hasInteractiveWorkspace ? `<div class="interactive-workspace" id="interactive-workspace"><div class="interactive-workspace__head wrap wrap--wide"><div><p class="eyebrow">Public ${isAssessment ? 'assessment' : 'tool'}</p><h2>Try it here.</h2></div><p>Your input stays in this browser. Use the output as a reviewable draft—not a final answer.</p></div>${workspace}</div>` : ''}
<section class="detail-dossier" id="detail-record"><div class="wrap wrap--wide">
<div class="detail-section-head"><div><p class="eyebrow">The documented record</p><h2>See how it works—and where it stops.</h2></div><p>${sections.length} documented section${sections.length === 1 ? '' : 's'}. Every named Aloha AI resource links to its canonical page.</p></div>
<div class="detail-dossier__list">${dossier || '<p>No extended editorial record has been published yet. The evidence, method, assumptions, and limitations remain visible below.</p>'}</div>
</div></section>
<section class="detail-accountability"><div class="wrap wrap--wide">
<div class="detail-section-head"><div><p class="eyebrow">Do not skip this part</p><h2>Output and boundary belong together.</h2></div><p>A useful result is still conditional on its evidence, method, assumptions, and limitations.</p></div>
<div class="detail-accountability__grid">${detailList('Evidence', r.evidence)}${detailList('Method', r.methodology, true)}${detailList('Assumptions', r.assumptions)}${detailList('Limitations', r.limitations)}</div>
</div></section>
${relatedItems.length ? `<section class="detail-related"><div class="wrap wrap--wide"><div class="detail-section-head"><div><p class="eyebrow">Continue through the system</p><h2>Open the connected work.</h2></div><p>These are direct canonical destinations.</p></div><div class="detail-related__grid">${relatedItems.map((item, index) => `<a href="${escapeHtml(item.pathname)}"><span>${String(index + 1).padStart(2, '0')} · ${escapeHtml(label(item.kind))}</span><strong>${escapeHtml(item.title)}</strong><small>${escapeHtml(governedStatusLabel(item))} ↗</small></a>`).join('')}</div></div></section>` : ''}`;
}

function productGovernanceDetailExperience(r, related, registry) {
  const isProduct = r.kind === 'product';
  const isPolicy = r.kind === 'policy';
  const isPartners = r.pathname === '/partners';
  const intro = Array.isArray(r.editorialIntro) ? r.editorialIntro : [];
  const editorialSections = Array.isArray(r.editorialSections) ? r.editorialSections : [];
  const institutionalSections = Array.isArray(r.institutionalSections) ? r.institutionalSections : [];
  const policySections = Array.isArray(r.policySections) ? r.policySections : [];
  const linkResources = resourceLinker(registry, r.id);
  const relatedItems = Object.values(related).flat().slice(0, 6);
  const statusBoundary = isProduct
    ? r.implementationStatus || `This public record is ${governedStatusLabel(r).toLowerCase()}. Inspect the documented architecture and limitations before treating it as deployable.`
    : isPolicy
      ? `Effective ${r.effectiveDate || 'date shown in the record'}. This page states Aloha AI's public boundary in plain language.`
      : isPartners
        ? 'This record describes possible partnership structures, responsibilities, and boundaries. It does not create a partnership or engagement.'
        : 'This institutional record describes the practice, its roles, and its limits. It does not create a professional engagement.';
  const facts = isProduct
    ? [
        ['Status', governedStatusLabel(r)],
        ['Public surface', r.demo ? 'Interactive surface available' : 'Documented system record'],
        ['Packaging', r.licensing || 'Not publicly packaged'],
        ['Use', 'Inspect, scope, then verify']
      ]
    : [
        ['Record', isPolicy ? 'Public policy' : isPartners ? 'Partnership model' : 'Institutional statement'],
        ['Status', governedStatusLabel(r)],
        ...(isPolicy ? [['Effective', r.effectiveDate || 'See record']] : []),
        ['Use', isPolicy ? 'Read before using the site' : 'Verify role, scope, and boundary']
      ];
  const productPanels = isProduct ? [
    ['Architecture', r.architecture],
    ['Documentation', r.documentation],
    ['Roadmap', r.roadmap],
    ['Change record', r.changelog]
  ].filter(([, items]) => Array.isArray(items) && items.length) : [];
  const dossierItems = isProduct
    ? [
        ...productPanels.map(([title, items]) => ({ title, html: `<ul>${items.map((item) => `<li>${linkResources(item)}</li>`).join('')}</ul>` })),
        ...editorialSections.map((section) => ({ title: section.title, eyebrow: section.eyebrow, html: renderEditorialBlocks(section.blocks || [], linkResources) }))
      ]
    : isPolicy
      ? policySections.map((section) => ({
          title: section.title,
          html: `${(section.paragraphs || []).map((paragraph) => `<p>${linkResources(paragraph)}</p>`).join('')}${section.points?.length ? `<ul>${section.points.map((point) => `<li>${linkResources(point)}</li>`).join('')}</ul>` : ''}`
        }))
      : institutionalSections.map((section) => ({
          title: section.title,
          eyebrow: section.eyebrow,
          html: `${section.intro ? `<p>${linkResources(section.intro)}</p>` : ''}<div class="governance-record__items">${(section.items || []).map((item, index) => `<article><span>${String(index + 1).padStart(2, '0')}</span><div><h3>${escapeHtml(item.title)}</h3>${item.subtitle ? `<p class="mini">${escapeHtml(item.subtitle)}</p>` : ''}${item.basis ? `<p class="mini">${escapeHtml(item.basis)}</p>` : ''}<p>${linkResources(item.text || '')}</p>${item.points?.length ? `<ul>${item.points.map((point) => `<li>${linkResources(point)}</li>`).join('')}</ul>` : ''}${item.href ? `<a href="${escapeHtml(item.href)}">${escapeHtml(item.linkLabel || 'Open the connected record')} →</a>` : ''}</div></article>`).join('')}</div>`
        }));
  const dossier = dossierItems.map((section, index) => `<details class="detail-dossier__item"${index === 0 ? ' open' : ''}>
<summary><span>${String(index + 1).padStart(2, '0')}</span><strong>${escapeHtml(section.title)}</strong><i aria-hidden="true">+</i></summary>
<div class="detail-dossier__body">${section.eyebrow ? `<p class="eyebrow">${escapeHtml(section.eyebrow)}</p>` : ''}${section.html}</div>
</details>`).join('');
  return `<section class="detail-orientation"><div class="wrap wrap--wide">
<div class="detail-orientation__intro"><p class="eyebrow">${isProduct ? 'Before you adopt it' : isPolicy ? 'Before you use the site' : isPartners ? 'Before you propose a partnership' : 'Before you rely on the profile'}</p>${intro.length ? intro.map((paragraph) => `<p>${linkResources(paragraph)}</p>`).join('') : `<p>${linkResources(r.summary)}</p>`}<p class="interactive-boundary">${linkResources(statusBoundary)}</p></div>
<dl class="detail-facts">${facts.map(([term, value]) => `<div><dt>${escapeHtml(term)}</dt><dd>${escapeHtml(value)}</dd></div>`).join('')}</dl>
</div></section>
<section class="detail-dossier ${isProduct ? 'product-record' : 'governance-record'}" id="${r.pathname === '/about' ? 'about-record' : 'detail-record'}"><div class="wrap wrap--wide">
<div class="detail-section-head"><div><p class="eyebrow">${isProduct ? 'The system record' : isPolicy ? 'The governing terms' : isPartners ? 'The partnership record' : 'The institutional record'}</p><h2>${isProduct ? 'Architecture, status, and evidence in one place.' : isPolicy ? 'Open the section you need.' : isPartners ? 'Rights, roles, and the path beyond a pilot.' : 'Claims and boundaries stay together.'}</h2></div><p>${dossierItems.length} documented section${dossierItems.length === 1 ? '' : 's'}. Named Aloha AI resources link directly to their canonical pages.</p></div>
<div class="detail-dossier__list">${dossier || '<p>No extended record has been published yet.</p>'}</div>
</div></section>
<section class="detail-accountability"><div class="wrap wrap--wide">
<div class="detail-section-head"><div><p class="eyebrow">Accountability record</p><h2>Evidence, method, assumptions, and limits.</h2></div><p>${isProduct ? 'A product claim is only as trustworthy as the conditions attached to it.' : 'The public record includes the conditions that limit how it should be read.'}</p></div>
<div class="detail-accountability__grid">${detailList('Evidence', r.evidence)}${detailList('Method', r.methodology, true)}${detailList('Assumptions', r.assumptions)}${detailList('Limitations', r.limitations)}</div>
</div></section>
${relatedItems.length ? `<section class="detail-related"><div class="wrap wrap--wide"><div class="detail-section-head"><div><p class="eyebrow">Continue through the system</p><h2>Open the connected work.</h2></div><p>These are direct canonical destinations.</p></div><div class="detail-related__grid">${relatedItems.map((item, index) => `<a href="${escapeHtml(item.pathname)}"><span>${String(index + 1).padStart(2, '0')} · ${escapeHtml(label(item.kind))}</span><strong>${escapeHtml(item.title)}</strong><small>${escapeHtml(governedStatusLabel(item))} ↗</small></a>`).join('')}</div></div></section>` : ''}`;
}

function universityDetailExperience(r, related, registry) {
  const intro = Array.isArray(r.editorialIntro) ? r.editorialIntro : [];
  const sections = Array.isArray(r.editorialSections) ? r.editorialSections : [];
  const linkResources = resourceLinker(registry, r.id);
  const relatedItems = Object.values(related).flat().filter((item) => item.pathname !== r.pathname).slice(0, 6);
  const config = {
    lesson: ['Self-paced lesson', 'Before you begin', 'The lesson', 'Work through it in order—or open the part you need.', 'This lesson is educational. Test important claims against current primary sources and use qualified review when the stakes require it.'],
    course: ['Self-paced build course', 'Before you build', 'The course', 'Build the system. Keep the reasoning visible.', 'This course teaches a build process; it does not promise a finished deployment, compliance, or a particular outcome.'],
    playbook: ['Step-by-step playbook', 'Before you follow it', 'The playbook', 'Take the steps. Adapt them to the real work.', 'This playbook is a practical starting point. Adapt it to your people, data, contracts, industry, and professional obligations.'],
    template: ['Copy-and-adapt template', 'Before you copy it', 'The template', 'Copy the structure. Replace the assumptions.', 'A template is not a finished policy, workflow, or professional judgment. Replace the placeholders and verify every consequential term.'],
    toolGuide: ['Decision guide', 'Before you choose a tool', 'The guide', 'Compare the job, the evidence, and the tradeoffs.', 'Products, prices, features, and terms change. Treat dated comparisons as orientation and verify current vendor information before buying or relying.'],
    useCase: ['Human-reviewed workflow', 'Before you automate the task', 'The workflow', 'Start with the job. Keep the approval point visible.', 'This use case is a practical pattern, not permission to move sensitive data, delegate professional judgment, or let an AI system act without the review and authority the real task requires.']
  }[r.kind];
  const [format, before, recordLabel, recordTitle, boundary] = config;
  const delivery = r.kind === 'course' ? r.delivery : null;
  const education = r.kind === 'course' ? renderEducationSystem(r, linkResources) : r.kind === 'lesson' && r.parentCourse ? renderLessonDelivery(r) : '';
  const facts = [
    ['Format', format],
    ['Scope', `${sections.length} section${sections.length === 1 ? '' : 's'}`],
    ['Status', delivery ? courseDeliveryLabel(delivery.status) : governedStatusLabel(r)],
    ['Access', delivery ? (delivery.enrollmentOpen ? 'Enrollment open' : delivery.lessons === 'available' ? 'Open materials · enrollment closed' : 'Curriculum preview · enrollment closed') : '$0 · no signup']
  ];
  const dossier = sections.map((section, index) => `<details class="detail-dossier__item learning-record__item"${index === 0 ? ' open' : ''}>
<summary><span>${String(index + 1).padStart(2, '0')}</span><strong>${escapeHtml(section.title)}</strong><i aria-hidden="true">+</i></summary>
<div class="detail-dossier__body">${section.eyebrow ? `<p class="eyebrow">${escapeHtml(section.eyebrow)}</p>` : ''}${renderEditorialBlocks(section.blocks || [], linkResources)}</div>
</details>`).join('');
  const nextHref = r.kind === 'lesson' ? '/university/learn' : r.kind === 'course' ? '/university/courses' : r.kind === 'playbook' ? '/university/playbooks' : r.kind === 'template' ? '/university/templates' : r.kind === 'useCase' ? '/university/use-cases' : '/university/tools';
  const plural = r.kind === 'toolGuide' ? 'tool guides' : r.kind === 'useCase' ? 'use cases' : `${r.kind}s`;
  return `<section class="detail-orientation learning-orientation"><div class="wrap wrap--wide">
<div class="detail-orientation__intro"><p class="eyebrow">${before}</p>${intro.length ? intro.map((paragraph) => `<p>${linkResources(paragraph)}</p>`).join('') : `<p>${linkResources(r.summary)}</p>`}<p class="interactive-boundary">${linkResources(boundary)}</p></div>
<dl class="detail-facts">${facts.map(([term, value]) => `<div><dt>${escapeHtml(term)}</dt><dd>${escapeHtml(value)}</dd></div>`).join('')}</dl>
</div></section>
<section class="learning-audience"><div class="wrap wrap--wide"><p class="eyebrow">Who this is for</p><p>${linkResources(r.audience || 'Anyone who wants a practical, evidence-aware starting point.')}</p></div></section>
<section class="detail-dossier learning-record" id="learning-record"><div class="wrap wrap--wide">
<div class="detail-section-head"><div><p class="eyebrow">${recordLabel}</p><h2>${recordTitle}</h2></div><p>${sections.length} numbered section${sections.length === 1 ? '' : 's'}. Named Aloha AI resources link directly to their canonical pages.</p></div>
<div class="detail-dossier__list">${dossier || '<p>No extended learning record has been published yet.</p>'}</div>
</div></section>
${education}
${r.downloadTemplate ? renderLearningDownload(r) : ''}
<section class="detail-accountability learning-boundary"><div class="wrap wrap--wide">
<div class="detail-section-head"><div><p class="eyebrow">Use it responsibly</p><h2>What supports this—and where it stops.</h2></div><p>Keep the practical material attached to its evidence, method, assumptions, and limits.</p></div>
<div class="detail-accountability__grid">${detailList('Evidence', r.evidence)}${detailList('Method', r.methodology, true)}${detailList('Assumptions', r.assumptions)}${detailList('Limitations', r.limitations)}</div>
</div></section>
${relatedItems.length ? `<section class="detail-related learning-next"><div class="wrap wrap--wide"><div class="detail-section-head"><div><p class="eyebrow">Choose the next move</p><h2>Keep learning—or use the connected resource.</h2></div><p>Every card is a direct canonical destination.</p></div><div class="detail-related__grid">${relatedItems.map((item, index) => `<a href="${escapeHtml(item.pathname)}"><span>${String(index + 1).padStart(2, '0')} · ${escapeHtml(label(item.kind))}</span><strong>${escapeHtml(item.title)}</strong><small>${escapeHtml(governedStatusLabel(item))} ↗</small></a>`).join('')}</div><p class="learning-next__all"><a class="btn btn--primary" href="${nextHref}">Browse all ${plural} <span aria-hidden="true">↗</span></a></p></div></section>` : ''}`;
}

function renderEducationSystem(resource, linkResources) {
  const records = resource.education?.records || [];
  if (!records.length) return '';
  const byType = (type) => records.filter((record) => record.type === type);
  const byId = new Map(records.map((record) => [record.id, record]));
  const course = byType('course')[0];
  if (!course) return '';
  const modules = byType('module').sort((a, b) => a.position - b.position);
  const lessonsFor = (module) => module.lessonIds.map((id) => byId.get(id)).filter(Boolean).sort((a, b) => a.position - b.position);
  const lessonPath = (lesson) => `${resource.pathname}/lessons/${lesson.id.replace(/^[a-z0-9-]+-lesson-/, '')}`;
  const modulesHtml = modules.map((module, index) => `<details class="detail-dossier__item learning-record__item"${index === 0 ? ' open' : ''}>
<summary><span>${String(module.position).padStart(2, '0')}</span><strong>${escapeHtml(module.title)}</strong><i aria-hidden="true">+</i></summary>
<div class="detail-dossier__body">${module.summary ? `<p>${linkResources(module.summary)}</p>` : ''}<ol>${lessonsFor(module).map((lesson) => `<li><h3><a href="${escapeHtml(lessonPath(lesson))}">${escapeHtml(lesson.title)}</a></h3>${lesson.minutes ? `<p class="mini">${escapeHtml(String(lesson.minutes))} minutes</p>` : ''}<p>${linkResources((lesson.content || [])[0] || '')}</p><p><a href="${escapeHtml(lessonPath(lesson))}">Open lesson <span aria-hidden="true">→</span></a></p></li>`).join('')}</ol></div>
</details>`).join('');
  const assessments = byType('assessment');
  const sources = byType('source');
  const project = byType('project')[0];
  const rubric = project ? byId.get(project.rubricId) : null;
  const credential = course.credentialId ? byId.get(course.credentialId) : null;
  const lessonIds = byType('lesson').map((lesson) => lesson.id);
  const knowledgeCheck = assessments.find((item) => Array.isArray(item.questions) && item.questions.length);
  return `<section class="detail-dossier learning-record" id="course-materials"><div class="wrap wrap--wide">
<div class="detail-section-head"><div><p class="eyebrow">Open course materials</p><h2>${modules.length} modules. ${byType('lesson').length} lessons. A build from first principle to audit-ready artifact.</h2></div><p>The course content is public. Enrollment, account-synced progress, submissions, grading, and credential issuance remain closed until those systems exist. Browser-local completion marks remain available as an unverified self-record.</p></div>
${courseProgressPanel(resource, lessonIds)}
<div class="detail-dossier__list">${modulesHtml}</div>
</div></section>
${knowledgeCheck ? renderCourseKnowledgeCheck(knowledgeCheck) : ''}
<section class="detail-accountability learning-boundary" id="course-evidence"><div class="wrap wrap--wide">
<div class="detail-section-head"><div><p class="eyebrow">Assessment and evidence contract</p><h2>What completion would require.</h2></div><p>${assessments.length} assessments, ${sources.length} named sources, one capstone, and a weighted rubric.</p></div>
<div class="detail-accountability__grid">
${detailList('Assessments', assessments.map((item) => `${item.title}: ${item.passingRule}`))}
${detailList('Capstone evidence', project?.evidenceRequirements || [])}
${detailList('Rubric', rubric?.criteria?.map((item) => `${item.label}: ${item.weight}% — ${item.standard}`) || [])}
${detailList('Credential status', credential ? [`${credential.title}: ${credential.issuanceStatus}. ${credential.verificationMethod}`] : ['No credential contract published.'])}
</div>
<div class="detail-section-head"><div><p class="eyebrow">Course sources</p><h2>Open the material behind the method.</h2></div><p>Each destination was verified on the date recorded in the course system.</p></div>
<ul>${sources.map((source) => `<li><a href="${escapeHtml(source.url)}">${escapeHtml(source.title)}</a> <span class="mini">— ${escapeHtml(source.publisher)} · verified ${escapeHtml(source.lastVerified)}</span></li>`).join('')}</ul>
${(resource.learningLinks || []).length ? `<p>${resource.learningLinks.map((item, index) => `<a class="btn ${index ? 'btn--ghost' : 'btn--primary'}" href="${escapeHtml(item.href)}">${escapeHtml(item.label)} <span aria-hidden="true">${index ? '→' : '↗'}</span></a>`).join(' ')}</p>` : ''}
</div></section>`;
}

function renderLearningDownload(resource) {
  const contract = JSON.stringify({
    filename: resource.downloadTemplate.filename,
    content: resource.downloadTemplate.content
  });
  return `<section class="interactive-workspace" id="template-download"><div class="interactive-workspace__head wrap wrap--wide"><div><p class="eyebrow">Reusable learning asset</p><h2>Download a clean working copy.</h2></div><p>The versioned UTF-8 Markdown file is generated in this browser from the published template below. Nothing is uploaded or submitted.</p></div><div class="wrap"><p><button class="btn btn--primary" type="button" id="learning-template-download">Download Markdown template</button> <span class="mini" id="learning-template-status" aria-live="polite"></span></p></div></section><script>(function(){var c=${contract},button=document.getElementById('learning-template-download'),status=document.getElementById('learning-template-status');button.addEventListener('click',function(){if(!window.AlohaActions){status.textContent='Download is unavailable in this browser.';return;}var result=window.AlohaActions.download({content:c.content,filename:c.filename,mimeType:'text/markdown;charset=utf-8',version:'1.0.0',license:'Open learning material; not a submission portal.'});status.textContent=result.ok?'Template downloaded. It remains on your device and has not been submitted.':'Download failed. The published template remains visible on this page.';});})();</script>`;
}

function courseProgressPanel(resource, lessonIds) {
  const state = JSON.stringify({ courseId: resource.id, lessonIds });
  return `<section class="card" id="course-progress" data-progress-course="${escapeHtml(resource.id)}" data-ev-contract="EV-ACT-CITATION-PROGRESS-RECOVERY"><p class="eyebrow">Private progress on this device</p><h3><span id="course-progress-count">0</span> of ${lessonIds.length} lessons marked complete</h3><p>Your completion marks use this browser's local storage. They are not sent to Aloha AI, do not create an account, and are not proof of completion. If storage is blocked, the page reports that state instead of implying persistence.</p><p><button class="btn btn--primary" type="button" id="course-progress-export">Export my learning record</button> <button class="btn btn--ghost" type="button" id="course-progress-reset">Reset local progress</button></p><p id="course-progress-status" class="mini" aria-live="polite"></p></section><script>(function(){var config=${state},prefix='aloha-university:'+config.courseId+':lesson:',count=document.getElementById('course-progress-count'),status=document.getElementById('course-progress-status'),store=window.AlohaActions&&window.AlohaActions.storage('local');function probe(){if(!store)return false;var k=prefix+'storage-probe',set=store.set(k,'ok'),read=set.ok&&store.get(k),removed=store.remove(k);return Boolean(set.ok&&read.ok&&read.value==='ok'&&removed.ok);}var available=probe();function completed(){return available?config.lessonIds.filter(function(id){var result=store.get(prefix+id);return result.ok&&result.value==='complete';}):[];}function refresh(){count.textContent=String(completed().length);status.textContent=available?'Browser-local completion record loaded.':'Browser storage is unavailable. Progress cannot persist after this page closes.';}document.getElementById('course-progress-reset').addEventListener('click',function(){if(!available){status.textContent='Browser storage is unavailable; there is no persistent record to reset.';return;}config.lessonIds.forEach(function(id){store.remove(prefix+id);});refresh();status.textContent='Local progress reset.';});document.getElementById('course-progress-export').addEventListener('click',function(){if(!window.AlohaActions){status.textContent='Export is unavailable in this browser.';return;}var record={schema:'aloha-ai-learning-record/1.0',courseId:config.courseId,exportedAt:new Date().toISOString(),completedLessonIds:completed(),notice:'Self-recorded browser-local progress. Not submitted, graded, or credentialed.'},result=window.AlohaActions.download({content:JSON.stringify(record,null,2),filename:config.courseId+'-learning-record-v1.json',mimeType:'application/json;charset=utf-8',version:'1.0.0',license:'Private self-record; not a credential or submission.'});status.textContent=result.ok?'Learning record exported. It remains a self-record, not a submission.':'Export failed. Your current completion count remains visible on this page.';});refresh();})();</script>`;
}

function renderLessonDelivery(resource) {
  const parent = resource.parentCourse;
  const sources = resource.lessonSources || [];
  const activities = resource.lessonActivities || [];
  const config = JSON.stringify({ courseId: parent.id, progressId: parent.progressId });
  return `<section class="detail-dossier learning-record" id="lesson-delivery" data-ev-contract="EV-ACT-CITATION-PROGRESS-RECOVERY"><div class="wrap wrap--wide"><div class="detail-section-head"><div><p class="eyebrow">Lesson workspace</p><h2>Record your progress on this device.</h2></div><p>Module ${parent.modulePosition}: ${escapeHtml(parent.moduleTitle)}</p></div><div class="detail-accountability__grid">${detailList('Activities', activities.map((item) => `${item.title}: ${item.passingRule || item.brief || 'Complete the recorded activity.'}`))}${`<article><p class="eyebrow">Source record</p><ol>${sources.map((source) => `<li><a href="${escapeHtml(source.url)}">${escapeHtml(source.title)}</a> — verified ${escapeHtml(source.lastVerified)}</li>`).join('')}</ol></article>`}</div><p><button class="btn btn--primary" type="button" id="lesson-complete">Mark lesson complete</button> <span id="lesson-progress-status" class="mini" aria-live="polite"></span></p><nav aria-label="Course lesson navigation"><p>${parent.previousPathname ? `<a class="btn btn--ghost" href="${escapeHtml(parent.previousPathname)}">← Previous lesson</a> ` : ''}<a class="btn btn--ghost" href="${escapeHtml(parent.pathname)}">Course overview</a>${parent.nextPathname ? ` <a class="btn btn--ghost" href="${escapeHtml(parent.nextPathname)}">Next lesson →</a>` : ''}</p></nav></div></section><script>(function(){var config=${config},key='aloha-university:'+config.courseId+':lesson:'+config.progressId,button=document.getElementById('lesson-complete'),status=document.getElementById('lesson-progress-status'),store=window.AlohaActions&&window.AlohaActions.storage('local');function read(){return store?store.get(key):{ok:false};}function paint(){var state=read(),done=state.ok&&state.value==='complete';if(!state.ok){button.disabled=true;status.textContent='Browser storage is unavailable. No completion mark can persist.';return;}button.textContent=done?'Remove completion mark':'Mark lesson complete';button.setAttribute('aria-pressed',String(done));status.textContent=done?'Marked complete in this browser.':'Not marked complete.';}button.addEventListener('click',function(){var state=read(),result=state.ok&&state.value==='complete'?store.remove(key):store.set(key,'complete');if(!result.ok){button.disabled=true;status.textContent='The completion mark could not be changed. Retry in a browser with local storage enabled.';return;}paint();});paint();})();</script>`;
}

function renderCourseKnowledgeCheck(assessment) {
  const questions = assessment.questions || [];
  const answerKey = JSON.stringify(questions.map((question) => ({ id: question.id, correct: question.correct, explanation: question.explanation })));
  return `<section class="interactive-workspace" id="course-knowledge-check" data-ev-contract="EV-ACT-CITATION-KNOWLEDGE-CHECK"><div class="interactive-workspace__head wrap wrap--wide"><div><p class="eyebrow">Executable knowledge check</p><h2>${escapeHtml(assessment.title)}</h2></div><p>Self-scored in this browser. The result is not submitted, graded, or attached to a credential.</p></div><div class="wrap"><form id="course-check-form" novalidate><div id="course-check-errors" class="card" role="alert" hidden></div>${questions.map((question, index) => `<fieldset class="card"><legend><strong>${index + 1}. ${escapeHtml(question.prompt)}</strong></legend>${question.options.map((option, optionIndex) => `<label><input required type="radio" name="${escapeHtml(question.id)}" value="${optionIndex}"> ${escapeHtml(option)}</label><br>`).join('')}</fieldset>`).join('')}<p><button class="btn btn--primary" type="submit">Score my answers</button> <button class="btn btn--outline" type="reset">Clear</button></p></form><p id="course-check-status" role="status" aria-live="polite">No self-check result has been generated.</p><div id="course-check-result" class="card" hidden aria-live="polite"></div><p><button class="btn btn--outline" id="course-check-copy" type="button" disabled>Copy self-check record</button> <button class="btn btn--outline" id="course-check-json" type="button" disabled>Download JSON</button></p></div></section><script>(function(){var form=document.getElementById('course-check-form'),out=document.getElementById('course-check-result'),key=${answerKey},copy=document.getElementById('course-check-copy'),download=document.getElementById('course-check-json'),record=null;form.addEventListener('submit',function(event){event.preventDefault();var shell=window.AlohaState.create({form:form,result:out,errors:'course-check-errors',status:'course-check-status'}),missing=key.filter(function(item){return !form.querySelector('[name="'+item.id+'"]:checked');}).map(function(item,index){return 'Answer question '+(index+1)+'.';});if(missing.length){record=null;copy.disabled=true;download.disabled=true;return shell.invalid(missing);}var score=0,review=[],answers=[];key.forEach(function(item,index){var chosen=form.elements[item.id].value,correct=Number(chosen)===item.correct;if(correct)score+=1;answers.push({id:item.id,selected:Number(chosen),correct:correct,explanation:item.explanation});review.push('<li><strong>Question '+(index+1)+': '+(correct?'Correct':'Review')+'.</strong> '+window.AlohaState.escapeHtml(item.explanation)+'</li>');});var percent=Math.round(score/key.length*100);record={schema:'aloha-ai-course-self-check/1.0',ruleVersion:'1.0.0',generatedAt:new Date().toISOString(),score:score,total:key.length,percent:percent,answers:answers,notice:'Browser-local self-check only; not submitted, graded, independently verified, or credentialed.'};shell.complete('<p class="eyebrow">Self-check result</p><h3>'+score+' of '+key.length+' correct ('+percent+'%)</h3><p>'+(percent>=80?'You reached the published knowledge-check threshold.':'Revisit the explanations and try again.')+' This result stays in this page and is not a grade.</p><ol>'+review.join('')+'</ol><p class="muted">'+record.notice+'</p>','Self-check complete. Review every explanation.');copy.disabled=false;download.disabled=false;});form.addEventListener('reset',function(){setTimeout(function(){record=null;copy.disabled=true;download.disabled=true;window.AlohaState.create({form:form,result:out,errors:'course-check-errors',status:'course-check-status'}).reset();},0);});copy.onclick=function(){if(record)window.AlohaActions.copyText(JSON.stringify(record,null,2));};download.onclick=function(){if(record)window.AlohaActions.download({content:JSON.stringify(record,null,2),filename:'citation-course-self-check-v1.json',mimeType:'application/json;charset=utf-8',version:'1.0.0',license:'Private self-record; not a grade or credential.'});};})();</script>`;
}

function universityServiceDetailExperience(r, related, registry) {
  const sections = Array.isArray(r.editorialSections) ? r.editorialSections : [];
  const linkResources = resourceLinker(registry, r.id);
  const relatedItems = Object.values(related).flat().filter((item) => item.pathname !== r.pathname).slice(0, 3);
  const fit = Array.isArray(r.fit) ? r.fit : [];
  const deliverables = Array.isArray(r.deliverables) ? r.deliverables : [];
  const methodology = Array.isArray(r.methodology) ? r.methodology : [];
  const contactHref = conversionHref(r, serviceBranch(r));
  const compareHref = '/services';
  const selectedSections = sections.filter((section) => !/related|book|price/i.test(`${section.eyebrow || ''} ${section.title || ''}`));
  const record = selectedSections.map((section, index) => `<details class="service-chapter"${index === 0 ? ' open' : ''}>
<summary><span>${String(index + 1).padStart(2, '0')}</span><strong>${escapeHtml(section.title)}</strong><em>${index === 0 ? 'Close' : 'Open'}</em></summary>
<div class="service-chapter__body">${section.eyebrow ? `<p class="service-kicker">${escapeHtml(section.eyebrow)}</p>` : ''}${renderEditorialBlocks(section.blocks || [], linkResources)}</div>
</details>`).join('');
  return `<section class="service-brief" id="service-brief"><div class="wrap wrap--wide">
<div class="service-brief__intro"><p class="service-kicker">The decision</p><h2>Know what to do next—<span>and why.</span></h2><p>${linkResources((r.editorialIntro || [r.summary])[0])}</p></div>
<dl class="service-brief__facts"><div><dt>Best for</dt><dd>${linkResources(r.audience)}</dd></div><div><dt>Timing</dt><dd>${escapeHtml(r.timeline || 'Confirmed after scope')}</dd></div><div><dt>Status</dt><dd>${escapeHtml(governedStatusLabel(r))}</dd></div></dl>
</div></section>
<section class="service-outcomes"><div class="wrap wrap--wide">
<div class="service-section-title"><p class="service-kicker">What changes</p><h2>You leave with work<br>your team can use.</h2></div>
<ol>${deliverables.map((item, index) => `<li><span>${String(index + 1).padStart(2, '0')}</span><p>${linkResources(item)}</p></li>`).join('')}</ol>
</div></section>
<section class="service-process"><div class="wrap wrap--wide">
<div class="service-section-title"><p class="service-kicker">How it moves</p><h2>A short path from<br>mess to decision.</h2></div>
<ol>${methodology.map((item, index) => `<li><span>${String(index + 1).padStart(2, '0')}</span><strong>${linkResources(item)}</strong></li>`).join('')}</ol>
</div></section>
${fit.length ? `<section class="service-fit"><div class="wrap wrap--wide"><div><p class="service-kicker">Fit check</p><h2>Right problem.<br>Right moment.</h2></div><ul>${fit.map((item) => `<li>${linkResources(item)}</li>`).join('')}</ul></div></section>` : ''}
<section class="service-record" id="service-record"><div class="wrap wrap--wide">
<div class="service-section-title"><p class="service-kicker">The complete scope</p><h2>Inspect every part<br>before we begin.</h2><p>Open only what you need. Nothing important is buried in a wall of identical cards.</p></div>
<div class="service-record__chapters">${record}</div>
</div></section>
<section class="service-boundary"><div class="wrap wrap--wide">
<div class="service-section-title"><p class="service-kicker">Responsibility</p><h2>The limits travel<br>with the promise.</h2></div>
<div class="service-boundary__grid">${detailList('Evidence', r.evidence)}${detailList('Assumptions', r.assumptions)}${detailList('Limitations', r.limitations)}</div>
</div></section>
${relatedItems.length ? `<section class="service-related"><div class="wrap wrap--wide"><div class="service-section-title"><p class="service-kicker">Connected work</p><h2>Continue with<br>the precise next step.</h2></div><div class="service-related__list">${relatedItems.map((item, index) => `<a href="${escapeHtml(item.pathname)}"><span>${String(index + 1).padStart(2, '0')}</span><strong>${escapeHtml(item.title)}</strong><small>${escapeHtml(label(item.kind))} · ${escapeHtml(governedStatusLabel(item))} ↗</small></a>`).join('')}</div></div></section>` : ''}
<section class="service-close"><div class="wrap wrap--wide"><p class="service-kicker">Next step</p><h2>Bring the workflow<br>that keeps getting stuck.</h2><p>We will tell you honestly whether this service is the right first move.</p><div><a class="btn btn--primary" href="${contactHref}">Start a conversation <span aria-hidden="true">↗</span></a><a class="btn btn--ghost" href="${compareHref}">Compare all services</a></div></div></section>
<script>(function(){document.querySelectorAll('.service-chapter').forEach(function(item){item.addEventListener('toggle',function(){var label=item.querySelector('summary em');if(label)label.textContent=item.open?'Close':'Open';});});})();</script>`;
}

function universityInstitutionalExperience(r, related, registry) {
  const intro = Array.isArray(r.editorialIntro) ? r.editorialIntro : [];
  const sections = Array.isArray(r.editorialSections) ? r.editorialSections : [];
  const linkResources = resourceLinker(registry, r.id);
  const relatedItems = Object.values(related).flat().filter((item) => item.pathname !== r.pathname).slice(0, 6);
  const isStart = r.pathname === '/university/start-here';
  const orientation = isStart
    ? 'Choose the closest starting point. You can change paths whenever the work changes.'
    : 'The teaching standard, evidence boundary, and professional limits belong on the same page.';
  const facts = [
    ['Page', isStart ? 'Learning orientation' : 'Teaching standard'],
    ['Scope', `${sections.length} documented section${sections.length === 1 ? '' : 's'}`],
    ['Status', governedStatusLabel(r)],
    ['Access', '$0 · no signup']
  ];
  const dossier = sections.map((section, index) => `<details class="detail-dossier__item learning-record__item"${index === 0 ? ' open' : ''}>
<summary><span>${String(index + 1).padStart(2, '0')}</span><strong>${escapeHtml(section.title)}</strong><i aria-hidden="true">+</i></summary>
<div class="detail-dossier__body">${section.eyebrow ? `<p class="eyebrow">${escapeHtml(section.eyebrow)}</p>` : ''}${renderEditorialBlocks(section.blocks || [], linkResources)}</div>
</details>`).join('');
  return `<section class="detail-orientation learning-orientation"><div class="wrap wrap--wide">
<div class="detail-orientation__intro"><p class="eyebrow">${isStart ? 'Find your first step' : 'Read the teaching contract'}</p>${intro.length ? intro.map((paragraph) => `<p>${linkResources(paragraph)}</p>`).join('') : `<p>${linkResources(r.summary)}</p>`}<p class="interactive-boundary">${linkResources(orientation)}</p></div>
<dl class="detail-facts">${facts.map(([term, value]) => `<div><dt>${escapeHtml(term)}</dt><dd>${escapeHtml(value)}</dd></div>`).join('')}</dl>
</div></section>
<section class="learning-audience"><div class="wrap wrap--wide"><p class="eyebrow">Who this is for</p><p>${linkResources(r.audience || 'People choosing a practical, evidence-aware way into AI learning.')}</p></div></section>
<section class="detail-dossier learning-record" id="institutional-record"><div class="wrap wrap--wide">
<div class="detail-section-head"><div><p class="eyebrow">${isStart ? 'The route map' : 'The teaching record'}</p><h2>${isStart ? 'Choose by need, not by tool.' : 'Trust the method you can inspect.'}</h2></div><p>${sections.length} numbered section${sections.length === 1 ? '' : 's'}. Named tools and Aloha AI resources link directly to their destinations.</p></div>
<div class="detail-dossier__list">${dossier || '<p>No extended institutional record has been published yet.</p>'}</div>
</div></section>
<section class="detail-accountability learning-boundary"><div class="wrap wrap--wide">
<div class="detail-section-head"><div><p class="eyebrow">The responsibility boundary</p><h2>Evidence, method, assumptions, and limits stay visible.</h2></div><p>Education and support do not silently become professional advice or delegated judgment.</p></div>
<div class="detail-accountability__grid">${detailList('Evidence', r.evidence)}${detailList('Method', r.methodology, true)}${detailList('Assumptions', r.assumptions)}${detailList('Limitations', r.limitations)}</div>
</div></section>
${relatedItems.length ? `<section class="detail-related learning-next"><div class="wrap wrap--wide"><div class="detail-section-head"><div><p class="eyebrow">Continue from here</p><h2>Open the connected path.</h2></div><p>Every card is a direct canonical destination.</p></div><div class="detail-related__grid">${relatedItems.map((item, index) => `<a href="${escapeHtml(item.pathname)}"><span>${String(index + 1).padStart(2, '0')} · ${escapeHtml(label(item.kind))}</span><strong>${escapeHtml(item.title)}</strong><small>${escapeHtml(governedStatusLabel(item))} ↗</small></a>`).join('')}</div><p class="learning-next__all"><a class="btn btn--primary" href="/university">Return to University <span aria-hidden="true">↗</span></a></p></div></section>` : ''}`;
}

function courseDeliveryLabel(status) {
  return ({
    'curriculum-preview': 'Curriculum preview',
    'enrollment-open': 'Enrollment open',
    'enrollment-closed': 'Enrollment closed',
    archived: 'Archived'
  })[status] || 'Status not recorded';
}

function homeEditorial(intro, sections) {
  return `<section class="home-close"><div class="wrap wrap--wide">
<div class="home-close__statement"><p class="eyebrow">Choose the next move</p><h2 aria-label="The homepage has done its job. Now open the work.">The homepage has done its job.<br><span>Now open the work.</span></h2><p>Use a working system, learn the method, or bring RN the workflow that keeps getting stuck.</p></div>
<nav class="home-close__paths" aria-label="Choose your next Aloha AI path">
<a href="/tools"><span>01 · Use</span><strong>Try a working tool.</strong><small>Open browser-local tools and assessments <i aria-hidden="true">↗</i></small></a>
<a href="/university"><span>02 · Learn</span><strong>Build the skill yourself.</strong><small>Enter the free Aloha AI University <i aria-hidden="true">↗</i></small></a>
<a href="/university/contact"><span>03 · Work together</span><strong>Bring RN the stuck part.</strong><small>Choose the right contact path <i aria-hidden="true">↗</i></small></a>
</nav>
</div></section>`;
}

function servicesDepth(r) {
  const intro = Array.isArray(r.editorialIntro) ? r.editorialIntro : [];
  const sections = Array.isArray(r.editorialSections) ? r.editorialSections : [];
  if (!intro.length && !sections.length) return '';
  const essentialSections = sections.filter((section, index) => index < 4);
  return `<section class="service-depth"><div class="wrap wrap--wide">
<div class="service-depth__head"><div><p class="eyebrow">Before you reach out</p><h2>Inspect the scope, deliverables, and boundaries.</h2></div><p>The choices above are enough to begin. These four records show what the work includes and how responsibility stays visible.</p></div>
${intro.length ? `<div class="service-depth__intro">${intro.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join('')}</div>` : ''}
<div class="service-depth__sections">${essentialSections.map((section, index) => `<details class="service-depth__item">
<summary><span>${String(index + 1).padStart(2, '0')}</span><strong>${escapeHtml(section.title)}</strong><i aria-hidden="true">+</i></summary>
<div class="service-depth__body">${section.eyebrow ? `<p class="eyebrow">${escapeHtml(section.eyebrow)}</p>` : ''}${renderEditorialBlocks(section.blocks || [])}</div>
</details>`).join('')}</div>
</div></section>`;
}

function primaryDoorClose(r) {
  const config = {
    '/services': {
      eyebrow: 'Ready to begin?',
      title: 'Bring the work that keeps getting stuck.',
      text: 'You do not need a technical brief. Describe what repeats, what breaks, and what a better result would make possible.',
      primary: ['/university/contact', 'Tell RN what is stuck'],
      secondary: ['/builds', 'Inspect the proof first']
    },
    '/builds': {
      eyebrow: 'Choose the next move',
      title: 'Use the work—or bring a problem worth building around.',
      text: 'The public systems show how RN thinks. A paid engagement begins with your workflow, evidence, decisions, and constraints.',
      primary: ['/university/contact', 'Bring RN a problem'],
      secondary: ['/services', 'See what can be built']
    },
    '/methods': {
      eyebrow: 'Apply the standard',
      title: 'The method matters most when the work becomes real.',
      text: 'Inspect a working system, or bring RN a consequential workflow that needs visible sources, rules, review, and ownership.',
      primary: ['/builds', 'Inspect the work'],
      secondary: ['/university/contact', 'Discuss a workflow']
    },
    '/university': {
      eyebrow: 'Learn or build',
      title: 'Keep learning free. Ask for help only when you want it.',
      text: 'Start with a lesson, use a template, or choose paid support when the work needs architecture, implementation, or an accountable operator.',
      primary: ['/university/start-here', 'Choose your first lesson'],
      secondary: ['/services', 'See paid support']
    },
    '/about': {
      eyebrow: 'Work with RN',
      title: 'Start with the question that does not fit neatly anywhere else.',
      text: 'A first conversation is a fit check: what the work requires, what RN can responsibly own, and where another professional belongs.',
      primary: ['/university/contact', 'Start a conversation'],
      secondary: ['/services', 'See the practice']
    }
  }[r.pathname];
  if (!config) return '';
  return `<section class="primary-door-close"><div class="wrap wrap--wide">
<div class="primary-door-close__copy"><p class="eyebrow">${escapeHtml(config.eyebrow)}</p><h2>${escapeHtml(config.title)}</h2><p>${escapeHtml(config.text)}</p></div>
<div class="primary-door-close__actions"><a class="btn btn--primary" href="${escapeHtml(config.primary[0])}">${escapeHtml(config.primary[1])} <span aria-hidden="true">↗</span></a><a class="btn btn--ghost" href="${escapeHtml(config.secondary[0])}">${escapeHtml(config.secondary[1])}</a></div>
</div></section>`;
}

function renderEditorialBlocks(blocks, linkText = linkKnownResources) {
  return blocks.map((block) => {
    if (block.type === 'paragraph') return `<p>${linkText(block.text)}</p>`;
    if (block.type === 'heading') return `<h3>${block.href ? `<a href="${escapeHtml(block.href)}">${escapeHtml(block.text)} <span aria-hidden="true">↗</span></a>` : linkText(block.text)}</h3>`;
    if (block.type === 'links') return `<nav class="editorial-links">${(block.items || []).map((item) => `<a href="${escapeHtml(item.href)}">${escapeHtml(item.label)} <span aria-hidden="true">↗</span></a>`).join('')}</nav>`;
    if (block.type === 'list') {
      const tag = block.ordered ? 'ol' : 'ul';
      return `<${tag}>${(block.items || []).map((item) => `<li>${linkText(item)}</li>`).join('')}</${tag}>`;
    }
    if (block.type === 'quote') return `<blockquote>${linkText(block.text)}</blockquote>`;
    if (block.type === 'code') return `<pre><code>${escapeHtml(block.text)}</code></pre>`;
    if (block.type === 'table') {
      const rows = block.rows || [];
      const width = Math.max(0, ...rows.map((row) => (row.cells || []).length));
      const headers = (rows[0]?.cells || []).map((cell) => String(cell.text || '').toLowerCase());
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
      return `<div style="overflow-x:auto"><table><tbody>${normalized.map((cells, rowIndex) => `<tr>${cells.map((cell) => {
        const tag = cell.header || rowIndex === 0 ? 'th' : 'td';
        return `<${tag}>${linkText(cell.text)}</${tag}>`;
      }).join('')}</tr>`).join('')}</tbody></table></div>`;
    }
    return '';
  }).join('');
}

function kindSections(r, registry) {
  const specialized = {
    build: collectionSection,
    collection: collectionSection,
    assessment: assessmentSection,
    institutional: (resource) => institutionalSection(resource, (section) => section.priority !== true),
    policy: policySection
  };
  const lead = r.collection?.priority === true
    ? ''
    : specialized[r.kind]
      ? specialized[r.kind](r, registry)
      : r.collection
        ? collectionSection(r, registry)
        : '';
  const demo = r.demo || r.monitor ? demoSection(r) : '';
  return lead + demo + sectionDescriptors(r).filter((section) => section.field !== 'collection').map((section) => section.mode === 'text'
    ? textSection(section.title, r[section.field], section.eyebrow)
    : listSection(section.title, r[section.field], section.eyebrow)).join('\n');
}

function institutionalSection(r, include = () => true) {
  return (r.institutionalSections || []).filter(include).map((section, sectionIndex) => {
    const homeClass = r.pathname === '/'
      ? section.priority === true
        ? sectionIndex === 0 ? ' home-gateway' : ' home-proof'
        : ` home-story home-story--${sectionIndex + 1}`
      : '';
    return `<section class="section institutional-section${homeClass}"${section.id ? ` id="${escapeHtml(section.id)}"` : r.pathname === '/' && section.priority === true && sectionIndex === 0 ? ' id="home-start"' : r.pathname === '/about' && section.priority === true ? ' id="about-record"' : ''} data-section-index="${sectionIndex + 1}"><div class="wrap"><div class="section-heading"><div><p class="eyebrow">${escapeHtml(section.eyebrow || 'Institution')}</p><h2 class="h2">${escapeHtml(section.title)}</h2></div>${section.intro ? `<p class="lead">${escapeHtml(section.intro)}</p>` : ''}</div><div class="grid grid-${Math.min((section.items || []).length, 3)} section-cards">${(section.items || []).map((item, itemIndex) => {
    const body = `<span class="card__index">${String(itemIndex + 1).padStart(2, '0')}</span><h3>${escapeHtml(item.title)}</h3>${item.subtitle ? `<p class="mini">${escapeHtml(item.subtitle)}</p>` : ''}${item.basis ? `<p class="mini">${escapeHtml(item.basis)}</p>` : ''}<p class="muted">${escapeHtml(item.text)}</p>${item.points?.length ? `<ul>${item.points.map((point) => `<li>${escapeHtml(point)}</li>`).join('')}</ul>` : ''}`;
    if (item.href && item.linkLabel) return `<div class="card">${body}<a class="mini" href="${escapeHtml(item.href)}">${escapeHtml(item.linkLabel)} →</a></div>`;
    const linkedBody = `${body}${item.href ? '<span class="card__action">Explore <span aria-hidden="true">↗</span></span>' : ''}`;
    return item.href ? `<a class="card card--hover" href="${escapeHtml(item.href)}">${linkedBody}</a>` : `<div class="card">${linkedBody}</div>`;
  }).join('')}</div></div></section>`;
  }).join('\n');
}

function policySection(r) {
  return `<section class="section"><div class="wrap legal-policy"><p class="eyebrow">Policy record</p><p class="mini">Effective ${escapeHtml(r.effectiveDate)} · ${escapeHtml(r.policyOwner || 'Aloha AI, a DBA of Rayven-Nikkita Collins LLC · Honolulu, HI')}</p>${(r.policySections || []).map((section, index) => `<article class="card" style="margin-top:1rem"><h2>${Number.isFinite(section.order) ? `${section.order} · ` : ''}${escapeHtml(section.title)}</h2>${(section.paragraphs || []).map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join('')}${section.points?.length ? `<ul>${section.points.map((point) => `<li>${escapeHtml(point)}</li>`).join('')}</ul>` : ''}</article>`).join('')}</div></section>`;
}

function collectionSection(r, registry) {
  const contract = r.collection || {};
  const kinds = new Set(contract.kinds || []);
  const prefix = contract.pathPrefix || '';
  const selectedIds = Array.isArray(contract.resourceIds) ? new Set(contract.resourceIds) : null;
  const selectedOrder = Array.isArray(contract.resourceIds)
    ? new Map(contract.resourceIds.map((id, index) => [id, index]))
    : null;
  const items = [...registry.values()]
    .filter((item) => item.id !== r.id && (!selectedIds || selectedIds.has(item.id)) && (!kinds.size || kinds.has(item.kind)) && (!prefix || item.pathname.startsWith(prefix)))
    .sort((a, b) => selectedOrder
      ? selectedOrder.get(a.id) - selectedOrder.get(b.id)
      : a.title.localeCompare(b.title));
  return `<section class="section" id="collection-index" data-priority-collection="${contract.priority === true ? 'true' : 'false'}"><div class="wrap"><p class="eyebrow">${contract.priority === true ? 'Proof you can inspect' : 'Collection'}</p><h2 class="h2">${escapeHtml(contract.heading || `Explore ${r.title}`)}</h2><div class="grid grid-3">${items.map((item) => `<a class="card card--hover" href="${escapeHtml(item.pathname)}"><p class="mini">${escapeHtml(label(item.kind))} · ${escapeHtml(governedStatusLabel(item))}</p><h3>${escapeHtml(item.title)}</h3><p class="muted">${escapeHtml(item.summary)}</p><span class="mini">Inspect this ${escapeHtml(label(item.kind).toLowerCase())} →</span></a>`).join('')}</div></div></section>`;
}

function maturityLabel(maturity) {
  return ({
    Production: 'Production',
    Beta: 'Public beta',
    Research: 'Research-stage',
    Concept: 'Concept only',
    Archived: 'Archived'
  })[maturity] || maturity;
}

function governedStatusLabel(resource) {
  const release = resource?.releaseState;
  // Direct renderer unit fixtures do not pass through build-site's mandatory
  // registry join. Production generation fails before rendering if state is absent.
  if (!release) return maturityLabel(resource?.maturity);
  if (release.approvalDecision !== 'approved-conservative-local') return 'Release state unavailable';
  const status = release.status || {};
  if (status.publication !== 'published') return 'Not published';
  if (status.access === 'unavailable') return 'Description only · access unavailable';
  if (resource.kind === 'monitor' && status.maintenance === 'dated') return 'Dated record · not maintained';
  if (['tool', 'assessment'].includes(resource.kind)) {
    if (status.interaction === 'working' && status.evaluation === 'limited') return `Browser-local ${resource.kind} · bounded evaluation`;
    if (status.interaction === 'working') return `Browser-local ${resource.kind} · not evaluated`;
    if (status.interaction === 'demonstration') return 'Demonstration · not evaluated';
  }
  if (resource.kind === 'service' && status.commercial === 'scoped') return 'Scoped service · engagement required';
  if (status.completeness === 'complete') return 'Published content resource';
  if (status.completeness === 'partial') return 'Published partial resource';
  return 'Published research record';
}

function assessmentSection(r, registry) {
  const questions = r.assessment?.questions || [];
  if (!questions.length) return '';
  const form = questions.map((question, index) => `<fieldset class="card"><legend><strong>${index + 1}. ${escapeHtml(question.prompt)}</strong></legend>${question.options.map((option) => `<label style="display:block;margin:.75rem 0"><input type="${question.multiple ? 'checkbox' : 'radio'}" name="${escapeHtml(question.id)}" value="${escapeHtml(option.value)}" data-label="${escapeHtml(option.label)}" data-dimension="${escapeHtml(option.dimension || '')}" data-score="${Number.isFinite(option.score) ? option.score : 1}"> ${escapeHtml(option.label)}</label>`).join('')}${question.multiple ? '' : `<label style="display:block;margin:.75rem 0"><input type="radio" name="${escapeHtml(question.id)}" value="__unknown" data-label="Unknown or not yet verified"> Unknown or not yet verified</label><label style="display:block;margin:.75rem 0"><input type="radio" name="${escapeHtml(question.id)}" value="__na" data-label="Not applicable"> Not applicable</label>`}</fieldset>`).join('');
  const rules = JSON.stringify((r.assessment.recommendations || []).map((rule) => ({
    ...rule,
    resources: (rule.resourceIds || []).map((id) => registry.get(id)).filter(Boolean).map((item) => ({ id: item.id, title: item.title, pathname: item.pathname }))
  }))).replaceAll('<', '\\u003c');
  const contractId = r.id === 'ai-twin-exposure-check'
    ? 'EV-ACT-TWIN-EXPOSURE'
    : r.id === 'university-assessment'
      ? 'EV-ACT-UNIVERSITY-ROUTING-ASSESSMENT'
      : 'EV-ACT-ASSESSMENT-FAMILY';
  const assessmentId = JSON.stringify(r.id).replaceAll('<', '\\u003c');
  return `<section class="section" data-ev-contract="${contractId}"><div class="wrap"><p class="eyebrow">Interactive assessment</p><h2 class="h2">Answer every question to generate a private, on-device starting point.</h2><noscript><div class="card"><strong>JavaScript is required for this browser-local assessment.</strong> The questions remain visible, but no score can be generated or exported.</div></noscript><form id="structured-assessment" class="grid" style="gap:1rem" novalidate aria-describedby="assessment-rule"><p id="assessment-rule" class="muted">Rule version 1.1.0. Unknown and not-applicable answers remain visible in the result and never count as evidence of readiness.</p>${form}<p><button class="btn btn--primary" type="submit">Show my roadmap</button> <button class="btn btn--outline" type="reset">Clear</button></p></form><div id="assessment-errors" class="card" role="alert" hidden></div><p id="assessment-status" class="muted" role="status" aria-live="polite">No result has been generated.</p><div id="assessment-result" class="card" hidden aria-live="polite"></div><p><button class="btn btn--outline" id="assessment-copy" type="button" disabled>Copy review record</button> <button class="btn btn--outline" id="assessment-json" type="button" disabled>Download JSON</button></p></div></section><script>(function(){var form=document.getElementById('structured-assessment'),out=document.getElementById('assessment-result'),rules=${rules},assessmentId=${assessmentId},copy=document.getElementById('assessment-copy'),download=document.getElementById('assessment-json'),record=null;if(!form||!out)return;function textRecord(){return 'Assessment self-review — rule '+record.ruleVersion+'\\nGenerated: '+record.generatedAt+'\\nAssessment: '+record.assessmentId+'\\nDirectional total: '+record.total+'\\nAnswers:\\n'+record.answers.map(function(answer,index){return (index+1)+'. '+answer.id+': '+answer.label+' — '+answer.rationale;}).join('\\n')+'\\nBoundary: '+record.notice;}form.addEventListener('submit',function(e){e.preventDefault();var shell=window.AlohaState.create({form:form,result:out,errors:'assessment-errors',status:'assessment-status'}),missing=[],answers=[],scores={};${JSON.stringify(questions.map((q)=>q.id))}.forEach(function(id,index){var selected=form.querySelector('[name="'+id+'"]:checked');if(!selected)missing.push('Answer question '+(index+1)+'.');else answers.push({id:id,label:selected.dataset.label||selected.value,value:selected.value,dimension:selected.dataset.dimension||'',score:Number(selected.dataset.score||0)});});if(missing.length){record=null;copy.disabled=true;download.disabled=true;return shell.invalid(missing);}answers.forEach(function(answer){answer.rationale=answer.value==='__unknown'?'Kept as unknown; no readiness credit.':answer.value==='__na'?'Marked not applicable; applicability requires human review.':(answer.dimension||'Context')+' contribution '+answer.score+'.';if(answer.dimension&&answer.value!=='__unknown'&&answer.value!=='__na')scores[answer.dimension]=(scores[answer.dimension]||0)+answer.score;});var ranked=Object.keys(scores).sort(function(a,b){return scores[b]-scores[a];}).slice(0,3),total=Object.values(scores).reduce(function(sum,value){return sum+value;},0),links=[];rules.filter(function(rule){return !rule.dimension||ranked.includes(rule.dimension);}).forEach(function(rule){(rule.resources||[]).forEach(function(item){if(!links.some(function(link){return link.id===item.id;}))links.push(item);});});record={schema:'aloha-ai-assessment-self-review/1.0',assessmentId:assessmentId,ruleVersion:'1.1.0',generatedAt:new Date().toISOString(),answers:answers,total:total,rankedDimensions:ranked,recommendedResourceIds:links.map(function(item){return item.id;}),notice:'Browser-local directional self-review only; not a readiness, legal, compliance, or professional certification.'};var esc=window.AlohaState.escapeHtml;var explanation='<ol>'+answers.map(function(answer){return '<li><strong>'+esc(answer.label)+'</strong> — '+esc(answer.rationale)+'</li>';}).join('')+'</ol>';shell.complete('<p class="eyebrow">Your roadmap · rule 1.1.0</p><h2>Start with '+esc(ranked.length?ranked.join(', ').replaceAll('_',' '):'a bounded workflow')+'.</h2><p>Directional signal total: <strong>'+total+'</strong>. This is not a readiness certification.</p><h3>Why this result appeared</h3>'+explanation+'<p>Recommended canonical resources: '+links.map(function(item){return '<a href="'+item.pathname+'">'+item.title+'</a>';}).join(' · ')+'</p><p class="muted">'+esc(record.notice)+'</p>','Complete result generated from '+answers.length+' answered questions.');copy.disabled=false;download.disabled=false;});form.addEventListener('reset',function(){setTimeout(function(){record=null;copy.disabled=true;download.disabled=true;window.AlohaState.create({form:form,result:out,errors:'assessment-errors',status:'assessment-status'}).reset();},0);});copy.onclick=function(){if(record)window.AlohaActions.copy(textRecord());};download.onclick=function(){if(record)window.AlohaActions.download({content:JSON.stringify(record,null,2),filename:assessmentId+'-self-review-v1.json',mimeType:'application/json;charset=utf-8',version:'1.1.0',license:'Private self-review; not a certification or professional determination.'});};})();</script>`;
}

function demoSection(r) {
  if (r.demo?.type === 'citation-verifier') return citationVerifierSection(r);
  if (r.demo?.type === 'structured-form') return structuredFormSectionV2(r);
  if (r.demo?.type === 'browser-tool') return browserToolSectionV2(r);
  if (r.kind === 'monitor' && r.monitor) return monitorDashboardSection(r);
  if (r.demo?.type !== 'trust-safe-twin') return '';
  const records = JSON.stringify(r.demo.seededRecords || []).replaceAll('<', '\\u003c');
  const unsafeDraft = JSON.stringify(r.demo.unsafeDraft || '').replaceAll('<', '\\u003c');
  const safeDraft = JSON.stringify(r.demo.safeDraft || '').replaceAll('<', '\\u003c');
  const sampleRiskText = JSON.stringify(r.demo.sampleRiskText || '').replaceAll('<', '\\u003c');
  return `<section class="section"><div class="wrap"><p class="eyebrow">Interactive lab</p><h2 class="h2">Experience the operating model.</h2><div class="grid grid-2"><div class="card"><h3>Local CRM context</h3><p class="muted">Seeded records stay in this browser.</p><div id="demo-records"></div></div><div class="card"><h3>Unsafe versus governed</h3><button class="btn btn--primary" type="button" id="demo-generate">Generate comparison</button><p><strong>Unsafe AI</strong></p><div id="demo-unsafe" class="card"></div><p><strong>Trust-Safe Twin</strong></p><div id="demo-safe" class="card"></div></div><div class="card"><h3>Guardrail screen</h3><textarea id="demo-risk" style="width:100%;min-height:8rem"></textarea><p><button class="btn btn--outline" type="button" id="demo-screen">Run guardrails</button></p><div id="demo-rails" aria-live="polite"></div></div><div class="card"><h3>Human review</h3><textarea id="demo-review" style="width:100%;min-height:8rem"></textarea><p><button class="btn btn--primary" type="button" id="demo-approve">Approve locally</button> <button class="btn btn--outline" type="button" id="demo-reject">Reject</button></p><p id="demo-status" class="muted">Nothing has been sent.</p></div></div></div></section><script>(function(){var records=${records},unsafe=${unsafeDraft},safe=${safeDraft},risk=${sampleRiskText};var byId=function(id){return document.getElementById(id);};byId('demo-records').innerHTML=records.map(function(row){return '<p><strong>'+escapeDemo(row.name)+'</strong> · '+escapeDemo(row.company)+'<br><span class="muted">'+escapeDemo(row.vertical)+' · '+escapeDemo(row.status)+'</span></p>';}).join('');byId('demo-risk').value=risk;function generate(){byId('demo-unsafe').textContent=unsafe;byId('demo-safe').textContent=safe;byId('demo-review').value=safe;}function screen(){var text=byId('demo-risk').value;var checks=[['Injection',/ignore previous|system prompt|disregard/i.test(text)],['Unsupported claim',/guarantee|10x|cure|eliminate errors/i.test(text)],['Personal data',/[\\w.+-]+@[\\w-]+\\.[\\w.-]+/.test(text)],['Human approval',true]];byId('demo-rails').innerHTML=checks.map(function(check){return '<p><strong>'+check[0]+':</strong> '+(check[1]?'BLOCK':'PASS')+'</p>';}).join('');}function escapeDemo(value){return String(value||'').replace(/[&<>"']/g,function(mark){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[mark];});}byId('demo-generate').onclick=generate;byId('demo-screen').onclick=screen;byId('demo-approve').onclick=function(){byId('demo-status').textContent='Approved locally. Production delivery remains disabled.';};byId('demo-reject').onclick=function(){byId('demo-status').textContent='Rejected. Nothing was sent.';};generate();screen();})();</script>`;
}

function citationVerifierSection(r) {
  const sample = JSON.stringify(r.demo.sample || '').replaceAll('<', '\\u003c');
  return `<section class="section citation-instrument" aria-labelledby="citation-instrument-title" data-ev-contract="EV-ACT-002"><div class="wrap">
<p class="eyebrow">Browser-local structural parser</p><h2 class="h2" id="citation-instrument-title">Create a citation structure review record.</h2>
<div class="grid grid-2"><form id="citation-verifier-form" class="card" novalidate><label for="citation-draft"><strong>Paste a brief or passage</strong></label><textarea id="citation-draft" style="width:100%;min-height:16rem;margin-top:.75rem" placeholder="Paste text containing U.S. reporter citations"></textarea><p><button class="btn btn--primary" type="submit">Check citation structure</button> <button class="btn btn--outline" id="citation-sample" type="button">Load sample</button> <button class="btn btn--ghost" type="reset">Clear</button></p><div id="citation-errors" class="card" role="alert" hidden></div><p class="muted">Rule version 1.0.0. This parser does not retrieve sources, confirm that an opinion exists, check subsequent history, or decide whether authority supports a proposition.</p></form>
<div class="card"><p class="eyebrow">Review result</p><p id="citation-status" class="muted" role="status" aria-live="polite">No review record generated.</p><div id="citation-result" hidden aria-live="polite"></div><p><button class="btn btn--outline" id="citation-copy" type="button" disabled>Copy review record</button> <button class="btn btn--outline" id="citation-json" type="button" disabled>Download JSON</button></p></div></div>
</div></section><script>(function(){var form=document.getElementById('citation-verifier-form'),input=document.getElementById('citation-draft'),out=document.getElementById('citation-result'),sample=${sample},copy=document.getElementById('citation-copy'),download=document.getElementById('citation-json'),record=null;if(!form||!input||!out)return;var reporters={'U.S.':1,'S. Ct.':1,'L. Ed.':1,'F.':1,'F.2d':1,'F.3d':1,'F.4th':1,'F. Supp.':1,'F. Supp. 2d':1,'F. Supp. 3d':1};function esc(v){return window.AlohaState.escapeHtml(v);}function textRecord(){return 'Citation structure review — rule '+record.ruleVersion+'\\nGenerated: '+record.generatedAt+'\\n'+record.rows.map(function(row,index){return (index+1)+'. '+row.citation+' — '+(row.issues.length?row.issues.join('; '):'Structure appears plausible; existence and proposition support remain unverified.')}).join('\\n')+'\\nBoundary: '+record.notice;}function run(){var shell=window.AlohaState.create({form:form,result:out,errors:'citation-errors',status:'citation-status'}),text=input.value.trim(),re=/\\b(\\d{1,4})\\s+(U\\.S\\.|S\\. Ct\\.|L\\. Ed\\.|F\\.|F\\.2d|F\\.3d|F\\.4th|F\\.4d|F\\. Supp\\.(?:\\s+(?:2d|3d|4th|5th))?)\\s+(\\d{1,5})(?:[^()]{0,80})?\\((\\d{4})\\)/g,rows=[],m,year=new Date().getFullYear();if(!text){record=null;copy.disabled=true;download.disabled=true;return shell.invalid(['Paste a passage before running the structural parser.']);}while((m=re.exec(text))){var reporter=m[2].replace(/\\s+/g,' ').trim(),issues=[];if(!reporters[reporter])issues.push('Reporter series is not recognized');if(Number(m[1])<1||Number(m[3])<1)issues.push('Volume or page is malformed');if(Number(m[4])>year)issues.push('Year is in the future');rows.push({citation:m[0].trim(),issues:issues});}record={schema:'aloha-ai-citation-structure-review/1.0',ruleVersion:'1.0.0',generatedAt:new Date().toISOString(),sourceText:text,rows:rows,notice:'Browser-local structural review only; every authority, status, quotation, and proposition requires qualified human verification.'};var flagged=rows.filter(function(row){return row.issues.length;}).length,body=rows.length?'<h3>'+flagged+' of '+rows.length+' citation'+(rows.length===1?'':'s')+' structurally flagged</h3><ol>'+rows.map(function(row){return'<li><strong>'+esc(row.citation)+'</strong><br><span>'+(row.issues.length?esc(row.issues.join('; ')):'Structure appears plausible; existence and proposition support remain unverified.')+'</span></li>';}).join('')+'</ol>':'<h3>No supported U.S. reporter citations detected.</h3><p>This is an explicit completed result, not a finding that the passage has no citations or citation problems.</p>';shell.complete(body+'<p class="muted">'+esc(record.notice)+'</p>','Citation structure review record generated.');copy.disabled=false;download.disabled=false;}form.addEventListener('submit',function(e){e.preventDefault();run();});form.addEventListener('reset',function(){setTimeout(function(){record=null;copy.disabled=true;download.disabled=true;window.AlohaState.create({form:form,result:out,errors:'citation-errors',status:'citation-status'}).reset();},0);});document.getElementById('citation-sample').onclick=function(){input.value=sample;run();};copy.onclick=function(){if(record)window.AlohaActions.copy(textRecord());};download.onclick=function(){if(record)window.AlohaActions.download({content:JSON.stringify(record,null,2),filename:'citation-structure-review-v1.json',mimeType:'application/json;charset=utf-8',version:'1.0.0',license:'Private review record; not legal advice or verified authority.'});};})();</script>`;
}

function structuredFormSection(r) {
  const contract = JSON.stringify(r.demo).replaceAll('<', '\\u003c');
  const requiredFields = new Set(r.demo.requiredFields || []);
  const fields = (r.demo.fields || []).map((field) => {
    const id = `structured-field-${field.id}`;
    const required = requiredFields.has(field.id) ? ' <span aria-hidden="true">*</span><span class="visually-hidden"> required</span>' : '';
    const hint = field.hint ? `<span class="muted" style="display:block;margin:.25rem 0 .5rem">${escapeHtml(field.hint)}</span>` : '';
    if (field.type === 'textarea') return `<label for="${escapeHtml(id)}"><strong>${escapeHtml(field.label)}${required}</strong>${hint}<textarea id="${escapeHtml(id)}" name="${escapeHtml(field.id)}" placeholder="${escapeHtml(field.placeholder || '')}" style="width:100%;min-height:7rem"></textarea></label>`;
    if (field.type === 'select') return `<label for="${escapeHtml(id)}"><strong>${escapeHtml(field.label)}${required}</strong>${hint}<select id="${escapeHtml(id)}" name="${escapeHtml(field.id)}" style="width:100%;padding:.75rem"><option value="">Choose one</option><option value="__unknown">Unknown or not yet verified</option><option value="__na">Not applicable</option>${(field.options || []).map((option) => `<option value="${escapeHtml(option.value)}">${escapeHtml(option.label)}</option>`).join('')}</select></label>`;
    if (field.type === 'radio' || field.type === 'checkbox') return `<fieldset><legend><strong>${escapeHtml(field.label)}${required}</strong></legend>${hint}${(field.options || []).map((option) => `<label style="display:block;margin:.6rem 0"><input type="${escapeHtml(field.type)}" name="${escapeHtml(field.id)}" value="${escapeHtml(option.value)}"> ${escapeHtml(option.label)}</label>`).join('')}${field.type === 'radio' ? `<label style="display:block;margin:.6rem 0"><input type="radio" name="${escapeHtml(field.id)}" value="__unknown"> Unknown or not yet verified</label><label style="display:block;margin:.6rem 0"><input type="radio" name="${escapeHtml(field.id)}" value="__na"> Not applicable</label>` : ''}</fieldset>`;
    return `<label for="${escapeHtml(id)}"><strong>${escapeHtml(field.label)}${required}</strong>${hint}<input id="${escapeHtml(id)}" name="${escapeHtml(field.id)}" type="text" placeholder="${escapeHtml(field.placeholder || '')}" style="width:100%;padding:.75rem"></label>`;
  }).join('');
  return `<section class="section"><div class="wrap"><p class="eyebrow">Interactive instrument</p><h2 class="h2">${escapeHtml(r.demo.title || r.demo.outputTitle || 'Build a structured starting point')}</h2><div class="grid grid-2"><form id="structured-form-tool" class="card" style="display:grid;gap:1rem">${fields}<p><button class="btn btn--primary" type="submit">${r.demo.mode === 'document' ? 'Preview contract' : 'Generate diagnostic'}</button> <button class="btn btn--outline" type="reset">Clear</button></p></form><div class="card"><p class="eyebrow">Structured output</p><div id="structured-form-output" aria-live="polite"><p class="muted">Complete the instrument to create a private, on-device result.</p></div>${r.demo.mode === 'document' ? '<p><button class="btn btn--outline" type="button" id="structured-form-download" disabled>Download Markdown</button> <button class="btn btn--ghost" type="button" id="structured-form-blank">Download blank template</button></p>' : ''}<p class="muted">Exports are UTF-8 Markdown files generated locally. No input leaves this page.</p></div></div></div></section><script>(function(){var c=${contract},form=document.getElementById('structured-form-tool'),out=document.getElementById('structured-form-output'),latest='';if(!form||!out)return;function esc(value){return String(value||'').replace(/[&<>"']/g,function(mark){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[mark];});}function values(){var result={};(c.fields||[]).forEach(function(field){var nodes=form.querySelectorAll('[name="'+field.id+'"]');if(field.type==='checkbox')result[field.id]=Array.prototype.filter.call(nodes,function(node){return node.checked;}).map(function(node){return node.value;});else if(field.type==='radio'){var selected=Array.prototype.find.call(nodes,function(node){return node.checked;});result[field.id]=selected?selected.value:'';}else{var selected=nodes[0];result[field.id]=selected?selected.value.trim():'';}});return result;}function markdown(data,blank){var lines=['# '+(c.outputTitle||'Structured document'),'','Export version: 1.0.0',''];(c.fields||[]).forEach(function(field){var value=blank?'':data[field.id];if(Array.isArray(value))value=value.join(', ');lines.push('## '+field.label,'',value||'[complete this field]','');});return lines.join('\\n');}function download(text,name){if(!window.AlohaActions)return;window.AlohaActions.download({content:text,filename:name||'structured-document.md',mimeType:'text/markdown;charset=utf-8',version:'1.0.0',license:'For recipient use; no legal advice.'});}function renderDocument(data){latest=markdown(data,false);out.innerHTML='<h3>'+esc(c.outputTitle||'Structured document')+'</h3>'+(c.fields||[]).map(function(field){var value=data[field.id];if(Array.isArray(value))value=value.join(', ');return '<div><p class="mini">'+esc(field.label)+'</p><p>'+esc(value||'[not yet completed]')+'</p></div>';}).join('');var button=document.getElementById('structured-form-download');if(button)button.disabled=false;}function optionFor(field,value){return (field.options||[]).find(function(option){return option.value===value;});}function renderScore(data){var total=0,dimensions={};(c.fields||[]).forEach(function(field){var selected=Array.isArray(data[field.id])?data[field.id]:[data[field.id]];selected.filter(Boolean).forEach(function(value){var option=optionFor(field,value);if(!option)return;var score=Number(option.score||0);total+=score;if(option.dimension)dimensions[option.dimension]=(dimensions[option.dimension]||0)+score;});});var band=(c.bands||[]).slice().sort(function(a,b){return b.min-a.min;}).find(function(item){return total>=item.min;})||{title:'Review needed',summary:'Inspect the underlying inputs.'};var ranked=Object.keys(dimensions).sort(function(a,b){return dimensions[b]-dimensions[a];});var recs=(c.recommendations||[]).filter(function(item){return !item.dimension||ranked.includes(item.dimension);});out.innerHTML='<p class="eyebrow">Directional result</p><h3>'+esc(total)+' / '+esc(c.maxScore||total)+' · '+esc(band.title)+'</h3><p>'+esc(band.summary)+'</p><p class="mini">Mechanisms surfaced: '+esc(ranked.join(' · ')||'insufficient input')+'</p><ol>'+recs.map(function(item){return '<li>'+esc(item.text)+'</li>';}).join('')+'</ol><p class="muted">This is an illustrative mechanism map, not a validated diagnostic or a guarantee of outcomes.</p>';}form.addEventListener('submit',function(e){e.preventDefault();var data=values();if(c.mode==='document')renderDocument(data);else renderScore(data);out.scrollIntoView({behavior:'smooth'});});form.addEventListener('reset',function(){setTimeout(function(){latest='';out.innerHTML='<p class="muted">Complete the instrument to create a private, on-device result.</p>';var button=document.getElementById('structured-form-download');if(button)button.disabled=true;},0);});var dl=document.getElementById('structured-form-download'),blank=document.getElementById('structured-form-blank');if(dl)dl.onclick=function(){if(latest)download(latest,c.downloadName);};if(blank)blank.onclick=function(){download(markdown({},true),'blank-'+(c.downloadName||'structured-document.md'));};})();</script>`;
}

function structuredFormSectionV2(r) {
  const c = r.demo;
  const contract = JSON.stringify(c).replaceAll('<', '\\u003c');
  const required = new Set(c.requiredFields || []);
  const fields = (c.fields || []).map((field) => {
    const id = `state-field-${field.id}`;
    const mark = required.has(field.id) ? ' <span aria-hidden="true">*</span><span class="visually-hidden"> required</span>' : '';
    const hint = field.hint ? `<span class="muted" style="display:block">${escapeHtml(field.hint)}</span>` : '';
    if (field.type === 'textarea') return `<label for="${id}"><strong>${escapeHtml(field.label)}${mark}</strong>${hint}<textarea id="${id}" name="${escapeHtml(field.id)}" style="width:100%;min-height:7rem" placeholder="${escapeHtml(field.placeholder || '')}"></textarea></label>`;
    if (field.type === 'select') return `<label for="${id}"><strong>${escapeHtml(field.label)}${mark}</strong>${hint}<select id="${id}" name="${escapeHtml(field.id)}"><option value="">Choose one</option><option value="__unknown">Unknown or not yet verified</option><option value="__na">Not applicable</option>${(field.options || []).map((option) => `<option value="${escapeHtml(option.value)}">${escapeHtml(option.label)}</option>`).join('')}</select></label>`;
    if (field.type === 'radio' || field.type === 'checkbox') return `<fieldset><legend><strong>${escapeHtml(field.label)}${mark}</strong></legend>${hint}${(field.options || []).map((option) => `<label style="display:block;margin:.6rem 0"><input type="${field.type}" name="${escapeHtml(field.id)}" value="${escapeHtml(option.value)}"> ${escapeHtml(option.label)}</label>`).join('')}${field.type === 'radio' ? `<label style="display:block"><input type="radio" name="${escapeHtml(field.id)}" value="__unknown"> Unknown or not yet verified</label><label style="display:block"><input type="radio" name="${escapeHtml(field.id)}" value="__na"> Not applicable</label>` : ''}</fieldset>`;
    return `<label for="${id}"><strong>${escapeHtml(field.label)}${mark}</strong>${hint}<input id="${id}" name="${escapeHtml(field.id)}" type="text" placeholder="${escapeHtml(field.placeholder || '')}"></label>`;
  }).join('');
  const documentActions = c.mode === 'document' ? `<p><button class="btn btn--outline" type="button" id="state-download" disabled>Download completed Markdown</button> <button class="btn btn--ghost" type="button" id="state-blank">Download blank template</button></p>` : '';
  return `<section class="section"><div class="wrap"><p class="eyebrow">Interactive instrument</p><h2 class="h2">${escapeHtml(c.title || c.outputTitle)}</h2><p class="muted">Rule version ${escapeHtml(c.ruleVersion || '1.0.0')}. Fields marked * are required for a complete result.</p><noscript><div class="card"><strong>JavaScript is required to generate this browser-local output.</strong> The field contract remains available for review.</div></noscript><div class="grid grid-2"><form id="state-form" class="card" style="display:grid;gap:1rem" novalidate>${fields}<p><button class="btn btn--primary" type="submit">${c.mode === 'document' ? 'Preview contract' : 'Generate diagnostic'}</button> <button class="btn btn--outline" type="reset">Clear</button></p><div id="state-errors" class="card" role="alert" hidden></div></form><div class="card"><p class="eyebrow">Structured output</p><p id="state-status" class="muted" role="status" aria-live="polite">No result has been generated.</p><div id="state-result" hidden aria-live="polite"></div>${documentActions}<p class="muted">Processed and exported locally. No input leaves this page.</p></div></div></div></section><script>(function(){var c=${contract},form=document.getElementById('state-form'),out=document.getElementById('state-result'),latest='';if(!form||!out)return;function esc(v){return window.AlohaState.escapeHtml(v);}function values(){var data={};(c.fields||[]).forEach(function(field){var nodes=form.querySelectorAll('[name="'+field.id+'"]');if(field.type==='checkbox')data[field.id]=Array.prototype.filter.call(nodes,function(node){return node.checked;}).map(function(node){return node.value;});else if(field.type==='radio'){var node=Array.prototype.find.call(nodes,function(item){return item.checked;});data[field.id]=node?node.value:'';}else data[field.id]=nodes[0]?nodes[0].value.trim():'';});return data;}function missing(data){return(c.requiredFields||[]).filter(function(id){var value=data[id];return Array.isArray(value)?!value.length:!value;}).map(function(id){var field=(c.fields||[]).find(function(item){return item.id===id;});return 'Complete '+(field?field.label:id)+'.';});}function markdown(data,blank){var lines=['# '+(c.outputTitle||'Structured document'),'','Rule version: '+(c.ruleVersion||'1.0.0'),'Status: '+(blank?'blank template':'draft — human approval required'),''];(c.fields||[]).forEach(function(field){var value=blank?'':data[field.id];if(Array.isArray(value))value=value.join(', ');lines.push('## '+field.label,'',value||'[complete this field]','');});lines.push('','## Human review boundary','','This browser-local draft does not enforce permissions, establish compliance, or replace qualified review.');return lines.join('\\n');}form.addEventListener('submit',function(event){event.preventDefault();var shell=window.AlohaState.create({form:form,result:out,errors:'state-errors',status:'state-status'}),data=values(),issues=missing(data);if(issues.length){latest='';var dl=document.getElementById('state-download');if(dl)dl.disabled=true;return shell.invalid(issues);}if(c.mode==='document'){latest=markdown(data,false);var rows=(c.fields||[]).map(function(field){var value=data[field.id];if(Array.isArray(value))value=value.join(', ');return '<div><p class="mini">'+esc(field.label)+'</p><p>'+esc(value||'[not provided]')+'</p></div>';}).join('');shell.complete('<p class="eyebrow">Complete draft · rule '+esc(c.ruleVersion||'1.0.0')+'</p><h3>'+esc(c.outputTitle)+'</h3>'+rows+'<p class="muted">Approval-ready only after accountable human and any required qualified-professional review.</p>','Complete draft generated. Human approval is still required.');document.getElementById('state-download').disabled=false;}else{var total=0,dimensions={},reasons=[];(c.fields||[]).forEach(function(field){var chosen=Array.isArray(data[field.id])?data[field.id]:[data[field.id]];chosen.forEach(function(value){var option=(field.options||[]).find(function(item){return item.value===value;});if(!option)return;var score=Number(option.score||0);total+=score;if(option.dimension)dimensions[option.dimension]=(dimensions[option.dimension]||0)+score;reasons.push(field.label+': '+option.label+' contributed '+score+' to '+(option.dimension||'context'));});});var band=(c.bands||[]).slice().sort(function(a,b){return b.min-a.min;}).find(function(item){return total>=item.min;})||{title:'Review needed',summary:'Inspect the inputs.'};var ranked=Object.keys(dimensions).sort(function(a,b){return dimensions[b]-dimensions[a];}),recs=(c.recommendations||[]).filter(function(item){return ranked.includes(item.dimension);});shell.complete('<p class="eyebrow">Directional result · need rule '+esc(c.ruleVersion||'1.0.0')+'</p><h3>'+total+' / '+esc(c.maxScore||total)+' · '+esc(band.title)+'</h3><p>'+esc(band.summary)+'</p><h4>Why this appeared</h4><ol>'+reasons.map(function(reason){return '<li>'+esc(reason)+'.</li>';}).join('')+'</ol><h4>Priority actions</h4><ol>'+recs.map(function(item){return '<li>'+esc(item.text)+'</li>';}).join('')+'</ol><p class="muted">Illustrative mechanism map only; not a validated diagnostic or guaranteed outcome.</p>','Complete directional result generated from all required inputs.');}});form.addEventListener('reset',function(){setTimeout(function(){latest='';var dl=document.getElementById('state-download');if(dl)dl.disabled=true;window.AlohaState.create({form:form,result:out,errors:'state-errors',status:'state-status'}).reset();},0);});var dl=document.getElementById('state-download'),blank=document.getElementById('state-blank');if(dl)dl.onclick=function(){if(latest)window.AlohaActions.download({content:latest,filename:c.downloadName,mimeType:'text/markdown;charset=utf-8',version:c.ruleVersion||'1.0.0',license:'Recipient draft; human approval required.'});};if(blank)blank.onclick=function(){window.AlohaActions.download({content:markdown({},true),filename:'blank-'+c.downloadName,mimeType:'text/markdown;charset=utf-8',version:c.ruleVersion||'1.0.0',license:'Template only.'});};})();</script>`;
}

function browserToolSectionV2(r) {
  const c = r.demo;
  const contract = JSON.stringify(c).replaceAll('<', '\\u003c');
  const policy = r.id === 'policy-generator';
  const bill = r.id === 'bill-analyzer';
  const ruleVersion = r.id === 'claims-checker' ? '1.1.0' : '1.0.0';
  if (r.id === 'claims-checker') return claimsCheckerSection(r, contract, ruleVersion);
  return `<section class="section"><div class="wrap"><p class="eyebrow">Interactive tool</p><h2 class="h2">${escapeHtml(c.outputTitle)}</h2><p class="muted">Deterministic rule version 1.0.0. Input is processed only in this browser.</p><noscript><div class="card"><strong>JavaScript is required to run this browser-local tool.</strong></div></noscript><div class="grid grid-2"><form id="browser-tool-form" class="card" novalidate><label for="browser-tool-input"><strong>${escapeHtml(c.inputLabel)}</strong></label><textarea id="browser-tool-input" style="width:100%;min-height:14rem"></textarea><p><button class="btn btn--primary" type="submit">Run locally</button> <button class="btn btn--outline" type="button" id="browser-tool-sample">Load sample</button> <button class="btn btn--ghost" type="reset">Clear</button></p><div id="browser-tool-errors" class="card" role="alert" hidden></div></form><div class="card"><p class="eyebrow">Structured output</p><p id="browser-tool-status" class="muted" role="status" aria-live="polite">No result has been generated.</p><div id="browser-tool-output" hidden aria-live="polite"></div><p><button id="browser-tool-copy" class="btn btn--ghost" type="button" disabled>Copy result</button> <button id="browser-tool-md" class="btn btn--outline" type="button" disabled>Download Markdown</button>${bill ? ' <button id="browser-tool-json" class="btn btn--outline" type="button" disabled>Download JSON</button>' : ''}${policy ? ' <button id="browser-tool-print" class="btn btn--outline" type="button" disabled>Print review copy</button>' : ''}</p></div></div></div></section><script>(function(){var c=${contract},form=document.getElementById('browser-tool-form'),input=document.getElementById('browser-tool-input'),out=document.getElementById('browser-tool-output'),record=null;function esc(v){return window.AlohaState.escapeHtml(v);}function disable(value){['browser-tool-copy','browser-tool-md','browser-tool-json','browser-tool-print'].forEach(function(id){var button=document.getElementById(id);if(button)button.disabled=value;});}function run(){var shell=window.AlohaState.create({form:form,result:out,errors:'browser-tool-errors',status:'browser-tool-status'}),text=input.value.trim();if(!text)return shell.invalid(['Enter source material before running the tool.']);var parts=[];if(c.mode==='analyze'){var lower=text.toLowerCase();parts=(c.signals||[]).map(function(signal){var hits=(signal.terms||[]).filter(function(term){return lower.includes(String(term).toLowerCase());});return{label:signal.label,hits:hits};});}else parts=(c.steps||[]).map(function(step){return{label:step,hits:[]};});record={tool:${JSON.stringify(r.id)},ruleVersion:'1.0.0',createdAt:new Date().toISOString(),input:text,sections:parts,limitations:${JSON.stringify(r.limitations || [])},humanReview:'Qualified human review required before reliance or adoption.'};var body=parts.map(function(part){return '<div><h3>'+esc(part.label)+'</h3><p>'+(part.hits.length?'Triggered by: <strong>'+part.hits.map(esc).join(', ')+'</strong>.':${policy ? "'Review and adapt this section to the supplied organizational facts.'" : "'No configured signal found; absence is not evidence that no obligation exists.'"})+'</p></div>';}).join('');shell.complete('<p class="eyebrow">Review record · rule 1.0.0</p><h3>'+esc(c.outputTitle)+'</h3>'+body+'<h4>Human-review boundary</h4><p>'+esc(record.humanReview)+'</p>','Complete review record generated. Verify it before reliance.');disable(false);}function md(){if(!record)return'';return ['# '+c.outputTitle,'','Rule version: '+record.ruleVersion,'Run date: '+record.createdAt,'','## Supplied material','',record.input,''].concat(record.sections.flatMap(function(part){return['## '+part.label,'',part.hits.length?'Triggered by: '+part.hits.join(', '):${policy ? "'Review and adapt this section.'" : "'No configured signal found.'"},''];}),['## Limitations',''].concat(record.limitations.map(function(item){return'- '+item;})),['','## Human review','',record.humanReview]).join('\\n');}form.addEventListener('submit',function(event){event.preventDefault();run();});form.addEventListener('reset',function(){setTimeout(function(){record=null;disable(true);window.AlohaState.create({form:form,result:out,errors:'browser-tool-errors',status:'browser-tool-status'}).reset();},0);});document.getElementById('browser-tool-sample').onclick=function(){input.value=c.sample||'';run();};document.getElementById('browser-tool-copy').onclick=function(){window.AlohaActions.copyText(md(),{success:'Review record copied.'});};document.getElementById('browser-tool-md').onclick=function(){window.AlohaActions.download({content:md(),filename:${JSON.stringify(r.id)}+'-review.md',mimeType:'text/markdown;charset=utf-8',version:'1.0.0',license:'Review draft; not professional advice.'});};var json=document.getElementById('browser-tool-json');if(json)json.onclick=function(){window.AlohaActions.download({content:JSON.stringify(record,null,2),filename:${JSON.stringify(r.id)}+'-review.json',mimeType:'application/json',version:'1.0.0',license:'Review draft; not professional advice.'});};var print=document.getElementById('browser-tool-print');if(print)print.onclick=function(){window.print();};disable(true);})();</script>`;
}

function claimsCheckerSection(r, contract, ruleVersion) {
  return `<section class="section"><div class="wrap"><p class="eyebrow">Interactive tool</p><h2 class="h2">${escapeHtml(r.demo.outputTitle)}</h2><p class="muted">Deterministic rule version ${ruleVersion}. U.S.-focused language screen; input is processed only in this browser.</p><noscript><div class="card"><strong>JavaScript is required to run this browser-local tool.</strong></div></noscript><div class="grid grid-2"><form id="browser-tool-form" class="card" novalidate><label for="browser-tool-input"><strong>${escapeHtml(r.demo.inputLabel)}</strong></label><textarea id="browser-tool-input" style="width:100%;min-height:14rem"></textarea><p><button class="btn btn--primary" type="submit">Run locally</button> <button class="btn btn--outline" type="button" id="browser-tool-sample">Load sample</button> <button class="btn btn--ghost" type="reset">Clear</button></p><div id="browser-tool-errors" class="card" role="alert" hidden></div></form><div class="card"><p class="eyebrow">Structured output</p><p id="browser-tool-status" class="muted" role="status" aria-live="polite">No result has been generated.</p><div id="browser-tool-output" hidden aria-live="polite"></div><p><button id="browser-tool-copy" class="btn btn--ghost" type="button" disabled>Copy result</button> <button id="browser-tool-md" class="btn btn--outline" type="button" disabled>Download Markdown</button></p></div></div></div></section><script>(function(){var c=${contract},version=${JSON.stringify(ruleVersion)},form=document.getElementById('browser-tool-form'),input=document.getElementById('browser-tool-input'),out=document.getElementById('browser-tool-output'),record=null;function esc(v){return window.AlohaState.escapeHtml(v);}function disable(v){document.getElementById('browser-tool-copy').disabled=v;document.getElementById('browser-tool-md').disabled=v;}function found(text,term){var escaped=String(term).replace(/[.*+?^\${}()|[\]\\]/g,'\\$&'),left=/^[a-z0-9]/i.test(term)?'\\b':'',right=/[a-z0-9]$/i.test(term)?'\\b':'';return new RegExp(left+escaped+right,'i').test(text);}function run(){var shell=window.AlohaState.create({form:form,result:out,errors:'browser-tool-errors',status:'browser-tool-status'}),text=input.value.trim();if(!text)return shell.invalid(['Enter source material before running the tool.']);var sections=(c.signals||[]).map(function(signal){return{label:signal.label,risk:signal.risk,regulator:signal.regulator,question:signal.question,hits:(signal.terms||[]).filter(function(term){return found(text,term);})};}),matches=sections.reduce(function(n,s){return n+s.hits.length;},0);record={tool:'claims-checker',ruleVersion:version,createdAt:new Date().toISOString(),scope:'U.S.-focused lexical screen for health-product marketing language; no product, jurisdiction, channel, evidence, or compliance determination.',input:text,outcome:matches?'review-signals-found':'no-configured-signal-abstention',sections:sections,limitations:${JSON.stringify(r.limitations || [])},humanReview:'Qualified human review against the product, complete context, evidence, channel, jurisdiction, and current authority is required before reliance.'};var body=sections.map(function(s){return '<div><h3>'+esc(s.label)+'</h3><p><strong>'+esc(s.risk)+' triage · '+esc(s.regulator)+'</strong></p><p>'+(s.hits.length?'Triggered by: <strong>'+s.hits.map(esc).join(', ')+'</strong>.':'No configured signal found in this category.')+'</p><p>Review question: '+esc(s.question)+'</p></div>';}).join('');var boundary=matches?'Configured signals found. They are prompts for review, not legal conclusions.':'No configured signal found. The tool abstains; this does not establish that the copy is lawful, supported, or outside regulatory review.';shell.complete('<p class="eyebrow">Review record · rule '+esc(version)+'</p><h3>'+esc(c.outputTitle)+'</h3><p><strong>'+esc(boundary)+'</strong></p>'+body+'<h4>Human-review boundary</h4><p>'+esc(record.humanReview)+'</p>','Complete bounded review record generated. Verify it before reliance.');disable(false);}function md(){if(!record)return'';return ['# '+c.outputTitle,'','Rule version: '+record.ruleVersion,'Run date: '+record.createdAt,'Outcome: '+record.outcome,'Scope: '+record.scope,'','## Supplied material','',record.input,''].concat(record.sections.flatMap(function(s){return['## '+s.label,'',s.risk+' triage · '+s.regulator,s.hits.length?'Triggered by: '+s.hits.join(', '):'No configured signal found; abstain from a compliance inference.','Review question: '+s.question,''];}),['## Limitations',''].concat(record.limitations.map(function(x){return'- '+x;})),['','## Human review','',record.humanReview]).join('\n');}form.addEventListener('submit',function(e){e.preventDefault();run();});form.addEventListener('reset',function(){setTimeout(function(){record=null;disable(true);window.AlohaState.create({form:form,result:out,errors:'browser-tool-errors',status:'browser-tool-status'}).reset();},0);});document.getElementById('browser-tool-sample').onclick=function(){input.value=c.sample||'';run();};document.getElementById('browser-tool-copy').onclick=function(){window.AlohaActions.copyText(md(),{success:'Review record copied.'});};document.getElementById('browser-tool-md').onclick=function(){window.AlohaActions.download({content:md(),filename:'claims-checker-review.md',mimeType:'text/markdown;charset=utf-8',version:version,license:'Review draft; not professional advice.'});};disable(true);})();</script>`;
}

function monitorDashboardSection(r, detailMode = false) {
  const contract = JSON.stringify(r.monitor).replaceAll('<', '\\u003c');
  const checks = (r.monitor.checks || []).map((check, index) => `<fieldset class="monitor-check" data-monitor-check="${index}"><legend><strong>${index + 1}. ${escapeHtml(check)}</strong></legend><div class="monitor-check__states"><label><input type="radio" name="monitor-check-${index}" value="evidenced"> Evidenced</label><label><input type="radio" name="monitor-check-${index}" value="not-evidenced"> Not evidenced</label><label><input type="radio" name="monitor-check-${index}" value="unknown"> Unknown</label><label><input type="radio" name="monitor-check-${index}" value="not-applicable"> Not applicable</label></div><label for="monitor-evidence-${index}"><span>Evidence reference and date</span><input id="monitor-evidence-${index}" name="monitor-evidence-${index}" type="text" placeholder="Record, owner, source, and YYYY-MM-DD"></label></fieldset>`).join('');
  return `<section class="${detailMode ? 'monitor-workspace' : 'section'}" data-ev-contract="EV-ACT-003:012"><div class="wrap wrap--wide"><div class="detail-section-head"><div><p class="eyebrow">Signal desk · Updated ${escapeHtml(r.monitor.updated)}</p><h2>Inspect the dated signals. Then test your own coverage.</h2></div><p>Illustrative records only. The filter and coverage check run on your device; nothing is sent or monitored externally.</p></div><div class="monitor-workspace__grid"><div class="monitor-panel monitor-panel--signals"><label for="monitor-filter"><strong>Show signal category</strong></label><select id="monitor-filter"><option value="">All categories</option>${(r.monitor.filters || []).map((filter) => `<option value="${escapeHtml(filter)}">${escapeHtml(filter)}</option>`).join('')}</select><div id="monitor-signals" aria-live="polite"></div></div><div class="monitor-panel monitor-panel--coverage"><p class="eyebrow">Evidence-state check</p><h3>What can you evidence today?</h3><p>Answer every row. “Evidenced” requires a dated reference; unknown and not-applicable remain visible and never count as coverage.</p><noscript><div class="card"><strong>JavaScript is required to calculate or export this browser-local review.</strong> The dated monitor record remains readable.</div></noscript><form id="monitor-coverage" novalidate>${checks}<p><button class="btn btn--primary" type="submit">Create coverage record</button> <button class="btn btn--ghost" type="reset">Clear</button></p><div id="monitor-errors" class="card" role="alert" hidden></div></form><p id="monitor-status" class="muted" role="status" aria-live="polite">No coverage record has been generated.</p><div id="monitor-score" hidden aria-live="polite"></div><p><button class="btn btn--outline" id="monitor-export-csv" type="button" disabled>Download CSV record</button></p></div></div></div></section><script>(function(){var c=${contract},monitorId=${JSON.stringify(r.id)},filter=document.getElementById('monitor-filter'),list=document.getElementById('monitor-signals'),form=document.getElementById('monitor-coverage'),score=document.getElementById('monitor-score'),exportButton=document.getElementById('monitor-export-csv'),record=null;if(!filter||!list||!form||!score)return;function esc(value){return window.AlohaState.escapeHtml(value);}function render(){var selected=filter.value,rows=(c.signals||[]).filter(function(row){return !selected||row.category===selected;});list.innerHTML=rows.length?rows.map(function(row,index){return '<article class="monitor-signal"><span>'+String(index+1).padStart(2,'0')+'</span><div><p class="mini">'+esc(row.date)+' · '+esc(row.category)+' · '+esc(row.confidence)+' confidence</p><h3>'+esc(row.title)+'</h3><p><strong>'+esc(row.status)+'</strong></p><p class="muted">Source: '+esc(row.source)+'</p></div></article>';}).join(''):'<p class="muted">No illustrative signals match this filter.</p>';}function csvCell(value){return '"'+String(value==null?'':value).replace(/"/g,'""')+'"';}function csv(){var rows=[['schema','monitor_id','rule_version','reviewed_at','check','state','evidence_reference']];record.answers.forEach(function(answer){rows.push(['aloha-ai-monitor-coverage/1.0',record.monitorId,record.ruleVersion,record.reviewedAt,answer.check,answer.state,answer.evidence]);});return rows.map(function(row){return row.map(csvCell).join(',');}).join('\r\n');}filter.onchange=render;form.onsubmit=function(e){e.preventDefault();var shell=window.AlohaState.create({form:form,result:score,errors:'monitor-errors',status:'monitor-status'}),answers=[],issues=[];(c.checks||[]).forEach(function(check,index){var selected=form.querySelector('[name="monitor-check-'+index+'"]:checked'),evidence=form.elements['monitor-evidence-'+index].value.trim();if(!selected){issues.push('Choose an evidence state for check '+(index+1)+'.');return;}if(selected.value==='evidenced'&&!evidence){issues.push('Add a dated evidence reference for check '+(index+1)+' or choose a different state.');return;}answers.push({check:check,state:selected.value,evidence:evidence});});if(issues.length){record=null;exportButton.disabled=true;return shell.invalid(issues);}var applicable=answers.filter(function(answer){return answer.state!=='not-applicable';}),evidenced=answers.filter(function(answer){return answer.state==='evidenced';}),unknown=answers.filter(function(answer){return answer.state==='unknown';}),pct=applicable.length?Math.round(evidenced.length/applicable.length*100):0,label=pct>=80?'Higher documented coverage':pct>=50?'Partial documented coverage':'Material evidence gaps';record={schema:'aloha-ai-monitor-coverage/1.0',monitorId:monitorId,ruleVersion:'1.0.0',reviewedAt:new Date().toISOString(),answers:answers,notice:'Browser-local directional record; not external monitoring, certification, or professional advice.'};var rationale='<ol>'+answers.map(function(answer){return '<li><strong>'+esc(answer.check)+'</strong> — '+esc(answer.state.replaceAll('-',' '))+(answer.evidence?'; reference: '+esc(answer.evidence):'; no evidence reference recorded')+'.</li>';}).join('')+'</ol>';shell.complete('<div class="monitor-result"><p class="eyebrow">Evidence-state record · rule 1.0.0</p><h3>'+pct+'% · '+label+'</h3><p>'+evidenced.length+' evidenced, '+unknown.length+' unknown, '+(answers.length-applicable.length)+' not applicable, across '+answers.length+' answered checks.</p><h4>Answer-level record</h4>'+rationale+'<p class="muted">This is a self-record, not proof that a control is effective or current. Verify evidence, scope, authority, jurisdiction, applicability, and accountable review as the subject requires.</p></div>','Complete coverage record generated from every check.');exportButton.disabled=false;};form.addEventListener('reset',function(){setTimeout(function(){record=null;exportButton.disabled=true;window.AlohaState.create({form:form,result:score,errors:'monitor-errors',status:'monitor-status'}).reset();},0);});exportButton.onclick=function(){if(!record)return;window.AlohaActions.download({content:csv(),filename:monitorId+'-coverage-v1.csv',mimeType:'text/csv;charset=utf-8',version:'1.0.0',license:'Private self-review record; not certification or professional advice.'});};render();})();</script>`;
}

function browserToolSection(r) {
  const contract = JSON.stringify(r.demo).replaceAll('<', '\\u003c');
  return `<section class="section"><div class="wrap"><p class="eyebrow">Interactive tool</p><h2 class="h2">${escapeHtml(r.demo.outputTitle || 'Generate a structured starting point')}</h2><div class="grid grid-2"><div class="card"><label for="browser-tool-input"><strong>${escapeHtml(r.demo.inputLabel || 'Enter the material to review')}</strong></label><textarea id="browser-tool-input" style="width:100%;min-height:14rem;margin-top:.75rem"></textarea><p><button class="btn btn--primary" type="button" id="browser-tool-run">Run locally</button> <button class="btn btn--outline" type="button" id="browser-tool-sample">Load sample</button> <button class="btn btn--ghost" type="button" id="browser-tool-clear">Clear</button></p><p class="muted">Your input is processed in this browser and is not sent anywhere.</p></div><div class="card"><p class="eyebrow">Structured output</p><div id="browser-tool-output" aria-live="polite"><p class="muted">Run the tool to create a reviewable starting point.</p></div></div></div></div></section><script>(function(){var c=${contract},input=document.getElementById('browser-tool-input'),out=document.getElementById('browser-tool-output');if(!input||!out)return;function esc(value){return String(value||'').replace(/[&<>"']/g,function(mark){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[mark];});}function run(){var text=input.value.trim();if(!text){out.innerHTML='<p>Please enter material to review.</p>';return;}var body='';if(c.mode==='analyze'){var lower=text.toLowerCase();body=(c.signals||[]).map(function(signal){var hits=(signal.terms||[]).filter(function(term){return lower.includes(String(term).toLowerCase());});return '<div><h3>'+esc(signal.label)+'</h3><p>'+(hits.length?'Review triggered by: <strong>'+hits.map(esc).join(', ')+'</strong>.':'No configured signal found.')+'</p></div>';}).join('');}else{body='<ol>'+(c.steps||[]).map(function(step){return '<li>'+esc(step)+'</li>';}).join('')+'</ol><p><strong>Apply this framework to:</strong> '+esc(text)+'</p>';}out.innerHTML='<h3>'+esc(c.outputTitle||'Result')+'</h3>'+body+'<p class="muted">This deterministic output is a starting point. Verify it against the complete record and current authority.</p>';}document.getElementById('browser-tool-run').onclick=run;document.getElementById('browser-tool-sample').onclick=function(){input.value=c.sample||'';run();};document.getElementById('browser-tool-clear').onclick=function(){input.value='';out.innerHTML='<p class="muted">Run the tool to create a reviewable starting point.</p>';};})();</script>`;
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
  const learning = ['learningHub', 'course', 'lesson', 'playbook', 'template', 'toolGuide', 'useCase', 'collection'].includes(r.kind);
  const governance = ['institutional', 'policy'].includes(r.kind);
  const isContact = r.pathname === '/university/contact';
  const isHome = r.pathname === '/';
  const title = isContact
    ? 'Choose the easiest way to reach RN.'
    : product
      ? 'Inspect the product before adopting it.'
      : learning
        ? 'Choose the next learning or implementation path.'
        : governance && !isHome
          ? 'Inspect the governing record and connected practice.'
          : 'Start with the workflow, decision, or evidence problem.';
  const primaryHref = isContact
    ? r.actions?.[0]?.href || '/university/contact#details'
    : ['/university/about', '/university/start-here'].includes(r.pathname)
      ? `${r.pathname}#institutional-record`
    : learning
      ? ['course', 'lesson', 'playbook', 'template', 'toolGuide', 'useCase'].includes(r.kind)
        ? `${r.pathname}#learning-record`
        : r.pathname === '/university'
          ? '/university/start-here'
          : r.kind === 'collection'
            ? `${r.pathname}#collection-index`
            : `${r.pathname}#details`
      : governance && !isHome
        ? '/about'
        : conversionHref(r, r.kind === 'service' ? serviceBranch(r) : 'not-sure');
  const primaryLabel = isContact
    ? r.actions?.[0]?.label || 'Book a call'
    : learning
      ? 'Start learning'
      : governance && !isHome
        ? 'About the practice'
        : 'Start a conversation';
  const secondaryHref = isContact ? r.actions?.[1]?.href || '/methods' : '/methods';
  const secondaryLabel = isContact ? r.actions?.[1]?.label || 'Inspect the methods' : 'Inspect the methods';
  return `<section class="section page-cta"><div class="wrap page-cta__inner"><div><p class="eyebrow">Next step</p><h2 class="h2">${title}</h2></div><div class="page-actions"><a class="btn btn--primary" href="${escapeHtml(primaryHref)}">${escapeHtml(primaryLabel)}</a><a class="btn btn--outline" href="${escapeHtml(secondaryHref)}">${escapeHtml(secondaryLabel)}</a></div></div></section>`;
}

function serviceBranch(r) {
  const topics = Array.isArray(r.topics) ? r.topics.join(' ') : (r.topics || '');
  const haystack = `${r.id || ''} ${r.title || ''} ${topics}`.toLowerCase();
  if (/legal/.test(haystack)) return 'legal-ai';
  if (/train|education|course/.test(haystack)) return 'training';
  if (/govern|risk|policy|compliance/.test(haystack)) return 'governance';
  if (/intelligence|monitor|research/.test(haystack)) return 'intelligence';
  if (/content|adoption|brand/.test(haystack)) return 'content-adoption';
  if (/advis|fractional|chief|coo/.test(haystack)) return 'advisory';
  if (/audit|assessment|diagnostic/.test(haystack)) return 'audit';
  if (/architect|strategy|roadmap/.test(haystack)) return 'architecture';
  return 'build';
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
