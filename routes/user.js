var express = require('express');
var router = express.Router();
var fs = require('fs');
var path = require('path');
var multiparty = require('multiparty');
var jwt = require('jsonwebtoken');
var User = require('../models/user');
var Relation = require('../models/relation');
var appConfig = require('../config/app-config');
var checkToken = require('../middlewares/checkToken');
var userService = require('../services/user');
var utils = require('../utils');
var sms = require('../sms');
var verificationCodesCache = {}; //验证码cache   
var verificationCodeTimesCache = {}; //验证码请求次数
var Promise = require('bluebird');

//登录
// params:
//		username
//		password123
router.post('/signin', function (req, res, next) {

	if (appConfig.debug) {
		User.findAdmin().then(function (user) {

			var token = jwt.sign(user, appConfig.secret);

			res.api({
				token: token
			});
		});

		return;
	}

	var username = req.body.username;
	var password = req.body.password + '';

	if (!username || !password) {
		return res.api(null, -1, '账号或密码错误！');
	}


	User.findOne()
		.where({
			$or:[
				{username: username},
				{mobile: username},
			]
		})
		.exec()
		.then((user) => {
			//没有找到用户
			if (!user) {
				return res.api(null, -1, '账号或密码错误！');
			}

			// 检查密码
			user.comparePassword(password, function (err, isMatch) {
				if (err) {
					return res.api(null, -1, '账号或密码错误！');
				}

				if (isMatch) {
					// 创建token
					var token = jwt.sign({
						'userId': user._id
					}, appConfig.secret);

					// json格式返回token
					return res.api({
						token: token,
						ownId: user._id
					});

				} else {
					return res.api(null, -1, '账号或密码错误！');
				}


			});

		});
});

router.post('/safe', function (req, res, next) {
	var token = req.body.token;
	var userId = req.body.userId;

	jwt.verify(token, appConfig.secret, function (err, decoded) {
		if (err) {
			res.api(null, -1, 'token解析错误');
		}

		if (userId != decoded.userId) {
			res.api(null, -1, 'token跟userId不匹配');
		}

		User.findById(userId)
			.exec()
			.then(user => {
				if (!user) return res.apiResolve(null, -1, '该用户不存在')
				res.api(null);
			})
			.catch(res.catchHandler('token不正确'))



	});

});



// 登出
// params:
//		username
//		password
router.post('/signout', function (req, res, next) {


});


//获取手机验证码
router.get('/getVerificationCode/:mobile', function (req, res, next) {
	var mobile = req.params.mobile;
	var code = utils.verificationCode(6);
	var effectiveTime = 60000 * 3;
	var maxTimes = 50; //最多请求次数(每天)
	var times = verificationCodeTimesCache[mobile] = verificationCodeTimesCache[mobile] || 0; //请求次数
	var verificationCodes = verificationCodesCache[mobile] = verificationCodesCache[mobile] || [];

	if (times > maxTimes) return res.api(null, -1, '今天获取短信验证码次数已到最多次数（' + maxTimes + '），请明天再试！');

	verificationCodes.push(code);
	//有效时间effectiveTime过了，就删除
	setTimeout(() => {
		verificationCodes.shift();
	}, effectiveTime);

	sms.send(mobile, code);

	res.api();
});

//验证手机
router.post('/checkVerificationCode', function (req, res, next) {
	var mobile = req.body.mobile;
	var code = req.body.code;
	var verificationCodes = verificationCodesCache[mobile] = verificationCodesCache[mobile] || [];

	//确认成功
	if (verificationCodes.indexOf(code) === -1) return res.api(null, -1, '验证码不正确！');

	var mobileToken = jwt.sign(mobile, appConfig.secret);

	res.api({
		mobileToken: mobileToken
	});

});

//注册
router.post('/signup', function (req, res, next) {
	var form = new multiparty.Form({
		uploadDir: './public/upload/'
	});
	var verify = Promise.promisify(jwt.verify);
	var formParse = (req) => {
		return new Promise((resolve, reject) => {
			form.parse(req, (err, fields, files) => {
				if (err) return reject(err);

				resolve({
					fields,
					files
				});

			});
		});
	}

	//上传图片
	formParse(req)
		.then((param) => {
			var fields = param.fields;
			var files = param.files;
			var src = files.avatar ? appConfig.domain + '/' + files.avatar[0].path.replace(/\\/g, '/') : '';
			var mobileToken = fields.mobileToken[0];

			param.src = src;

			//转化mobileToken
			return Promise.all([param, verify(mobileToken, appConfig.secret)]);
		})
		.then(all => {
			var param = all[0];
			var mobile = all[1];
			var fields = param.fields;
			var src = param.src;

			//修改数据库
			return User.create({
				mobile: mobile,
				username: fields.username[0],
				password: fields.password[0],
				avatarSrc: src,
				nickname: fields.nickname[0],
				gender: new Number(fields.gender[0]),
			})
		})
		.then(user => {
			res.api(user, 0, '注册成功！');
		})
		.catch(res.catchHandler('注册用户失败！'));

});

