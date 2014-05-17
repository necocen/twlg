angular.module('twlgFilters', [])
		 .filter('permalink', function(){
			 return function(tweet) {
				 return 'https://twitter.com/' + tweet.user.screen_name + '/status/' + tweet.id_str;
			 };
		 }).filter('favstar', function(){
			 return function(tweet) {
				 return 'http://favstar.fm/users/' + tweet.user.screen_name + '/status/' + tweet.id_str;
			 };
		 }).filter('expandUrls', function(){
			 return function(tweet) {
				 var text = tweet.text;
				 var entities = [];
				 entities = entities.concat(tweet.entities.urls.map(function(url) {
					 return {
					 indices: url.indices,
					 display: '<a href="' + url.expanded_url + '">' + url.display_url + '</a>'
					 };
				 }), tweet.entities.media.map(function(media) {
					 return {
					 indices: media.indices,
					 display: '<a href="' + media.expanded_url + '">' + media.display_url + '</a>'
					 };
				 }), tweet.entities.user_mentions.map(function(user_mention){
					 return {
					 indices: user_mention.indices,
					 display: '<a href="https://twitter.com/' + user_mention.screen_name + '">@' + user_mention.screen_name + '</a>'
					 };
				 }));
				 entities.sort(function(a, b){
					 return a.indices[0] - b.indices[0];
				 });
				 var extendedLength = 0; // 置換によって伸びた長さの保存
				 entities.forEach(function(entity) {
					 var from = entity.indices[0] + extendedLength;
					 var to = entity.indices[1] + extendedLength;
					 var length = entity.indices[1] - entity.indices[0];
					 extendedLength += (entity.display.length - length);
					 text = text.substr(0, from) + entity.display + text.substr(to);
				 });
				 return text;
			 };
		 }).filter('baseTweet', function(){
			 return function(tweet) {
				 return tweet.retweeted_status ? tweet.retweeted_status : tweet;
			 };
		 }).filter('userPage', function(){
			 return function(tweet) {
				 return 'https://twitter.com/' + tweet.user.screen_name;
			 }
		 });
