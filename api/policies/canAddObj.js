module.exports =  function(req, res, next) {
	Post.findOne({id: req.param("post")}, function(err, post){
		if(err) return next(err);
		if(!post) return res.json({err: "Could not find post"});
		if(post.owner==req.session.user.id&&!post.closed){
			return next();
		}else{return res.json({err: "Cannot add to that post"});}
	});
}