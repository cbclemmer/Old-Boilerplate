module.exports = function(req, res, next){
    var email = req.param("email");
	var code = req.param("auth");
	Resetpass.findOne({email: email, id: code}, function(err, rese){
		if(err)	 return next(err);
		if(!rese) return res.redirect("/");
		var i = Math.floor((Math.floor(new Date().getTime() / 1000) - Math.floor(rese.createdAt.getTime() / 1000)) / 60);
		if(i < 1440){
			return next();
		}else{
			return res.redirect("/");
		}
	});
}