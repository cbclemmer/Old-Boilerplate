(function(){
	var app = angular.module("search", ['ui.router']);
	app.controller("searchController", ['$http', '$scope', '$rootScope', '$state', function(h, scope, rs, state){
		scope.search = function(s){
			h.get('/api/search?s='+s).success(function(res){
				if(res.err) return showErr(res.err);
				if(res.length>0){
				rs.options = res;
				}else{rs.options = [{type: 404, name: "Sorry nothing was found"}];}
			});
		};
		scope.s.getPage = function(obj){
			rs.pag  = obj;
			rs.pag.request=false;
			rs.pag.friendsWith=false;
			h.get("/user/friends?user="+obj.id).success(function(res){
				if(res.err) return showErr(res.err);
				if(rs.user){
					rs.pag.f = res;
					rs.pag.friends = [];
					for(var i=0;i<rs.pag.f.length;i++){	
						h.get("/user/getOne?user="+rs.pag.f[i].user).success(function(res){
							//friend JSON object
							rs.pag.friends.push(res);
						});
					};
					for(var i=0;i<res.length;i++){
						if(res[i].user==rs.user.id){
							rs.pag.friendsWith=true;
						}
					}
				}
				for(var i=0;i<rs.user.friendRequests.length;i++){
					if(rs.user.friendRequests[i]==rs.user.id){
						return rs.pag.request=true;
					}
				}
				state.go("user");
			});
		}
		rs.search = this;
	}]);
})();