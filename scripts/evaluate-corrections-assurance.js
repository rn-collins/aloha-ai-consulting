import fs from 'node:fs';

const read = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));
const policy = read('content/governance/corrections-policy.json');
const ledger = read('content/governance/correction-ledger.json');
const allowedStates = new Set(ledger.states || []);
const findings = [];
const requiredEntryFields = ['id','reportedAt','decidedAt','owner','category','severity','state','priorState','correctedState','authority','rootCause','affectedOutputs','propagation','prevention','closureEvidence','notification','limitations'];

if (ledger.schema !== 'aloha-ai-correction-ledger/1.0') finding('ledger-schema');
for (const field of ['version','effectiveDate','owner','publicRoute','reportInstruction']) if (!ledger[field]) finding('ledger-field-missing', field);
if (!Array.isArray(ledger.entries)) finding('entries-not-array');
if (new Set((ledger.entries || []).map((entry) => entry.id)).size !== (ledger.entries || []).length) finding('duplicate-correction-id');
for (const entry of ledger.entries || []) {
  for (const field of requiredEntryFields) if (!entry[field] || (Array.isArray(entry[field]) && !entry[field].length)) finding(entry.id, `missing-${field}`);
  if (!/^COR-\d{4}-\d{3,}$/.test(entry.id || '')) finding(entry.id || 'unknown', 'unstable-id');
  if (!allowedStates.has(entry.state)) finding(entry.id, 'invalid-state');
  if (entry.state === 'closed' && (!entry.closedAt || !entry.closureEvidence?.productionClosureCommit || !entry.closureEvidence?.evidenceHref)) finding(entry.id, 'closed-without-closure-evidence');
  if ((entry.affectedOutputs || []).some((item) => !item.output || !item.disposition)) finding(entry.id, 'incomplete-affected-output');
  if (new Set((entry.affectedOutputs || []).map((item) => item.output)).size !== (entry.affectedOutputs || []).length) finding(entry.id, 'duplicate-affected-output');
  for (const value of [entry.closureEvidence?.evaluationCommit, entry.closureEvidence?.productionClosureCommit, ...(entry.closureEvidence?.correctionCommits || [])].filter(Boolean)) if (!/^[0-9a-f]{40}$/.test(value)) finding(entry.id, 'invalid-commit-evidence');
}

const serializedPolicy = JSON.stringify(policy);
const checks = {
  'public-correction-route-defined': policy.pathname === '/corrections' && policy.kind === 'policy',
  'private-reporting-instruction': serializedPolicy.includes('correction report — no meeting needed') && serializedPolicy.includes('Do not include credentials'),
  'response-state-model': ['received','triage','investigating','confirmed','not-substantiated','correcting','monitoring','closed'].every((state) => allowedStates.has(state)),
  'superseded-state-preserved': serializedPolicy.includes('Superseded wording remains in the ledger') && (ledger.entries || []).every((entry) => entry.priorState),
  'affected-output-analysis-required': serializedPolicy.includes('Affected-output analysis') && (ledger.entries || []).every((entry) => entry.affectedOutputs?.length),
  'closure-evidence-required': serializedPolicy.includes('Closure and notification') && (ledger.entries || []).filter((entry) => entry.state === 'closed').every((entry) => entry.closedAt && entry.closureEvidence?.productionClosureCommit),
  'owner-recorded': Boolean(ledger.owner) && (ledger.entries || []).every((entry) => entry.owner),
  'authority-and-root-cause-recorded': (ledger.entries || []).every((entry) => entry.authority?.length && entry.rootCause),
  'prevention-controls-recorded': (ledger.entries || []).every((entry) => entry.prevention?.length),
  'notification-boundary-recorded': (ledger.entries || []).every((entry) => entry.notification && entry.limitations),
  'ledger-structurally-valid': findings.length === 0,
  'no-error-free-guarantee': serializedPolicy.includes('does not guarantee an error-free site') && policy.releaseReview.permittedPublicLanguage.includes('does not guarantee')
};
const failures = Object.entries(checks).filter(([, passed]) => !passed).map(([id]) => id);
const publicLedger = {...ledger, notice:'This ledger covers confirmed public-site corrections entered under the stated boundary. It is not a complete history of ordinary edits, unpublished drafts, confidential client work, undiscovered errors, or third-party copies.'};
const record = {
  schema:'aloha-ai-site-assurance/1.0', assuranceId:'ASSURANCE-CORRECTIONS-001', domain:'corrections',
  decision:failures.length ? 'failed-closed' : 'passed-limited-public-correction-process-and-ledger-integrity-scope', evaluatedAt:'2026-08-02',
  owner:ledger.owner, reviewer:'Codex remediation agent',
  scope:'Public correction route, checked-in public correction ledger, required entry fields, affected-output dispositions, response states, and closure-evidence contracts.',
  exclusions:['Proof that every historical or current error has been discovered','Confidential client corrections and unpublished draft revisions','Delivery or correction of third-party, cached, indexed, downloaded, or copied versions','Independent verification of every underlying correction authority beyond the cited committed evidence'],
  correctionRoute:{pathname:policy.pathname, instruction:ledger.reportInstruction, owner:ledger.owner},
  revisionLedger:{schema:ledger.schema, version:ledger.version, publicHref:'/api/corrections.json', entries:ledger.entries.length, closed:ledger.entries.filter((entry) => entry.state === 'closed').length},
  affectedOutputAnalysis:{required:true,totalDispositionedOutputs:ledger.entries.reduce((sum, entry) => sum + entry.affectedOutputs.length, 0)},
  responseStates:ledger.states,
  closureEvidence:{requiredForClosedEntries:true,closedEntriesWithEvidence:ledger.entries.filter((entry) => entry.state === 'closed' && entry.closedAt && entry.closureEvidence?.productionClosureCommit).length},
  review:{lastReviewed:'2026-08-02',nextReview:'2026-11-02',trigger:'Any confirmed error, correction report, change to a governed public output, correction-control change, or deployment change.'},
  checks, findings, metrics:{totalChecks:Object.keys(checks).length,passedChecks:Object.keys(checks).length-failures.length,failedChecks:failures.length,ledgerEntries:ledger.entries.length,affectedOutputs:ledger.entries.reduce((sum, entry) => sum + entry.affectedOutputs.length, 0)}, failures,
  prohibitedInference:'This bounded pass does not establish that the site is error-free, that every historical or current error has been found, that every correction is substantively correct, or that third-party, cached, downloaded, indexed, copied, confidential, or future outputs have been corrected.'
};

fs.mkdirSync('api/evaluations',{recursive:true}); fs.mkdirSync('content/evaluations',{recursive:true});
fs.writeFileSync('api/corrections.json', `${JSON.stringify(publicLedger,null,2)}\n`);
const output = `${JSON.stringify(record,null,2)}\n`;
fs.writeFileSync('api/evaluations/corrections.json', output);
fs.writeFileSync('content/evaluations/corrections.json', output);
if (failures.length) { console.error(`Corrections assurance failed closed: ${failures.join(', ')}; ${findings.length} ledger finding(s).`); process.exit(1); }
console.log(`Corrections assurance passed within the bounded public-process and ledger-integrity scope: ${Object.keys(checks).length}/${Object.keys(checks).length} checks; ${ledger.entries.length} ledger entries; ${record.metrics.affectedOutputs} affected-output dispositions.`);

function finding(id, rule) { findings.push({id, rule}); }
