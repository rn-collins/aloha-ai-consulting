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
${kindSections(resource, registry)}
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

function kindSections(r, registry) {
  const specialized = {
    collection: collectionSection,
    assessment: assessmentSection
  };
  const lead = specialized[r.kind] ? specialized[r.kind](r, registry) : '';
  const demo = r.demo || r.monitor ? demoSection(r) : '';
  return lead + demo + sectionDescriptors(r).filter((section) => section.field !== 'collection').map((section) => section.mode === 'text'
    ? textSection(section.title, r[section.field], section.eyebrow)
    : listSection(section.title, r[section.field], section.eyebrow)).join('\n');
}

function collectionSection(r, registry) {
  const contract = r.collection || {};
  const kinds = new Set(contract.kinds || []);
  const prefix = contract.pathPrefix || '';
  const items = [...registry.values()]
    .filter((item) => item.id !== r.id && (!kinds.size || kinds.has(item.kind)) && (!prefix || item.pathname.startsWith(prefix)))
    .sort((a, b) => a.title.localeCompare(b.title));
  return `<section class="section"><div class="wrap"><p class="eyebrow">Collection</p><h2 class="h2">${escapeHtml(contract.heading || `Explore ${r.title}`)}</h2><div class="grid grid-3">${items.map((item) => `<a class="card card--hover" href="${escapeHtml(item.pathname)}"><p class="mini">${escapeHtml(label(item.kind))} · ${escapeHtml(item.maturity)}</p><h3>${escapeHtml(item.title)}</h3><p class="muted">${escapeHtml(item.summary)}</p><span class="mini">Open →</span></a>`).join('')}</div></div></section>`;
}

function assessmentSection(r, registry) {
  const questions = r.assessment?.questions || [];
  if (!questions.length) return '';
  const form = questions.map((question, index) => `<fieldset class="card"><legend><strong>${index + 1}. ${escapeHtml(question.prompt)}</strong></legend>${question.options.map((option) => `<label style="display:block;margin:.75rem 0"><input type="${question.multiple ? 'checkbox' : 'radio'}" name="${escapeHtml(question.id)}" value="${escapeHtml(option.value)}" data-dimension="${escapeHtml(option.dimension || '')}" data-score="${Number.isFinite(option.score) ? option.score : 1}"> ${escapeHtml(option.label)}</label>`).join('')}</fieldset>`).join('');
  const rules = JSON.stringify((r.assessment.recommendations || []).map((rule) => ({
    ...rule,
    resources: (rule.resourceIds || []).map((id) => registry.get(id)).filter(Boolean).map((item) => ({ id: item.id, title: item.title, pathname: item.pathname }))
  }))).replaceAll('<', '\\u003c');
  return `<section class="section"><div class="wrap"><p class="eyebrow">Interactive assessment</p><h2 class="h2">Answer the questions to generate a private, on-device starting point.</h2><form id="structured-assessment" class="grid" style="gap:1rem">${form}<p><button class="btn btn--primary" type="submit">Show my roadmap</button></p></form><div id="assessment-result" class="card" hidden aria-live="polite"></div></div></section><script>(function(){var form=document.getElementById('structured-assessment'),out=document.getElementById('assessment-result'),rules=${rules};if(!form||!out)return;form.addEventListener('submit',function(e){e.preventDefault();var scores={};form.querySelectorAll('input:checked').forEach(function(input){var key=input.dataset.dimension,score=Number(input.dataset.score||1);if(key)scores[key]=(scores[key]||0)+score;});var ranked=Object.keys(scores).sort(function(a,b){return scores[b]-scores[a];}).slice(0,3);var total=Object.values(scores).reduce(function(sum,value){return sum+value;},0);var links=[];rules.filter(function(rule){return !rule.dimension||ranked.includes(rule.dimension);}).forEach(function(rule){(rule.resources||[]).forEach(function(item){if(!links.some(function(link){return link.id===item.id;}))links.push(item);});});out.hidden=false;out.innerHTML='<p class="eyebrow">Your roadmap</p><h2>Start with '+(ranked.length?ranked.join(', ').replaceAll('_',' '):'a bounded workflow')+'.</h2><p>Directional signal total: <strong>'+total+'</strong>. Your answers were processed in this browser and were not sent anywhere.</p><p>Recommended canonical resources: '+links.map(function(item){return '<a href="'+item.pathname+'">'+item.title+'</a>';}).join(' · ')+'</p><p class="muted">This is structured educational guidance, not a validated diagnostic or professional advice.</p>';out.scrollIntoView({behavior:'smooth'});});})();</script>`;
}

