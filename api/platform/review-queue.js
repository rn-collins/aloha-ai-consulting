const {requireSession,supabase,jsonError,method}=require('../_lib/platform');
module.exports=async function handler(req,res){
 if(!method(req,res,['GET','POST','PATCH']))return;
 try{const s=await requireSession(req,res);if(!s)return;
  if(req.method==='GET'){
   const state=req.query?.state||'open';
   const data=await supabase(`/rest/v1/review_queue?select=*&state=eq.${encodeURIComponent(state)}&order=priority.desc,created_at.asc`,{accessToken:s.accessToken});
   return res.json({ok:true,items:data});
  }
  if(req.method==='POST'){
   const {organizationId,projectId,runId,draftId,assignedTo,priority=50,dueAt}=req.body||{};
   if(!organizationId||!projectId||(!runId&&!draftId))return res.status(400).json({ok:false,error:'organizationId_projectId_and_runId_or_draftId_required'});
   const body={organization_id:organizationId,project_id:projectId,run_id:runId||null,draft_id:draftId||null,assigned_to:assignedTo||null,priority,due_at:dueAt||null};
   const data=await supabase('/rest/v1/review_queue',{method:'POST',accessToken:s.accessToken,body});
   return res.status(201).json({ok:true,item:data?.[0]||data});
  }
  const {id,state,assignedTo}=req.body||{};
  if(!id||!state)return res.status(400).json({ok:false,error:'id_and_state_required'});
  const body={state,assigned_to:assignedTo||null,...(state==='resolved'?{resolved_at:new Date().toISOString()}:{})};
  const data=await supabase(`/rest/v1/review_queue?id=eq.${encodeURIComponent(id)}`,{method:'PATCH',accessToken:s.accessToken,body});
  res.json({ok:true,item:data?.[0]||data});
 }catch(e){jsonError(res,e)}
};