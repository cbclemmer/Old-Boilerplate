(function(){
	var app = angular.module("post", ["ui.router"]);
	app.controller("postController", ['$rootScope', '$scope', '$http', '$state', function(rs, s, h, state){
		//the post increment for pagination
		s.postInc = 0;
		s.post.temp = {};
		s.post.temp.objekts = [];
		s.post.temp.objekts[0] = {};
		s.post.temp.objekts[0].type = "short";
		s.post.current = 0;
		s.post.tags = [];
		rs.posts = [];
		if(pag){
			h.get("/post/userFeed?start=0&user="+pag.id).success(function(res){
				if(res.err) return showErr(res.err);
				rs.posts = res.posts;
			});
		}
		s.post.feed = function(){
			h.get("/post/feed?start="+s.postInc).success(function(res){
				if(res.err) return showErr(res.err);
				rs.posts.push(res);
			});
		};
		s.post.userFeed = function(user, start){
			start = (start==""||!start) ? 0 : start;
			h.get("/post/userFeed?start="+start+"&user="+user).success(function(res){
				if(res.err) return showErr(res.err);
				$rootScope.posts  = ($rootScope.posts) ? $rootScope.p0osts.concat(res.posts) : res.posts;
			});
		};
		s.post.create = function(target){
			var temp = s.post.temp;
			if(temp.objekts[0].text.length>0||temp.objekts[0].source.length>0){
				var tags = "";
				for(var i=0;i<s.post.tags.length;i++){
					tags+=s.post.tags[i]+",";
				}
				h.put("/post/create?tags="+tags+"&target="+target).success(function(res){
					if(res.err) return showErr(res.err);
					for(var i=0;i<temp.objekts.length;i++){
						if(temp.objekts[i].type=="short"){
							h.put("/post/objCreate?text="+temp.objekts[i].text+"&type="+temp.objekts[i].type+"&post="+res.id).success(function(res){
								if(res.err) return showErr(res.err);
								showInfo("Post created");
							});
							break;
						}
					}
				});
			}else{showErr("Please add content to post");}
		};
		s.post.lastObj = function(){
			if(!s.post.temp.objekts[s.post.current].text&&!s.post.temp.objekts[s.post.current].source) {
				s.post.temp.objekts.splice(s.post.current, 1);
			}else{showErr("Must add text or source to current part");}
			s.post.current--;
		};
		s.post.addObj = function(){
			if((s.post.temp.objekts[s.post.current].text||s.post.temp.objekts[s.post.current].source)&&s.post.temp.objekts[s.post.current].type!="short"){
				s.post.temp.objekts[s.post.current+1] = {};
				s.post.temp.objekts[s.post.current+1].type = "short";
				s.post.current++;
			}else{
				showErr("Must add text or source to current part");
			}
		};
		s.post.addTag = function(){
			s.post.tags.push(s.post.tag);
			s.post.tag = "";
		}
	}]);
})();