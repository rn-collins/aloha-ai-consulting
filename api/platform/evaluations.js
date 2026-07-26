const {requireSession,supabase,jsonError,method}=require('../_lib/platform');
module.exports=async function handler(req,res){
 if(!method(req,res,['GET','POST']))return;
 try{const s=await requireSession(req,res);if(!s)return;
  if(req.method==='GET'){
   const runId=req.query?.runId;
   const filter=runId?`&run_id=eq.${encodeURIComponent(runId)}`:'';
   const data=await supabase(`/rest/v1/evaluations?select=*&order=created_at.desc${filter}`,{accessToken:s.accessToken});
   return res.json({ok:true,evaluations:data});
  }
  const {organizationId,projectId,runId,draftId,evaluatorKey,evaluatorVersion='v1',score,passed,rationale,details={}}=req.body||{};
  if(!organizationId||!projectId||!evaluatorKey)return res.status(400).json({ok:false,error:'organizationId_projectId_evaluatorKey_required'});
  const body={organization_id:organizationId,project_id:projectId,run_id:runId||null,draft_id:draftId||null,evaluator_key:evaluatorKey,evaluator_version:evaluatorVersion,score:score??null,passed:passed??null,rationale:rationale||null,details};
  const data=await supabase('/rest/v1/evaluations',{method:'POST',accessToken:s.accessToken,body});
  res.status(201).json({ok:true,evaluation:data?.[0]||data});
 }catch(e){jsonError(res,e)}
};