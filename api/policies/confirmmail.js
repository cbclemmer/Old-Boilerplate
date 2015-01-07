module.exports = function(req, res, next){
    var email = req.param("email");
    var confirm = req.param("conf") || false;
    User.findOne({email: email, confirmationCode: confirm}, function(err, user){
        if(err) return next(err);
        if(!user) return res.redirect("/");
        User.update({id: user.id}, {confirmed: true}, function(err, user){
            if(err) return next(err);
            return next();
        });
    });
}