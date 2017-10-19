var redis = require("redis"); //召唤redis
var Promise = require('bluebird');

Promise.promisifyAll(redis.RedisClient.prototype);
Promise.promisifyAll(redis.Multi.prototype);

/* 
    连接redis数据库，createClient(port,host,options); 
    如果REDIS在本机，端口又是默认，直接写createClient()即可 
    redis.createClient() = redis.createClient(6379, '127.0.0.1', {}) 
*/
var client = redis.createClient();

//如果需要验证，还要进行验证  
//client.auth(password, callback);  

// if you'd like to select database 3, instead of 0 (default), call  
// client.select(3, function() { /* ... */ });  

//错误监听？  
client.on("error", function (err) {
	console.log("Error " + err);
});

module.exports = client;


