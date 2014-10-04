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
			if(req.param('model')=='user'){
				q=User.findOne(req.param('id'));
				q.exec(function(err, obj){
					if(err) return res.json({'err': err});
					return res.json(obj);
				});
			}			
		},
		search: function(req, res, next){
			//s is query
			var reg = new RegExp(req.param('s'), 'i');
			var q = User.find({where: {name: reg}, limit: 10, sort: {name: 1}});
			q.exec(function(err, users){
				if(err) return res.json({'err': err});
				res.json(users);
			});
		}
};

