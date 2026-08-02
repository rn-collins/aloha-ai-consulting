import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const read = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));
const policy = read('content/governance/rights-attribution-policy.json');
const register = read('content/governance/rights-attribution-register.json');
const excluded = new Set(['node_modules','.git']);
const extensions = new Set(['.png','.jpg','.jpeg','.svg','.woff','.woff2','.pdf']);
const assets = [];
function walk(dir) {
  for (const entry of fs.readdirSync(dir,{withFileTypes:true})) {
    if (excluded.has(entry.name) || entry.name === 'build-snapshots') continue;
    const file = path.join(dir,entry.name);
    if (entry.isDirectory()) walk(file);
    else if (extensions.has(path.extname(entry.name).toLowerCase())) {
      const body = fs.readFileSync(file);
      assets.push({path:file.replace(/^\.\//,''),sha256:crypto.createHash('sha256').update(body).digest('hex'),bytes:body.length,...register.assetDefaults});
    }
  }
}
walk('.');
assets.sort((a,b) => a.path.localeCompare(b.path));
const requiredClassFields = ['id','material','creatorOrSource','rightsBasis','licenseOrPermission','attribution','restrictions','reviewOwner','reviewedAt','changeTrigger'];
const requiredAssetFields = ['path','sha256','bytes','class','creatorOrSource','rightsBasis','licenseOrPermission','attribution','restrictions','reviewOwner','reviewedAt'];
const requiredThirdPartyFields = ['names','use','ownership','endorsement','logoUse'];
const classFindings = (register.rightsClasses || []).flatMap((record) => requiredClassFields.filter((field) => !record[field] || (Array.isArray(record[field]) && !record[field].length)).map((field) => `${record.id || 'unknown'}:${field}`));
const assetFindings = assets.flatMap((record) => requiredAssetFields.filter((field) => record[field] === undefined || record[field] === '').map((field) => `${record.path}:${field}`));
const thirdPartyFindings = (register.thirdPartyReferences || []).flatMap((record,index) => requiredThirdPartyFields.filter((field) => !record[field] || (Array.isArray(record[field]) && !record[field].length)).map((field) => `third-party-${index}:${field}`));
const body = JSON.stringify(policy);
const checks = {
  'public-policy-defined': policy.pathname === '/rights-attribution' && policy.kind === 'policy',
  'ownership-claim-bounded': body.includes('That claim does not extend to facts, ideas, legal authorities') && body.includes('Publication alone is not proof'),
  'link-is-not-license-rule': body.includes('not by itself a license'),
  'sources-and-datasets-distinguished': body.includes('A dataset record must distinguish'),
  'third-party-marks-bounded': body.includes('does not imply sponsorship, endorsement, partnership, affiliation'),
  'visitor-reuse-terms-published': body.includes('No broader license to copy, republish, sell, train a model on'),
  'private-reporting-route-published': body.includes('rights report — no meeting needed'),
  'rights-classes-complete': (register.rightsClasses || []).length >= 5 && classFindings.length === 0,
  'third-party-references-complete': (register.thirdPartyReferences || []).length >= 2 && thirdPartyFindings.length === 0,
  'public-asset-inventory-present': assets.length >= 20,
  'public-assets-hashed-and-complete': assetFindings.length === 0 && assets.every((asset) => /^[a-f0-9]{64}$/.test(asset.sha256)),
  'prohibited-inferences-published': body.includes('not a copyright registration') && body.includes('non-infringement')
};
const failed = Object.entries(checks).filter(([,pass]) => !pass).map(([id]) => id);
const findings = [...classFindings,...assetFindings,...thirdPartyFindings];
const publicRegister = {...register,assets,counts:{rightsClasses:register.rightsClasses.length,thirdPartyReferences:register.thirdPartyReferences.length,assets:assets.length,findings:findings.length}};
const evaluation = {
  schema:'aloha-ai-site-assurance/1.0', assuranceId:'ASSURANCE-RIGHTS-ATTRIBUTION-001', domain:'rights-attribution', evaluatedAt:'2026-08-02', owner:'RN Collins / Aloha AI',
  decision:failed.length ? 'failed-closed' : 'passed-limited-checked-in-public-asset-and-rights-process-scope',
  scope:'Public rights and attribution policy, selected rights classes and third-party references, and a hash-based inventory of checked-in public image and vector assets.',
  exclusions:['Copyright registration, chain of title, work-for-hire and contributor-agreement verification, trademark search, fair-use or public-domain legal opinion, and non-infringement determination','Repository-wide software-composition or dependency-license audit','Client, confidential, linked, remotely hosted, user-supplied, and future-deployment material','Independent verification of authorship, originality, ownership, permission, license compatibility, or every quotation and dataset'],
  rightsRegister:{href:'/api/rights-attribution-register.json',schema:register.schema,rightsClasses:register.rightsClasses.length,thirdPartyReferences:register.thirdPartyReferences.length,assets:assets.length},
  assetIntegrity:{algorithm:'sha256',files:assets.length,completeFiles:assets.length-new Set(assetFindings.map((item)=>item.split(':')[0])).size},
  reportingRoute:{pathname:'/rights-attribution',instruction:'rights report — no meeting needed',channel:'Microsoft Bookings note'},
  checks, findings, metrics:{totalChecks:Object.keys(checks).length,passedChecks:Object.keys(checks).length-failed.length,failedChecks:failed.length,recordFindings:findings.length,assets:assets.length},
  review:{lastReviewed:'2026-08-02',nextReview:'2026-11-02',trigger:'Any new or changed asset, dataset, source excerpt, license, permission, attribution, mark, download, contributor, dispute, correction, evaluator, or deployment.'},
  prohibitedInference:'This bounded pass is not a copyright registration, title or chain-of-title opinion, trademark clearance, fair-use or public-domain determination, dependency-license audit, or evidence of originality, ownership, permission, license compatibility, enforceability, or non-infringement.'
};
fs.mkdirSync('api/evaluations',{recursive:true}); fs.mkdirSync('content/evaluations',{recursive:true});
fs.writeFileSync('api/rights-attribution-register.json',`${JSON.stringify(publicRegister,null,2)}\n`);
const output = `${JSON.stringify(evaluation,null,2)}\n`;
fs.writeFileSync('api/evaluations/rights-attribution.json',output); fs.writeFileSync('content/evaluations/rights-attribution.json',output);
if (failed.length) { console.error(`Rights-attribution assurance failed closed: ${failed.join(', ')}; ${findings.length} finding(s).`); process.exit(1); }
console.log(`Rights-attribution assurance passed within the checked-in public-asset and rights-process scope: ${Object.keys(checks).length}/${Object.keys(checks).length} checks; ${assets.length} assets; ${findings.length} findings.`);
