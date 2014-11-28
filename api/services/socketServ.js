module.exports = {
	nPost: function(sock, post){
		sails.sockets.broadcast(post.target, 'nPost', post);
	},
	dPost: function(sock, post){
		sails.sockets.broadcast(post.target, 'dPost', post);
	}
}