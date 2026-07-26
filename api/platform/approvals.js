const {requireSession,supabase,jsonError,method}=require('../_lib/platform');
module.exports=async function handler(req,res){
 if(!method(req,res,['GET','POST']))return;
 try{const s=await requireSession(req,res);if(!s)return;
  if(req.method==='GET'){const q=req.query?.draftId?`&draft_id=eq.${encodeURIComponent(req.query.draftId)}`:'';const data=await supabase(`/rest/v1/approvals?select=*&order=created_at.desc${q}`,{accessToken:s.accessToken});return res.json({ok:true,approvals:data});}
  const b=req.body||{};if(!b.organizationId||!b.projectId||!b.draftId||!b.draftContentHash||!b.decision)return res.status(400).json({ok:false,error:'required_approval_fields_missing'});
  const data=await supabase('/rest/v1/approvals',{method:'POST',accessToken:s.accessToken,body:{organization_id:b.organizationId,project_id:b.projectId,draft_id:b.draftId,draft_content_hash:b.draftContentHash,decision:b.decision,reviewer_id:s.user.id,note:b.note||null}});
  await supabase('/rest/v1/audit_events',{method:'POST',accessToken:s.accessToken,body:{organization_id:b.organizationId,project_id:b.projectId,actor_id:s.user.id,event_type:`draft.${b.decision}`,entity_type:'draft',entity_id:b.draftId,idempotency_key:b.idempotencyKey||null,payload:{draft_content_hash:b.draftContentHash,note:b.note||null}}});
  res.status(201).json({ok:true,approval:data?.[0]||data});
 }catch(e){jsonError(res,e)}
};
