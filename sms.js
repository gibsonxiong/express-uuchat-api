var App = require('alidayu-node');
var app = new App('23617509', 'acdbac8d1b1a009a39d1efab2dd3787b');
var config = require('./config/app-config');
 
 
 exports.send = function(mobile,code){
 	app.smsSend({
	    sms_free_sign_name: config.smsSignName,			//
	    sms_param: {"code": code+'', "appName": config.appName},
	    rec_num: mobile,
	    sms_template_code: 'SMS_44390160'
	});
 }
