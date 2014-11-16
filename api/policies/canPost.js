module.exports = function(req, res, next) {
	if(req.param("target")==""||req.param("target")==req.session.user.id){
		return next();
	}else{
		Friend.findOne({user: req.param("target"), owner: req.session.user.id}, function(err, friend){
			if(err) return res.json({err: "error occured"});
			if(!friend){
				User.findOne({id: req.param("target")}, function(err, user){
					if(err) return res.json({err: "error occured"});
					if(!user) {
						Groupp.findOne({id:  req.param("target")}, function(err, groupp){
							if(err) return res.json({err: "error occured"});
							if(!groupp) return res.json({err: "User/Group not found"});
							for(var i=0;i<groupp.members.length;i++){
								if(groupp.members[i]==req.session.user.id){
									return next();
								}
								if(i==(groupp.members-1))return res.json({err: "You must be member of this group to post"});
							}
						});
						return;
					}
					if(user.randomPost){
						return next()
					}else{
						return res.json({err: "Can only post to this user if you are friends"});
					}
				});
			}else{
				return next();
			}
		});
	}
}