import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const allowedStyles = new Set([
  'aloha-ds.css',
  'site-shell.css',
  'page-system.css',
  'universal-sections.css'
]);
const forbiddenFiles = [
  'university/university.css'
];
const forbiddenColors = [
  '#00a67e',
  '#08725d',
  '#dff8f0',
  '#7fe0c4',
  '#1b7a68',
  '#0f5343',
  '#e9f3f0',
  '#f7f4ec',
  '#efeae0',
  '#eee9dc',
  '#f5f0e5',
  '#f5f0e6',
  '#f5f0e8',
  '#fff7e9',
  '#ffecdc',
  '#fffdf7',
  '#f4efe5',
  '#f5ead8',
  '#f8f5ed',
  '#0e1815',
  '#111815',
  '#121a17',
  '#18382f',
  '#2c463e',
  '#315047',
  '#33504f',
  '#3a564d',
  '#45645a',
  '#496057',
  '#6c837b',
  '#8fa69e',
  '#9fb6ae',
  '#badfd6',
  '#c7c4bc',
  '#cfdad5',
  '#d5e2dd',
  '#d6e2dd',
  '#d6e4df',
  '#dce7e2',
  '#e8e4da'
];
const findings = [];

for (const relative of forbiddenFiles) {
  if (fs.existsSync(path.join(root, relative))) {
    findings.push(`${relative}: retired stylesheet still exists`);
  }
}

for (const file of walk(root)) {
  const relative = path.relative(root, file);
  if (relative.startsWith('node_modules/') || relative.startsWith('.git/')) continue;
  if (relative === 'scripts/audit-presentation-system.js') continue;
  if (path.basename(file) === 'aloha-ds.css' && !allowedStyles.has(relative)) {
    findings.push(`${relative}: route-local design-system copy`);
  }
  if (!/\.(css|html|js)$/.test(file)) continue;
  const text = fs.readFileSync(file, 'utf8').toLowerCase();
  for (const color of forbiddenColors) {
    if (text.includes(color)) findings.push(`${relative}: forbidden legacy color ${color}`);
  }
}

if (findings.length) {
  console.error(`Presentation-system audit failed with ${findings.length} finding(s):`);
  for (const finding of findings) console.error(`- ${finding}`);
  process.exit(1);
}

console.log('Presentation-system audit passed.');

function walk(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}
