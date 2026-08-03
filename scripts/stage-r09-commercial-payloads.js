import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {execFileSync} from 'node:child_process';

const root=process.cwd();
const register=JSON.parse(fs.readFileSync(path.join(root,'content/governance/r09-commercial-release-register.json'),'utf8'));
const catalog=JSON.parse(fs.readFileSync(path.join(root,'content/governance/r09-commerce-catalog.json'),'utf8'));
const sourceRoot=path.resolve(root,process.env.COMMERCE_PRIVATE_SOURCE_ROOT||register.privateInputRoot);
const stagingRoot=path.resolve(root,process.env.COMMERCE_PRIVATE_STAGING_ROOT||register.privateStagingRoot);
const upload=process.argv.includes('--upload');
const sha=(file)=>crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const fail=(message)=>{throw new Error(message);};

if(!sourceRoot.includes(`${path.sep}.commerce-private${path.sep}`)&&!process.env.COMMERCE_PRIVATE_SOURCE_ROOT)fail('Default commercial input must remain under ignored .commerce-private/.');
fs.mkdirSync(stagingRoot,{recursive:true});
const evidence=[];
for(const product of register.products){
  const source=path.join(sourceRoot,product.slug,product.version);
  if(!fs.statSync(source,{throwIfNoEntry:false})?.isDirectory())fail(`Missing private source directory for ${product.resourceId}.`);
  for(const name of register.requiredPrivatePackageFiles)if(!fs.existsSync(path.join(source,name)))fail(`${product.resourceId} missing ${name}.`);
  const manifestPath=path.join(source,'manifest.json');
  const manifest=JSON.parse(fs.readFileSync(manifestPath,'utf8'));
  if(manifest.version!==register.targetVersion||manifest.state!=='commercial-release-candidate')fail(`${product.resourceId} manifest is not a ${register.targetVersion} commercial release candidate.`);
  if(manifest.licenseId!==catalog.license.id||manifest.workspaceEntitlement!==false)fail(`${product.resourceId} license or Workspace boundary mismatch.`);
  const disclosure=fs.readFileSync(path.join(source,'SUPPORT-AND-MAINTENANCE.md'),'utf8');
  if(!/two business days/i.test(disclosure)||!/14 calendar days/i.test(disclosure))fail(`${product.resourceId} support/refund disclosure is incomplete.`);
  const zipPath=path.join(stagingRoot,`${product.slug}-${product.version}.zip`);
  if(fs.existsSync(zipPath))fs.unlinkSync(zipPath);
  execFileSync('zip',['-qr',zipPath,'.'],{cwd:source});
  const publicDir=path.join(root,'artifacts/products',product.slug,'2026.08.0');
  const publicZip=fs.readdirSync(publicDir).find((name)=>name.endsWith('.zip'));
  const publicManifest=path.join(publicDir,'manifest.json');
  const zipSha=sha(zipPath),manifestSha=sha(manifestPath);
  if(publicZip&&zipSha===sha(path.join(publicDir,publicZip)))fail(`${product.resourceId} ZIP is not materially fresh.`);
  if(fs.existsSync(publicManifest)&&manifestSha===sha(publicManifest))fail(`${product.resourceId} manifest is not materially fresh.`);
  evidence.push({resourceId:product.resourceId,slug:product.slug,version:product.version,zipSha256:zipSha,manifestSha256:manifestSha,size:fs.statSync(zipPath).size,privateBlobPath:`commerce/${product.resourceId}/${product.version}/${path.basename(zipPath)}`,uploaded:false});
}
if(upload)fail('Private upload is intentionally separate: use the authenticated release runner after reviewing the redacted staging evidence.');
const evidencePath=path.join(stagingRoot,'commercial-payload-evidence.private.json');
fs.writeFileSync(evidencePath,JSON.stringify({schema:'aloha-ai-r09-private-payload-evidence/1.0',createdAt:new Date().toISOString(),targetVersion:register.targetVersion,products:evidence},null,2)+'\n');
console.log(`Staged ${evidence.length} private commercial payloads. Evidence: ${evidencePath}`);
