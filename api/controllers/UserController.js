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
				console.log(user);
				res.json(user.friends);
			});
		},
		getFriendRequests: function(req, res, next){
			//the requests variable that is returned
			var requests = [];
			//temporary object for holding things
			var obj;
			User.findOne(req.session.user.id, function(err, user){
				if(err) return res.json(err);
				if(user.friendRequests){
				user.friendRequests.forEach(function(request){
					User.findOne(request, function(err, user){
						if(err) return res.json(err);
						obj.name = user.name;
						obj.email = user.email;
						obj.id = user.id;
						requests.push(obj);
					});
				});
				}
				res.json(requests);
			});
		},
		addFriend: function(req, res, next){
			var user = req.session.user;
			console.log("friends: " + user.friends);
			//friends are stored through the email address
			user.friends.push(req.param('email'));
			User.update(user.id, user, function(err, user){
				if(err) return res.json(err);
				res.json({status: true});
			});
		},
		addFriendRequest: function(req, res, next){
			var user = req.session.user;
			//friend requests are all IDs
			user.friendRequests.push(req.param('friend'));
			User.update(user.id, user, function(err, user){
				if(err) return res.json({err: err});
				res.json(true);
			});
		},
		deletefriendRequest: function(req, res, next){
			var user = req.session.user;
			for(var i=0;i<user.friendRequests.length;i++){
				if(user.friendRequests[i]==user){
					user.friendRequests.splice(i, 1);
				}
			};
			User.update(user.id, user, function(err, user){
				if(err) return res.json({err: err});
				res.json(true);
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

