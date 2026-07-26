const {requireSession,supabase,hash,jsonError,method}=require('../_lib/platform');
module.exports=async function handler(req,res){
 if(!method(req,res,['GET','POST']))return;
 try{const s=await requireSession(req,res);if(!s)return;
  if(req.method==='GET'){const q=req.query?.projectId?`&project_id=eq.${encodeURIComponent(req.query.projectId)}`:'';const data=await supabase(`/rest/v1/sources?select=*&order=created_at.desc${q}`,{accessToken:s.accessToken});return res.json({ok:true,sources:data});}
  const b=req.body||{};if(!b.organizationId||!b.projectId||!b.title)return res.status(400).json({ok:false,error:'organizationId_projectId_and_title_required'});
  const basis=b.content||b.uri||`${b.title}:${Date.now()}`;
  const data=await supabase('/rest/v1/sources',{method:'POST',accessToken:s.accessToken,body:{organization_id:b.organizationId,project_id:b.projectId,source_type:b.sourceType||'user_input',title:b.title,uri:b.uri||null,content_hash:hash(basis),version:b.version||1,metadata:b.metadata||{},created_by:s.user.id}});
  res.status(201).json({ok:true,source:data?.[0]||data});
 }catch(e){jsonError(res,e)}
};
