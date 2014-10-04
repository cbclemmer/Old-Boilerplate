/**
 * UserController
 *
 * @description :: Server-side logic for managing users
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {
		//all asynchronous, no page loads ftw
		create: function(req, res, next){
			User.create(req.params.all(), function(err, user){
				if(err) return res.json({'err': err});
				res.json(user);
			});	
		},
		//get current user
		get: function(req, res, next){
			console.log("get");
			if(req.session.auth) return res.json({'status': true, 'user': req.session.user});
			else return res.json({"status": false});
		},
		//friends segment
		friends: function(req,res, next){
			var q = User.find({user: req.session.user}).populate("friends", {limit: 10, sort: {name: 1}});
			q.exec(function(err, user){
				if(err) return res.json({err: err});
				res.json(user.friends);
			});
		},
		addFriend: function(req, res, next){
			var user = req.session.user;
			console.log("friends: " + user.friends);
			user.friends.push(req.param('email'));
			User.update(user.id, session.user, function(err, user){
				if(err) return res.json(err);
				res.json({status: true});
			});
		},
		//End friend sgement
		edit: function(req, res, next){
			User.edit(req.params.all(), function(err, user){
				if(err) return res.json({'err': err});
				return res.json(user);
			});
		},
		destroy: function(req, res, next){
			User.destroy(req.param('id'), function(err, user){
				if(err) return res.json({'err': err, 'status': false});
				res.json({'status': true});
			});
		},
};

