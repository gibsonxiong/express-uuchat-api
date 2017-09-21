var config = {
	appName:'uuChat',
	smsSignName:'悠悠聊天',
	hostname:'http://192.168.1.38',
	port:process.env.PORT || '80',

	debug:false,

	//jsonwebtoken
	secret:'superSecret',

	//bcrypt
	saltRounds:10,
};

config.host = config.hostname + ':' + config.port;

module.exports = config;