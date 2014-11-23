(function(){
	var app = angular.module("post", ["ui.router", "ngSanitize"]);
	app.controller("postController", ['$rootScope', '$scope', '$http', '$state', '$sanitize', function(rs, s, h, state, $sanitize){
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
		//get the text of the posts
		if(window.location.pathname.search("/post/show")!=-1){
			var slug = window.location.pathname.split("/")[(window.location.pathname.split("/").length)-1];
        	h.get("/post/get?slug="+ slug).success(function(res){
        	  	if(res.err) return showErr(res.err);
          		for(var i=0;i<res.objekts.length;i++){
          			if(res.objekts[i].type="md"){
          				res.objekts[i].html = markdown.toHTML(res.objekts[i].text);
         	 		}
          		};
          		h.get("/user/get").success(function(res){
          			if(res.err) return showErr(res.err);
          			rs.user = res.user;
          		});
          	 	rs.postt = res;
          	 	rs.pag = "post";
        	});
		};
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
			if((!target||target=="")&&rs.pag) target = rs.pag.id;
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
							h.put("/post/objCreate?text="+temp.objekts[i].text+"&type="+temp.objekts[i].type+"&post="+res[0].id).success(function(res){
								if(res.err) return showErr(res.err);
								showInfo("Post created");
								s.post.temp.objekts[0].text = "";
								rs.posts.unshift(res[0]);
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
			//hides or shows the markdown preview
			if(s.post.temp.objekts[s.post.current].type=="md"){
				$("#preview").show();
			}else{
				$("#preview").hide();
			}
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
		};
		s.post.showEdit = function(){
			$("#text-input").show();
			$("#pCont").css({marginLeft: "5%"});
			$("#editor").show();
			//$("#editor").css({width: "48%", display: "inline-table"});
			$("#preview").css({marginLeft: "85%"});
            new Editor($i("text-input"),$("#preview").find("div")[0]);
		};
		s.post.closeEdit = function(){
			$("#pCont").css({marginLeft: "auto"});
			$("#editor").hide();
			$("#preview").css({marginLeft: "auto"});
		}
		s.post.edit = function(){
			var obj  = rs.postt;
			for(var i=0;i<obj.objekts.length;i++){
				if(obj.objekts[i].html&&obj.objekts[i].html!="") obj.objekts[i].html = "";
				delete obj.objekts[i]["$$hashKey"];
			}
			//var obj = rs.postt.objekts
			socket.post("/post/edit", obj, function(res){
				if(res.err) return showErr(res.err);
				showInfo("Changes saved Successfully");
				$("#text-input")[0].editor.update()
			});
		};
		s.post.destroy = function(id){
			h.post("/post/destroy?post="+id).success(function(res){
				if(res.err) return showErr(res.err);
				for(var i=0;i<rs.posts.length;i++){
					if(rs.posts[i].id==id){
						rs.posts.splice(i, 1);
						break;
					}
				}
			});
		}
	}]);
})();
