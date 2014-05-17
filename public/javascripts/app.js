angular.module('twlg', ['twlgServices', 'twlgFilters', 'ngSanitize'])
		 .controller('TwlgCtrl', ['$scope', 'baseTweetFilter', 'expandUrlsFilter', 'socket', function ($scope, baseTweetFilter, expandUrlsFilter, socket) {
			 socket.on('connect', function(msg) {
				 console.log('connect');
			 });
			 socket.on('search', function(msg) {
				 $scope.tweets = msg.result;
				 $scope.count = msg.count;
			 });
			 $scope.count = 0;
			 $scope.query = '';
			 $scope.$watch('query', function() {
				 socket.emit('search', {value: $scope.query});
			 });
			 $scope.baseTweet = baseTweetFilter;
			 $scope.expandUrls = expandUrlsFilter;
		 }]);
