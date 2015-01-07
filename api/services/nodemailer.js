module.exports = {
    sendMail: function(email, subject, content, cb){
         var nodemailer = require('nodemailer');
    
        var transporter = nodemailer.createTransport({
            service: 'Mailgun',
            auth: {
                user: 'postmaster@mg.orbweaverdev.com',
                pass: 'f8b0a4976d8434111c3684ab84c240d8'
            }
        });
        // NB! No need to recreate the transporter object. You can use
        // the same transporter object for all e-mails
        
        // setup e-mail data with unicode symbols
        var mailOptions = {
            from: '<postmaster@mg.orbweaverdev.com>', // sender address
            to: email, // list of receivers
            subject: subject, // Subject line
            html: content
        };
        
        // send mail with defined transport object
        transporter.sendMail(mailOptions, function(error, info){
            return cb(error, info);
        });   
    },
    newReset: function(email, res){
        //look to see if the email that it is trying to reset is in the database before continueing
		User.findOne({email: email}, function(err, user){
			if(err) return next(err);
		    if(!user) return res.json({err: "No user by that email"});
			//create a new reset from the email
			Resetpass.create({email: email}, function(err, rese){
				if(err) return next(err);
				//make the email text
				var text = "You requested a new password for your account, please go <a href='http://104.131.176.87:1337/pages/resetpass?auth="+rese.id+"&email="+email+"'>here</a>";
				//send the mail
				nodemailer.sendMail(email, "Password Reset", text, function(err, info){
					if(err) {
						console.log("error occured sending mail to "+email);
						return res.json({err: "An error occured"});
					}
					//if everything went well then return true
					return res.json({status: true});
				});
			});
		});
    },
    sendConfirm: function(email, cb){
        var string = require("randomstring").generate();
        var href = "http://104.131.176.87:1337/pages/confirm?email="+email+"&conf="+string;
        var text = "Thank you for registering with the app, please click <a href='"+href+"'>here</a> to confirm your email address";
        User.update({email: email}, {confirmationCode: string}, function(err, user){
            if(err) return next(err);
            nodemailer.sendMail(email, "Confirm Email", text, function(err, info){
                if(err) return cb({err: "error occured"});
                return cb({status: info});
            });
        });
    }
}