/**
 * SettController
 *
 * @description :: Server-side logic for managing setts
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {
	//changes whether you can post to a persons wall without being friends
	crPost: function(req, res, next){
		User.findOne({id: req.session.user.id}, function(err, user){
			if(err) return next(err);
			if(!user) return res.json("could not find user");
			if(!user.randomPost) user.randomPost = false;
			//s is the setting
			var s = (req.param("s")=="true") ? true : false;
			req.session.user.randomPost = s;
			user.randomPost = s;
			User.update({id: user.id}, user, function(err, user){
				if(err) return next(err);
				return res.json({rp: s});
			})
		})
	}
};

