module.exports = function(req, res, next){
    if(req.session.user){
        User.findOne(req.session.user.id, function(err, user){
            if(err) return next(err);
            if(!user) return res.redirect("/");
            if(user.admin) return next();
            res.redirect("/");
        });
    }else{
        return res.redirect("/");
    }
}