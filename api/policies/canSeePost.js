module.exports = function(req, res, next){
    Post.findOne({id: req.param("id")}, function(err, post){
			if(err)	 return next(err);
			if(!post) return res.json({err: "could not find post"});
			if(post.owner==req.session.user.id) return next();
			if(post.public){ return next();}else{
				Friend.findOne({user: req.session.user.id, owner: post.owner}, function(err, friend){
					if(err) return next(err);
					if(!friend) return res.json({err: "This post is private"});
					return next();
				});
				return;
			}
	});
	return;
};