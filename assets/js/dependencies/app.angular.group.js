(function(){
	var app = angular.module("group", []);
		app.controller("groupController", ['$http', '$scope', '$rootScope', function($http, s, rs){
			s.group.join = function(){
				$http.get("/group/join?group="+pag.id).success(function(res){
					if(res.err) return showErr(res.err);
					showInfo("Joined group: "+pag.name);
					pag.joined=true;
				});
			}
	}]);
})();