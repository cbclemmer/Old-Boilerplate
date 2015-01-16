(function(){
	var app = angular.module("search", ['ui.router']);
	app.controller("searchController", ['$http', '$scope', '$rootScope', '$state', function(h, scope, rs, state){
		if(!scope.as) scope.as = {};
		if(window.location.pathname.search("/show")!=-1) {
			rs.pag = {};
			//determine what dynamic page you are on
			if(window.location.pathname.search("/post/")!=-1) rs.pag.type = "post";
			if(window.location.pathname.search("/api/")!=-1) rs.pag.type = "api";
			//if it is a user or group page
			if(rs.pag.type=="api"){
				var handle = window.location.pathname.split("/")[(window.location.pathname.split("/").length)-1];
				io.socket.get("/api/get?handle="+handle, function(res){
					if(res.err) return showErr(res.err);
					console.log(res);
					rs.user = res.user;
					rs.pag = res.pag;
					h.get("/post/userfeed?user="+rs.pag.id).success(function(res){
						if(res.err) return showErr(res.err);
						rs.posts = res.posts;
					});
				});
			};
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
		scope.asearch = function(s, crit){
			h.get('/api/asearch?s='+s+'&crit='+crit).success(function(res){
				if(res.err) return showErr(res.err);
				rs.results = res;
			});
		};
		scope.as.destroy = function(id){
			h.get('/user/destroy?id='+id).success(function(res){
				if(res.err)	 return showErr(res.err);
				showInfo("User: "+id+" deleted successfully");
				for(var i=0;i<rs.results.length;i++){
					if(rs.results[i].id==id){
						rs.results.splice(i, 1);
						break;
					}
				}
			});
		};
		scope.mSearch = function(s){
			h.get('/api/mSearch?s='+s).success(function(res){
				if(res.err) return showErr(res.err);
				console.log(res);
				rs.mOptions = res.results;
			});
		}
	}]);
})();
