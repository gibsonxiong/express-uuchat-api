var jwt = require('jsonwebtoken');

module.exports = function() {

	return function(req, res, next) {

		res.api = function(data, code, msg) {
			var res = this;

			data = typeof data === 'undefined' ? null : data;
			code = typeof code === 'undefined' ? 0 : code;
			msg = typeof msg === 'undefined' ? '' : msg;

			res.send({
				code: code,
				msg: msg,
				data: data
			});
		}

		res.errorHandler = function(errMsg) {
			var res = this;

			//err参数 可能是系统错误，也可能是自定义错误
			//系统错误则统一输出errMsg
			return function(err) {
				if (err.$custom) {
					res.api(err.data, err.code, err.msg);
				} else {
					res.api(null, -1, errMsg);
				}
			}

			data = typeof data === 'undefined' ? null : data;
			code = typeof code === 'undefined' ? 0 : code;
			msg = typeof msg === 'undefined' ? '' : msg;

			res.send({
				code: code,
				msg: msg,
				data: data
			});
		}

		res.customError = function(data,code,msg){
			return {
				$custom:1,
				data:data,
				code:code,
				msg:msg
			};
		}

		next();


	}
}