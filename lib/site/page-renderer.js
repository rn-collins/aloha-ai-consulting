import { validatePage } from './content-model.js';
import { buildMetadata, renderMetadata } from './metadata.js';

export function renderPage({ kind, pathname, page }) {
  const validation = validatePage(kind, page);
  if (!validation.valid) {
    throw new Error(`${pathname}: missing required fields: ${validation.missing.join(', ')}`);
  }

  const metadata = buildMetadata({
    title: page.metaTitle || `${page.title} | Aloha AI`,
    description: page.metaDescription || page.summary,
    pathname,
    image: page.image
  });

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
${renderMetadata(metadata)}
<meta name="theme-color" content="#0A0A0B">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="stylesheet" href="/aloha-ds.css">
<link rel="stylesheet" href="/site-shell.css">
<link rel="stylesheet" href="/page-system.css">
</head>
<body data-page-kind="${escapeHtml(kind)}" data-pathname="${escapeHtml(pathname)}">
<a class="skip" href="#main">Skip to content</a>
<div data-site-header></div>
<main id="main">
${renderBreadcrumbs(page.breadcrumbs || [])}
${renderHero(page)}
${renderSections(page.sections || [])}
${renderRelated(page.related || [])}
${renderCta(page.primaryAction, page.secondaryAction)}
</main>
<div data-site-footer></div>
<script src="/browser-actions.js" defer></script>
<script type="module" src="/site-shell.js"></script>
</body>
</html>`;
}

function renderBreadcrumbs(items) {
  if (!items.length) return '';
  return `<nav class="page-breadcrumbs wrap" aria-label="Breadcrumb"><ol>${items.map((item, index) => `<li>${item.href && index < items.length - 1 ? `<a href="${escapeHtml(item.href)}">${escapeHtml(item.label)}</a>` : `<span aria-current="page">${escapeHtml(item.label)}</span>`}</li>`).join('')}</ol></nav>`;
}

function renderHero(page) {
  return `<header class="page-hero section--ink"><div class="wrap page-hero__inner">
    ${page.eyebrow ? `<p class="eyebrow">${escapeHtml(page.eyebrow)}</p>` : ''}
    <h1 class="display">${escapeHtml(page.title)}</h1>
    <p class="lead">${escapeHtml(page.summary)}</p>
    ${page.audience ? `<p class="page-hero__audience"><strong>For:</strong> ${escapeHtml(page.audience)}</p>` : ''}
    ${renderActionLinks(page.primaryAction, page.secondaryAction)}
  </div></header>`;
}

function renderSections(sections) {
  return sections.map((section) => `<section class="section ${section.surface ? `section--${escapeHtml(section.surface)}` : ''}"><div class="wrap">
    ${section.eyebrow ? `<p class="eyebrow">${escapeHtml(section.eyebrow)}</p>` : ''}
    ${section.title ? `<h2 class="h2">${escapeHtml(section.title)}</h2>` : ''}
    ${section.intro ? `<p class="lead">${escapeHtml(section.intro)}</p>` : ''}
    ${section.html || ''}
  </div></section>`).join('\n');
}

function renderRelated(items) {
  if (!items.length) return '';
  return `<section class="section section--paper"><div class="wrap"><p class="eyebrow">Continue exploring</p><h2 class="h2">Related work</h2><div class="grid grid-3 page-related">${items.map((item) => `<a class="card card--hover page-related__card" href="${escapeHtml(item.href)}"><p class="mono small muted">${escapeHtml(item.type || 'Resource')}</p><h3>${escapeHtml(item.title)}</h3>${item.summary ? `<p>${escapeHtml(item.summary)}</p>` : ''}<span class="page-link">Open →</span></a>`).join('')}</div></div></section>`;
}

function renderCta(primary, secondary) {
  if (!primary) return '';
  return `<section class="section page-cta"><div class="wrap page-cta__inner"><div><p class="eyebrow">Next step</p><h2 class="h2">Choose what happens next.</h2></div>${renderActionLinks(primary, secondary)}</div></section>`;
}

function renderActionLinks(primary, secondary) {
  return `<div class="page-actions"><a class="btn btn--primary" href="${escapeHtml(primary.href)}">${escapeHtml(primary.label)}</a>${secondary ? `<a class="btn btn--outline" href="${escapeHtml(secondary.href)}">${escapeHtml(secondary.label)}</a>` : ''}</div>`;
}

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}
