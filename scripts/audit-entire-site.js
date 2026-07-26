#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const { getRouteRecord } = require('../lib/site/route-registry');

const ROOT = path.resolve(__dirname, '..');
const SITEMAP = path.join(ROOT, 'sitemap.xml');
const OUTPUT_DIR = path.join(ROOT, 'artifacts', 'site-audit');
const DESIGN_SYSTEM = '/assets/platform-design-system.css';

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
  const designSystem = html.includes(DESIGN_SYSTEM);
  const inlineStyles = count(html, /style=["']/gi);
  const forms = count(html, /<form\b/gi);
  const unlabeledInputs = count(html, /<input\b(?![^>]*(?:aria-label|aria-labelledby|id=))[^>]*>/gi);
  const images = count(html, /<img\b/gi);
  const missingAlt = count(html, /<img\b(?![^>]*\balt=)[^>]*>/gi);
  const buttons = count(html, /<button\b/gi);
  const links = count(html, /<a\b/gi);
  const workspaceLinks = count(html, /href=["'][^"']*(?:workspace|platform)[^"']*["']/gi);

  const checks = {
    title: Boolean(title && title.length >= 12 && title.length <= 70),
    description: Boolean(description && description.length >= 70 && description.length <= 180),
    canonical: Boolean(canonical),
    oneH1: h1Count === 1,
    main: hasMain,
    header: hasHeader,
    footer: hasFooter,
    viewport: hasViewport,
    language: hasLang,
    skipLink: hasSkipLink,
    designSystem,
    imageAlternatives: images === 0 || missingAlt === 0,
    inputLabels: forms === 0 || unlabeledInputs === 0
  };

  const findings = [];
  if (!checks.title) findings.push('Title is missing or outside the 12–70 character audit range.');
  if (!checks.description) findings.push('Meta description is missing or outside the 70–180 character audit range.');
  if (!checks.canonical) findings.push('Canonical URL is missing.');
  if (!checks.oneH1) findings.push(`Expected exactly one H1; found ${h1Count}.`);
  if (!checks.main) findings.push('Semantic main region is missing.');
  if (!checks.header) findings.push('Semantic header is missing.');
  if (!checks.footer) findings.push('Semantic footer is missing.');
  if (!checks.viewport) findings.push('Viewport metadata is missing.');
  if (!checks.language) findings.push('Document language is missing.');
  if (!checks.skipLink) findings.push('Keyboard skip link is missing.');
  if (!checks.designSystem) findings.push(`Shared design system ${DESIGN_SYSTEM} is not loaded.`);
  if (!checks.imageAlternatives) findings.push(`${missingAlt} image(s) lack alt attributes.`);
  if (!checks.inputLabels) findings.push(`${unlabeledInputs} input(s) lack an id or accessible label association.`);

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
    metrics: { h1Count, inlineStyles, forms, images, missingAlt, buttons, links, workspaceLinks },
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
    `Pages loading the shared design system: ${report.summary.designSystemCoverage}/${report.summary.found}`,
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
      designSystemCoverage: foundPages.filter(page => page.checks?.designSystem).length
    },
    estates,
    pages
  };

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  fs.writeFileSync(path.join(OUTPUT_DIR, 'report.json'), `${JSON.stringify(report, null, 2)}\n`);
  fs.writeFileSync(path.join(OUTPUT_DIR, 'report.md'), markdown(report));
  process.stdout.write(`${markdown(report)}\n`);
  if (report.summary.missing > 0) process.exitCode = 1;
}

try {
  main();
} catch (error) {
  console.error(`[site-audit] ${error.stack || error.message}`);
  process.exit(1);
}
