(function(){
	//module defines controllers
	var app = angular.module("app", ['ui.router', 'page', 'search']);
	app.controller("messageController", ['$http', '$scope', '$rootScope', '$state', function($http, $scope, $rootScope, $state){
		$http.get("/messages/get").success(function(res){
			if(res.err) return showErr(res.err);
			$scope.mess.conversations = res;
		});
		this.getConv = function(conv){
			$scope.mess.currentConv = conv;
			$http.get("/messages/getMessages").success(function(res){
				if(res.err) return showErr(res.err);
				$scope.mess.messages = res;
			})
		}
	}]);
})();