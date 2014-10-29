/**
 * PagesController
 *
 * @description :: Server-side logic for managing pages
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {
	user: function(req, res, next){
		console.log("showing user");
		//make sure user is logged in
		if(req.session.auth){
			// what part to render
			var p = req.param('p');
			//nomal view
			if(p=="0")
				return res.view("user/show");
			//friends
			else if(p=="1")
				return res.view("user/friends");
		}else{
			return res.view('/');
		}
	},
	feed: function(req, res, next){
		return res.view("feed")
	},
	settings: function(req, res, next){
		return res.view("settings");
	},
	messages: function(req, res, next){
		return res.view("messages");
	}
};

