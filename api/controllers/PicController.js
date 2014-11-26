/**
 * PicController
 *
 * @description :: Server-side logic for managing pics
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {
	upload: function(req, res, next){
		req.file("file").upload({dirname: "../../pics/md"}, function(err, file){
			if(err) return next(err);
			var c = file[0].fd.split("/");
			Pic.create({name: req.param("name"), source: c[c.length-1], owner: req.session.user.id}, function(err, pic){
				if(err) return next(err);
				return res.json(c[c.length-1]);
			});
		});
	},
	getOne: function(req, res, next){
		var fs = require('fs');
		var stream = fs.createReadStream(__dirname+"/../../pics/md/"+req.param("id"));
		stream.pipe(res);
	}
};