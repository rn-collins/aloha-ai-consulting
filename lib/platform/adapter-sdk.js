const crypto=require('crypto');

const REQUIRED=['key','version','capabilities','validateDestination','buildPayload','deliver'];

function defineAdapter(definition){
 for(const field of REQUIRED){if(!definition?.[field])throw new Error(`adapter_missing_${field}`)}
 if(typeof definition.validateDestination!=='function'||typeof definition.buildPayload!=='function'||typeof definition.deliver!=='function')throw new Error('adapter_methods_required');
 return Object.freeze({...definition,capabilities:Object.freeze([...definition.capabilities])});
}

function payloadHash(payload){return crypto.createHash('sha256').update(JSON.stringify(payload)).digest('hex')}

function createDeliveryEnvelope({adapter,destination,draft,approval,idempotencyKey}){
 if(!adapter)throw new Error('adapter_required');
 if(!approval||approval.decision!=='approved')throw new Error('approved_decision_required');
 if(!draft?.content_hash||approval.draft_content_hash!==draft.content_hash)throw new Error('approval_hash_mismatch');
 if(!idempotencyKey)throw new Error('idempotency_key_required');
 adapter.validateDestination(destination);
 const payload=adapter.buildPayload({destination,draft,approval});
 return Object.freeze({adapterKey:adapter.key,adapterVersion:adapter.version,destination,payload,payloadHash:payloadHash(payload),idempotencyKey,createdAt:new Date().toISOString()});
}

async function executeDelivery({adapter,envelope,connection,enabled=false}){
 if(!enabled)return {ok:false,status:'disabled',reason:'external_delivery_disabled'};
 if(!connection||connection.status!=='active')return {ok:false,status:'disabled',reason:'active_connection_required'};
 return adapter.deliver({envelope,connection});
}

module.exports={defineAdapter,createDeliveryEnvelope,executeDelivery,payloadHash};