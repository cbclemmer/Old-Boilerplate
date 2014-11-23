(function(){
	var app = angular.module("search", ['ui.router']);
	app.controller("searchController", ['$http', '$scope', '$rootScope', '$state', function(h, scope, rs, state){
		if(window.location.pathname.search("/show")!=-1) {
			rs.pag = {};
			//determine what dynamic page you are on
			if(window.location.pathname.search("/post/")!=-1) rs.pag.type = "post";
			if(window.location.pathname.search("/group/")!=-1) rs.pag.type = "group";
			if(window.location.pathname.search("/user/")!=-1) rs.pag.type = "user";
			if(window.location.pathname.search("/api/")!=-1) rs.pag.type = "api";
			//if it is a user or group page
			if(rs.pag.type=="api"){
				var username = window.location.pathname.split("/")[(window.location.pathname.split("/").length)-1];

			};
			//get info on current user
			h.get("/user/get").success(function(res){
				if(res.err) return showErr(res.err);
				rs.user = res.user;
				if(rs.pag.type=="user"){
					//get information on user that you are seeing
					h.get("/user/getOne?username="+username).success(function(res){
						if(res.err) return showErr(err);
						rs.pag = res;
						rs.pag.type="user";
						//get posts
						h.get("/post/userfeed?user="+pag.id).success(function(res){
							if(res.err) return showErr(res.err);
							rs.posts = res.posts;
						});
						h.get("/user/friends?user="+pag.id).success(function(res){
							if(res.err) return showErr(res.err);
							rs.pag.friends = [];
							for(var i=0;i<res.length;i++){	
								h.get("/user/getOne?user="+res[i].user).success(function(res){
									//friend JSON object
									rs.pag.friends.push(res);
								});
							};
							for(var i=0;i<res.length;i++){
								if(res[i].user==rs.user.id){
									rs.pag.friendsWith=true;
								}
							};
							if(rs.user.friendRequests){
								for(var i=0;i<user.friendRequests.length;i++){
									if(user.friendRequests[i]==pag.id){
										rs.pag.request=true;
										break;
									}
								}
							}
							if(!rs.user.requestsSent) rs.user.requestsSent = [];
								for(var i;i<rs.user.requestsSent.length;i++){
									if(rs.user.requestsSent[i]==rs.pag.id){
										rs.pag.request = true;
										break;
									}
								};
							});
						});
					}else if(rs.pag.type=="group"){
						h.get("/group/get?handle="+username).success(function(res){
							if(err) return showErr(res.err);
							console.log(res);
							rs.pag = res;
							rs.pag.type="group";
						});
					}
			});
		}
		scope.search = function(s){
			h.get('/api/search?s='+s).success(function(res){
				if(res.err) return showErr(res.err);
				if(res.length>0){
				rs.options = res;
				}else{rs.options = [{type: 404, name: "Sorry nothing was found"}];}
			});
		};
		rs.search = this;
	}]);
})();
