import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const ignored = new Set(['node_modules', '.git', 'artifacts']);
const htmlFiles = [];

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (ignored.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (entry.name.endsWith('.html')) htmlFiles.push(full);
  }
}
walk(ROOT);

const routeFor = (file) => {
  const rel = path.relative(ROOT, file).replaceAll(path.sep, '/').replace(/\.html$/, '');
  return rel === 'index' ? '/' : `/${rel}`;
};
const fileForRoute = (pathname) => pathname === '/'
  ? path.join(ROOT, 'index.html')
  : path.join(ROOT, `${pathname.replace(/^\/|\/$/g, '')}.html`);
const stripTags = (value) => value
  .replace(/<script\b[\s\S]*?<\/script>/gi, ' ')
  .replace(/<style\b[\s\S]*?<\/style>/gi, ' ')
  .replace(/<[^>]+>/g, ' ')
  .replace(/&(?:nbsp|amp|lt|gt|quot|#039);/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();
const attr = (tag, name) => {
  const match = tag.match(new RegExp(`\\b${name}=["']([^"']*)["']`, 'i'));
  return match?.[1] ?? '';
};
const idExists = (html, id) => new RegExp(`\\bid=["']${id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}["']`, 'i').test(html);
const failures = [];
const inventory = [];
const uniqueDestinations = new Set();
const legacy = [];

for (const file of htmlFiles) {
  const html = fs.readFileSync(file, 'utf8');
  const interactionHtml = html
    .replace(/<script\b[\s\S]*?<\/script>/gi, '')
    .replace(/<style\b[\s\S]*?<\/style>/gi, '');
  const route = routeFor(file);

  for (const match of interactionHtml.matchAll(/<a\b[^>]*>[\s\S]*?<\/a>/gi)) {
    const tag = match[0].slice(0, match[0].indexOf('>') + 1);
    const href = attr(tag, 'href');
    const label = stripTags(match[0]) || attr(tag, 'aria-label') || attr(tag, 'title');
    inventory.push({ route, type: 'link', label, target: href });
    if (!href || href === '#') {
      failures.push(`${route}: link "${label || '(unnamed)'}" has no precise destination`);
      continue;
    }
    if (!label) failures.push(`${route}: link to ${href} has no accessible name`);
    if (href.startsWith('#')) {
      if (!idExists(html, decodeURIComponent(href.slice(1)))) {
        failures.push(`${route}: "${label}" points to missing same-page section ${href}`);
      }
      uniqueDestinations.add(`${route}${href}`);
      continue;
    }
    if (/^(mailto:|tel:|https?:\/\/)/i.test(href)) {
      uniqueDestinations.add(href);
      continue;
    }
    if (!href.startsWith('/')) {
      failures.push(`${route}: relative link "${label}" uses ambiguous target ${href}`);
      continue;
    }
    const url = new URL(href, 'https://aloha-ai-consulting.vercel.app');
    const targetFile = fileForRoute(url.pathname);
    if (!fs.existsSync(targetFile)) {
      failures.push(`${route}: "${label}" points to missing route ${url.pathname}`);
      continue;
    }
    uniqueDestinations.add(url.pathname);
    if (url.hash) {
      const targetHtml = fs.readFileSync(targetFile, 'utf8');
      if (!idExists(targetHtml, decodeURIComponent(url.hash.slice(1)))) {
        failures.push(`${route}: "${label}" points to missing section ${url.pathname}${url.hash}`);
      }
    }
  }

  for (const match of interactionHtml.matchAll(/<button\b[^>]*>[\s\S]*?<\/button>/gi)) {
    const tag = match[0].slice(0, match[0].indexOf('>') + 1);
    const label = stripTags(match[0]) || attr(tag, 'aria-label') || attr(tag, 'title');
    const type = attr(tag, 'type') || 'submit';
    inventory.push({ route, type: 'button', label, target: type });
    if (!label) failures.push(`${route}: button has no accessible name`);
    if (type === 'submit') {
      const before = interactionHtml.slice(0, match.index);
      const formStart = before.lastIndexOf('<form');
      const formEnd = before.lastIndexOf('</form>');
      if (formStart < 0 || formEnd > formStart) failures.push(`${route}: submit button "${label}" is outside a form`);
    } else if (type === 'button') {
      const id = attr(tag, 'id');
      const scriptedById = id && new RegExp(`(?:getElementById|byId)\\(["']${id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}["']\\)`).test(html);
      const contract = /\bdata-[\w-]+=["'][^"']+["']/i.test(tag) || /\baria-(?:controls|expanded|pressed)=/i.test(tag) || scriptedById;
      if (!contract) failures.push(`${route}: button "${label}" exposes no interaction contract`);
    }
  }

  for (const match of interactionHtml.matchAll(/<details\b[^>]*>[\s\S]*?<\/details>/gi)) {
    const summary = match[0].match(/<summary\b[^>]*>([\s\S]*?)<\/summary>/i);
    const label = summary ? stripTags(summary[1]) : '';
    inventory.push({ route, type: 'disclosure', label, target: 'same-page state' });
    if (!label) failures.push(`${route}: disclosure has no visible summary`);
  }

  for (const match of interactionHtml.matchAll(/<form\b[^>]*>[\s\S]*?<\/form>/gi)) {
    const tag = match[0].slice(0, match[0].indexOf('>') + 1);
    const action = attr(tag, 'action');
    const hasSubmit = /<(?:button|input)\b[^>]*type=["']submit["']/i.test(match[0])
      || /<button\b(?![^>]*type=["']button["'])/i.test(match[0]);
    inventory.push({ route, type: 'form', label: attr(tag, 'aria-label') || attr(tag, 'role') || 'form', target: action || 'browser-local' });
    if (!hasSubmit) failures.push(`${route}: form has no submit action`);
    if (action?.startsWith('/') && !fs.existsSync(fileForRoute(new URL(action, 'https://aloha-ai-consulting.vercel.app').pathname))) {
      failures.push(`${route}: form submits to missing route ${action}`);
    }
  }

  const main = html.match(/<main\b[\s\S]*?<\/main>/i)?.[0] || '';
  const visible = stripTags(main);
  if (visible.length < 180) failures.push(`${route}: destination is too incomplete to explain its purpose`);
  if (!/<h1\b/i.test(main)) failures.push(`${route}: destination has no page-specific heading`);
  if (route !== '/university/contact' &&
      /class=["'][^"']*\bpage-hero\b[^"']*\bsection--ink\b[^"']*["']/i.test(main) &&
      /data-resource-id=["'](?:builds|products|tools|research|monitors|governance|university)/i.test(html)) {
    legacy.push(`${route}: inherited legacy dark hero`);
  }
}

for (const item of legacy) failures.push(item);

const counts = inventory.reduce((acc, item) => {
  acc[item.type] = (acc[item.type] || 0) + 1;
  return acc;
}, {});
const report = {
  generatedAt: new Date().toISOString(),
  pages: htmlFiles.length,
  interactiveElements: inventory.length,
  counts,
  uniqueDestinations: uniqueDestinations.size,
  failures,
  inventory
};
fs.mkdirSync(path.join(ROOT, 'artifacts', 'interaction-audit'), { recursive: true });
fs.writeFileSync(path.join(ROOT, 'artifacts', 'interaction-audit', 'report.json'), `${JSON.stringify(report, null, 2)}\n`);
console.log(`Interaction audit: ${htmlFiles.length} pages; ${inventory.length} elements; ${uniqueDestinations.size} unique destinations.`);
console.log(Object.entries(counts).map(([key, value]) => `${key}: ${value}`).join(' · '));
if (failures.length) {
  console.error(`${failures.length} release-blocking interaction or destination failures:`);
  for (const failure of failures.slice(0, 100)) console.error(`- ${failure}`);
  if (failures.length > 100) console.error(`- …and ${failures.length - 100} more (see report.json)`);
  process.exit(1);
}
console.log('Every generated interactive element has a named action, resolvable target/state, and complete destination contract.');
