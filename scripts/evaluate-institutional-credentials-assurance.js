import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const read = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));
const policy = read('content/governance/institutional-credentials-policy.json');
const register = read('content/governance/institutional-credentials-register.json');
const records = register.records || [];
const requiredFields = ['id','claimFamily','subject','institution','exactClaim','permittedVariants','status','statusAsOf','authoritativeEvidence','scope','reviewOwner','changeTrigger'];
const recordFindings = records.flatMap((record) => requiredFields
  .filter((field) => record[field] === undefined || record[field] === '' || (Array.isArray(record[field]) && !record[field].length))
  .map((field) => `${record.id || 'unknown'}:${field}`));
for (const record of records) {
  for (const field of ['class','public','repositoryState']) if (record.authoritativeEvidence?.[field] === undefined || record.authoritativeEvidence[field] === '') recordFindings.push(`${record.id}:authoritativeEvidence.${field}`);
}

const triggerPatterns = [
  /MS, Anatomy & Neurobiology/i,
  /holds an MS in Anatomy & Neurobiology/i,
  /Neuroscientist \(MS\)/i,
  /JD candidate/i,
  /regulatory(?:\/| and )compliance[^\n]{0,80}psychedelic clinical science/i,
  /regulatory work inside psychedelic clinical science/i,
  /legal research and AI-assisted workflow/i,
  /Published in the Journal of Biophilic Design/i,
  /Research and publication experience/i,
  /peer-reviewed publications and public writing/i,
  /not (?:a|attached to a) credential/i,
  /not a grade or credential/i,
  /No identity verification, instructor grading, issuance, badge, certificate, or public verification endpoint is available/i,
  /certificates, badges, account-synced progress,[^\n]{0,80}unavailable/i,
  /connected credentials/i
];
const contentFiles = [];
function list(dir) {
  for (const entry of fs.readdirSync(dir, {withFileTypes:true})) {
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!['evaluations','governance'].includes(entry.name)) list(file);
    } else if (entry.name.endsWith('.json') && !file.includes('institutional-credentials-')) contentFiles.push(file);
  }
}
list('content');

