var mongoose = require('mongoose');
var Promise = require('bluebird');
mongoose.Promise = Promise;
var dbConfig = require('./config/mongodb-config');

exports.connect = function() {
    var dbURI = dbConfig.hostname + ':' + dbConfig.port + '/' + dbConfig.db + '';
    var options = dbConfig.options;

    mongoose.connect(dbURI, options, function(err, res) {
        if (err) {
            console.log('[mongoose log] Error connecting to: ' +dbURI + '. ' + err);
            return process.exit(1);
        } else {
            return console.log('[mongoose log] Successfully connected to: ' + dbURI);
        }


    });

    mongoose.connection.on('connected', function () {
        console.log('[mongoose log] Mongoose connected to ' + dbURI);
    });
    mongoose.connection.on('error', function (err) {
        console.log('[mongoose log] Mongoose connection error: ' + err);
    });
    mongoose.connection.on('disconnected', function () {
        console.log('[mongoose log] Mongoose disconnected');
    });

    mongoose.connection.on('open', function() {
        return console.log('[mongoose log] Mongoose open success');


    });

    function close(msg, callback) {
        mongoose.connection.close(function () {
            console.log('[mongoose log] Mongoose disconnected through ' + msg);
            callback();
        });
    };

    // nodemon 重启 
    process.once('SIGUSR2', function () {
        close('nodemon restart', function () {
            process.kill(process.pid, 'SIGUSR2');
        });
    });

    // 应用终止
    process.on('SIGINT', function () {
        close('app termination', function () {
            process.exit(0);
        });
    });

}
