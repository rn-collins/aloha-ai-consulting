import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';

const root = process.cwd();
const read = (file) => JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
const register = read('content/governance/r09-artifact-build-register.json');
const architecture = read('content/governance/r09-delivery-architecture.json');
const obligations = read('content/governance/r09-obligation-register.json');
const record = register.artifacts?.[0];
const dir = path.join(root, record?.packagePath || 'missing');
const manifest = read(path.join(record.packagePath, 'manifest.json'));
const findings = [];
const exists = (name) => fs.existsSync(path.join(dir, name));

if (register.schema !== 'aloha-ai-r09-artifact-build-register/1.0') findings.push('Unsupported artifact-build register schema.');
if (!record || register.artifacts.length !== 1) findings.push('Unit 3 must govern exactly the first artifact.');
if (record?.resourceId !== architecture.artifacts[0]?.resourceId || record?.artifactName !== architecture.artifacts[0]?.artifactName) findings.push('Unit 3 does not preserve the first governed build target.');
if (record?.acquisitionState !== 'unavailable' || record?.state !== 'built-frozen-pre-release' || record?.workspaceEntitlement !== false) findings.push('Build, acquisition, or Workspace boundaries are inaccurate.');
if (!/not an acquisition release/i.test(register.boundary || '') || (record?.releaseBlockers || []).length < 8) findings.push('Fail-closed acquisition boundary is incomplete.');

for (const file of manifest.files || []) {
  const target = path.join(dir, file.path);
  if (!fs.existsSync(target)) { findings.push(`Manifest file missing: ${file.path}`); continue; }
  const data = fs.readFileSync(target);
  const digest = crypto.createHash('sha256').update(data).digest('hex');
  if (data.length !== file.bytes || digest !== file.sha256) findings.push(`Manifest integrity failed: ${file.path}`);
}
for (const name of ['README.md','five-domain-knowledge-base-handbook.pdf','voice-configuration-template.docx','annotated-prompts.json','prompts.txt','source-ledger.csv','pricing-ledger.csv','record-schemas.json','setup-checklist.md','when-to-hire.md','LICENSE.md','RIGHTS-AND-ATTRIBUTION.md','ACCESSIBILITY.md','SUPPORT-AND-MAINTENANCE.md','CHANGELOG.md','worked-example/INDEX.md']) if (!exists(name)) findings.push(`Required component missing: ${name}`);

const prompts = read(path.join(record.packagePath,'annotated-prompts.json'));
const spec = read(path.join(record.packagePath,'five-domain-specification.json'));
const schemas = read(path.join(record.packagePath,'record-schemas.json'));
const source = read(path.join(record.packagePath,'worked-example/source-record.json'));
const claim = read(path.join(record.packagePath,'worked-example/claim-record.json'));
const review = read(path.join(record.packagePath,'worked-example/review-record.json'));
const example = read(path.join(record.packagePath,'worked-example/example-record.json'));
if (prompts.count !== 20 || prompts.prompts?.length !== 20 || new Set(prompts.prompts.map(p=>p.id)).size !== 20) findings.push('Twenty unique annotated prompts are not present.');
if (spec.domains?.map(d=>d.id).join(',') !== 'evidence,claims,voice,audience,examples') findings.push('Exact five-domain specification is absent.');
if (!schemas.source || !schemas.claim || !schemas.review) findings.push('Source, claim, and review schemas are incomplete.');
if (!claim.sourceIds?.includes(source.sourceId) || !example.claimIds?.includes(claim.claimId) || !review.claimIds?.includes(claim.claimId) || claim.approval !== 'approved' || review.decision !== 'approve') findings.push('Worked-example claim trace or approval failed.');

