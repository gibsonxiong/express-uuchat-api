var express = require('express');
var Promise = require('bluebird');
var router = express.Router();
var path = require('path');
var Msg = require('../models/msg');
var User = require('../models/user');
var Relation = require('../models/relation');
var msgService = require('../services/msg');
var checkToken = require('../middlewares/checkToken');
var appConfig = require('../config/app-config');
var utils = require('../utils');


// 发送文字信息
// success
router.post('/sendMsg', checkToken(), function (req, res, next) {
	var tokenId = req.userId; //发送者
	var relationId = req.body.relationId; //接收者
	var content = req.body.content; //内容

	//验证是否为好友
	Relation.findOneByIdAndUserId(relationId, tokenId)
		.exec()
		.then(function (relation) {

			//不是好友
			if (!relation) {
				return res.apiResolve(null, -1, '你们还不是朋友，请先添加好友！');
			}

			//新建信息
			return Msg.create({
				fromUserId: tokenId,
				relationId: relationId,
				content: content
			});

		})
		.then(function (msg) {
			return msg.populate('_fromUser', '-password').execPopulate()
		})
		.then(msg => {
			msgService.pushMsg(msg);

			res.api(msg, 0, 0);
		})
		.catch(res.catchHandler('发送信息失败！'));

});

// 发送语音消息
// success
router.post('/sendAudioMsg', checkToken(), function (req, res, next) {
	var tokenId = req.userId; //发送者
	var relationId = req.body.relationId; //接收者

	utils.parseFormData(req)
		.then(data => {
			var fields = data.fields;
			//验证是否为好友
			return Promise.all([data, Relation.findOneByIdAndUserId(fields.relationId[0], tokenId).exec()]);
		})
		.then(function (all) {
			var data = all[0];
			var relation = all[1];

			//不是好友
			if (!relation) {
				return res.apiResolve(null, -1, '你们还不是朋友，请先添加好友！');
			}

			//保存语音
			var files = data.files;
			var fields = data.fields;
			var src = '/' + files.file[0].path.replace(/\\/g, '/');

			//新建信息
			return Msg.create({
				fromUserId: tokenId,
				relationId: relation._id,
				content: src,
				type: 3,
				audioDuration:fields.audioDuration[0]
			});
		})
		.then(function (msg) {
			//join数据
			return msg.populate('_fromUser', '-password').execPopulate()
		})
		.then(msg => {
			msgService.pushMsg(msg);

			res.api(msg, 0, 0);
		})
		.catch(res.catchHandler('发送信息失败！'));

});

//发送图片消息
router.post('/sendImgMsg', checkToken(), function (req, res, next) {
	var tokenId = req.userId; //发送者
	var relationId = req.body.relationId; //接收者
	
	utils.parseFormData(req)
		.then(data => {
			var fields = data.fields;
			//验证是否为好友
			return Promise.all([data, Relation.findOneByIdAndUserId(fields.relationId[0], tokenId).exec()]);
		})
		.then(function (all) {
			var data = all[0];
			var relation = all[1];

			//不是好友
			if (!relation) {
				return res.apiResolve(null, -1, '你们还不是朋友，请先添加好友！');
			}

			//保存图片
			var files = data.files;
			var fields = data.fields;
			var src = '/' + files.imgFile[0].path.replace(/\\/g, '/');

			//新建信息
			return Promise.all([
				utils.manageImg('.'+src),
				Msg.create({
					fromUserId: tokenId,
					relationId: relation._id,
					content: src,
					type: 1,
				})
			]);
		})
		.then(function (all) {
			var msg = all[1];
			//join数据
			return msg.populate('_fromUser', '-password').execPopulate()
		})
		.then(msg => {
			msgService.pushMsg(msg);

			res.api(msg, 0, 0);
		})
		.catch(res.catchHandler('发送信息失败！'));

});


// // 获取聊天消息
// router.get('/getMsgList/:relationId', checkToken(), function(req, res, next) {
// 	var tokenId = req.userId;						//发送者
// 	var relationId = req.params.relationId;			


// 	Msg.find({ relationId: relationId })
// 		.populate('_fromUser','-password')
// 		.sort('sendTime')
// 		.exec()
// 		.then(function(msgs){
// 			res.api(msgs);
// 		})
// 		.catch(res.catchHandler('获取聊天消息失败！'));

// });

// // 获取聊天列表
// router.get('/getChatList', checkToken(), function(req, res, next) {
// 	var tokenId = req.userId;

// 	var errMsg = '获取聊天列表失败！';


// 	//todo match

// 	// //查找token所有relation
// 	// Relation.find()

// 	// function aggregatePromise(relationIds){
// 	// 	return Msg.aggregate()
// 	// 			   .match({ relationId:{'$in': relationIds } })
// 	// 			   .sort('sendTime')
// 	// 			  .group({ _id: '$relationId', lastContent: { $last: '$content' }, lastSendTime: { $last: '$sendTime' } })
// 	// 			  .sort('-lastSendTime')
// 	// 			  .exec();
// 	// }

// 	function aggregatePromise(){
// 		return Msg.aggregate()
// 				   .sort('sendTime')
// 				  .group({ _id: '$relationId', lastContent: { $last: '$content' }, lastSendTime: { $last: '$sendTime' } })
// 				  .sort('-lastSendTime')
// 				  .exec();
// 	}


// 	//添加avatarSrc、name字段
// 	function mapPromise(aggregateResult){

// 		return Promise.map(aggregateResult, function(val) {

// 		    return new Promise(function(resolve, reject){
// 		    	var relationId = val._id;

// 		    	Relation.findFriend(relationId,tokenId,function(err,friend){
// 		    		if(err) return reject(err);

// 		    		if(!friend) return resolve(null);

// 		    		resolve({
// 				    	relationId:relationId,
// 				    	avatarSrc:friend.avatarSrc,
// 				    	name:friend.nickname,
// 				    	lastContent:val.lastContent,
// 				    	lastSendTime:val.lastSendTime
// 			    	});
// 		    	});

// 		    });

// 		});
// 	}

// 	aggregatePromise()
// 		.then( aggregateResult => {
// 			return mapPromise(aggregateResult) 
// 		})
// 	  	.then( data => {
// 	  		return data.filter(val => val !=null);
// 	  	})
// 	   .then(data => {
// 		    res.api(data);
// 		})
// 	  .catch( err => {
// 			if(err._customErr){
// 				res.api(err.data, err.code, err.msg);
// 			}else{
// 				res.api(null,-1,errMsg);
// 			}

// 	  });


// });


module.exports = router;