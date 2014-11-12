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
				Groupp.create({name: req.param("name"), handle: req.param("handle"), members: [req.session.user.id]}, function(err, groupp){
					if(err) return next(err);
					if(!groupp) return res.json({err: "Could not create groupp"});
					User.findOne({id: req.session.user.id}, function(err, user){
						if(err) return next(err);
						if(!user.groups) user.groups = [];
						user.groups.push(groupp.id);
						req.session.user.groups.push(groupp.id);
						User.update({id: user.id}, user, function(err, user){
							if(err) return next(err);
							return res.json(groupp);
						})
					});
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
	addMember: function(req, res, next){

	},
	join: function(req, res, next){
		var id = req.session.user.id;
		//if it is already a member
		var c =false;
		Groupp.findOne({id: req.param("group")}, function(err, groupp){
			if(err) return next(err);
			if(!group) return res.json({err: "Group does not exist"});
			for(var i=0;i<groupp.members.length;i++){
				if(groupp.members[i]==id){
					c=true;
					break;
				}
			}
			if(!c){
				groupp.members.push(id);
				req.session.user.groups.push(groupp.id);
				User.findOne({id: id}, function(err, user){
					if(err) return next(err);
					user.groups.push(groupp);
					Groupp.update({id: groupp.id}, groupp, function(err, groupp){
						if(err) return next(err);
						return res.json(groupp);
					});
				});
			}
		})
	},
	show: function(req, res, next){
		Groupp.findOne({handle: req.param("id")}, function(err, groupp){
			res.view('group', {group: groupp, cUser: req.session.user});
		});
	}
};