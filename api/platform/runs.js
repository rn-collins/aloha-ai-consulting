const crypto=require('crypto');
const {requireSession,supabase,jsonError,method}=require('../_lib/platform');
const hash=value=>crypto.createHash('sha256').update(JSON.stringify(value??{})).digest('hex');
module.exports=async function handler(req,res){
 if(!method(req,res,['GET','POST']))return;
 try{const s=await requireSession(req,res);if(!s)return;
  if(req.method==='GET'){
   const projectId=req.query?.projectId;
   const filter=projectId?`&project_id=eq.${encodeURIComponent(projectId)}`:'';
   const data=await supabase(`/rest/v1/twin_runs?select=*&order=created_at.desc${filter}`,{accessToken:s.accessToken});
   return res.json({ok:true,runs:data});
  }
  const {organizationId,projectId,twinId,workflowId,input={},policyVersion='v1',definitionHash}=req.body||{};
  if(!organizationId||!projectId||!twinId)return res.status(400).json({ok:false,error:'organizationId_projectId_twinId_required'});
  const requestId=req.headers['x-request-id']||crypto.randomUUID();
  const body={organization_id:organizationId,project_id:projectId,twin_id:twinId,workflow_id:workflowId||null,status:'queued',input,input_hash:hash(input),policy_version:policyVersion,definition_hash:definitionHash||null,request_id:requestId,created_by:s.user.id};
  const data=await supabase('/rest/v1/twin_runs',{method:'POST',accessToken:s.accessToken,body});
  res.status(201).json({ok:true,run:data?.[0]||data,requestId});
 }catch(e){jsonError(res,e)}
};