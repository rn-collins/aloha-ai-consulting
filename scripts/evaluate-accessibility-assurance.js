import fs from 'node:fs';
import path from 'node:path';

const read = (file) => fs.readFileSync(file, 'utf8');
const routes = [...read('sitemap.xml').matchAll(/<loc>https?:\/\/[^/]+([^<]*)<\/loc>/g)].map((match) => match[1] || '/');
const pages = routes.map((route) => ({ route, file: route === '/' ? 'index.html' : `${route.replace(/^\//, '')}.html` }));
const findings = [];
const inventory = { pages: pages.length, images: 0, controls: 0, forms: 0, tables: 0, iframes: 0, videos: 0, audio: 0 };

for (const page of pages) {
  if (!fs.existsSync(page.file)) { finding(page.route, 'missing-page', page.file); continue; }
  const html = read(page.file);
  const body = html.replace(/<script\b[\s\S]*?<\/script>/gi, '').replace(/<style\b[\s\S]*?<\/style>/gi, '');
  const ids = [...body.matchAll(/\bid=["']([^"']+)["']/gi)].map((match) => match[1]);
  const idSet = new Set(ids);
  const h = [...body.matchAll(/<h([1-6])\b[^>]*>/gi)].map((match) => Number(match[1]));
  const viewport = html.match(/<meta\b[^>]*name=["']viewport["'][^>]*>/i)?.[0] || '';

  if (!/<html\b[^>]*lang=["'][a-z]{2}(?:-[A-Za-z]{2})?["']/i.test(html)) finding(page.route, 'document-language');
  if (/user-scalable\s*=\s*no|maximum-scale\s*=\s*1(?:\.0)?(?:[,"']|$)/i.test(viewport)) finding(page.route, 'zoom-restricted');
  if (!/<a\b[^>]*href=["']#main["'][^>]*>\s*Skip to (?:content|main content)\s*<\/a>/i.test(body)) finding(page.route, 'skip-link');
  if (!/<main\b[^>]*id=["']main["']/i.test(body)) finding(page.route, 'main-target');
  if (h.filter((level) => level === 1).length !== 1) finding(page.route, 'h1-count', String(h.filter((level) => level === 1).length));
  for (let i = 1; i < h.length; i += 1) if (h[i] > h[i - 1] + 1) finding(page.route, 'heading-level-skip', `${h[i - 1]}→${h[i]}`);
  for (const id of new Set(ids)) if (ids.filter((candidate) => candidate === id).length > 1) finding(page.route, 'duplicate-id', id);
  for (const match of body.matchAll(/\b(?:aria-labelledby|aria-describedby|aria-controls)=["']([^"']+)["']/gi)) {
    for (const id of match[1].trim().split(/\s+/)) if (!idSet.has(id)) finding(page.route, 'broken-aria-reference', id);
  }
  if (/\btabindex=["']?[1-9]/i.test(body)) finding(page.route, 'positive-tabindex');
  if (/\baccesskey=/i.test(body)) finding(page.route, 'accesskey');
  if (/<(?:div|span)\b[^>]*onclick=/i.test(body)) finding(page.route, 'nonsemantic-click-target');

  const images = [...body.matchAll(/<img\b[^>]*>/gi)]; inventory.images += images.length;
  for (const match of images) if (!/\balt=["'][^"']*["']/i.test(match[0])) finding(page.route, 'image-missing-alt');
  const iframes = [...body.matchAll(/<iframe\b[^>]*>/gi)]; inventory.iframes += iframes.length;
  for (const match of iframes) if (!/\btitle=["'][^"']+["']/i.test(match[0])) finding(page.route, 'iframe-missing-title');
  inventory.videos += (body.match(/<video\b/gi) || []).length;
  inventory.audio += (body.match(/<audio\b/gi) || []).length;
  if (/<(?:video|audio)\b[^>]*autoplay/i.test(body)) finding(page.route, 'autoplay-media');

  const controls = [...body.matchAll(/<(?:input|select|textarea|button)\b[^>]*>/gi)]; inventory.controls += controls.length;
  inventory.forms += (body.match(/<form\b/gi) || []).length;
  for (const match of controls) {
    const tag = match[0];
    if (/^<button/i.test(tag)) continue;
    if (/type=["']hidden["']/i.test(tag)) continue;
    const id = tag.match(/\bid=["']([^"']+)["']/i)?.[1];
    const named = /\baria-label=["'][^"']+["']|\baria-labelledby=["'][^"']+["']/i.test(tag);
    const before = body.slice(0, match.index);
    const wrapped = before.lastIndexOf('<label') > before.lastIndexOf('</label>');
    const associated = id && new RegExp(`<label\\b[^>]*for=["']${escape(id)}["']`, 'i').test(body);
    if (!named && !wrapped && !associated) finding(page.route, 'form-control-missing-name', id || tag.slice(0, 60));
  }
  for (const match of body.matchAll(/<button\b[^>]*>[\s\S]*?<\/button>/gi)) if (!accessibleText(match[0])) finding(page.route, 'button-missing-name');
  for (const match of body.matchAll(/<a\b[^>]*>[\s\S]*?<\/a>/gi)) if (!accessibleText(match[0])) finding(page.route, 'link-missing-name');

  const tables = [...body.matchAll(/<table\b[^>]*>[\s\S]*?<\/table>/gi)]; inventory.tables += tables.length;
  for (const match of tables) {
    if (!/<th\b[^>]*(?:scope=["'](?:row|col|rowgroup|colgroup)["']|id=["'][^"']+["'])/i.test(match[0])) finding(page.route, 'table-missing-header-association');
    if (!/<caption\b|\baria-label=["'][^"']+["']|\baria-labelledby=["'][^"']+["']/i.test(match[0])) finding(page.route, 'table-missing-name');
  }
}

const styles = ['aloha-ds.css','site-shell.css','page-system.css','universal-sections.css'].map(read).join('\n');
const script = ['site-shell.js','browser-actions.js','browser-state.js'].filter(fs.existsSync).map(read).join('\n');
const policy = read('accessibility.html');
const checks = {
  'all-sitemap-pages-structurally-checked': findings.length === 0,
  'public-accessibility-statement': policy.includes('Accessibility statement') && policy.includes('Effective 2026-08-02'),
  'public-report-and-accommodation-path': policy.includes('accessibility report — no meeting needed') && policy.includes('accessibility accommodation — no meeting needed'),
  'statement-does-not-claim-certification': policy.includes('not a certification') && policy.includes('not yet been completed'),
  'keyboard-skip-contract': pages.every(({file}) => fs.existsSync(file) && /href=["']#main["']/.test(read(file)) && /<main\b[^>]*id=["']main["']/.test(read(file))),
  'focus-indicator-contract': /:focus-visible\s*\{[^}]*box-shadow:/s.test(styles) && !/:focus(?:-visible)?\s*\{[^}]*outline\s*:\s*(?:0|none)[^}]*\}/s.test(styles.replace(/:focus-visible\s*\{[^}]*box-shadow:[^}]*\}/gs, '')),
  'reduced-motion-contract': /@media\s*\(prefers-reduced-motion:\s*reduce\)/.test(styles) && /animation\s*:\s*none\s*!important/.test(styles),
  'status-announcement-contract': /aria-live/.test(script) || pages.some(({file}) => fs.existsSync(file) && /aria-live=["'](?:polite|assertive)["']/.test(read(file))),
  'no-zoom-restriction': pages.every(({file}) => !/user-scalable\s*=\s*no|maximum-scale\s*=\s*1(?:\.0)?(?:[,"']|$)/i.test(read(file))),
  'no-positive-tabindex': pages.every(({file}) => !/\btabindex=["']?[1-9]/i.test(read(file))),
  'no-autoplay-media': pages.every(({file}) => !/<(?:video|audio)\b[^>]*autoplay/i.test(read(file))),
  'manual-assistive-technology-not-overstated': policy.includes('Screen-reader and voice-control testing has not yet been completed')
};
const failedChecks = Object.entries(checks).filter(([,passed]) => !passed).map(([id]) => id);
const record = {
  schema:'aloha-ai-site-assurance/1.0', assuranceId:'ASSURANCE-ACCESSIBILITY-001', domain:'accessibility',
  decision:failedChecks.length ? 'failed-closed' : 'passed-limited-static-structure-and-interaction-contract-scope', evaluatedAt:'2026-08-02',
  owner:'RN Collins / Aloha AI', reviewer:'Codex remediation agent',
  scope:`All ${pages.length} sitemap routes; checked-in HTML, shared CSS, and shared interaction scripts.`,
  exclusions:['Rendered visual contrast measurement across every computed state and viewport','Manual screen-reader, voice-control, switch-control, magnification, and other assistive-technology sessions','Third-party destinations including Microsoft Bookings','Legal conformance determination or WCAG certification'],
  inventory, findings, assistiveTechnologyEvidence:{performed:[],notPerformed:['Screen reader','Voice control','Switch control','Screen magnifier'],reason:'No compatible rendered assistive-technology environment was available. The public statement and assurance decision disclose this gap; it is a required retest item.'},
  review:{lastReviewed:'2026-08-02',nextReview:'2026-11-02',trigger:'Any template, HTML, CSS, interaction, form, media, accessibility-copy, third-party destination, or deployment change; or availability of a compatible manual assistive-technology environment.'},
  checks, metrics:{totalChecks:Object.keys(checks).length,passedChecks:Object.keys(checks).length-failedChecks.length,failedChecks:failedChecks.length,structuralFindings:findings.length}, failures:failedChecks,
  prohibitedInference:'This bounded pass is not WCAG 2.1/2.2 conformance, legal compliance, accessibility certification, or evidence that every user, assistive technology, browser, device, state, third-party destination, or future deployment can use the site without a barrier.'
};
fs.mkdirSync('api/evaluations',{recursive:true}); fs.mkdirSync('content/evaluations',{recursive:true});
const output=`${JSON.stringify(record,null,2)}\n`; fs.writeFileSync('api/evaluations/accessibility.json',output); fs.writeFileSync('content/evaluations/accessibility.json',output);
if(failedChecks.length){console.error(`Accessibility assurance failed closed: ${failedChecks.join(', ')}; ${findings.length} structural finding(s).`);process.exit(1)}
console.log(`Accessibility assurance passed within the bounded static structure and interaction-contract scope: ${Object.keys(checks).length}/${Object.keys(checks).length} checks; ${pages.length} sitemap routes; ${findings.length} structural findings.`);

function finding(route, rule, detail=''){findings.push({route,rule,...(detail?{detail}:{})})}
function accessibleText(markup){return strip(markup)||/\baria-label=["'][^"']+["']|\baria-labelledby=["'][^"']+["']|\btitle=["'][^"']+["']/i.test(markup)}
function strip(value){return value.replace(/<[^>]+>/g,' ').replace(/&(?:nbsp|amp|lt|gt|quot|#0*39);/gi,' ').replace(/\s+/g,' ').trim()}
function escape(value){return value.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}
