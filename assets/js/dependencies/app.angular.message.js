(function(){
	var app = angular.module("message", ['ui.router']);
	app.controller("messageController", ['$http', '$scope', '$rootScope', '$state', function(h, scope, rs, state){
		scope.conv = function(id){
			h.get("/message/conv?id="+id).success(function(res){
				if(res.err) showErr(res.err);
				scope.mess.conv = res;
			});
		};
	}]);
})();
