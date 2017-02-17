var Relation = require('../models/relation');
var socketServer = require('../socket-server');
var Promise = require('bluebird');




//通知
exports.pushUserModed = function(user){
	Relation.findFriendIds(user._id)
			.then( friendIds =>{

				friendIds.forEach(friendId=>{
					socketServer.pushUserModed(friendId,user);
				});
			});

}
