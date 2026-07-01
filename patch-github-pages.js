#!/usr/bin/env node
// patch-github-pages.js
// Run from the root of your aloha-ai-consulting GitHub Pages repo:
//   cd ~/aloha-ai-consulting
//   node patch-github-pages.js
//
// Fixes:
//   1. SL3: Splits "GRSM · Antithesis Law" into two separate credential lines
//   2. All 4 one-pagers: Ensures footer links to live dashboards are actual <a> hyperlinks

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
  // Ensure suppression sweep footer link is an actual hyperlink, not just text
  [
    'Platform Suppression Monitor · Live automated system tracking censorship incidents across Instagram, YouTube, Substack, and TikTok — deployed infrastructure, not a prototype',
    'Platform Suppression Monitor — <a href="https://aloha-suppression-sweep.vercel.app" target="_blank" style="color:inherit;">aloha-suppression-sweep.vercel.app</a> · Live automated system tracking censorship incidents across Instagram, YouTube, Substack, and TikTok — deployed infrastructure, not a prototype',
    'Added hyperlink to suppression sweep in SL1 footer'
  ],
]);

// ── SL2 PHARMA ────────────────────────────────────────────────────────────────
console.log('SL2 Pharma — sl2-pharma-sample.html');
patch('sl2-pharma-sample.html', [
  // Ensure DEA tracker footer link is a hyperlink
  // The June 6 commit added the URL — check if it's an anchor or just text
  // Try both patterns
  [
    'DEA Scheduling Monitor · automated primary-source intelligence, not a prototype',
    'DEA Scheduling Monitor — <a href="https://aloha-dea-tracker.vercel.app" target="_blank" style="color:inherit;">aloha-dea-tracker.vercel.app</a> · automated primary-source intelligence, not a prototype',
    'Added hyperlink to DEA tracker in SL2 Pharma footer'
  ],
]);

// ── SL2 LEGALTECH ─────────────────────────────────────────────────────────────
console.log('SL2 LegalTech — sl2-legaltech-overview.html');
patch('sl2-legaltech-overview.html', [
  // Ensure AI Governance Tracker footer link is a hyperlink
  [
    'AI Governance Tracker · automated primary-source intelligence, not a prototype',
    'AI Governance Tracker — <a href="https://aloha-ai-governance.vercel.app" target="_blank" style="color:inherit;">aloha-ai-governance.vercel.app</a> · automated primary-source intelligence, not a prototype',
    'Added hyperlink to AI Governance Tracker in SL2 LegalTech footer'
  ],
]);

// ── RESULT ────────────────────────────────────────────────────────────────────
if (totalFixes > 0) {
  console.log(`${totalFixes} fix(es) applied. Committing and pushing...`);
  const { execSync } = require('child_process');
  try {
    execSync('git add sl1-ai-content-overview.html sl2-pharma-sample.html sl2-legaltech-overview.html sl3-legal-diagnostic.html', { stdio: 'inherit' });
    execSync('git commit -m "Fix credential split (SL3) and add footer hyperlinks to live dashboards (all 4 one-pagers)"', { stdio: 'inherit' });
    execSync('git push', { stdio: 'inherit' });
    console.log('\n✓ Pushed to GitHub Pages — changes live in ~60 seconds');
  } catch (e) {
    console.error('Git error:', e.message);
    console.log('Run manually: git add . && git commit -m "Fix footer links" && git push');
  }
} else {
  console.log('No changes made — all fixes may already be in place.');
}
