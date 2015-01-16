/**
 * MessageController
 *
 * @description :: Server-side logic for managing messages
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {
	get: function(req, res, next){
		var start = 0;
		if(req.param("start")) start  = parseInt(req.param("start"));
		var q = Conversation.find({where: {users: {$elemMatch: req.session.user.id}, limit: 10, skip: start}});
		q.exec(function(err, convs){
			if(err) return next(err);
			if(!convs) return res.json({err: "Could not find any conversations"});
			return res.json(convs);
		});
	}, 
	getOne: function(req, res, next){
		var q = Conversation.findOne({where: {users: {$all: [req.session.user.id, req.param("user")]}}});
		q.exec(function(err, conv){
			if(err) return next(err);
			if(!conv) return res.json({err: "Could not find the conversation"});
			return res.json(conv);
		});
	},
	getMessages: function(req, res, next){
		var start = 0;
		if(req.param("start")) start  = parseInt(req.param("start"));
		var q = Messages.find({where: {conversation: req.param("conv")}, limit: 30, skip: start, sort: {createdAt: 1}});
		q.exec(function(err, messages){
			if(err) return next(err);
			if(!messages) return res.json({err: "Could not find the messages"});
			return res.json(messages);
		});
	},
	//this checks to see if a conversation is already started, if it is, it returns the ID
	conv: function(req, res, next){
		Conversation.findOne({users: {$in: [req.param("id")]}}, function(err, conv){
			if(err) return next(err);
			if(!conv){
				var arr = [req.param("id"), req.session.user.id];
				Conversation.create({users: arr}, function(err, conv){
					if(err) return next(err);
					return res.json(conv);
				});
			}else{
				return res.json(conv);
			}
		});
	}
};