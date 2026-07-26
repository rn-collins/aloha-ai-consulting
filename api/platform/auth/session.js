const {requireSession,jsonError,method} = require('../../_lib/platform');
module.exports=async function handler(req,res){if(!method(req,res,['GET']))return;try{const s=await requireSession(req,res);if(!s)return;res.status(200).json({ok:true,user:{id:s.user.id,email:s.user.email}})}catch(e){jsonError(res,e)}};
