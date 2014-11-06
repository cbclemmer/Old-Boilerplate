/**
 * UserController
 *
 * @description :: Server-side logic for managing users
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {
		//all asynchronous, no page loads ftw
		create: function(req, res, next){
			//make sure that the email is not already taken
			User.findOne({email: req.param('email')}, function(err, user){
				if(err) return next(err);
				if(!user){
					//make sure that the username is not already taken
					User.findOne({username: req.param('username')}, function(err, user){
						if(err) return next(err);
						if(!user){
							User.create(req.params.all(), function(err, user){
								if(err) return res.json({'err': err});
								user["password"] = "";
								res.json({status: true, user: user});
							});	
						}else{
							return res.json({status: false, reason: "username"});
						}
					});
				}else{
					return res.json({status: false, reason: "email"});
				}
			});
		},
		show: function(req, res, next){
			if(req.param("id")!=undefined){
				User.findOne(req.param("id"), function(err, user){
					user["password"]= "";
					user["createdAt"]="";
					user["updatedAt"]="";
					res.view("user/show", {user: user, cUser: req.session.user});
				});
			}else{
				res.view("user/show", {user: req.session.user, cUser: req.session.user});
			}
		},
		//get current user
		get: function(req, res, next){
			if(req.session.auth) return res.json({'status': true, 'user': req.session.user});
			else return res.json({"status": false});
		},
		getOne: function(req, res, next){
			User.findOne({id: req.param('user')}, function(err, user){
				if(err) return next(err);
				if(!user) return console.log("Could not find user(getOne: "+req.param('user')+")");
				user['password']="";
				user['createdAt']="";
				user['updatedAt']="";
				res.json(user);
			});
		},
		private: function(req, res, next){
			User.findOne({id: req.session.user.id}, function(err, user){
				if(err) return next(err);
				if(!user) return console.log("Could not find user(Private");
				user.private= req.param("p");
				req.session.user.private = req.param("p");
				User.update(user.id, user, function(err, user){
					if(err) return next(err);
					res.json({status: true, p: user[0].private});
				});
			});
		},
		//friends segment
		friends: function(req,res, next){
			Friend.find({where: {owner: req.param('user')}, limit: 100}, function(err, friends){
				if(err) return next(err);
				if(!friends) return res.json({err: "No friends"});
				res.json(friends);
			})
		},
		addFriend: function(req, res, next){
			User.findOne({id: req.session.user.id}, function(err, user){
				if(err) return next(err);
				if(!user) return console.log("Could not find user");
				for(var i=0;i<user.friendRequests.length;i++){
					if(user.friendRequests[i]==req.param("request")){
						var id = user.id.toString();
						Friend.create({user: id, owner: req.param("request")}, function(err, f){
							if(err) return next(err);
							Friend.create({user: req.param("request"), owner: id}, function(err, f){
								if(err) return next(err);
							});
						});
						user.friendRequests.splice(i, 1);
						break;
					}
				};
				User.update(user.id, user, function(err, user){
					if(err) return res.json({err: err});
					User.findOne({id: req.param("request")}, function(err, user){
						if(err) return next(err);
						for(var i=0;i<user.requestsSent.length;i++){
							user.requestsSent.splice(i,1);
							break;
						}
						User.update(user.id, user, function(err, user){
							if(err) return next(err);
							res.json(true);
						});
					});
					res.json(true);
				});
			});
		},
		rFriend: function(req, res, next){
			Friend.findOne({owner: req.param('user'), user: req.session.user.id}, function(err, friend){
				if(err) return next(err);
				if(!friend){
					console.log("Cannot find record for owner: "+req.param('user')+" and user: "+req.session.user.id);
					return res.json("Something has gone terribly wrong");
				}
				Friend.destroy(friend.id, function(err){
					if(err) return next(err);
					Friend.findOne({owner: req.session.user.id, user: req.param('user')}, function(err, friend){
						if(err) return next(err);
						if(!friend){
							console.log("Cannot find record for owner: "+req.param('user')+" and user: "+req.session.user.id);
							return res.json("Something has gone terribly wrong");
						}
						Friend.destroy(friend.id, function(err){
							if(err) return next(err);
							return res.json({status: true});
						});
					})
				})
			});
		},
		addFriendRequest: function(req, res, next){
			//friend requests are all IDs
			User.findOne({id: req.param('friend')}, function(err, user){
				if(err) return next(err);
				if(!user) return console.log("user not found");
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
						User.findOne({id: req.session.user.id}, function(err, user){
							if(!user.requestsSent) user.requestsSent = [];
							user.requestsSent.push(req.param('friend'));
							User.update(user.id, user, function(err){
								if(err) return next(err);
								res.json(true);
							})
						});
					});
				}else{
					return res.json(false);
				}
			});
		},
		deleteRequest: function(req, res, next){
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
					User.findOne({id: req.param("request")}, function(err, user){
						if(err) return next(err);
						if(!user) return console.log("could not find user: "+req.session.user.id);
						for(var i=0;i<user.requestsSent.length;i++){
							user.requestsSent.splice(i,1);
							break;
						}
						User.update(user.id, user, function(err, user){
							if(err) return next(err);
							res.json(true);
						});
					});
				});
			});
			}
		},
		//End friend sgement
		edit: function(req, res, next){
			if(req.param("type")=="cp"){
				User.findOne({id: req.session.user.id}, function(err, user){
					if(err) return next(err);
					if(!user) return console.log("Could not find user: "+req.session.user.id);
					var bcrypt = require('bcrypt');
					bcrypt.compare(req.param('cp'), user.password, function(err, obj){
						if(obj){
							bcrypt.hash(req.param("np"), 10, function(err, hash){
								if(err) return cb(err);
								user.password=hash;
								User.update(user.id, user, function(err, user){
									if(err) return next(err);
									if(!user) return console.log("Could not update");
									return res.json({status: true});
								});
							});
						}else{return res.json({status: false, reason: "Wrong password"});}
					});
				});
			}else{
				/*User.edit(req.params.all(), function(err, user){
				if(err) return res.json({'err': err});
				return res.json(user);
				});*/
			}
		},
		destroy: function(req, res, next){
			User.destroy(req.param('id'), function(err, user){
				if(err) return res.json({'err': err, 'status': false});
				res.json({'status': true});
			});
		},
};