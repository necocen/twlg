var Twitter = require('twitter');
var mongoose = require('mongoose');
require('mongoose-long')(mongoose);
var db = mongoose.connection;
var tweetSchema = require('../models/tweet.js');
var Tweet = mongoose.model('Tweet', tweetSchema);
var BigNumber = require('bignumber.js');
var JSONbig = require('json-bigint');
var utils = require('./utils.js');
var config = require('config');
var debug = require('debug')('crawler');

var client = new Twitter(config.twitter);
mongoose.connect('mongodb://' + config.mongodb.host + ':' + config.mongodb.port + '/' + config.mongodb.db);


// 保存されている最新のIDを取得してクロール開始
var promise = utils.promiseToGroonga('/select?table=Tweets&output_columns=_key&sortby=-_key&limit=1', 'GET').then(function(value) {
	var arr = JSONbig.parse(value)[1][0];
	arr.shift();
	arr.shift();
	if(arr.length === 0) {
	    debug('start crawling')
	    crawl();
	} else {
	    debug('start crawling from: ' + arr[0][0].toString());
	    crawl(arr[0][0].toString());
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
		var firstId = new BigNumber(data[0].id_str);
		var lastId = new BigNumber(data[data.length - 1].id_str);
		debug('retrieve ' + data.length + ' posts: ' + firstId.toString() + ' - ' + lastId.toString());
		promise = promise.then(function(){
			return Tweet.create(data, function() {
				debug('mongodb: ' + firstId.toString() + ' - ' + lastId.toString());
			    }).then(function() {
				    var json = JSON.stringify(data.map(function(tweet){
						var createdAt = new Date(tweet.created_at);
						var text = utils.urlExpandedText(tweet);
						return {_key: tweet.id_str, text: text, created_at: createdAt.getTime() / 1000.0};		
					    }));
				    return utils.promiseToGroonga('/load?table=Tweets', 'POST', [json]);
				}).then(function() {debug('groonga: ' + firstId.toString() + ' - ' + lastId.toString());});
		    });
		crawl(sinceId, lastId.plus(-1).toString());
	    } else {
		promise = promise.then(function() {debug('done'); return 0;}).finally(process.exit);
	    }
	});
}
