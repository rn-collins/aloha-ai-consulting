const {requireSession,supabase,jsonError,method}=require('../_lib/platform');
module.exports=async function handler(req,res){
 if(!method(req,res,['GET','POST']))return;
 try{const s=await requireSession(req,res);if(!s)return;
  if(req.method==='GET'){const q=req.query?.draftId?`&draft_id=eq.${encodeURIComponent(req.query.draftId)}`:'';const data=await supabase(`/rest/v1/guardrail_results?select=*&order=created_at.desc${q}`,{accessToken:s.accessToken});return res.json({ok:true,results:data});}
  const b=req.body||{};if(!b.organizationId||!b.projectId||!b.draftId||!b.guardrailKey||!b.outcome||!b.reason)return res.status(400).json({ok:false,error:'required_guardrail_fields_missing'});
  const data=await supabase('/rest/v1/guardrail_results',{method:'POST',accessToken:s.accessToken,body:{organization_id:b.organizationId,project_id:b.projectId,draft_id:b.draftId,guardrail_key:b.guardrailKey,outcome:b.outcome,reason:b.reason,details:b.details||{},policy_version:b.policyVersion||'v1'}});
  res.status(201).json({ok:true,result:data?.[0]||data});
 }catch(e){jsonError(res,e)}
};
