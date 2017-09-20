var express = require('express');
var Promise = require('bluebird');
var router = express.Router();
var multiparty = require('multiparty');
// var path = require('path');
var Timeline = require('../models/timeline');
var TimelineComment = require('../models/timeline-comment');
var User = require('../models/user');
var Relation = require('../models/relation');
// var msgService = require('../services/msg');
var checkToken = require('../middlewares/checkToken');
var appConfig = require('../config/app-config');


//查看朋友圈
router.get('/getTimelines', checkToken(), function (req, res, next) {
	var tokenId = req.userId;

	Relation.findFriendIds(tokenId)
		.then(friendIds => {
			friendIds.push(tokenId);
			return Timeline.find()
				.where({
					userId: {
						$in: friendIds
					}
				})
				.sort('-publishTime')
				.populate('_user', '-password')
				.populate('_likeUsers', '-password')
				.exec()
		})
		.map(timeline => {
			var timelineObject = timeline.toJSON();

			timelineObject._isLike = timelineObject.likeUserIds.some(id => {
				return id === tokenId;
			});

			//加入comments到timeline
			return new Promise((resolve, reject) => {
				TimelineComment.find()
					.where({
						timelineId: timeline._id
					})
					.populate('_user _atUser', '-password')
					.exec()
					.then(comments => {
						timelineObject._comments = comments;

						resolve(timelineObject);
					})
					.catch(err => reject(err));
			});

		})
		.then((timelines) => {
			timelines = timelines || [];
			res.api(timelines);
		})
		.catch(res.catchHandler('查看朋友圈失败'));
});


//发表心情
router.post('/publish', checkToken(), function (req, res, next) {
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

	function resolvePath(path) {
		return '/' + path.replace(/\\/g, '/');
	}

	//上传图片
	formParse(req)
		.then((param) => {
			var fields = param.fields;
			var files = param.files;
			var mediaSrcs = [];
			//媒体文件
			if (files.medias) {
				files.medias.forEach((media, i) => {
					var src = resolvePath(files.medias[i].path);
					mediaSrcs.push(src);
				});
			}

			//创建到数据库
			return Timeline.create({
				userId: tokenId,
				content: fields.content[0],
				mediaSrcs: mediaSrcs
			})
		})
		.then(timeline => {
			res.api(timeline, 0, '发表成功');
		})
		.catch(res.catchHandler('发表失败'));

});

//点赞
router.get('/likeTimeline/:timelineId', checkToken(), function (req, res, next) {

	var tokenId = req.userId;
	var timelineId = req.params['timelineId'];
	var isLike = req.query['isLike'] === 'true' ? true : false;
	var update = isLike ? {
		$push: {
			likeUserIds: tokenId,
		}
	} : {
		$pull: {
			likeUserIds: tokenId
		}
	};

	Timeline.findByIdAndUpdate(timelineId, update, {
			new: true
		})
		.populate('_user', '-password')
		.populate('_likeUsers', '-password')
		.exec()
		.then(timeline => {
			var timelineObject = timeline.toJSON();

			timelineObject._isLike = timelineObject.likeUserIds.some(id => {
				return id === tokenId;
			});

			//加入comments到timeline
			return new Promise((resolve, reject) => {
				TimelineComment.find()
					.where({
						timelineId: timeline._id
					})
					.exec()
					.then(comments => {
						timelineObject._comments = comments;

						resolve(timelineObject);
					})
					.catch(err => reject(err));
			});

		})
		.then(timeline => {
			res.api(timeline);
		})
		.catch(res.catchHandler('点赞失败'))


});

//评论
router.post('/commentTimeline/:timelineId', checkToken(), function (req, res, next) {
	var tokenId = req.userId;
	var timelineId = req.params['timelineId'];
	var atUserId = req.body['atUserId'];
	var content = req.body['content'];


	TimelineComment.create({
			userId: tokenId,
			timelineId: timelineId,
			atUserId: atUserId,
			content: content,
		})
		.then(comment => {
			return TimelineComment.find()
				.where({
					timelineId: timelineId
				})
				.populate('_user _atUser', '-password')
				.exec();
		})
		.then(comments => {
			var data = {
				_id: timelineId,
				_comments: comments
			};
			res.api(data, 0, '评论成功');
		})
		.catch(res.catchHandler('评论失败'));


});



module.exports = router;