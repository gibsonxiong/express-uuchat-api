var Relation = require('../models/relation');
var socketServer = require('../socket-server');
var Promise = require('bluebird');


//通知
exports.pushMsg = function(msg){
	Relation.findById(msg.relationId)
			.exec()
			.then(relation =>{
				if(msg.fromUserId.equals( relation.fromUserId ) ) {
					socketServer.pushMsg(relation.toUserId, msg);
				}else if(msg.fromUserId.equals( relation.toUserId) ){
					socketServer.pushMsg(relation.fromUserId, msg);
				}

			});
}