function demoSection(r) {
  if (r.demo?.type === 'structured-form') return structuredFormSection(r);
  if (r.demo?.type === 'browser-tool') return browserToolSection(r);
  if (r.kind === 'monitor' && r.monitor) return monitorDashboardSection(r);
  if (r.demo?.type !== 'trust-safe-twin') return '';
  const records = JSON.stringify(r.demo.seededRecords || []).replaceAll('<', '\\u003c');
  const unsafeDraft = JSON.stringify(r.demo.unsafeDraft || '').replaceAll('<', '\\u003c');
  const safeDraft = JSON.stringify(r.demo.safeDraft || '').replaceAll('<', '\\u003c');
  const sampleRiskText = JSON.stringify(r.demo.sampleRiskText || '').replaceAll('<', '\\u003c');
  return `<section class="section"><div class="wrap"><p class="eyebrow">Interactive lab</p><h2 class="h2">Experience the operating model.</h2><div class="grid grid-2"><div class="card"><h3>Local CRM context</h3><p class="muted">Seeded records stay in this browser.</p><div id="demo-records"></div></div><div class="card"><h3>Unsafe versus governed</h3><button class="btn btn--primary" type="button" id="demo-generate">Generate comparison</button><p><strong>Unsafe AI</strong></p><div id="demo-unsafe" class="card"></div><p><strong>Trust-Safe Twin</strong></p><div id="demo-safe" class="card"></div></div><div class="card"><h3>Guardrail screen</h3><textarea id="demo-risk" style="width:100%;min-height:8rem"></textarea><p><button class="btn btn--outline" type="button" id="demo-screen">Run guardrails</button></p><div id="demo-rails" aria-live="polite"></div></div><div class="card"><h3>Human review</h3><textarea id="demo-review" style="width:100%;min-height:8rem"></textarea><p><button class="btn btn--primary" type="button" id="demo-approve">Approve locally</button> <button class="btn btn--outline" type="button" id="demo-reject">Reject</button></p><p id="demo-status" class="muted">Nothing has been sent.</p></div></div></div></section><script>(function(){var records=${records},unsafe=${unsafeDraft},safe=${safeDraft},risk=${sampleRiskText};var byId=function(id){return document.getElementById(id);};byId('demo-records').innerHTML=records.map(function(row){return '<p><strong>'+escapeDemo(row.name)+'</strong> · '+escapeDemo(row.company)+'<br><span class="muted">'+escapeDemo(row.vertical)+' · '+escapeDemo(row.status)+'</span></p>';}).join('');byId('demo-risk').value=risk;function generate(){byId('demo-unsafe').textContent=unsafe;byId('demo-safe').textContent=safe;byId('demo-review').value=safe;}function screen(){var text=byId('demo-risk').value;var checks=[['Injection',/ignore previous|system prompt|disregard/i.test(text)],['Unsupported claim',/guarantee|10x|cure|eliminate errors/i.test(text)],['Personal data',/[\\w.+-]+@[\\w-]+\\.[\\w.-]+/.test(text)],['Human approval',true]];byId('demo-rails').innerHTML=checks.map(function(check){return '<p><strong>'+check[0]+':</strong> '+(check[1]?'BLOCK':'PASS')+'</p>';}).join('');}function escapeDemo(value){return String(value||'').replace(/[&<>"']/g,function(mark){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[mark];});}byId('demo-generate').onclick=generate;byId('demo-screen').onclick=screen;byId('demo-approve').onclick=function(){byId('demo-status').textContent='Approved locally. Production delivery remains disabled.';};byId('demo-reject').onclick=function(){byId('demo-status').textContent='Rejected. Nothing was sent.';};generate();screen();})();</script>`;
}

