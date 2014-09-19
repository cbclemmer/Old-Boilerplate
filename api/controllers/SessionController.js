/**
 * SessionController
 *
 * @description :: Server-side logic for managing sessions
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {
	create: function(req, res, next){
		console.log("logging in...");
		var bcrypt = require('bcrypt');
		User.findOne({email: req.param('email')}, function(err, user){
			if(err) return res.json({'err': err});
			if(!user) return res.json({'login': false, 'reason': 'No user by that email'});
			bcrypt.compare(req.param('password'), user.password, function(err, obj){
				if(err) return res.json({'err': err});
				if(obj){
					user.online = true;
					User.update(user._id, user, function(err, use){
						if(err) return res.json({'err': err});
						req.session.auth = true;
						user['password'] = "";
						req.session.user = user;
						return res.json({auth: true, user: user});
					});
				}else return res.json({'login':false, 'reason': 'Password is wrong'});
			});
		});
	},
	destroy: function(req, res, next){
		console.log("logging out...");
		var id = req.session.user.id;
		User.findOne(id, function(err, user){
			if(err) return next(err);
			user.online=false;
			User.update(id, user, function(err, use){
				if(err) return next(err);
				req.session.destroy();
				return res.json({status: true});
			});
		});
	},
};

