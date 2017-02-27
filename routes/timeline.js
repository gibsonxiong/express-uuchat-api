var express = require('express');
var Promise = require('bluebird');
var router = express.Router();
// var multiparty = require('multiparty');
// var path = require('path');
var Timeline = require('../models/timeline');
var User = require('../models/user');
var Relation = require('../models/relation');
// var msgService = require('../services/msg');
var checkToken = require('../middlewares/checkToken');
// var appConfig = require('../config/app-config');


//查看朋友圈
router.get('/getTimelines', function (req, res, next) {
	var tokenId = req.userId;

	Relation.findFriendIds(tokenId)
		.then(friendIds => {
			return Timeline.find()
				.where({
					userId: {
						$in: friendIds
					},
					$or: [{
						userId: tokenId
					}]
				})
				.exec()
		})
		.then((timelines = []) => {
			res.api(timelines);
		})
		.catch(res.catchHandler('查看朋友圈失败'));
});

router.post('/publishTimeline', function (req, res, next) {
	var tokenId = req.userId;



});




module.exports = router;