//通过账号或手机号查找用户
router.get('/searchUser/:search', checkToken(), function (req, res, next) {
	var search = req.params.search;

	User.findBySearch(search)
		.exec()
		.then(users => {
			res.api(users);
		})
		.catch(res.catchHandler('查找用户失败！'));
});

//申请添加好友
router.get('/makeFriend/:userId', checkToken(), function (req, res, next) {
	var tokenId = req.userId;
	var toUserId = req.params.userId;
	var requestMsg = req.query.requestMsg;

	if (tokenId === toUserId) {
		return res.api(null, -1, '不能添加自己');
	}


	//查找是否已经申请
	var findPromise1 = Relation
		.findOne({
			fromUserId: tokenId,
			toUserId: toUserId
		})
		.exec();

	//查找是否已经被申请
	var findPromise2 = Relation
		.findOne({
			fromUserId: toUserId,
			toUserId: tokenId
		})
		.exec();


	//查找是否已经申请
	findPromise1.then(function (relation) {

		//如果已经存在，直接返回
		if (relation) return res.api(null, -1, '您已经申请过了');

		//查找是否已经被申请
		findPromise2.then(function (relation) {
			if (relation) return res.api(null, -1, '该用户申请过你了');

			//创建申请
			Relation.create({
				fromUserId: tokenId,
				toUserId: toUserId,
				requestMsg: requestMsg
			}, function (err, relation) {
				if (err) return res.api(null, -1, '申请添加好友失败');

				res.api(null);
			});

		});

	});
});

//添加好友
router.get('/confirmFriend/:userId', checkToken(), function (req, res, next) {
	var tokenId = req.userId;
	var toUserId = req.params.userId;

	Relation.findOneAndUpdate({
			fromUserId: toUserId,
			toUserId: tokenId,
		}, {
			confirm: true,
		})
		.exec()
		.then(relation => {
			res.api(null);
		})
		.catch(res.catchHandler('添加好友失败！'));
});

//获取新好友列表
router.get('/getFriendNewList', checkToken(), function (req, res, next) {
	var tokenId = req.userId;

	Relation.find()
		.where({
			toUserId: tokenId,
		})
		.select('-toUserId -_toUser')
		.populate('_fromUser', '-password')
		.exec()
		.then(relations => {
			res.api(relations);
		})
		.catch(res.catchHandler('获取新好友列表失败！'));
});

//获取好友列表
router.get('/getFriendList', checkToken(), function (req, res, next) {
	var tokenId = req.userId;

	Relation.find({
			confirm: true
		})
		.or([{
				fromUserId: tokenId
			},
			{
				toUserId: tokenId
			},
		])
		.populate('_fromUser _toUser', '-password')
		.exec()
		.then(relations => {
			var friendList = [];

			relations.forEach(function (relation) {
				if (relation.fromUserId.equals(tokenId)) {
					friendList.push(relation._toUser);
				} else if (relation.toUserId.equals(tokenId)) {
					friendList.push(relation._fromUser);
				}
			});


			res.api(friendList);
		})
		.catch(res.catchHandler('获取好友列表失败！'));
});

//通过手机通讯录查找好友
router.post('/getUserListByMobiles', checkToken(), function (req, res, next) {
	var tokenId = req.userId;
	var mobiles = req.body.mobiles;

	User.find()
		.where({
			mobile: {
				$in: mobiles
			}
		})
		.select('-password')
		.exec()
		.then(users => {
			if (!users.length) return res.apiResolve([]);

			return users;
		})
		.map(user => {
			//查关系
			var p = Relation.findOneByUserIds(tokenId, user._id).exec();

			return Promise.all([user, p]);
		})
		.then(all => {
			var users = all.map((pair, i) => {
				var user = pair[0].toJSON();
				var relation = pair[1];

				user._isFriend = relation ? true : false;
				return user;
			});

			res.api(users);
		})
		.catch(res.catchHandler('获取手机通讯录好友失败！'));
});



