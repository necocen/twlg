angular.module('twlgFilters', [])
		 .filter('permalink', function(){
			 return function(tweet) {
				 return 'https://twitter.com/' + tweet.user.screen_name + '/status/' + tweet.id_str;
			 };
		 }).filter('favstar', function(){
			 return function(tweet) {
				 return 'http://favstar.fm/users/' + tweet.user.screen_name + '/status/' + tweet.id_str;
			 };
		 }).filter('entities', function(){
			 return function(tweet) {
				 
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
