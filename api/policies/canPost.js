module.exports = function(req, res, next) {
	if(req.param("target")==""){
		return next();
	}else{
		Friend.findOne({user: req.param("target"), owner: req.session.user.id}, function(err, friend){
			if(err) return res.json({err: "error occured"});
			if(!friend){
				User.findOne({id: req.param("target")}, function(err, user){
					if(err) return res.json({err: "error occured"});
					if(!user) return res.json({err: "User not found"});
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