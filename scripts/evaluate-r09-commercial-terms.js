import fs from 'node:fs';
import path from 'node:path';

const root=process.cwd();
const read=(p)=>fs.readFileSync(path.join(root,p),'utf8');
const catalog=JSON.parse(read('content/governance/r09-commerce-catalog.json'));
const commerce=read('api/_lib/commerce.js');
const checkout=read('api/commerce/checkout.js');
const webhook=read('api/commerce/webhook.js');
const receipt=read('api/commerce/receipt.js');
const download=read('api/commerce/download.js');
const findings=[];
const ids=(catalog.products||[]).map((row)=>row[0]);
const prices=catalog.approvedPrices||{};

if(catalog.schema!=='aloha-ai-r09-commerce-catalog/1.1')findings.push('Commercial catalog schema is not v1.1.');
if(ids.length!==6||new Set(ids).size!==6)findings.push('Exactly six unique products are required.');
if(Object.keys(prices).length!==6||ids.some((id)=>!prices[id]))findings.push('Every product must have one approved price.');
for(const id of ids){const price=prices[id];if(!Number.isInteger(price?.amount)||price.amount<125000||price.amount>250000||price.currency!=='usd')findings.push(`${id} price is outside the approved USD range.`);}
if(catalog.refundPolicy?.state!=='approved-not-active'||!/14 calendar days/i.test(catalog.refundPolicy?.summary||'')||!/no package download/i.test(catalog.refundPolicy?.summary||'')||!/duplicate charges/i.test(catalog.refundPolicy?.summary||'')||!/materially defective/i.test(catalog.refundPolicy?.summary||''))findings.push('Approved refund terms are incomplete.');
if(!/two business days/i.test(catalog.support?.responseTarget||'')||!/COMMERCE_SUPPORT_EMAIL/.test(catalog.support?.channel||''))findings.push('Approved support channel or response target is incomplete.');
if(catalog.license?.workspaceEntitlement!==false||!/one named legal organization/i.test(catalog.license?.scope||'')||(catalog.license?.prohibited||[]).length<4)findings.push('Named-organization license is incomplete.');
if(catalog.commercialVersionTarget!=='2026.08.1')findings.push('Fresh commercial version target is not frozen.');
if(catalog.commercialState!=='closed')findings.push('Commerce opened before external release gates passed.');
if(!catalog.globalBlockers.some((v)=>/private commercial payloads not uploaded/i.test(v))||!catalog.globalBlockers.some((v)=>/provider credentials not production-verified/i.test(v))||!catalog.globalBlockers.some((v)=>/production purchase suite not passed/i.test(v))||!catalog.globalBlockers.some((v)=>/public Git history/i.test(v)))findings.push('Required fail-closed blockers are missing.');
if(!catalog.productBlockers?.['sb303-compliance-kit']?.some((v)=>/Oregon legal\/compliance review/i.test(v)))findings.push('Oregon review blocker is missing.');
if(!/catalogSource\.approvedPrices/.test(commerce)||!/priceIdFor\(item\.resourceId\)/.test(checkout))findings.push('Server-authoritative catalog pricing is incomplete.');
if(!/object\.amount_total!==approved\.amount/.test(webhook)||!/object\.currency!==approved\.currency/.test(webhook))findings.push('Paid amount and currency are not reconciled to approved terms.');
if(!/refundPolicy:terms\.refundPolicy\.summary/.test(receipt)||!/supportResponseTarget:terms\.support\.responseTarget/.test(receipt))findings.push('Receipt does not disclose approved refund and support terms.');
if(!/redeemed_at/.test(download)||!/method:'PATCH'/.test(download))findings.push('Download redemption is not recorded for refund eligibility.');

const checks={
  sixProducts:ids.length===6&&new Set(ids).size===6,
  sixExactPrices:Object.keys(prices).length===6&&ids.every((id)=>Boolean(prices[id])),
  approvedRange:ids.every((id)=>Number.isInteger(prices[id]?.amount)&&prices[id].amount>=125000&&prices[id].amount<=250000),
  usdOnly:ids.every((id)=>prices[id]?.currency==='usd'),
  refundTermsApproved:catalog.refundPolicy?.state==='approved-not-active',
  supportTermsApproved:Boolean(catalog.support?.channel&&catalog.support?.responseTarget),
  licenseApproved:Boolean(catalog.license?.id)&&catalog.license?.workspaceEntitlement===false,
  freshVersionTarget:catalog.commercialVersionTarget==='2026.08.1',
  serverAuthoritativePrices:/priceIdFor\(item\.resourceId\)/.test(checkout),
  webhookAmountReconciliation:/object\.amount_total!==approved\.amount/.test(webhook),
  receiptTerms:/refundPolicy:terms\.refundPolicy\.summary/.test(receipt),
  redemptionEvidence:/redeemed_at/.test(download),
  commerceClosed:catalog.commercialState==='closed',
  privatePayloadRequired:catalog.globalBlockers.some((v)=>/private commercial payloads not uploaded/i.test(v)),
  providerProofRequired:catalog.globalBlockers.some((v)=>/provider credentials not production-verified/i.test(v)),
  purchaseProofRequired:catalog.globalBlockers.some((v)=>/production purchase suite not passed/i.test(v)),
  oregonReviewRequired:Boolean(catalog.productBlockers?.['sb303-compliance-kit']?.length),
  noWorkspaceEntitlement:catalog.workspaceEntitlement===false&&catalog.license?.workspaceEntitlement===false,
  noFindings:findings.length===0
};
const report={schema:'aloha-ai-r09-commercial-terms-evaluation/1.0',evaluatedAt:'2026-08-03',status:findings.length?'failed':'passed-terms-approved-commerce-closed',counts:{products:ids.length,approvedPrices:Object.keys(prices).length,checks:Object.keys(checks).length,remainingGlobalBlockers:catalog.globalBlockers.length,productSpecificBlockers:Object.values(catalog.productBlockers||{}).flat().length},prices,refundPolicy:catalog.refundPolicy,support:catalog.support,license:catalog.license,commercialVersionTarget:catalog.commercialVersionTarget,checks,findings};
for(const p of ['artifacts/r09-commercial-terms-evaluation.json','api/r09-commercial-terms.json']){fs.mkdirSync(path.dirname(path.join(root,p)),{recursive:true});fs.writeFileSync(path.join(root,p),JSON.stringify(report,null,2)+'\n');}
console.log(`R09 commercial terms: ${Object.values(checks).filter(Boolean).length}/${Object.keys(checks).length} checks; ${ids.length} products; ${findings.length} findings; commerce ${catalog.commercialState}.`);
if(findings.length){for(const finding of findings)console.error(`- ${finding}`);process.exit(1);}