const claims = [];
function inspect(value, context) {
  if (typeof value === 'string') {
    if (!triggerPatterns.some((pattern) => pattern.test(value))) return;
    const matchedRecords = records.filter((record) => (record.permittedVariants || []).some((variant) => value.toLowerCase().includes(variant.toLowerCase())));
    claims.push({
      file: context.file,
      pathname: context.pathname || null,
      text: value,
      sha256: crypto.createHash('sha256').update(value).digest('hex'),
      recordIds: matchedRecords.map((record) => record.id)
    });
    return;
  }
  if (Array.isArray(value)) return value.forEach((item) => inspect(item, context));
  if (!value || typeof value !== 'object') return;
  const next = {...context, pathname: typeof value.pathname === 'string' ? value.pathname : context.pathname};
  Object.values(value).forEach((item) => inspect(item, next));
}
for (const file of contentFiles.sort()) inspect(read(file), {file, pathname:null});
claims.sort((a,b) => `${a.file}:${a.pathname}:${a.text}`.localeCompare(`${b.file}:${b.pathname}:${b.text}`));
const unmatchedClaims = claims.filter((claim) => claim.recordIds.length === 0);
const variantOwners = new Map();
for (const record of records) for (const variant of record.permittedVariants || []) {
  const key = variant.toLowerCase();
  variantOwners.set(key, [...(variantOwners.get(key) || []), record.id]);
}
const ambiguousVariants = [...variantOwners.entries()].filter(([,owners]) => new Set(owners).size > 1);
const staleRecords = records.filter((record) => record.statusAsOf > register.reviewedAt || register.reviewedAt > register.reviewBy);
const body = JSON.stringify(policy);
const checks = {
  'public-policy-defined': policy.pathname === '/institutional-credentials' && policy.kind === 'policy',
  'exact-claim-rule-published': body.includes('Similar labels are not interchangeable'),
  'evidence-classes-distinguished': body.includes('A program page can establish that a program exists; it does not establish that a named person enrolled or graduated'),
  'current-and-historical-status-distinguished': body.includes('Current enrollment') && body.includes('Historical experience is described as historical'),
  'endorsement-boundary-published': body.includes('does not imply sponsorship, endorsement, partnership, approval'),
  'learning-record-boundary-published': body.includes('are self-records') && body.includes('not enrollment, grades, academic credit'),
  'records-complete': records.length >= 6 && recordFindings.length === 0,
  'public-claim-inventory-present': claims.length >= 20,
  'public-claims-mapped': unmatchedClaims.length === 0,
  'claim-variants-unambiguous': ambiguousVariants.length === 0,
  'review-window-valid': staleRecords.length === 0,
  'overbroad-peer-review-language-removed': !claims.some((claim) => /peer-reviewed publications and public writing/i.test(claim.text)),
  'prohibited-inferences-published': body.includes('not an institutional transcript') && body.includes('independent certification')
};
const failed = Object.entries(checks).filter(([,pass]) => !pass).map(([id]) => id);
const findings = [...recordFindings, ...unmatchedClaims.map((claim) => `${claim.file}:${claim.pathname || 'no-pathname'}:unmatched`), ...ambiguousVariants.map(([variant,owners]) => `${variant}:ambiguous:${owners.join(',')}`), ...staleRecords.map((record) => `${record.id}:stale`)];
const publicRegister = {...register, records:records.map((record) => ({...record, authoritativeEvidence:{...record.authoritativeEvidence, notice:record.authoritativeEvidence.public ? 'Public evidence class; inspect the linked source and its date before reliance.' : 'Private evidence class is described but the underlying record is not published or independently verified by this repository.'}})), claims, counts:{records:records.length,publicClaimOccurrences:claims.length,matchedClaimOccurrences:claims.length-unmatchedClaims.length,unmatchedClaimOccurrences:unmatchedClaims.length,ambiguousClaimVariants:ambiguousVariants.length,recordFindings:recordFindings.length}};
const evaluation = {
  schema:'aloha-ai-site-assurance/1.0', assuranceId:'ASSURANCE-INSTITUTIONAL-CREDENTIALS-001', domain:'institutional-credentials', evaluatedAt:'2026-08-02', owner:'RN Collins / Aloha AI',
  decision:failed.length ? 'failed-closed' : 'passed-limited-selected-public-claim-control-scope',
  scope:'Public institutional-credential, affiliation, experience, publication, and Aloha AI learning-status claim variants selected by the checked-in trigger inventory; record completeness and exact-claim mapping.',
  exclusions:['Independent identity, transcript, degree, enrollment, employment, appointment, membership, licensure, certification, publication-review, or background verification','Private institution-issued and work records not checked into or inspected by this repository','A complete résumé, biography, client history, or inventory of every generic institutional reference','Institutional endorsement, sponsorship, partnership, authorization, or authority to speak for a named organization'],
  credentialRegister:{href:'/api/institutional-credentials-register.json',schema:register.schema,records:records.length,publicClaimOccurrences:claims.length,matchedClaimOccurrences:claims.length-unmatchedClaims.length},
  evidenceBoundary:{personSpecificPrivateRecords:records.filter((record) => !record.authoritativeEvidence.public).length,publicEvidenceRecords:records.filter((record) => record.authoritativeEvidence.public).length,rule:register.evidenceRule},
  reportingRoute:{pathname:'/corrections',instruction:'credential or affiliation correction',channel:'published corrections process'},
  checks, findings,
  metrics:{totalChecks:Object.keys(checks).length,passedChecks:Object.keys(checks).length-failed.length,failedChecks:failed.length,records:records.length,publicClaimOccurrences:claims.length,unmatchedClaimOccurrences:unmatchedClaims.length,ambiguousClaimVariants:ambiguousVariants.length,recordFindings:recordFindings.length},
  review:{lastReviewed:'2026-08-02',nextReview:'2026-11-02',trigger:'Any education, enrollment, degree, role, affiliation, publication, licensure, certification, name, evidence, status, learning-credential feature, or public-copy change.'},
  prohibitedInference:'This bounded pass establishes claim inventory and control integrity only. It does not independently verify identity, graduation, enrollment, employment, appointment, publication review, licensure, certification, current institutional standing, endorsement, or every biographical statement.'
};
fs.mkdirSync('api/evaluations',{recursive:true}); fs.mkdirSync('content/evaluations',{recursive:true});
fs.writeFileSync('api/institutional-credentials-register.json', `${JSON.stringify(publicRegister,null,2)}\n`);
const output = `${JSON.stringify(evaluation,null,2)}\n`;
fs.writeFileSync('api/evaluations/institutional-credentials.json',output); fs.writeFileSync('content/evaluations/institutional-credentials.json',output);
if (failed.length) { console.error(`Institutional-credentials assurance failed closed: ${failed.join(', ')}; ${findings.length} finding(s).`); process.exit(1); }
console.log(`Institutional-credentials assurance passed within selected public-claim control scope: ${Object.keys(checks).length}/${Object.keys(checks).length} checks; ${records.length} records; ${claims.length} claim occurrences; ${findings.length} findings.`);
