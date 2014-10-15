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
			url: '/user',
			templateUrl: '/pages/user?p=0',
			controller: function($rootScope, $state, $scope){
				if(!$rootScope.auth) $state.go("login");
				//angular.element(document.getElementById('searchBar')).scope().s.getPage($rootScope.page);
			}
		}).state('feed', {
			url: '/feed',
			templateUrl: '/pages/feed',
			controller: function($rootScope, $state){
				if(!$rootScope.auth) $state.go("login");
			}
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
				//get friends
				//get friend
				$http.get("/user/friends").success(function(res){
					console.log(res);
					if(res.err) return showErr(res.err);
						if($rootScope.user){
							$rootScope.user.fJSON = [];
							$rootScope.user.friends = res;
							for(var i=0;i<$rootScope.user.friends.length;i++){	
								console.log($rootScope.user.friends[i]);
								$http.get("/user/getOne?user="+$rootScope.user.friends[i].user).success(function(res){
									//friend JSON object
									$rootScope.user.fJSON.push(res);
								});
							};
							showInfo("Logged In!");
						}
				});
				$rootScope.user.frJSON = [];
				//get friend request data
				for(var i=0;i<$rootScope.user.friendRequests.length;i++){
					$http.get("/user/getOne?user="+$rootScope.user.friendRequests[i]).success(function(res){
						//friend request JSON object
						$rootScope.user.frJSON.push(res);
					});
				};
			}else{
				$('.loggedIn').hide();
				console.log(res);
			}

		});
		this.login = function(){
			var l = $scope.tLogin = this.tLogin;
			$http.get("/session/create?email="+l.email+"&password="+l.password).success(function(res){
				if(res.auth){
					$scope.userCtrl.tLogin = {};
					$rootScope.user = res.user;
					$rootScope.page = $rootScope.user;
					$rootScope.auth = true;
					$('.loggedIn').show();
					$('.loggedOut').hide();
					//get friend
				$http.get("/user/friends").success(function(res){
					console.log(res);
					if(res.err) return showErr(res.err);
						if($rootScope.user){
							$rootScope.user.fJSON = [];
							$rootScope.user.friends = res;
							for(var i=0;i<$rootScope.user.friends.length;i++){	
								console.log($rootScope.user.friends[i]);
								$http.get("/user/getOne?user="+$rootScope.user.friends[i].user).success(function(res){
									//friend JSON object
									$rootScope.user.fJSON.push(res);
								});
							};
							showInfo("Logged In!");
							$state.go("feed");
						}
				});
					$rootScope.user.frJSON = [];
					//get friend request data
					for(var i=0;i<$rootScope.user.friendRequests.length;i++){
						$http.get("/user/getOne?user="+$rootScope.user.friendRequests[i]).success(function(res){
							//friend request JSON object
							$rootScope.user.frJSON.push(res);
						});
					};
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
				$http.get("/user/getFriendRequests").success(function(res){
					if(res.err) {console.log;return showErr(res.err);}
					$rootScope.user.friendRequests = res;
				});
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
		$scope.use.addFriend = function(user){
			//hold the friend request for fast access
			req = $rootScope.user.friendRequests;
			$http.get("/user/addFriend?request="+user).success(function(res){
				if(res.err){console.log(err);showErr(err.reason)};
				if(res){
					$http.get("/user/getOne?user="+user).success(function(res){
						$rootScope.user.friends.push(res);
					});
					for(var i=0;i<req.length;i++){
						if(req[i]==user){
							$rootScope.user.frJSON.splice(i, 1);
						}
					}
				}
			});
		};
		$scope.use.addFriendRequest = function(user){
			//add the user: user to their friend request list
			console.log("adding friend request");
			$http.get("/user/addFriendRequest?friend="+user).success(function(res){
				if(res.err){console.log(res.err);showErr(err.reason)};
				if(res){
					$rootScope.page.request = true;
				}
			});
		};
		$scope.use.deleteRequest = function(user){
			req = $rootScope.user.friendRequests;
			$http.get("/user/deleteRequest?request="+user).success(function(res){
				if(res.err){console.log(err);showErr(err.reason)};
				if(res){
					for(var i=0;i<req.length;i++){
						if(req[i]==user){
							$rootScope.user.frJSON.splice(i, 1);
						}
					}
				}
			});
		}
	}]);
})();
