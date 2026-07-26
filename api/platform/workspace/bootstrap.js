const {requireSession,supabase,slug,jsonError,method}=require('../../_lib/platform');
module.exports=async function handler(req,res){
  if(!method(req,res,['POST']))return;
  try{
    const s=await requireSession(req,res);if(!s)return;
    const name=(req.body?.organizationName||'RN Collins LLC').trim();
    const orgSlug=slug(req.body?.organizationSlug||name);
    const projectName=(req.body?.projectName||'Trust-Safe Twin Workspace').trim();
    const projectSlug=slug(req.body?.projectSlug||projectName);
    const data=await supabase('/rest/v1/rpc/bootstrap_workspace',{method:'POST',accessToken:s.accessToken,body:{organization_name:name,organization_slug:orgSlug,project_name:projectName,project_slug:projectSlug}});
    res.status(201).json({ok:true,workspace:data});
  }catch(e){jsonError(res,e)}
};
