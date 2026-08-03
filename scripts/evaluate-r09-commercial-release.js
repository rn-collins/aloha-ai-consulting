import fs from 'node:fs';
import path from 'node:path';

const root=process.cwd();
const read=(p)=>fs.readFileSync(path.join(root,p),'utf8');
const json=(p)=>JSON.parse(read(p));
const register=json('content/governance/r09-commercial-release-register.json');
const catalog=json('content/governance/r09-commerce-catalog.json');
const stage=read('scripts/stage-r09-commercial-payloads.js');
const readiness=read('api/commerce/readiness.js');
const commerce=read('api/_lib/commerce.js');
const ignore=read('.gitignore');
const findings=[];
const ids=register.products.map((p)=>p.resourceId);
if(register.schema!=='aloha-ai-r09-commercial-release-register/1.0')findings.push('Commercial release register schema mismatch.');
if(register.targetVersion!==catalog.commercialVersionTarget||register.targetVersion!=='2026.08.1')findings.push('Commercial version target mismatch.');
if(ids.length!==6||new Set(ids).size!==6)findings.push('Exactly six unique products are required.');
if(register.products.some((p)=>p.state!=='blocked'))findings.push('A product was marked releasable without external proof.');
if(register.productionProofScenarios.length!==10)findings.push('Ten production proof scenarios are required.');
if(!register.products.find((p)=>p.resourceId==='sb303-compliance-kit')?.additionalGate?.includes('Oregon'))findings.push('Oregon review gate is missing.');
if(!ignore.includes('.commerce-private/'))findings.push('Private commercial staging is not gitignored.');
for(const token of ['commercial-release-candidate','zipSha===sha','manifestSha===sha','workspaceEntitlement!==false','two business days','14 calendar days'])if(!stage.includes(token))findings.push(`Private staging control missing: ${token}`);
if(!/productConfiguration/.test(readiness)||!/releaseEvidence/.test(readiness))findings.push('Readiness does not expose per-product configuration and evidence gates.');
if(!/productReleaseReady/.test(commerce))findings.push('Checkout has no per-product release readiness helper.');
const checks={exactSixProducts:ids.length===6&&new Set(ids).size===6,targetVersionFrozen:register.targetVersion==='2026.08.1',privateRootsIgnored:ignore.includes('.commerce-private/')&&ignore.includes('commercial-private/'),requiredFilesDefined:register.requiredPrivatePackageFiles.length===4,zipFreshnessGate:stage.includes('zipSha===sha'),manifestFreshnessGate:stage.includes('manifestSha===sha'),licenseGate:stage.includes('manifest.licenseId!==catalog.license.id'),workspaceBoundary:stage.includes('manifest.workspaceEntitlement!==false'),supportDisclosureGate:/two business days/.test(stage),refundDisclosureGate:/14 calendar days/.test(stage),noPublicUpload:stage.includes("if(upload)fail"),exactProductionProofDenominator:register.productionProofScenarios.length===10,oregonGatePreserved:Boolean(register.products.find((p)=>p.resourceId==='sb303-compliance-kit')?.additionalGate),perProductReadiness:/productConfiguration/.test(readiness)&&/releaseEvidence/.test(readiness),checkoutFailClosed:/productReleaseReady/.test(commerce),allProductsBlocked:register.products.every((p)=>p.state==='blocked'),commerceClosed:catalog.commercialState==='closed',noFindings:findings.length===0};
const report={schema:'aloha-ai-r09-commercial-release-evaluation/1.0',evaluatedAt:'2026-08-03',status:findings.length?'failed':'passed-private-release-controls-external-evidence-pending',boundary:register.boundary,counts:{products:ids.length,checks:Object.keys(checks).length,productionProofScenarios:register.productionProofScenarios.length,externalEvidenceRecords:0},checks,remainingExternalBlockers:catalog.globalBlockers,productSpecificBlockers:catalog.productBlockers,findings};
for(const p of ['artifacts/r09-commercial-release-evaluation.json','api/r09-commercial-release.json']){fs.mkdirSync(path.dirname(path.join(root,p)),{recursive:true});fs.writeFileSync(path.join(root,p),JSON.stringify(report,null,2)+'\n');}
console.log(`R09 commercial release controls: ${Object.values(checks).filter(Boolean).length}/${Object.keys(checks).length}; ${findings.length} findings; external evidence pending.`);
if(findings.length){for(const finding of findings)console.error(`- ${finding}`);process.exit(1);}
