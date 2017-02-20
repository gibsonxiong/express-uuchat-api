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
	test: require('./routes/test'),
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
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use(responseSender());

//文件上传
// app.post('/upload', function (req, res) {

// 	var form = new multiparty.Form({
// 		uploadDir: './upload/'
// 	});


// 	form.parse(req, function (err, fields, files) {
// 		if (err) return res.api(null, -1, '文件上传失败！');
// 		var src = files.file[0].path;
// 		fs.rename(files.path, files.originalFilename);
// 		res.api(null, 0, '文件上传成功！');
// 	});

// });



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
app.use('/user', routers.user);
app.use('/msg', routers.msg);
app.use('/test', routers.test);

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