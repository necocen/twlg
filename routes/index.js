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
    var args = data.query.split(/[ 　]/).map(function(arg){
			if(arg.length === 0) return null;
	    arg = arg.replace('\\', '\\\\').replace('"', '\\"').replace('\'', '\\\'').replace('(', '\\(').replace(')', '\\)').replace(' ', '\\ ');
	    return 'text:@"' + arg + '"';
		}).filter(function(arg){
			return (arg !== null);
		}).join(' + ');
    debug(args);

		var dateMin = new Date(data.dateMin);
		var dateMax = new Date(data.dateMax);
		
		if(args.length > 0) { // なにかの単語が
			var query = ['table=Tweets',
									 'query=' + encodeURIComponent(args),
									 'sortby=' + (data.order ? '+' : '-') + 'created_at',
									 'output_columns=_key',
									 'filter=' + encodeURIComponent('(created_at>=' + (dateMin.getTime() / 1000.0).toString() + ')&&(created_at<' + (dateMax.getTime() / 1000.0).toString() + ')'),
									 'offset=' + (data.skip || 0).toString(),
									 'limit=' + Math.min(100, data.limit || 30).toString()];
			debug(query.join('&'));
			utils.promiseToGroonga('/select?' + query.join('&'), 'GET')
				.then(function(value) {
					var arr = JSON.parse(value)[1][0];
					var hitCount = arr.shift()[0];
					var columns = arr.shift();
					var ids = [].concat.apply([], arr);
					Tweet.find({id_str: {'$in': ids}})
						.sort({created_at: (data.order ? 1 : -1)})
							.exec(function(err, docs){
								socket.emit('search', {result: docs, count: hitCount});
							});
				});
		} else {
			Tweet.find({created_at: {$gte: dateMin, $lt: dateMax}})
				.sort({created_at: (data.order ? 1 : -1)})
					.skip(data.skip || 0)
						.limit(Math.min(100, data.limit || 30))
							.exec(function(err, docs){
								socket.emit('search', {result: docs, count: null});
							});
		}
	});
  socket.on('disconnect', function() {
	  debug('disconnect');
      });
};

module.exports = router;
