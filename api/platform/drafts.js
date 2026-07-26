const {requireSession,supabase,hash,jsonError,method}=require('../_lib/platform');
module.exports=async function handler(req,res){
 if(!method(req,res,['GET','POST']))return;
 try{const s=await requireSession(req,res);if(!s)return;
  if(req.method==='GET'){const q=req.query?.projectId?`&project_id=eq.${encodeURIComponent(req.query.projectId)}`:'';const data=await supabase(`/rest/v1/drafts?select=*&order=created_at.desc${q}`,{accessToken:s.accessToken});return res.json({ok:true,drafts:data});}
  const b=req.body||{};if(!b.organizationId||!b.projectId||!b.content)return res.status(400).json({ok:false,error:'organizationId_projectId_and_content_required'});
  const row={organization_id:b.organizationId,project_id:b.projectId,workflow_id:b.workflowId||null,twin_id:b.twinId||null,content:b.content,content_hash:hash(b.content),status:'awaiting_review',model_provider:b.modelProvider||null,model_name:b.modelName||null,model_request_id:b.modelRequestId||null,prompt_version:b.promptVersion||null,created_by:s.user.id};
  const data=await supabase('/rest/v1/drafts',{method:'POST',accessToken:s.accessToken,body:row});
  res.status(201).json({ok:true,draft:data?.[0]||data});
 }catch(e){jsonError(res,e)}
};
