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
		obj["owner"] = req.session.user.id;
		obj["target"] = target ? target : req.session.user.id;
		obj["tags"] = tags;
		obj["hearts"] = 0;
		obj["objekts"] = [];
		Post.create(obj, function(err, post){
			if(err) return next(err);
			res.json(post);
		});
	},
	objCreate: function(req. res. next){
		var obj = req.params.all();
		obj["owner"] = req.session.user.id;
		Objekt.create(obj, function(err, obj){
			if(err) return next(err);
			res.json(obj);
		})
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

