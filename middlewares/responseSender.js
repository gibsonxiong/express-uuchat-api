var jwt = require('jsonwebtoken');

module.exports = function () {

	return function (req, res, next) {

		res.api = function (data, code, msg) {
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

		res.apiResolve = function (data, code, msg) {
			return Promise.reject({
				$custom: 1,
				data: data,
				code: code,
				msg: msg
			})
		}

		res.catchHandler = function (exceptionMsg) {
			var res = this;

			//err参数 可能是系统错误，也可能是自定义错误
			//系统错误则统一输出errMsg
			return function (err) {
				console.log(err);
				if (err.$custom) {
					res.api(err.data, err.code, err.msg);
				} else {
					res.api(null, -99, exceptionMsg);
				}
			}

		}



		next();


	}
}