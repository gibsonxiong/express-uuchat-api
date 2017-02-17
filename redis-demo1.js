var redis = require("redis");
var client = redis.createClient();

client.on("error", function(err) {
	console.log("Error " + err);
});

client.on("connect", runSample);

function runSample() {

	// 设置一个字符串类型的值，返回值：OK
	client.set("string key", "Hello World", function(err, reply) {
		console.log(reply.toString());
	});

	// 获取一个字符串类型的值，返回字：value
	client.get("string key", function(err, reply) {
		console.log(reply.toString());
	});

	// 另外一种方式获取一个字符串类型的值，返回字：value
	var multiCmd = client.multi();
	multiCmd.get("string key");
	multiCmd.exec(function(err, reply) {
		console.log(reply.toString());
	});

	// 设置失效时间
	client.expire('string key', 3);

	// 有效时间验证
	var myTimer = setInterval(function() {
		client.get('string key', function(err, reply) {
			if (reply) {
				console.log('I live: ' + reply.toString());
			} else {
				clearTimeout(myTimer);
				console.log('I expired');
				client.quit();
			}
		});
	}, 1000);

	// 检查一个值在失效之前存留了多长时间
	var myTimer = setInterval(function() {
		client.get('string key', function(err, reply) {
			if (reply) {
				console.log('I live: ' + reply.toString());
				client.ttl('string key', writeTTL);
			} else {
				clearTimeout(myTimer);
				console.log('I expired');
				client.quit();
			}
		});
	}, 1000);

	// 集合操作
	var key = "set key";
	client.sadd(key, uid);
	client.sadd(key, "a");
	client.sadd(key, "b");
	// 获取key集合中是否包含“1”，如果包含，返回1，否则返回0
	client.sismember(key, "a", showData);

	//client.quit();
}

function writeTTL(err, data) {
	console.log("I live for this long yet: " + data);
}

function showData(err, data) {
	if (err) {
		console.log("err:" + err);
	} else {
		console.log("reply:" + data);
	}
}