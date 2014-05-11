var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var tweetSchema = require('../models/tweet.js');
var utils = require('../bin/utils.js');
var config = require('config');
var debug = require('debug')('socket.io');

mongoose.connect('mongodb://' + config.mongodb.host + ':' + config.mongodb.port + '/' + config.mongodb.db);
var db = mongoose.connection;

var Tweet = mongoose.model('Tweet', tweetSchema);

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'Express' });

});

router.search = function(socket) {
  debug("connection");
  socket.on('message', function(data) {
    debug('message');
    var args = data.value.split(/[ 　]/).map(function(arg){
	    arg = arg.replace('\\', '\\\\').replace('"', '\\"').replace('\'', '\\\'').replace('(', '\\(').replace(')', '\\)').replace(' ', '\\ ');
	    return 'text:@' + arg;
	}).join(' + ');
    debug(args);
    utils.promiseToGroonga('/select?table=Tweets&query=' + encodeURIComponent(args) + '&output_columns=_key&limit=30', 'GET')
	.then(function(value) {
		var arr = JSON.parse(value)[1][0];
		arr.shift();
		arr.shift();
		var ids = [].concat.apply([], arr);
		Tweet.find({id_str: {'$in': ids}}, function(err, docs){
			socket.emit('message', docs);
		    });
	    });
      });
  socket.on('disconnect', function() {
	  debug('disconnect');
      });
};

module.exports = router;
