const crypto=require('crypto');
const {requireSession,supabase,jsonError,method}=require('../_lib/platform');
const hash=value=>crypto.createHash('sha256').update(JSON.stringify(value??{})).digest('hex');
module.exports=async function handler(req,res){
 if(!method(req,res,['GET','POST']))return;
 try{const s=await requireSession(req,res);if(!s)return;
  if(req.method==='GET'){
   const data=await supabase('/rest/v1/delivery_attempts?select=*&order=created_at.desc',{accessToken:s.accessToken});
   return res.json({ok:true,attempts:data});
  }
  const {organizationId,projectId,runId,draftId,approvalId,connectionId,adapterKey,destination,idempotencyKey}=req.body||{};
  if(!organizationId||!projectId||!draftId||!approvalId||!adapterKey||!destination||!idempotencyKey)return res.status(400).json({ok:false,error:'required_delivery_fields_missing'});
  const approvals=await supabase(`/rest/v1/approvals?id=eq.${encodeURIComponent(approvalId)}&select=*`,{accessToken:s.accessToken});
  const drafts=await supabase(`/rest/v1/drafts?id=eq.${encodeURIComponent(draftId)}&select=*`,{accessToken:s.accessToken});
  const approval=approvals?.[0],draft=drafts?.[0];
  if(!approval||approval.decision!=='approved')return res.status(409).json({ok:false,error:'approved_decision_required'});
  if(!draft||approval.draft_content_hash!==draft.content_hash)return res.status(409).json({ok:false,error:'approval_hash_mismatch'});
  const body={organization_id:organizationId,project_id:projectId,run_id:runId||null,draft_id:draftId,approval_id:approvalId,connection_id:connectionId||null,adapter_key:adapterKey,destination,payload_hash:hash({destination,content:draft.content}),idempotency_key:idempotencyKey,status:'disabled',attempted_by:s.user.id};
  const data=await supabase('/rest/v1/delivery_attempts',{method:'POST',accessToken:s.accessToken,body});
  res.status(201).json({ok:true,attempt:data?.[0]||data,delivery:{executed:false,reason:'external_delivery_disabled'}});
 }catch(e){jsonError(res,e)}
};