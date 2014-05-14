angular.module('twlg', ['twlgServices'])
		 .controller('TwlgCtrl', ['$scope', 'socket', function ($scope, socket) {
			 socket.on('connect', function(msg) {
				 console.log('connect');
			 });
			 socket.on('message', function(msg) {
				 $scope.tweets = msg;
			 });
			 $scope.search = function() {
				 socket.emit('message', {value: $scope.query});
			 };
		 }]);
