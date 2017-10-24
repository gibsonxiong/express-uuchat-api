var Server = require('socket.io');
var Promise = require('bluebird');
var jwt = require('jsonwebtoken');
// var redisClient = require('./redis-client');
var appConfig = require('./config/app-config');
var StayedMsg = require('./models/stayed-msg');
var Msg = require('./models/msg');
var io = new Server();
var sockets = {};


io.on('connection', function (socket) {
	// let handshake = socket.handshake;

	//退出
	socket.on('disconnect', function () {
		delete sockets[socket.$userId];

		console.log('[userId:' + socket.$userId + '] logout---------------');
	});

	//登录
	socket.on('login', function (token, ack) {
		
		var verify = Promise.promisify(jwt.verify);

		verify(token, appConfig.secret)
			.then(decoded => {

				var userId = decoded.userId;
				var onlineSocket = sockets[userId];

				//如果已经在线
				if (onlineSocket) {
					onlineSocket.emit('forceQuit');
					onlineSocket.disconnect();
				}

				socket.$userId = userId;
				sockets[userId] = socket;

				ack(true);

				//推送存储的消息，如果有的话
				pushStayMsg(userId);

				console.log('[userId:' + userId + '] login---------------');
			})
			.catch(err => {
				ack(false);
			})


	});

});

function attach(server) {
	console.log('[scoketServer] attach success!');
	io.attach(server);
}

function isOnline(userId) {
	var socket = sockets[userId];

	return !!socket;
}

/* @des	
 *		推送消息
 * @params
 *		msg(s) 消息 可以是数组
 */
function pushMsg(toUserId, msgs, isSaved) {
	var socket = sockets[toUserId];

	if (msgs && msgs.constructor != Array) {
		msgs = [msgs];
	}

	if (socket) {
		socket.emit('pushMsg', msgs, function (msgIds) {
			StayedMsg.remove({
				userId: toUserId,
				msgId: {
					$in: msgIds
				}
			}).exec();
		});
	} else {
		if (!isSaved) {
			//储存起来
			msgs.forEach(msg => {
				saveStayMsg(toUserId, msg);
			});

		}

	}

}

/* @des	
 *		当用户刚上线，把存储的消息推送过去
 * @params
 *		msg(s) 消息 可以是数组
 */
function pushStayMsg(userId) {
	StayedMsg.find({
			userId: userId
		})
		.exec()
		.map(stayMsg => {
			return stayMsg.msgId.toString();
		})
		.then(msgIds => {
			return Msg.find({
					'_id': {
						$in: msgIds
					}
				})
				.populate('_fromUser', '-password')
				.exec()

		})
		.then(msgs => {
			pushMsg(userId, msgs, true);
		})
		.catch((err) => {
			// debugger;
		})
}

/* @des	
 *		当用户不在线，把待推送的消息存储
 * @params
 *		msg(s) 消息 可以是数组
 */
function saveStayMsg(userId, msg) {
	StayedMsg.create({
		userId: userId,
		msgId: msg._id
	})
}

function pushUserModed(toUserId, user) {
	var socket = sockets[toUserId];

	if (socket) {
		socket.emit('pushUserModed', user);
	}
}




exports.attach = attach;
exports.isOnline = isOnline;
exports.pushMsg = pushMsg;
exports.pushUserModed = pushUserModed;