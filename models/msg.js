var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId;

var $Schema = new Schema({
	// chatId:{type:ObjectId, required:true},
	fromUserId:{ type:ObjectId, required:true },
	relationId:{ type:ObjectId, required:true},
	content:String,
	sendTime:{
		type:Date,
		default:Date.now
	},
},{ toJSON: { virtuals: true }});

$Schema.virtual('_fromUser',{
	  ref: 'user', // The model to use
	  localField: 'fromUserId', // Find people where `localField`
	  foreignField: '_id', // is equal to `foreignField`
	  justOne:true
});

// $Schema.virtual('_receiver',{
// 	  ref: 'user', // The model to use
// 	  localField: 'receiverId', // Find people where `localField`
// 	  foreignField: '_id', // is equal to `foreignField`
// 	  justOne:true
// });


var $Model = mongoose.model('msg', $Schema);

module.exports = $Model;
