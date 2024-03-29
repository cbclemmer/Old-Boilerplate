/**
 * GrouppController
 *
 * @description :: Server-side logic for managing groupps
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {
	create: function(req, res, next){
		Groupp.findOne({handle: req.param("handle")}, function(err, groupp){
			if(err) return next(err);
			if(!groupp){
				User.findOne({username: req.param("handle")}, function(err, user){
					if(err) return next(err);
					if(!user){
						Groupp.create({name: req.param("name"), handle: req.param("handle"), members: [req.session.user.id], admin: [req.session.user.username]}, function(err, groupp){
							if(err) return next(err);
							if(!groupp) return res.json({err: "Could not create groupp"});
							User.findOne({id: req.session.user.id}, function(err, user){
								if(err) return next(err);
								if(!user.groups) user.groups = [];
								if(!user.gAdmin) user.gAdmin = [];
								user.groups.push(groupp.handle);
								user.gAdmin.push(groupp.handle);
								if(!req.session.user.groups) req.session.user.groups = [];
								if(!req.session.user.gAdmin) req.session.user.gAdmin = [];
								req.session.user.groups.push(groupp.handle);
								req.session.user.gAdmin.push(groupp.handle);
								User.update({id: user.id}, user, function(err, user){
									if(err) return next(err);
									return res.json(groupp);
								});
							});
						});
					}else{return res.json({err: "Handle must be unique for groups and users"})}
				});
			}else{return res.json({err: "Handle already taken"})}
		});
	},
	get: function(req, res, next){
		if(req.param("id")){
			Groupp.findOne({id: req.param("id")}, function(err, groupp){
				if(err) return next(err);
				if(!groupp) return res.json({err: "Could not find group"});
				return res.json(groupp);
			});
		}else{
			Groupp.findOne({name: req.param("handle")}, function(err, groupp){
				if(err) return next(err);
				if(!groupp) return res.json({err: "Could not find group"});
				return res.json(groupp);
			});
		}
	},
	join: function(req, res, next){
		var id = req.session.user.id;
		//if it is already a member
		var c =false;
		Groupp.findOne({id: req.param("group")}, function(err, groupp){
			if(err) return next(err);
			if(!groupp) return res.json({err: "Group does not exist"});
			for(var i=0;i<groupp.members.length;i++){
				if(groupp.members[i]==id){
					c=true;
					break;
				}
			}
			if(!c){
				groupp.members.push(id);
				if(!req.session.user.groups) req.session.user.groups = [];
				//console.log(req.session.user);
				req.session.user.groups.push(groupp.handle);
				User.findOne({id: id}, function(err, user){
					if(err) return next(err);
					if(!user.groups) user.groups = [];
					user.groups.push(groupp.handle);
					Groupp.update({id: groupp.id}, groupp, function(err, groupp){
						if(err) return next(err);
						User.update({id: user.id}, user, function(err, user){
							if(err) return next(err);
							return res.json(groupp);
						});
					});
				});
			}
		})
	},
	leave: function(req, res, next){
		var c = false;
		Groupp.findOne({handle: req.param("g")}, function(err, groupp){
			if(err) return next(err);
			for(var i=0;i<groupp.members.length;i++){
				if(groupp.members[i]==req.session.user.id){
					groupp.members.splice(i,1);
				}
			}
			User.findOne({id: req.session.user.id}, function(err, user){
				for(var i=0;i<user.groups.length;i++){
					if(user.groups[i]==groupp.handle){
						req.session.user.groups.splice(i, 1);
						user.groups.splice(i, 1);
						c =true;
					};
				};
				if(c){
					Groupp.update({id: groupp.id}, groupp, function(err, groupp){
						if(err) return next(err);
						User.update({id: user.id}, user, function(err, user){
							if(err) return next(err);
							return res.json({status: true});
						});
					});
				};
			});
		});
	},
	//join by admin, for use with private and semiprivate groups
	jAdmin: function(req, res, next){
		var c = false;
		Groupp.findOne({handle: req.param("g")}, function(err, groupp){
			if(err) return next(err);
			if(!groupp) return res.json({err: "Could not find group"});
			//make sure this user is an admin
			for(var i=0;i<groupp.admin.length;i++){
				if(groupp.admin[i]==req.session.user.username){
					c = true;
					break;
				}
			}
			if(c){
				for(var i=0;i<groupp.requests.length;i++){
					//remove user from requests
					if(groupp.requests[i]==req.param("u")){
						groupp.requests.splice(i, 1);
						break;
					}
				}
				User.findOne({username: req.param("u")}, function(err, user){
					c = true;
					if(err) return next(err);
					if(!user) return res.json({err: "Could not find user @"+req.param("u")});
					//make sure that this user is not already a member
					for(var i=0;i<groupp.members.length;i++){
						if(groupp.members[i]==user.id){
							console.log(groupp.members);
							console.log(user.id);
							var c =false;
							break;
						}
					}
					if(c){
						groupp.members.push(user.id);
						if(!user.groups) user.groups =[];
						user.groups.push(groupp.handle);
						Groupp.update({id: groupp.id}, groupp, function(err, groupp){
							if(err) return next(err);
							User.update({id: user.id}, user, function(err, user){
								if(err) return next(err);
								res.json({status: true});
							});
						});
					}else{return res.json({err: "user is already a member"})}
				});
			}else{return res.json({err: "You do not have rights to add to this group"})}
		});
	},
	addAdmin: function(req, res, next){
		//prcede variable
		var p = false;
		Groupp.findOne({handle: req.param("g")}, function(err, group){
			if(err) return next(err);
			if(!group) return res.json({err: "could not find group"});
			for(var i=0;i<group.admin.length;i++){
				if(group.admin[i]==req.session.user.username){
					p = true;
				}
				if(group.admin[i]==req.param("u")){
					return res.json({err: "User already admin"});
				}
			}
			if(p){
				User.findOne({username: req.param("u")}, function(err, user){
					if(err) return next(err);
					if(!user) return res.json({err: "User not found"});
					group.admin.push(user.username);
					if(!user.gAdmin) user.gAdmin = [];
					user.gAdmin.push(group.handle);
					Groupp.update({id: group.id}, group, function(err, group){
						if(err) return next(err);
						User.update({id: user.id}, user, function(err, user){
							if(err) return next(err);
							return res.json(group);
						});
					});
				});
			}
		});
	},
	rAdmin: function(req, res, next){
		//the if it is a part of it
		var b = false;
		Groupp.findOne({handle: req.param("g")}, function(err, groupp){
			if(err) return next(err);
			if(!groupp) return res.json({err: "could not find group"});
			for(var i=0;i<groupp.admin.length;i++){
				if(groupp.admin[i]==req.param("u")){
					groupp.admin.splice(i, 1);
					b = true;
					break;
				}
			}
			if(b){
				Groupp.update({id: groupp.id}, groupp, function(err, groupp){
					if(err) return next(err);
					User.findOne({username: req.param("u")}, function(err, user){
						if(err) return next(err);
						if(!user) return res.json({err: "Username not found"});
						for(var i=0;i<user.gAdmin.length;i++){
							if(user.gAdmin[i]==groupp[0].handle){
								if(user.id==req.session.user.id) req.session.user.gAdmin.splice(i, 1);
								user.gAdmin.splice(i, 1);
								User.update({id: user.id}, user, function(err, user){
									if(err) return next(err);
									return res.json({status: true});
								});
								break;
							}
						}
					});
				});
			}else{
				return res.json({err: ("@"+req.param("u")+" is not an admin for group: "+req.param("g"))});
			}
		});
	},
	getAdmin: function(req, res, next){
		Groupp.findOne({handle: req.param("handle")}, function(err, group){
			if(err) return next(err);
			if(!group) return res.json("could not find group");
			return res.json(group.admin);
		});
	},
	cPrivacy: function(req, res, next){
		Groupp.findOne({handle: req.param("g")}, function(err, groupp){
			if(err) return next(err);
			if(!groupp) return res.json({err: "Not a group"});
			groupp.privacy = req.param("t");
			Groupp.update({id: groupp.id}, groupp, function(err, groupp){
				if(err) return next(err);
				res.json({status: true});
			});
		})
	},
	addRequest: function(req, res, next){
		//for continueing
		var c = true;
		Groupp.findOne({handle: req.param("g")}, function(err, groupp){
			if(err) return next(err);
			if(!groupp) return res.json({err: "could not find group"});
			if(groupp.privacy&&groupp.privacy=="semiprivate"){
				if(!groupp.requests) groupp.requests = [];
				for(var i = 0;i<groupp.requests.length;i++){
					if(groupp.requests[i]==req.session.user.username){
						c = false;
						break;
					}
				}
				if(c){
					groupp.requests.push(req.session.user.username);
					Groupp.update({id: groupp.id}, groupp, function(err, groupp){
						if(err) return next(err);
						res.json({status: true});
					});
				}else{return res.json({err: "already requested in"})}
			}else{res.json({err: "This group is not semiprivate"})}
		})
	},
	getRequest: function(req, res, next){
		var c = false;
		Groupp.findOne({handle: req.param("g")}, function(err, groupp){
			if(err) return next(err);
			if(!groupp) return res.json({err: "Could not find group"});
			if(groupp.requests){
				for(var i=0;i<groupp.requests.length;i++){
					if(groupp.requests[i]==req.session.user.username){
						c=true;
					}
				}
				if(c){return res.json({status: true});
				}else{return res.json({status: false})}
			}else{return res.json({status: false})}
		});
	},
	show: function(req, res, next){
		Groupp.findOne({handle: req.param("id")}, function(err, groupp){
			res.view('group', {group: groupp, cUser: req.session.user});
		});
	}
};
