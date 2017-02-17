var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId;

var $Schema = new Schema({
	userId: {
		type: ObjectId,
		required: true
	},
	msgId: {
		type: ObjectId,
		required: true
	}
}, {
	toJSON: {
		virtuals: true
	}
});

$Schema.virtual('_user', {
	ref: 'user',
	localField: 'userId',
	foreignField: '_id',
	justOne: true
});

$Schema.virtual('_msg', {
	ref: 'msg', 
	localField: 'msgId', 
	foreignField: '_id',
	justOne: true
});


var $Model = mongoose.model('stayedMsg', $Schema);

module.exports = $Model;