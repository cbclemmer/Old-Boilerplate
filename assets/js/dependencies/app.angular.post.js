(function(){
	var app = angular.module("post", ["ui.router", "ngSanitize", 'ngSails', "angularFileUpload"]);
	app.controller("postController", ['$rootScope', '$scope', '$http', '$state', '$sanitize', '$upload', "$sails", function(rs, s, h, state, $sanitize,$upload, $sails){
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
		//if a new post is made then add to the list
		$sails.on("nPost", function(data){
			rs.posts.unshift(data);
			$("#pUser").val("");
		});
		$sails.on("dPost", function(data){
			for(var i=0;i<rs.posts.length;i++){
				if(rs.posts[i].id==data.id){
					rs.posts.splice(i, 1);
					break;
				}
			}
		});
		//get the text of the posts
		if(window.location.pathname.search("/post/show")!=-1){
			var slug = window.location.pathname.split("/")[(window.location.pathname.split("/").length)-1];
        	h.get("/post/get?slug="+ slug).success(function(res){
        	  	if(res.err) return showErr(res.err);
          		for(var i=0;i<res.objekts.length;i++){
          			if(res.objekts[i].type=="md"){
          				res.objekts[i].html = markdown.toHTML(res.objekts[i].text);
         	 		}else if(res.objekts[i].type=="pic"){
         	 			res.objekts[i].html = "<img src='/pic/getOne/"+res.objekts[i].source+"'><br>"
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
			//if the text is not blank
			if((temp.objekts[0].text&&temp.objekts[0].text.length>0)||(temp.objekts[0].source&&temp.objekts[0].source.length>0)){
				var tags = "";
				//get the tags
				for(var i=0;i<s.post.tags.length;i++){
					tags+=s.post.tags[i]+",";
				}
				var obj = {
					tags: tags,
					target: target,
					vis: temp.vis,
					objekts: temp.objekts
				}
				if(temp.an) obj["name"] = temp.name;
				io.socket.post("/post/create", obj, function(res){
					if(res.err) return showErr(res.err);
					showInfo("Post created");
				});
				s.post.temp.objekts = [];
				s.post.temp.objekts[0] = {};
				s.post.temp.objekts[0].type = "short";
				s.post.temp.objekts[0].text = "";
				//rs.posts.unshift(res[0].name);
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
				s.post.temp.objekts[s.post.current+1].type = "md";
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
				if(s.post.temp.objekts[i].type=="md"||s.post.temp.objekts[i].type=="pic"){
					c = true;
				}
			}
			if(c){
				s.post.temp.an = true;	
			}else{
				s.post.temp.an = false;	
			}
		};
		s.onFileSelect = function($files) {
    		//$files: an array of files selected, each file has name, size, and type.
    		console.log($files);
    		for (var i = 0; i < $files.length; i++) {
      			var file = $files[i];
      			s.upload = $upload.upload({
        			url: '/pic/upload', 
        			data: {
        					name: (s.post.picName||s.post.temp.name+"_"+i),
        					public: s.post.temp.vis
        					},
        			file: file, 
      			}).progress(function(evt) {
        			//console.log('percent: ' + parseInt(100.0 * evt.loaded / evt.total));
      			}).success(function(data, status, headers, config) {
      				console.log(data);
      				data = data.slice(1,(data.length-1));
      				s.post.temp.objekts[s.post.current].source = data;
    	  		});
    		}
  		};
		s.post.showEdit = function(){
			$("#text-input").show();
			$("#pCont").css({marginLeft: "5%"});
			$("#editor").show();
			//$("#editor").css({width: "48%", display: "inline-table"});
			$("#preview").css({marginLeft: "50%"});
            rs.editor = new Editor($i("text-input"),$("#preview").find("div")[0]);
		};
		s.post.closeEdit = function(){
			$("#pCont").css({marginLeft: "10%"});
			$("#editor").hide();
			$("#preview").css({marginLeft: "auto"});
		}
		//change which part you are editing
		s.post.cEdit = function(order){
			s.post.current  = order;
			$("#text-input")[0].editor.change($i("text-input"),$("#preview").find("div")[order]);
		}
		s.post.edit = function(){
			var obj  = rs.postt;
			for(var i=0;i<obj.objekts.length;i++){
				if(obj.objekts[i].html&&obj.objekts[i].html!="") obj.objekts[i].html = "";
				delete obj.objekts[i]["$$hashKey"];
			}
			//var obj = rs.postt.objekts
			$sails.post("/post/edit", obj);
		};
		$sails.on("pEdit", function(res){
		    if(res.err) return showErr(res.err);
			showInfo("Changes saved Successfully");
			for(var i=0;i<rs.postt.objekts.length;i++){
				$("#preview").find("div")[i].innerHTML = markdown.toHTML(rs.postt.objekts[i].text);
			}
		});
		s.post.destroy = function(id){
			h.post("/post/destroy?post="+id).success(function(res){
				if(res.err) return showErr(res.err);
			});
		};
	}]);
})();
