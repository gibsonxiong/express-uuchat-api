var mongoose = require('mongoose');
var Schema = mongoose.Schema;
// var Promise = require('bluebird');
var bcrypt = require('bcryptjs');
var appConfig = require('../config/app-config');
var utils = require('../utils');

var $Schema = new Schema({
	username: {
		type: String,
		unique: true
	},
	password: String,
	nickname: {
		type: String,
		default: 'uuchat_' + (+new Date())
	},
	avatarSrc: String, //头像
	mobile: String,
	gender: {
		type: Number,
		enum: [0, 1],
		default: 0
	}, //性别 0-男 1-女
	motto: String, //个性签名
});

/*@@@test*/
$Schema.statics.findAdmin = function (callback) {
	return this.findById(appConfig.adminId, callback);
}

//通过用户名查找
$Schema.statics.findByUsername = function (username) {
	return this.find()
		.where({
			username: username
		});
}

//通过手机查找
$Schema.statics.findByMobile = function (mobile) {
	return this.find()
		.where({
			mobile: mobile
		});
}

//通过用户名、手机查找
$Schema.statics.findByUsernameOrMobile = function (value) {
	return this.find()
		.or([{
				username: value
			},
			{
				mobile: value
			}
		]);
}

$Schema.methods.comparePassword = function (password, callback) {
	bcrypt.compare(password, this.password, callback);
}

$Schema.pre('save', function (next) {
	var that = this;

	bcrypt.hash(this.password, appConfig.saltRounds, function (err, hash) {
		if (err) return next(err);

		that.password = hash;
		next();
	});
});


var $Model = mongoose.model('user', $Schema);

module.exports = $Model;