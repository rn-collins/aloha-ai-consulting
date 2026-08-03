import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';

const root=process.cwd();
const read=file=>JSON.parse(fs.readFileSync(path.join(root,file),'utf8'));
const register=read('content/governance/r09-neuroscience-trust-artifact-register.json');
const architecture=read('content/governance/r09-delivery-architecture.json');
const obligations=read('content/governance/r09-obligation-register.json');
const record=register.artifact;
const contract=architecture.artifacts[1];
const dir=path.join(root,record.packagePath);
const manifest=read(path.join(record.packagePath,'manifest.json'));
const claims=read(path.join(record.packagePath,'scientific-claim-map.json'));
const policies=read(path.join(record.packagePath,'platform-policy-ledger.json'));
const rewrites=read(path.join(record.packagePath,'worked-rewrites.json'));
const script=read(path.join(record.packagePath,'twelve-minute-script-template.json'));
const findings=[];
const exists=name=>fs.existsSync(path.join(dir,name));

if(register.schema!=='aloha-ai-r09-neuroscience-trust-artifact-register/1.0') findings.push('Unsupported Unit 4 register schema.');
if(record.resourceId!==contract.resourceId||record.artifactName!==contract.artifactName) findings.push('Second governed build target is not preserved.');
if(!obligations.acquisitionObligations.some(o=>o.resourceId===record.resourceId&&o.artifactName===record.artifactName)) findings.push('Acquisition obligation is not preserved.');
if(record.acquisitionState!=='unavailable'||record.state!=='built-frozen-pre-release'||record.workspaceEntitlement!==false) findings.push('Build, acquisition, or Workspace boundaries are inaccurate.');
if(record.releaseBlockers?.length<8||!/not an acquisition release/i.test(register.boundary)) findings.push('Fail-closed acquisition boundary is incomplete.');

for(const file of manifest.files||[]){const target=path.join(dir,file.path);if(!fs.existsSync(target)){findings.push(`Manifest file missing: ${file.path}`);continue;}const data=fs.readFileSync(target);if(data.length!==file.bytes||crypto.createHash('sha256').update(data).digest('hex')!==file.sha256)findings.push(`Manifest integrity failed: ${file.path}`);}
for(const name of ['README.md','neuroscience-trust-content-architecture-handbook.pdf','dual-appraisal-crosswalk.csv','worked-rewrites.json','worked-rewrites.md','twelve-minute-script-template.docx','twelve-minute-script-template.json','edsa-quick-reference-card.pdf','quick-reference-card.md','platform-policy-ledger.json','platform-policy-ledger.md','scientific-claim-map.json','scientific-references.md','unseen-brief-validation.md','editorial-review-checklist.md','LICENSE.md','RIGHTS-AND-ATTRIBUTION.md','ACCESSIBILITY.md','SUPPORT-AND-MAINTENANCE.md','CHANGELOG.md'])if(!exists(name))findings.push(`Required component missing: ${name}`);