function structuredFormSection(r) {
  const contract = JSON.stringify(r.demo).replaceAll('<', '\\u003c');
  const fields = (r.demo.fields || []).map((field) => {
    const id = `structured-field-${field.id}`;
    const hint = field.hint ? `<span class="muted" style="display:block;margin:.25rem 0 .5rem">${escapeHtml(field.hint)}</span>` : '';
    if (field.type === 'textarea') return `<label for="${escapeHtml(id)}"><strong>${escapeHtml(field.label)}</strong>${hint}<textarea id="${escapeHtml(id)}" name="${escapeHtml(field.id)}" placeholder="${escapeHtml(field.placeholder || '')}" style="width:100%;min-height:7rem"></textarea></label>`;
    if (field.type === 'select') return `<label for="${escapeHtml(id)}"><strong>${escapeHtml(field.label)}</strong>${hint}<select id="${escapeHtml(id)}" name="${escapeHtml(field.id)}" style="width:100%;padding:.75rem"><option value="">Choose one</option>${(field.options || []).map((option) => `<option value="${escapeHtml(option.value)}">${escapeHtml(option.label)}</option>`).join('')}</select></label>`;
    if (field.type === 'radio' || field.type === 'checkbox') return `<fieldset><legend><strong>${escapeHtml(field.label)}</strong></legend>${hint}${(field.options || []).map((option) => `<label style="display:block;margin:.6rem 0"><input type="${escapeHtml(field.type)}" name="${escapeHtml(field.id)}" value="${escapeHtml(option.value)}"> ${escapeHtml(option.label)}</label>`).join('')}</fieldset>`;
    return `<label for="${escapeHtml(id)}"><strong>${escapeHtml(field.label)}</strong>${hint}<input id="${escapeHtml(id)}" name="${escapeHtml(field.id)}" type="text" placeholder="${escapeHtml(field.placeholder || '')}" style="width:100%;padding:.75rem"></label>`;
  }).join('');
  return `<section class="section"><div class="wrap"><p class="eyebrow">Interactive instrument</p><h2 class="h2">${escapeHtml(r.demo.title || r.demo.outputTitle || 'Build a structured starting point')}</h2><div class="grid grid-2"><form id="structured-form-tool" class="card" style="display:grid;gap:1rem">${fields}<p><button class="btn btn--primary" type="submit">${r.demo.mode === 'document' ? 'Preview contract' : 'Generate diagnostic'}</button> <button class="btn btn--outline" type="reset">Clear</button></p></form><div class="card"><p class="eyebrow">Structured output</p><div id="structured-form-output" aria-live="polite"><p class="muted">Complete the instrument to create a private, on-device result.</p></div>${r.demo.mode === 'document' ? '<p><button class="btn btn--outline" type="button" id="structured-form-download" disabled>Download Markdown</button> <button class="btn btn--ghost" type="button" id="structured-form-blank">Download blank template</button></p>' : ''}<p class="muted">Everything runs in this browser. Nothing you enter is sent or stored.</p></div></div></div></section><script>(function(){var c=${contract},form=document.getElementById('structured-form-tool'),out=document.getElementById('structured-form-output'),latest='';if(!form||!out)return;function esc(value){return String(value||'').replace(/[&<>"']/g,function(mark){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[mark];});}function values(){var result={};(c.fields||[]).forEach(function(field){var nodes=form.querySelectorAll('[name="'+field.id+'"]');if(field.type==='checkbox')result[field.id]=Array.prototype.filter.call(nodes,function(node){return node.checked;}).map(function(node){return node.value;});else if(field.type==='radio'){var selected=Array.prototype.find.call(nodes,function(node){return node.checked;});result[field.id]=selected?selected.value:'';}else{var selected=nodes[0];result[field.id]=selected?selected.value.trim():'';}});return result;}function markdown(data,blank){var lines=['# '+(c.outputTitle||'Structured document'),''];(c.fields||[]).forEach(function(field){var value=blank?'':data[field.id];if(Array.isArray(value))value=value.join(', ');lines.push('## '+field.label,'',value||'[complete this field]','');});return lines.join('\\n');}function download(text,name){var blob=new Blob([text],{type:'text/markdown'}),link=document.createElement('a');link.href=URL.createObjectURL(blob);link.download=name||'structured-document.md';document.body.appendChild(link);link.click();link.remove();setTimeout(function(){URL.revokeObjectURL(link.href);},0);}function renderDocument(data){latest=markdown(data,false);out.innerHTML='<h3>'+esc(c.outputTitle||'Structured document')+'</h3>'+(c.fields||[]).map(function(field){var value=data[field.id];if(Array.isArray(value))value=value.join(', ');return '<div><p class="mini">'+esc(field.label)+'</p><p>'+esc(value||'[not yet completed]')+'</p></div>';}).join('');var button=document.getElementById('structured-form-download');if(button)button.disabled=false;}function optionFor(field,value){return (field.options||[]).find(function(option){return option.value===value;});}function renderScore(data){var total=0,dimensions={};(c.fields||[]).forEach(function(field){var selected=Array.isArray(data[field.id])?data[field.id]:[data[field.id]];selected.filter(Boolean).forEach(function(value){var option=optionFor(field,value);if(!option)return;var score=Number(option.score||0);total+=score;if(option.dimension)dimensions[option.dimension]=(dimensions[option.dimension]||0)+score;});});var band=(c.bands||[]).slice().sort(function(a,b){return b.min-a.min;}).find(function(item){return total>=item.min;})||{title:'Review needed',summary:'Inspect the underlying inputs.'};var ranked=Object.keys(dimensions).sort(function(a,b){return dimensions[b]-dimensions[a];});var recs=(c.recommendations||[]).filter(function(item){return !item.dimension||ranked.includes(item.dimension);});out.innerHTML='<p class="eyebrow">Directional result</p><h3>'+esc(total)+' / '+esc(c.maxScore||total)+' · '+esc(band.title)+'</h3><p>'+esc(band.summary)+'</p><p class="mini">Mechanisms surfaced: '+esc(ranked.join(' · ')||'insufficient input')+'</p><ol>'+recs.map(function(item){return '<li>'+esc(item.text)+'</li>';}).join('')+'</ol><p class="muted">This is an illustrative mechanism map, not a validated diagnostic or a guarantee of outcomes.</p>';}form.addEventListener('submit',function(e){e.preventDefault();var data=values();if(c.mode==='document')renderDocument(data);else renderScore(data);out.scrollIntoView({behavior:'smooth'});});form.addEventListener('reset',function(){setTimeout(function(){latest='';out.innerHTML='<p class="muted">Complete the instrument to create a private, on-device result.</p>';var button=document.getElementById('structured-form-download');if(button)button.disabled=true;},0);});var dl=document.getElementById('structured-form-download'),blank=document.getElementById('structured-form-blank');if(dl)dl.onclick=function(){if(latest)download(latest,c.downloadName);};if(blank)blank.onclick=function(){download(markdown({},true),'blank-'+(c.downloadName||'structured-document.md'));};})();</script>`;
}

