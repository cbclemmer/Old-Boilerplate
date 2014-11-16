module.exports = function(req, res, next){
	if(req.param("user")==req.session.user.id){
		return res.redirect("/post/privateFeed?start"+req.param("start")+"&user="+req.param("user"));
	}else{
		Friend.findOne({user: req.param("user"), owner: req.session.user.id}, function(err, friend){
			if(err) return res.json({err: "error occured"});
			if(!friend){
				Groupp.findOne({id: req.param("user")}, function(err, groupp){
					if(err) return res.json({err: "error occured"});
					if(!groupp) return res.redirect("/post/publicFeed?start"+req.param("start")+"&user="+req.param("user"));
					for(var i=0;i<groupp.members.length;i++){
						if(groupp.members[i]==req.session.user.id){
							return res.redirect("/post/privateFeed?start"+req.param("start")+"&user="+req.param("user"));
						}
					}
				});
			}else{
				return res.redirect("/post/privateFeed?start"+req.param("start")+"&user="+req.param("user"));
			}
		});
	}
}