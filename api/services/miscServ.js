module.exports = {
	slug: function(n, un){
		n = n.replace(/^\s+|\s+$/g, ''); // trim
		n = n.toLowerCase();
		// remove accents, swap ñ for n, etc
		var from = "àáäâèéëêìíïîòóöôùúüûñç·/_,:;";
		var to   = "aaaaeeeeiiiioooouuuunc------";
		for (var i=0, l=from.length ; i<l ; i++) {
   			n = n.replace(new RegExp(from.charAt(i), 'g'), to.charAt(i));
		}
  		n = n.replace(/[^a-z0-9 -]/g, '') // remove invalid chars
    	.replace(/\s+/g, '-') // collapse whitespace and replace by -
    	.replace(/-+/g, '-'); // collapse dashes
    	n = un+"-"+n;
    	return n;
	},
	upload: function(file, dir, cb){
		/*
			The current directories are:
				prof: profile pics
				md: for markdown posts
		*/
		file.upload({dirname: ("./pics/"+dir)}, function(err, file){
			if(err) return next(err);
			return cb(true);
		});
	},
	cAction: function(owner, type, text, public, cb){
		Action.create({owner:owner, type: type, text: text, public: public}, function(err, act){
			if(err) return next(err);
			return cb(act);
		});
	},
	unFromID: function(id){
		User.findOne({id: id}, function(err, user){
			if(err) return next(err);
			if(!user) return {err: "could not find user"};
			return {un: user.username};
		})
	}
}