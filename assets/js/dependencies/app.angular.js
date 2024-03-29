(function(){
	//module defines controllers
	var app = angular.module("app", ['ui.router', 'ngSails', 'group', 'search', 'post', 'settings']);
	app.config(function($stateProvider, $urlRouterProvider){
		if(window.location.pathname.length<2) $urlRouterProvider.otherwise('/login');
		$stateProvider
		.state('login', {
			url: '/login', 
			templateUrl: '/login',
			controller: function($rootScope){
				if($rootScope.auth) $state.go("feed");
			}

		}).state('feed', {
			url: '/feed',
			templateUrl: '/pages/feed',
			controller: function($rootScope, $state){
				if(!$rootScope.auth) $state.go("login");
			}
		}).state('settings', {
			url: '/settings',
			templateUrl: '/pages/settings',
			controller: function($rootScope, $state){
				if(!$rootScope.auth) $state.go("login");
			}
		}).state('messages', {
			url: '/messagess',
			templateUrl: '/pages/messages',
			controller: function($rootScope, $state){
				if(!$rootScope.auth) $state.go("login");
			}
		});
	});
	app.controller("userController", ['$http', '$scope', '$rootScope', '$state', '$sails', function($http, $scope, $rootScope, $state, $sails){
		$scope.temp = {};
		$scope.tLogin = {};
		$rootScope.nGroup = {};
		if(window.location.pathname.search("/api")==-1){
			$http.get("/user/get").success(function(res){
			if(res.status){
				if(!user) $rootScope.user = res.user;
				if(Boolean($rootScope.user.private)&&document.getElementById("privateChk")) {
					document.getElementById("privateChk").checked = true;
				}else{
					if(document.getElementById("privateChk")) document.getElementById("privateChk").checked = false;
				}
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
				if(!$rootScope.user.friendRequests) $rootScope.user.friendRequests = [];
				if(!$rootScope.user.requestsSent) $rootScope.user.requestsSent = [];
				if($rootScope.user.friendRequests.length>=1){
					//get friend request data
					for(var i=0;i<$rootScope.user.friendRequests.length;i++){
						$http.get("/user/getOne?user="+$rootScope.user.friendRequests[i]).success(function(res){
							//friend request JSON object
							$rootScope.user.frJSON.push(res);
						});
					};
				}
				//get the group json
				$rootScope.user.gJSON = [];
				if(!$rootScope.user.groups) $rootScope.user.groups = [];
				if($rootScope.user.groups.length>0){
					for(var i=0;i<$rootScope.user.groups.length;i++){
						$http.get("/group/get?handle="+$rootScope.user.groups[i]).success(function(res){
							if(res.err) return showErr(res.err);
							$rootScope.user.gJSON.push(res);
						});
					}
				}
			}else{
				$('.loggedIn').hide();
			}
		});
		}
		$sails.on("online", function(data){
			//this is a boolean variable on: true=online; false=offline
			for(var i=0;i<$rootScope.user.fJSON.length;i++){
				if($rootScope.user.fJSON[i].id==data.id){
					$rootScope.user.fJSON[i].online = data.online;
					break;
				}
			}
		});
		$sails.on("aFr", function(data){
			console.log(data);
			if(!$rootScope.user.frJSON) $rootScope.user.frJSON = [];
			$rootScope.user.frJSON.unshift(data.ask);
		});
		this.login = function(){
			var l = $scope.tLogin = this.tLogin;
			$http.get("/session/create?email="+l.email+"&password="+l.password).success(function(res){
				if(res.auth){
					$scope.userCtrl.tLogin = {};
					$rootScope.user = res.user;
					$rootScope.pag = $rootScope.user;
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
					if(!$rootScope.user.friendRequests) $rootScope.user.friendRequests = [];
					if(!$rootScope.user.requestsSent) $rootScope.user.requestsSent = [];
					if($rootScope.user.friendRequests.length>0&&$rootScope.user.friendRequests[0]!=null){
						//get friend request data
						for(var i=0;i<$rootScope.user.friendRequests.length;i++){
							$http.get("/user/getOne?user="+$rootScope.user.friendRequests[i]).success(function(res){
								//friend request JSON object
								$rootScope.user.frJSON.push(res);
							});
						};
					}
					//get the group json
					$rootScope.user.gJSON = [];
					if(!$rootScope.user.groups) $rootScope.user.groups = [];
					if($rootScope.user.groups.length>0){
						for(var i=0;i<$rootScope.user.groups.length;i++){
							$http.get("/group/get?handle="+$rootScope.user.groups[i]).success(function(res){
								if(res.err) return showErr(res.err);
								$rootScope.user.gJSON.push(res);
							});
						}
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
			//create user
			$http.get("/user/create?username="+t.username+"&name="+t.name+"&email="+t.email+"&password="+t.password).success(function(res){
				if(res.err) return showErr(res.err);
				if(res.err) return showErr(res.err);
				if(res.status){
					$scope.userCtrl.temp = {};
					$rootScope.user = res.user;
					$rootScope.auth = true;
					//log in user
					$http.get("/session/create?email="+t.email+"&password="+t.password).success(function(res){
						if(res.auth){
						$scope.userCtrl.tLogin = {};
						$rootScope.user = res.user;
						$rootScope.auth = true;
						$('.loggedIn').show();
						$('.loggedOut').hide();
						$rootScope.user.requestsSent = [];
						$rootScope.user.friendRequests = [];
						$rootScope.user.fJSON = [];
						$rootScope.user.frJSON = [];
						showInfo("Sign up successfull");
						$state.go("feed");
						}
					});					
				}else{
					if(res.reason=="username") showErr("Username already taken");
					if(res.reason=="email") showErr("Email already taken");
				}
			});
			}
		};    
		this.nGroup = function(){
			var g = $rootScope.nGroup;
			$http.get("/group/create?name="+g.name+"&handle="+g.handle).success(function(res){
				if(res.err) return showErr(res.err);
				$rootScope.nGroup = {};
				showInfo("Group: "+g.name+" created");
				if(!$rootScope.user.gJSON) $rootScope.user.gJSON = [];
				$rootScope.user.gJSON.push(res);
				return $rootScope.user.gJSON.push(res);
			});
		};
		this.logOut = function(){
			$http.get("/session/destroy?load=f").success(function(res){
				if(res.status){
					$rootScope.auth = false;
					$rootScope.user = null;
					$('.loggedIn').hide();
					$('.loggedOut').show();
                    if(window.location.pathname.length==1)
					   $state.go("login");
                    else    
                        window.location.replace("/");
					showInfo("Logged Out!");
				}else showErr("error logging out");
			});
		};
		//change the password
		this.cPassword = function(){
			var t = $scope.temp = this.temp;
			if(t.nPassword==t.cnPassword){
				$http.get("/user/edit?type=cp&cp="+t.cPassword+"&np="+t.nPassword).success(function(res){
					if(res.status){
						showInfo("Password changed successfullu");
					}else{
						showErr(res.reson);
					}
				});
			}
		};
		this.private = function(p){
			if(document.getElementById("privateChk")) p = document.getElementById("privateChk").checked;
			$http.get("/user/private?p="+p).success(function(res){
				if(res.status){
					if(res.p){
						showInfo("Profile set to private");
					}else{
						showInfo("Profile set to public");
					}
				}
			});
		};
		this.addFriend = function(user){
			//hold the friend request for fast access
			req = $rootScope.user.friendRequests;
			$http.get("/user/addFriend?request="+user).success(function(res){
				if(res.err){console.log(err);showErr(err.reason)};
				if(res){
					$http.get("/user/getOne?user="+user).success(function(res){
						$rootScope.user.fJSON.push(res);
					});
					for(var i=0;i<req.length;i++){
						if(req[i]==user){
							$rootScope.user.frJSON.splice(i, 1);
						}
					}
				}
			});
		};
		this.addFriendRequest = function(user){
			//add the user: user to their friend request list
			$http.get("/user/addFriendRequest?friend="+user+"&socket="+io.socket.socket.sessionid).success(function(res){
				if(res.err){console.log(res.err);showErr(err.reason)};
				if(res){
					console.log("request add");
					console.log(user);
					$rootScope.user.requestsSent.push(user);
					$rootScope.pag.request = true;
				}
			});
		};
		this.deleteRequest = function(user){
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
		this.rFriend = function(id){
			$http.get("/user/rFriend?user="+id).success(function(res){
				if(res.err) return showErr(res.err);
				if(res.status){
					//delete the user from local vars
					for(var i=0;i<$rootScope.user.fJSON.length;i++){
						if($rootScope.user.fJSON[i].id==id){
							console.log("found");
							pag.friendsWith = false;
							$rootScope.user.fJSON.splice(i,1);
							break;
						}
					}
					return $state.go("feed");
				}
				showErr("Something went terribly wrong");
			});
		}
        console.log($scope);
	}]);
})();
