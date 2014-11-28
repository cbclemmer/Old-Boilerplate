/**
 * ActionController
 *
 * @description :: Server-side logic for managing actions
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {
	create: function(req, res, next){
		Action.create(req.params.all(), function(err, act){
			if(err) return next(err);
			return res.json(act);
		});
	}	
};