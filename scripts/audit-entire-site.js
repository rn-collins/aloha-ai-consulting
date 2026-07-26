#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getRouteRecord } from '../lib/site/route-registry.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SITEMAP = path.join(ROOT, 'sitemap.xml');
const OUTPUT_DIR = path.join(ROOT, 'artifacts', 'site-audit');
const SHARED_STYLES = ['/aloha-ds.css', '/site-shell.css', '/page-system.css', '/universal-sections.css'];
const BASE_URL = 'https://aloha-ai-consulting.vercel.app';

function read(file) {
  return fs.readFileSync(file, 'utf8');
}

function sitemapRoutes(xml) {
  return [...xml.matchAll(/<loc>https?:\/\/[^/]+([^<]*)<\/loc>/g)]
    .map(match => match[1] || '/')
    .map(route => route.replace(/\/$/, '') || '/');
}

function candidateFiles(route) {
  if (route === '/') return [path.join(ROOT, 'index.html')];
  const clean = route.replace(/^\//, '');
  return [
    path.join(ROOT, `${clean}.html`),
    path.join(ROOT, clean, 'index.html')
  ];
}

function resolvePage(route) {
  return candidateFiles(route).find(fs.existsSync) || null;
}

function firstMatch(content, expression) {
  const value = content.match(expression)?.[1];
  return value ? value.replace(/\s+/g, ' ').trim() : null;
}

function count(content, expression) {
  return [...content.matchAll(expression)].length;
}

function formControlFindings(html) {
  const findings = [];
  const controls = [...html.matchAll(/<(input|textarea|select)\b[^>]*>/gi)];
  for (const match of controls) {
    const tag = match[0];
    if (/<input\b[^>]*type=["']hidden["']/i.test(tag)) continue;
    const id = tag.match(/\bid=["']([^"']+)["']/i)?.[1];
    const directlyNamed = /\baria-label=["'][^"']+["']/i.test(tag) || /\baria-labelledby=["'][^"']+["']/i.test(tag);
    const before = html.slice(0, match.index);
    const wrapped = before.lastIndexOf('<label') > before.lastIndexOf('</label>');
    const associated = id && new RegExp(`<label\\b[^>]*for=["']${escapeRegExp(id)}["']`, 'i').test(html);
    if (!directlyNamed && !wrapped && !associated) findings.push(`${match[1].toLowerCase()} control lacks an accessible label`);
  }
  return findings;
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function inspect(route) {
  const registry = getRouteRecord(route);
  const pageFile = resolvePage(route);
  const relativeFile = pageFile ? path.relative(ROOT, pageFile) : null;

  if (!pageFile) {
    return {
      ...registry,
      file: null,
      exists: false,
      score: 0,
      findings: ['Route appears in sitemap but no matching static HTML file was found.']
    };
  }

  const html = read(pageFile);
  const title = firstMatch(html, /<title[^>]*>([\s\S]*?)<\/title>/i);
  const description = firstMatch(html, /<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["'][^>]*>/i)
    || firstMatch(html, /<meta[^>]+content=["']([^"']*)["'][^>]+name=["']description["'][^>]*>/i);
  const canonical = firstMatch(html, /<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["'][^>]*>/i);
  const h1Count = count(html, /<h1\b/gi);
  const hasMain = /<main\b/i.test(html);
  const hasHeader = /<header\b/i.test(html);
  const hasFooter = /<footer\b/i.test(html);
  const hasViewport = /<meta[^>]+name=["']viewport["']/i.test(html);
  const hasLang = /<html[^>]+lang=["'][^"']+["']/i.test(html);
  const hasSkipLink = /href=["']#(?:main|content|main-content)["']/i.test(html);
  const sharedStyles = SHARED_STYLES.every((stylesheet) => html.includes(`href="${stylesheet}"`));
  const inlineStyles = count(html, /style=["']/gi);
  const forms = count(html, /<form\b/gi);
  const controlFindings = formControlFindings(html);
  const images = count(html, /<img\b/gi);
  const missingAlt = count(html, /<img\b(?![^>]*\balt=)[^>]*>/gi);
  const buttons = count(html, /<button\b/gi);
  const links = count(html, /<a\b/gi);
  const workspaceLinks = count(html, /href=["'][^"']*(?:workspace|platform)[^"']*["']/gi);
  const pageBytes = Buffer.byteLength(html);
  const canonicalExpected = `${BASE_URL}${route}`;

  const checks = {
    title: Boolean(title && title.length >= 12 && title.length <= 70),
    description: Boolean(description && description.length >= 70 && description.length <= 180),
    canonical: canonical === canonicalExpected,
    oneH1: h1Count === 1,
    main: hasMain,
    header: hasHeader,
    footer: hasFooter,
    viewport: hasViewport,
    language: hasLang,
    skipLink: hasSkipLink,
    sharedStyles,
    imageAlternatives: images === 0 || missingAlt === 0,
    inputLabels: forms === 0 || controlFindings.length === 0,
    pageWeight: pageBytes <= 100_000
  };

  const findings = [];
  if (!checks.title) findings.push('Title is missing or outside the 12–70 character audit range.');
  if (!checks.description) findings.push('Meta description is missing or outside the 70–180 character audit range.');
  if (!checks.canonical) findings.push(`Canonical URL must be ${canonicalExpected}.`);
  if (!checks.oneH1) findings.push(`Expected exactly one H1; found ${h1Count}.`);
  if (!checks.main) findings.push('Semantic main region is missing.');
  if (!checks.header) findings.push('Semantic header is missing.');
  if (!checks.footer) findings.push('Semantic footer is missing.');
  if (!checks.viewport) findings.push('Viewport metadata is missing.');
  if (!checks.language) findings.push('Document language is missing.');
  if (!checks.skipLink) findings.push('Keyboard skip link is missing.');
  if (!checks.sharedStyles) findings.push('One or more shared stylesheet layers are not loaded.');
  if (!checks.imageAlternatives) findings.push(`${missingAlt} image(s) lack alt attributes.`);
  if (!checks.inputLabels) findings.push(...controlFindings);
  if (!checks.pageWeight) findings.push(`HTML payload is ${pageBytes} bytes; the audit ceiling is 100000 bytes.`);

  const passed = Object.values(checks).filter(Boolean).length;
  const score = Math.round((passed / Object.keys(checks).length) * 100);

  return {
    ...registry,
    file: relativeFile,
    exists: true,
    title,
    description,
    canonical,
    score,
    checks,
    metrics: { h1Count, inlineStyles, forms, images, missingAlt, buttons, links, workspaceLinks, pageBytes },
    findings
  };
}

function markdown(report) {
  const lines = [
    '# Aloha AI whole-site audit',
    '',
    `Generated: ${report.generatedAt}`,
    '',
    `Routes audited: ${report.summary.routes}`,
    `Static pages found: ${report.summary.found}`,
    `Missing route files: ${report.summary.missing}`,
    `Average page score: ${report.summary.averageScore}%`,
    `Pages loading all shared style layers: ${report.summary.sharedStyleCoverage}/${report.summary.found}`,
    `Critical structural or accessibility failures: ${report.summary.criticalFailures}`,
    '',
    '## Estate summary',
    '',
    '| Estate | Routes | Found | Average score |',
    '|---|---:|---:|---:|'
  ];

  for (const estate of report.estates) {
    lines.push(`| ${estate.label} | ${estate.routes} | ${estate.found} | ${estate.averageScore}% |`);
  }

  lines.push('', '## Route register', '', '| Route | Estate | Type | File | Score | Priority finding |', '|---|---|---|---|---:|---|');
  for (const page of report.pages) {
    const finding = page.findings[0] || 'No baseline structural finding.';
    lines.push(`| \`${page.path}\` | ${page.estateLabel} | ${page.pageType} | ${page.file || 'missing'} | ${page.score}% | ${finding.replace(/\|/g, '\\|')} |`);
  }

  lines.push('', '## Interpretation', '',
    'This report audits every route in the sitemap, not only Twins or authenticated platform pages. It is a structural baseline, not a substitute for content, visual, responsive, usability, conversion, or factual review. Each route must still be reviewed against the required content contract stored in `lib/site/route-registry.js`.'
  );
  return `${lines.join('\n')}\n`;
}

function main() {
  if (!fs.existsSync(SITEMAP)) throw new Error('sitemap.xml was not found at the repository root.');
  const routes = [...new Set(sitemapRoutes(read(SITEMAP)))];
  const pages = routes.map(inspect);
  const grouped = new Map();
  for (const page of pages) {
    const current = grouped.get(page.estate) || [];
    current.push(page);
    grouped.set(page.estate, current);
  }

  const estates = [...grouped.entries()].map(([key, estatePages]) => ({
    key,
    label: estatePages[0].estateLabel,
    routes: estatePages.length,
    found: estatePages.filter(page => page.exists).length,
    averageScore: Math.round(estatePages.reduce((sum, page) => sum + page.score, 0) / estatePages.length)
  })).sort((a, b) => b.routes - a.routes);

  const foundPages = pages.filter(page => page.exists);
  const report = {
    generatedAt: new Date().toISOString(),
    summary: {
      routes: pages.length,
      found: foundPages.length,
      missing: pages.length - foundPages.length,
      averageScore: foundPages.length ? Math.round(foundPages.reduce((sum, page) => sum + page.score, 0) / foundPages.length) : 0,
      sharedStyleCoverage: foundPages.filter(page => page.checks?.sharedStyles).length,
      criticalFailures: foundPages.filter((page) => [
        'canonical',
        'oneH1',
        'main',
        'header',
        'footer',
        'viewport',
        'language',
        'skipLink',
        'sharedStyles',
        'imageAlternatives',
        'inputLabels',
        'pageWeight'
      ].some((check) => !page.checks?.[check])).length
    },
    estates,
    pages
  };

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  fs.writeFileSync(path.join(OUTPUT_DIR, 'report.json'), `${JSON.stringify(report, null, 2)}\n`);
  fs.writeFileSync(path.join(OUTPUT_DIR, 'report.md'), markdown(report));
  process.stdout.write(`${markdown(report)}\n`);
  if (report.summary.missing > 0 || report.summary.criticalFailures > 0) process.exitCode = 1;
}

try {
  main();
} catch (error) {
  console.error(`[site-audit] ${error.stack || error.message}`);
  process.exit(1);
}
