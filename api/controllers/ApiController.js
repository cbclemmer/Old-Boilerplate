/**
 * ApiController
 *
 * @description :: Server-side logic for managing apis
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {
		// to get a single entity
		get: function(req, res, next){
			var q;
			if(req.param('model')=='user'){
				q=User.findOne(req.param('id'));
				q.exec(function(err, obj){
					if(err) return res.json({'err': err});
					return res.json(obj);
				});
			}			
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
			if(req.param("id")!=undefined){
				User.findOne({username: req.param("id")}, function(err, user){
					if(err) return next(err);
					if(!user){
						return Groupp.findOne({handle: req.param("id")}, function(err, groupp){
							if(err) return next(err);
							if(!groupp) return res.view("user/show", {user: req.session.user, cUser: req.session.user});
							return res.view('group', {group: groupp, cUser: req.session.user});
						});
					}
					user["password"]= "";
					user["createdAt"]="";
					user["updatedAt"]="";
					res.view("user/show", {user: user, cUser: req.session.user});
				});
			}else{
				res.view("user/show", {user: req.session.user, cUser: req.session.user});
			}
		}
};

