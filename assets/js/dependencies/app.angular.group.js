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
		};
		s.group.getAdmin = function(handle){
			$http.get("/group/getAdmin?handle="+handle).success(function(res){
				if(res.err) return showErr(res.err);
				rs.gAdmins = res;
			})
		};
		s.group.rAdmin = function(u, g){
			$http.get("/group/rAdmin?u="+u+"&g="+g).success(function(res){
				if(res.err) return showErr(res.err);
				for(i=0;i<rs.gAdmins.length;i++){
					if(rs.gAdmins[i]==u){
						rs.gAdmins.splice(i, 1);
						showInfo("@"+u+" is no longer an admin for "+g);
					}
				}
			})
		}
		s.group.addAdmin = function(un, g){
			$http.get("/group/addAdmin?u="+un+"&g="+g).success(function(res){
				s.group.aUsername="";
				if(res.err) return showErr(res.err);
				rs.gAdmins.push(un);
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
		}
	}]);
})();
