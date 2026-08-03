const crypto = require('crypto');
const Stripe = require('stripe');
const catalogSource = require('../../content/governance/r09-commerce-catalog.json');
const { supabase } = require('./platform');

function products() {
  return catalogSource.products.map(([resourceId, artifactName, slug, version]) => ({
    resourceId, artifactName, slug, version,
    commercialVersionTarget: catalogSource.commercialVersionTarget,
    state: 'unavailable', price: catalogSource.approvedPrices[resourceId],
    license: catalogSource.license,
    blockers: [...catalogSource.globalBlockers, ...(catalogSource.productBlockers[resourceId] || [])]
  }));
}
function catalog() { return {...catalogSource, products: products()}; }
function env(name) { if (!process.env[name]) { const e = new Error(`Missing commerce configuration: ${name}`); e.statusCode=503; throw e; } return process.env[name]; }
function stripe() { return new Stripe(env('STRIPE_SECRET_KEY'), {apiVersion:'2025-06-30.basil'}); }
function enabled() { return process.env.COMMERCE_ENABLED === 'true' && catalogSource.commercialState === 'open'; }
function requireEnabled() { if (!enabled()) { const e=new Error('Commerce is unavailable'); e.statusCode=503; throw e; } }
function product(id) { const value=products().find((p)=>p.resourceId===id); if(!value){const e=new Error('Unknown product');e.statusCode=404;throw e;} return value; }
function priceIdFor(id) { return env(`STRIPE_PRICE_${id.toUpperCase().replace(/[^A-Z0-9]/g,'_')}`); }
function privatePathFor(id) { return env(`COMMERCE_BLOB_${id.toUpperCase().replace(/[^A-Z0-9]/g,'_')}`); }
function manifestHashFor(id) { return env(`COMMERCE_MANIFEST_SHA256_${id.toUpperCase().replace(/[^A-Z0-9]/g,'_')}`); }
function siteUrl() { return env('COMMERCE_SITE_URL').replace(/\/$/,''); }
function safeIdempotency(value) { if(!/^[A-Za-z0-9:_-]{16,200}$/.test(value||'')){const e=new Error('Valid Idempotency-Key required');e.statusCode=400;throw e;} return value; }
function signDelivery(payload) { const body=Buffer.from(JSON.stringify(payload)).toString('base64url'); const sig=crypto.createHmac('sha256',env('COMMERCE_SIGNING_SECRET')).update(body).digest('base64url'); return `${body}.${sig}`; }
function verifyDelivery(token) { const [body,sig]=String(token||'').split('.'); if(!body||!sig) return null; const expected=crypto.createHmac('sha256',env('COMMERCE_SIGNING_SECRET')).update(body).digest('base64url'); if(sig.length!==expected.length || !crypto.timingSafeEqual(Buffer.from(sig),Buffer.from(expected))) return null; const payload=JSON.parse(Buffer.from(body,'base64url').toString('utf8')); if(!payload.exp || Date.now()>=payload.exp*1000) return null; return payload; }
function hash(value){return crypto.createHash('sha256').update(String(value)).digest('hex');}
async function service(path, options={}) { return supabase(path,{...options,service:true}); }
async function sendEmail({to,subject,text}){const response=await fetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:`Bearer ${env('RESEND_API_KEY')}`,'Content-Type':'application/json'},body:JSON.stringify({from:env('COMMERCE_FROM_EMAIL'),to,subject,text})});if(!response.ok){const e=new Error('Email delivery failed');e.statusCode=502;throw e;}return response.json();}
module.exports={catalog,enabled,requireEnabled,product,priceIdFor,privatePathFor,manifestHashFor,siteUrl,safeIdempotency,signDelivery,verifyDelivery,hash,stripe,service,env,sendEmail};
