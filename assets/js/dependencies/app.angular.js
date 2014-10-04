(function(){
	//module defines controllers
	var app = angular.module("app", ['ui.router', 'page', 'search']);
	app.config(function($stateProvider, $urlRouterProvider){
		$urlRouterProvider.otherwise('/login');
		$stateProvider
		.state('login', {
			url: '/login', 
			templateUrl: '/login'
		}).state('user', {
			url: '/use',
			templateUrl: '/pages/user?p=0',
			controller: function($scope) {

			}
		}).state('feed', {
			url: '/feed',
			templateUrl: '/pages/feed'
		})
	});
	app.service("myServices", ['$http', '$scope', '$rootScope', function(){
		return {
			getFriends: function(){
				$http.get("/user/friends").success(function(res){
					if(res.err) return showErr(res.err);
					console.log(res);
					if($rootScope.user){
						$rootScope.user.friends = res;
					}
				});
			}
		};
	}]);
	app.controller("userController", ['$http', '$scope', '$rootScope', '$state', function($http, $scope, $rootScope, $state){
		$scope.temp = {};
		$scope.tLogin = {};
		$rootScope.page = {};
		$http.get("/user/get").success(function(res){
			if(res.status){
				$rootScope.user = res.user;
				$rootScope.auth = true;
				$('.loggedIn').show();
				$('.loggedOut').hide();
				$state.go("feed");
			}else{
				$('.loggedIn').hide();
				console.log(res);
			}
		});
		//get friends
		$http.get("/user/friends").success(function(res){
			if(res.err) return showErr(res.err);
			console.log(res);
			if($rootScope.user){
				$rootScope.user.friends = res;
			}
		});
		//services.getFriends();
		this.login = function(){
			var l = $scope.tLogin = this.tLogin;
			$http.get("/session/create?email="+l.email+"&password="+l.password).success(function(res){
				if(res.auth){
					$scope.userCtrl.tLogin = {};
					$rootScope.user = res.user;
					$rootScope.auth = true;
					$('.loggedIn').show();
					$('.loggedOut').hide();
					//get friends
					$http.get("/user/friends").success(function(res){
					if(res.err) return showErr(res.err);
					console.log(res);
						if($rootScope.user){
						$rootScope.user.friends = res;
						showInfo("Logged In!");
						$state.go("feed");
					}
					});
				}else{
					console.log(res);
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
				$('.loggedOut').hide();
				showInfo("Logged In!");
				$state.go("feed");
			});
			}
		};
		this.logOut = function(){
			$http.get("/session/destroy").success(function(res){
				if(res.status){
					$rootScope.auth = false;
					$rootScope.user = {};
					$('.loggedIn').hide();
					$('.loggedOut').show();
					$state.go("login");
					showInfo("Logged Out!");
				}else showErr("error logging out");
			});
		};
	}]);
})();
