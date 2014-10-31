(function(){
	var app = angular.module("post", ["ui.router"]);
	app.controller("postController", ['$rootScope', '$scope', '$http', '$state', function(rs, s, h, state){
		//the post increment for pagination
		s.postInc = 0;
		s.post.temp = {};
		s.post.temp.tags = [];
		rs.posts = [];
		//get posts for the feed
		h.get("/post/feed?start="+s.postInc).success(function(res){
			if(res.err) return showErr(res.err);
			rs.posts.push(res);
		});
		//pagination
		s.post.feed = function(){
			h.get("post/feed?start="+s.postInc).success(function(res){
				if(res.err) return showErr(res.err);
				rs.posts.push(res);
			});
		};
		s.post.create = function(){
			h.put("/post/create").success(function(res){
				if(res.err) return showErr(res.err);
			});
		};
		s.post.addTag = function(){
			s.post.temp.tags.push(s.post.temp.tag);
			s.post.temp.tag = "";
		}
	}]);
})();