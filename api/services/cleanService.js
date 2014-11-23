module.exports = {
	cleanUser: function(user){
		user.password = "";
		user.createdAt = "";
		user.updatedAt = "";
		user.admin = "";
		user.dPublic  = false;
		user.randomPost = false;
		user.gAdmin = [];
		user.friendRequests = [];
		user.requstsSent = [];
		return user;
	}
}