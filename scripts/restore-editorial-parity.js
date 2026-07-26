#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const baseline = process.argv[2] || 'b0a1b3c';
const selection = process.argv[3] || '25';
const count = selection === 'existing' ? null : Number.parseInt(selection, 10);
const reportPath = path.join(root, 'artifacts', 'migration-parity', 'report.json');
if (!fs.existsSync(reportPath)) throw new Error('Run npm run site:build and npm run site:parity before restoring editorial copy.');
if (count != null && (!Number.isFinite(count) || count < 1)) throw new Error('Count must be a positive integer or "existing".');

const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
const files = jsonFiles(path.join(root, 'content'));
const records = files.flatMap((file) => {
  const parsed = JSON.parse(fs.readFileSync(file, 'utf8'));
  return (Array.isArray(parsed) ? parsed : [parsed]).map((resource, index) => ({ file, parsed, resource, index }));
});
const existingPaths = new Set(records.filter((entry) => entry.resource.editorialSource?.baseline === baseline).map((entry) => entry.resource.pathname));
const targets = [...report.pages]
  .filter((page) => selection !== 'existing' || existingPaths.has(page.currentRoute))
  .sort((a, b) => a.distinctiveWordOverlap - b.distinctiveWordOverlap || a.originalRoute.localeCompare(b.originalRoute))
  .slice(0, count ?? undefined);

for (const target of targets) {
  const record = records.find((entry) => entry.resource.pathname === target.currentRoute);
  if (!record) throw new Error(`No canonical resource found for ${target.currentRoute}`);
  const original = git(['show', `${baseline}:${target.sourceFile}`]);
  const retained = extractEditorialContent(original);
  const originalTitle = normalize(target.originalH1);
  if (originalTitle && record.resource.title !== originalTitle) {
    record.resource.seoTitle ||= record.resource.title;
    record.resource.title = originalTitle;
  }
  if (retained.intro.length) record.resource.editorialIntro = retained.intro;
  if (retained.sections.length) record.resource.editorialSections = retained.sections;
  record.resource.editorialSource = {
    baseline,
    sourceFile: target.sourceFile,
    restoredAt: '2026-07-26'
  };
}

for (const file of new Set(targets.map((target) => records.find((entry) => entry.resource.pathname === target.currentRoute).file))) {
  const record = records.find((entry) => entry.file === file);
  fs.writeFileSync(file, `${JSON.stringify(record.parsed, null, 2)}\n`);
}

process.stdout.write(`Restored structured editorial copy for ${targets.length} resources from ${baseline}.\n`);
for (const target of targets) process.stdout.write(`- ${target.currentRoute} (${target.distinctiveWordOverlap}% baseline overlap)\n`);

function extractEditorialContent(html) {
  const main = html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i)?.[1] || html;
  const tokens = main.match(/<!--[\s\S]*?-->|<[^>]+>|[^<]+/g) || [];
  const intro = [];
  const sections = [];
  const seen = new Set();
  const skipped = [];
  let sawH1 = false;
  let section = null;
  let capture = null;
  let orderedDepth = 0;
  let table = null;
  let row = null;
  let pendingEyebrow = '';

  for (const token of tokens) {
    if (token.startsWith('<!--')) continue;
    if (token.startsWith('<')) {
      const closing = /^<\//.test(token);
      const name = token.match(/^<\/?\s*([a-z0-9-]+)/i)?.[1]?.toLowerCase();
      if (!name) continue;
      if (!closing && ['script','style','nav','footer','svg','form','button','noscript'].includes(name)) {
        skipped.push(name);
        continue;
      }
      if (skipped.length) {
        if (closing && name === skipped.at(-1)) skipped.pop();
        continue;
      }
      if (!closing && name === 'ol') orderedDepth += 1;
      if (closing && name === 'ol') orderedDepth = Math.max(0, orderedDepth - 1);
      if (!closing && name === 'table') table = { type: 'table', rows: [] };
      if (!closing && name === 'tr' && table) row = { cells: [] };
      if (closing && name === 'tr' && table && row?.cells.length) {
        table.rows.push(row);
        row = null;
      }
      if (closing && name === 'table' && table) {
        if (table.rows.length) addBlock(table);
        table = null;
      }
      if (!closing && ['h1','h2','h3','p','li','blockquote','summary','pre','th','td'].includes(name) && !capture) {
        const classes = token.match(/\bclass\s*=\s*["']([^"']+)["']/i)?.[1]?.split(/\s+/) || [];
        capture = { name, text: '', ordered: orderedDepth > 0, header: name === 'th', eyebrow: classes.includes('eyebrow') };
      } else if (closing && capture?.name === name) {
        finishCapture(capture);
        capture = null;
      }
      continue;
    }
    if (skipped.length || !capture) continue;
    capture.text += decode(token);
  }

  return {
    intro: intro.filter(Boolean),
    sections: sections.filter((item) => item.blocks.length)
  };

  function finishCapture(item) {
    const text = normalize(item.text);
    if (!text || seen.has(`${item.name}:${text}`)) return;
    seen.add(`${item.name}:${text}`);
    if (item.name === 'h1') {
      sawH1 = true;
      return;
    }
    if (!sawH1) return;
    if (item.name === 'h2') {
      section = { title: text, ...(pendingEyebrow ? { eyebrow: pendingEyebrow } : {}), blocks: [] };
      pendingEyebrow = '';
      sections.push(section);
      return;
    }
    if (['th','td'].includes(item.name) && row) {
      row.cells.push({ text, ...(item.header ? { header: true } : {}) });
      return;
    }
    if (item.name === 'p' && item.eyebrow) {
      pendingEyebrow = text;
      return;
    }
    if (item.name === 'p' && !section) {
      intro.push(text);
      return;
    }
    if (item.name === 'h3') return addBlock({ type: 'heading', text });
    if (item.name === 'li') {
      const target = ensureSection();
      const previous = target.blocks.at(-1);
      if (previous?.type === 'list' && previous.ordered === item.ordered) previous.items.push(text);
      else target.blocks.push({ type: 'list', ...(item.ordered ? { ordered: true } : {}), items: [text] });
      return;
    }
    if (item.name === 'blockquote') return addBlock({ type: 'quote', text });
    if (item.name === 'summary') return addBlock({ type: 'heading', text });
    if (item.name === 'pre') return addBlock({ type: 'code', text });
    if (item.name === 'p') addBlock({ type: 'paragraph', text });
  }

  function ensureSection() {
    if (!section) {
      section = { title: 'In depth', blocks: [] };
      sections.push(section);
    }
    return section;
  }

  function addBlock(block) {
    ensureSection().blocks.push(block);
  }
}

function normalize(value) {
  return String(value || '').replace(/\s+/g, ' ').replace(/\s+([.,;:!?])/g, '$1').trim();
}

function decode(value) {
  return String(value)
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#0?39;|&apos;/gi, "'")
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCodePoint(Number.parseInt(code, 16)));
}

function jsonFiles(directory) {
  return fs.readdirSync(directory, { recursive: true })
    .filter((file) => String(file).endsWith('.json'))
    .map((file) => path.join(directory, String(file)));
}

function git(args) {
  return execFileSync('git', args, { cwd: root, encoding: 'utf8', maxBuffer: 20_000_000 });
}
