var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId;

var $Schema = new Schema({
	userId:{ type:ObjectId, required:true },
	timelineId:{ type:ObjectId, required:true },
	atUserId:{ type:ObjectId },
	content:{ type:String, required:true },
	publishTime:{
		type:Date,
		default:Date.now
	},
},{ toJSON: { virtuals: true }});

$Schema.virtual('_user',{
	  ref: 'user', // The model to use
	  localField: 'userId', // Find people where `localField`
	  foreignField: '_id', // is equal to `foreignField`
	  justOne:true
});

$Schema.virtual('_atUser',{
	  ref: 'user', // The model to use
	  localField: 'atUserId', // Find people where `localField`
	  foreignField: '_id', // is equal to `foreignField`
	  justOne:true
});


var $Model = mongoose.model('timelineComment', $Schema);

module.exports = $Model;
