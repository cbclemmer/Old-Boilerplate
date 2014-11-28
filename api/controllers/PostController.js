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
			if(post.slug) post.slug = post.slug+"-"+post.id;
			Post.update({id: post.id}, post, function(err, post){
				if(err) return next(err);
				var n = (post.name==""||!post.name) ? "short" : post.name;
				socketServ.post(req.socket, post);
				miscServ.cAction(post.owner, "post", n, post.public, function(act){
					//sails.sockets.blast("message", {message: "post created by someone"}, req.socket);
					return res.json(post);
				});
			});
		});
	},
	edit: function(req, res, next){
		var p = req.params.all();
		if(p.owner==req.session.user.id){
			Post.update({id: p.id}, p, function(err, post){
				if(err) return next(err);
				return res.json({status: true});
			});
		}else{
			return res.json({err: "This is not your post..."});
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
						res.json({status: true});
					});
				});
			}
		})
	}
};