try { execFileSync('node',['validate-example.js'],{cwd:path.join(dir,'worked-example'),stdio:'pipe'}); } catch { findings.push('Worked-example executable validation failed.'); }
try { execFileSync('unzip',['-tq',path.join(dir,'voice-configuration-template.docx')],{stdio:'pipe'}); } catch { findings.push('DOCX container validation failed.'); }
try { execFileSync('unzip',['-tq',path.join(dir,'five-domain-knowledge-base-2026.08.0.zip')],{stdio:'pipe'}); } catch { findings.push('Artifact ZIP validation failed.'); }
if (fs.readFileSync(path.join(dir,'five-domain-knowledge-base-handbook.pdf')).subarray(0,5).toString() !== '%PDF-') findings.push('PDF signature validation failed.');

const allText = manifest.files.filter(f=>/\.(md|txt|csv|json)$/.test(f.path)).map(f=>fs.readFileSync(path.join(dir,f.path),'utf8')).join('\n');
if (!/source-review cutoff/i.test(allText) || !/human review/i.test(allText) || !/does not/i.test(allText)) findings.push('Date, human-review, or professional boundaries are incomplete.');
if ((record.specificAcceptanceTests || []).length !== 4 || (record.acceptedUniversalTests || []).join(',') !== '1,2,3,4,8' || (record.deferredUniversalTests || []).join(',') !== '5,6,7') findings.push('Specific or universal acceptance accounting is incomplete.');

const checks = {
  exactFirstArtifact: record?.resourceId === architecture.artifacts[0]?.resourceId,
  obligationAndNamePreserved: obligations.acquisitionObligations.some(o=>o.resourceId===record?.resourceId && o.artifactName===record?.artifactName),
  immutableVersionManifest: manifest.version === record?.version && manifest.state === 'frozen-pre-release' && manifest.files.length >= 25,
  checksumIntegrity: findings.every(f=>!f.startsWith('Manifest')),
  requiredContentsAndFormats: architecture.artifacts[0].contents.length === 9 && ['PDF handbook','Markdown source pack','CSV source and pricing ledgers','JSON schemas and example records','DOCX voice template','plain-text prompt pack','ZIP package'].every(format=>architecture.artifacts[0].formats.includes(format)),
  exactFiveDomains: spec.domains?.length === 5,
  twentyAnnotatedPrompts: prompts.prompts?.length === 20,
  schemasAndFixtures: Boolean(schemas.source && schemas.claim && schemas.review && source && claim && review),
  traceableWorkedExample: claim.sourceIds?.includes(source.sourceId) && example.claimIds?.includes(claim.claimId) && review.claimIds?.includes(claim.claimId),
  validPdfDocxAndZip: !findings.some(f=>/PDF|DOCX|ZIP/.test(f)),
  universalAcceptanceAccounted: record.acceptedUniversalTests?.length === 5 && record.deferredUniversalTests?.length === 3,
  acquisitionRemainsUnavailable: record.acquisitionState === 'unavailable' && record.releaseBlockers.length >= 8,
  workspaceNotEntitled: record.workspaceEntitlement === false,
  noFindings: findings.length === 0
};
const report = {schema:'aloha-ai-r09-artifact-build-evaluation/1.0',evaluatedAt:'2026-08-03',scope:register.scope,boundary:register.boundary,counts:{artifacts:1,manifestFiles:manifest.files.length,prompts:prompts.prompts.length,domains:spec.domains.length,specificAcceptanceTests:record.specificAcceptanceTests.length,acceptedUniversalTests:record.acceptedUniversalTests.length,deferredUniversalTests:record.deferredUniversalTests.length,releaseBlockers:record.releaseBlockers.length},checks,findings};
for (const [file,data] of [['artifacts/r09-artifact-build-evaluation.json',report],['api/r09-artifact-build-register.json',register]]) { const target=path.join(root,file); fs.mkdirSync(path.dirname(target),{recursive:true}); fs.writeFileSync(target,`${JSON.stringify(data,null,2)}\n`); }
console.log(`R09 artifact build: ${Object.values(checks).filter(Boolean).length}/${Object.keys(checks).length} checks; ${manifest.files.length} files; ${prompts.prompts.length} prompts; ${findings.length} findings.`);
if(findings.length){for(const finding of findings) console.error(`- ${finding}`);process.exit(1);}
