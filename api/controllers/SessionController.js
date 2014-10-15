/**
 * SessionController
 *
 * @description :: Server-side logic for managing sessions
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {
	create: function(req, res, next){
		var bcrypt = require('bcrypt');
		User.findOne({email: req.param('email')}, function(err, user){
			if(err) return res.json({'err': err});
			if(!user) return res.json({'login': false, 'reason': 'No user by that email'});
			bcrypt.compare(req.param('password'), user.password, function(err, obj){
				if(err) return res.json({'err': err});
				if(obj){
					//log in
					user.online = true;
					console.log(user.id);
					User.update(user.id, user, function(err, use){
						if(err) return res.json({'err': err});
						req.session.auth = true;
						user['password'] = "";
						req.session.user = user;
						console.log("logging in");
						return res.json({auth: true, user: user});
					});
				}else return res.json({'login':false, 'reason': 'Password is wrong'});
			});
		});
	},
	destroy: function(req, res, next){
		var id = req.session.user.id;
		User.findOne(id, function(err, user){
			if(err) return next(err);
			user.online=false;
			User.update(id, user, function(err, use){
				if(err) return next(err);
				req.session.user = {};
				req.session.auth = false;
				return res.json({status: true});
			});
		});
	},
};

