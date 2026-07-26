const escapeHtml = (value = '') => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#039;');

const renderLink = (link = {}, className = 'btn btn--outline') => {
  if (!link.href || !link.label) return '';
  return `<a class="${className}" href="${escapeHtml(link.href)}">${escapeHtml(link.label)}</a>`;
};

const renderList = (items = [], ordered = false) => {
  if (!Array.isArray(items) || items.length === 0) return '';
  const tag = ordered ? 'ol' : 'ul';
  return `<${tag}>${items.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</${tag}>`;
};

export const sectionRenderers = {
  identity(section = {}) {
    return `<section class="section page-block" data-section="identity">
      <div class="wrap">
        <div class="page-block__head">
          <p class="eyebrow">${escapeHtml(section.eyebrow || 'Overview')}</p>
          <h2 class="h2">${escapeHtml(section.title || 'What this is')}</h2>
        </div>
        <div class="grid grid-2">
          <div class="measure">${(section.paragraphs || []).map((p) => `<p>${escapeHtml(p)}</p>`).join('')}</div>
          <dl class="fact-list">
            ${section.audience ? `<div><dt>For</dt><dd>${escapeHtml(section.audience)}</dd></div>` : ''}
            ${section.purpose ? `<div><dt>Purpose</dt><dd>${escapeHtml(section.purpose)}</dd></div>` : ''}
            ${section.status ? `<div><dt>Status</dt><dd><span class="chip chip--src">${escapeHtml(section.status)}</span></dd></div>` : ''}
            ${section.owner ? `<div><dt>Owner</dt><dd>${escapeHtml(section.owner)}</dd></div>` : ''}
          </dl>
        </div>
      </div>
    </section>`;
  },

  value(section = {}) {
    const cards = [
      ['Problem', section.problem],
      ['Current approach', section.currentApproach],
      ['Gap', section.gap],
      ['Aloha AI approach', section.approach],
      ['Expected outcome', section.outcome]
    ].filter(([, body]) => body);

    return `<section class="section section--paper page-block" data-section="value">
      <div class="wrap">
        <div class="page-block__head"><p class="eyebrow">Value</p><h2 class="h2">${escapeHtml(section.title || 'What changes')}</h2></div>
        <div class="grid grid-3">${cards.map(([title, body]) => `<article class="card"><h3>${escapeHtml(title)}</h3><p>${escapeHtml(body)}</p></article>`).join('')}</div>
      </div>
    </section>`;
  },

  evidence(section = {}) {
    const items = Array.isArray(section.items) ? section.items : [];
    return `<section class="section page-block" data-section="evidence">
      <div class="wrap">
        <div class="page-block__head"><p class="eyebrow">Evidence</p><h2 class="h2">${escapeHtml(section.title || 'What supports this')}</h2></div>
        <div class="grid grid-3">${items.map((item) => `<article class="card evidence-card">
          ${item.type ? `<span class="chip chip--src">${escapeHtml(item.type)}</span>` : ''}
          <h3>${escapeHtml(item.title || '')}</h3>
          ${item.summary ? `<p>${escapeHtml(item.summary)}</p>` : ''}
          ${item.href ? `<p><a href="${escapeHtml(item.href)}">Open source</a></p>` : ''}
        </article>`).join('')}</div>
      </div>
    </section>`;
  },

  method(section = {}) {
    const columns = [
      ['Inputs', section.inputs],
      ['Processing', section.processing],
      ['Outputs', section.outputs],
      ['Human review', section.humanReview],
      ['Limitations', section.limitations],
      ['Assumptions', section.assumptions]
    ].filter(([, items]) => Array.isArray(items) && items.length);

    return `<section class="section section--ink page-block" data-section="method">
      <div class="wrap">
        <div class="page-block__head"><p class="eyebrow">Method</p><h2 class="h2">${escapeHtml(section.title || 'How it works')}</h2></div>
        <div class="grid grid-3">${columns.map(([title, items]) => `<article class="method-card"><h3>${escapeHtml(title)}</h3>${renderList(items)}</article>`).join('')}</div>
      </div>
    </section>`;
  },

  related(section = {}) {
    const items = Array.isArray(section.items) ? section.items : [];
    return `<section class="section section--paper page-block" data-section="related">
      <div class="wrap">
        <div class="page-block__head"><p class="eyebrow">Related</p><h2 class="h2">${escapeHtml(section.title || 'Continue through the ecosystem')}</h2></div>
        <div class="grid grid-3">${items.map((item) => `<a class="card card--hover resource-card" href="${escapeHtml(item.href || '#')}">
          ${item.type ? `<span class="chip">${escapeHtml(item.type)}</span>` : ''}
          <h3>${escapeHtml(item.title || '')}</h3>
          ${item.summary ? `<p>${escapeHtml(item.summary)}</p>` : ''}
        </a>`).join('')}</div>
      </div>
    </section>`;
  },

  cta(section = {}) {
    return `<section class="section page-cta" data-section="cta">
      <div class="wrap page-cta__inner">
        <div><p class="eyebrow">Next step</p><h2 class="h2">${escapeHtml(section.title || 'Choose what happens next')}</h2>${section.body ? `<p class="lead">${escapeHtml(section.body)}</p>` : ''}</div>
        <div class="page-actions">${renderLink(section.primary, 'btn btn--primary')}${renderLink(section.secondary, 'btn btn--outline')}</div>
      </div>
    </section>`;
  }
};

export const renderSection = (section = {}) => {
  const renderer = sectionRenderers[section.type];
  if (!renderer) throw new Error(`Unsupported section type: ${section.type || 'missing'}`);
  return renderer(section);
};

export const renderSections = (sections = []) => sections.map(renderSection).join('\n');
