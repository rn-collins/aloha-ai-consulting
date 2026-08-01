import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const ledgerPath = path.join(root, 'program/promise-delivery/ledger.json');
const outDir = path.join(root, 'program/promise-delivery/remediation/r01');
const ledger = JSON.parse(fs.readFileSync(ledgerPath, 'utf8'));

const classes = [
  {
    id: 'R01-S0-PURCHASE',
    rationale: 'A visitor is told that a presently unavailable acquisition or checkout path exists.',
    match: /Gumroad|checkout|purchase (?:this|now)|buy now|Get Five-Domain Knowledge Base|Get Neuroscience-of-Trust Content Architecture|Get Commercial-Launch APQ Gap Model|Get Audit-Ready Operations|Get Nervous-System-Aware Platform-Risk Intelligence/i,
    disposition: 'deferred',
    replacement: 'State that no checkout, purchase, license, or download is currently available; retain the artifact in the governed build queue.'
  },
  {
    id: 'R01-S0-SB303',
    rationale: 'A dated Oregon framework can be mistaken for a current, purchasable compliance kit.',
    match: /Oregon SB 303|Audit-Ready Operations|SB 303 compliance/i,
    disposition: 'corrected',
    replacement: 'Label as a dated educational architecture; require current-authority verification and qualified Oregon counsel before operational reliance.'
  },
  {
    id: 'R01-S0-CONTACT',
    rationale: 'Commercial contact relies on university-owned infrastructure or a misleading/blank action.',
    match: /collins\.ra@northeastern\.edu|Northeastern|Copy questions|Open an email|Email RN/i,
    disposition: 'disabled',
    replacement: 'Disable written intake until a brand-owned channel preserves provenance and warns against sending sensitive information.'
  },
  {
    id: 'R01-S0-WORKSPACE',
    rationale: 'A published Workspace page can be mistaken for an accessible authenticated product.',
    match: /Workspace|authenticated environment|sign in|create an account|workspace access/i,
    guard: /Public beta|authenticated|access|sign in|create an account|operational work/i,
    disposition: 'corrected',
    replacement: 'Describe research architecture and development state; state that no public sign-in, account creation, provisioning, or production access is available.'
  },
  {
    id: 'R01-S0-COURSE',
    rationale: 'Curriculum previews can be mistaken for enrollable, tutored, graded, or credentialed courses.',
    match: /Course|course|enroll|tutor|credential|grading|cohort/i,
    guard: /Public beta|enroll|tutor|credential|grading|cohort|Start learning|Build a working tool/i,
    disposition: 'corrected',
    replacement: 'Use curriculum-preview or open-material language; state enrollment, tutor, grading, and credential availability explicitly.'
  },
  {
    id: 'R01-S0-CE',
    rationale: 'Unverified accreditation progress, submission readiness, notification, or credit availability can cause professional reliance.',
    match: /Continuing Education|accredit|co-sponsor|submission-ready|credit pathways|Join the list|notification/i,
    disposition: 'corrected',
    replacement: 'Describe research targets only; state that no application, co-sponsorship, accreditation, enrollment, notification list, or credit is available.'
  },
  {
    id: 'R01-S0-VERIFICATION',
    rationale: 'The public structural checker is described as retrieving real sources or producing substantive source-support verdicts.',
    match: /checks each one against a real source|real-source verification|every claim traced|source verification/i,
    disposition: 'corrected',
    replacement: 'Limit the claim to browser-local structural parsing and explicitly exclude authority retrieval and proposition-support decisions.'
  },
  {
    id: 'R01-S0-OPERATING',
    rationale: 'A demonstration or architecture is described as running, operating, connected, maintained, or production-proven.',
    match: /both running, not diagrams|already running|operating layer|Production product|Creator Content System in action|maintained intelligence|live monitor/i,
    disposition: 'corrected',
    replacement: 'Distinguish working browser-local interaction from a demonstration, documented architecture, connected deployment, or maintained operation.'
  }
];

