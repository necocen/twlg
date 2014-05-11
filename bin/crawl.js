var Twitter = require('twitter');
var mongoose = require('mongoose');
var db = mongoose.connection;
var tweetSchema = require('../models/tweet.js');
var Tweet = mongoose.model('Tweet', tweetSchema);
var BigNumber = require('bignumber.js');
var utils = require('./utils.js');
var config = require('config');
var debug = require('debug')('crawler');

var client = new Twitter(config.twitter);
mongoose.connect('mongodb://' + config.mongodb.host + ':' + config.mongodb.port + '/' + config.mongodb.db);


// 保存されている最新のIDを取得してクロール開始
var promise = utils.promiseToGroonga('/select?table=Tweets&output_columns=_key&sortby=-created_at&limit=1', 'GET').then(function(value) {
	var arr = JSON.parse(value)[1][0];
	arr.shift();
	arr.shift();
	if(arr.length === 0) {
	    debug('start crawling')
	    crawl();
	} else {
	    debug('start crawling from: ' + arr[0][0]);
	    crawl(arr[0][0]);
	}
    });

function crawl(sinceId, maxId) {
    var params = {
	'user_id': config.twitter.user_id,
	'include_rts': 1,
	'count': 200,
	'exclude_replies': false
    };
    if(sinceId !== undefined) {
	params.since_id = sinceId;
    }
    if(maxId !== undefined) {
	params.max_id = maxId;
    }
    client.get('/statuses/user_timeline.json', params, function(data) {
	    if(data.length > 0) {
		var firstId = data[0].id_str;
		var lastId = data[data.length - 1].id_str;
		debug('retrieve ' + data.length + ' posts: ' + firstId + ' - ' + lastId);
		promise = promise.then(function(){
			return Tweet.create(data, function() {
				debug('mongodb: ' + firstId + ' - ' + lastId);
			    }).then(function() {
				    var json = JSON.stringify(data.map(function(tweet){
						var createdAt = new Date(tweet.created_at);
						var text = utils.urlExpandedText(tweet);
						return {_key: tweet.id_str, text: text, created_at: createdAt.getTime() / 1000.0};		
					    }));
				    return utils.promiseToGroonga('/load?table=Tweets', 'POST', [json]);
				}).then(function() {debug('groonga: ' + firstId + ' - ' + lastId);});
		    });
		crawl(sinceId, new BigNumber(lastId).plus(-1).toString());
	    } else {
		promise = promise.then(function() {debug('done'); return 0;}).finally(process.exit);
	    }
	});
}
