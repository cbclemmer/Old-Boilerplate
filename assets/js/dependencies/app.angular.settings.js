(function(){
	var app = angular.module("settings", []);
	app.controller("settingsController", ['$http', '$state', '$scope', '$rootScope', function(h, state, s, rs){
		rs.set = {};
		rs.set.rp = rs.user.randomPost.toString();
		//changes whether someone that is not your friend can post to your wall
		s.settings.crPost = function(s){
			h.get("/sett/crPost?s="+s).success(function(res){
				if(res.err) return showErr(res.err);
				//rs.set.rp = res.rp;
			});
		}
	}]);
})();