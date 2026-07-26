const {requireSession,supabase,slug,jsonError,method}=require('../_lib/platform');
module.exports=async function handler(req,res){
 if(!method(req,res,['GET','POST']))return;
 try{const s=await requireSession(req,res);if(!s)return;
  if(req.method==='GET'){const data=await supabase('/rest/v1/projects?select=*&order=created_at.desc',{accessToken:s.accessToken});return res.json({ok:true,projects:data});}
  const {organizationId,name}=req.body||{};if(!organizationId||!name)return res.status(400).json({ok:false,error:'organizationId_and_name_required'});
  const data=await supabase('/rest/v1/projects',{method:'POST',accessToken:s.accessToken,body:{organization_id:organizationId,name,slug:slug(req.body.slug||name),created_by:s.user.id}});
  res.status(201).json({ok:true,project:data?.[0]||data});
 }catch(e){jsonError(res,e)}
};
