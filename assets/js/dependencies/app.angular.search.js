(function(){
	var app = angular.module("search", ['ui.router']);
	app.controller("searchController", ['$http', '$scope', '$rootScope', '$state', function(h, scope, rs, state){
		if(pag!="") {
			rs.pag = pag;
			if(rs.pag.type=="user"){
				h.get("/user/friends?user="+pag.id).success(function(res){
					if(res.err) showErr(res.err);
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
						for(var i=0;i<rs.user.friendRequests.length;i++){
							if(rs.user.friendRequests[i]==rs.user.id){
								rs.pag.request=true;
								break;
							}
						}
					}
					for(var i;i<rs.user.requestsSent.length;i++){
						if(rs.user.requestsSent[i]==rs.pag.id){
							rs.pag.request = true;
							break;
						}
					};
				});
			}
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
