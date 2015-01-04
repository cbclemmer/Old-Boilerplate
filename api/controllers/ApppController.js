/**
 * ApppController
 *
 * @description :: Server-side logic for managing appps
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {
	create: function(req, res, next){
	    Appp.create(req.params.all(), function(err, app){
	       if(err)  return next(err);
	       return res.json(app);
	    });
	}
};

