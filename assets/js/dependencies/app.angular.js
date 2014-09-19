(function(){
	var app = angular.module("app", []);
	app.controller("userController", ['$http', '$scope', '$rootScope', function($http, $scope, $rootScope){
		$scope.temp = {};
		$scope.tLogin = {};
		$('.login').show();
		$('.loggedIn').hide();
		$http.get("/user/get").success(function(res){
			if(res.status){
				$rootScope.user = res.user;
				$rootScope.auth = true;
				$('.loggedIn').show();
				$('.login').hide();;
			}else{
					console.log(res);
			}
		});
		this.login = function(){
			var l = $scope.tLogin = this.tLogin;
			$http.get("/session/create?email="+l.email+"&password="+l.password).success(function(res){
				if(res.auth){
					$scope.userCtrl.tLogin = {};
					$rootScope.user = res.user;
					$rootScope.auth = true;
					console.log($scope.user);
					$('.loggedIn').show();
					$('.login').hide();
				}else{
					showErr(res.reason);
				};
			});
		};
		this.signUp = function(){
			var t = $scope.temp = this.temp;
			//validate to make sure password and confirmation is the same
			if(t.password==t.cPassword){
			$http.get("/user/create?name="+t.name+"&email="+t.email+"&password="+t.password).success(function(res){
				if(res.err) return showErr(res.err);
				$scope.userCtrl.temp = {};
				$rootScope.user = res;
				$rootScope.auth = true;
				$('.loggedIn').show();
				$('.login').hide();
			});
			}
		};
		this.logOut = function(){
			$http.get("/session/destroy").success(function(res){
				if(res.status){
					$rootScope.auth = false;
					$rootScope.user = {};
					$('.login').show();
					$('.loggedIn').hide();
				}
			});;
		};
	}]);
})();
