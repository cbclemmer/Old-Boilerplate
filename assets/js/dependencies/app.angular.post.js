(function(){
	var app = angular.module("post", ["ui.router"]);
	app.controller("postController", ['$rootScope', '$scope', '$http', '$state', function(rs, s, h, state){
		//the post increment for pagination
		s.postInc = 0;
		s.post.temp = {};
		s.post.current;
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
		s.post.selfCreate = function(){
			var tags = "";
			var temp = s.post.temp;
			for(var i=0;i<temp.tags.length;i++){
				tags+=temp.tags[i]+",";
			}
			h.put("/post/create?tags="+tags).success(function(res){
				if(res.err) return showErr(res.err);
				for(var i=0;i<temp.objekts.length;i++){
					if(temp.objekts[i].type=="short"){
						h.put("/post/objCreate?text="+temp.objekts[i].text+"&type="+temp.objekts[i].type).success(function(res){
							if(res.err) return showErr(res.err);
							showInfo("Post created");
						});
						break;
					}
				}
			});
		};
		s.post.addObjekt = function(){

		};
		s.post.addTag = function(){
			s.post.tags.push(s.post.tag);
			s.post.tag = "";
		}
	}]);
})();