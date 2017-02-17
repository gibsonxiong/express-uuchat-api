var App = require('alidayu-node');
var app = new App('23617509', 'acdbac8d1b1a009a39d1efab2dd3787b');
 
 
 exports.send = function(mobile,code){
 	console.log('发送短信')
 	app.smsSend({
	    sms_free_sign_name: '谈谈先',
	    sms_param: {"code": code+'', "appName": "谈谈先"},
	    rec_num: mobile,
	    sms_template_code: 'SMS_44390160'
	});
 }