//获取关系列表
router.get('/getRelationList', checkToken(), function (req, res, next) {
	var tokenId = req.userId;

	Relation.find()
		.or([{
				fromUserId: tokenId
			},
			{
				toUserId: tokenId
			},
		])
		.populate('_fromUser _toUser', '-password')
		.exec()
		.then(relations => {
			var newRelations = relations.map(function (relation) {
				relation = relation.toJSON();
				if (relation.fromUserId.equals(tokenId)) {
					relation._friend = relation._toUser;
				} else if (relation.toUserId.equals(tokenId)) {
					relation._friend = relation._fromUser;
				}

				delete relation._fromUser;
				delete relation._toUser;

				return relation;
			});

			res.api(newRelations);
		})
		.catch(res.catchHandler('获取关系列表失败！'));
});


//获取用户资料(自己)
router.get('/getOwn', checkToken(), function (req, res, next) {
	var tokenId = req.userId;

	User.findById(tokenId)
		.select('-password')
		.exec()
		.then(user => {
			res.api(user);
		})
		.catch(res.catchHandler('获取用户资料失败！'));
});

//修改昵称
router.post('/modAvatar', checkToken(), function (req, res, next) {
	var tokenId = req.userId;
	var form = new multiparty.Form({
		uploadDir: './public/upload/'
	});

	var formParse = (req) => {
		return new Promise((resolve, reject) => {
			form.parse(req, (err, fields, files) => {
				if (err) return reject(err);

				resolve({
					fields,
					files
				});

			});
		});
	}

	formParse(req)
		.then((data) => {
			var files = data.files;
			var src = appConfig.domain + '/' + files.file[0].path.replace(/\\/g, '/');

			//修改数据库
			return User.findByIdAndUpdate(tokenId, {
					avatarSrc: src
				}, {
					new: true
				})
				.select('-password')
				.exec()
		})
		.then(user => {
			if (!user) return res.apiResolve(null, -98, '数据出错！');

			//推送修改过的user
			userService.pushUserModed(user);
			return res.api(user);
			// return res.api(user,-1,'出错啦');
		})
		.catch(res.catchHandler('修改头像失败！'));

});

//修改昵称
router.get('/modNickname/:nickname', checkToken(), function (req, res, next) {
	var tokenId = req.userId;
	var nickname = req.params.nickname;

	User.findByIdAndUpdate(tokenId, {
			nickname: nickname
		}, {
			new: true
		})
		.select('-password')
		.exec()
		.then(user => {
			//推送修改过的user
			userService.pushUserModed(user);
			res.api(user);
		})
		.catch(res.catchHandler('修改昵称失败！'));
});

//修改性别
router.get('/modGender/:gender', checkToken(), function (req, res, next) {
	var tokenId = req.userId;
	var gender = new Number(req.params.gender);

	User.findByIdAndUpdate(tokenId, {
			gender: gender
		}, {
			new: true
		})
		.select('-password')
		.exec()
		.then(user => {
			res.api(user);
		})
		.catch(res.catchHandler('修改性别失败！'));
});

//修改个性签名
router.get('/modMotto/:motto?', checkToken(), function (req, res, next) {
	var tokenId = req.userId;
	var motto = req.params.motto;

	User.findByIdAndUpdate(tokenId, {
			motto: motto
		}, {
			new: true
		})
		.select('-password')
		.exec()
		.then(user => {
			res.api(user);
		}).catch(res.catchHandler('修改个性签名失败！'))
});



//获取用户资料
// data 
// {
// 	user:User,
// 	isFriend:boolean,
//  relationId:ObjectId
// }
router.get('/getUser/:userId', checkToken(), function (req, res, next) {
	var tokenId = req.userId;
	var toUserId = req.params.userId;

	User.findById(toUserId)
		.select('-password')
		.exec()
		.then(user => {
			if (!user) return res.apiResolve(null, -1, '没有找到用户！');

			if (user._id.equals(tokenId)) {
				return res.apiResolve({
					user: user,
					isFriend: null,
					relationId: null,
				}, 0, null);
			}

			var p = Relation.findOneByUserIds(tokenId, toUserId).exec();

			return Promise.all([user, p]);

		})
		.then(function (all) {
			var user = all[0];
			var relation = all[1];

			return res.api({
				user: user,
				isFriend: !!relation,
				relationId: relation && relation._id
			});
		})
		.catch(res.catchHandler('获取用户资料失败！'));



});

//通过用户名查找用户是否存在
router.get('/existsByUsername/:username', function (req, res, next) {
	var username = req.params.username;

	User.findByUsername(username)
		.exec()
		.then(users => {
			var isExists = !!users.length;
			return res.api(isExists);
		})
		.catch(res.catchHandler('查找用户失败！'));



});






module.exports = router;