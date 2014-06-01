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
				 search($scope.query);
			 });
			 $scope.baseTweet = baseTweetFilter;
			 $scope.expandUrls = expandUrlsFilter;

			 var search = function(query, skip, limit, dateMin, dateMax, order) {
				 skip = skip || 0;
				 limit = limit || 30;
				 dateMin = dateMin || new Date(0); // distantPast
				 dateMax = dateMax || new Date();  // now
				 order = order || false;
				 socket.emit('search', {query: query, skip: skip, limit: limit, dateMin: dateMin, dateMax: dateMax, order: order});
			 };
		 }]);
