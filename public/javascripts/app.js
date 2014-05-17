angular.module('twlg', ['twlgServices', 'twlgFilters', 'ngSanitize'])
		 .controller('TwlgCtrl', ['$scope', 'baseTweetFilter', 'socket', function ($scope, baseTweetFilter, socket) {
			 socket.on('connect', function(msg) {
				 console.log('connect');
			 });
			 socket.on('search', function(msg) {
				 $scope.tweets = msg;
			 });
			 $scope.query = '';
			 $scope.$watch('query', function() {
				 socket.emit('search', {value: $scope.query});
			 });
			 $scope.baseTweet = baseTweetFilter;
		 }]);
