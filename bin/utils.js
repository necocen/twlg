var http = require('q-io/http');
var config = require('config');


module.exports = {
    // groongaになんか送ります
    promiseToGroonga: function (path, method, body) {
	return http.request({hostname: config.groonga.host,
			     port: config.groonga.port,
			     path: '/' + config.groonga.db + path,
			     method: method,
			     body: body,
			     headers: {'Content-Type': 'application/json'}})
	.then(function(response){return response.body.read();})
	.then(function(buffer) {return buffer.toString('utf-8');});
    },
    // Tweetオブジェクトの短縮URLを展開したtextを返します
    urlExpandedText: function(tweet) {
	var text = tweet.text;
	var extendedLength = 0; // URL置換によって伸びた長さの保存
	tweet.entities.urls.forEach(function(url) {
		var urlFrom = url.indices[0] + extendedLength;
		var urlTo = url.indices[1] + extendedLength;
		var urlLength = url.indices[1] - url.indices[0];
		extendedLength += (url.expanded_url.length - urlLength);
		text = text.substr(0, urlFrom) + url.expanded_url + text.substr(urlTo);
	    });
	return text;
    }
};