const rows = [];
for (const record of ledger.records) {
  for (const rule of classes) {
    if (!rule.match.test(record.exactPromise)) continue;
    if (rule.guard && !rule.guard.test(record.exactPromise)) continue;
    for (const occurrence of record.occurrences) {
      rows.push({
        s0Class: rule.id,
        promiseId: record.id,
        category: record.category,
        exactBefore: record.exactPromise,
        route: occurrence.route,
        element: occurrence.element ?? null,
        target: occurrence.target ?? null,
        auditOrdinal: occurrence.auditOrdinal ?? null,
        rationale: rule.rationale,
        disposition: rule.disposition,
        canonicalReplacement: rule.replacement,
        finalBuildObligationPreserved: true
      });
    }
  }
}

// The frozen ledger omitted this authored acquisition statement even though the
// route was in scope. Preserve it as a remediation discovery without changing
// the frozen 4,289-record denominator.
rows.push({
  s0Class: 'R01-S0-PURCHASE',
  promiseId: 'R01-DISC-001',
  category: 'remediation-discovery',
  exactBefore: 'Get The IDR Engine — Checkout is handled by Gumroad. The button opens the Aloha AI Gumroad storefront.',
  route: '/trust-stack/regulatory-intelligence',
  element: 'authored acquisition section',
  target: null,
  auditOrdinal: null,
  rationale: 'A sixth unavailable acquisition statement was present in an in-scope canonical source but omitted from the frozen promise ledger.',
  disposition: 'deferred',
  canonicalReplacement: 'State that no checkout, purchase, license, or download is currently available; retain the artifact in the governed build queue.',
  finalBuildObligationPreserved: true
});

rows.sort((a, b) => a.s0Class.localeCompare(b.s0Class) || a.route.localeCompare(b.route) || a.promiseId.localeCompare(b.promiseId));
const unique = rows.filter((row, index) => index === 0 || JSON.stringify(row) !== JSON.stringify(rows[index - 1]));
const grouped = Object.fromEntries(classes.map(rule => [rule.id, unique.filter(row => row.s0Class === rule.id).length]));
const manifest = {
  version: 1,
  tranche: 'R01',
  name: 'Immediate Truth and Reliance Patch',
  frozenBaselineCommit: ledger.baselineCommit,
  frozenBaselineDate: ledger.baselineDate,
  generatedAt: new Date().toISOString(),
  sourceLedgerRecords: ledger.counts.promiseRecords,
  sourceLedgerOccurrences: ledger.counts.totalPromiseOccurrences,
  selectionPolicy: 'Reliance-based S0 classes frozen in audit tranches 10, 13, and 15 and the remediation control package. Keyword matches select baseline records; every selected occurrence is retained.',
  occurrenceCount: unique.length,
  uniquePromiseCount: new Set(unique.map(row => row.promiseId)).size,
  countsByClass: grouped,
  occurrences: unique
};

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, 's0-occurrence-manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);

const md = [
  '# R01 S0 Pre-change Occurrence Manifest',
  '',
  `**Frozen baseline:** ${ledger.baselineCommit} (${ledger.baselineDate})  `,
  `**Ledger:** ${ledger.counts.promiseRecords.toLocaleString()} grouped records; ${ledger.counts.totalPromiseOccurrences.toLocaleString()} occurrences  `,
  `**Selected S0 queue:** ${manifest.uniquePromiseCount} Promise IDs; ${manifest.occurrenceCount} occurrences`,
  '',
  'This manifest records the exact frozen before-state. A truth correction does not retire the underlying product, course, artifact, monitor, workspace, or delivery obligation.',
  '',
  '## Counts by reliance class',
  '',
  '| Class | Occurrences |',
  '|---|---:|',
  ...Object.entries(grouped).map(([key, count]) => `| ${key} | ${count} |`),
  '',
  '## Occurrence queue',
  '',
  '| Class | Promise ID | Route | Ordinal | Disposition | Exact before-state | Canonical replacement |',
  '|---|---|---|---:|---|---|---|',
  ...unique.map(row => `| ${row.s0Class} | ${row.promiseId} | \`${row.route}\` | ${row.auditOrdinal ?? ''} | ${row.disposition} | ${row.exactBefore.replaceAll('|', '\\|')} | ${row.canonicalReplacement.replaceAll('|', '\\|')} |`),
  ''
].join('\n');
fs.writeFileSync(path.join(outDir, 's0-occurrence-manifest.md'), md);

console.log(JSON.stringify({ occurrenceCount: manifest.occurrenceCount, uniquePromiseCount: manifest.uniquePromiseCount, countsByClass: grouped }, null, 2));
