module.exports = {
	nPost: function(sock, post){
		if(post.public){
			sails.sockets.broadcast("post"+post.target, 'nPost', post);
			sails.sockets.broadcast("post"+post.target+"private", 'nPost', post);
		}else{
			sails.sockets.broadcast("post"+post.target+"private", 'nPost', post);
		}

	},
	dPost: function(sock, post){
		sails.sockets.broadcast("post"+post.target, 'dPost', post);
	},
	addFr: function(ask, send, sock){
		console.log("aFr");
		sails.sockets.emit(sock, 'aFr', {ask: ask, send: send});
	}
}