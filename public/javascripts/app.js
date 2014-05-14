angular.module('twlg', ['twlgServices'])
		 .controller('TwlgCtrl', ['$scope', 'socket', function ($scope, socket) {
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
		 }]);
