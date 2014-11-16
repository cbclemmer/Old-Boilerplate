(function(){
	var app = angular.module("group", []);
		app.controller("groupController", ['$http', '$scope', '$rootScope', function($http, s, rs){
		if(user){
			for(var i=0;i<user.groups.length;i++){
				if(user.groups[i]==pag.handle){
					pag.joined=true;
				}
			}
			if(pag!=""&&pag.members){
				//member JSON
				pag.mJSON = [];
				for(var i=0;i<pag.members.length;i++){
					$http.get("/user/getOne?user="+pag.members[i]).success(function(res){
						pag.mJSON.push(res);
					});
				};
			};
			$http.get("/group/getRequest?g="+pag.handle).success(function(res){
				if(res.err) return showErr(res.err);
				pag.request = res.status;
			});
		};
		s.group.get = function(g){
			$http.get("/group/get?handle="+g).success(function(res){
				if(res.err) return showErr(res.err);
				rs.groupJSON = res;
			});
		};
		s.group.getAdmin = function(handle){
			$http.get("/group/getAdmin?handle="+handle).success(function(res){
				if(res.err) return showErr(res.err);
				rs.groupJSON.gAdmins = res;
			});
		};
		s.group.rAdmin = function(u, g){
			$http.get("/group/rAdmin?u="+u+"&g="+g).success(function(res){
				if(res.err) return showErr(res.err);
				for(i=0;i<rs.groupJSON.admin.length;i++){
					if(rs.groupJSON.admin[i]==u){
						rs.groupJSON.admin.splice(i, 1);
						showInfo("@"+u+" is no longer an admin for "+g);
					}
				}
			})
		}
		s.group.addAdmin = function(un, g){
			$http.get("/group/addAdmin?u="+un+"&g="+g).success(function(res){
				s.group.aUsername="";
				if(res.err) return showErr(res.err);
				rs.groupJSON.admin.push(un);
				showInfo("@"+un+" added as admin to "+g);
			});
		};
		s.group.join = function(){
			$http.get("/group/join?group="+pag.id).success(function(res){
				if(res.err) return showErr(res.err);
				showInfo("Joined group: "+pag.name);
				pag.joined=true;
				pag.mJSON.push(user);
			});
		};
		s.group.cPrivacy = function(t, g){
			$http.get("/group/cPrivacy?t="+t+"&g="+g).success(function(res){
				if(res.err) return showErr(res.err);
				showInfo(rs.groupJSON.handle+" changed to "+t);
			});
		};
		//this is for semiprivate groups that use a friend reaquest like system
		s.group.ask = function(g){
			$http.get("/group/addRequest?g="+g).success(function(res){
				if(res.err) return showErr(res.err);
				pag.request=true;
				showInfo("Added in");
			})
		};
		s.group.jAdmin = function(g, u){
			$http.get("/group/jAdmin?g="+g+"&u="+u).success(function(res){
				if(res.err) return showErr(res.err);
				for(var i=0;i<groupJSON.requests.length;i++){
					if(groupJSON.requests[i]==u){
						groupJSON.requests.splice(i,1);
					}
				}
				showInfo("@"+u+" was addded to "+g);
			})
		};
		s.group.leave = function(g){
			$http.get("/group/leave?g="+g).success(function(res){
				if(res.err) return showErr(res.err);
				pag.joined = false;
			});
		}
	}]);
})();
