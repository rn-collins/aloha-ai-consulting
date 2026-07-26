const {clearCookie,method} = require('../../_lib/platform');
module.exports=async function handler(req,res){if(!method(req,res,['POST']))return;res.setHeader('Set-Cookie',[clearCookie('aloha_access'),clearCookie('aloha_refresh')]);res.status(200).json({ok:true})};
