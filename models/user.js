var mongoose = require('mongoose');
var Schema = mongoose.Schema;
// var Promise = require('bluebird');
var bcrypt = require('bcryptjs');
var appConfig = require('../config/app-config');

var $Schema = new Schema({
	username: String,
	password: String,
	nickname:String,
	avatarSrc: String,			//头像
	mobile:String,
	gender:{type:Number, enum:[0,1] ,default:0 },	//性别 0-男 1-女
	motto:String,				//个性签名
});
/*@@@test*/
$Schema.statics.findAdmin = function(callback){
	return this.findById(appConfig.adminId,callback);
}

$Schema.statics.findBySearch = function(search,callback){
	this.find()
		.or([
			{ username: search },
			{ mobile : search}
		])
		.exec(callback);
}

$Schema.methods.comparePassword = function(password,callback){
	bcrypt.compare(password,this.password,callback);
}

$Schema.pre('save',function(next){
	var that = this;

	bcrypt.hash(this.password, appConfig.saltRounds, function(err, hash) {
		if(err) return next(err);

		that.password = hash;
		next();
	});
});


var $Model = mongoose.model('user', $Schema);

module.exports = $Model;
