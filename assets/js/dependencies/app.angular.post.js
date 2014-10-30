(function(){
	var app = angular.module("post", ["ui.router"]);
	app.controller("postController", ['$rootScope', '$scope', '$http', '$state', function(rs, s, h, state){
		//the post increment for pagination
		s.postInc = 0
		//get posts for the feed
		h.get("/post/feed?i="+s.postInc).success(function(res){
			if(res.err) return showErr(res.err);
			rs.posts = res;
		});
	}]);
})();
