#!/usr/bin/env node
// patch-github-pages.js
// Run from the root of your aloha-ai-consulting GitHub Pages repo:
//   cd ~/aloha-ai-consulting
//   node patch-github-pages.js
//
// Historical, operator-invoked migration utility. It does not establish that a
// named external system is deployed, current, automated, public, or maintained.
// It only applies bounded copy/link corrections to legacy one-pagers when those
// files are present in the working tree.

const fs = require('fs');
const path = require('path');

let totalFixes = 0;

function patch(filename, replacements) {
  const filePath = path.join(process.cwd(), filename);
  if (!fs.existsSync(filePath)) {
    console.log(`⚠  ${filename} not found — skipping`);
    return;
  }
  let code = fs.readFileSync(filePath, 'utf8');
  let fileFixes = 0;
  for (const [find, replace, label] of replacements) {
    if (code.includes(find)) {
      code = code.split(find).join(replace);
      console.log(`  ✓ ${label}`);
      fileFixes++;
    } else {
      console.log(`  ⚠  Not found (may already be fixed): ${label}`);
    }
  }
  if (fileFixes > 0) {
    fs.writeFileSync(filePath, code, 'utf8');
    console.log(`  → Written: ${filename}\n`);
    totalFixes += fileFixes;
  } else {
    console.log(`  → No changes needed: ${filename}\n`);
  }
}

// ── SL3 ───────────────────────────────────────────────────────────────────────
console.log('SL3 — sl3-legal-diagnostic.html');
patch('sl3-legal-diagnostic.html', [
  // Fix 1: Split conflated credential into two separate lines
  [
    'Law Clerk · Gordon Rees Scully Mansukhani · Antithesis Law',
    'Law Clerk · Gordon Rees Scully Mansukhani LLP · Law Clerk · Antithesis Law',
    'Split GRSM + Antithesis into two credential entries'
  ],
  // Fix 2: Ensure footer link to Legal AI Monitor is a hyperlink
  // If the URL is text-only, wrap it in an anchor tag
  [
    'aloha-legal-ai-monitor.vercel.app">',
    'aloha-legal-ai-monitor.vercel.app">',
    'Footer link already hyperlinked — no change'
  ],
]);

// ── SL1 ───────────────────────────────────────────────────────────────────────
console.log('SL1 — sl1-ai-content-overview.html');
patch('sl1-ai-content-overview.html', [
  // No satellite-system link is inserted without a separately verified public destination.
]);

// ── SL2 PHARMA ────────────────────────────────────────────────────────────────
console.log('SL2 Pharma — sl2-pharma-sample.html');
patch('sl2-pharma-sample.html', [
  // No satellite-system link is inserted without a separately verified public destination.
]);

// ── SL2 LEGALTECH ─────────────────────────────────────────────────────────────
console.log('SL2 LegalTech — sl2-legaltech-overview.html');
patch('sl2-legaltech-overview.html', [
  // No satellite-system link is inserted without a separately verified public destination.
]);

// ── RESULT ────────────────────────────────────────────────────────────────────
if (totalFixes > 0) {
  console.log(`${totalFixes} bounded correction(s) applied. Review and validate the diff before publishing.`);
} else {
  console.log('No changes made — all fixes may already be in place.');
}
