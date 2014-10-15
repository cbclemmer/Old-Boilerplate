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
		getOne: function(req, res, next){
			User.findOne({id: req.param('user')}, function(err, user){
				if(err) return next(err);
				user['password']="";
				user['createdAt']="";
				user['updatedAt']="";
				res.json(user);
			});
		},
		//friends segment
		friends: function(req,res, next){
			var q = User.find({user: req.session.user}).populate("friends");
			q.exec(function(err, user){
				if(err) return res.json({err: err});
				console.log(user);
				res.json(user.friends);
			});
		},
		addFriend: function(req, res, next){
			User.findOne({id: req.session.user.id}, function(err, user){
				if(err) return next(err);
				if(!user) return console.log("Could not find user");
				console.log(user);
				for(var i=0;i<user.friendRequests.length;i++){
					if(user.friendRequests[i]==req.param("request")){
						console.log("match found");
						
						if(!user.friends) user.friends = [];
						user.friends.add(user.friendRequests[i]);
						user.friendRequests.splice(i, 1);
						break;
					}
				};
				console.log(user);
				User.update(user.id, user, function(err, user){
					if(err) return res.json({err: err});
					res.json(true);
				});
			});
		},
		addFriendRequest: function(req, res, next){
			console.log("adding friend request");
			//friend requests are all IDs
			console.log(req.param('friend'));
			User.findOne({id: req.param('friend')}, function(err, user){
				if(err) return next(err);
				if(!user) return console.log("user not found");
				//console.log(user);
				if(!user.friendRequests) user.friendRequests = [];
				//search for duplicates
				var dup = false;
				for(var i=0;i<user.friendRequests.length;i++){
					if(user.friendRequests[i]==req.session.user.id) return dup = true;
				}
				//if there isn't already a request active
				if(!dup){
					user.friendRequests.push(req.session.user.id);
					User.update(user.id, user, function(err, user){
					if(err){
						console.log(err);
						return res.json({err: err});
					}
					res.json(true);	
				});
				}else{
					return res.json(false);
				}
			});
		},
		deleteRequest: function(req, res, next){
			console.log("deleting request");
			if(req.session.user){
			User.findOne({id: req.session.user.id}, function(err, user){
				if(err) return next(err);
				if(!user) return console.log("Could not find user(deleteRequest)");
				for(var i=0;i<user.friendRequests.length;i++){
					if(user.friendRequests[i]==req.param("request")){
						user.friendRequests.splice(i, 1);
						break;
					}
				};
				User.update(user.id, user, function(err, user){
					if(err) return res.json({err: err});
					res.json(true);
				});
			});
			}
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