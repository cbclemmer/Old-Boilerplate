(function(){
	//module defines controllers
	var app = angular.module("app", ['ui.router', 'page', 'search']);
	app.config(function($stateProvider, $urlRouterProvider){
		$urlRouterProvider.otherwise('/login');
		$stateProvider
		.state('login', {
			url: '/login', 
			templateUrl: '/login',
			controller: function($rootScope){
				if($rootScope.auth) $state.go("feed");
			}

		}).state('user', {
			url: '/user',
			templateUrl: '/pages/user?p=0',
			controller: function($rootScope, $state, $scope){
				if(!$rootScope.auth) $state.go("login");
				if(!$rootScope.pag||$rootScope.pag=={}) $state.go("feed");
			}
		}).state('feed', {
			url: '/feed',
			templateUrl: '/pages/feed',
			controller: function($rootScope, $state){
				if(!$rootScope.auth) $state.go("login");
			}
		})
	});
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
				$http.get("/user/friends?user="+res.user.id).success(function(res){
					if(res.err) return showErr(res.err);
					if($rootScope.user){
						$rootScope.user.fJSON = [];
						$rootScope.user.friends = res;
						if(res.length>0){
							for(var i=0;i<$rootScope.user.friends.length;i++){	
								$http.get("/user/getOne?user="+$rootScope.user.friends[i].user).success(function(res){
									//friend JSON object
									$rootScope.user.fJSON.push(res);
								});
							};
						}
					}
				});
				$rootScope.user.frJSON = [];
				if($rootScope.user.friendRequests.length>1){
					//get friend request data
					for(var i=0;i<$rootScope.user.friendRequests.length;i++){
						$http.get("/user/getOne?user="+$rootScope.user.friendRequests[i]).success(function(res){
							//friend request JSON object
							$rootScope.user.frJSON.push(res);
						});
					};
				}
			}else{
				$('.loggedIn').hide();
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
					$http.get("/user/friends?user="+res.user.id).success(function(res){
						if(res.err) return showErr(res.err);
						if($rootScope.user){
							$rootScope.user.fJSON = [];
							$rootScope.user.friends = res;
							if(res.length>0){
								for(var i=0;i<$rootScope.user.friends.length;i++){	
									$http.get("/user/getOne?user="+$rootScope.user.friends[i].user).success(function(res){
										//friend JSON object
										$rootScope.user.fJSON.push(res);
									});
								};
							}
							showInfo("Logged In!");
							$state.go("feed");
						}
					});
					$rootScope.user.frJSON = [];
					if($rootScope.user.friendRequests.length>0){
						//get friend request data
						for(var i=0;i<$rootScope.user.friendRequests.length;i++){
							$http.get("/user/getOne?user="+$rootScope.user.friendRequests[i]).success(function(res){
								//friend request JSON object
								$rootScope.user.frJSON.push(res);
							});
						};
					}
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
		$scope.use.getPage = function(obj){
			$rootScope.pag  = obj;
			$rootScope.pag.request=false;
			$rootScope.pag.friendsWith=false;
			$http.get("/user/friends?user="+obj.id).success(function(res){
				if(res.err) return showErr(res.err);
				if($rootScope.user){
					$rootScope.pag.f = res;
					$rootScope.pag.friends = [];
					for(var i=0;i<$rootScope.pag.f.length;i++){	
						$http.get("/user/getOne?user="+$rootScope.pag.f[i].user).success(function(res){
							//friend JSON object
							$rootScope.pag.friends.push(res);
						});
					};
					for(var i=0;i<res.length;i++){
						if(res[i].user==$rootScope.user.id){
							$rootScope.pag.friendsWith=true;
						}
					}
				}
				for(var i=0;i<$rootScope.user.friendRequests.length;i++){
					if($rootScope.user.friendRequests[i]==$rootScope.user.id){
						return $rootScope.pag.request=true;
					}
				}
				$state.go("user");
			});
		}
		$scope.use.rFriend = function(id){
			$http.get("/user/rFriend?user="+id).success(function(res){
				if(res.err) return showErr(res.err);
				if(res.status){
					for(var i=0;i<$rootScope.user.fJSON.length;i++){
						if($rootScope.user.fJSON.id==id){
							$rootScope.user.fJSON.splice(i,1);
							break;
						}
					}
					return $state.go("feed");
				}
				showErr("Something went terribly wrong");
			});
		}
	}]);
})();
