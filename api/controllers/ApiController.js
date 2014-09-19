/**
 * ApiController
 *
 * @description :: Server-side logic for managing apis
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {
		// to get a single entity
		get: function(req, res, next){
			var q;
			if(req.param('model'=='user') )
				q=User.findOne(req.param('id'));
			q.exec(function(err, obj){
				if(err) return res.json({'err': err});
				return res.json(obj);
			});			
		},
};

