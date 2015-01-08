/**
 * PostController
 *
 * @description :: Server-side logic for managing posts
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {
	create: function(req, res, next){
		var obj = {};
		var tags = req.param("tags").split(",");
		var target = req.param("target");
		if(req.param("name")!=undefined||req.param("name")!="") obj["name"]=req.param("name");
		obj["owner"] = req.session.user.id;
		obj["ownerName"] = req.session.user.username;
		obj["target"] = (target&&target!="") ? target : req.session.user.id;
		obj["public"] = (req.param("vis")=="true") ? true : false;
		obj["tags"] = tags;
		obj["hearts"] = 0;
		obj["objekts"] = [];
		//if it is markdown create a slug
		if(obj.name) obj.slug = miscServ.slug(obj.name, req.session.user.username);
		obj.objekts = [];
		objekts = req.param("objekts");
		for(var i=0;i<objekts.length;i++){
			obj.objekts[i] = {
				type: objekts[i].type,
				order: i
			}
			if(objekts[i].text){
				obj.objekts[i].text = objekts[i].text;
			}else if(objekts[i].source){
				obj.objekts[i].source = objekts[i].source;
			}else{
				return res.json({err: "Post cannot be blank"});
			}
		}
		Post.create(obj, function(err, post){
			if(err) return next(err);
			//add a hash of id to the end of slug so you know it is unique
			if(post.slug) post.slug = post.slug+"-"+require("randomstring").generate();
			Post.update({id: post.id}, post, function(err, post){
				if(err) return next(err);
				var n = (post.name==""||!post.name) ? "short" : post.name;
				socketServ.nPost(req.socket, post[0]);
				return res.json(post);
			});
		});
	},
	showcom: function(req, res, next){
		Comment.find({where: {owner: req.param("id")}, limit: 100}, function(err, comm){
			if(err) return next(err);
			if(!comm) return res.json({comments: []});
			return res.json({comments: comm});
		});
	},
	ncomment: function(req, res, next){
		Post.findOne({id: req.param("id")}, function(err, post){
			if(err) return next(err);
			if(!post) return sails.sockets.emit(sails.sockets.id(req.socket), "nComment", {err: "Could not find post"});
			var obj = {
				owner: post.id,
				user: req.session.user.id,
				username: req.session.user.username,
				content: req.param("comment"),
				hearts: 0
			}
			Comment.create(obj, function(err, comment){
				if(err)	 return next(err);
				var i = (post.numComments) ? post.numComments+1 : 1;
				Post.update({id: post.id}, {numComments: i}, function(err, post){
					if(err)	 return next(err);
					return sails.sockets.emit(sails.sockets.id(req.socket), "nComment", comment);
				});
			});
		});
	},
	delcomment: function(req, res, next){
		Comment.findOne({id: req.param("id")}, function(err, comm){
			if(err) return next(err);
			if(!comm) return res.json({err: "Could not find comment"});
			if(comm.user==req.session.user.id||req.session.user.admin){
				Comment.destroy({id: comm.id}, function(err){
					if(err) return next(err);
					Post.findOne({id: comm.owner}, function(err, post){
						if(err) return next(err);
						var i = ((post.numComments-1)<0) ? 0 : (post.numComments-1);
						Post.update({id: post.id}, {numComments: i}, function(err, postt){
							if(err) return next(err);
							return res.json({status: true});
						});
					});
				});
			}
		});
	},
	edit: function(req, res, next){
		var p = req.params.all();
		if(p.owner==req.session.user.id){
			Post.update({id: p.id}, p, function(err, post){
				if(err) return next(err);
				return sails.sockets.emit(sails.sockets.id(req.socket), "pEdit", {status: true});
			});
		}else{
			return sails.sockets.emit(sails.sockets.id(req.socket), "pEdit", {err: "This is not your post..."});
		}
	},
	show: function(req, res, next){
		res.view("post");
	},
	feed: function(req, res, next){
		var s = req.param("start");
		if(!req.param("start")) s = 0;
		Friend.find({owner: req.session.user.id}, function(err, friends){
			if(err) return next(err);
			if(!friends) return res.json({err: "I don't know how to say this nicely but... you don't have any friends :("})
			var q = Post.find({where: {owner: {$in: friends}, limit: 30, skip: s}});
			q.sort({createdAt: -1});
			q.exec(function(err, posts){
				if(err) return next(err);
				if(!posts) return res.json({err: "could not find any posts"});
				res.json(posts);
			});	
		});
	},
	get: function(req, res, next){
		Post.findOne({slug: req.param("slug")}, function(err, post){
			if(err) return next(err);
			if(!post) return res.json({err: "could not find post"});
			return res.json(post);
		});
	},
	userFeed: function(req, res, next){},
	privateFeed: function(req, res, next){
		var s  = (req.param("start")) ? parseInt(req.param("start")) : 0;
		var q = Post.find({where: {target: req.param("user")}, skip: s, limit: 20});
		q.sort({createdAt: -1});
		q.exec(function(err, posts){
			if(err) return next(err);
			if(!posts) return res.json({err: "no posts could be found"});
			res.json({posts: posts});
		});
	},
	publicFeed: function(req, res, next){
		var s  = (req.param("start")) ? parseInt(req.param("start")) : 0;
		var q = Post.find({where: {target: req.param("user"), public: true}, skip: s, limit: 20});
		q.sort({createdAt: -1});
		q.exec(function(err, posts){
			if(err) return next(err);
			if(!posts) return res.json({err: "no posts could be found"});
			res.json({posts: posts});
		});	
	},
	fill: function(req, res, next){
		var q = Objekt.find({owner: req.param("post")});
		q.sort({order: 1});
		q.exec(function(err, obj){
			if(err) return next(err);
			if(!obj) return res.json({err: "could not get post"});
			res.json(obj);
		});
	},
	destroy: function(req, res, next){
		Post.findOne({id: req.param("post")}, function(err, post){
			if(err) return next(err);
			if(!post) return res.json({err: "could not find post"});
			if(post.owner==req.session.user.id){
				Pic.destroy({owner: post.id}, function(err, obj){
					if(err) return next(err);
					Post.destroy({id: post.id}, function(err, post){
						if(err) return next(err);
						socketServ.dPost(req.socket, post[0]);
						res.json({status: true});
					});
				});
			}
		})
	}
};

