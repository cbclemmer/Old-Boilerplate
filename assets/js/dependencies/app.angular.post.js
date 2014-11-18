(function(){
	var app = angular.module("post", ["ui.router"]);
	app.controller("postController", ['$rootScope', '$scope', '$http', '$state', function(rs, s, h, state){
		var socket  = io.connect();
		//the post increment for pagination
		if(!rs.user) rs.user = {};
		s.post.temp = {};
		s.post.temp.objekts = [];
		s.post.temp.objekts[0] = {};
		s.post.temp.objekts[0].type = "short";
		if(!rs.user.dPublic) rs.user.dPublic = false;
		s.post.temp.vis = rs.user.dPublic.toString();
		s.post.current = 0;
		rs.posts = [];
		s.post.tags = [];
		s.postInc = 0;
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
				$rootScope.posts  = ($rootScope.posts) ? $rootScope.posts.concat(res.posts) : res.posts;
			});
		};
		s.post.create = function(target){
			var temp = s.post.temp;
			if(temp.objekts[0].text.length>0||temp.objekts[0].source.length>0){
				var tags = "";
				for(var i=0;i<s.post.tags.length;i++){
					tags+=s.post.tags[i]+",";
				}
				var obj = {
					tags: tags,
					target: target,
					vis: temp.vis
				}
				if(temp.an) obj["name"] = temp.name;
				socket.post("/post/create", obj, function(res){
					if(res.err) return showErr(res.err);
					for(var i=0;i<temp.objekts.length;i++){
						//temp.objekts[i].text = temp.objekts[i].text.replace(/(\r\n|\n|\r)/gm,"");
						if(temp.objekts[i].type=="short"){
							h.put("/post/objCreate?text="+temp.objekts[i].text+"&type="+temp.objekts[i].type+"&post="+res.id).success(function(res){
								if(res.err) return showErr(res.err);
								showInfo("Post created");
								s.post.temp.objekts[0].text = "";
								rs.posts.unshift(res[0]);
								console.log(rs.posts);
							});
							break;
						}
						if(temp.objekts[i].type=="md"){
							socket.post("/post/objCreate", {
								text: temp.objekts[i].text,
								type: temp.objekts[i].type,
								order: i,
								post: res[0].id
							}, function(res){
								if(res.err) return showErr(res.err);
								showInfo("Post created");
								s.post.temp.objekts = [];
								s.post.temp.objekts[0] = {};
								s.post.temp.objekts[0].type = "short";
								rs.posts.unshift(res[0].name);
							});
							break;
						}
					}
				});
			}else{showErr("Please add content to post");}
		};
		s.post.lastObj = function(){
			if(s.post.current!=0){
				if(!s.post.temp.objekts[s.post.current].text&&!s.post.temp.objekts[s.post.current].source) {
					s.post.temp.objekts.splice(s.post.current, 1);
				}else{showErr("Must add text or source to current part");}
				s.post.current--;
			}
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
		};
		//determines whether you should have a name for your post by seeing if one of them is markdown
		s.post.an = function(){
			var c = false;
			for(var i=0;i<s.post.temp.objekts.length;i++){
				if(s.post.temp.objekts[i].type=="md"){
					c = true;
				}
			}
			if(c){
				s.post.temp.an = true;	
			}else{
				s.post.temp.an = false;	
			}
		}
	}]);
})();
