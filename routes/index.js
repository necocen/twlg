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
	res.render('index', { title: 'log_t @necocen'});

});

router.search = function(socket) {
  debug("connection");
  socket.on('search', function(data) {
    debug('search');
    var args = data.value.split(/[ 　]/).map(function(arg){
	    arg = arg.replace('\\', '\\\\').replace('"', '\\"').replace('\'', '\\\'').replace('(', '\\(').replace(')', '\\)').replace(' ', '\\ ');
	    return 'text:@"' + arg + '"';
	}).join(' + ');
    debug(args);
    utils.promiseToGroonga('/select?table=Tweets&query=' + encodeURIComponent(args) + '&sortby=-created_at&output_columns=_key&limit=30', 'GET')
	.then(function(value) {
		var arr = JSON.parse(value)[1][0];
		arr.shift();
		arr.shift();
		var ids = [].concat.apply([], arr);
		Tweet.find({id_str: {'$in': ids}}, null, {sort: {created_at: -1}}, function(err, docs){
			socket.emit('search', docs);
		    });
	    });
      });
  socket.on('disconnect', function() {
	  debug('disconnect');
      });
};

module.exports = router;
