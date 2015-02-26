/**
 * UserController
 *
 * @description :: Server-side logic for managing users
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {
		//all asynchronous, no page loads ftw
		create: function(req, res, next){
			var email = req.param("email");
			if(email.search(" ")!=-1) return res.json({err: "email has spaces"});
			if(req.param("username").search(" ")!=-1) return res.json({err: "username has spaces"});
			email = email.toLowerCase();
			//make sure that the email is not already taken
			User.findOne({email: email}, function(err, user){
				if(err) return next(err);
				if(!user){
					//make sure that the username is not already taken
					User.findOne({username: req.param('username')}, function(err, user){
						if(err) return next(err);
						if(!user){
							Groupp.findOne({handle: req.param("username")}, function(err, groupp){
								if(err) return next(err);
								if(!groupp){
									User.create(req.params.all(), function(err, user){
										if(err) return res.json({'err': err});
										user["password"] = "";
										nodemailer.sendConfirm(user.email, function(conf){
											if(conf.err) return res.json({status: false, reason: "Could not send confirmation email"});
											res.json({status: true, user: user});
										});
									});
								}else{return res.json({err: "Username taken by a group"})}
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
		//get current user
		get: function(req, res, next){
			if(req.session.auth){return res.json({'status': true, 'user': req.session.user});}
			else return res.json({"status": false});
		},
		getOne: function(req, res, next){
			if(req.param("user")){
				User.findOne({id: req.param('user')}, function(err, user){
					if(err) return next(err);
					if(!user) return console.log("Could not find user(getOne: "+req.param('user')+")");
					user['password']="";
					user['createdAt']="";
					user['updatedAt']="";
					res.json(user);
				});
			}else if(req.param("username")){
				if(req.param("username")!="show"){
					User.findOne({username: req.param('username')}, function(err, user){
						if(err) return next(err);
						if(!user) return console.log("Could not find user(getOne: "+req.param('username')+")");
						user['password']="";
						user['createdAt']="";
						user['updatedAt']="";
						res.json(user);
					});
				}else{
					return res.json(req.session.user);
				}
			}
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
			User.find({id: req.session.user.id}, {friends: true, friendRequests: true}, function(err, user){
				if(err) return next(err);
				res.json(user);
			});
		},
		addFriend: function(req, res, next){
			var obj1 = {
				$push: {
					friends: {
						id: req.session.user.id,
						username: req.session.user.username,
						name: req.session.user.name
					}
				}, 
				$pull: {
					requestsSent: req.session.user.id
				}
			};
			User.update({id: req.param("request"), requestsSent: {$in: [req.session.user.id]}}, obj1, function(err, user){
				if(err) return next(err);
				if(user){
					obj2 = {
						$push: {
							id: user.id,
							username: user.username,
							name: user.name
						},
						$pull: {
							friendRequests: req.param("request")
						}
					};
					User.update({id: req.session.user.id, friendRequests: {$in: [req.parm("request")]}}, obj2, function(err, user) {
						if(err) return next(err);
						return res.json({status: true});
					})
				}else{
					return res.json({err: "friend request not issued"});
				}
			});
		},
		rFriend: function(req, res, next){
			User.update({id: req.session.user.id}, {$pull: {friends: {id: req.param('user')}}}, function(err, user) {
				if(err) return next(err);
				User.update({id: req.param("user")}, {$pull: {friends: {id: req.session.user.id}}}, function(err, user) {
					if(err) return next(err);
					return res.json({status: true});
				});
			});
		},
		addFriendRequest: function(req, res, next){
			//we have the user id in req.param("friend")
			var obj = {
				id: req.session.user.id,
				username: req.session.user.username,
				name: req.session.user.name
			};
			console.log(req.param("friend"));
			console.log(obj);
			if(req.session.user){
				User.native(function(err, collection){
					collection.update({username: req.param("friend")}, {$push: {friendRequests: obj}}, function(err, user){
					if(err)	return next(err);
					console.log(user);
					collection.update({username: req.session.user.id}, {$push: {requestsSent: req.param("friend")}}, function(err, user) {
						if(err) return next(err);
						return res.json({status: true});
					});
				});	
				});
			}else{
				return res.json({err: "You are not logged in"});
			}
		},
		deleteRequest: function(req, res, next){
			if(req.session.user){
				User.native(function(err, coll){
					coll.update({username: req.session.user.username}, {$pull: {friendRequests: {$elemMatch: {id: req.param("request")}}}}, function(err, user) {
				    if(err) return next(err);
				    console.log(user);
				    coll.update({username: req.param("request")}, {$pull: {requestsSent: req.session.user.id}}, function(err, user) {
				        if(err) return next(err);
				        console.log("this");
				        return res.json({status: true});
				    });
				});
				});
			}else{
				return res.json({err: "you must be logged in"});
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
		resetRequest: function(req, res, next){
			//set the email to an accessable variable
			var email = req.param("email");
			//see of there is a reset by that email
			Resetpass.findOne({email: email}, function(err, rese){
				if(err) return next(err);
				//if there isn't continue to next part
				if(!rese){
					nodemailer.newReset(email, res);
				}else{
					//if there is see if a request has been made in the last 60 seconds
					var i = Math.floor(new Date().getTime() / 1000) - Math.floor(rese.createdAt.getTime() / 1000);
					if(i < 60){
						//if there has then stop and send an error
						return res.json({err: "You sent a request "+i+" seconds ago please wait at least one minute between requests"});
					}else{
						//if there hasn't destroy the last reset and clear for making a new one
						Resetpass.destroy({id: rese.id},function(err, resee){
							if(err) return next(err);
							nodemailer.newReset(email, res);
						});
					}
				}
			});
		},
		resetpass: function(req, res, next){
			var bcrypt = require("bcrypt");
			bcrypt.hash(req.param("pass"), 10, function(err, hash) {
				if(err) return next(err);
				User.update({email: req.param("email")}, {password: hash}, function(err, user){
					if(err) return next(err);
					var sock = sails.sockets.id(req.socket);
					sails.sockets.emit(sock, 'passreset', {status: true});
					Resetpass.destroy({email: req.param("email")}, function(err){
						if(err) return next(err);
					});
					return res.json({status: true});
				});
			});
		}
};