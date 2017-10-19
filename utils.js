exports.verificationCode = function (len){
	var code = '';
	var nums = [0,1,2,3,4,5,6,7,8,9];

	for(var i=0;i<len;i++){
		var random = Math.ceil(Math.random() * 10) - 1;
		// code.push(nums[random]);
		code+=random;
	}

	return code;
};