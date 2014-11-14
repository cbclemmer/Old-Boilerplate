(function(){
	var app = angular.module("group", []);
		app.controller("groupController", ['$http', '$scope', '$rootScope', function($http, s, rs){
			for(var i=0;i<user.groups.length;i++){
				if(user.groups[i]==pag.id){
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
