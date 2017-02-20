var Promise = require('bluebird');
var User = require('./models/user');
var Msg = require('./models/msg');
var Relation = require('./models/relation');
var appConfig = require('./config/app-config');

//删除
Promise.join(User.remove().exec()).then(function(result) { 
	// console.log('delete user count:' + result[0]);
	// console.log('delete msg count:' + result[1]);


	//获取个数
	Promise.join(User.count().exec(), Msg.count().exec()).then(function(result) {
		// console.log('user count:' + result[0]);
		// console.log('msg count:' + result[1]);
	});


	var createPromise1 = User.create({
		_id: appConfig.adminId,
		username: 'test1',
		password: '123456',
		nickname:'gibsonxiong',
		avatarSrc: appConfig.host +'/static/img/avatar1.png',
	});

	var createPromise2 = User.create({
		_id: '5880760300f0f4222811e901',
		username: 'test2',
		password: '123456',
		nickname:'ying',
		avatarSrc: appConfig.host +'/static/img/avatar2.png',
	});

	var createPromise3 = User.create({
		_id: '5880760300f0f4222811e902',
		username: 'test3',
		password: '123456',
		nickname:'tom',
		mobile:'13527955428',
		avatarSrc: appConfig.host +'/static/img/avatar3.png',
	});

	Promise.join(createPromise1, createPromise2,createPromise3).then(function(result) {
		var user1 = result[0];
		var user2 = result[1];
		var user3 = result[2];

		var date = new Date();
		var dateSeconds = date.getSeconds();

		// Msg.createAsync({
		// 	senderId: user1._id,
		// 	receiverId: user2._id,
		// 	content: 'Hi',
		// 	// sendTime: date.setSeconds(dateSeconds)
		// });


		// Msg.createAsync({
		// 	senderId: user2._id,
		// 	receiverId: user1._id,
		// 	content: 'Hello',
		// 	sendTime: date.setSeconds(dateSeconds+1)
		// });
		

		// Msg.createAsync({
		// 	senderId: user1._id,
		// 	receiverId: user2._id,
		// 	content: '我们可以做个朋友吗？',
		// 	sendTime: date.setSeconds(dateSeconds+2)
		// });

		// Msg.createAsync({
		// 	senderId: user1._id,
		// 	receiverId: user2._id,
		// 	content: '我想认识你',
		// 	sendTime: date.setSeconds(dateSeconds+3)
		// });

		// Msg.createAsync({
		// 	senderId: user2._id,
		// 	receiverId: user1._id,
		// 	content: '可以啊,哈哈',
		// 	sendTime: date.setSeconds(dateSeconds+4)
		// });

		// //user1 user3
		// Msg.createAsync({
		// 	senderId: user1._id,
		// 	receiverId: user3._id,
		// 	content: 'user1 user3 hi',
		// 	sendTime: date.setSeconds(dateSeconds+4)
		// });

		// Msg.createAsync({
		// 	senderId: user1._id,
		// 	receiverId: user3._id,
		// 	content: 'user1 user3 hi1',
		// 	sendTime: date.setSeconds(dateSeconds+5)
		// });

		// Msg.createAsync({
		// 	senderId: user3._id,
		// 	receiverId: user1._id,
		// 	content: 'user1 user3 hi2',
		// 	sendTime: date.setSeconds(dateSeconds+6)
		// });
	});



});