if(contract.contents.length!==8||!contract.contents.every(c=>manifest.contents.includes(c)))findings.push('Manifest does not exactly preserve all eight architecture contents.');
if(claims.claims?.length<4||claims.claims.some(c=>!c.id||!c.claim||!c.status||!c.sourceIds?.length||!c.allowedUse||!c.prohibitedUse))findings.push('Scientific claim map lacks bounded claims, sources, or use rules.');
if(policies.policies?.length<4||policies.policies.some(p=>!p.platform||!/^https:\/\//.test(p.url)||p.retrievedAt!=='2026-08-03'||!['current','unverified'].includes(p.status)||!/not|no |does not|never|depends/i.test(p.boundedStatement)))findings.push('Platform-policy ledger lacks dated, status-bearing bounded records.');
if(rewrites.count!==3||rewrites.examples?.length!==3||rewrites.examples.some(e=>e.decisions?.length!==4)||rewrites.examples.map(e=>e.topic).join(',')!=='psilocybin,cannabis,prescription-antidepressants')findings.push('The exact three promised psilocybin, cannabis, and prescription-antidepressant EDSA rewrites are not present.');
if(script.durationSeconds!==720||script.segments?.length!==10||script.segments[0]?.time!=='0:00–0:30'||script.segments.at(-1)?.time!=='11:15–12:00'||script.segments.some(s=>s.requiredFields?.length!==4))findings.push('Complete annotated 0:00–12:00 template is absent.');
const handbook=fs.readFileSync(path.join(dir,'handbook.md'),'utf8');
if(!['Evidence','Discussion','Self-Determination','Action'].every(x=>handbook.includes(`**${x}**`))||(handbook.match(/Never /g)||[]).length<5)findings.push('EDSA method or five hard-never rules are incomplete.');
const unseen=fs.readFileSync(path.join(dir,'unseen-brief-validation.md'),'utf8');
if(!['Evidence:','Discussion:','Self-Determination:','Action:','No distribution'].every(x=>unseen.includes(x)))findings.push('Unseen-brief validation does not document each bounded decision.');
const allText=manifest.files.filter(f=>/\.(md|csv|json)$/.test(f.path)).map(f=>fs.readFileSync(path.join(dir,f.path),'utf8')).join('\n');
if(!/source-review cutoff/i.test(allText)||!/cannot diagnose/i.test(allText)||!/guarantee platform distribution/i.test(allText))findings.push('Date, diagnosis, or distribution boundary is incomplete.');
if(/(?:this (?:framework|package)|EDSA) (?:will |does )?(?:guarantee|predict)s? (?:trust|reach|distribution|engagement|an individual|the individual)/i.test(allText))findings.push('Prohibited affirmative assurance language appears in package text.');
try{execFileSync('unzip',['-tq',path.join(dir,'twelve-minute-script-template.docx')],{stdio:'pipe'});}catch{findings.push('DOCX container validation failed.');}
try{execFileSync('unzip',['-tq',path.join(dir,'neuroscience-trust-content-architecture-2026.08.0.zip')],{stdio:'pipe'});}catch{findings.push('Artifact ZIP validation failed.');}
for(const pdf of ['neuroscience-trust-content-architecture-handbook.pdf','edsa-quick-reference-card.pdf'])if(fs.readFileSync(path.join(dir,pdf)).subarray(0,5).toString()!=='%PDF-')findings.push(`PDF signature validation failed: ${pdf}`);
if(record.specificAcceptanceTests?.length!==4||record.acceptedUniversalTests?.join(',')!=='1,2,3,4,8'||record.deferredUniversalTests?.join(',')!=='5,6,7')findings.push('Acceptance accounting is incomplete.');

const checks={
 exactSecondArtifact:record.resourceId===architecture.artifacts[1]?.resourceId,
 obligationAndNamePreserved:obligations.acquisitionObligations.some(o=>o.resourceId===record.resourceId&&o.artifactName===record.artifactName),
 immutableVersionManifest:manifest.version===record.version&&manifest.state==='frozen-pre-release'&&manifest.files.length>=22,
 checksumIntegrity:findings.every(f=>!f.startsWith('Manifest')),
 exactEightContents:contract.contents.length===8&&contract.contents.every(c=>manifest.contents.includes(c)),
 dualAppraisalAndEdsa:exists('dual-appraisal-crosswalk.csv')&&['Evidence','Discussion','Self-Determination','Action'].every(x=>handbook.includes(`**${x}**`)),
 boundedScientificClaimMap:claims.claims?.length>=4&&!findings.some(f=>f.startsWith('Scientific')),
 datedPlatformPolicyLedger:policies.policies?.length>=4&&!findings.some(f=>f.startsWith('Platform')),
 threeWorkedRewrites:rewrites.examples?.length===3&&rewrites.examples.map(e=>e.topic).join(',')==='psilocybin,cannabis,prescription-antidepressants',
 completeTwelveMinuteTemplate:script.durationSeconds===720&&script.segments?.length===10,
 unseenBriefAndHardNeverRules:unseen.includes('No distribution')&&(handbook.match(/Never /g)||[]).length>=5,
 validPdfDocxAndZip:!findings.some(f=>/PDF|DOCX|ZIP/.test(f)),
 universalAcceptanceAccounted:record.acceptedUniversalTests?.length===5&&record.deferredUniversalTests?.length===3,
 acquisitionRemainsUnavailable:record.acquisitionState==='unavailable'&&record.releaseBlockers.length>=8,
 workspaceNotEntitled:record.workspaceEntitlement===false,
 noFindings:findings.length===0
};
const report={schema:'aloha-ai-r09-neuroscience-trust-artifact-evaluation/1.0',evaluatedAt:'2026-08-03',scope:register.scope,boundary:register.boundary,counts:{artifacts:1,manifestFiles:manifest.files.length,architectureContents:contract.contents.length,scientificClaims:claims.claims.length,platformPolicies:policies.policies.length,workedRewrites:rewrites.examples.length,scriptSegments:script.segments.length,scriptDurationSeconds:script.durationSeconds,specificAcceptanceTests:record.specificAcceptanceTests.length,acceptedUniversalTests:record.acceptedUniversalTests.length,deferredUniversalTests:record.deferredUniversalTests.length,releaseBlockers:record.releaseBlockers.length},checks,findings};
for(const [file,data] of [['artifacts/r09-neuroscience-trust-artifact-evaluation.json',report],['api/r09-neuroscience-trust-artifact-register.json',register]]){const target=path.join(root,file);fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,`${JSON.stringify(data,null,2)}\n`);}
console.log(`R09 neuroscience-trust artifact: ${Object.values(checks).filter(Boolean).length}/${Object.keys(checks).length} checks; ${manifest.files.length} files; ${findings.length} findings.`);
if(findings.length){for(const finding of findings)console.error(`- ${finding}`);process.exit(1);}
