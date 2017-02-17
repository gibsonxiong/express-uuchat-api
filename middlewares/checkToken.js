var jwt = require('jsonwebtoken');
var appConfig = require('../config/app-config');

module.exports = function(){

	return function(req, res, next) {

		if(appConfig.debug){
			req.userId = appConfig.adminId;
			return next();
		}


	  	//检查post的信息或者url查询参数或者头信息
	  	var token = req.body.token || req.query.token || req.headers['x-access-token'];

	  	// 解析 token
	  	if (!token) {
			return res.api(null,-1,'token没有找到！');
		}

		
		jwt.verify(token, appConfig.secret, function(err, decoded) {
	   		if(err){
				res.api(null,-1,'token不正确！');
			}

			req.userId = decoded.userId;
			return next();

		});

	}
}
	
