const {catalog,enabled}=require('../_lib/commerce');
module.exports=async function(req,res){res.setHeader('Cache-Control','no-store');if(req.method!=='GET'){res.setHeader('Allow','GET');return res.status(405).json({ok:false,error:'method_not_allowed'});}const value=catalog();return res.status(200).json({ok:true,enabled:enabled(),...value});};
