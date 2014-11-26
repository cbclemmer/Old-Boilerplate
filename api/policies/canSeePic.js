module.exports = function(req, res, next){
	Pic.findOne({source: req.param("id")}, function(err, pic){
		if(err) return next(err);
		//check if public
		if(!pic) {
			console.log("picture not found: "+req.param("id"));
			var fs = require('fs');
			var stream = fs.createReadStream(__dirname+"/404.png");
			return stream.pipe(res);
		}
		//check if the pic is public
		if(!pic.public){
			if(!req.session.user.id){
				var fs = require('fs');
				var stream = fs.createReadStream(__dirname+"/censor.jpg");
				return stream.pipe(res);
			}else{
				//check if it is the current user's pic
				if(pic.owner!=req.session.user.id){
					//check if friend of user
					Friend.findOne({user: req.session.user.id, owner: pic.owner}, function(err, friend){
						if(err) return next(err);
						if(!friend){
							var fs = require('fs');
							var stream = fs.createReadStream(__dirname+"/censor.jpg");
							return stream.pipe(res);
						}else{
							//it is the user's friend
							return next();
						}
					});
				}else{
					//it is the current user's pic
					return next();
				}
			}
		}else{
			//the pic is public
			return next();
		}
	});
}