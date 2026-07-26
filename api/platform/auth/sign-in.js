const {supabase,cookie,jsonError,method} = require('../../_lib/platform');
module.exports = async function handler(req,res){
  if(!method(req,res,['POST'])) return;
  try{
    const {email,password}=req.body||{};
    if(!email||!password) return res.status(400).json({ok:false,error:'email_and_password_required'});
    const auth=await supabase('/auth/v1/token?grant_type=password',{method:'POST',body:{email,password}});
    res.setHeader('Set-Cookie',[
      cookie('aloha_access',auth.access_token,auth.expires_in||3600),
      cookie('aloha_refresh',auth.refresh_token,60*60*24*30)
    ]);
    res.status(200).json({ok:true,user:{id:auth.user.id,email:auth.user.email}});
  }catch(error){jsonError(res,error)}
};
