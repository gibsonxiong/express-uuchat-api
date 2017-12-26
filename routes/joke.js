var express = require('express');
var Promise = require('bluebird');
var router = express.Router();
// var path = require('path');
var Joke = require('../models/joke');
var User = require('../models/user');
var checkToken = require('../middlewares/checkToken');
var appConfig = require('../config/app-config');
var utils = require('../utils');


//获取笑话列表
router.get('/getJokes', checkToken(), function (req, res, next) {
    var tokenId = req.userId;

    Joke.find({
        })
        .populate('_user', '-password')
        .sort('-publicTime')
        .exec()
        .then((jokes) => {
            jokes.forEach(joke => {
                joke._doc._isLike = joke.likeUserIds.indexOf(tokenId) !== -1;
                joke._doc._isDislike = joke.dislikeUserIds.indexOf(tokenId) !== -1;
            })
            res.api(jokes);
        })
        .catch(res.catchHandler('获取数据失败'));
});


//发表笑话
router.post('/publish', checkToken(), function (req, res, next) {
    var tokenId = req.userId;

    //上传图片
    utils.parseFormData(req)
        .then((param) => {
            var fields = param.fields;
            var files = param.files;
            var mediaSrcs = [];
            //媒体文件
            if (files.medias) {
                files.medias.forEach((media, i) => {
                    var src = utils.resolvePath(files.medias[i].path);
                    mediaSrcs.push(src);
                });
            }

            //创建到数据库
            return Joke.create({
                userId: tokenId,
                content: fields.content[0],
                mediaSrcs: mediaSrcs
            });
        })
        .then(joke => {
            res.api(joke, 0, '发表成功');
        })
        .catch(res.catchHandler('发表失败'));

});

//点好评
router.post('/like/:jokeId', checkToken(), function (req, res, next) {
    var tokenId = req.userId;
    var jokeId = req.params['jokeId'];
    var isLike = req.body['isLike'];
    var update = isLike ? {
        $addToSet: {
            likeUserIds: tokenId,
        }
    } : {
        $pull: {
            likeUserIds: tokenId
        }
    };

    Joke.findOne({
            _id: jokeId,
            dislikeUserIds: tokenId
        })
        .exec()
        .then(joke => {
            //如果已经差评了，需要移除差评
            if (joke) {
                if (!update.$pull) {
                    update.$pull = {};
                }
                update.$pull.dislikeUserIds = tokenId;
            }

            return Joke.findByIdAndUpdate(jokeId, update, {
                    new: true
                })
                .populate('_user', '-password')
                .exec()
        })
        .then(joke => {
            joke._doc._isLike = joke.likeUserIds.indexOf(tokenId) !== -1;
            joke._doc._isDislike = joke.dislikeUserIds.indexOf(tokenId) !== -1;
            res.api(joke);
        })
        .catch(res.catchHandler('点好评失败'))

});

//点差评
router.post('/dislike/:jokeId', checkToken(), function (req, res, next) {
    var tokenId = req.userId;
    var jokeId = req.params['jokeId'];
    var isDislike = req.body['isDislike'];
    var update = isDislike ? {
        $addToSet: {
            dislikeUserIds: tokenId,
        }
    } : {
        $pull: {
            dislikeUserIds: tokenId
        }
    };

    Joke.findOne({
            _id: jokeId,
            likeUserIds: tokenId
        })
        .exec()
        .then(joke => {
            //如果已经好评了，需要移除好评
            if (joke) {
                if (!update.$pull) {
                    update.$pull = {};
                }
                update.$pull.likeUserIds = tokenId;
            }

            return Joke.findByIdAndUpdate(jokeId, update, {
                    new: true
                })
                .populate('_user', '-password')
                .exec()
        })

        .then(joke => {
            joke._doc._isLike = joke.likeUserIds.indexOf(tokenId) !== -1;
            joke._doc._isDislike = joke.dislikeUserIds.indexOf(tokenId) !== -1;
            res.api(joke);
        })
        .catch(res.catchHandler('点差评失败'))

});


module.exports = router;