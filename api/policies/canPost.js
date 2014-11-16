module.exports = function(req, res, next) {
	console.log("canPost");
	if(req.param("target")==""||req.param("target")==req.session.user.id){
		console.log("3");
		return next();
	}else{
		console.log("1");
		Friend.findOne({user: req.param("target"), owner: req.session.user.id}, function(err, friend){
			if(err) return res.json({err: "error occured"});
			if(!friend){
				User.findOne({id: req.param("target")}, function(err, user){
					if(err) return res.json({err: "error occured"});
					if(!user) {
						console.log("1");
						Groupp.findOne({id:  req.param("target")}, function(err, groupp){
							console.log("2");
							if(err) return res.json({err: "error occured"});
							if(!groupp) return res.json({err: "User/Group not found"});
							for(var i=0;i<groupp.members.length;i++){
								if(groupp.members[i]==req.session.user.id){
									console.log("3");
									return next();
								}
								if(i==(groupp.members-1))return res.json({err: "You must be member of this group to post"});
							}
						});
						return;
					}
					if(user.randomPost){
						console.log("user");
						return next()
					}else{
						return res.json({err: "Can only post to this user if you are friends"});
					}
				});
			}else{
				console.log("2");
				return next();
			}
		});
	}
}