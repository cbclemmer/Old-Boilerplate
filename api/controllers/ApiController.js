/**
 * ApiController
 *
 * @description :: Server-side logic for managing apis
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {
		// to get a single entity
		get: function(req, res, next){
			var handle = req.param("handle");
			if(handle=="show") handle = req.session.user.username;
			//gets everything for the page show
			var pag = {};
			//check if the target is a user
			User.findOne({username: handle}, function(err, user){
				if(err) return next(err);
				//if it is not
				if(!user){
					//check if group
					Groupp.findOne({handle: handle}, function(err, groupp){
						if(err) return next(err);
						//if the handle is not a group either, throw an error
						if(!groupp) return res.json({err: "Cannot find"});
						pag = groupp;
						User.find({id: {$in: groupp.members}}, function(err, users){
							if(err) return next(err);
							for(var i=0;i<users.length;i++){
								users[i] = cleanService.cleanUser(users[i]);
							}
							var user = req.session.user;
							for(var i=0;i<user.groups.length;i++){
								if(user.groups[i]==groupp.handle){
									pag.joined = true;
									break;
								}
							}
							for(var i=0;i<groupp.requests.length;i++){
								if(groupp.requests[i]==user.username){
									pag.request = true;
									break;
								}
							}
							pag.type="group";
							pag.mJSON = users;
							return res.json({user: req.session.user, pag: pag});
						});
					});
					return;
				}
				//rid of excess fields
				user = cleanService.cleanUser(user);
				pag = user;
				//find the friends of the user
				Friend.find({where: {owner: user.id}, limit: 100}, function(err, friends){
					if(err) return next(err);
					//if he has friends
					if(friends.length>0){
						//get the full JSON of the users
						var f = [];
						for(var i=0;i<friends.length;i++){
							f.push(friends[i].user);
						}
						User.find({id: {$in: f}}, function(err, users){
							if(err) return next(err);
							//clean the users
							var u = [];
							for(var i=0;i<users.length;i++){
								users[i] = cleanService.cleanUser(users[i]);
								u.push(users[i].id);
							}
							Friend.findOne({owner: req.session.user.id, user: pag.id}, function(err, friend){
								if(err) return next(err);
								if(friend){
									pag.friendsWith=true;
									pag.friends = users;
									pag.type = "user";
									return res.json({user: req.session.user, pag: pag});
								}else{
									user = req.session.user;
									if(user.friendRequests){
									for(var i=0;i<user.friendRequests.length;i++){
										if(user.friendRequests[i]==pag.id){
											pag.request = true;
											break;
										}
									}}
									if(user.requestsSent){
									for(var i=0;i<user.requestsSent.length;i++){
										if(user.requestsSent[i]==pag.id){
											pag.request = true;
											break;
										}
									}}
									pag.friendsWith=false;
									pag.friends = users;
									pag.type = "user";
									return res.json({user: req.session.user, pag: pag});
								};
							});
						});
						//return so you don't return the res twice... if that's possible?
						return;
					}
					//if he has no friends  :(
					pag.friends = [];
					pag.type = "user";
					return res.json({user: req.session.user, pag: pag});
				});
			});
		},
		search: function(req, res, next){
			//s is query
			var reg = new RegExp(req.param('s'), 'i');
			var q = User.find({where: {username: reg}, limit: 10, sort: {username: 1}});
			var q2 = Groupp.find({where: {handle: reg}, limit: 10, sort: {handle: 1}});
			q.exec(function(err, users){
				if(err) return next(err);
				var results = [];
				if(users){
					for(var i=0;i<users.length;i++){
						results.push({
							id: users[i].id,
							name: users[i].name,
							handle: users[i].username,
							type: "user"
						});
					}
				}
				q2.exec(function(err, groups){
					if(err) return next(err);
					if(groups){
						for(var i=0;i<groups.length;i++){
							results.push({
								id: groups[i].id,
								name: groups[i].name,
								handle: groups[i].handle,
								type: "group"
							});
						}
					}
					res.json(results);
				});
			});
		},
		show: function(req, res, next){
			//unsubscribe from all rooms
			console.log(req.isSocket);
			if(req.param("id")!=undefined){
				User.findOne({username: req.param("id")}, function(err, user){
					if(err) return next(err);
					if(!user){
						return Groupp.findOne({handle: req.param("id")}, function(err, groupp){
							if(err) return next(err);
							if(!groupp) return res.view("user/show", {user: req.session.user, cUser: req.session.user});
							return res.view('group');
						});
					}
					user["password"]= "";
					user["createdAt"]="";
					user["updatedAt"]="";
					res.view("user/show");
				});
			}else{
				res.view("user/show");
			}
		}
};