function monitorDashboardSection(r) {
  const contract = JSON.stringify(r.monitor).replaceAll('<', '\\u003c');
  return `<section class="section"><div class="wrap"><p class="eyebrow">Monitor dashboard · Updated ${escapeHtml(r.monitor.updated)}</p><h2 class="h2">Inspect signals and test your coverage locally.</h2><div class="grid grid-2"><div class="card"><label for="monitor-filter"><strong>Signal category</strong></label><select id="monitor-filter" style="width:100%;margin:.75rem 0;padding:.75rem"><option value="">All categories</option>${(r.monitor.filters || []).map((filter) => `<option value="${escapeHtml(filter)}">${escapeHtml(filter)}</option>`).join('')}</select><div id="monitor-signals" aria-live="polite"></div></div><div class="card"><h3>Coverage check</h3><p class="muted">Select only controls you can evidence today.</p><form id="monitor-coverage">${(r.monitor.checks || []).map((check, index) => `<label style="display:block;margin:.75rem 0"><input type="checkbox" value="${index}"> ${escapeHtml(check)}</label>`).join('')}<p><button class="btn btn--primary" type="submit">Calculate coverage</button></p></form><div id="monitor-score" aria-live="polite"></div></div></div><p class="muted">This public demonstration uses illustrative records. Filters and coverage scoring run in your browser; nothing is sent or monitored externally.</p></div></section><script>(function(){var c=${contract},filter=document.getElementById('monitor-filter'),list=document.getElementById('monitor-signals'),form=document.getElementById('monitor-coverage'),score=document.getElementById('monitor-score');if(!filter||!list||!form||!score)return;function esc(value){return String(value||'').replace(/[&<>"']/g,function(mark){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[mark];});}function render(){var selected=filter.value,rows=(c.signals||[]).filter(function(row){return !selected||row.category===selected;});list.innerHTML=rows.length?rows.map(function(row){return '<article style="border-top:1px solid #ddd;padding:1rem 0"><p class="mini">'+esc(row.date)+' · '+esc(row.category)+' · '+esc(row.confidence)+' confidence</p><h3>'+esc(row.title)+'</h3><p><strong>'+esc(row.status)+'</strong></p><p class="muted">Source: '+esc(row.source)+'</p></article>';}).join(''):'<p class="muted">No illustrative signals match this filter.</p>';}filter.onchange=render;form.onsubmit=function(e){e.preventDefault();var total=(c.checks||[]).length,checked=form.querySelectorAll('input:checked').length,pct=total?Math.round(checked/total*100):0,label=pct>=80?'Strong documented coverage':pct>=50?'Partial coverage—close the evidence gaps':'Material coverage gaps';score.innerHTML='<p class="eyebrow">Coverage result</p><h3>'+pct+'% · '+label+'</h3><p>'+checked+' of '+total+' configured controls selected. Verify each selected control against current records and accountable human review.</p>';};render();})();</script>`;
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
    else if (['learningHub', 'course', 'lesson', 'playbook', 'template', 'toolGuide', 'useCase', 'collection'].includes(item.kind)) groups['Related University Lessons'].push(item);
    else if (item.kind === 'build') groups['Related Builds'].push(item);
    else if (item.kind === 'product') groups['Related Products'].push(item);
  }
  return groups;
}

function label(kind) { return ({ service: 'Service', product: 'Product', learningHub: 'Learning hub', course: 'Course', lesson: 'Lesson', playbook: 'Playbook', template: 'Template', toolGuide: 'Tool guide', useCase: 'Use case', collection: 'Collection', assessment: 'Assessment', tool: 'Tool', monitor: 'Monitor', research: 'Research', build: 'Build' })[kind] || 'Resource'; }
function buildSchema(r) { return { '@context': 'https://schema.org', '@type': r.kind === 'service' ? 'Service' : ['learningHub','course','lesson','playbook','template','toolGuide','useCase','collection'].includes(r.kind) ? 'LearningResource' : 'CreativeWork', name: r.title, description: r.summary, url: `${BASE_URL}${r.pathname}`, provider: { '@type': 'Organization', name: 'Aloha AI' } }; }
function escapeHtml(value) { return String(value ?? '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#039;'); }
