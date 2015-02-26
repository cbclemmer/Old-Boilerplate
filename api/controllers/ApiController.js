/**
 * ApiController
 *
 * @description :: Server-side logic for managing apis
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {
		// to get a single entity
		get: function(req, res, next){
			//remove the user from all rooms
			var rooms = sails.sockets.socketRooms(req.socket);
			if(rooms.lenght>0){
				for(var i=0;i<rooms.length;i++){
					sails.sockets.leave(req.socket, rooms[i]);
				}
			}
			var handle = req.param("handle");
			if(handle=="show") handle = req.session.user.username;
			//gets everything for the page show
			var pag = {};
			//check if the target is a user
			var obj = {
				name: true, username: true
			};
			User.find({username: handle}, obj, function(err, user){
				if(err) return next(err);
				//if it is not
				if(!user[0]){
					//check if group
					Groupp.findOne({handle: handle}, function(err, groupp){
						if(err) return next(err);
						//if the handle is not a group either, throw an error
						if(!groupp) return res.json({err: "Cannot find"});
						pag = groupp;
						//get the members of the group
						User.find({id: {$in: groupp.members}}, function(err, users){
							if(err) return next(err);
							for(var i=0;i<users.length;i++){
								users[i] = cleanService.cleanUser(users[i]);
							}
							var user = req.session.user;
							if(!user.groups) user.groups = [];
							for(var i=0;i<user.groups.length;i++){
								if(user.groups[i]==groupp.handle){
									pag.joined = true;
									break;
								}
							}
							if(!groupp.requests) groupp.requests = [];
							for(var i=0;i<groupp.requests.length;i++){
								if(groupp.requests[i]==user.username){
									pag.request = true;
									break;
								}
							}
							pag.type="group";
							pag.mJSON = users;
							if(pag.joined){
								//listen for private posts
								sails.sockets.join(sails.sockets.id(req.socket), "post"+pag.id+"private");
							}else{
								sails.sockets.join(sails.sockets.id(req.socket), "post"+pag.id);
							}
							return res.json({user: req.session.user, pag: pag});
						});
					});
					return;
				}
				//rid of excess fields
				pag = user[0];
				User.find({id: req.session.user.id, "friends.username": handle}, {name: true}, function(err, user){
					if(err)	return next(err);
					if(user[0]){
						pag.friendsWith = true;
						sails.sockets.join(req.socket, "post"+pag.id+"private");
					}else{
						pag.friendsWith = false;
						sails.sockets.join(req.socket, "post"+pag.id);
					}
					User.find({username: handle, "friendRequests.id": req.session.user.id}, {name: true}, function(err, user) {
					    if(err) return next(err);
					    if(user[0]){
					    	pag.request = true;
					    }else{
					    	pag.request = false;
					    }
						pag.type="user";
						return res.json({user: req.session.user, pag: pag});
					});
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
		asearch: function(req, res, next){
			//s is query
			var reg = new RegExp(req.param('s'), 'i');
			var crit = req.param('crit');
			var obj = {};
			obj[crit] = reg;
			var q = User.find({where: obj, limit: 10});
			if(crit=='username') crit = 'handle';
			obj[crit] = reg;
			var q2 = Groupp.find({where: obj, limit: 10});
			q.exec(function(err, users){
				if(err) return next(err);
				var results = [];
				if(users){
					for(var i=0;i<users.length;i++){
						users[i].password = "";
						results.push(users[i]);
					}
				}
				if(crit!='email'){
					q2.exec(function(err, groups){
						if(err) return next(err);
						if(groups){
							for(var i=0;i<groups.length;i++){
								results.push(groups[i]);
							}
						}
						res.json(results);
					});
				}else{return res.json(results);}
			});
		},
		mSearch: function(req, res, next){
			if(req.param("s")=="") return res.json({results: []});
			var results = [];
			var reg = new RegExp(req.param('s'), 'i');
			User.find({where: {username: reg}, limit: 20}, function(err, users){
				if(err)	return next(err);
				for(var i=0;i<users.length;i++){
					results.push(users[i]);
				}
				User.find({where: {name: reg}, limit: 20}, function(err, users){
					if(err)	return next(err);
					for(var i=0;i<users.length;i++){
						results.push(users[i]);
					}
					
					for(var i=0;i<results.length;i++){
						cleanService.cleanUser(results[i]);
					}
					return res.json({results: results});
				});
			});
		},
		show: function(req, res, next){
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
		},
		sLoad: function(req, res, next){
			/*Appp.findOne({id: req.param("app")}, function(err, app){
				if(err) return next(err);
				if(!app) return next("App does not exist");
				*/
				console.log("loading for "+req.ip);
				var 	scripts = [
				 	'104.131.176.87:8080/js/dependencies/sails.io.js',
					'104.131.176.87:8080/js/dependencies/jquery.js',
					'104.131.176.87:8080/js/dependencies/angular.js',
					'104.131.176.87:8080/js/dependencies/angular.uirouter.js',
  					'104.131.176.87:8080/js/dependencies/ngSanitize.js',
  					'104.131.176.87:8080/js/dependencies/angular-file-upload-shim.js',
  					'104.131.176.87:8080/js/dependencies/angular-file-upload.js',
  					'104.131.176.87:8080/js/dependencies/upload.js',
  					'104.131.176.87:8080/js/dependencies/angular-sails.min.js',
  					'104.131.176.87:8080/js/dependencies/markdown.js',
					'104.131.176.87:8080/js/dependencies/app.jquery.js',
	 				'104.131.176.87:8080/js/dependencies/app.socket.js',
					'104.131.176.87:8080/js/dependencies/app.angular.js',
  					'104.131.176.87:8080/js/dependencies/app.angular.post.js',
  					'104.131.176.87:8080/js/dependencies/app.angular.search.js',
  					'104.131.176.87:8080/js/dependencies/app.angular.settings.js',
  					'104.131.176.87:8080/js/dependencies/app.angular.group.js',
  					'104.131.176.87:8080/js/dependencies/app.angular.user.js',
					'104.131.176.87:8080/js/dependencies/app.angular.directives.js',
					'104.131.176.87:8080/js/dependencies/bootstrap.min.js',	
				]
				return res.json({s: scripts});
			//});
		}
};