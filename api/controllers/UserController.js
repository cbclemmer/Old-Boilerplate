/**
 * UserController
 *
 * @description :: Server-side logic for managing users
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {
		//all asynchronous, no page loads ftw
		create: function(req, res, next){
			User.create(req.params.all(), function(err, user){
				if(err) return res.json({'err': err});
				res.json(user);
			});	
		},
		//get current user
		get: function(req, res, next){
			console.log("get");
			if(req.session.auth) return res.json({'status': true, 'user': req.session.user});
			else return res.json({"status": false});
		},
		edit: function(req, res, next){
			User.edit(req.params.all(), function(err, user){
				if(err) return res.json({'err': err});
				return res.json(user);
			});
		},
		destroy: function(req, res, next){
			User.destroy(req.param('id'), function(err, user){
				if(err) return res.json({'err': err, 'status': false});
				res.json({'status': true});
			});
		},
};

