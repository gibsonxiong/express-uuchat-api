var config = {
	appName:'uuChat',
	hostname:'192.168.1.104',
	port:process.env.PORT || '80',
	domain:'http://www.classscript.com',

	adminId:'5880760300f0f4222811e900',

	debug:false,

	//jsonwebtoken
	secret:'superSecret',

	//bcrypt
	saltRounds:10
};

config.host = 'http://'+config.hostname + ':' + config.port;

module.exports = config;