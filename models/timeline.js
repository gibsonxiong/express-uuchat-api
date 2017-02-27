var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId;

var $Schema = new Schema({
	userId:{ type:ObjectId, required:true },
	content:{ type:String },
	mediaUrls:{type:String[] },
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


var $Model = mongoose.model('timeline', $Schema);

module.exports = $Model;
