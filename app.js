var http = require('http');
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var responseSender = require('./middlewares/responseSender');
var cors = require('./middlewares/cors'); //处理跨域

var routers = {
	user: require('./routes/user'),
	msg: require('./routes/msg'),
	timeline: require('./routes/timeline'),
	joke: require('./routes/joke')
};

var app = express();
var Promise = require('bluebird');


//数据库连接
var db = require('./db');
db.connect();


// //redisClient
// var redisClient = require('./redis-client');


//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: false
}));
app.use(cookieParser());
// app.use('/wap', express.static(path.join(__dirname, 'wap/www')));
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use(responseSender());
app.use(cors());


// 挂载路由
Object.keys(routers).forEach(function (name) {
	app.use('/api/' + name, routers[name]);
});

// // catch 404 and forward to error handler
// app.use(function (req, res, next) {
// 	var err = new Error('Not Found');
// 	next(err);
// });

// // error handler
// app.use(function (err, req, res, next) {
// 	// set locals, only providing error in development
// 	res.send({
// 		code: -1,y
// 		msg: err.message,
// 	});
// });


module.exports = app;