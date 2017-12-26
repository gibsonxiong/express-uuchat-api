var sharp = require('sharp');
var multiparty = require('multiparty');
var Promise = require('bluebird');

exports.verificationCode = (len) => {
	var code = '';
	var nums = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

	for (var i = 0; i < len; i++) {
		var random = Math.ceil(Math.random() * 10) - 1;
		// code.push(nums[random]);
		code += random;
	}

	return code;
};

exports.parseFormData = (req) => {
	var form = new multiparty.Form({
		uploadDir: './public/upload/'
	});
	return new Promise((resolve, reject) => {
		form.parse(req, (err, fields, files) => {
			if (err) return reject(err);

			resolve({
				fields,
				files
			});

		});
	});
};

exports.resolvePath = function (path) {
	return '/' + path.replace(/\\/g, '/');
}

exports.manageImg = (src) => {
	// 需要处理打图片大小
	var sizes = [1000, 500, 200, 100, 50];

	// 原始输入图片（比如相同目录下的a.jpg）
	var originalImg = sharp(src);

	// 执行批量转换
	return Promise.map(sizes, size => {
		// 按照大小缩放图片并保存至文件
		return originalImg
			// .clone()
			.resize(size)
			.withoutEnlargement()
			.toFile(src + '@' + size + '.jpg');
	});
};



exports.uid = function (len, radix) {

	var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split(''),
		uuid = [],
		i;
	radix = radix || chars.length;

	if (len) {
		// Compact form
		for (i = 0; i < len; i++) uuid[i] = chars[0 | Math.random() * radix];
	} else {
		// rfc4122, version 4 form
		var r;

		// rfc4122 requires these characters
		uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-';
		uuid[14] = '4';

		// Fill in random data.  At i==19 set the high bits of clock sequence as
		// per rfc4122, sec. 4.1.5
		for (i = 0; i < 36; i++) {
			if (!uuid[i]) {
				r = 0 | Math.random() * 16;
				uuid[i] = chars[(i == 19) ? (r & 0x3) | 0x8 : r];
			}
		}
	}

	return uuid.join('');
};