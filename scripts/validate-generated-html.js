import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const sitemapPath = path.join(root, 'sitemap.xml');
if (!fs.existsSync(sitemapPath)) {
  console.error('Generated HTML validation requires sitemap.xml; run site:build first.');
  process.exit(1);
}
const routes = [...fs.readFileSync(sitemapPath, 'utf8').matchAll(/<loc>https?:\/\/[^/]+([^<]*)<\/loc>/g)].map((match) => match[1] || '/');
const errors = [];
const files = routes.map(outputFile);
for (const [index, file] of files.entries()) if (!fs.existsSync(file)) errors.push(`${routes[index]}: generated route is missing HTML`);
for (const file of files) {
  if (!fs.existsSync(file)) continue;
  const html = fs.readFileSync(file, 'utf8');
  const rel = path.relative(root, file);
  for (const required of ['<title>', 'name="description"', 'rel="canonical"', '<main', 'id="main"']) if (!html.includes(required)) errors.push(`${rel}: missing ${required}`);
  if (/<section[^>]*>\s*<\/section>/i.test(html)) errors.push(`${rel}: empty section`);
  const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]);
  for (const id of new Set(ids)) if (ids.filter((candidate) => candidate === id).length > 1) errors.push(`${rel}: duplicate id ${id}`);
  for (const match of html.matchAll(/href="(\/[^"]*)"/g)) {
    const href = match[1].split('#')[0].split('?')[0];
    if (!href || href === '/') continue;
    const target = path.join(root, `${href.replace(/^\//, '')}.html`);
    const directoryIndex = path.join(root, href.replace(/^\//, ''), 'index.html');
    const staticTarget = path.join(root, href.replace(/^\//, ''));
    if (!fs.existsSync(target) && !fs.existsSync(directoryIndex) && !fs.existsSync(staticTarget)) errors.push(`${rel}: unresolved internal link ${href}`);
  }
}
if (errors.length) {
  console.error(`Generated HTML validation failed with ${errors.length} error(s):`);
  errors.slice(0, 100).forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}
console.log(`Validated ${files.length} HTML files.`);

function outputFile(route) {
  if (route === '/') return path.join(root, 'index.html');
  return path.join(root, `${route.replace(/^\//, '')}.html`);
}
