import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const register = JSON.parse(fs.readFileSync(path.join(root, 'content/governance/public-download-evidence-register.json'), 'utf8'));
const actionAudit = JSON.parse(fs.readFileSync(path.join(root, 'artifacts/shared-action-audit/report.json'), 'utf8'));
const findings = [];
const required = register.requiredContract || [];
const expected = register.records.flatMap((record) => record.actions.map((label) => `${record.route}\u0000${label}`)).sort();
const observed = actionAudit.actions.filter((action) => action.kind === 'export').map((action) => `${action.route}\u0000${action.label}`).sort();

if (new Set(register.records.map((record) => record.route)).size !== register.records.length) findings.push('duplicate registered route');
if (JSON.stringify(expected) !== JSON.stringify(observed)) findings.push('registered actions do not exactly match the generated export-action inventory');

let contractCalls = 0;
for (const record of register.records) {
  const relative = record.route.replace(/^\//, '') || 'index';
  const file = path.join(root, `${relative}.html`);
  if (!fs.existsSync(file)) { findings.push(`${record.route}: generated route missing`); continue; }
  const html = fs.readFileSync(file, 'utf8');
  if (!html.includes('/browser-actions.js')) findings.push(`${record.route}: shared action runtime missing`);
  const linkedScripts = [...html.matchAll(/<script[^>]+src=["']\/([^"']+\.js)["'][^>]*>/g)]
    .map((match) => path.join(root, match[1]))
    .filter((script) => fs.existsSync(script))
    .map((script) => fs.readFileSync(script, 'utf8'));
  const executable = [html, ...linkedScripts].join('\n');
  const calls = [...executable.matchAll(/(?:window\.)?AlohaActions\.download\(\{[\s\S]*?\}\)/g)].map((match) => match[0]);
  contractCalls += calls.length;
  if (calls.length < record.actions.length) findings.push(`${record.route}: fewer download contracts than represented actions`);
  for (const call of calls) {
    for (const field of required) if (!new RegExp(`\\b${field}\\s*:`).test(call)) findings.push(`${record.route}: download contract missing ${field}`);
  }
}

const runtime = fs.readFileSync(path.join(root, 'browser-actions.js'), 'utf8');
if (!/invalid-export-contract/.test(runtime) || !/URL\.createObjectURL/.test(runtime) || !/URL\.revokeObjectURL/.test(runtime)) findings.push('shared runtime lacks fail-closed object-URL download lifecycle');

const checks = [
  {id:'schema', pass:register.schema === 'aloha-public-download-evidence/v1'},
  {id:'unique-routes', pass:new Set(register.records.map((record) => record.route)).size === register.records.length},
  {id:'exact-action-coverage', pass:JSON.stringify(expected) === JSON.stringify(observed)},
  {id:'generated-routes', pass:!findings.some((item) => item.includes('generated route missing'))},
  {id:'shared-runtime', pass:!findings.some((item) => item.includes('shared action runtime missing'))},
  {id:'action-contract-count', pass:!findings.some((item) => item.includes('fewer download contracts'))},
  {id:'content-contract', pass:!findings.some((item) => item.includes('missing content'))},
  {id:'file-contract', pass:!findings.some((item) => item.includes('missing filename') || item.includes('missing mimeType'))},
  {id:'version-use-boundary', pass:!findings.some((item) => item.includes('missing version') || item.includes('missing license'))},
  {id:'fail-closed-runtime', pass:!findings.some((item) => item.includes('fail-closed'))}
];
const families = Object.fromEntries([...new Set(register.records.map((record) => record.family))].sort().map((family) => [family, register.records.filter((record) => record.family === family).length]));
const report = {
  schema:'aloha-public-download-evidence-evaluation/v1', evaluatedAt:new Date().toISOString(),
  boundary:register.deliveryBoundary,
  register:{href:'/api/public-download-evidence-register.json',routes:register.records.length,actions:expected.length,families},
  runtime:{version:'1.0.0',contractCalls,requiredFields:required},
  checks, findings, pass:checks.every((check) => check.pass) && findings.length === 0
};
fs.mkdirSync(path.join(root, 'artifacts'), {recursive:true});
fs.writeFileSync(path.join(root, 'artifacts/public-download-evidence-evaluation.json'), `${JSON.stringify(report, null, 2)}\n`);
fs.mkdirSync(path.join(root, 'api'), {recursive:true});
fs.writeFileSync(path.join(root, 'api/public-download-evidence-register.json'), `${JSON.stringify(register, null, 2)}\n`);
console.log(`Public download evidence: ${checks.filter((check) => check.pass).length}/${checks.length} checks; ${register.records.length} routes; ${expected.length} actions; ${findings.length} findings.`);
if (!report.pass) { findings.forEach((finding) => console.error(`- ${finding}`)); process.exit(1); }
