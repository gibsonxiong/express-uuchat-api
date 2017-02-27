var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId;
var Promise = require('bluebird');

var $Schema = new Schema({
	fromUserId: {
		type: ObjectId,
		required: true
	},
	toUserId: {
		type: ObjectId,
		required: true
	},
	confirm: {
		type: Boolean,
		default: false
	},
	requestMsg: {
		type: String
	},
}, {
	toJSON: {
		virtuals: true
	}
});


// @params
// @return 
//     null | Query<Relation>
$Schema.statics.findOneByIdAndUserId = function (relationId, userId1, callback) {

	return this.findOne({
		_id: relationId,
		confirm: true,
		$or: [{
				fromUserId: userId1
			},
			{
				toUserId: userId1
			}
		]
	}, callback);

}

// @params
// @return 
//     null | Query<Relation>
$Schema.statics.findOneByUserIds = function (userId1, userId2, callback) {

	return this.findOne({
		confirm: true,
		$or: [{
				fromUserId: userId1,
				toUserId: userId2
			},
			{
				fromUserId: userId2,
				toUserId: userId1
			}
		]
	}, callback);

}


// @params
// @return 
//     null
// @ect
//    callback(err, friend) 
$Schema.statics.findFriend = function (relationId, userId1, callback) {

	return this.findOne({
			_id: relationId,
			confirm: true,
			$or: [{
					fromUserId: userId1
				},
				{
					toUserId: userId1
				}
			]
		})
		.populate('_fromUser _toUser', '-password')
		.then(function (relation) {
			if (!relation) return callback(null, null);

			if (relation.fromUserId.equals(userId1)) {
				callback(null, relation._toUser);
			} else {
				callback(null, relation._fromUser);
			}
		})
		.catch(function (err) {
			callback(err);
		});

}

// @params
// @return 
//     Query<ObjectId[]>
$Schema.statics.findFriendIds = function (userId) {

	return new Promise((resove, reject) => {
		this.find({
				confirm: true,
				$or: [{
						fromUserId: userId,
					},
					{
						toUserId: userId
					}
				]
			})
			.exec()
			.then(relations => {
				var friendIds = relations.map(function (relation) {
					relation = relation.toJSON();
					if (relation.fromUserId.equals(userId)) {
						return relation.toUserId;
					} else if (relation.toUserId.equals(userId)) {
						return relation.fromUserId;
					}
				});
				resove(friendIds);

			})
			.catch((err) => reject(err));
	});



}

$Schema.virtual('_fromUser', {
	ref: 'user', // The model to use
	localField: 'fromUserId', // Find people where `localField`
	foreignField: '_id', // is equal to `foreignField`
	justOne: true
});

$Schema.virtual('_toUser', {
	ref: 'user', // The model to use
	localField: 'toUserId', // Find people where `localField`
	foreignField: '_id', // is equal to `foreignField`
	justOne: true
});

var $Model = mongoose.model('relation', $Schema);

module.exports = $Model;