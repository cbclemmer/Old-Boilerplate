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
		},
		scope.s.getPage = function(obj){
			state.go("user");
			rs.page = obj;
			if(obj.type=="user"){
				rs.page.request=false;
				rs.page.friendsWith=false;
				h.get("/user/friends").success(function(res){
					if(res.err) return showErr(res.err);
					console.log(res);
					if(rs.user){
						rs.page.friends = res;
						for(var i=0;i<res.length;i++){
							if(res[i].user==rs.page.id){
								rs.page.friendsWith=true;
							}else{rs.page.friendsWith=false;}
						}
					}
					for(var i=0;i<rs.user.friendRequests.length;i++){
						if(rs.user.friendRequests[i]==rs.user.id){
							return rs.page.request=true;
						}
					}
				});
			}
		}
		rs.search = this;
	}]);
})();