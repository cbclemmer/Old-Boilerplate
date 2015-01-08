module.exports = function(req, res, next){
    User.findOne(req.session.user.id, function(err, user){
        if(err)  return next(err);
        if(!user) return;
        if(user.admin || user.id == req.param("id")){
           return next();
        }else{
            return res.redirect("/");
        }
    });
}