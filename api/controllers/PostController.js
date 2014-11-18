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
		if(obj.name){
			var n = obj.name;
			n = n.replace(/^\s+|\s+$/g, ''); // trim
			n = n.toLowerCase();
  
  			// remove accents, swap ñ for n, etc
  			var from = "àáäâèéëêìíïîòóöôùúüûñç·/_,:;";
  			var to   = "aaaaeeeeiiiioooouuuunc------";
  			for (var i=0, l=from.length ; i<l ; i++) {
    			n = n.replace(new RegExp(from.charAt(i), 'g'), to.charAt(i));
  			}

  			n = n.replace(/[^a-z0-9 -]/g, '') // remove invalid chars
    		.replace(/\s+/g, '-') // collapse whitespace and replace by -
    		.replace(/-+/g, '-'); // collapse dashes
    		var bcrypt = require('bcrypt');
    		n = req.session.user.username+"-"+n;
    		obj.slug = n;
		}
		Post.create(obj, function(err, post){
			if(err) return next(err);
			//add a hash of id to the end of slug so you know it is unique
			post.slug = post.slug+"-"+post.slug.hashCode();
			Post.update({id: post.id}, post, function(err, post){
				if(err) return next(err);
				res.json(post);
			})
		});
	},
	objCreate: function(req, res, next){
		var obj = {
			owner: req.param("post"),
			type: req.param("type"),
			text: req.param("text"),
		};
		if(obj.type=="short"){
			obj["order"] = 0;
			if(!(obj.text.length>139)){
				Objekt.create(obj, function(err, obj){
					if(err) return next(err);
					Post.findOne({id: req.param("post")}, function(err, post){
						if(err) return next(err);
						if(!post) return res.json({err: "Could not find(objCreate)"});
						post.objekts.push(obj);
						Post.update({id: post.id}, post, function(err, post){
							if(err) return next(err);
							if(!post) return res.json({err: "Could not update(objCreate)"});
							return res.json(post);
						});
					});
				});	
			}else{
				Post.destroy({id: obj.owner}, function(err){
					if(err) return next(err);
					return res.json({err: "Post must be under 140 characters"});
				});
			}
		};
		if(obj.type=="md"){
			obj["order"] = req.param("order");
			Objekt.create(obj, function(err, obj){
				if(err) return next(err);
				Post.findOne({id: obj.owner}, function(err, post){
					if(err) return next(err);
					if(!post) return res.json("Could not find post");
					post.objekts.push(obj);
					Post.update({id: post.id}, post, function(err, post){
						if(err) return next(err);
						res.json(post);
					})
				});
			});
		}
	},
	show: function(req, res, next){
		Post.findOne({slug: req.param("id")}, function(err, post){
			if(err) return next(err);
			if(!post) return res.view("404");
			/*var markdown = require("markdown").markdown;
			for(var i=0;i<post.objekts.length;i++){
				if(post.objekts[i].type=="md"){
					post.objekts[i].text = markdown.toHTML(post.objekts[i].text);
					console.log(post.objekts[i].text);
				}
			}*/
			res.view("post", {post: post, cUser: req.session.user});
		});
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
	}
};

