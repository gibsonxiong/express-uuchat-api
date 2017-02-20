var express = require('express');
var router = express.Router();
var User = require('../models/user');

router.get('/getJson', function(req, res, next) {
  	res.json({data:'signin successd'});

});

router.get('/book/:id', function(req, res, next) {
  	res.json(req.params);

});

router.get('/ip', function(req, res, next) {
  	res.send(req.ip);

});

router.get('/req', function(req, res, next) {
  	res.json(req);

});

router.post('/getParams/:id', function(req, res, next) {
  	res.json(req.params);
});

router.post('/getBody', function(req, res, next) {
  	res.json(req.body);
});

router.post('/getQuery', function(req, res, next) {
  	res.json(req.query);
});

router.post('/getPath/abc', function(req, res, next) {
  	res.json(req.path);
});
router.post('/api', function(req, res, next) {
  	res.api({
  		name:'1',
  		data:'123'
  	},123,'安达市多');
});

// router.get('/user/create', function(req, res, next) {
//     // //@@create
//     // var user = {
//     //    "username":"sss",
//     //    "password":"password"
//     // }

//     // User.create(user,function(err, user){
//     //     res.api(user);
//     // });


//     // //@@ update
//     // User.update({'username':'111'},{'password':'111'},function(err, user){
//     //     res.api(user);
//     // });

//     //@@ one
//     //  User.one({'username':'gibsonxtion'},function(err, user){
//     //     res.api(user);
//     // });

//     //@@ all
//      User.all(function(err, users){
//         res.api(users);
//     });
// });





module.exports = router;
