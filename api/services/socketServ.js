module.exports = {
	post: function(sock, post){
		console.log("telling the sockets");
		sails.sockets.broadcast(post.target, 'nPost', post);
	},
}