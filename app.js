var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
// var multiparty = require('multiparty');
// var mount = require('mount-routes');
var responseSender = require('./middlewares/responseSender');
var routers = {
	user: require('./routes/user'),
	msg: require('./routes/msg'),
	timeline: require('./routes/timeline'),
};
var app = express();
var Promise = require('bluebird');
var db = require('./db');
require('./db-init');


//sms
var sms = require('./sms');

// sms.send('13686004518','221');


//redisClient
// var redisClient = require('./redis-client');



//数据库连接
db.connect();


// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: false
}));
app.use(cookieParser());
app.use('/wap', express.static(path.join(__dirname, 'wap/www')));
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use(responseSender());

app.all('*', function (req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, X-Access-Token");
	res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
	res.header("X-Powered-By", ' 3.2.1')
	res.header("Content-Type", "application/json;charset=utf-8");
	next();
});


// 挂载路由
// mount(app);
app.use('/api/user', routers.user);
app.use('/api/msg', routers.msg);
app.use('/api/timeline', routers.timeline);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
	var err = new Error('Not Found');
	next(err);
});

// error handler
app.use(function (err, req, res, next) {
	// set locals, only providing error in development
	res.send({
		code: -1,
		msg: err.message,
	});
});



module.exports = app;