import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const generated = [];

function walk(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (['.git', 'node_modules', 'artifacts'].includes(entry.name)) continue;
    const full = path.join(directory, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (entry.name.endsWith('.html')) generated.push(full);
  }
}
walk(root);

const represented = [];
const failures = [];
for (const file of generated) {
  const html = fs.readFileSync(file, 'utf8');
  const route = path.relative(root, file).replaceAll(path.sep, '/').replace(/(?:index)?\.html$/, '') || '/';
  const buttons = [...html.matchAll(/<button\b[^>]*>[\s\S]*?<\/button>/gi)];
  for (const match of buttons) {
    const label = match[0].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    const kind = /copy/i.test(label) ? 'copy'
      : /download|export/i.test(label) ? 'export'
        : /reset|clear/i.test(label) ? 'reset'
          : null;
    if (kind) represented.push({ route: route.startsWith('/') ? route : `/${route}`, kind, label });
  }
  if (represented.some((item) => item.route === (route.startsWith('/') ? route : `/${route}`)) && !html.includes('/browser-actions.js')) {
    failures.push(`${route}: represented browser action lacks the shared runtime`);
  }
}

const prohibitedSources = ['contact-intake.js', 'lib/site/structured-renderer.js'];
for (const source of prohibitedSources) {
  const text = fs.readFileSync(path.join(root, source), 'utf8');
  if (/navigator\.clipboard|URL\.createObjectURL|document\.execCommand\(['"]copy/.test(text)) {
    failures.push(`${source}: implements clipboard or object-URL behavior outside browser-actions.js`);
  }
}

const counts = represented.reduce((result, item) => {
  result[item.kind] = (result[item.kind] || 0) + 1;
  return result;
}, {});
const report = {
  generatedAt: new Date().toISOString(),
  runtimeVersion: '1.0.0',
  pagesInspected: generated.length,
  representedActions: represented.length,
  counts,
  failures,
  actions: represented
};
const out = path.join(root, 'artifacts', 'shared-action-audit');
fs.mkdirSync(out, { recursive: true });
fs.writeFileSync(path.join(out, 'report.json'), `${JSON.stringify(report, null, 2)}\n`);

console.log(`Shared-action audit: ${generated.length} pages; ${represented.length} represented actions.`);
console.log(Object.entries(counts).map(([key, value]) => `${key}: ${value}`).join(' · '));
if (failures.length) {
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}
console.log('All represented copy, export, download, reset, and clear controls load the shared browser-action runtime.');
