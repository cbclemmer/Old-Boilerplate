(function(){
	var app = angular.module("page", []);
	app.controller("pageController", ['$http', '$scope', '$rootScope', function($http, s, rs){
		$rootScope.page = {};
	}]);
})();