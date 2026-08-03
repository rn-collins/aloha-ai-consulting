import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const root=process.cwd();
const read=(p)=>fs.readFileSync(path.join(root,p),'utf8');
const json=(p)=>JSON.parse(read(p));
const catalog=json('content/governance/r09-commerce-catalog.json');
const architecture=json('content/governance/r09-delivery-architecture.json');
const findings=[];
const apiFiles=['catalog','checkout','webhook','download','redelivery','receipt','refund-request','readiness'].map(n=>`api/commerce/${n}.js`);
const sources=Object.fromEntries(apiFiles.map(p=>[p,read(p)]));
const productRows=catalog.products||[];
const publicZipPaths=[];
for(const row of productRows){const slug=row[2],version=row[3];const dir=path.join(root,'artifacts/products',slug,version);if(fs.existsSync(dir)){for(const name of fs.readdirSync(dir))if(name.endsWith('.zip'))publicZipPaths.push(path.relative(root,path.join(dir,name)));}}

if(catalog.schema!=='aloha-ai-r09-commerce-catalog/1.1')findings.push('Commerce catalog schema mismatch.');
if(catalog.commercialState!=='closed')findings.push('Commerce opened without production proof.');
if(productRows.length!==6||new Set(productRows.map(r=>r[0])).size!==6)findings.push('Catalog does not cover six unique artifacts.');
if(!catalog.globalBlockers.some(v=>/public Git history/i.test(v)))findings.push('Public-payload exposure is not a release blocker.');
if(!catalog.productBlockers?.['sb303-compliance-kit']?.some(v=>/Oregon legal\/compliance review/i.test(v)))findings.push('Oregon review blocker is missing.');
if(apiFiles.some(p=>!fs.existsSync(path.join(root,p))))findings.push('One or more commerce API surfaces are missing.');
if(!/constructEvent\(raw/.test(sources['api/commerce/webhook.js'])||!/bodyParser:false/.test(sources['api/commerce/webhook.js']))findings.push('Webhook raw-body signature verification is incomplete.');
if(!/provider_event_id/.test(sources['api/commerce/webhook.js'])||!/duplicate:true/.test(sources['api/commerce/webhook.js']))findings.push('Webhook idempotency is incomplete.');
if(!/Idempotency-Key required/.test(read('api/_lib/commerce.js'))||!/idempotencyKey:key/.test(sources['api/commerce/checkout.js']))findings.push('Checkout idempotency is incomplete.');
if(!/timingSafeEqual/.test(read('api/_lib/commerce.js'))||!/invalid_or_expired_delivery/.test(sources['api/commerce/download.js']))findings.push('Signed-delivery verification is incomplete.');
if(!/state:'refunded'/.test(sources['api/commerce/webhook.js'])||!/delivery_revoked/.test(sources['api/commerce/download.js']))findings.push('Refund or revocation behavior is incomplete.');
if(!/15\*60\*1000/.test(sources['api/commerce/redelivery.js'])||!/If the order is eligible/.test(sources['api/commerce/redelivery.js']))findings.push('Redelivery rate limit or enumeration resistance is incomplete.');
if(!/workspace_entitlement:'false'/.test(sources['api/commerce/checkout.js'])||catalog.workspaceEntitlement!==false)findings.push('Workspace separation changed.');
const sql=read('program/promise-delivery/remediation/r09/commerce-schema.sql');
for(const table of ['commerce_orders','commerce_events','commerce_deliveries','commerce_audit_log'])if(!sql.includes(table))findings.push(`Missing ${table} persistence contract.`);
if((sql.match(/enable row level security/g)||[]).length!==4||!/Intentionally no public policies/.test(sql))findings.push('Commerce persistence is not deny-by-default.');
if(publicZipPaths.length!==6)findings.push(`Expected six publicly exposed pre-release ZIPs; found ${publicZipPaths.length}.`);
if((architecture.acquisitionArchitecture?.productionProof||[]).length!==10)findings.push('Frozen production-proof denominator changed.');

const checks={
  exactCatalog:productRows.length===6&&new Set(productRows.map(r=>r[0])).size===6,
  failClosed:catalog.commercialState==='closed',
  pricesRecorded:Object.keys(catalog.approvedPrices||{}).length===6,
  refundAndSupportRecorded:catalog.refundPolicy.state==='approved-not-active'&&Boolean(catalog.support.channel)&&Boolean(catalog.support.responseTarget),
  publicPayloadExposureDetected:publicZipPaths.length===6&&catalog.globalBlockers.some(v=>/public Git history/i.test(v)),
  oregonReviewPreserved:Boolean(catalog.productBlockers?.['sb303-compliance-kit']?.length),
  checkoutSurface:Boolean(sources['api/commerce/checkout.js']),
  serverAuthoritativePrices:/priceIdFor\(item.resourceId\)/.test(sources['api/commerce/checkout.js']),
  checkoutIdempotency:/idempotencyKey:key/.test(sources['api/commerce/checkout.js']),
  rawWebhookVerification:/constructEvent\(raw/.test(sources['api/commerce/webhook.js'])&&/bodyParser:false/.test(sources['api/commerce/webhook.js']),
  webhookIdempotency:/provider_event_id/.test(sources['api/commerce/webhook.js']),
  immutableOrderSchema:/provider_checkout_id text not null unique/.test(sql)&&/idempotency_key text not null unique/.test(sql),
  signedDelivery:/timingSafeEqual/.test(read('api/_lib/commerce.js')),
  privateBlobDelivery:/access:'private'/.test(sources['api/commerce/download.js']),
  redeliveryControl:/15\*60\*1000/.test(sources['api/commerce/redelivery.js']),
  receiptSurface:/workspaceEntitlement:false/.test(sources['api/commerce/receipt.js']),
  refundRequestSurface:/refund-requested/.test(sources['api/commerce/refund-request.js']),
  refundRevocation:/state:'refunded'/.test(sources['api/commerce/webhook.js']),
  privacyMinimization:!/card_number|cvc|raw_card/i.test(Object.values(sources).join('\n')),
  denyByDefaultPersistence:(sql.match(/enable row level security/g)||[]).length===4,
  workspaceSeparated:catalog.workspaceEntitlement===false,
  productionProofStillRequired:architecture.acquisitionArchitecture.productionProof.length===10,
  noFindings:findings.length===0
};
const report={schema:'aloha-ai-r09-commerce-infrastructure-evaluation/1.0',evaluatedAt:'2026-08-03',status:findings.length?'failed':'passed-infrastructure-closed',boundary:catalog.boundary,counts:{products:productRows.length,apiSurfaces:apiFiles.length,persistenceTables:4,productionProofTests:architecture.acquisitionArchitecture.productionProof.length,publiclyExposedPreReleaseZips:publicZipPaths.length,globalReleaseBlockers:catalog.globalBlockers.length},checks,publicExposureEvidence:publicZipPaths.map(p=>({path:p,sha256:crypto.createHash('sha256').update(fs.readFileSync(path.join(root,p))).digest('hex')})),findings};
for(const p of ['artifacts/r09-commerce-infrastructure-evaluation.json','api/r09-commerce-infrastructure.json']){fs.mkdirSync(path.dirname(path.join(root,p)),{recursive:true});fs.writeFileSync(path.join(root,p),JSON.stringify(report,null,2)+'\n');}
console.log(`R09 commerce infrastructure: ${Object.values(checks).filter(Boolean).length}/${Object.keys(checks).length} checks; ${productRows.length} products; ${publicZipPaths.length} exposed pre-release ZIPs; ${findings.length} findings; commerce ${catalog.commercialState}.`);
if(findings.length){for(const finding of findings)console.error(`- ${finding}`);process.exit(1);}
