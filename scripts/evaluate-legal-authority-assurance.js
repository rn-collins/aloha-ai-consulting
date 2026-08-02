import fs from 'node:fs';

const readJson = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));
const policy = readJson('content/governance/legal-authority-policy.json');
const register = readJson('content/governance/legal-authority-register.json');
const records = register.records || [];
const required = ['id','proposition','publicSurfaces','jurisdiction','authorityType','authorityTitle','officialSource','retrievedAt','effectiveState','conflictsOrNegativeTreatment','reviewOwner','professionalReview'];
const findings = records.flatMap((record) => required.filter((field) => !record[field] || (Array.isArray(record[field]) && !record[field].length)).map((field) => `${record.id || 'unknown'}:${field}`));
const checks = {
  'public-policy-defined': policy.pathname === '/legal-authority' && policy.kind === 'policy',
  'professional-boundary-explicit': JSON.stringify(policy).includes('not a licensed attorney') && JSON.stringify(policy).includes('does not provide legal advice'),
  'source-hierarchy-defined': JSON.stringify(policy).includes('controlling primary authority'),
  'jurisdiction-and-effective-state-required': required.includes('jurisdiction') && required.includes('effectiveState'),
  'retrieval-date-required': required.includes('retrievedAt'),
  'conflict-rule-defined': Boolean(register.conflictRule?.includes('Preserve conflicts')),
  'selected-source-register-present': records.length >= 2,
  'registered-records-complete': findings.length === 0,
  'official-https-sources': records.every((record) => /^https:\/\//.test(record.officialSource)),
  'public-surfaces-declared': records.every((record) => record.publicSurfaces.every((route) => route.startsWith('/'))),
  'qualified-review-boundary': records.every((record) => /counsel|attorney|regulator/i.test(record.professionalReview)),
  'prohibited-inferences-published': JSON.stringify(policy).includes('No match is not clearance') && JSON.stringify(policy).includes('does not establish legal advice')
};
const failed = Object.entries(checks).filter(([,pass]) => !pass).map(([id]) => id);
const record = {
  schema: 'aloha-ai-site-assurance/1.0', assuranceId: 'ASSURANCE-LEGAL-AUTHORITY-001', domain: 'legal-authority',
  evaluatedAt: '2026-08-02', owner: 'RN Collins / Aloha AI',
  decision: failed.length ? 'failed-closed' : 'passed-limited-selected-authority-control-scope',
  scope: 'Public legal-authority policy, selected machine-readable authority records, professional boundary, source hierarchy, jurisdiction and effective-state fields, conflict rule, review ownership, and release controls.',
  exclusions: ['Complete proposition-level legal research audit of every site page','Independent citator or negative-treatment verification of every authority','Matter-specific applicability, legal effect, permission, prohibition, liability, compliance, or advice','State, tribal, territorial, local, foreign, client, third-party, and future-deployment conclusions unless expressly registered'],
  sourceRegister: {href:'/api/legal-authority-register.json', schema:register.schema, records:records.length, completeRecords:records.length - new Set(findings.map((item) => item.split(':')[0])).size},
  professionalBoundary: register.professionalBoundary,
  conflictRule: register.conflictRule,
  checks, findings,
  metrics: {totalChecks:Object.keys(checks).length, passedChecks:Object.keys(checks).length-failed.length, failedChecks:failed.length, registeredRecords:records.length, recordFindings:findings.length},
  review: {lastReviewed:'2026-08-02',nextReview:'2026-11-02',trigger:'Any cited authority, legal or regulatory claim, jurisdiction, effective status, professional-status statement, source link, conflict, correction, evaluator, or deployment change.'},
  prohibitedInference: 'This bounded pass is not legal advice, an attorney-client relationship, a complete legal research audit, a good-law determination, or evidence that every legal statement is current, correct, controlling, complete, applicable, or compliant.'
};
fs.mkdirSync('api/evaluations',{recursive:true}); fs.mkdirSync('content/evaluations',{recursive:true});
fs.writeFileSync('api/legal-authority-register.json', `${JSON.stringify({...register,notice:`${register.notice} Authority may change after retrieval; verify current primary sources and use qualified counsel before reliance.`},null,2)}\n`);
const output = `${JSON.stringify(record,null,2)}\n`;
fs.writeFileSync('api/evaluations/legal-authority.json',output); fs.writeFileSync('content/evaluations/legal-authority.json',output);
if (failed.length) { console.error(`Legal-authority assurance failed closed: ${failed.join(', ')}; ${findings.length} record finding(s).`); process.exit(1); }
console.log(`Legal-authority assurance passed within the selected authority-control scope: ${Object.keys(checks).length}/${Object.keys(checks).length} checks; ${records.length} registered records; ${findings.length} findings.`);
